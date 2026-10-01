import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Newspaper, Search, SearchX } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import Reveal from '../components/Reveal';
import SkeletonCard from '../components/SkeletonCard';
import { usePageSeo } from '../lib/usePageSeo';
import { useBlogs } from '../lib/useBlogs';

export default function Blog() {
  usePageSeo(
    'Blog — notes, tutorials & updates',
    'The acetix blog: tutorials, release notes and small essays. Each article body loads from its linked JSON file.',
    '/blog',
  );
  const { blogs, loading, state } = useBlogs();
  // Re-resolve every render so links keep the current /<location> prefix.
  useLocation();
  const [queryText, setQueryText] = useState('');

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) =>
      `${b.title} ${b.shortDescription} ${b.category} ${b.tags.join(' ')}`
        .toLowerCase()
        .includes(q),
    );
  }, [blogs, queryText]);

  return (
    <div className="mx-auto max-w-6xl min-w-0 overflow-x-clip px-6 pb-24 pt-32 md:pt-40">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
          Blog
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Notes from the workshop.
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-smoke">
          Tutorials, release notes and small essays. Each card opens the full
          article — the body streams in from its linked JSON file.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8 flex items-center gap-3 border-y border-ink/10 py-5">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" />
            <input
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search articles, topics, tags…"
              aria-label="Search articles"
              className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <span className="hidden shrink-0 items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-xs font-semibold text-smoke sm:inline-flex">
            <Newspaper className="h-4 w-4 text-brand" />
            {loading ? '…' : `${blogs.length} article${blogs.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </Reveal>

      {(state === 'empty' || state === 'blocked') && !loading && (
        <Reveal>
          <div className="mt-8 rounded-3xl border border-amber-500/30 bg-amber-50 px-6 py-6">
            <p className="font-display text-lg font-bold text-amber-900">
              {state === 'blocked'
                ? 'Articles are syncing — please check back soon'
                : 'No articles here yet'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800/90">
              {state === 'blocked'
                ? 'The blog list is temporarily unavailable. Please refresh in a moment.'
                : 'New articles are on the way — the first post will appear here automatically.'}
            </p>
          </div>
        </Reveal>
      )}

      {loading ? (
        <div className="mt-12 grid min-w-0 grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-12 grid min-w-0 grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
          {filtered.map((blog, i) => (
            <Reveal key={blog.id} delay={Math.min(i, 5) * 0.06}>
              <BlogCard blog={blog} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-ink/10 bg-sand/50 px-6 py-20 text-center">
          <SearchX className="h-10 w-10 text-smoke" />
          <p className="font-display text-xl font-bold">
            {blogs.length === 0 ? 'The blog is empty for now' : 'No articles match that search'}
          </p>
          <p className="max-w-sm text-sm text-smoke">
            {blogs.length === 0
              ? 'Everything here comes straight from the cloud database — add an article there and it appears on this page automatically.'
              : 'Try a different keyword to find what you are looking for.'}
          </p>
          {blogs.length > 0 && (
            <button
              type="button"
              onClick={() => setQueryText('')}
              className="mt-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-brand"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
