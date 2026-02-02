import { NextResponse } from 'next/server'
import { generateNonce } from '@/lib/auth'

// GET /api/admin/nonce - Generate auth nonce for signing
export async function GET() {
  const nonce = generateNonce()
  return NextResponse.json({ nonce })
}
