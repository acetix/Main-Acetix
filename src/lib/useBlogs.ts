import { useEffect, useState } from 'react';
import { collection, getDocs, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { asDate } from './dates';
import type { Blog } from './types';

export type BlogSource = 'firebase' | 'local';

/**
 * What the blog list is really backed by right now:
 *   live    — documents are being read from the cloud database
 *   empty   — the backend is readable, but `blogs` has no documents yet
 *   blocked — the backend refused the read (access offline/misconfigured…)
 *   local   — backend config missing
 *
 * There is intentionally NO bundled demo content: every article on the
 * site comes from the cloud database, and nowhere else.
 */
export type BlogsState = 'live' | 'empty' | 'blocked' | 'local';

interface BlogsData {
  blogs: Blog[];
  state: BlogsState;
}

/* Single shared fetch — Blog list, Blog detail etc. reuse one read. */
let cache: BlogsData | null = null;
let inflight: Promise<BlogsData> | null = null;

function normalize(docs: QueryDocumentSnapshot<DocumentData>[]): Blog[] {
  const items = docs.map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    const slug =
      typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : docSnap.id;
    return {
      ...data,
      id: slug,
      title:
        typeof data.title === 'string' && data.title.trim()
          ? data.title
          : 'Untitled article',
      shortDescription:
        typeof data.shortDescription === 'string' ? data.shortDescription : '',
      blogUrl: typeof data.blogUrl === 'string' ? data.blogUrl.trim() : '',
      imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl.trim() : '',
      category:
        typeof data.category === 'string' && data.category.trim()
          ? data.category.trim()
          : 'General',
      tags: Array.isArray(data.tags)
        ? data.tags.filter((t): t is string => typeof t === 'string')
        : [],
      featured: Boolean(data.featured),
      author: typeof data.author === 'string' ? data.author.trim() : '',
    } as Blog;
  });
  const newest = (b: Blog) => asDate(b.createdAt)?.getTime() ?? 0;
  items.sort(
    (a, b) => newest(b) - newest(a) || a.title.localeCompare(b.title),
  );
  return items;
}

function load(): Promise<BlogsData> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  if (!db) {
    cache = { blogs: [], state: 'local' };
    return Promise.resolve(cache);
  }

  inflight = (async () => {
    try {
      const snapshot = await getDocs(collection(db!, 'blogs'));
      cache = snapshot.empty
        ? { blogs: [], state: 'empty' }
        : { blogs: normalize(snapshot.docs), state: 'live' };
    } catch (error) {
      console.warn('[acetix] Cloud blog read failed.', error);
      cache = { blogs: [], state: 'blocked' };
    }
    return cache!;
  })();

  return inflight;
}

export function useBlogs() {
  const [data, setData] = useState<BlogsData>(cache ?? { blogs: [], state: 'local' });
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
    blogs: data.blogs,
    state: data.state,
    loading,
    source: (data.state === 'live' ? 'firebase' : 'local') as BlogSource,
  };
}
