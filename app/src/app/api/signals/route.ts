import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Signal type based on README schema
interface Signal {
  id: string
  timestamp: string
  source: string
  market_analysis: {
    market: string
    current_odds: number
    sentiment: string
  }
  recommendation: {
    action: string
    vault: string
    vault_address: string
    current_apy: number
    chain: string
  }
  confidence: number
  post_template: string
  posted: boolean
  post_url?: string
  url?: string  // Signal URL for sharing
}

// Storage file path (JSON file for MVP)
const SIGNALS_FILE = path.join(process.cwd(), 'data', 'signals.json')

// Validate agent API key
function validateAgentKey(request: NextRequest): boolean {
  const agentKey = request.headers.get('X-Agent-Key')
  const expectedKey = process.env.AGENT_API_KEY
  
  if (!expectedKey) {
    console.warn('AGENT_API_KEY not configured')
    return false
  }
  
  return agentKey === expectedKey
}

// Ensure data directory and file exist
async function ensureStorage(): Promise<Signal[]> {
  try {
    const dir = path.dirname(SIGNALS_FILE)
    await fs.mkdir(dir, { recursive: true })
    
    try {
      const data = await fs.readFile(SIGNALS_FILE, 'utf-8')
      return JSON.parse(data)
    } catch {
      // File doesn't exist, create empty array
      await fs.writeFile(SIGNALS_FILE, '[]')
      return []
    }
  } catch (error) {
    console.error('Storage error:', error)
    return []
  }
}

async function saveSignals(signals: Signal[]): Promise<void> {
  const dir = path.dirname(SIGNALS_FILE)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(SIGNALS_FILE, JSON.stringify(signals, null, 2))
}

// GET /api/signals - List all signals (public)
export async function GET(request: NextRequest) {
  try {
    const signals = await ensureStorage()
    
    // Optional query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Sort by timestamp descending (newest first)
    const sorted = signals.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    const paginated = sorted.slice(offset, offset + limit)
    
    return NextResponse.json({
      success: true,
      data: paginated,
      total: signals.length,
      limit,
      offset
    })
  } catch (error) {
    console.error('GET /api/signals error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch signals' },
      { status: 500 }
    )
  }
}

// POST /api/signals - Create new signal (agent only, requires API key)
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateAgentKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - invalid or missing X-Agent-Key' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validate required fields
    const required = ['source', 'market_analysis', 'recommendation', 'confidence', 'post_template']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Validate confidence threshold
    if (body.confidence < 75) {
      return NextResponse.json(
        { success: false, error: 'Confidence must be >= 75% to create signal' },
        { status: 400 }
      )
    }
    
    const signals = await ensureStorage()
    
    // Generate signal ID
    const signalId = `signal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    
    // Build signal URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://perkyfi.xyz'
    const signalUrl = `${baseUrl}/trade/${signalId}`
    
    const newSignal: Signal = {
      id: signalId,
      timestamp: new Date().toISOString(),
      source: body.source,
      market_analysis: body.market_analysis,
      recommendation: body.recommendation,
      confidence: body.confidence,
      post_template: body.post_template,
      posted: body.posted || false,
      post_url: body.post_url,
      url: signalUrl
    }
    
    signals.push(newSignal)
    await saveSignals(signals)
    
    // Return signal with URL for Twitter posting
    return NextResponse.json({
      success: true,
      data: newSignal,
      signalId: signalId,
      url: signalUrl
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/signals error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create signal' },
      { status: 500 }
    )
  }
}
