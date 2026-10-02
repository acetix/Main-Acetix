import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  FileJson,
  TriangleAlert,
} from 'lucide-react';
import Reveal from '../components/Reveal';
import NotFound from './NotFound';
import { usePageSeo } from '../lib/usePageSeo';
import { localizedTo } from '../lib/useLocalizedLink';
import { useBlogs } from '../lib/useBlogs';
import { formatDate } from '../lib/dates';
import {
  estimateReadMinutes,
  fetchBlogContent,
  type BlogBlock,
} from '../lib/blogContent';

type BodyStatus = 'loading' | 'ready' | 'missing' | 'error';

interface BodyState {
  status: BodyStatus;
  blocks: BlogBlock[];
  error: string;
  docCover: string;
}

/** Tiny inline markup: [label](https://…), **bold**, `code`. Text-only, XSS-safe. */
function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const re = /(\[([^\]]+)\]\((https?:[^)\s]+)\))|(\*\*([^*]+)\*\*)|(`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2] && m[3]) {
      parts.push(
        <a key={k++} href={m[3]} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">
          {m[2]}
        </a>,
      );
    } else if (m[5]) {
      parts.push(
        <strong key={k++} className="font-semibold text-ink">
          {m[5]}
        </strong>,
      );
    } else if (m[7]) {
      parts.push(
        <code key={k++} className="rounded bg-sand px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
          {m[7]}
        </code>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? <>{parts}</> : text;
}

function BlogBlockView({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case 'heading':
      return block.level === 3 ? (
        <h3 className="mt-10 font-display text-xl font-bold tracking-tight text-ink">
          {renderInline(block.text)}
        </h3>
      ) : (
        <h2 className="mt-12 font-display text-2xl font-bold tracking-tight text-ink">
          {renderInline(block.text)}
        </h2>
      );
    case 'quote':
      return (
        <blockquote className="mt-8 rounded-r-3xl border-l-4 border-brand bg-white px-6 py-5">
          <p className="font-display text-lg font-medium leading-relaxed text-ink">
            “{renderInline(block.text)}”
          </p>
          {block.cite && (
            <cite className="mt-2 block text-sm not-italic text-smoke">— {block.cite}</cite>
          )}
        </blockquote>
      );
    case 'image':
      return (
        <figure className="mt-8 overflow-hidden rounded-3xl border border-ink/10 bg-white">
          <img src={block.src} alt={block.caption || ''} loading="lazy" className="w-full object-cover" />
          {block.caption && (
            <figcaption className="px-5 py-3 text-center text-xs text-smoke">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'code':
      return (
        <div className="mt-8 overflow-hidden rounded-3xl border border-ink/10 bg-ink">
          {block.language && (
            <p className="border-b border-white/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50">
              {block.language}
            </p>
          )}
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-paper/90">
            <code>{block.code}</code>
          </pre>
        </div>
      );
    case 'list':
      return block.ordered ? (
        <ol className="mt-6 list-decimal space-y-2.5 pl-6 leading-relaxed text-smoke marker:font-semibold marker:text-brand">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      ) : (
        <ul className="mt-6 space-y-2.5 leading-relaxed text-smoke">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case 'divider':
      return <hr className="my-10 border-ink/10" />;
    default:
      return (
        <p className="mt-6 whitespace-pre-line leading-[1.85] text-smoke">
          {renderInline(block.text)}
        </p>
      );
  }
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const { blogs, loading: listLoading } = useBlogs();
  // Re-resolve every render so links keep the current /<location> prefix.
  useLocation();

  const index = blogs.findIndex((b) => b.id === id);
  const blog = index >= 0 ? blogs[index] : undefined;

  usePageSeo(
    blog ? `${blog.title} — acetix blog` : 'Article — acetix blog',
    blog
      ? `${blog.title}: ${blog.shortDescription}`.slice(0, 160)
      : 'Read a free acetix blog article: notes, tutorials and project updates.',
    `/blog/${id ?? ''}`,
  );

  const [retry, setRetry] = useState(0);

  const blogId = blog?.id;
  const blogUrl = blog?.blogUrl ?? '';

  // Keyed fetch state: remounts per article/URL/retry, so "loading" needs
  // no setState-in-effect when the target changes — React resets it.
  const [fetchState, setFetchState] = useState<{
    key: string;
    status: Exclude<BodyStatus, 'missing'>;
    blocks: BlogBlock[];
    error: string;
    docCover: string;
  } | null>(null);
  const fetchKey = blogId && blogUrl ? `${blogId}::${blogUrl}::${retry}` : '';
  if (fetchKey && fetchState?.key !== fetchKey) {
    setFetchState({ key: fetchKey, status: 'loading', blocks: [], error: '', docCover: '' });
  }

  useEffect(() => {
    if (!blogId || !blogUrl || !fetchKey) return;
    const ctrl = new AbortController();
    fetchBlogContent(blogUrl, ctrl.signal)
      .then((doc) =>
        setFetchState({
          key: fetchKey,
          status: 'ready',
          blocks: doc.blocks,
          error: '',
          docCover: doc.cover ?? '',
        }),
      )
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setFetchState({
          key: fetchKey,
          status: 'error',
          blocks: [],
          error: err instanceof Error ? err.message : 'Could not load the article body.',
          docCover: '',
        });
      });
    return () => ctrl.abort();
  }, [blogId, blogUrl, fetchKey]);

  // Derived view-model: no linked JSON → 'missing'; otherwise the fetch result.
  const body: BodyState = useMemo(
    () =>
      !blogUrl || !fetchKey
        ? { status: 'missing', blocks: [], error: '', docCover: '' }
        : fetchState && fetchState.key === fetchKey
          ? {
              status: fetchState.status,
              blocks: fetchState.blocks,
              error: fetchState.error,
              docCover: fetchState.docCover,
            }
          : { status: 'loading', blocks: [], error: '', docCover: '' },
    [blogUrl, fetchKey, fetchState],
  );

  const readMinutes = useMemo(
    () => (body.status === 'ready' ? estimateReadMinutes(body.blocks) : null),
    [body],
  );

  if (listLoading && !blog) {
    return (
      <div className="mx-auto max-w-3xl min-w-0 px-6 pb-24 pt-32 md:pt-40">
        <div className="animate-pulse" aria-hidden="true">
          <div className="h-4 w-28 rounded-full bg-sand" />
          <div className="mt-5 h-10 w-4/5 rounded-2xl bg-sand" />
          <div className="mt-3 h-10 w-3/5 rounded-2xl bg-sand" />
          <div className="mt-6 h-4 w-full rounded-full bg-sand" />
          <div className="mt-2 h-4 w-5/6 rounded-full bg-sand" />
          <div className="mt-10 aspect-[16/9] w-full rounded-[2rem] bg-sand" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return <NotFound />;
  }

  const next = blogs.length > 1 ? blogs[(index + 1) % blogs.length] : undefined;
  const date = formatDate(blog.createdAt);
  const cover = blog.imageUrl || body.docCover;

  return (
    <div className="mx-auto max-w-3xl min-w-0 overflow-x-clip px-6 pb-24 pt-28 md:pt-36">
      <Reveal>
        <Link
          to={localizedTo('/blog')}
          className="group inline-flex items-center gap-2 text-sm font-medium text-smoke transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          All articles
        </Link>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <span className="rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
            {blog.category}
          </span>
          {date && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-smoke">
              <CalendarDays className="h-3.5 w-3.5" />
              {date}
            </span>
          )}
          {readMinutes !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-smoke">
              <Clock3 className="h-3.5 w-3.5" />
              {readMinutes} min read
            </span>
          )}
          {blog.author && (
            <span className="rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-smoke">
              By {blog.author}
            </span>
          )}
        </div>

        <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
          {blog.title}
        </h1>
        {blog.shortDescription && (
          <p className="mt-4 text-lg leading-relaxed text-smoke">{blog.shortDescription}</p>
        )}
      </Reveal>

      {cover && (
        <Reveal delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-ink/10 shadow-xl shadow-ink/10">
            <img src={cover} alt="" className="aspect-[16/9] w-full object-cover" />
          </div>
        </Reveal>
      )}

      {/* Article body — streamed from the blogUrl JSON file */}
      <Reveal delay={0.08}>
        {body.status === 'loading' && (
          <div className="mt-10 animate-pulse space-y-3" aria-hidden="true">
            <div className="h-4 w-full rounded-full bg-sand" />
            <div className="h-4 w-full rounded-full bg-sand" />
            <div className="h-4 w-11/12 rounded-full bg-sand" />
            <div className="h-4 w-full rounded-full bg-sand" />
            <div className="h-4 w-3/5 rounded-full bg-sand" />
          </div>
        )}

        {body.status === 'ready' && (
          <article className="mt-4 min-w-0">
            {body.blocks.map((block, i) => (
              <BlogBlockView key={i} block={block} />
            ))}
          </article>
        )}

        {body.status === 'missing' && (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-ink/20 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sand">
              <FileJson className="h-6 w-6 text-smoke" />
            </span>
            <p className="font-display text-xl font-bold">Full article coming soon</p>
            <p className="max-w-sm text-sm leading-relaxed text-smoke">
              The complete story has not been linked yet — add the JSON file URL
              to this article's <code className="rounded bg-sand px-1.5 py-0.5 font-mono text-xs">blogUrl</code> field
              and it will appear here automatically.
            </p>
          </div>
        )}

        {body.status === 'error' && (
          <div className="mt-10 rounded-3xl border border-amber-500/30 bg-amber-50 px-6 py-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15">
                <TriangleAlert className="h-5 w-5 text-amber-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-amber-900">
                  The article body could not be loaded
                </p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800/90">{body.error}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRetry((r) => r + 1)}
                    className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-paper transition hover:bg-brand"
                  >
                    Try again
                  </button>
                  {blogUrl && (
                    <a
                      href={blogUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-brand"
                    >
                      Open the JSON directly
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Reveal>

      {/* Source + tags */}
      <Reveal delay={0.05}>
        <div className="mt-12 flex flex-col gap-4 rounded-3xl border border-ink/10 bg-white p-6">
          {blogUrl && (
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-sun">
                <FileJson className="h-5 w-5 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-smoke">
                  Article source
                </p>
                <p className="mt-0.5 truncate font-mono text-xs text-smoke">{blogUrl}</p>
              </div>
              <a
                href={blogUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open article JSON source"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition hover:bg-brand"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          )}
          {blog.tags.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 ${blogUrl ? 'border-t border-ink/10 pt-4' : ''}`}>
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-smoke"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* Next article */}
      {next && next.id !== blog.id && (
        <Reveal>
          <Link
            to={localizedTo(`/blog/${next.id}`)}
            className="group mt-12 flex items-center justify-between gap-6 rounded-3xl bg-ink px-7 py-8 text-paper transition hover:bg-ink-2 md:px-10"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-paper/60">
                Next article
              </p>
              <p className="mt-2 truncate font-display text-2xl font-bold md:text-3xl">
                {next.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-paper/60">{next.shortDescription}</p>
            </div>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-sun transition-transform duration-300 group-hover:translate-x-1.5">
              <ArrowRight className="h-6 w-6 text-white" />
            </span>
          </Link>
        </Reveal>
      )}
    </div>
  );
}
