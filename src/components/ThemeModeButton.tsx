import { MonitorSmartphone, Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeMode, type ThemeMode } from '../lib/useTheme';

const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

const META: Record<ThemeMode, { icon: typeof Sun; label: string; title: string }> = {
  system: {
    icon: MonitorSmartphone,
    label: 'System theme',
    title: 'Theme: System (follows your device). Click for Bright.',
  },
  light: {
    icon: Sun,
    label: 'Bright theme',
    title: 'Theme: Bright. Click for Dark.',
  },
  dark: {
    icon: Moon,
    label: 'Dark theme',
    title: 'Theme: Dark. Click for System.',
  },
};

interface ThemeModeButtonProps {
  size?: 'md' | 'sm';
}

/**
 * Header dark/bright-mode button. Defaults to "system" (follows the OS
 * live); each click cycles System → Bright → Dark → System. The choice
 * persists across visits via `useThemeMode`.
 */
export default function ThemeModeButton({ size = 'md' }: ThemeModeButtonProps) {
  const { mode, cycle } = useThemeMode();
  const meta = META[mode] ?? META.system;
  const Icon = meta.icon;
  const dims = size === 'sm' ? 'h-10 w-10' : 'h-10 w-10 md:h-[42px] md:w-[42px]';

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={meta.title}
      title={meta.title}
      aria-live="polite"
      className={`inline-flex shrink-0 ${dims} items-center justify-center overflow-hidden rounded-full border transition ${
        mode === 'system'
          ? 'border-ink/15 bg-paper text-ink hover:border-brand hover:text-brand'
          : 'border-brand bg-brand text-white shadow-sm hover:brightness-105'
      }`}
    >
      <span className="sr-only">{meta.label} — {ORDER.indexOf(mode) + 1} of 3</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={{ opacity: 0, rotate: -70, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 70, scale: 0.5 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex"
        >
          <Icon className="h-5 w-5" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
