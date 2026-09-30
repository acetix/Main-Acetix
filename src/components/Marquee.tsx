import { Sparkle } from 'lucide-react';

interface MarqueeProps {
  items: string[];
}

export default function Marquee({ items }: MarqueeProps) {
  if (items.length === 0) return null;
  const row = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-ink/10 bg-ink py-4">
      <div className="flex w-max animate-marquee items-center">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-8 pr-8 font-display text-sm font-semibold uppercase tracking-[0.3em] text-paper/75"
          >
            {item}
            <Sparkle className="h-4 w-4 text-sun" fill="currentColor" />
          </span>
        ))}
      </div>
    </div>
  );
}
