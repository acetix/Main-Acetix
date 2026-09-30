import { useEffect, useState } from 'react';
import { collection, getDocs, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { asDate } from './dates';
import { normalizeCategoryId } from './projects';
import type { Project } from './types';

export type ProjectSource = 'firebase' | 'local';

/**
 * What the catalogue is really backed by right now:
 *   live    — documents are being read from the cloud database
 *   empty   — the backend is readable, but `projects` has no documents yet
 *   blocked — the backend refused the read (access offline/misconfigured…)
 *   local   — backend config missing
 *
 * There is intentionally NO bundled demo catalogue: every card on the
 * site comes from the cloud database, and nowhere else.
 */
export type ProjectsState = 'live' | 'empty' | 'blocked' | 'local';

interface ProjectsData {
  projects: Project[];
  state: ProjectsState;
}

/* Single shared fetch — Home, Projects page, Footer etc. reuse one read. */
let cache: ProjectsData | null = null;
let inflight: Promise<ProjectsData> | null = null;

function normalize(docs: QueryDocumentSnapshot<DocumentData>[]): Project[] {
  const items = docs.map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    const slug =
      typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : docSnap.id;
    const shortDescription =
      typeof data.shortDescription === 'string' ? data.shortDescription : '';
    return {
      ...data,
      id: slug,
      title:
        typeof data.title === 'string' && data.title.trim()
          ? data.title
          : 'Untitled project',
      shortDescription,
      fullDescription:
        typeof data.fullDescription === 'string' && data.fullDescription.trim()
          ? data.fullDescription
          : shortDescription,
      projectUrl: typeof data.projectUrl === 'string' ? data.projectUrl : '#',
      imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
      category:
        typeof data.category === 'string' && data.category.trim()
          ? normalizeCategoryId(data.category)
          : 'everyday',
      tags: Array.isArray(data.tags)
        ? data.tags.filter((t): t is string => typeof t === 'string')
        : [],
      features: Array.isArray(data.features)
        ? data.features.filter((f): f is string => typeof f === 'string')
        : undefined,
      status:
        data.status === 'beta' || data.status === 'building'
          ? data.status
          : ('live' as const),
      featured: Boolean(data.featured),
      like: typeof data.like === 'number' && data.like > 0 ? Math.floor(data.like) : 0,
      dislike: typeof data.dislike === 'number' && data.dislike > 0 ? Math.floor(data.dislike) : 0,
    } as Project;
  });
  const newest = (p: Project) => asDate(p.createdAt)?.getTime() ?? 0;
  items.sort(
    (a, b) => newest(b) - newest(a) || (b.like ?? 0) - (a.like ?? 0) || a.title.localeCompare(b.title),
  );
  return items;
}

function load(): Promise<ProjectsData> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  if (!db) {
    cache = { projects: [], state: 'local' };
    return Promise.resolve(cache);
  }

  inflight = (async () => {
    try {
      const snapshot = await getDocs(collection(db!, 'projects'));
      cache = snapshot.empty
        ? { projects: [], state: 'empty' }
        : { projects: normalize(snapshot.docs), state: 'live' };
    } catch (error) {
      console.warn('[acetix] Cloud catalogue read failed.', error);
      cache = { projects: [], state: 'blocked' };
    }
    return cache!;
  })();

  return inflight;
}

export function useProjects() {
  const [data, setData] = useState<ProjectsData>(cache ?? { projects: [], state: 'local' });
  const [loading, setLoading] = useState<boolean>(!cache && Boolean(db));

  useEffect(() => {
    let cancelled = false;
    load().then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    projects: data.projects,
    state: data.state,
    loading,
    source: (data.state === 'live' ? 'firebase' : 'local') as ProjectSource,
  };
}
