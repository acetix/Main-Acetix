import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Terminal, Wrench, Palette } from 'lucide-react';
import Reveal from '../components/Reveal';
import { localizedTo } from '../lib/useLocalizedLink';
import { usePageSeo } from '../lib/usePageSeo';

const STACK = [
  'React 19',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'Cloud database',
  'Framer Motion',
  'WebAssembly codecs',
  'Progressive Web Apps',
];

const PILLARS = [
  {
    icon: Wrench,
    title: 'Tools that respect the task',
    copy: 'Every app starts from a real annoyance — a PDF that would not merge, a regex that would not behave. If it does not save minutes, it does not ship.',
  },
  {
    icon: Terminal,
    title: 'Developer-grade, human-friendly',
    copy: 'The dev tools keep up with professionals; the everyday tools need zero technical vocabulary. Same care, two dialects.',
  },
  {
    icon: Palette,
    title: 'Design is a feature',
    copy: 'A utility can be plain without being ugly. Typography, motion and colour are treated as part of the job, not decoration after it.',
  },
];

export default function About() {
  usePageSeo(
    'About — one developer, many small tools',
    'About acetix: one developer building free, privacy-first web tools for developers and everyday humans.',
    '/about',
  );
  // Re-resolve every render so links keep the current /<location> prefix.
  useLocation();
  return (
    <div className="min-w-0 overflow-x-clip pb-24 pt-32 md:pt-40">
      {/* Intro */}
      <section className="mx-auto min-w-0 max-w-6xl px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
            About acetix
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            One person, a browser, and a long list of ideas.
          </h1>
        </Reveal>

        <div className="mt-10 grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] [&>*]:min-w-0">
          <Reveal delay={0.08} className="min-w-0">
            <div className="space-y-5 leading-relaxed text-smoke">
              <p>
                I am a developer from Bangladesh who keeps bumping into small,
                annoying problems — converting one image, merging two PDFs,
                testing one regex — and the tools online always wanted an
                account, an upload, or my patience.
              </p>
              <p>
                So I started building my own. Each one lived on its own little
                domain, which made them hard to find and harder to share.{' '}
                <span className="font-semibold text-ink">
                  acetix.xyz gathers every project under one address
                </span>{' '}
                — a single front door to the whole family, with room for
                whatever gets built next.
              </p>
              <p>
                The stack is deliberately boring where it should be and
                ambitious where it counts: React and TypeScript for the
                interfaces, WebAssembly for heavy lifting in the browser, and
                a secure cloud service as the quiet backend that stores this
                catalogue and your messages.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.14} className="min-w-0">
            <div className="rounded-3xl border border-ink/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-smoke">
                What acetix is built with
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {STACK.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-ink/15 bg-paper px-3.5 py-1.5 text-xs font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-7 rounded-2xl bg-sand/70 p-5">
                <p className="font-display text-sm font-bold">Why ".xyz"?</p>
                <p className="mt-1.5 text-sm leading-relaxed text-smoke">
                  In algebra, x, y and z are the unknowns left to solve. acetix
                  exists to solve the small ones — so the domain felt honest.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto min-w-0 max-w-6xl px-6 py-24">
        <Reveal>
          <h2 className="max-w-xl font-display text-4xl font-bold tracking-tight md:text-5xl">
            What every acetix tool has in common
          </h2>
        </Reveal>
        <div className="mt-12 grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3 [&>*]:min-w-0">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-ink/10 bg-white p-8 transition-shadow duration-300 hover:shadow-xl hover:shadow-ink/5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-sun">
                  <pillar.icon className="h-6 w-6 text-white" />
                </span>
                <h3 className="mt-6 font-display text-xl font-bold">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-smoke">{pillar.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="min-w-0 px-6">
        <Reveal className="min-w-0">
          <div className="mx-auto min-w-0 max-w-6xl overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center md:py-20">
            <p className="mx-auto max-w-3xl font-display text-3xl font-bold leading-snug tracking-tight text-paper md:text-4xl">
              “Small tools, sharp edges,{' '}
              <span className="bg-gradient-to-r from-brand via-ember to-sun bg-clip-text text-transparent">
                honest software.
              </span>
              ”
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-paper/50">
              The acetix way
            </p>
          </div>
        </Reveal>
      </section>

      {/* CTA row */}
      <section className="mx-auto mt-16 flex min-w-0 max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            See what the workshop has shipped so far.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to={localizedTo("/projects")}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition hover:bg-brand"
            >
              All projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to={localizedTo("/contact")}
              className="group inline-flex items-center gap-2 rounded-full border border-ink/20 px-7 py-3.5 text-sm font-semibold transition hover:border-ink"
            >
              Say hello
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
