import { useState } from 'react';
import type { Project } from '../lib/types';
import { projectAccent } from '../lib/projects';

interface ProjectImageProps {
  project: Project;
  className?: string;
}

/**
 * Project screenshots come from direct image URLs (managed in the cloud
 * database, never uploaded to Storage). If a link is missing or fails to
 * load, a gradient tile with the project's initial keeps the layout intact.
 */
export default function ProjectImage({ project, className = '' }: ProjectImageProps) {
  const [failed, setFailed] = useState(false);

  if (!project.imageUrl || failed) {
    return (
      <div
        role="img"
        aria-label={project.title}
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${projectAccent(project)} ${className}`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <img src="/favicon.svg" alt="" aria-hidden="true" className="relative h-14 w-14 opacity-95 drop-shadow-lg" />
      </div>
    );
  }

  return (
    <img
      src={project.imageUrl}
      alt={`${project.title} interface`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
