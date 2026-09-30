import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Clock,
  Flame,
  Lightbulb,
  Search,
  SearchX,
  SlidersHorizontal,
  ThumbsUp,
} from 'lucide-react';
import CatalogueNotice from '../components/CatalogueNotice';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import SkeletonCard from '../components/SkeletonCard';
import { usePageSeo } from '../lib/usePageSeo';
import { localizedTo } from '../lib/useLocalizedLink';
import { projectDomain, categoryMatches } from '../lib/projects';
import { asDate } from '../lib/dates';
import { useCategories } from '../lib/useCategories';
import { useProjects } from '../lib/useProjects';

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest uploads', icon: Clock },
  { id: 'liked', label: 'Most liked', icon: ThumbsUp },
  { id: 'both', label: 'Latest + Most liked', icon: Flame },
] as const;

type SortMode = (typeof SORT_OPTIONS)[number]['id'];

export default function Projects() {
  usePageSeo(
    'All projects — free web tools collection',
    'Browse every free acetix web tool in one collection. Filter by category, search by tag or domain, and sort by latest or most liked.',
    '/projects',
  );
  const { projects, loading, state } = useProjects();
  // Re-resolve every render so links keep the current /<location> prefix.
  useLocation();
  const categories = useCategories(projects);
  const [queryText, setQueryText] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sort, setSort] = useState<SortMode>('both');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = category !== 'all' || sort !== 'both';

  // Close the filter dropdown on outside click or Escape.
  useEffect(() => {
    if (!filterOpen) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFilterOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [filterOpen]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return projects.filter((p) => {
      // Match by category id/slug and by human-readable label, so the
      // chosen filter always loads its projects instead of showing empty.
      const inCategory = categoryMatches(p.category, category, categories);
      if (!q) return inCategory;
      const haystack =
        `${p.title} ${p.shortDescription} ${projectDomain(p)} ${p.tags.join(' ')}`.toLowerCase();
      return inCategory && haystack.includes(q);
    });
  }, [projects, queryText, category, categories]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const newest = (p: (typeof arr)[number]) => asDate(p.createdAt)?.getTime() ?? 0;
    const likes = (p: (typeof arr)[number]) => p.like ?? 0;

    if (sort === 'liked') {
      arr.sort((a, b) => likes(b) - likes(a) || newest(b) - newest(a) || a.title.localeCompare(b.title));
    } else if (sort === 'both') {
      // Combined rank: position in newest list + position in most-liked list.
      const newestRank = new Map<string, number>();
      [...arr].sort((a, b) => newest(b) - newest(a)).forEach((p, i) => newestRank.set(p.id, i));
      const likedRank = new Map<string, number>();
      [...arr].sort((a, b) => likes(b) - likes(a)).forEach((p, i) => likedRank.set(p.id, i));
      arr.sort(
        (a, b) =>
          newestRank.get(a.id)! + likedRank.get(a.id)! -
          (newestRank.get(b.id)! + likedRank.get(b.id)!),
      );
    } else {
      arr.sort((a, b) => newest(b) - newest(a) || likes(b) - likes(a) || a.title.localeCompare(b.title));
    }
    return arr;
  }, [filtered, sort]);

  return (
    <div className="mx-auto max-w-6xl min-w-0 overflow-x-clip px-6 pb-24 pt-20 md:pt-24">
      <h1 className="sr-only">All projects — acetix.xyz</h1>
      {/* Controls */}
      <Reveal delay={0.08}>
        <div className="mt-2 flex items-center gap-3 border-y border-ink/10 py-5">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" />
            <input
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search tools, tags, domains…"
              aria-label="Search projects"
              className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Categories + sort — everything inside the Filters dropdown. */}
          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              aria-label="Filter and sort projects"
              aria-expanded={filterOpen}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                filterOpen || hasActiveFilters
                  ? 'border-ink bg-ink text-paper'
                  : 'border-ink/15 bg-white text-smoke hover:border-ink/40 hover:text-ink'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && !filterOpen && (
                <span className="h-2 w-2 rounded-full bg-sun" />
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 z-30 mt-2.5 w-64 rounded-3xl border border-ink/10 bg-white p-3 shadow-xl shadow-ink/10"
                >
                  <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-smoke">
                    Category
                  </p>
                  <div className="mt-2 space-y-1">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                          category === c.id
                            ? 'bg-ink text-paper'
                            : 'text-smoke hover:bg-ink/5 hover:text-ink'
                        }`}
                      >
                        {c.label}
                        {category === c.id && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>

                  <div className="mx-3 my-3 h-px bg-ink/10" />

                  <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-smoke">
                    Sort by
                  </p>
                  <div className="mt-2 space-y-1">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSort(option.id)}
                        className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                          sort === option.id
                            ? 'bg-ink text-paper'
                            : 'text-smoke hover:bg-ink/5 hover:text-ink'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <option.icon className="h-3.5 w-3.5" />
                          {option.label}
                        </span>
                        {sort === option.id && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>

      <CatalogueNotice state={state} />

      {/* Grid */}
      {loading ? (
        <div className="mt-12 grid min-w-0 grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div className="mt-12 grid min-w-0 grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
          {sorted.map((project, i) => (
            <Reveal key={project.id} delay={Math.min(i, 5) * 0.06}>
              <ProjectCard project={project} />
            </Reveal>
          ))}

          {/* Suggest a tool */}
          <Reveal delay={Math.min(sorted.length, 5) * 0.06}>
            <Link
              to={localizedTo("/suggest")}
              className="group flex h-full min-h-[16rem] flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-ink/20 p-8 text-center transition hover:border-brand hover:bg-brand/5"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper transition group-hover:bg-brand">
                <Lightbulb className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-xl font-bold">Your idea here</p>
                <p className="mt-1.5 text-sm text-smoke">
                  Have a repetitive task? Drop it in the Suggestion Box.
                </p>
              </div>
            </Link>
          </Reveal>
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-ink/10 bg-sand/50 px-6 py-20 text-center">
          <SearchX className="h-10 w-10 text-smoke" />
          <p className="font-display text-xl font-bold">
            {projects.length === 0 ? 'The catalogue is empty for now' : 'No tools match that filter'}
          </p>
          <p className="max-w-sm text-sm text-smoke">
            {projects.length === 0
              ? 'Everything here comes straight from the cloud database — add a project there and it appears on this page automatically.'
              : 'Try a different keyword, or reset the filters to see the whole collection.'}
          </p>
          {projects.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQueryText('');
                setCategory('all');
              }}
              className="mt-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-brand"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
