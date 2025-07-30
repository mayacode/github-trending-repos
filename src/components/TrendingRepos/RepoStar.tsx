import { useStarredRepos } from '@hooks/useTrendingRepos';
import StarIcon from '@assets/StarIcon.svg?react';
import { useLoginModal } from '@hooks/useLoginModal';
import LoginModal from '@components/LoginModal/LoginModal';
import type { Repo } from '@types';
import { useCallback } from 'react';

export default function RepoStar({ repo }: { repo: Repo }) {
  const { modalIsOpen, openLoginModal, closeLoginModal } = useLoginModal();
  const { handleStarClick, starredRepos, loadingStars, isPending } =
    useStarredRepos({ openLoginModal });

  const wrappedHandleStarClick = useCallback(
    () => handleStarClick(repo, modalIsOpen),
    [handleStarClick, repo, modalIsOpen]
  );

  const isLoading = loadingStars?.has(repo.full_name) || false || isPending;

  return (
    <>
      <button
        onClick={wrappedHandleStarClick}
        className="flex items-center gap-1 text-yellow-500 dark:text-yellow-300 font-medium hover:text-yellow-600 dark:hover:text-yellow-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          starredRepos.has(repo.full_name)
            ? 'Unstar this repository'
            : 'Star this repository'
        }
        disabled={isLoading}
      >
        <StarIcon
          className={`w-4 h-4 ${starredRepos.has(repo.full_name) ? 'fill-current' : 'fill-none stroke-current'}`}
        />
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : (
          repo.stargazers_count
        )}
      </button>

      <LoginModal modalIsOpen={modalIsOpen} onClose={closeLoginModal} />
    </>
  );
}
