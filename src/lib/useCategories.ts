import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { categoryLabel, normalizeCategoryId } from './projects';
import type { Project } from './types';

export interface CategoryItem {
  id: string;
  label: string;
}

let firestoreCache: CategoryItem[] | null = null;
let inflight: Promise<CategoryItem[] | null> | null = null;

/**
 * Reads the `categories` collection once per session.
 * Each document: id = category slug (e.g. `android`), fields:
 *   label  (string, pretty name shown in the filter)
 *   order  (number, optional — smaller first)
 *   slug   (string, optional — overrides the document id)
 */
function loadFromFirestore(): Promise<CategoryItem[] | null> {
  if (firestoreCache) return Promise.resolve(firestoreCache);
  if (inflight) return inflight;

  if (!db) return Promise.resolve(null);

  inflight = (async () => {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      if (snapshot.empty) return null;

      const rows = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        const raw =
          typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : docSnap.id;
        const id = normalizeCategoryId(raw) || 'everyday';
        return {
          id,
          label:
            typeof data.label === 'string' && data.label.trim()
              ? data.label
              : categoryLabel(id),
          order: typeof data.order === 'number' ? data.order : 9999,
        };
      });
      rows.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
      firestoreCache = rows.map(({ id, label }) => ({ id, label }));
      return firestoreCache;
    } catch (error) {
      console.warn('[acetix] Categories unreadable — deriving from projects.', error);
      return null;
    }
  })();

  return inflight;
}

/**
 * The category filter list for the Projects page.
 * Priority: cloud `categories` collection → auto-derived from the
 * loaded projects' `category` fields. "All" is always pinned first.
 */
export function useCategories(projects: Project[]): CategoryItem[] {
  const [fromFirestore, setFromFirestore] = useState<CategoryItem[] | null>(firestoreCache);

  useEffect(() => {
    let cancelled = false;
    loadFromFirestore().then((items) => {
      if (!cancelled && items) setFromFirestore(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    const derived = Array.from(
      new Set(
        projects
          .map((p) => normalizeCategoryId(p.category ?? ''))
          .filter((id) => Boolean(id)),
      ),
    ).map((id) => ({ id, label: categoryLabel(id) }));
    if (!fromFirestore || fromFirestore.length === 0) {
      return [{ id: 'all', label: 'All' }, ...derived];
    }
    // Union of the cloud list and any slugs found only on projects,
    // so a mismatch never yields an empty filter result. Id and label are
    // both compared to avoid duplicate-looking filter entries.
    const taken = new Set<string>();
    fromFirestore.forEach((c) => {
      taken.add(c.id);
      taken.add(normalizeCategoryId(c.label));
    });
    const extras = derived.filter(
      (c) => !taken.has(c.id) && !taken.has(normalizeCategoryId(c.label)),
    );
    extras.sort((a, b) => a.label.localeCompare(b.label));
    return [{ id: 'all', label: 'All' }, ...fromFirestore, ...extras];
  }, [fromFirestore, projects]);
}
