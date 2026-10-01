import { useState } from 'react';
import type { Project } from '../lib/types';
import { DEFAULT_PROJECT_ICON, projectIcon } from '../lib/projects';

interface ProjectLogoProps {
  project: Pick<Project, 'title' | 'iconUrl'>;
  className?: string;
}

/**
 * Project logo from the direct `iconUrl` link. Falls back to the site
 * favicon when the field is missing — or when the link fails to load.
 */
export default function ProjectLogo({ project, className = '' }: ProjectLogoProps) {
  const [failed, setFailed] = useState(false);
  const src = failed ? DEFAULT_PROJECT_ICON : projectIcon(project);

  return (
    <img
      src={src}
      alt={`${project.title} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
