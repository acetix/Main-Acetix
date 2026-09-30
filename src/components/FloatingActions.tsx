import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Lightbulb } from 'lucide-react';
import { localizedTo } from '../lib/useLocalizedLink';

/**
 * One floating button, two jobs:
 *   • At the top of the page  → 💡 “Suggest” button that leads to /suggest
 *     (with a “Suggest the next acetix tool” label floating in occasionally
 *     and on hover).
 *   • Once you scroll down    → ↑ “Back to top” button.
 * The icon swaps with a little spin. On the suggestion page itself the
 * top-state button is redundant, so only the Up button appears there.
 */
export default function FloatingActions() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [labelOn, setLabelOn] = useState(false);
  const [hover, setHover] = useState(false);

  const onSuggestPage = pathname.startsWith('/suggest') || pathname.endsWith('/suggest');
  const mode: 'suggest' | 'up' = scrolled ? 'up' : 'suggest';
  const hidden = onSuggestPage && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setHover(false);
    setLabelOn(false);
  }, [pathname]);

  useEffect(() => {
    const firstShow = setTimeout(() => setLabelOn(true), 2000);
    const firstHide = setTimeout(() => setLabelOn(false), 7500);
    const interval = setInterval(() => {
      setLabelOn(true);
      setTimeout(() => setLabelOn(false), 5500);
    }, 16000);
    return () => {
      clearTimeout(firstShow);
      clearTimeout(firstHide);
      clearInterval(interval);
    };
  }, []);

  function handleClick() {
    if (mode === 'up') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(localizedTo('/suggest'));
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {!hidden && (
          <motion.div
            key="fab"
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.85 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center gap-3"
          >
            <AnimatePresence>
              {mode === 'suggest' && (labelOn || hover) && (
                <motion.span
                  key="suggest-label"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="pointer-events-none whitespace-nowrap rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper shadow-lg"
                >
                  Suggest the next acetix tool
                </motion.span>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={handleClick}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              aria-label={mode === 'up' ? 'Back to top' : 'Suggest a tool'}
              className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                mode === 'up'
                  ? 'bg-ink text-paper hover:bg-brand'
                  : 'bg-gradient-to-br from-brand to-sun text-white shadow-brand/40'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mode}
                  initial={{ opacity: 0, rotate: -70, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 70, scale: 0.5 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex"
                >
                  {mode === 'up' ? (
                    <ArrowUp className="h-5 w-5" />
                  ) : (
                    <Lightbulb className="h-5 w-5" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
