import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../lib/types';
import { categoryLabel, projectDomain } from '../lib/projects';
import { localizedTo } from '../lib/useLocalizedLink';
import ProjectImage from './ProjectImage';
import VoteButtons from './VoteButtons';

const STATUS_STYLE: Record<Project['status'], string> = {
  live: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
  beta: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
  building: 'bg-sky-500/15 text-sky-800 border-sky-500/30',
};

const STATUS_LABEL: Record<Project['status'], string> = {
  live: 'Live',
  beta: 'Beta',
  building: 'Building',
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={localizedTo(`/projects/${project.id}`)} className="group block h-full min-w-0">
      <article className="flex h-full min-w-0 flex-col">
        <div className="relative min-w-0 overflow-hidden rounded-3xl border border-ink/10 bg-sand">
          <ProjectImage
            project={project}
            className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <span
            className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md ${STATUS_STYLE[project.status] ?? STATUS_STYLE.live}`}
          >
            {STATUS_LABEL[project.status] ?? project.status}
          </span>
          <span className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-ink text-paper opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            {categoryLabel(project.category)}
          </p>
          <div className="mt-2 flex min-w-0 items-baseline justify-between gap-3">
            <h3 className="min-w-0 break-words font-display text-xl font-bold tracking-tight">
              {project.title}
            </h3>
            <span className="shrink-0 text-xs text-smoke">{projectDomain(project)}</span>
          </div>
          <p className="mt-2 min-w-0 break-words text-sm leading-relaxed text-smoke">{project.shortDescription}</p>
          <div className="mt-4 flex min-w-0 items-center justify-between gap-3 pt-1">
            {project.tags.length > 0 ? (
              <div className="flex min-w-0 flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-ink/15 px-2.5 py-1 text-[11px] font-medium text-smoke"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <span />
            )}
            <VoteButtons project={project} />
          </div>
        </div>
      </article>
    </Link>
  );
}
