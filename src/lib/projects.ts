import type { Project } from './types';
import { asDate } from './dates';

/*
  Category ids are not hardcoded — they come from the cloud `categories`
  collection (src/lib/useCategories.ts), falling back to the
  projects' own `category` fields when that collection is absent. Adding a
  new slug to a project automatically adds a filter option.

  This file only holds label/gradient helpers.
*/

const LEGACY_LABELS: Record<string, string> = {
  developer: 'Developer Tool',
  everyday: 'Everyday Tool',
  design: 'Design Tool',
};

/** "api-testing" → "Api testing" (capitalise the first letter) */
export function prettifyCategory(id: string): string {
  const words = id.replace(/[-_]+/g, ' ').trim();
  if (!words) return 'Other';
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * " Lable " → "lable" — project category values arrive in any casing
 * (spaces/underscores included), so normalise them to one slug shape to
 * keep every filter comparison stable.
 */
export function normalizeCategoryId(id: string): string {
  return id.trim().toLowerCase().replace(/[\s_]+/g, '-');
}

export interface CategoryRef {
  id: string;
  label: string;
}

/**
 * Does a project belong to the selected category?
 * A category doc's id/slug and a project's `category` field may not match
 * letter-for-letter (e.g. id "slug" vs value "Lable"), so compare against
 * both the id and the selected category's display label. 'all' matches
 * every project.
 */
export function categoryMatches(
  projectCategory: string | undefined,
  selectedId: string,
  categories: CategoryRef[],
): boolean {
  if (selectedId === 'all') return true;
  const pc = normalizeCategoryId(projectCategory ?? '');
  if (!pc) return false;
  if (pc === selectedId) return true;
  const selected = categories.find((c) => c.id === selectedId);
  return !!selected && pc === normalizeCategoryId(selected.label);
}

export function categoryLabel(id: string): string {
  return LEGACY_LABELS[normalizeCategoryId(id)] ?? prettifyCategory(id ?? '');
}

/** Default gradient used for fallback tiles when an image link fails. */
export const CATEGORY_ACCENT: Record<string, string> = {
  developer: 'from-violet-500 to-purple-700',
  everyday: 'from-sky-400 to-blue-600',
  design: 'from-emerald-400 to-teal-600',
};

export function projectAccent(project: Pick<Project, 'accent' | 'category'>): string {
  if (project.accent && project.accent.trim()) return project.accent;
  return CATEGORY_ACCENT[normalizeCategoryId(project.category)] ?? 'from-brand to-ember';
}

export function projectDomain(project: Pick<Project, 'domain' | 'projectUrl'>): string {
  if (project.domain && project.domain.trim()) return project.domain;
  try {
    return new URL(project.projectUrl).host;
  } catch {
    return project.projectUrl.replace(/^https?:\/\//, '').split('/')[0] || project.projectUrl;
  }
}

export function projectYear(project: Pick<Project, 'year' | 'createdAt'>): number | null {
  if (typeof project.year === 'number') return project.year;
  const date = asDate(project.createdAt);
  return date ? date.getFullYear() : null;
}
