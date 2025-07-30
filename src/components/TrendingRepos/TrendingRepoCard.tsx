import type { Repo } from '@types';
import RepoIcon from '@assets/RepoIcon.svg?react';
import RepoStar from './RepoStar.tsx';

export default function TrendingRepoCard({ repo }: { repo: Repo }) {
  return (
    <li
      key={repo.id}
      className="bg-blue-100 dark:bg-gray-900 border border-sky-100 dark:border-sky-800 rounded-xl shadow-md p-6 flex flex-col gap-2 transition-transform text-gray-900 dark:text-gray-100"
    >
      <div className="flex items-center justify-between">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-semibold text-sky-900 dark:text-sky-100 hover:underline"
        >
          <RepoIcon className="w-5 h-5" /> {repo.full_name}
        </a>
        <RepoStar repo={repo} />
      </div>
      <div className="text-sm text-gray-900 dark:text-gray-300 line-clamp-3 min-h-[48px]">
        {repo.description}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700 dark:text-gray-400 mt-2">
        <span>{repo.language}</span>
        <span>Forks: {repo.forks_count}</span>
        <span className="flex items-center gap-1">
          Owner:{' '}
          <img
            src={repo.owner.avatar_url}
            alt="avatar"
            className="w-5 h-5 rounded-full border border-sky-100 dark:border-sky-800"
          />{' '}
          {repo.owner.login}
        </span>
      </div>
    </li>
  );
}
