import { useTrendingRepos } from "../../hooks/useTrendingRepos";
import FilterBar from "../FilterBar/FilterBar";

export default function TrendingReposContainer() {
  const { end, repoList, start } = useTrendingRepos();
  console.log(end, repoList, start);
  return (
    <div>
      <FilterBar start={start} end={end} />
      <div className="flex flex-col gap-4">
        {repoList.map(repo => (
          <div key={repo.id}>
            <h3>{repo.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
