import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { browser } from '$app/environment';
import { env as publicEnv } from '$env/dynamic/public';

const apiKey = publicEnv.PUBLIC_FIREBASE_API_KEY || (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined);
const authDomain = publicEnv.PUBLIC_FIREBASE_AUTH_DOMAIN || (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined);
const projectId = publicEnv.PUBLIC_FIREBASE_PROJECT_ID || (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined);
const storageBucket = publicEnv.PUBLIC_FIREBASE_STORAGE_BUCKET || (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined);
const messagingSenderId = publicEnv.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined);
const appId = publicEnv.PUBLIC_FIREBASE_APP_ID || (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined);
const measurementId = publicEnv.PUBLIC_FIREBASE_MEASUREMENT_ID || (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined);

const hasFirebaseEnv = Boolean(apiKey && projectId && appId);
if (browser && !hasFirebaseEnv) {
  console.warn('Firebase env missing. Set PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_PROJECT_ID, PUBLIC_FIREBASE_APP_ID');
}

const firebaseConfig = {
  apiKey,
  authDomain: authDomain || (projectId ? `${projectId}.firebaseapp.com` : undefined),
  projectId,
  storageBucket: storageBucket || (projectId ? `${projectId}.appspot.com` : undefined),
  messagingSenderId,
  appId,
  measurementId
};

const appInstance = hasFirebaseEnv ? (getApps().length ? getApp() : initializeApp(firebaseConfig as any)) : null;

export const app = appInstance as any;
export const auth = browser && appInstance ? getAuth(appInstance) : null;
let dbInstance: any = null;
if (appInstance) {
  if (browser) {
    dbInstance = initializeFirestore(appInstance, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false,
      useFetchStreams: false,
      ignoreUndefinedProperties: true
    } as any);
  } else {
    dbInstance = getFirestore(appInstance);
  }
}
export const db = dbInstance;
export const storage = appInstance ? getStorage(appInstance) : null;
