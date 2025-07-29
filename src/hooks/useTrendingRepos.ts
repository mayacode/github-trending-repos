import { useCallback, useEffect, useReducer } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Repo, UseTrendingRepoReturn } from '@types';
import { getLastWeekRange, getTrendingReposUrl } from '@helpers/helperFunctions';

interface TrendingReposState {
  availableLanguages: string[];
  error: string;
  language: string;
  pending: boolean;
  perPage: number;
  repoList: Repo[];
  search: string;
  debouncedSearch: string;
}

const initialState: TrendingReposState = {
  availableLanguages: [],
  error: '',
  language: 'All',
  pending: false,
  perPage: 20,
  repoList: [],
  search: '',
  debouncedSearch: '',
};

type TrendingReposAction =
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_PER_PAGE'; payload: number }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_DEBOUNCED_SEARCH'; payload: string }
  | { type: 'FETCH_SUCCESS'; payload: { repos: Repo[]; languages: string[] } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'FETCH_PENDING'; payload: boolean };

function trendingReposReducer(
  state: TrendingReposState,
  action: TrendingReposAction
): TrendingReposState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_PER_PAGE':
      return { ...state, perPage: action.payload };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_DEBOUNCED_SEARCH':
      return { ...state, debouncedSearch: action.payload };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        repoList: action.payload.repos,
        availableLanguages: action.payload.languages,
        error: '',
        pending: false,
      };
    case 'FETCH_ERROR':
      return { ...state, error: action.payload, pending: false };
    case 'FETCH_PENDING':
      return { ...state, pending: action.payload };
    default:
      return state;
  }
}

export function useTrendingRepos(): UseTrendingRepoReturn {
  const [state, dispatch] = useReducer(trendingReposReducer, initialState);
  const { start, end } = getLastWeekRange();

  const {
    availableLanguages,
    error,
    language,
    pending,
    perPage,
    repoList,
    search,
    debouncedSearch,
  } = state;

  const queryKey = [
    'trendingRepos',
    debouncedSearch,
    language,
    perPage,
    start,
    end,
  ];

  const { refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      dispatch({ type: 'FETCH_PENDING', payload: true });

      try {
        const url = getTrendingReposUrl(language, perPage, start, end, debouncedSearch);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        const repos = data.items || [];

        // extract languages from repos
        const languagesSet = new Set<string>();
        repos.forEach((repo: Repo) => {
          if (repo.language) {
            languagesSet.add(repo.language);
          }
        });

        const languages = Array.from(languagesSet).sort();

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: { repos, languages },
        });

        return { repos, languages };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Something went wrong';
        dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
        throw err;
      }
    },
    enabled: true, // Enable the query by default
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch({ type: 'SET_DEBOUNCED_SEARCH', payload: search });
    }, 700);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    refetch();
  }, [debouncedSearch, language, perPage, refetch]);

  const changePerPage = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch({ type: 'SET_PER_PAGE', payload: parseInt(e.target.value) });
    },
    []
  );

  const changeSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH', payload: e.target.value });
  }, []);

  const changeLanguage = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch({ type: 'SET_LANGUAGE', payload: e.target.value });
    },
    []
  );

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
  };
}
