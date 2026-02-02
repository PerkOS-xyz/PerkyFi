'use client'

import { useEffect, useState, useCallback } from 'react'
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
import { 
  Loader2, 
  Shield, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Settings,
  Wallet as WalletIcon,
  MessageSquare,
  CreditCard,
  Bot,
  RefreshCw
} from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'

type AdminStatus = 'checking' | 'no-owner' | 'not-owner' | 'connect' | 'authenticate' | 'ready'

interface Credentials {
  // CDP
  onchainKitApiKey?: string
  walletConnectProjectId?: string
  // Social
  xAuthToken?: string
  xCt0?: string
  neynarApiKey?: string
  // Agent
  walletPrivateKey?: string
  morphoVaultAddress?: string
  // Payments
  x402RecipientAddress?: string
  x402PriceUsdc?: string
  // Mode
  dryRun?: boolean
}

interface FormSection {
  id: string
  title: string
  icon: React.ReactNode
  fields: FormField[]
}

interface FormField {
  key: keyof Credentials
  label: string
  type: 'text' | 'password' | 'toggle' | 'address'
  placeholder?: string
  description?: string
}

const FORM_SECTIONS: FormSection[] = [
  {
    id: 'cdp',
    title: 'CDP (Coinbase)',
    icon: <Settings className="w-5 h-5" />,
    fields: [
      { key: 'onchainKitApiKey', label: 'OnchainKit API Key', type: 'password', placeholder: 'Enter API key' },
      { key: 'walletConnectProjectId', label: 'WalletConnect Project ID', type: 'password', placeholder: 'Enter project ID' },
    ],
  },
  {
    id: 'social',
    title: 'Social',
    icon: <MessageSquare className="w-5 h-5" />,
    fields: [
      { key: 'xAuthToken', label: 'X AUTH_TOKEN', type: 'password', placeholder: 'Enter X auth token' },
      { key: 'xCt0', label: 'X CT0', type: 'password', placeholder: 'Enter X ct0 cookie' },
      { key: 'neynarApiKey', label: 'Neynar API Key', type: 'password', placeholder: 'Enter Neynar API key' },
    ],
  },
  {
    id: 'agent',
    title: 'Agent',
    icon: <Bot className="w-5 h-5" />,
    fields: [
      { key: 'walletPrivateKey', label: 'Wallet Private Key', type: 'password', placeholder: 'Enter private key (hex)', description: '⚠️ Never share this key. Stored encrypted.' },
      { key: 'morphoVaultAddress', label: 'Morpho Vault Address', type: 'address', placeholder: '0x...' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments (x402)',
    icon: <CreditCard className="w-5 h-5" />,
    fields: [
      { key: 'x402RecipientAddress', label: 'Recipient Address', type: 'address', placeholder: '0x...' },
      { key: 'x402PriceUsdc', label: 'Price (USDC)', type: 'text', placeholder: '0.01' },
    ],
  },
  {
    id: 'mode',
    title: 'Mode',
    icon: <RefreshCw className="w-5 h-5" />,
    fields: [
      { key: 'dryRun', label: 'DRY_RUN Mode', type: 'toggle', description: 'Enable to test without executing real transactions' },
    ],
  },
]

export default function AdminPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { authenticate, getAuthHeaders, isAuthenticated, isLoading: isAuthLoading, error: authError } = useAdminAuth()
  
  const [adminStatus, setAdminStatus] = useState<AdminStatus>('checking')
  const [credentials, setCredentials] = useState<Credentials>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingCreds, setIsLoadingCreds] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Check admin status
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/admin/owner')
        const data = await res.json()
        
        if (!data.hasOwner) {
          setAdminStatus('no-owner')
          setTimeout(() => router.push('/setup'), 2000)
          return
        }
        
        if (!isConnected) {
          setAdminStatus('connect')
          return
        }

        if (!isAuthenticated) {
          setAdminStatus('authenticate')
          return
        }

        setAdminStatus('ready')
      } catch {
        setAdminStatus('connect')
      }
    }
    checkStatus()
  }, [router, isConnected, isAuthenticated])

  // Load credentials when authenticated
  useEffect(() => {
    if (adminStatus === 'ready' && isAuthenticated) {
      loadCredentials()
    }
  }, [adminStatus, isAuthenticated])

  const loadCredentials = useCallback(async () => {
    const headers = getAuthHeaders()
    if (!headers) return

    setIsLoadingCreds(true)
    try {
      const res = await fetch('/api/admin/config', {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      })

      if (res.status === 403) {
        setAdminStatus('not-owner')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to load config')
      }

      const data = await res.json()
      setCredentials(data.credentials || {})
    } catch (err) {
      showToast('error', 'Failed to load credentials')
    } finally {
      setIsLoadingCreds(false)
    }
  }, [getAuthHeaders])

  const saveCredentials = async () => {
    const headers = getAuthHeaders()
    if (!headers) {
      showToast('error', 'Not authenticated')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credentials }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      const data = await res.json()
      setCredentials(data.credentials || credentials)
      showToast('success', 'Configuration saved!')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldChange = (key: keyof Credentials, value: string | boolean) => {
    setCredentials(prev => ({ ...prev, [key]: value }))
  }

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAuthenticate = async () => {
    const result = await authenticate()
    if (result) {
      setAdminStatus('ready')
    }
  }

  // Render based on status
  if (adminStatus === 'checking') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-perky-primary" />
          <p className="text-gray-400">Checking access...</p>
        </div>
      </div>
    )
  }

  if (adminStatus === 'no-owner') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Setup Required</h2>
          <p className="text-gray-400">Redirecting to setup wizard...</p>
        </div>
      </div>
    )
  }

  if (adminStatus === 'not-owner') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-perky-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400">You are not the admin of this instance.</p>
          <p className="text-sm text-gray-500 mt-2">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>
    )
  }

  if (adminStatus === 'connect') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <WalletIcon className="w-12 h-12 text-perky-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-gray-400 mb-6">Connect your admin wallet to access the dashboard.</p>
          <Wallet>
            <ConnectWallet className="btn-primary w-full justify-center">
              <Avatar className="h-6 w-6" />
              <span>Connect Wallet</span>
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
      </div>
    )
  }

  if (adminStatus === 'authenticate') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-perky-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Verify Ownership</h2>
          <p className="text-gray-400 mb-6">Sign a message to prove you own this wallet.</p>
          <p className="text-sm text-gray-500 mb-4">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          {authError && (
            <p className="text-perky-danger text-sm mb-4">{authError}</p>
          )}
          <button 
            onClick={handleAuthenticate}
            disabled={isAuthLoading}
            className="btn-primary w-full justify-center"
          >
            {isAuthLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Waiting for signature...
              </>
            ) : (
              'Sign to Authenticate'
            )}
          </button>
        </div>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' 
            ? 'bg-perky-accent/20 text-perky-accent border border-perky-accent/30' 
            : 'bg-perky-danger/20 text-perky-danger border border-perky-danger/30'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Shield className="w-7 h-7 text-perky-primary" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Configure your PerkyFi instance
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Connected as</p>
          <p className="text-sm font-mono text-perky-primary">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>

      {isLoadingCreds ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-perky-primary" />
        </div>
      ) : (
        <>
          {/* Config Sections */}
          <div className="space-y-6">
            {FORM_SECTIONS.map(section => (
              <div key={section.id} className="card">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                  <div className="w-10 h-10 rounded-lg bg-perky-primary/10 flex items-center justify-center text-perky-primary">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {field.label}
                      </label>
                      
                      {field.type === 'toggle' ? (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleFieldChange(field.key, !credentials[field.key])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              credentials[field.key] ? 'bg-perky-primary' : 'bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                credentials[field.key] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`text-sm ${credentials[field.key] ? 'text-perky-primary' : 'text-gray-500'}`}>
                            {credentials[field.key] ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                            value={(credentials[field.key] as string) || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-perky-primary focus:border-transparent font-mono text-sm"
                          />
                          {field.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(field.key)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPasswords[field.key] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {field.description && (
                        <p className="text-xs text-gray-500 mt-1.5">{field.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="sticky bottom-4 mt-8">
            <button
              onClick={saveCredentials}
              disabled={isSaving}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
