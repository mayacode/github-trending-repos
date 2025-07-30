import { useCallback, useEffect, useReducer, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  LoginModalReturn,
  Repo,
  UseTrendingRepoReturn,
  UseStarredReposReturn,
} from '@types';
import {
  getLastWeekRange,
  getTrendingReposUrl,
} from '@helpers/helperFunctions';
import {
  getAuthState,
  getStarredRepositories,
  starRepository,
  unstarRepository,
} from '@services/githubAuth';
import { getSelectedRepo, setSelectedRepo } from '@helpers/githubAuthHelpers';

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
        const url = getTrendingReposUrl(
          language,
          perPage,
          start,
          end,
          debouncedSearch
        );

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
    enabled: true, // enable the query by default
    staleTime: 5 * 60 * 1000, // consider data stale after 5 minutes
    refetchOnWindowFocus: false, // don't refetch when window regains focus
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

export function useAuthMessage() {
  const [authMessage, setAuthMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    // check for oauth parameters in url
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const warning = urlParams.get('warning');
    const error = urlParams.get('error');

    if (success === 'true' && warning === 'NO_TARGET_REPO') {
      setAuthMessage({
        type: 'success',
        message:
          "Authentication successful! You are now logged in to GitHub. Repository wasn't starred, please try again.",
      });
      // clear the parameters from uel
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      newUrl.searchParams.delete('warning');
      window.history.replaceState({}, '', newUrl.toString());
    } else if (success === 'true' && warning === 'STAR_FAILED') {
      setAuthMessage({
        type: 'success',
        message:
          'Authentication successful! You are now logged in to GitHub. Repository starring failed, please try again.',
      });
      // clear the parameters from url
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      newUrl.searchParams.delete('warning');
      window.history.replaceState({}, '', newUrl.toString());
    } else if (error) {
      setAuthMessage({
        type: 'error',
        message: `Authentication failed: ${error}`,
      });
      // clear the error from url
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);

  return { authMessage };
}

type UseStarredReposProps = Pick<LoginModalReturn, 'openLoginModal'>;

export function useStarredRepos({
  openLoginModal,
}: UseStarredReposProps): UseStarredReposReturn {
  const [loadingStars, setLoadingStars] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const authState = getAuthState();

  // Use React Query v5 syntax for starred repos with proper error handling
  const {
    data: starredRepos = new Set<string>(),
    isLoading: isLoadingStarred,
    isError: isErrorStarred,
    error: starredError,
  } = useQuery({
    queryKey: ['starred-repos'],
    queryFn: async () => {
      if (!authState.isAuthenticated) {
        return new Set<string>();
      }
      const starredRepoNames = await getStarredRepositories();
      return new Set(starredRepoNames);
    },
    enabled: authState.isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Retry up to 2 times for starred repos
      if (failureCount >= 2) return false;
      if (error instanceof Error && error.message.includes('401')) return false; // Auth errors
      return true;
    },
  });

  // Mutation for starring/unstarring repos with optimistic updates
  const starMutation = useMutation({
    mutationFn: async ({
      owner,
      repo,
      isStarring,
    }: {
      owner: string;
      repo: string;
      isStarring: boolean;
    }) => {
      if (isStarring) {
        return await starRepository(owner, repo);
      } else {
        return await unstarRepository(owner, repo);
      }
    },
    onMutate: async ({ owner, repo, isStarring }) => {
      // cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['starred-repos'] });

      // snapshot the previous value
      const previousStarred = queryClient.getQueryData(['starred-repos']) as
        | Set<string>
        | undefined;

      // optimistically update to the new value
      const repoFullName = `${owner}/${repo}`;
      queryClient.setQueryData(
        ['starred-repos'],
        (old: Set<string> | undefined) => {
          const newSet = new Set(old || []);
          if (isStarring) {
            newSet.add(repoFullName);
          } else {
            newSet.delete(repoFullName);
          }
          return newSet;
        }
      );

      // return a context object with the snapshotted value
      return { previousStarred };
    },
    onError: (err, variables, context) => {
      // if the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStarred) {
        queryClient.setQueryData(['starred-repos'], context.previousStarred);
      }
    },
  });

  const handleStarClick = async (repo: Repo, modalIsOpen: boolean) => {
    const authState = getAuthState();

    if (!authState.isAuthenticated) {
      setSelectedRepo(repo.full_name);
      if (!modalIsOpen) {
        openLoginModal();
      }
      return;
    }

    const [owner, repoName] = repo.full_name.split('/');
    const isCurrentlyStarred = starredRepos.has(repo.full_name);

    setLoadingStars(prev => new Set(prev).add(repo.full_name));

    try {
      await starMutation.mutateAsync({
        owner,
        repo: repoName,
        isStarring: !isCurrentlyStarred,
      });
    } catch (error) {
      console.error('Star/unstar error:', error);
    } finally {
      setLoadingStars(prev => {
        const newSet = new Set(prev);
        newSet.delete(repo.full_name);
        return newSet;
      });
    }
  };

  // show error state for starred repos
  if (isErrorStarred && authState.isAuthenticated) {
    console.error('Failed to load starred repos:', starredError);
  }

  return {
    handleStarClick,
    starredRepos,
    selectedRepo: getSelectedRepo(),
    loadingStars,
    isPending: starMutation.isPending,
  };
}
