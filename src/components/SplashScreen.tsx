import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Branded splash shown until the site is FULLY loaded — logo pop, wordmark
 * and a gradient progress line. It hides only after window `load`
 * (all images/chunks), webfonts, AND a minimum display time, so visitors
 * never see a half-ready page. A matching static `#boot-shell` in
 * index.html covers the paint before this React component even mounts.
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hand over from the static pre-React shell to this animated one.
    document.getElementById('boot-shell')?.remove();

    const MIN_TIME = 1400;
    const start = Date.now();
    let winLoaded = document.readyState === 'complete';
    let fontsReady = false;
    let minElapsed = false;
    let done = false;

    function maybeDone() {
      if (done || !winLoaded || !fontsReady || !minElapsed) return;
      done = true;
      // Small extra beat so the bar visibly completes before fading.
      const extra = Math.max(0, 350 - (Date.now() - start - MIN_TIME));
      setTimeout(() => setVisible(false), extra);
    }

    const minTimer = setTimeout(() => {
      minElapsed = true;
      maybeDone();
    }, MIN_TIME);

    function onWinLoad() {
      winLoaded = true;
      maybeDone();
    }
    if (winLoaded) {
      // already complete — still go through maybeDone after fonts/min time
    } else {
      window.addEventListener('load', onWinLoad, { once: true });
    }

    let fontsCancelled = false;
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(
        () => {
          if (!fontsCancelled) {
            fontsReady = true;
            maybeDone();
          }
        },
        () => {
          if (!fontsCancelled) {
            fontsReady = true;
            maybeDone();
          }
        },
      );
      // Safety: never trap the splash if fonts hang.
      setTimeout(() => {
        if (!fontsCancelled && !fontsReady) {
          fontsReady = true;
          maybeDone();
        }
      }, 3500);
    } else {
      fontsReady = true;
    }

    // Safety: never trap the splash if `load` hangs (slow image etc.).
    const maxTimer = setTimeout(() => {
      winLoaded = true;
      fontsReady = true;
      minElapsed = true;
      maybeDone();
    }, 8000);

    maybeDone();

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      fontsCancelled = true;
      window.removeEventListener('load', onWinLoad);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-paper"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <motion.img
            src="/favicon.svg"
            alt="acetix logo"
            className="h-16 w-16"
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
          <motion.p
            className="mt-4 font-display text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease: 'easeOut' }}
          >
            acetix<span className="text-brand">.xyz</span>
          </motion.p>
          <motion.div
            className="mt-6 h-1 w-28 origin-left rounded-full bg-gradient-to-r from-brand via-ember to-sun"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.75, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
