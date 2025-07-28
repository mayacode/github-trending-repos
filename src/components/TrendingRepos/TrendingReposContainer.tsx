import { useTrendingRepos } from "../../hooks/useTrendingRepos";
import FilterBar from "../FilterBar/FilterBar";
import TrendingRepoCard from "./TrendingRepoCard";

export default function TrendingReposContainer() {
  const { repoList, ...filterBarProps } = useTrendingRepos();

  return (
    <div className="px-6">
      <FilterBar {...filterBarProps} />
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {repoList.map(repo => (
          <TrendingRepoCard key={repo.id} repo={repo} />
        ))}
      </ul>
    </div>
  );
}
