import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import type { ContactMessage } from './types';

/*
  Cloud backend boot — project: acetix1 (region: asia-south1 / Mumbai)
  ─────────────────────────────────────────────────────────────────
  The live web-app config is embedded below (web keys are public by
  design — security is enforced through backend access rules, not key
  secrecy). Environment variables (VITE_FIREBASE_*) take priority when
  present, so you can still point the build at another project without
  touching code. If the backend is unreachable the whole site falls back
  to bundled seed data — nothing ever breaks.
*/
const embeddedConfig = {
  apiKey: 'AIzaSyDC61227pFwSqlAqWSfHzPKP7nbn5tY_1o',
  authDomain: 'acetix1.firebaseapp.com',
  projectId: 'acetix1',
  storageBucket: 'acetix1.firebasestorage.app',
  messagingSenderId: '499551385547',
  appId: '1:499551385547:web:c6a6df0fd762e87e39a84e',
};

const env = import.meta.env;

const config = {
  apiKey: (env.VITE_FIREBASE_API_KEY as string | undefined) || embeddedConfig.apiKey,
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) || embeddedConfig.authDomain,
  projectId: (env.VITE_FIREBASE_PROJECT_ID as string | undefined) || embeddedConfig.projectId,
  storageBucket:
    (env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined) || embeddedConfig.storageBucket,
  messagingSenderId:
    (env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined) ||
    embeddedConfig.messagingSenderId,
  appId: (env.VITE_FIREBASE_APP_ID as string | undefined) || embeddedConfig.appId,
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

/*
  No third-party analytics — user tracking is intentionally excluded.
  Statistics use an in-house daily visitor counter (src/lib/visitors.ts
  → visitors/{YYYY-MM-DD} collection).
*/
if (firebaseEnabled) {
  app = initializeApp(config);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
export { onAuthStateChanged, signOut, type User };

/**
 * Sign in with a Google or GitHub popup. Requires the provider to be
 * enabled in the backend console (Authentication → Sign-in method).
 */
export async function signInWithProvider(
  providerId: 'google' | 'github',
): Promise<User> {
  if (!auth) throw new Error('Backend auth is not configured.');
  const provider =
    providerId === 'github' ? new GithubAuthProvider() : new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

/**
 * Persists a form submission to the `contacts` collection when the backend
 * is configured (matching the published access rules). Falls back to a
 * simulated send otherwise so the demo experience stays intact.
 */
export async function sendContactMessage(
  payload: ContactMessage,
): Promise<'firebase' | 'demo'> {
  if (!db) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return 'demo';
  }

  await addDoc(collection(db, 'contacts'), {
    ...payload,
    site: 'acetix.xyz',
    createdAt: serverTimestamp(),
  });
  return 'firebase';
}
