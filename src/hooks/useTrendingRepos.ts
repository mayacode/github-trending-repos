import { useEffect, useRef, useState } from "react";
import type { Repo, UseTrendingRepoReturn } from "../types";
import { getLastWeekRange } from "../helpers/helperFunctions";

export function useTrendingRepos(): UseTrendingRepoReturn {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('All');
  const [pending, setPending] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [repoList, setRepoList] = useState<Repo[]>([]);
  const [search, setSearch] = useState('');
  const { start, end } = getLastWeekRange();

  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  const lastSearch = useRef(search);

  function fetchRepos() {
    setPending(true);

    let query = `created:${start}..${end} ${search} language:${language}`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=descc&per_page=${perPage}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setRepoList(data.items || []);
        const languages = new Set<string>();
        data.items?.forEach((repo: any) => {
          if (repo.language) {
            languages.add(repo.language);
          }
        });
        setAvailableLanguages(Array.from(languages).sort());
        setError('');
      })
      .catch(err => setError(err.message || 'Something went wrong'))
      .finally(() => setPending(false));
  }

  useEffect(() => {
    if (lastSearch.current !== search) {
      if (debounceTimeout) clearTimeout(debounceTimeout);

      debounceTimeout = setTimeout(() => {
        fetchRepos();
      }, 700);
      lastSearch.current = search;
    } else {
      fetchRepos();
    }

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
    // eslint-disable-next-line
  }, [language, perPage, search]);

  function changePerPage(e: React.ChangeEvent<HTMLSelectElement>) {
    setPerPage(parseInt(e.target.value));
  }

  function changeSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function changeLanguage(e: React.ChangeEvent<HTMLSelectElement>) {
    setLanguage(e.target.value);
  }

  return {
    availableLanguages,
    changeLanguage,
    changePerPage,
    changeSearch,
    end,
    error,
    language,
    pending,
    perPage,
    repoList,
    search,
    start,
  }
}
