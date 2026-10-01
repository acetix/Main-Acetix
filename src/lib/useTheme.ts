import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'acetix-theme-mode';

function applyDark(dark: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', dark);
}

/**
 * Persisted theme-mode hook (System → Bright → Dark cycle).
 * Defaults to "system" (mirrors the OS live, including changes made while
 * the tab is open); the choice persists via localStorage.
 */
export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system'
      ? stored
      : 'system';
  });

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () =>
      applyDark(mode === 'system' ? query.matches : mode === 'dark');
    apply();
    if (mode === 'system') {
      const onChange = () => apply();
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    }
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode =
        prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system';
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { mode, setMode, cycle };
}
