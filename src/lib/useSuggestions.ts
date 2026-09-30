import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { asDate } from './dates';
import type { Suggestion, SuggestionStatus } from './types';

export type SuggestionSource = 'firebase' | 'local';

const VALID_STATUSES: SuggestionStatus[] = ['new', 'planned', 'building', 'shipped'];

export interface SuggestionInput {
  name: string;
  title: string;
  category: string;
  description: string;
}

function mapDoc(id: string, data: Record<string, unknown>): Suggestion {
  const status = VALID_STATUSES.includes(data.status as SuggestionStatus)
    ? (data.status as SuggestionStatus)
    : 'new';
  return {
    id,
    title: typeof data.title === 'string' ? data.title : 'Untitled idea',
    description: typeof data.description === 'string' ? data.description : '',
    category: typeof data.category === 'string' && data.category ? data.category : 'Something else',
    name: typeof data.name === 'string' ? data.name.trim() : '',
    status,
    createdAt: asDate(data.createdAt),
  };
}

/**
 * The public suggestion box.
 * Reads every document from the `suggestions` collection (newest first)
 * and writes fresh suggestions straight back to the cloud database.
 * Submissions are prepended optimistically so the author sees their
 * idea instantly.
 */
export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [source, setSource] = useState<SuggestionSource>(db ? 'firebase' : 'local');
  const [loading, setLoading] = useState<boolean>(Boolean(db));
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!db) return;
    let cancelled = false;

    (async () => {
      try {
        const q = query(collection(db, 'suggestions'), limit(80));
        const snapshot = await getDocs(q);
        if (!cancelled) {
          const items = snapshot.docs.map((docSnap) =>
            mapDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
          );
          items.sort(
            (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
          );
          setSuggestions(items);
          setSource('firebase');
        }
      } catch (error) {
        console.warn('[acetix] Could not load suggestions.', error);
        if (!cancelled) {
          setSource('local');
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function submitSuggestion(input: SuggestionInput): Promise<'firebase' | 'demo'> {
    const optimistic: Suggestion = {
      id: `local-${Date.now()}`,
      title: input.title,
      description: input.description,
      category: input.category,
      name: input.name.trim(),
      status: 'new',
      createdAt: new Date(),
    };

    if (!db) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSuggestions((prev) => [optimistic, ...prev]);
      return 'demo';
    }

    await addDoc(collection(db, 'suggestions'), {
      name: input.name.trim(),
      title: input.title,
      category: input.category,
      description: input.description,
      status: 'new' satisfies SuggestionStatus,
      createdAt: serverTimestamp(),
    });
    setSuggestions((prev) => [optimistic, ...prev]);
    return 'firebase';
  }

  return { suggestions, loading, source, loadError, submitSuggestion };
}
