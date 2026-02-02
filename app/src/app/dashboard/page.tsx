'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { formatUSDC, formatDistanceToNow } from '@/lib/utils'

// Mock agent data (would come from API)
const mockAgentData = {
  status: 'active',
  lastCycle: Date.now() - 1000 * 60 * 15,
  nextCycle: Date.now() + 1000 * 60 * 45,
  portfolio: {
    totalValue: 5420.50,
    change24h: 2.3,
    positions: [
      {
        vault: 'Steakhouse USDC',
        address: '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
        amount: 3000,
        apy: 4.2,
        earnings: 12.50,
      },
      {
        vault: 'Gauntlet USDC Core',
        address: '0x1234...abcd',
        amount: 2420.50,
        apy: 3.8,
        earnings: 8.20,
      },
    ],
  },
  stats: {
    totalTrades: 47,
    winRate: 72,
    avgConfidence: 76,
    totalEarnings: 342.50,
  },
  recentActions: [
    {
      id: 1,
      type: 'deposit',
      amount: 500,
      vault: 'Steakhouse USDC',
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      txHash: '0xabc123...',
      confidence: 82,
    },
    {
      id: 2,
      type: 'hold',
      amount: null,
      vault: null,
      timestamp: Date.now() - 1000 * 60 * 60 * 3,
      txHash: null,
      confidence: 58,
    },
    {
      id: 3,
      type: 'withdraw',
      amount: 200,
      vault: 'Gauntlet USDC Core',
      timestamp: Date.now() - 1000 * 60 * 60 * 5,
      txHash: '0xdef456...',
      confidence: 45,
    },
  ],
}

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor PerkyFi's performance and positions</p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center gap-2"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Banner */}
      <div className={`card flex items-center justify-between ${
        mockAgentData.status === 'active' 
          ? 'border-perky-accent/30 bg-perky-accent/5' 
          : 'border-perky-danger/30 bg-perky-danger/5'
      }`}>
        <div className="flex items-center gap-3">
          {mockAgentData.status === 'active' ? (
            <CheckCircle className="h-6 w-6 text-perky-accent" />
          ) : (
            <XCircle className="h-6 w-6 text-perky-danger" />
          )}
          <div>
            <div className="font-semibold">
              Agent Status: {mockAgentData.status === 'active' ? 'Active' : 'Inactive'}
            </div>
            <div className="text-sm text-gray-400">
              Last cycle: {formatDistanceToNow(mockAgentData.lastCycle)} • 
              Next cycle: in {Math.round((mockAgentData.nextCycle - Date.now()) / 1000 / 60)} minutes
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-perky-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-perky-accent"></span>
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <DollarSign className="h-4 w-4" />
            Portfolio Value
          </div>
          <div className="text-2xl font-bold">{formatUSDC(mockAgentData.portfolio.totalValue)}</div>
          <div className={`text-sm mt-1 flex items-center gap-1 ${
            mockAgentData.portfolio.change24h >= 0 ? 'text-perky-accent' : 'text-perky-danger'
          }`}>
            {mockAgentData.portfolio.change24h >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {mockAgentData.portfolio.change24h >= 0 ? '+' : ''}{mockAgentData.portfolio.change24h}% (24h)
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Activity className="h-4 w-4" />
            Total Trades
          </div>
          <div className="text-2xl font-bold">{mockAgentData.stats.totalTrades}</div>
          <div className="text-sm mt-1 text-gray-400">
            {mockAgentData.stats.winRate}% success rate
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <TrendingUp className="h-4 w-4" />
            Avg Confidence
          </div>
          <div className="text-2xl font-bold">{mockAgentData.stats.avgConfidence}%</div>
          <div className="text-sm mt-1 text-gray-400">
            Threshold: 75%
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <DollarSign className="h-4 w-4" />
            Total Earnings
          </div>
          <div className="text-2xl font-bold text-perky-accent">{formatUSDC(mockAgentData.stats.totalEarnings)}</div>
          <div className="text-sm mt-1 text-gray-400">
            From yield
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Active Positions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="pb-3 font-medium">Vault</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">APY</th>
                <th className="pb-3 font-medium">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {mockAgentData.portfolio.positions.map((position, i) => (
                <tr key={i} className="border-b border-gray-800/50 last:border-0">
                  <td className="py-4">
                    <div className="font-medium">{position.vault}</div>
                    <div className="text-sm text-gray-500 font-mono">{position.address}</div>
                  </td>
                  <td className="py-4">{formatUSDC(position.amount)}</td>
                  <td className="py-4 text-perky-accent">{position.apy}%</td>
                  <td className="py-4 text-perky-accent">+{formatUSDC(position.earnings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Actions</h2>
        <div className="space-y-4">
          {mockAgentData.recentActions.map((action) => (
            <div 
              key={action.id} 
              className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  action.type === 'deposit' 
                    ? 'bg-perky-accent/10 text-perky-accent'
                    : action.type === 'withdraw'
                    ? 'bg-perky-danger/10 text-perky-danger'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {action.type === 'deposit' && <TrendingUp className="h-5 w-5" />}
                  {action.type === 'withdraw' && <TrendingDown className="h-5 w-5" />}
                  {action.type === 'hold' && <Clock className="h-5 w-5" />}
                </div>
                <div>
                  <div className="font-medium capitalize">{action.type}</div>
                  <div className="text-sm text-gray-400">
                    {action.vault ? `${action.vault} • ` : ''}
                    Confidence: {action.confidence}%
                  </div>
                </div>
              </div>
              <div className="text-right">
                {action.amount && (
                  <div className={action.type === 'deposit' ? 'text-perky-accent' : 'text-perky-danger'}>
                    {action.type === 'deposit' ? '+' : '-'}{formatUSDC(action.amount)}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(action.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
