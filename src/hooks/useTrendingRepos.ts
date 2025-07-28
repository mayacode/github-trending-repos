import { useEffect, useState } from "react";
import type { Repo } from "../types";

function getLastWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function useTrendingRepos() {
  const [language, setLanguage] = useState('All');
  const [pending, setPending] = useState(false);
  const [repoList, setRepoList] = useState<Repo[]>([]);
  const { start, end } = getLastWeekRange();

  function fetchRepos() {
    setPending(true);
    const url = `https://api.github.com/search/repositories?q=sort=stars&order=desc&per_page=20&created:${start}..${end}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setRepoList(data.items || []))
      .catch(err => console.error(err))
      .finally(() => setPending(false));
  }

  useEffect(() => {
    fetchRepos();
  }, [language]);

  return {
    end,
    repoList,
    start,
  }
}
