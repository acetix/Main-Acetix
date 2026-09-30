import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY = 'acetix.lastVisit';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/**
 * Daily visitor counter — privacy-friendly by design (no user tracking, no
 * cookies: a localStorage flag simply remembers that this browser has
 * already been counted today).
 *
 * Cloud layout:
 *   visitors/2025-06-14  →  { date: "2025-06-14", count: 37, lastVisitAt: … }
 *
 * Each document is auto-created on the first visit of the day; every
 * subsequent first-of-day visit from a new browser increments `count`.
 * Failures (access pending, offline) are ignored quietly — counting is
 * nice-to-have, never site-breaking.
 */
export function recordVisit(): void {
  if (!db || typeof window === 'undefined') return;

  const day = todayKey();

  try {
    if (localStorage.getItem(STORAGE_KEY) === day) return; // already counted today
  } catch {
    return; // storage blocked — stay quietly uncounted rather than spam writes
  }

  setDoc(
    doc(db, 'visitors', day),
    {
      date: day,
      count: increment(1),
      lastVisitAt: serverTimestamp(),
    },
    { merge: true },
  )
    .then(() => {
      try {
        localStorage.setItem(STORAGE_KEY, day);
      } catch {
        /* ignore */
      }
    })
    .catch((error) => {
      console.warn('[acetix] Visitor counter skipped (access pending?).', error);
    });
}
