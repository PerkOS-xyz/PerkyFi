import { NextRequest, NextResponse } from 'next/server'

// x402 payment configuration
const X402_CONFIG = {
  recipient: process.env.X402_RECIPIENT_ADDRESS || '0x0000000000000000000000000000000000000000',
  price: process.env.X402_PRICE_USDC || '0.10',
  facilitator: process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator',
  network: 'base',
  asset: 'USDC',
}

// Mock trade data (would come from database)
const trades: Record<string, any> = {
  'trade-001': {
    id: 'trade-001',
    timestamp: Date.now() - 1000 * 60 * 30,
    prediction: {
      market: 'ETH > $4,000 by March',
      confidence: 78,
      source: 'Polymarket',
      sourceUrl: 'https://polymarket.com/event/eth-4000-march',
    },
    action: {
      type: 'deposit',
      vault: 'Steakhouse USDC',
      vaultAddress: '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
      amount: '3000',
      apy: 4.2,
    },
    analysis: `Based on current Polymarket predictions showing 78% confidence in ETH reaching $4,000 by March, 
I'm increasing exposure to yield-generating positions. The market sentiment has shifted bullish following 
recent institutional announcements. Risk-reward ratio favors holding stablecoin yield positions that can 
be quickly converted to ETH exposure if momentum continues.`,
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
  'trade-002': {
    id: 'trade-002',
    timestamp: Date.now() - 1000 * 60 * 120,
    prediction: {
      market: 'BTC dominance > 55%',
      confidence: 65,
      source: 'Polymarket',
      sourceUrl: 'https://polymarket.com/event/btc-dominance',
    },
    action: {
      type: 'hold',
      vault: 'Steakhouse USDC',
      vaultAddress: '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
      amount: '3000',
      apy: 4.2,
    },
    analysis: `Market confidence at 65% doesn't meet our threshold for action. Maintaining current positions 
while monitoring for changes in sentiment. Will re-evaluate on next cycle.`,
    txHash: null,
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tradeId } = await params
  const trade = trades[tradeId]

  if (!trade) {
    return NextResponse.json(
      { error: 'Trade not found' },
      { status: 404 }
    )
  }

  // Check for x402 payment header
  const paymentSignature = request.headers.get('X-Payment-Signature')
  
  if (!paymentSignature) {
    // Return 402 Payment Required with payment instructions
    const paymentRequired = {
      version: '1',
      recipient: X402_CONFIG.recipient,
      amount: X402_CONFIG.price,
      asset: X402_CONFIG.asset,
      network: X402_CONFIG.network,
      facilitator: X402_CONFIG.facilitator,
      description: `Access trade signal ${tradeId}`,
      expiry: Date.now() + 1000 * 60 * 5, // 5 minutes
    }

    return new NextResponse(
      JSON.stringify({ 
        error: 'Payment required',
        payment: paymentRequired,
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Required': JSON.stringify(paymentRequired),
          'WWW-Authenticate': `X402 realm="${X402_CONFIG.facilitator}"`,
        },
      }
    )
  }

  // TODO: Verify payment with facilitator
  // In production, this would:
  // 1. Parse the payment signature
  // 2. Verify with the facilitator API
  // 3. Check amount and recipient match
  // 4. Return data only if valid

  // For now, return trade data (in production, verify payment first)
  return NextResponse.json(trade)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Payment-Signature',
    },
  })
}
