import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const customRender = (ui: React.ReactElement, options: RenderOptions = {}) =>
  render(ui, {
    wrapper: Wrapper,
    ...options,
  });

// Test helper functions
export const mockWindowLocation = (href: string, search: string) => {
  Object.defineProperty(window, 'location', {
    value: {
      href,
      search,
      history: { replaceState: vi.fn() },
    },
    writable: true,
  });
};

export const mockWindowHistory = (replaceState: ReturnType<typeof vi.fn>) => {
  Object.defineProperty(window, 'history', {
    value: { replaceState },
    writable: true,
  });
};

export const mockAuthenticatedUser = async () => {
  const { getAuthState } = await import('@services/githubAuth');
  vi.mocked(getAuthState).mockReturnValue({
    isAuthenticated: true,
    user: {
      id: 1,
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png',
    },
    token: 'test-token',
  });
};

export const mockUnauthenticatedUser = async () => {
  const { getAuthState } = await import('@services/githubAuth');
  vi.mocked(getAuthState).mockReturnValue({
    isAuthenticated: false,
    user: null,
    token: null,
  });
};

export const createTestRepo = async (
  owner: string = 'username',
  repoName: string = 'repo-name'
) => {
  // Import the repo from the test helper
  const { repo } = await import('./test_helper');
  return {
    ...repo,
    full_name: `${owner}/${repoName}`,
    name: repoName,
    owner: { login: owner, avatar_url: 'avatar_url' },
  };
};

export const renderUseStarredRepos = async (
  openLoginModal: ReturnType<typeof vi.fn>
) => {
  const { renderHook } = await import('@testing-library/react');
  const { useStarredRepos } = await import('../src/hooks/useTrendingRepos');

  return renderHook(() => useStarredRepos({ openLoginModal }), {
    wrapper: Wrapper,
  });
};

export const getMockedServices = async () => {
  const {
    getAuthState,
    getStarredRepositories,
    starRepository,
    unstarRepository,
  } = await import('@services/githubAuth');
  const { getSelectedRepo, setSelectedRepo } = await import(
    '@/helpers/githubAuthHelpers'
  );

  return {
    getAuthState: vi.mocked(getAuthState),
    getStarredRepositories: vi.mocked(getStarredRepositories),
    starRepository: vi.mocked(starRepository),
    unstarRepository: vi.mocked(unstarRepository),
    getSelectedRepo: vi.mocked(getSelectedRepo),
    setSelectedRepo: vi.mocked(setSelectedRepo),
  };
};

export const withConsoleErrorSpy = async (testFn: () => Promise<void>) => {
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  await testFn();
  consoleErrorSpy.mockRestore();
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render, Wrapper };
