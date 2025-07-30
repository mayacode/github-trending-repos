import type { UseTrendingRepoReturn } from '@types';
import TrendingRepoCard from './TrendingRepoCard';

export type TrendingRepoListProps = Pick<UseTrendingRepoReturn, 'repoList'>;

export default function TrendingReposList({ repoList }: TrendingRepoListProps) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {repoList.map(repo => (
        <TrendingRepoCard key={repo.id} repo={repo} />
      ))}
    </ul>
  );
}
