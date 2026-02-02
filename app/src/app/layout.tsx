import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@coinbase/onchainkit/styles.css'
import { Web3Provider } from '@/providers/Web3Provider'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PerkyFi - Predictive Yield Agent',
  description: 'AI-powered yield optimization on Base using Polymarket predictions',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-950 text-white antialiased`}>
        <Web3Provider>
          <Header />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  )
}
