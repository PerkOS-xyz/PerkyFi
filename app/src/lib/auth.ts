import { getOwner, isOwner } from './config-storage'
import { verifyMessage } from 'viem'

export interface AuthResult {
  authenticated: boolean
  error?: string
  address?: string
}

// Verify that the request comes from the owner
export async function verifyOwnerAuth(
  address: string,
  message: string,
  signature: `0x${string}`
): Promise<AuthResult> {
  const owner = getOwner()
  
  if (!owner) {
    return { authenticated: false, error: 'No owner configured' }
  }

  if (!isOwner(address)) {
    return { authenticated: false, error: 'Access denied: not owner' }
  }

  try {
    // Verify the signature
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature,
    })

    if (!isValid) {
      return { authenticated: false, error: 'Invalid signature' }
    }

    return { authenticated: true, address }
  } catch (error) {
    return { authenticated: false, error: 'Signature verification failed' }
  }
}

// Generate a nonce for signing
export function generateNonce(): string {
  return `PerkyFi Admin Auth - ${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Check if setup is needed
export function needsSetup(): boolean {
  return getOwner() === null
}
