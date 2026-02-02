'use client'

import Link from 'next/link'
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
import { Activity, BarChart3, Home } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-perky-primary to-perky-secondary">
              <span className="text-lg">🔮</span>
            </div>
            <span className="text-xl font-bold">PerkyFi</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link 
              href="/trades" 
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Activity className="h-4 w-4" />
              Trades
            </Link>
          </nav>

          {/* Wallet */}
          <div className="flex items-center gap-4">
            <Wallet>
              <ConnectWallet className="btn-primary">
                <Avatar className="h-6 w-6" />
                <Name />
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
      </div>
    </header>
  )
}
