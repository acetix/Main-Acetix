import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { localizedTo } from '../lib/useLocalizedLink';

const LINKS = [
  { to: '/projects', label: 'Project' },
  { to: '/contact', label: 'Contact' },
  { to: '/profile', label: 'Profile' },
  { to: '/plan', label: 'Plan' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  // Re-resolve every render so links keep the current /<location> prefix.
  useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-paper/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          to={localizedTo('/')}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5"
          aria-label="acetix.xyz home"
        >
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          <span className="font-display text-xl font-bold tracking-tight">
            acetix<span className="text-brand">.xyz</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={localizedTo(link.to)}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ink text-paper'
                    : 'text-smoke hover:bg-ink/5 hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            to={localizedTo('/projects')}
            className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-ember px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-105"
          >
            Explore tools
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-ink/10 bg-paper md:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={localizedTo(link.to)}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-base font-medium ${
                      isActive ? 'bg-ink text-paper' : 'text-smoke hover:bg-ink/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to={localizedTo('/projects')}
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-2xl bg-gradient-to-r from-brand to-ember px-4 py-3 text-center text-base font-semibold text-white"
              >
                Explore tools
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
