import { useEffect, useState } from "react";
import type { Repo, UseTrendingReposReturn } from "../types";

function getLastWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function useTrendingRepos(): UseTrendingReposReturn {
  // const [language, setLanguage] = useState('All');
  const [pending, setPending] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [repoList, setRepoList] = useState<Repo[]>([]);
  const { start, end } = getLastWeekRange();

  function fetchRepos() {
    setPending(true);

    let query = `&created:${start}..${end}&per_page=${perPage}`;
    const url = `https://api.github.com/search/repositories?q=sort=stars&order=desc${query}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setRepoList(data.items || []))
      .catch(err => console.error(err))
      .finally(() => setPending(false));
  }

  useEffect(() => {
    fetchRepos();
  }, [perPage]);

  function changePerPage(e: React.ChangeEvent<HTMLSelectElement>) {
    setPerPage(parseInt(e.target.value));
  }

  return {
    changePerPage,
    end,
    perPage,
    repoList,
    start,
  }
}
