import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { parseLocalePath } from './locale';

const SITE = 'acetix.xyz';

/**
 * Canonical path for SEO: strips any acetix.xyz/<location> prefix so
 * locale mirrors (e.g. /bd-dhaka/projects/x) never create duplicate URLs.
 * All locale variants canonicalize to the same unprefixed URL.
 */
export function canonicalPathFor(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  const { effectivePath } = parseLocalePath(path);
  if (effectivePath.length > 1 && effectivePath.endsWith('/')) {
    return effectivePath.slice(0, -1);
  }
  return effectivePath || '/';
}

/**
 * Minimal per-route SEO: keeps <title>, meta description, canonical URL
 * and the OG/Twitter URL+title tags in sync on every client-side
 * navigation, so crawlers and link previews see the right page.
 * (Seobility-style basics: unique title ≤ ~60 chars, description
 * ~150–160 chars, one canonical per URL.)
 *
 * SEO-safe routing: `path` may be a locale-prefixed URL at runtime —
 * canonical + og:url always collapse to the unprefixed canonical, so
 * acetix.xyz/<location>/tool-url mirrors never cause duplicate-URL issues.
 * An hreflang="x-default" alternate points at the same canonical.
 */
export function usePageSeo(title: string, description: string, path: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const fullTitle = `${title} — ${SITE}`;
    document.title = fullTitle;

    const canonicalPath = canonicalPathFor(path);
    const url = `https://acetix.xyz${canonicalPath}`;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // hreflang x-default → the same canonical (locale mirrors are
    // alternate views, not separate content).
    let hreflang = document.head.querySelector<HTMLLinkElement>(
      'link[rel="alternate"][hreflang="x-default"]',
    );
    if (!hreflang) {
      hreflang = document.createElement('link');
      hreflang.setAttribute('rel', 'alternate');
      hreflang.setAttribute('hreflang', 'x-default');
      document.head.appendChild(hreflang);
    }
    hreflang.setAttribute('href', url);

    // Locale mirrors must not be indexed as separate pages — decide from
    // the *live* URL, not the static path arg, since the same component
    // renders both /projects/x and /bd-dhaka/projects/x.
    const { locale } = parseLocalePath(pathname);
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const baseRobots = 'index, follow, max-image-preview:large';
    if (locale) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', `noindex, follow, max-image-preview:large`);
    } else if (robots) {
      robots.setAttribute('content', baseRobots);
    }
  }, [title, description, path, pathname]);
}
