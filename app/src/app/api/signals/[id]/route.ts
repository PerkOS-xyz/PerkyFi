import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

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
}

const SIGNALS_FILE = path.join(process.cwd(), 'data', 'signals.json')

async function loadSignals(): Promise<Signal[]> {
  try {
    const data = await fs.readFile(SIGNALS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveSignals(signals: Signal[]): Promise<void> {
  const dir = path.dirname(SIGNALS_FILE)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(SIGNALS_FILE, JSON.stringify(signals, null, 2))
}

// GET /api/signals/[id] - Get specific signal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const signals = await loadSignals()
    const signal = signals.find(s => s.id === id)
    
    if (!signal) {
      return NextResponse.json(
        { success: false, error: 'Signal not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: signal
    })
  } catch (error) {
    console.error('GET /api/signals/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch signal' },
      { status: 500 }
    )
  }
}

// PATCH /api/signals/[id] - Update signal (e.g., mark as posted)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const signals = await loadSignals()
    const index = signals.findIndex(s => s.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Signal not found' },
        { status: 404 }
      )
    }
    
    // Only allow updating specific fields
    if (body.posted !== undefined) {
      signals[index].posted = body.posted
    }
    if (body.post_url !== undefined) {
      signals[index].post_url = body.post_url
    }
    
    await saveSignals(signals)
    
    return NextResponse.json({
      success: true,
      data: signals[index]
    })
  } catch (error) {
    console.error('PATCH /api/signals/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update signal' },
      { status: 500 }
    )
  }
}
