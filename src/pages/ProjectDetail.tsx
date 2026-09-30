import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import Reveal from '../components/Reveal';
import ProjectImage from '../components/ProjectImage';
import VoteButtons from '../components/VoteButtons';
import NotFound from './NotFound';
import { usePageSeo } from '../lib/usePageSeo';
import {
  categoryLabel,
  projectDomain,
  projectYear,
} from '../lib/projects';
import { localizedTo } from '../lib/useLocalizedLink';
import { useProjects } from '../lib/useProjects';
import type { Project } from '../lib/types';

const STATUS_STYLE: Record<Project['status'], string> = {
  live: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  beta: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  building: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
};

const STATUS_LABEL: Record<Project['status'], string> = {
  live: 'Live',
  beta: 'Public beta',
  building: 'In the works',
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjects();
  // Re-resolve every render so links keep the current /<location> prefix.
  useLocation();

  const index = projects.findIndex((p) => p.id === id);
  const project = index >= 0 ? projects[index] : undefined;

  usePageSeo(
    project ? `${project.title} — free web tool` : 'Project — free web tool',
    project
      ? `${project.title}: ${project.shortDescription}`.slice(0, 160)
      : 'Open a free acetix web tool: overview, features and live app link.',
    `/projects/${id ?? ''}`,
  );

  if (!project) {
    return <NotFound />;
  }

  const next = projects[(index + 1) % projects.length];
  const year = projectYear(project);
  const domain = projectDomain(project);
  const features = project.features ?? [];

  return (
    <div className="mx-auto max-w-6xl min-w-0 overflow-x-clip px-6 pb-24 pt-28 md:pt-36">
      {/* Back */}
      <Reveal>
        <Link
          to={localizedTo('/projects')}
          className="group inline-flex items-center gap-2 text-sm font-medium text-smoke transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          All projects
        </Link>
      </Reveal>

      {/* Header */}
      <Reveal delay={0.05}>
        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <span
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLE[project.status] ?? STATUS_STYLE.live}`}
          >
            {STATUS_LABEL[project.status] ?? project.status}
          </span>
          <span className="rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-smoke">
            {categoryLabel(project.category)}
          </span>
          {year && (
            <span className="rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-smoke">
              Since {year}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
              {project.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-smoke">
              {project.shortDescription}
            </p>
          </div>
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-ember px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:brightness-105"
          >
            Launch live app
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </Reveal>

      {/* Hero image */}
      <Reveal delay={0.12}>
        <div className="mt-12 overflow-hidden rounded-[2rem] border border-ink/10 shadow-xl shadow-ink/10">
          <ProjectImage project={project} className="aspect-[16/9] w-full object-cover" />
        </div>
      </Reveal>

      {/* Body */}
      <div className="mt-16 grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight">Overview</h2>
            <p className="mt-4 leading-relaxed text-smoke">{project.fullDescription}</p>
          </Reveal>

          {features.length > 0 && (
            <Reveal delay={0.08}>
              <h2 className="mt-12 font-display text-2xl font-bold tracking-tight">
                What it does
              </h2>
              <ul className="mt-6 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3.5 rounded-2xl border border-ink/10 bg-white px-5 py-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <span className="text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <Reveal delay={0.12}>
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-sand/60 px-6 py-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-brand" />
                <p className="text-sm font-medium">
                  Found a bug or have an idea for {project.title}?
                </p>
              </div>
              <Link
                to={localizedTo('/suggest')}
                className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-paper transition hover:bg-brand"
              >
                Send feedback
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Side card */}
        <Reveal delay={0.1} className="min-w-0">
          <aside className="h-fit min-w-0 rounded-3xl border border-ink/10 bg-white p-7 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-smoke">
              At a glance
            </p>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-ink/10 pb-3.5">
                <dt className="text-smoke">Status</dt>
                <dd className="font-semibold">{STATUS_LABEL[project.status] ?? project.status}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-ink/10 pb-3.5">
                <dt className="text-smoke">Category</dt>
                <dd className="font-semibold">{categoryLabel(project.category)}</dd>
              </div>
              {year && (
                <div className="flex items-center justify-between border-b border-ink/10 pb-3.5">
                  <dt className="text-smoke">Year</dt>
                  <dd className="font-semibold">{year}</dd>
                </div>
              )}
              <div className="border-b border-ink/10 pb-3.5">
                <dt className="text-smoke">Domain</dt>
                <dd className="mt-1 break-all font-display font-semibold text-brand">
                  {domain}
                </dd>
              </div>
              {project.tags.length > 0 && (
                <div>
                  <dt className="text-smoke">Stack & topics</dt>
                  <dd className="mt-2.5 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-sand px-3 py-1 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper transition hover:bg-brand"
            >
              Open {project.title}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <div className="mt-6 border-t border-ink/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-smoke">
                Rate this project
              </p>
              <div className="mt-3">
                <VoteButtons project={project} large />
              </div>
            </div>
          </aside>
        </Reveal>
      </div>

      {/* Next project */}
      {next && next.id !== project.id && (
        <Reveal>
          <Link
            to={localizedTo(`/projects/${next.id}`)}
            className="group mt-20 flex items-center justify-between gap-6 rounded-3xl bg-ink px-7 py-8 text-paper transition hover:bg-ink-2 md:px-10"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-paper/60">
                Next project
              </p>
              <p className="mt-2 font-display text-2xl font-bold md:text-3xl">
                {next.title}
              </p>
              <p className="mt-1 text-sm text-paper/60">{next.shortDescription}</p>
            </div>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-sun transition-transform duration-300 group-hover:translate-x-1.5">
              <ArrowRight className="h-6 w-6 text-white" />
            </span>
          </Link>
        </Reveal>
      )}
    </div>
  );
}
