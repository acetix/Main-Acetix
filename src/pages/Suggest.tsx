import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Inbox,
  Lightbulb,
  Loader2,
  Send,
  UserRound,
} from 'lucide-react';
import Reveal from '../components/Reveal';
import { usePageSeo } from '../lib/usePageSeo';
import { timeAgo } from '../lib/dates';
import { useSuggestions } from '../lib/useSuggestions';
import type { Suggestion, SuggestionStatus } from '../lib/types';

const IDEA_CATEGORIES = ['Suggest tool', 'General feedback', 'Bug report'];

const STATUS_META: Record<SuggestionStatus, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-sky-500/15 text-sky-700 border-sky-500/30' },
  planned: { label: 'Planned', cls: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  building: { label: 'Building', cls: 'bg-violet-500/15 text-violet-700 border-violet-500/30' },
  shipped: { label: 'Shipped ✓', cls: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
};

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

export default function Suggest() {
  usePageSeo(
    'Suggest a tool — community wishlist',
    'Suggest the next acetix tool: converters, utilities and workflow helpers. Good ideas land on the public wishlist.',
    '/suggest',
  );
  const { suggestions, loading, source, loadError, submitSuggestion } = useSuggestions();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const preselected =
    categoryParam && IDEA_CATEGORIES.includes(categoryParam)
      ? categoryParam
      : IDEA_CATEGORIES[0];

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(preselected);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [via, setVia] = useState<'firebase' | 'demo' | null>(null);
  const [touched, setTouched] = useState(false);

  const formValid = title.trim().length > 2 && description.trim().length > 9;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!formValid || status === 'sending') return;

    setStatus('sending');
    try {
      const result = await submitSuggestion({
        name,
        title: title.trim(),
        category,
        description: description.trim(),
      });
      setVia(result);
      setStatus('sent');
    } catch (error) {
      console.error('[acetix] Failed to submit suggestion', error);
      setStatus('error');
    }
  }

  function reset() {
    setName('');
    setTitle('');
    setCategory(IDEA_CATEGORIES[0]);
    setDescription('');
    setTouched(false);
    setStatus('idle');
    setVia(null);
  }

  return (
    <div className="mx-auto max-w-6xl overflow-x-clip px-6 pb-24 pt-32 md:pt-40">
      {/* Header */}
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
          The suggestion box
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Your idea could be the{' '}
          <span className="bg-gradient-to-r from-brand via-ember to-sun bg-clip-text text-transparent">
            next acetix tool.
          </span>
        </h1>
        <p className="mt-5 max-w-xl leading-relaxed text-smoke">
          Tell me what keeps wasting your time — a repetitive task, a missing
          converter, a fiddly workflow. Bug reports and security issues belong
          here too. Good ideas land on the public wishlist below and get built
          in the open.
        </p>
      </Reveal>

      {/* Form */}
      <Reveal delay={0.08} className="max-w-3xl">
        <div className="mt-12 rounded-3xl border border-ink/10 bg-white p-7 md:p-10">
          {status === 'sent' ? (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </span>
              <h2 className="font-display text-2xl font-bold">Idea received — live below.</h2>
              <p className="max-w-sm text-sm leading-relaxed text-smoke">
                {via === 'firebase'
                  ? 'Saved to the cloud database and already showing in the wishlist. I review every single one.'
                  : 'Demo mode saved your idea locally only. Once the backend rules allow writes, ideas persist for everyone.'}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-brand"
                >
                  Suggest another
                </button>
                <a
                  href="#wishlist"
                  className="rounded-full border border-ink/20 px-6 py-2.5 text-sm font-semibold transition hover:border-ink"
                >
                  See the wishlist ↓
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">
                    Your name <span className="font-normal text-smoke">(optional)</span>
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anonymous ideas are fine too"
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    {IDEA_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold">Tool name or idea title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Batch image watermark remover"
                  className="mt-2 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                {touched && title.trim().length <= 2 && (
                  <span className="mt-1.5 block text-xs text-brand">Give the idea a short title.</span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold">What should it do?</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Describe the problem: what you do today, what hurts, and what the tool should make instant…"
                  className="mt-2 w-full resize-y rounded-2xl border border-ink/15 bg-paper px-4 py-3.5 text-base leading-relaxed outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                {touched && description.trim().length <= 9 && (
                  <span className="mt-1.5 block text-xs text-brand">
                    A sentence or two about the problem helps a lot.
                  </span>
                )}
              </label>

              {status === 'error' && (
                <p className="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-brand">
                  Something went wrong while saving. Check the backend access
                  rules for the suggestions collection, then try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-ember px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    Add to the wishlist
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </Reveal>

      {/* Wishlist */}
      <section id="wishlist" className="mt-20 min-w-0 max-w-full scroll-mt-28 overflow-x-clip">
        <Reveal className="min-w-0 max-w-full">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                Community wishlist
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                What people are wishing for
              </h2>
            </div>
            <p className="pb-1 text-sm text-smoke">
              {loading
                ? 'Loading ideas…'
                : `${suggestions.length} idea${suggestions.length === 1 ? '' : 's'} so far`}
              {!loading && source === 'firebase' && (
                <span className="block text-xs text-emerald-600">Live from the cloud</span>
              )}
            </p>
          </div>
        </Reveal>

        {loadError ? (
          <Reveal delay={0.05} className="min-w-0">
            <div className="mt-10 rounded-3xl border border-amber-500/30 bg-amber-50 px-6 py-6">
              <p className="font-display font-bold text-amber-900">
                Previous suggestions could not be loaded
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-amber-800/90">
                Allow public reads on the <code className="rounded bg-white/70 px-1.5 py-0.5">suggestions</code>{' '}
                collection (<code className="rounded bg-white/70 px-1.5 py-0.5">allow read: if true;</code>{' '})
                in your backend access rules and this public wishlist will appear. New submissions still work fine.
              </p>
            </div>
          </Reveal>
        ) : loading ? (
          <div className="mt-10 grid min-w-0 max-w-full grid-cols-1 gap-5 md:grid-cols-2 [&>*]:min-w-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-ink/10 bg-white p-7">
                <div className="h-5 w-1/2 rounded-full bg-sand" />
                <div className="mt-4 h-4 w-full rounded-full bg-sand" />
                <div className="mt-2 h-4 w-5/6 rounded-full bg-sand" />
                <div className="mt-6 h-4 w-32 rounded-full bg-sand" />
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="mt-10 grid min-w-0 max-w-full grid-cols-1 gap-5 md:grid-cols-2 [&>*]:min-w-0">
            {suggestions.map((idea, i) => (
              <Reveal key={idea.id} delay={Math.min(i, 5) * 0.05} className="min-w-0 max-w-full">
                <SuggestionCard idea={idea} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={0.05} className="min-w-0">
            <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-ink/20 px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sand">
                <Inbox className="h-6 w-6 text-smoke" />
              </span>
              <p className="font-display text-xl font-bold">The wishlist is empty</p>
              <p className="max-w-sm text-sm text-smoke">
                Be the first — every acetix tool started as somebody's slow
                Tuesday. Yours could be next.
              </p>
              <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-ember px-4 py-2 text-xs font-bold text-white">
                <Lightbulb className="h-3.5 w-3.5" /> Fill the form above
              </span>
            </div>
          </Reveal>
        )}
      </section>
    </div>
  );
}

/**
 * Wishlist card. Long descriptions are clamped so the grid stays evenly
 * sized; a Read more / Show less toggle expands in place. Long words and
 * URLs wrap or scroll safely so cards never push the page wider.
 */
function SuggestionCard({ idea }: { idea: Suggestion }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = idea.description.length > 320;

  return (
    <article className="flex h-full min-w-0 max-w-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white p-7 transition-shadow duration-300 hover:shadow-xl hover:shadow-ink/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            {idea.category}
          </p>
          <h3 className="mt-2 min-w-0 break-words break-all font-display text-xl font-bold tracking-tight">
            {idea.title}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${STATUS_META[idea.status].cls}`}
        >
          {STATUS_META[idea.status].label}
        </span>
      </div>

      <div className="mt-3 min-w-0 flex-1">
        <p
          className={`min-w-0 break-words break-all text-base leading-relaxed text-smoke ${
            expanded ? '' : 'line-clamp-6'
          }`}
        >
          {idea.description}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-xs font-bold text-brand transition hover:underline"
          >
            {expanded ? 'Show less' : 'Read more →'}
          </button>
        )}
      </div>

      <div className="mt-5 flex min-w-0 items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs text-smoke">
        <span className="inline-flex min-w-0 items-center gap-2">
          <UserRound className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{idea.name || 'Anonymous'}</span>
        </span>
        <span className="shrink-0">{timeAgo(idea.createdAt)}</span>
      </div>
    </article>
  );
}
