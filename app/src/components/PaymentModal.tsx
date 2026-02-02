'use client'

import { useState } from 'react'
import { X, Lock, Shield, Zap, Check, Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { 
  ConnectWallet,
  Wallet,
} from '@coinbase/onchainkit/wallet'
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from '@coinbase/onchainkit/transaction'
import { base } from 'wagmi/chains'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tradeId: string
  price?: string
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  tradeId,
  price = '0.10' 
}: PaymentModalProps) {
  const { isConnected, address } = useAccount()
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handlePayment = async () => {
    setIsPaying(true)
    setError(null)

    try {
      // Call the x402-protected API endpoint
      const response = await fetch(`/api/trade/${tradeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 402) {
        // Payment required - extract payment details
        const paymentRequired = response.headers.get('X-Payment-Required')
        // In production, this would trigger the x402 payment flow
        console.log('Payment required:', paymentRequired)
        setError('x402 payment flow - connect wallet to pay')
      } else if (response.ok) {
        onSuccess()
      } else {
        throw new Error('Failed to access trade signal')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-semibold">Access Trade Signal</h2>
            <p className="text-sm text-gray-400 mt-0.5">One-time payment via x402</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price Display - Stripe Style */}
          <div className="text-center py-4">
            <div className="text-5xl font-bold mb-2">
              ${price}
              <span className="text-xl text-gray-400 font-normal ml-1">USDC</span>
            </div>
            <p className="text-sm text-gray-400">on Base Network</p>
          </div>

          {/* What You Get */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">What you'll get:</h3>
            <ul className="space-y-2">
              {[
                'Full trade signal details',
                'Agent\'s reasoning and analysis',
                'Pre-filled transaction to copy trade',
                'Access to historical performance',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="h-4 w-4 text-perky-accent flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
            <Shield className="h-5 w-5 text-perky-primary" />
            <div className="text-xs">
              <span className="text-gray-300">Secured by x402 Protocol</span>
              <span className="text-gray-500 block">Payments verified by Coinbase</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-perky-danger/10 border border-perky-danger/20 rounded-lg text-sm text-perky-danger">
              {error}
            </div>
          )}

          {/* Payment Button */}
          {!isConnected ? (
            <Wallet>
              <ConnectWallet className="w-full btn-primary justify-center py-4 text-base">
                <Lock className="h-5 w-5 mr-2" />
                Connect Wallet to Pay
              </ConnectWallet>
            </Wallet>
          ) : (
            <button
              onClick={handlePayment}
              disabled={isPaying}
              className="w-full btn-primary justify-center py-4 text-base disabled:opacity-50"
            >
              {isPaying ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Pay ${price} USDC
                </>
              )}
            </button>
          )}

          {/* Footer */}
          <p className="text-xs text-center text-gray-500">
            By paying, you agree to our{' '}
            <a href="/terms" className="text-perky-primary hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  )
}
