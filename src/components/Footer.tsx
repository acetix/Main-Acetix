import { Link, useLocation } from 'react-router-dom';
import { Github, Globe, Mail, MessageCircle, Send } from 'lucide-react';
import { useProjects } from '../lib/useProjects';
import { localizedTo } from '../lib/useLocalizedLink';
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
              <li>
                <Link className="transition hover:text-paper" to={localizedTo('/plan')}>Plan</Link></li>
              <li>
                <Link className="transition hover:text-paper" to={localizedTo('/blog')}>Blog</Link></li>
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

