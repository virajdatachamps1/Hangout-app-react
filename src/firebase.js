import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Validate environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');

  // Initialize Firebase Auth with persistence
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('✅ Auth persistence enabled');
    })
    .catch((error) => {
      console.warn('⚠️ Auth persistence failed:', error.message);
    });

  // Initialize Firestore
  db = getFirestore(app);

  // Initialize Storage
  storage = getStorage(app);

  // Enable offline persistence for Firestore
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('✅ Firestore offline persistence enabled');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ Multiple tabs open, persistence enabled in first tab only');
      } else if (err.code === 'unimplemented') {
        console.warn('⚠️ Browser does not support offline persistence');
      }
    });

  console.log('✅ Firestore initialized successfully');

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Export initialized services
export { auth, db, storage };
export default app;