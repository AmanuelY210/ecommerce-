// Firebase Admin SDK initialization
import admin from 'firebase-admin'

const serviceAccount = {
  type: 'service_account',
  project_id: 'amanuel-ecommerce',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
  private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
  client_id: process.env.FIREBASE_CLIENT_ID || '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40amanuel-ecommerce.iam.gserviceaccount.com',
}

export const firebaseClientConfig = {
  apiKey: 'AIzaSyD9hVr05NnIrNIeYYbziOEoR-3S5kudSsY',
  authDomain: 'amanuel-ecommerce.firebaseapp.com',
  projectId: 'amanuel-ecommerce',
  storageBucket: 'amanuel-ecommerce.firebasestorage.app',
  messagingSenderId: '320124039312',
  appId: '1:320124039312:web:cf5759c1431471b5516815',
  measurementId: 'G-22B59SXT4J',
}

let dbInstance: any = null

export function getFirestore(): any {
  if (dbInstance) return dbInstance
  try {
    if (!admin.apps.length) {
      if (serviceAccount.private_key) {
        admin.initializeApp({
          credential: (admin as any).credential.cert(serviceAccount),
          projectId: 'amanuel-ecommerce',
        })
      } else {
        admin.initializeApp({ projectId: 'amanuel-ecommerce' })
      }
    }
    dbInstance = (admin as any).firestore()
    dbInstance.settings({ ignoreUndefinedProperties: true })
    return dbInstance
  } catch (error) {
    console.error('Firebase init error:', error)
    throw error
  }
}

export function isFirebaseAvailable(): boolean {
  try {
    return !!process.env.FIREBASE_PRIVATE_KEY || !!process.env.GOOGLE_APPLICATION_CREDENTIALS
  } catch {
    return false
  }
}
