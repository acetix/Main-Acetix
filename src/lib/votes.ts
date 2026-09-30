import { doc, increment, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Project } from './types';

export type Vote = 'like' | 'dislike';

const keyFor = (projectId: string) => `acetix.vote.${projectId}`;

export function myVoteFor(projectId: string): Vote | null {
  try {
    const v = localStorage.getItem(keyFor(projectId));
    return v === 'like' || v === 'dislike' ? v : null;
  } catch {
    return null;
  }
}

export interface VoteResult {
  like: number;
  dislike: number;
  myVote: Vote | null;
}

/**
 * Cast / toggle / switch a like or dislike.
 * One vote per browser per project (localStorage lock). Clicking the same
 * button again retracts the vote; clicking the other side switches it.
 *
 * The backend access rules only let the public touch the `like`/`dislike`
 * counters, so nothing else on an owner's project document can be
 * modified by a visitor.
 */
export async function voteOnProject(project: Project, vote: Vote): Promise<VoteResult> {
  const prev = myVoteFor(project.id);
  const baseLike = project.like ?? 0;
  const baseDislike = project.dislike ?? 0;

  let like = baseLike;
  let dislike = baseDislike;
  let next: Vote | null;

  if (prev === vote) {
    next = null;
    if (vote === 'like') like -= 1;
    else dislike -= 1;
  } else if (prev) {
    next = vote;
    if (vote === 'like') {
      like += 1;
      dislike -= 1;
    } else {
      dislike += 1;
      like -= 1;
    }
  } else {
    next = vote;
    if (vote === 'like') like += 1;
    else dislike += 1;
  }

  like = Math.max(0, like);
  dislike = Math.max(0, dislike);

  try {
    if (next) localStorage.setItem(keyFor(project.id), next);
    else localStorage.removeItem(keyFor(project.id));
  } catch {
    /* storage blocked — vote still saved, just not remembered */
  }

  if (db) {
    try {
      const delta: Record<string, ReturnType<typeof increment>> = {};
      if (like !== baseLike) delta.like = increment(like - baseLike);
      if (dislike !== baseDislike) delta.dislike = increment(dislike - baseDislike);
      if (Object.keys(delta).length > 0) {
        await updateDoc(doc(db, 'projects', project.id), delta);
      }
    } catch (error) {
      console.warn('[acetix] Vote could not be saved (access rules pending?).', error);
    }
  }

  return { like, dislike, myVote: next };
}
