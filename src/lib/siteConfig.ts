import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Site-wide, owner-editable configuration.
 * ─────────────────────────────────────────
 * Lives in the cloud database at:  siteConfig/site
 *
 * Change contact channels (WhatsApp, Telegram, GitHub, email…) right from
 * the backend console — no redeploy needed. Anything missing simply falls
 * back to the defaults below, so the site never looks broken.
 */
export interface SiteConfig {
  email: string;
  whatsapp: string; // digits with country code, or a full https://wa.me/… link
  telegram: string; // @username or a full https://t.me/… link
  github: string; // username or a full https://github.com/… link
  facebook: string; // optional extras — shown only when filled
  linkedin: string;
  discord: string;
  website: string;
  responseTime: string;
}

/* No demo links — everything starts empty; whatever is set in the
   cloud `siteConfig/site` document is what the website shows. */
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  email: '',
  whatsapp: '',
  telegram: '',
  github: '',
  facebook: '',
  linkedin: '',
  discord: '',
  website: '',
  responseTime:
    'Usually within 48 hours. Bug reports with clear steps to reproduce get fixed fastest.',
};

export type ConfigSource = 'firebase' | 'local';

interface ConfigState {
  config: SiteConfig;
  source: ConfigSource;
}

/* Single shared fetch — Footer, Contact etc. all reuse the same promise. */
let cache: ConfigState | null = null;
let inflight: Promise<ConfigState> | null = null;

function loadConfig(): Promise<ConfigState> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  if (!db) {
    cache = { config: DEFAULT_SITE_CONFIG, source: 'local' };
    return Promise.resolve(cache);
  }

  inflight = getDoc(doc(db, 'siteConfig', 'site'))
    .then((snap) => {
      cache = snap.exists()
        ? {
            config: { ...DEFAULT_SITE_CONFIG, ...(snap.data() as Partial<SiteConfig>) },
            source: 'firebase' as const,
          }
        : { config: DEFAULT_SITE_CONFIG, source: 'local' as const };
      return cache;
    })
    .catch((error) => {
      console.warn('[acetix] Could not load site config — using defaults.', error);
      cache = { config: DEFAULT_SITE_CONFIG, source: 'local' };
      return cache;
    });

  return inflight;
}

export function useSiteConfig(): ConfigState & { loading: boolean } {
  const [state, setState] = useState<ConfigState>(
    cache ?? { config: DEFAULT_SITE_CONFIG, source: 'local' },
  );
  const [loading, setLoading] = useState<boolean>(!cache && Boolean(db));

  useEffect(() => {
    let cancelled = false;
    loadConfig().then((result) => {
      if (!cancelled) {
        setState(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...state, loading };
}

/* ── Normalisation helpers ─────────────────────────────────────────── */

export function whatsappUrl(value: string): string {
  const v = value.trim();
  if (/^https?:\/\//.test(v)) return v;
  return `https://wa.me/${v.replace(/[^0-9]/g, '')}`;
}

export function telegramUrl(value: string): string {
  const v = value.trim();
  if (/^https?:\/\//.test(v)) return v;
  return `https://t.me/${v.replace(/^@/, '')}`;
}

export function githubUrl(value: string): string {
  const v = value.trim();
  if (/^https?:\/\//.test(v)) return v;
  return `https://github.com/${v.replace(/^@/, '')}`;
}

export function telegramHandle(value: string): string {
  const stripped = value
    .trim()
    .replace(/^https?:\/\/(www\.)?t\.me\//, '')
    .replace(/^@/, '')
    .replace(/\/$/, '');
  return `@${stripped}`;
}

export function githubHandle(value: string): string {
  const stripped = value
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
    .replace(/\/$/, '');
  return stripped.startsWith('@') ? stripped : `@${stripped}`;
}
