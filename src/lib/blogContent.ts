/**
 * Structured article bodies for the Blog pages.
 * ─────────────────────────────────────────
 * A Firestore `blogs` document only carries listing metadata (title,
 * shortDescription, blogUrl…). The full article lives in a JSON file at
 * the document's `blogUrl` direct link, fetched at runtime by the Blog
 * detail page. The parser below is deliberately tolerant — it accepts
 * several common JSON shapes:
 *
 *   { "blocks": [ ... ] }            canonical shape
 *   { "content": [ ... ] }           accepted alias
 *   { "sections": [ ... ] }          accepted alias
 *   [ ... ]                            bare block array
 *   { "body": "long text…" }         plain-text article (\n\n = new paragraph)
 *
 * Each block is either a shorthand string (→ paragraph) or an object:
 *
 *   { "type": "heading", "text": "…" }            level 2 (use "h3" for level 3)
 *   { "type": "paragraph", "text": "…" }          plain paragraph
 *   { "type": "quote", "text": "…", "cite": "…" }
 *   { "type": "image", "src": "https://…", "caption": "…" }
 *   { "type": "code", "code": "…", "language": "js" }
 *   { "type": "list", "items": ["a", "b"] }      ("ordered": true → numbered)
 *   { "type": "divider" }
 *
 * Inline markup inside text: **bold**, `code`, [label](https://…).
 */

export type BlogBlock =
  | { type: 'heading'; text: string; level: 2 | 3 }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'code'; code: string; language?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'divider' };

export interface BlogDocument {
  title?: string;
  cover?: string;
  blocks: BlogBlock[];
}

function asNonEmptyString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => asNonEmptyString(v)).filter(Boolean);
}

/** "a\n\nb" → two paragraph blocks; single newlines stay (pre-line). */
function splitParagraphs(text: string): BlogBlock[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ type: 'paragraph', text: p }) as BlogBlock);
}

/** A single raw entry (string shorthand or block object) → typed block(s). */
function normalizeBlock(raw: unknown): BlogBlock | BlogBlock[] | null {
  if (typeof raw === 'string') {
    const text = raw.trim();
    return text ? splitParagraphs(text) : null;
  }
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const kind = asNonEmptyString(o.type ?? o.kind).toLowerCase();
  const text = asNonEmptyString(o.text ?? o.content ?? o.body ?? o.caption);

  switch (kind) {
    case 'h1':
    case 'h2':
    case 'heading':
    case 'title':
    case 'subtitle':
      return text ? { type: 'heading', text, level: 2 } : null;
    case 'h3':
    case 'h4':
    case 'subheading':
      return text ? { type: 'heading', text, level: 3 } : null;
    case 'quote':
    case 'blockquote':
    case 'pullquote':
      if (!text) return null;
      return {
        type: 'quote',
        text,
        cite: asNonEmptyString(o.cite ?? o.author) || undefined,
      };
    case 'image':
    case 'img':
    case 'picture':
    case 'photo':
    case 'cover': {
      const src = asNonEmptyString(o.src ?? o.url ?? o.image ?? o.href);
      if (!src) return null;
      return {
        type: 'image',
        src,
        caption: asNonEmptyString(o.caption ?? o.alt ?? o.text) || undefined,
      };
    }
    case 'code':
    case 'codeblock':
    case 'code-block':
    case 'snippet': {
      const code = typeof o.code === 'string' ? o.code.replace(/\n+$/, '') : text;
      if (!code) return null;
      return {
        type: 'code',
        code,
        language: asNonEmptyString(o.language ?? o.lang) || undefined,
      };
    }
    case 'list':
    case 'ul':
    case 'ol':
    case 'bullets':
    case 'points': {
      const items = stringList(o.items ?? o.list ?? o.points ?? o.children);
      if (items.length === 0) return null;
      return { type: 'list', ordered: kind === 'ol' || o.ordered === true, items };
    }
    case 'divider':
    case 'hr':
    case 'separator':
      return { type: 'divider' };
    default: {
      // Typeless object: prefer text, else list items, else skip.
      if (text) return splitParagraphs(text);
      const items = stringList(o.items ?? o.list ?? o.points);
      if (items.length > 0) return { type: 'list', items };
      return null;
    }
  }
}

function flatBlocks(list: unknown[]): BlogBlock[] {
  const out: BlogBlock[] = [];
  for (const raw of list) {
    const b = normalizeBlock(raw);
    if (Array.isArray(b)) out.push(...b);
    else if (b) out.push(b);
  }
  return out;
}

/** Tolerantly parse any JSON shape into a BlogDocument. */
export function normalizeBlogDoc(json: unknown): BlogDocument {
  if (typeof json === 'string') {
    const t = json.trim();
    return { blocks: t ? splitParagraphs(t) : [] };
  }
  if (Array.isArray(json)) {
    return { blocks: flatBlocks(json) };
  }
  if (!json || typeof json !== 'object') return { blocks: [] };
  const o = json as Record<string, unknown>;
  const title = asNonEmptyString(o.title) || undefined;
  const cover = asNonEmptyString(o.cover ?? o.image ?? o.imageUrl) || undefined;
  const list = o.blocks ?? o.content ?? o.sections ?? o.articles ?? o.body;
  if (Array.isArray(list)) return { title, cover, blocks: flatBlocks(list) };
  if (typeof list === 'string' && list.trim()) {
    return { title, cover, blocks: splitParagraphs(list) };
  }
  const fallback = asNonEmptyString(o.text ?? o.markdown);
  if (fallback) return { title, cover, blocks: splitParagraphs(fallback) };
  return { title, cover, blocks: [] };
}

/** Fetch + parse a blog's `blogUrl` JSON file. Throws with a friendly message. */
export async function fetchBlogContent(url: string, signal?: AbortSignal): Promise<BlogDocument> {
  let res: Response;
  try {
    res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new Error(
      'The JSON file could not be reached. Check the blogUrl link — the host must allow cross-origin (CORS) reads.',
    );
  }
  if (!res.ok) throw new Error(`The JSON file returned HTTP ${res.status}. Check the blogUrl link.`);
  let json: unknown;
  try {
    json = (await res.json()) as unknown;
  } catch {
    throw new Error('The linked file is not valid JSON.');
  }
  const doc = normalizeBlogDoc(json);
  if (doc.blocks.length === 0) throw new Error('The JSON file has no readable article blocks.');
  return doc;
}

/** Rough reading time from word count (≈200 wpm), minimum 1 minute. */
export function estimateReadMinutes(blocks: BlogBlock[]): number {
  let words = 0;
  for (const b of blocks) {
    if (b.type === 'paragraph' || b.type === 'heading' || b.type === 'quote') {
      words += b.text.split(/\s+/).filter(Boolean).length;
    } else if (b.type === 'list') {
      words += b.items.join(' ').split(/\s+/).filter(Boolean).length;
    } else if (b.type === 'code') {
      words += b.code.split(/\s+/).filter(Boolean).length;
    }
  }
  return Math.max(1, Math.round(words / 200));
}
