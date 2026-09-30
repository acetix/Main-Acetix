import { useEffect } from 'react';

export type Theme = 'light' | 'dark';

function applyDark(dark: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', dark);
}

/**
 * System-only dark/bright mode — no toggle button anywhere.
 * Mirrors the OS `prefers-color-scheme` setting live, including changes
 * made while the tab is open. Run once at the app root.
 */
export function useSystemTheme() {
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    applyDark(query.matches);
    const onChange = (e: MediaQueryListEvent) => applyDark(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
}
