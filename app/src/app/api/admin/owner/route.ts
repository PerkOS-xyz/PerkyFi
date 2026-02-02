import { NextRequest, NextResponse } from 'next/server'
import { getOwner, setOwner } from '@/lib/config-storage'

// GET /api/admin/owner - Check if owner exists
export async function GET() {
  const owner = getOwner()
  return NextResponse.json({
    hasOwner: owner !== null,
    // Don't expose the full address publicly, just indicate if configured
    configured: owner !== null,
  })
}

// POST /api/admin/owner - Set owner (only if no owner exists)
export async function POST(request: NextRequest) {
  try {
    const existingOwner = getOwner()
    
    if (existingOwner) {
      return NextResponse.json(
        { error: 'Owner already configured' },
        { status: 403 }
      )
    }

    const { address } = await request.json()

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      )
    }

    // Validate ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    const owner = setOwner(address)
    
    return NextResponse.json({
      success: true,
      owner: {
        address: owner.address,
        createdAt: owner.createdAt,
      },
    })
  } catch (error) {
    console.error('Error setting owner:', error)
    return NextResponse.json(
      { error: 'Failed to set owner' },
      { status: 500 }
    )
  }
}
