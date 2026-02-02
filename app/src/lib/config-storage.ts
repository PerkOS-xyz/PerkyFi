import fs from 'fs'
import path from 'path'
import { encrypt, decrypt, maskSecret } from './crypto'

const CONFIG_DIR = path.join(process.cwd(), 'config')
const OWNER_FILE = path.join(CONFIG_DIR, 'owner.json')
const CREDENTIALS_FILE = path.join(CONFIG_DIR, 'credentials.json')

// Ensure config directory exists
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

// Owner management
export interface OwnerConfig {
  address: string
  createdAt: string
}

export function getOwner(): OwnerConfig | null {
  ensureConfigDir()
  if (!fs.existsSync(OWNER_FILE)) {
    return null
  }
  try {
    const data = fs.readFileSync(OWNER_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function setOwner(address: string): OwnerConfig {
  ensureConfigDir()
  const owner: OwnerConfig = {
    address: address.toLowerCase(),
    createdAt: new Date().toISOString(),
  }
  fs.writeFileSync(OWNER_FILE, JSON.stringify(owner, null, 2))
  return owner
}

export function isOwner(address: string): boolean {
  const owner = getOwner()
  if (!owner) return false
  return owner.address.toLowerCase() === address.toLowerCase()
}

// Credentials management
export interface Credentials {
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

// Fields that should be encrypted (sensitive)
const SENSITIVE_FIELDS: (keyof Credentials)[] = [
  'onchainKitApiKey',
  'walletConnectProjectId',
  'xAuthToken',
  'xCt0',
  'neynarApiKey',
  'walletPrivateKey',
]

export function getCredentials(): Credentials {
  ensureConfigDir()
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    return {}
  }
  try {
    const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8')
    const encrypted = JSON.parse(data)
    
    // Decrypt sensitive fields
    const decrypted: Credentials = {}
    for (const [key, value] of Object.entries(encrypted)) {
      if (SENSITIVE_FIELDS.includes(key as keyof Credentials) && typeof value === 'string') {
        try {
          decrypted[key as keyof Credentials] = decrypt(value) as never
        } catch {
          decrypted[key as keyof Credentials] = value as never
        }
      } else {
        decrypted[key as keyof Credentials] = value as never
      }
    }
    return decrypted
  } catch {
    return {}
  }
}

export function saveCredentials(credentials: Credentials): void {
  ensureConfigDir()
  
  // Encrypt sensitive fields
  const encrypted: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(credentials)) {
    if (SENSITIVE_FIELDS.includes(key as keyof Credentials) && typeof value === 'string' && value) {
      encrypted[key] = encrypt(value)
    } else {
      encrypted[key] = value
    }
  }
  
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(encrypted, null, 2))
}

// Return credentials with sensitive fields masked
export function getMaskedCredentials(): Credentials & { _masked: true } {
  const creds = getCredentials()
  const masked: Record<string, unknown> = { _masked: true }
  
  for (const [key, value] of Object.entries(creds)) {
    if (SENSITIVE_FIELDS.includes(key as keyof Credentials) && typeof value === 'string') {
      // Never return actual private key, always mask it
      if (key === 'walletPrivateKey') {
        masked[key] = value ? '••••••••••••••••' : ''
      } else {
        masked[key] = value ? maskSecret(value) : ''
      }
    } else {
      masked[key] = value
    }
  }
  
  return masked as unknown as Credentials & { _masked: true }
}
