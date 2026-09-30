import { useLocation, type To } from 'react-router-dom';
import { parseLocalePath } from './locale';

/**
 * Locale-aware link target: keeps the current acetix.xyz/<location>
 * prefix on in-app navigation ("/projects" → "/bd/projects" while the
 * visitor is on a /bd/* page). Plain "/" targets and external URLs pass
 * through untouched.
 */
export function localizedTo(target: To): To {
  if (typeof window === 'undefined' || typeof target !== 'string') return target;
  if (!target.startsWith('/')) return target;
  const { locale } = parseLocalePath(window.location.pathname);
  if (!locale) return target;
  if (parseLocalePath(target).locale) return target;
  return target === '/' ? `/${locale}/` : `/${locale}${target}`;
}

/** Current locale code from the URL (e.g. "bd"), or null on plain URLs. */
export function useLocale(): string | null {
  const { pathname } = useLocation();
  return parseLocalePath(pathname).locale;
}
