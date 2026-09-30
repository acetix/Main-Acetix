import { useState } from 'react';
import { Database, X } from 'lucide-react';
import type { ProjectsState } from '../lib/useProjects';

interface CatalogueNoticeProps {
  state: ProjectsState;
}

/**
 * Shown on the Projects page while the catalogue is NOT live — a short,
 * visitor-friendly note with no backend details. Dismisses itself once
 * the catalogue serves data.
 */
export default function CatalogueNotice({ state }: CatalogueNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || (state !== 'empty' && state !== 'blocked')) return null;

  return (
    <div className="mt-8 rounded-3xl border border-amber-500/30 bg-amber-50 px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15">
            <Database className="h-5 w-5 text-amber-600" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-amber-900">
              {state === 'blocked'
                ? 'Projects are syncing — please check back soon'
                : 'The collection is empty for now'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800/90">
              {state === 'blocked'
                ? 'The project list is temporarily unavailable. Please refresh in a moment.'
                : 'New projects are on the way — please check back soon.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss notice"
          className="rounded-full p-1.5 text-amber-700 transition hover:bg-amber-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
