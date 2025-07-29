import StarIcon from '@assets/StarIcon.svg?react';
import { useGitHubAuth } from '@contexts/GitHubAuthContext';
import type { Repo } from '@types';

export default function RepoStar({ repo }: { repo: Repo }) {
  const { userIsLoggedIn, openLoginModal } = useGitHubAuth();

  const handleStarClick = () => {
    if (!userIsLoggedIn) {
      openLoginModal();
      return;
    }
  };

  return (
    <button
      onClick={handleStarClick}
      className="flex items-center gap-1 text-yellow-500 dark:text-yellow-300 font-medium hover:text-yellow-600 dark:hover:text-yellow-200 transition-colors cursor-pointer"
      title="Star this repository"
      disabled={false}
    >
      <StarIcon className={`w-4 h-4 fill-current`} />
      {repo.stargazers_count}
    </button>
  );
}
