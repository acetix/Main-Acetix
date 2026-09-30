import { useState, type MouseEvent } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Project } from '../lib/types';
import { myVoteFor, voteOnProject, type Vote } from '../lib/votes';

interface VoteButtonsProps {
  project: Project;
  large?: boolean;
}

/**
 * Public like/dislike widget. Voting still works and counts persist to the
 * cloud `like`/`dislike` fields (used for ordering), but the totals are
 * intentionally never shown — only the visitor's own active choice is
 * highlighted. Events are stopped so the buttons can sit safely inside
 * the card-wide navigation link.
 */
export default function VoteButtons({ project, large = false }: VoteButtonsProps) {
  const [myVote, setMyVote] = useState<Vote | null>(() => myVoteFor(project.id));
  const [busy, setBusy] = useState(false);

  async function handleVote(vote: Vote, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const result = await voteOnProject(project, vote);
      setMyVote(result.myVote);
    } finally {
      setBusy(false);
    }
  }

  const btnBase = large
    ? 'inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-bold transition'
    : 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition';
  const iconCls = large ? 'h-4 w-4' : 'h-3.5 w-3.5';

  return (
    <span
      className="inline-flex items-center gap-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        disabled={busy}
        aria-label="Like this project"
        aria-pressed={myVote === 'like'}
        onClick={(e) => void handleVote('like', e)}
        className={`${btnBase} ${
          myVote === 'like'
            ? 'border-brand bg-brand text-white'
            : 'border-ink/15 bg-white text-smoke hover:border-brand hover:text-brand'
        } disabled:opacity-60`}
      >
        <ThumbsUp className={iconCls} fill={myVote === 'like' ? 'currentColor' : 'none'} />
      </button>
      <button
        type="button"
        disabled={busy}
        aria-label="Dislike this project"
        aria-pressed={myVote === 'dislike'}
        onClick={(e) => void handleVote('dislike', e)}
        className={`${btnBase} ${
          myVote === 'dislike'
            ? 'border-ink bg-ink text-paper'
            : 'border-ink/15 bg-white text-smoke hover:border-ink hover:text-ink'
        } disabled:opacity-60`}
      >
        <ThumbsDown className={iconCls} fill={myVote === 'dislike' ? 'currentColor' : 'none'} />
      </button>
    </span>
  );
}
