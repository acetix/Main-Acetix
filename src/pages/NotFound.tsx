import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { localizedTo } from '../lib/useLocalizedLink';
import { usePageSeo } from '../lib/usePageSeo';

export default function NotFound() {
  // Re-resolve every render so links keep the current /<location> prefix.
  useLocation();
  usePageSeo(
    'Page not found',
    'The page you are after does not exist — browse the acetix collection of free web tools instead.',
    '/404',
  );
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-24 pt-40 text-center md:pt-48">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-sun">
        <Compass className="h-8 w-8 text-white" />
      </span>
      <p className="mt-8 font-display text-7xl font-bold tracking-tight">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
        This is not a tool (yet).
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-smoke">
        The page you are after does not exist — it may have moved, or it is
        still an idea waiting to be built.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to={localizedTo('/')}
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-brand"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back home
        </Link>
        <Link
          to={localizedTo("/projects")}
          className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold transition hover:border-ink"
        >
          Browse all tools
        </Link>
      </div>
    </div>
  );
}
