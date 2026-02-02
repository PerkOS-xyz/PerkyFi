import { NextRequest, NextResponse } from 'next/server'
import { verifyOwnerAuth } from '@/lib/auth'
import { getCredentials, saveCredentials, getMaskedCredentials, isOwner, type Credentials } from '@/lib/config-storage'

// GET /api/admin/config - Get masked credentials (owner only)
export async function GET(request: NextRequest) {
  try {
    const address = request.headers.get('x-wallet-address')
    const signature = request.headers.get('x-wallet-signature') as `0x${string}` | null
    const message = request.headers.get('x-auth-message')

    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing authentication headers' },
        { status: 401 }
      )
    }

    const auth = await verifyOwnerAuth(address, message, signature)
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.error === 'No owner configured' ? 404 : 403 }
      )
    }

    // Return masked credentials
    const masked = getMaskedCredentials()
    return NextResponse.json({ credentials: masked })
  } catch (error) {
    console.error('Error getting config:', error)
    return NextResponse.json(
      { error: 'Failed to get config' },
      { status: 500 }
    )
  }
}

// POST /api/admin/config - Save credentials (owner only)
export async function POST(request: NextRequest) {
  try {
    const address = request.headers.get('x-wallet-address')
    const signature = request.headers.get('x-wallet-signature') as `0x${string}` | null
    const message = request.headers.get('x-auth-message')

    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing authentication headers' },
        { status: 401 }
      )
    }

    const auth = await verifyOwnerAuth(address, message, signature)
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.error === 'No owner configured' ? 404 : 403 }
      )
    }

    const body = await request.json()
    const { credentials } = body as { credentials: Partial<Credentials> }

    if (!credentials || typeof credentials !== 'object') {
      return NextResponse.json(
        { error: 'Invalid credentials payload' },
        { status: 400 }
      )
    }

    // Get existing credentials and merge
    const existing = getCredentials()
    const merged: Credentials = { ...existing }

    // Only update fields that are explicitly provided (not empty strings for sensitive fields)
    for (const [key, value] of Object.entries(credentials)) {
      // Skip masked values (they contain •)
      if (typeof value === 'string' && value.includes('•')) {
        continue
      }
      // For private key, only update if it's not the masked placeholder
      if (key === 'walletPrivateKey' && (value === '' || value === '••••••••••••••••')) {
        continue
      }
      merged[key as keyof Credentials] = value as never
    }

    saveCredentials(merged)
    
    return NextResponse.json({
      success: true,
      credentials: getMaskedCredentials(),
    })
  } catch (error) {
    console.error('Error saving config:', error)
    return NextResponse.json(
      { error: 'Failed to save config' },
      { status: 500 }
    )
  }
}
