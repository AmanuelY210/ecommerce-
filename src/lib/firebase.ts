// Firebase Admin SDK initialization
// Uses the user's Firebase project: ammanuel-ecommerce

import admin from 'firebase-admin'

// Firebase service account credentials
// In production (Vercel), set these as environment variables
// For now, using the config directly for the user's project

const serviceAccount = {
  type: 'service_account',
  project_id: 'amanuel-ecommerce',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
  private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk@amanuel-ecommerce.iam.gserviceaccount.com`,
  client_id: process.env.FIREBASE_CLIENT_ID || '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40amanuel-ecommerce.iam.gserviceaccount.com`,
}

// Client-side Firebase config (for browser use)
export const firebaseClientConfig = {
  apiKey: 'AIzaSyD9hVr05NnIrNIeYYbziOEoR-3S5kudSsY',
  authDomain: 'amanuel-ecommerce.firebaseapp.com',
  projectId: 'amanuel-ecommerce',
  storageBucket: 'amanuel-ecommerce.firebasestorage.app',
  messagingSenderId: '320124039312',
  appId: '1:320124039312:web:cf5759c1431471b5516815',
  measurementId: 'G-22B59SXT4J',
}

// Initialize Firebase Admin (singleton)
let dbInstance: FirebaseFirestore.Firestore | null = null

export function getFirestore(): FirebaseFirestore.Firestore {
  if (dbInstance) return dbInstance

  try {
    if (!admin.apps.length) {
      // Try to init with service account
      if (serviceAccount.private_key) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as any),
          projectId: 'amanuel-ecommerce',
        })
      } else {
        // Fallback: use application default credentials (works on Vercel if FIREBASE env vars set)
        admin.initializeApp({
          projectId: 'amanuel-ecommerce',
        })
      }
    }
    dbInstance = admin.firestore()
    dbInstance.settings({ ignoreUndefinedProperties: true })
    return dbInstance
  } catch (error) {
    console.error('Firebase init error:', error)
    throw error
  }
}

// Check if Firebase is available (has credentials)
export function isFirebaseAvailable(): boolean {
  try {
    return !!process.env.FIREBASE_PRIVATE_KEY || !!process.env.GOOGLE_APPLICATION_CREDENTIALS
  } catch {
    return false
  }
}
