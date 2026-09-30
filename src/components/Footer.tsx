import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Github, Globe, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useProjects } from '../lib/useProjects';
import { localizedTo, useLocale } from '../lib/useLocalizedLink';
import { detectLocale, parseLocalePath } from '../lib/locale';
import {
  githubUrl,
  telegramUrl,
  useSiteConfig,
  whatsappUrl,
} from '../lib/siteConfig';

export default function Footer() {
  const year = new Date().getFullYear();
  const { projects } = useProjects();
  const { config } = useSiteConfig();
  // Re-resolve every render so links keep the current /<location> prefix.
  useLocation();

  const extras = [
    { label: 'Facebook', url: config.facebook },
    { label: 'LinkedIn', url: config.linkedin },
    { label: 'Discord', url: config.discord },
    { label: 'Website', url: config.website },
  ].filter((item) => item.url.trim().length > 0);

  return (
    <footer className="bg-ink text-paper/70">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to={localizedTo('/')} className="flex items-center gap-2.5">
              <img src="/favicon.svg" alt="" className="h-9 w-9" />
              <span className="font-display text-xl font-bold tracking-tight text-paper">
                acetix<span className="text-brand">.xyz</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              A growing family of free, privacy-first web tools — built for
              developers and everyday humans alike.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-paper">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="transition hover:text-paper" to={localizedTo('/')}>Home</Link></li>
              <li><Link className="transition hover:text-paper" to={localizedTo('/projects')}>All projects</Link></li>
              <li><Link className="transition hover:text-paper" to={localizedTo('/plan')}>Plan</Link></li>
              <li><Link className="transition hover:text-paper" to={localizedTo('/contact')}>Contact</Link></li>
            </ul>
          </div>

          {projects.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-paper">
                Tools
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {projects.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <Link className="transition hover:text-paper" to={localizedTo(`/projects/${p.id}`)}>
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-paper">
              Elsewhere
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {config.whatsapp.trim() && (
              <li>
                <a
                  href={whatsappUrl(config.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-paper"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </li>
              )}
              {config.telegram.trim() && (
              <li>
                <a
                  href={telegramUrl(config.telegram)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-paper"
                >
                  <Send className="h-4 w-4" /> Telegram
                </a>
              </li>
              )}
              {config.github.trim() && (
              <li>
                <a
                  href={githubUrl(config.github)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-paper"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </li>
              )}
              {config.email.trim() && (
              <li>
                <a
                  href={`mailto:${config.email}`}
                  className="inline-flex items-center gap-2 transition hover:text-paper"
                >
                  <Mail className="h-4 w-4" /> {config.email}
                </a>
              </li>
              )}
              {extras.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 transition hover:text-paper"
                  >
                    <Globe className="h-4 w-4" /> {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link className="inline-flex items-center gap-2 transition hover:text-paper" to={localizedTo('/privacy')}>
                  <Globe className="h-4 w-4" /> Privacy
                </Link>
              </li>
              <li>
                <Link className="inline-flex items-center gap-2 transition hover:text-paper" to={localizedTo('/about')}>
                  <Globe className="h-4 w-4" /> About
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-2 text-paper/50">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  All systems normal
                </span>
              </li>
              <li>
                <LocationSwitcher />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row">
          <p>© {year} acetix.xyz — All experiments reserved.</p>
          <p className="font-display tracking-wide">
            Built with React · TypeScript · Tailwind · Cloud
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Manual location switcher: lets the visitor pick their region (or turn
 * the prefix off) instead of relying only on auto-detection. Uses the
 * same detailed codes (bd-dhaka, us-new-york…) and never writes cookies.
 */
const POPULAR_LOCALES = [
  { code: 'bd-dhaka', label: 'Dhaka, BD' },
  { code: 'in-kolkata', label: 'Kolkata, IN' },
  { code: 'us-new-york', label: 'New York, US' },
  { code: 'gb-london', label: 'London, UK' },
  { code: 'ae-dubai', label: 'Dubai, AE' },
  { code: 'sg-singapore', label: 'Singapore, SG' },
];

function LocationSwitcher() {
  const locale = useLocale();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const [detecting, setDetecting] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  function goTo(code: string | null) {
    try {
      // Remember a manual choice for this tab so the auto re-check
      // doesn't override it; cleared automatically on tab close.
      if (code) sessionStorage.setItem('acetix.locale-manual', '1');
      else sessionStorage.removeItem('acetix.locale-manual');
    } catch {
      /* storage blocked — auto behaviour simply continues */
    }
    const { effectivePath } = parseLocalePath(window.location.pathname);
    const tail = effectivePath === '/' ? '/' : effectivePath;
    navigate(code ? `/${code}${tail === '/' ? '/' : tail}` : tail, { replace: false });
    setOpen(false);
    setCustom('');
  }

  function autoDetect() {
    setDetecting(true);
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 4000);
    void detectLocale(ctrl.signal)
      .then((info) => {
        clearTimeout(timeout);
        if (info) goTo(info.code);
      })
      .catch(() => clearTimeout(timeout))
      .finally(() => setDetecting(false));
  }

  function submitCustom() {
    const code = custom.trim().toLowerCase().replace(/\s+/g, '-');
    if (/^[a-z]{2}(?:-[a-z0-9]{2,24})?$/.test(code)) goTo(code);
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Switch location"
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-paper/70 transition hover:border-white/40 hover:text-paper"
      >
        <MapPin className="h-3.5 w-3.5" />
        {locale ? `/${locale}` : 'Global'}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-60 rounded-2xl border border-ink/10 bg-white p-3 text-ink shadow-xl">
          <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-smoke">
            Location
          </p>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            <button
              type="button"
              onClick={() => goTo(null)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                !locale ? 'bg-ink text-paper' : 'text-smoke hover:bg-ink/5 hover:text-ink'
              }`}
            >
              Global (no prefix)
              {!locale && <Check className="h-4 w-4" />}
            </button>
            {POPULAR_LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => goTo(l.code)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                  locale === l.code ? 'bg-ink text-paper' : 'text-smoke hover:bg-ink/5 hover:text-ink'
                }`}
              >
                {l.label}
                <span className="text-[11px] opacity-60">/{l.code}</span>
              </button>
            ))}
            {locale && !POPULAR_LOCALES.some((l) => l.code === locale) && (
              <div className="flex w-full items-center justify-between rounded-xl bg-ink px-3 py-2 text-sm font-medium text-paper">
                Current
                <span className="text-[11px] opacity-70">/{locale}</span>
              </div>
            )}
          </div>
          <div className="mx-2 my-2 h-px bg-ink/10" />
          <div className="flex gap-2 px-1">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCustom();
              }}
              placeholder="e.g. bd-chattogram"
              aria-label="Custom location code"
              className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-paper px-3 py-2 text-xs outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={submitCustom}
              className="shrink-0 rounded-xl bg-ink px-3 py-2 text-xs font-bold text-paper transition hover:bg-brand"
            >
              Go
            </button>
          </div>
          <button
            type="button"
            onClick={autoDetect}
            disabled={detecting}
            className="mt-2 w-full rounded-xl px-3 py-2 text-center text-xs font-semibold text-brand transition hover:bg-brand/5 disabled:opacity-60"
          >
            {detecting ? 'Detecting…' : 'Auto-detect my location'}
          </button>
        </div>
      )}
    </div>
  );
}
