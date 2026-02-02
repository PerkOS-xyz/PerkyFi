'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet'
import {
  Avatar,
  Name,
  Address,
  Identity,
} from '@coinbase/onchainkit/identity'
import { Loader2, Shield, CheckCircle2, AlertCircle } from 'lucide-react'

type SetupStatus = 'checking' | 'ready' | 'already-configured' | 'connecting' | 'saving' | 'success' | 'error'

export default function SetupPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [status, setStatus] = useState<SetupStatus>('checking')
  const [error, setError] = useState<string | null>(null)

  // Check if owner already exists
  useEffect(() => {
    async function checkOwner() {
      try {
        const res = await fetch('/api/admin/owner')
        const data = await res.json()
        
        if (data.hasOwner) {
          setStatus('already-configured')
          setTimeout(() => router.push('/admin'), 2000)
        } else {
          setStatus('ready')
        }
      } catch (err) {
        setStatus('ready')
      }
    }
    checkOwner()
  }, [router])

  // When wallet connects, claim ownership
  useEffect(() => {
    if (status === 'ready' && isConnected && address) {
      claimOwnership()
    }
  }, [isConnected, address, status])

  async function claimOwnership() {
    if (!address) return
    
    setStatus('saving')
    setError(null)

    try {
      const res = await fetch('/api/admin/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim ownership')
      }

      setStatus('success')
      setTimeout(() => router.push('/admin'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim ownership')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-perky-primary to-perky-secondary flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">PerkyFi Setup</h1>
          <p className="text-gray-400">
            Connect your wallet to become the admin
          </p>
        </div>

        {/* Status States */}
        {status === 'checking' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-perky-primary" />
            <p className="text-gray-400">Checking configuration...</p>
          </div>
        )}

        {status === 'already-configured' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-perky-accent" />
            <p className="text-gray-300">Admin already configured</p>
            <p className="text-sm text-gray-500">Redirecting to admin panel...</p>
          </div>
        )}

        {status === 'ready' && !isConnected && (
          <div className="flex flex-col items-center gap-6">
            <p className="text-gray-300 mb-2">
              This is the first-time setup. The wallet you connect will become the owner.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ This action cannot be undone. Make sure you're using the correct wallet.
              </p>
            </div>
            <Wallet>
              <ConnectWallet className="btn-primary w-full justify-center">
                <Avatar className="h-6 w-6" />
                <span>Connect Wallet to Claim Admin</span>
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        )}

        {status === 'saving' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-perky-primary" />
            <p className="text-gray-300">Setting up admin access...</p>
            <p className="text-sm text-gray-500">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-perky-accent" />
            <p className="text-gray-300 font-medium">You are now the admin!</p>
            <p className="text-sm text-gray-500">Redirecting to admin panel...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-perky-danger" />
            <p className="text-perky-danger">{error}</p>
            <button 
              onClick={() => setStatus('ready')}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
