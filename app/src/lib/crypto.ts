import CryptoJS from 'crypto-js'

const MASTER_KEY = process.env.MASTER_KEY || process.env.NEXT_PUBLIC_MASTER_KEY || 'default-dev-key-change-in-production'

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, MASTER_KEY).toString()
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, MASTER_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function maskSecret(value: string): string {
  if (!value || value.length < 8) return '••••••••'
  return value.slice(0, 4) + '••••' + value.slice(-4)
}
