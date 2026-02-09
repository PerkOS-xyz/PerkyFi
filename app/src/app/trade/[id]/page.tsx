'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  Check, 
  TrendingUp,
  Clock,
  Target,
  Wallet
} from 'lucide-react'
import { PaymentModal } from '@/components/PaymentModal'
import { formatDistanceToNow, formatUSDC } from '@/lib/utils'
import { useAccount } from 'wagmi'
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from '@coinbase/onchainkit/transaction'
import { base } from 'wagmi/chains'

// Trade data type
interface TradeSignal {
  id: string
  timestamp: number
  prediction: {
    market: string
    confidence: number
    source: string
    sourceUrl: string
  }
  action: {
    type: 'deposit' | 'withdraw' | 'hold'
    vault: string
    vaultAddress: string
    amount: string
    apy: number
  }
  analysis: string
  txHash: string | null
}

// Default/fallback trade data (used if API fails)
const defaultTradeData: TradeSignal = {
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
}

export default function TradePage() {
  const params = useParams()
  const tradeId = params.id as string
  const { isConnected } = useAccount()
  
  const [hasPaid, setHasPaid] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tradeData, setTradeData] = useState<TradeSignal>(defaultTradeData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user has already paid (would check localStorage or API in production)
  useEffect(() => {
    const paid = localStorage.getItem(`paid_${tradeId}`)
    if (paid) setHasPaid(true)
  }, [tradeId])

  // Fetch trade data after payment is verified
  useEffect(() => {
    if (hasPaid) {
      fetchTradeData()
    }
  }, [hasPaid, tradeId])

  const fetchTradeData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/trade/${tradeId}`, {
        headers: {
          'X-Payment-Signature': localStorage.getItem(`payment_sig_${tradeId}`) || 'paid',
        },
      })
      if (res.ok) {
        const data = await res.json()
        setTradeData(data)
      } else if (res.status === 402) {
        // Payment required - user hasn't actually paid
        setHasPaid(false)
        localStorage.removeItem(`paid_${tradeId}`)
      } else {
        // Use default data if API fails
        console.warn('Failed to fetch trade data, using default')
      }
    } catch (err) {
      console.error('Error fetching trade:', err)
      // Keep default data on error
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    localStorage.setItem(`paid_${tradeId}`, 'true')
    setHasPaid(true)
    setShowPaymentModal(false)
  }

  const copyTxHash = () => {
    if (tradeData.txHash) {
      navigator.clipboard.writeText(tradeData.txHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Morpho deposit transaction (for copy trading)
  const morphoDepositCalls = [
    {
      to: tradeData.action.vaultAddress as `0x${string}`,
      data: '0x' as `0x${string}`, // Would be actual deposit calldata
    },
  ]

  if (!hasPaid) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Locked State */}
        <div className="card text-center py-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-perky-primary/10 text-perky-primary mb-6">
            <Target className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Trade Signal #{tradeId.slice(-4)}</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            This trade signal is protected. Pay $0.10 USDC to access the full analysis 
            and copy the trade to your wallet.
          </p>

          <button 
            onClick={() => setShowPaymentModal(true)}
            className="btn-primary text-lg px-8 py-3"
          >
            Unlock for $0.10 USDC
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Powered by x402 Protocol on Base
          </p>
        </div>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          tradeId={tradeId}
        />
      </div>
    )
  }

  // Unlocked State - Full trade details
  return (
    <div className="max-w-3xl mx-auto">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-perky-accent/20 bg-perky-accent/10 px-3 py-1 text-sm font-medium text-perky-accent">
            <TrendingUp className="h-4 w-4" />
            {tradeData.action.type.charAt(0).toUpperCase() + tradeData.action.type.slice(1)}
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            {formatDistanceToNow(tradeData.timestamp)}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{tradeData.prediction.market}</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card py-4">
          <div className="text-sm text-gray-400 mb-1">Confidence</div>
          <div className="text-2xl font-bold text-perky-accent">{tradeData.prediction.confidence}%</div>
        </div>
        <div className="card py-4">
          <div className="text-sm text-gray-400 mb-1">Vault</div>
          <div className="text-lg font-semibold">{tradeData.action.vault}</div>
        </div>
        <div className="card py-4">
          <div className="text-sm text-gray-400 mb-1">Amount</div>
          <div className="text-2xl font-bold">{formatUSDC(tradeData.action.amount)}</div>
        </div>
        <div className="card py-4">
          <div className="text-sm text-gray-400 mb-1">Current APY</div>
          <div className="text-2xl font-bold text-perky-accent">{tradeData.action.apy}%</div>
        </div>
      </div>

      {/* Analysis */}
      <div className="card mb-8">
        <h2 className="font-semibold mb-4">Agent's Analysis</h2>
        <p className="text-gray-300 leading-relaxed">{tradeData.analysis}</p>
        
        <div className="mt-4 pt-4 border-t border-gray-800">
          <a 
            href={tradeData.prediction.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-perky-primary hover:text-perky-primary/80 flex items-center gap-1"
          >
            View on {tradeData.prediction.source}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Transaction */}
      {tradeData.txHash && (
      <div className="card mb-8">
        <h2 className="font-semibold mb-4">Agent's Transaction</h2>
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <code className="text-sm text-gray-300 font-mono">
            {tradeData.txHash.slice(0, 20)}...{tradeData.txHash.slice(-8)}
          </code>
          <div className="flex items-center gap-2">
            <button
              onClick={copyTxHash}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-perky-accent" /> : <Copy className="h-4 w-4" />}
            </button>
            <a
              href={`https://basescan.org/tx/${tradeData.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      )}

      {/* Copy Trade CTA */}
      <div className="card bg-gradient-to-br from-perky-primary/20 to-perky-secondary/20 border-perky-primary/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold mb-1">Copy This Trade</h2>
            <p className="text-sm text-gray-400">
              Deposit USDC to the same Morpho vault using your connected wallet.
            </p>
          </div>
          
          {isConnected ? (
            <Transaction
              chainId={base.id}
              calls={morphoDepositCalls}
              onSuccess={(result) => console.log('Trade copied!', result)}
            >
              <TransactionButton 
                className="btn-primary whitespace-nowrap"
                text="Copy Trade"
              />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          ) : (
            <button className="btn-primary flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
