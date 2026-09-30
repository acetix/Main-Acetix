import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Slim gradient progress bar across the very top of the viewport,
 * triggered on every route change (the initial splash handles first load).
 */
export default function PageLoader() {
  const location = useLocation();
  const [activePath, setActivePath] = useState<string | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setActivePath(location.pathname);
    const timer = setTimeout(() => setActivePath(null), 750);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {activePath && (
        <motion.div
          key={activePath}
          className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-brand via-ember to-sun"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
}
