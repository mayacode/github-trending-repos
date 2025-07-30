import {
  act,
  renderHook,
  waitFor,
  Wrapper,
  withConsoleErrorSpy,
  getMockedServices,
  renderUseStarredRepos,
  createTestRepo,
  mockUnauthenticatedUser,
} from '../../../tests/test-utils';
import {
  useTrendingRepos,
  useAuthMessage,
  useStarredRepos,
} from '../useTrendingRepos';
import { repo } from '@tests/test_helper';

vi.mock('@helpers/helperFunctions', () => {
  const mockGetTrendingReposUrl = vi.fn();
  return {
    getLastWeekRange: () => ({ start: '2025-01-25', end: '2025-02-01' }),
    getTrendingReposUrl: mockGetTrendingReposUrl,
  };
});

vi.mock('@services/githubAuth', () => ({
  getAuthState: vi.fn(),
  getStarredRepositories: vi.fn(),
  starRepository: vi.fn(),
  unstarRepository: vi.fn(),
}));

vi.mock('@/helpers/githubAuthHelpers', () => ({
  getSelectedRepo: vi.fn(),
  setSelectedRepo: vi.fn(),
}));

describe('useTrendingRepos', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ items: [repo] }),
      } as unknown as Response)
    );
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should return the correct data', async () => {
    vi.useFakeTimers();
    const date = new Date(2025, 1, 1, 13);
    vi.setSystemTime(date);

    const { result } = renderHook(() => useTrendingRepos(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.repoList).toEqual([repo]));
    expect(result.current.availableLanguages).toEqual(['JavaScript']);
    expect(result.current.end).toEqual('2025-02-01');
    expect(result.current.start).toEqual('2025-01-25');
    expect(result.current.pending).toEqual(false);
    expect(result.current.error).toEqual('');
    expect(result.current.language).toEqual('All');
    expect(result.current.perPage).toEqual(20);
    expect(result.current.search).toEqual('');
    expect(result.current.changeLanguage).toBeDefined();
    expect(result.current.changePerPage).toBeDefined();
    expect(result.current.changeSearch).toBeDefined();

    vi.useRealTimers();
  });

  it('should return the correct data when the API is down', async () => {
    global.fetch = vi.fn(() => Promise.reject('API is down'));

    const { result } = renderHook(() => useTrendingRepos(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.error).toEqual('Something went wrong');
    expect(result.current.repoList).toEqual([]);
    expect(result.current.availableLanguages).toEqual([]);
  });

  it('should change the language', async () => {
    const { result } = renderHook(() => useTrendingRepos(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.language).toEqual('All');

    await act(async () => {
      result.current.changeLanguage({
        target: { value: 'JavaScript' },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.language).toEqual('JavaScript');
  });

  it('should change amount results per page', async () => {
    const { result } = renderHook(() => useTrendingRepos(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.perPage).toEqual(20);

    await act(async () => {
      result.current.changePerPage({
        target: { value: '15' },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(result.current.perPage).toEqual(15);
  });

  it('should debounce search changes', async () => {
    const { result } = renderHook(() => useTrendingRepos(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.pending).toBe(false));

    // Get initial call count by accessing the mocked module
    const helperFunctions = await import('@helpers/helperFunctions');
    const initialCallCount = vi.mocked(helperFunctions.getTrendingReposUrl).mock
      .calls.length;

    await act(async () => {
      result.current.changeSearch({
        target: { value: 'a' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      result.current.changeSearch({
        target: { value: 'ab' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      result.current.changeSearch({
        target: { value: 'abc' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.search).toEqual('abc');

    expect(
      vi.mocked(helperFunctions.getTrendingReposUrl).mock.calls.length
    ).toBe(initialCallCount);

    await act(async () => {
      vi.advanceTimersByTime(700);
    });

    expect(vi.mocked(helperFunctions.getTrendingReposUrl)).toHaveBeenCalledWith(
      'All', // language
      20, // perPage
      '2025-01-25', // start
      '2025-02-01', // end
      'abc' // debouncedSearch
    );
  });
});

describe('useAuthMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no auth parameters are present', () => {
    // Mock window.location with no parameters
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        search: '',
        history: {
          replaceState: vi.fn(),
        },
      },
      writable: true,
    });

    const { result } = renderHook(() => useAuthMessage(), {
      wrapper: Wrapper,
    });

    expect(result.current.authMessage).toBeNull();
  });

  it('should show success message for NO_TARGET_REPO warning', () => {
    // Mock URL with success and warning parameters
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?success=true&warning=NO_TARGET_REPO',
        search: '?success=true&warning=NO_TARGET_REPO',
        history: {
          replaceState: vi.fn(),
        },
      },
      writable: true,
    });

    const { result } = renderHook(() => useAuthMessage(), {
      wrapper: Wrapper,
    });

    expect(result.current.authMessage).toEqual({
      type: 'success',
      message:
        "Authentication successful! You are now logged in to GitHub. Repository wasn't starred, please try again.",
    });
  });

  it('should show success message for STAR_FAILED warning', () => {
    // Mock URL with success and warning parameters
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?success=true&warning=STAR_FAILED',
        search: '?success=true&warning=STAR_FAILED',
        history: {
          replaceState: vi.fn(),
        },
      },
      writable: true,
    });

    const { result } = renderHook(() => useAuthMessage(), {
      wrapper: Wrapper,
    });

    expect(result.current.authMessage).toEqual({
      type: 'success',
      message:
        'Authentication successful! You are now logged in to GitHub. Repository starring failed, please try again.',
    });
  });

  it('should show error message for authentication failure', () => {
    // Mock URL with error parameter
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?error=access_denied',
        search: '?error=access_denied',
        history: {
          replaceState: vi.fn(),
        },
      },
      writable: true,
    });

    const { result } = renderHook(() => useAuthMessage(), {
      wrapper: Wrapper,
    });

    expect(result.current.authMessage).toEqual({
      type: 'error',
      message: 'Authentication failed: access_denied',
    });
  });

  it('should clear URL parameters after setting auth message', () => {
    const mockReplaceState = vi.fn();

    // Mock window.history.replaceState directly
    Object.defineProperty(window, 'history', {
      value: {
        replaceState: mockReplaceState,
      },
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?success=true&warning=NO_TARGET_REPO',
        search: '?success=true&warning=NO_TARGET_REPO',
      },
      writable: true,
    });

    renderHook(() => useAuthMessage(), {
      wrapper: Wrapper,
    });

    // Wait for the effect to run
    expect(mockReplaceState).toHaveBeenCalled();
  });
});

describe('useStarredRepos', () => {
  const mockOpenLoginModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial state when not authenticated', async () => {
    const services = await getMockedServices();

    await mockUnauthenticatedUser();
    services.getSelectedRepo.mockReturnValue('');

    const { result } = await renderUseStarredRepos(mockOpenLoginModal);

    expect(result.current.starredRepos).toEqual(new Set());
    expect(result.current.selectedRepo).toBe('');
    expect(result.current.handleStarClick).toBeDefined();
  });

  it('should open login modal when user is not authenticated and star is clicked', async () => {
    const services = await getMockedServices();

    await mockUnauthenticatedUser();
    services.getSelectedRepo.mockReturnValue('');
    services.setSelectedRepo.mockImplementation(() => {});

    const { result } = await renderUseStarredRepos(mockOpenLoginModal);

    await act(async () => {
      await result.current.handleStarClick(await createTestRepo(), false);
    });

    expect(mockOpenLoginModal).toHaveBeenCalled();
  });

  it('should not open login modal when modal is already open', async () => {
    const services = await getMockedServices();

    await mockUnauthenticatedUser();
    services.getSelectedRepo.mockReturnValue('');
    services.setSelectedRepo.mockImplementation(() => {});

    const { result } = await renderUseStarredRepos(mockOpenLoginModal);

    await act(async () => {
      await result.current.handleStarClick(await createTestRepo(), true);
    });

    expect(mockOpenLoginModal).not.toHaveBeenCalled();
  });

  it('should star repository when user is authenticated and repo is not starred (React Query not loading)', async () => {
    const services = await getMockedServices();

    const testRepo = await createTestRepo('username', 'repo-name');

    services.getAuthState.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://github.com/testuser.png',
      },
      token: 'test-token',
    });
    services.getStarredRepositories.mockResolvedValue(['username/repo-name']);
    services.unstarRepository.mockResolvedValue(true);
    services.getSelectedRepo.mockReturnValue('');

    const { result } = await renderUseStarredRepos(mockOpenLoginModal);

    await act(async () => {
      await result.current.handleStarClick(testRepo, false);
    });

    expect(services.getStarredRepositories).toHaveBeenCalled();
    expect(services.unstarRepository).not.toHaveBeenCalled();
  });

  it('should handle star/unstar errors gracefully', async () => {
    const services = await getMockedServices();

    const testRepo = await createTestRepo('username', 'repo-name');

    services.getAuthState.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://github.com/testuser.png',
      },
      token: 'test-token',
    });
    services.getStarredRepositories.mockResolvedValue(['username/repo-name']);
    services.unstarRepository.mockRejectedValue(new Error('API Error'));
    services.getSelectedRepo.mockReturnValue('');

    const { result } = await renderUseStarredRepos(mockOpenLoginModal);

    await withConsoleErrorSpy(async () => {
      await act(async () => {
        await result.current.handleStarClick(testRepo, false);
      });

      expect(services.unstarRepository).toHaveBeenCalledWith(
        'username',
        'repo-name'
      );
    });
  });

  it('should return selected repo from storage', async () => {
    const services = await getMockedServices();

    await mockUnauthenticatedUser();
    services.getSelectedRepo.mockReturnValue('facebook/react');

    const { result } = await renderUseStarredRepos(mockOpenLoginModal);

    expect(result.current.selectedRepo).toBe('facebook/react');
  });
});
