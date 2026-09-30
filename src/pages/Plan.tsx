import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Hourglass } from 'lucide-react';
import Reveal from '../components/Reveal';
import { localizedTo } from '../lib/useLocalizedLink';
import { usePageSeo } from '../lib/usePageSeo';

export default function Plan() {
  useLocation();
  usePageSeo(
    'Plan — roadmap coming soon',
    'The acetix plan page: upcoming pricing, roadmap and what ships next. Check back soon.',
    '/plan',
  );
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl min-w-0 flex-col items-center overflow-x-clip px-6 pb-24 pt-40 text-center md:pt-48">
      <Reveal>
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-sun">
          <Hourglass className="h-8 w-8 text-white" />
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h1 className="mt-8 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Cramming soon
        </h1>
        <p className="mt-4 max-w-md leading-relaxed text-smoke">
          The acetix plan page is still being shaped — pricing, roadmap and
          what is next will live here. Check back soon.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to={localizedTo('/projects')}
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-brand"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Browse projects
          </Link>
          <Link
            to={localizedTo('/')}
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold transition hover:border-ink"
          >
            Back home
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
