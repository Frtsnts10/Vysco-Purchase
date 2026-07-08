import { getApps, getApp, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// TODO: Ensure you have your Firebase Admin SDK service account JSON
// Do NOT commit the actual service account key to version control.
// Use environment variables in production.
const initAdmin = () => {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: applicationDefault(),
  });
};

export const adminDb = getFirestore(initAdmin());
export const adminAuth = getAuth(initAdmin());
