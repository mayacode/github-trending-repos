import { useAuthMessage, useTrendingRepos } from '@hooks/useTrendingRepos';
import FilterBar from '@components/FilterBar/FilterBar';
import TrendingRepoList from './TrendingRepoList';

export default function TrendingReposContainer() {
  const { error, pending, repoList, ...filterBarProps } = useTrendingRepos();
  const { authMessage } = useAuthMessage();

  return (
    <div className="px-6">
      <FilterBar {...filterBarProps} />
      <main className="px-6 pt-0 py-8 relative">
        {(error || authMessage) && (
          <div
            className={`text-center ${
              authMessage?.type === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {authMessage?.message || error}
          </div>
        )}
        <div className="relative">
          {pending && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 z-10">
              <span className="text-blue-600 dark:text-green-400 text-lg animate-pulse">
                Loading...
              </span>
            </div>
          )}
          <TrendingRepoList repoList={repoList} />
        </div>
      </main>
    </div>
  );
}
