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
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: 'perkyfi',
      })
    } else {
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
