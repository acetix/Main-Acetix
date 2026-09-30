import { AlertTriangle, Database, HardDrive } from 'lucide-react';
import { firebaseEnabled } from '../lib/firebase';
import type { ProjectsState } from '../lib/useProjects';

interface DataSourceBadgeProps {
  dark?: boolean;
  state?: ProjectsState;
}

/**
 * Live indicator of where the catalogue is actually served from — not a
 * guess based on config, but the real read result:
 *   live    → emerald «Live from cloud»
 *   empty   → amber   «No data yet — check back soon»
 *   blocked → red     «Sync needed — check back soon»
 *   local   → amber   «Demo data»
 */
export default function DataSourceBadge({ dark = false, state }: DataSourceBadgeProps) {
  const base =
    'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium';

  const effective: ProjectsState = state ?? (firebaseEnabled ? 'live' : 'local');

  if (effective === 'live') {
    return (
      <span
        className={`${base} ${
          dark
            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
            : 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <Database className="h-3.5 w-3.5" />
        Live from cloud
      </span>
    );
  }

  if (effective === 'empty') {
    return (
      <span
        className={`${base} ${
          dark
            ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
            : 'border-amber-600/30 bg-amber-500/10 text-amber-700'
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        <Database className="h-3.5 w-3.5" />
        No data yet — check back soon
      </span>
    );
  }

  if (effective === 'blocked') {
    return (
      <span
        className={`${base} ${
          dark
            ? 'border-red-400/30 bg-red-400/10 text-red-300'
            : 'border-red-600/30 bg-red-500/10 text-red-700'
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <AlertTriangle className="h-3.5 w-3.5" />
        Sync needed — check back soon
      </span>
    );
  }

  return (
    <span
      className={`${base} ${
        dark
          ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
          : 'border-amber-600/30 bg-amber-500/10 text-amber-700'
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      <HardDrive className="h-3.5 w-3.5" />
      Offline mode
    </span>
  );
}
