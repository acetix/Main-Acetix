import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import type { Blog } from '../lib/types';
import { localizedTo } from '../lib/useLocalizedLink';
import { formatDate } from '../lib/dates';

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const date = formatDate(blog.createdAt);
  return (
    <Link to={localizedTo(`/blog/${blog.id}`)} className="group block h-full min-w-0">
      <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5">
        {blog.imageUrl ? (
          <div className="relative min-w-0 overflow-hidden bg-sand">
            <img
              src={blog.imageUrl}
              alt=""
              loading="lazy"
              className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              {blog.category}
            </span>
          </div>
        ) : (
          <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-ink via-ink-2 to-brand">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />
            <span className="relative font-display text-6xl font-bold text-white/25">
              {blog.title.charAt(0).toUpperCase()}
            </span>
            <span className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              {blog.category}
            </span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col p-6">
          {date && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-smoke">
              <CalendarDays className="h-3.5 w-3.5" />
              {date}
              {blog.author ? ` · ${blog.author}` : ''}
            </p>
          )}
          <h3 className="mt-2.5 min-w-0 break-words font-display text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-brand">
            {blog.title}
          </h3>
          <p className="mt-2 line-clamp-3 min-w-0 break-words text-sm leading-relaxed text-smoke">
            {blog.shortDescription}
          </p>
          <div className="mt-4 flex min-w-0 items-center justify-between gap-3 pt-1">
            {blog.tags.length > 0 ? (
              <div className="flex min-w-0 flex-wrap gap-1.5">
                {blog.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-ink/15 px-2.5 py-1 text-[11px] font-medium text-smoke"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <span />
            )}
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand">
              Read
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
