'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, Brain, Shield, Zap } from 'lucide-react'
import { TradeCard } from '@/components/TradeCard'

// Mock recent trades (will be fetched from API)
const recentTrades = [
  {
    id: 'trade-001',
    timestamp: Date.now() - 1000 * 60 * 30,
    prediction: {
      market: 'ETH > $4,000 by March',
      confidence: 78,
    },
    action: {
      type: 'deposit' as const,
      vault: 'Steakhouse USDC',
      amount: '3000',
      apy: 4.2,
    },
    txHash: '0x1234...abcd',
  },
  {
    id: 'trade-002',
    timestamp: Date.now() - 1000 * 60 * 120,
    prediction: {
      market: 'BTC dominance > 55%',
      confidence: 65,
    },
    action: {
      type: 'hold' as const,
      vault: 'Steakhouse USDC',
      amount: '3000',
      apy: 4.2,
    },
    txHash: null,
  },
]

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Polymarket predictions analyzed in real-time to optimize yield positions.',
  },
  {
    icon: Zap,
    title: 'Autonomous Execution',
    description: 'Trades execute automatically when confidence thresholds are met.',
  },
  {
    icon: Shield,
    title: 'Transparent & Verifiable',
    description: 'Every decision logged on-chain via ERC-8004 for reputation.',
  },
  {
    icon: BarChart3,
    title: 'Copy Trades',
    description: 'Access trade signals and copy positions directly to Morpho.',
  },
]

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-perky-primary/30 bg-perky-primary/10 px-4 py-1.5 text-sm text-perky-primary mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-perky-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-perky-primary"></span>
          </span>
          Live on Base Mainnet
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="gradient-text">Predictive Yield</span>
          <br />
          Powered by AI
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          PerkyFi analyzes Polymarket predictions to optimize your yield on Morpho.
          Transparent, autonomous, and verifiable on-chain.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
            View Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <a 
            href="https://docs.perkyfi.xyz" 
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-lg px-8 py-3"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="card text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-perky-primary/10 text-perky-primary mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Trades */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Trades</h2>
          <Link 
            href="/trades" 
            className="text-sm text-perky-primary hover:text-perky-primary/80 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-4">
          {recentTrades.map((trade) => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card bg-gradient-to-br from-perky-primary/20 to-perky-secondary/20 border-perky-primary/30 text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Start Earning Smarter Yields</h2>
        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          Access AI-powered trade signals for just $0.10 USDC each.
          No subscriptions, no accounts—just connect your wallet.
        </p>
        <Link href="/trades" className="btn-primary text-lg px-8 py-3">
          Browse Trade Signals
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </section>
    </div>
  )
}
