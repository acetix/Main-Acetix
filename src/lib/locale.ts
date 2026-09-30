/**
 * Locale-prefixed URLs: acetix.xyz/<location>/*.
 *
 * Privacy-friendly by design — no GPS, no permission prompt, nothing sent
 * to our servers. The location is derived from timezone / browser language
 * plus a lightweight IP lookup (country → city → region), refreshed
 * periodically while the tab is open. Nothing is persisted to any cache
 * file — each visit re-detects, so a traveller's URL always tracks their
 * current location. Canonical/SEO URLs stay unprefixed.
 */

export const KNOWN_TOP = [
  'projects',
  'suggest',
  'about',
  'contact',
  'privacy',
  'plan',
  'profile',
];

export interface LocaleInfo {
  /** URL segment, most detailed available: "bd-dhaka" or "bd". */
  code: string;
  country: string;
  city: string | null;
  region: string | null;
}

const SEG_RE = /^[a-z]{2}(?:-[a-z0-9]{2,24})?$/;
const COUNTRY_RE = /^[a-z]{2}$/;

/** Split "/bd-dhaka/projects/x" → { locale, effectivePath: "/projects/x" }. */
export function parseLocalePath(pathname: string): {
  locale: string | null;
  effectivePath: string;
} {
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return { locale: null, effectivePath: '/' };
  const first = parts[0].toLowerCase();
  if (!SEG_RE.test(first)) return { locale: null, effectivePath: pathname };
  const rest = parts.slice(1);
  if (rest.length === 0) return { locale: first, effectivePath: '/' };
  // /bd-dhaka/projects, /bd/suggest … plus /xx/<anything> (localized 404)
  return { locale: first, effectivePath: `/${rest.join('/')}` };
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

/** Common IANA timezone → country + city detail. */
const TIMEZONE_LOCALE: Record<string, { country: string; city: string | null }> = {
  'asia/dhaka': { country: 'bd', city: 'dhaka' },
  'asia/kolkata': { country: 'in', city: 'kolkata' },
  'asia/calcutta': { country: 'in', city: 'kolkata' },
  'asia/mumbai': { country: 'in', city: 'mumbai' },
  'asia/delhi': { country: 'in', city: 'delhi' },
  'asia/karachi': { country: 'pk', city: 'karachi' },
  'asia/lahore': { country: 'pk', city: 'lahore' },
  'asia/kathmandu': { country: 'np', city: 'kathmandu' },
  'asia/colombo': { country: 'lk', city: 'colombo' },
  'asia/dubai': { country: 'ae', city: 'dubai' },
  'asia/riyadh': { country: 'sa', city: 'riyadh' },
  'asia/doha': { country: 'qa', city: 'doha' },
  'asia/kuwait': { country: 'kw', city: 'kuwait-city' },
  'asia/singapore': { country: 'sg', city: 'singapore' },
  'asia/kuala_lumpur': { country: 'my', city: 'kuala-lumpur' },
  'asia/jakarta': { country: 'id', city: 'jakarta' },
  'asia/manila': { country: 'ph', city: 'manila' },
  'asia/bangkok': { country: 'th', city: 'bangkok' },
  'asia/hong_kong': { country: 'hk', city: 'hong-kong' },
  'asia/shanghai': { country: 'cn', city: 'shanghai' },
  'asia/beijing': { country: 'cn', city: 'beijing' },
  'asia/tokyo': { country: 'jp', city: 'tokyo' },
  'asia/seoul': { country: 'kr', city: 'seoul' },
  'asia/tehran': { country: 'ir', city: 'tehran' },
  'asia/baghdad': { country: 'iq', city: 'baghdad' },
  'asia/amman': { country: 'jo', city: 'amman' },
  'asia/istanbul': { country: 'tr', city: 'istanbul' },
  'europe/london': { country: 'gb', city: 'london' },
  'europe/paris': { country: 'fr', city: 'paris' },
  'europe/berlin': { country: 'de', city: 'berlin' },
  'europe/rome': { country: 'it', city: 'rome' },
  'europe/madrid': { country: 'es', city: 'madrid' },
  'europe/moscow': { country: 'ru', city: 'moscow' },
  'europe/kyiv': { country: 'ua', city: 'kyiv' },
  'africa/cairo': { country: 'eg', city: 'cairo' },
  'africa/lagos': { country: 'ng', city: 'lagos' },
  'africa/nairobi': { country: 'ke', city: 'nairobi' },
  'africa/johannesburg': { country: 'za', city: 'johannesburg' },
  'america/new_york': { country: 'us', city: 'new-york' },
  'america/chicago': { country: 'us', city: 'chicago' },
  'america/denver': { country: 'us', city: 'denver' },
  'america/los_angeles': { country: 'us', city: 'los-angeles' },
  'america/anchorage': { country: 'us', city: 'anchorage' },
  'pacific/honolulu': { country: 'us', city: 'honolulu' },
  'america/toronto': { country: 'ca', city: 'toronto' },
  'america/vancouver': { country: 'ca', city: 'vancouver' },
  'america/mexico_city': { country: 'mx', city: 'mexico-city' },
  'america/sao_paulo': { country: 'br', city: 'sao-paulo' },
  'america/buenos_aires': { country: 'ar', city: 'buenos-aires' },
  'australia/sydney': { country: 'au', city: 'sydney' },
  'australia/melbourne': { country: 'au', city: 'melbourne' },
  'pacific/auckland': { country: 'nz', city: 'auckland' },
};

function fromTimezone(): LocaleInfo | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const hit = TIMEZONE_LOCALE[tz.toLowerCase()];
    if (!hit) return null;
    return {
      code: hit.city ? `${hit.country}-${hit.city}` : hit.country,
      country: hit.country,
      city: hit.city,
      region: null,
    };
  } catch {
    return null;
  }
}

function fromLanguage(): LocaleInfo | null {
  try {
    const lang = (navigator.language || '').toLowerCase(); // e.g. "bn-bd"
    const m = lang.match(/^([a-z]{2,3})[-_]([a-z]{2})($|[-_])/);
    if (m && COUNTRY_RE.test(m[2]) && m[2] !== 'zz') {
      return { code: m[2], country: m[2], city: null, region: null };
    }
    return null;
  } catch {
    return null;
  }
}

interface IpApiResponse {
  country_code?: string;
  city?: string;
  region?: string;
}

/** Async detail: IP lookup returning country + city + region. */
async function fromIpLookup(signal?: AbortSignal): Promise<LocaleInfo | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as IpApiResponse;
    const country = (data.country_code || '').trim().toLowerCase();
    if (!COUNTRY_RE.test(country)) return null;
    const city = data.city ? slugify(data.city) : '';
    const region = (data.region || '').trim() || null;
    return {
      code: city ? `${country}-${city}` : country,
      country,
      city: city || null,
      region,
    };
  } catch {
    return null;
  }
}

/**
 * Full detection pass: fastest on-device signals first (timezone, then
 * language), IP lookup only when those give nothing. Never touches any
 * cache — every call re-detects the *current* location.
 */
export async function detectLocale(signal?: AbortSignal): Promise<LocaleInfo | null> {
  return fromTimezone() ?? fromLanguage() ?? (await fromIpLookup(signal));
}

/** Fast sync subset for the first paint (timezone → language only). */
export function detectLocalLocale(): string | null {
  if (typeof window === 'undefined') return null;
  return fromTimezone()?.code ?? fromLanguage()?.code ?? null;
}

/** Async subset kept for compatibility (full pass, no cache). */
export async function detectLocaleAsync(): Promise<string | null> {
  return (await detectLocale())?.code ?? null;
}

/** @deprecated Use detectLocale() — no cache is kept anymore. */
export function getCachedLocale(): string | null {
  return null;
}
