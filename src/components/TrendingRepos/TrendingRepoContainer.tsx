import { useTrendingRepos } from '@hooks/useTrendingRepos';
import FilterBar from '@components/FilterBar/FilterBar';
import TrendingRepoList from './TrendingRepoList';
import { GitHubAuthProvider } from '@contexts/GitHubAuthContext';

export default function TrendingReposContainer() {
  const { error, pending, repoList, ...filterBarProps } = useTrendingRepos();

  return (
    <GitHubAuthProvider>
      <div className="px-6">
        <FilterBar {...filterBarProps} />
        <main className="px-6 pt-0 py-8 relative">
          {error && (
            <div className="text-center text-red-600 dark:text-red-400">
              {error}
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
    </GitHubAuthProvider>
  );
}
