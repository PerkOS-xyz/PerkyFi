'use client'

import { useState, useCallback } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

export interface AdminAuthState {
  isAuthenticated: boolean
  nonce: string | null
  signature: `0x${string}` | null
  error: string | null
  isLoading: boolean
}

export function useAdminAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    nonce: null,
    signature: null,
    error: null,
    isLoading: false,
  })

  const authenticate = useCallback(async () => {
    if (!isConnected || !address) {
      setAuthState(prev => ({ ...prev, error: 'Wallet not connected' }))
      return null
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Get nonce from server
      const nonceRes = await fetch('/api/admin/nonce')
      const { nonce } = await nonceRes.json()

      // Sign the nonce
      const signature = await signMessageAsync({ message: nonce })

      setAuthState({
        isAuthenticated: true,
        nonce,
        signature,
        error: null,
        isLoading: false,
      })

      return { address, nonce, signature }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        error: message,
        isLoading: false,
      }))
      return null
    }
  }, [address, isConnected, signMessageAsync])

  const getAuthHeaders = useCallback(() => {
    if (!authState.isAuthenticated || !authState.nonce || !authState.signature || !address) {
      return null
    }
    return {
      'x-wallet-address': address,
      'x-wallet-signature': authState.signature,
      'x-auth-message': authState.nonce,
    }
  }, [address, authState])

  const reset = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      nonce: null,
      signature: null,
      error: null,
      isLoading: false,
    })
  }, [])

  return {
    ...authState,
    address,
    isConnected,
    authenticate,
    getAuthHeaders,
    reset,
  }
}
