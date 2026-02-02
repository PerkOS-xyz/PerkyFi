'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Minus, ExternalLink, Lock } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/utils'

interface Trade {
  id: string
  timestamp: number
  prediction: {
    market: string
    confidence: number
  }
  action: {
    type: 'deposit' | 'withdraw' | 'hold'
    vault: string
    amount: string
    apy: number
  }
  txHash: string | null
}

interface TradeCardProps {
  trade: Trade
  showPaywall?: boolean
}

export function TradeCard({ trade, showPaywall = true }: TradeCardProps) {
  const actionIcons = {
    deposit: <ArrowUpRight className="h-4 w-4 text-perky-accent" />,
    withdraw: <ArrowDownRight className="h-4 w-4 text-perky-danger" />,
    hold: <Minus className="h-4 w-4 text-gray-400" />,
  }

  const actionColors = {
    deposit: 'bg-perky-accent/10 text-perky-accent border-perky-accent/20',
    withdraw: 'bg-perky-danger/10 text-perky-danger border-perky-danger/20',
    hold: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  }

  const confidenceColor = trade.prediction.confidence >= 75 
    ? 'text-perky-accent' 
    : trade.prediction.confidence >= 60 
    ? 'text-perky-warning' 
    : 'text-gray-400'

  return (
    <div className="card hover:border-gray-700 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Prediction Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${actionColors[trade.action.type]}`}>
              {actionIcons[trade.action.type]}
              {trade.action.type.charAt(0).toUpperCase() + trade.action.type.slice(1)}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(trade.timestamp)}
            </span>
          </div>
          
          <h3 className="font-semibold mb-1">{trade.prediction.market}</h3>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              Confidence: <span className={`font-medium ${confidenceColor}`}>{trade.prediction.confidence}%</span>
            </span>
            <span className="text-gray-400">
              Vault: <span className="text-white">{trade.action.vault}</span>
            </span>
            <span className="text-gray-400">
              APY: <span className="text-perky-accent">{trade.action.apy}%</span>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {trade.txHash && (
            <a
              href={`https://basescan.org/tx/${trade.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              View TX
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          
          {showPaywall ? (
            <Link
              href={`/trade/${trade.id}`}
              className="btn-primary text-sm"
            >
              <Lock className="h-4 w-4 mr-1.5" />
              View Signal · $0.10
            </Link>
          ) : (
            <Link
              href={`/trade/${trade.id}`}
              className="btn-secondary text-sm"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
