import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let app: App
let db: Firestore

function getServiceAccount() {
  // Option 1: From environment variable (for Netlify/production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e)
    }
  }
  
  // Option 2: From individual env vars (alternative for Netlify)
  if (process.env.FIREBASE_PRIVATE_KEY) {
    // Handle both escaped \\n and literal \n in private key
    let privateKey = process.env.FIREBASE_PRIVATE_KEY
    // Replace escaped newlines with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n')
    // Also handle double-escaped newlines
    privateKey = privateKey.replace(/\\\\n/g, '\n')
    
    return {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID || 'perkyfi',
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }
  }
  
  return null
}

function initAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = getServiceAccount()
    
    if (serviceAccount) {
      console.log('Firebase Admin: Initializing with project_id:', serviceAccount.project_id)
      console.log('Firebase Admin: client_email:', serviceAccount.client_email)
      console.log('Firebase Admin: private_key starts with:', serviceAccount.private_key?.substring(0, 30))
      try {
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: 'perkyfi',
        })
        console.log('Firebase Admin: Initialized successfully')
      } catch (initError: any) {
        console.error('Firebase Admin: Init error:', initError.message)
        throw initError
      }
    } else {
      console.error('Firebase Admin: No credentials found')
      console.log('FIREBASE_SERVICE_ACCOUNT set:', !!process.env.FIREBASE_SERVICE_ACCOUNT)
      console.log('FIREBASE_PRIVATE_KEY set:', !!process.env.FIREBASE_PRIVATE_KEY)
      console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID)
      console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL)
      throw new Error('Firebase Admin credentials not configured')
    }
  } else {
    app = getApps()[0]
  }
  
  db = getFirestore(app)
  return { app, db }
}

export function getAdminFirestore(): Firestore {
  if (!db) {
    initAdmin()
  }
  return db
}

export { app, db }
