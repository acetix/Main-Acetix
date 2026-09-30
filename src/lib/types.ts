/**
 * Category ids are free-form slugs, created live in the cloud
 * `categories` collection (developer / everyday / android / design —
 * whatever the next project needs).
 */
export type ProjectCategory = string;

export type ProjectStatus = 'live' | 'beta' | 'building';

/**
 * Canonical project schema — mirrors the cloud `projects` documents:
 * title, slug, shortDescription, fullDescription, projectUrl, imageUrl,
 * category, tags, featured, status, order, createdAt, updatedAt.
 *
 * The last four fields are optional enrichments the UI uses when present;
 * they are auto-derived otherwise (accent from category, domain from
 * projectUrl, year from createdAt).
 */
export interface Project {
  id: string; // route slug — cloud `slug` field, or the document id
  title: string;
  shortDescription: string;
  fullDescription: string;
  projectUrl: string;
  imageUrl: string; // direct image link — never uploaded to Storage
  category: ProjectCategory;
  tags: string[];
  featured?: boolean;
  status: ProjectStatus;
  like?: number; // public vote counters — see src/lib/votes.ts
  dislike?: number;
  createdAt?: unknown; // Cloud Timestamp | ISO string | epoch ms
  updatedAt?: unknown;
  slug?: string;
  domain?: string;
  year?: number;
  accent?: string;
  features?: string[];
}

export type SuggestionStatus = 'new' | 'planned' | 'building' | 'shipped';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  name: string;
  status: SuggestionStatus;
  createdAt: Date | null;
}

export interface ContactMessage {
  name: string;
  email: string;
  topic: string;
  message: string;
}
