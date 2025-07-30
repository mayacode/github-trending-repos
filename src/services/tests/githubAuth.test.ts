import { startAuth } from '../githubAuth';

// Mock Octokit
vi.mock('octokit', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      users: {
        getAuthenticated: vi.fn().mockResolvedValue({
          data: {
            id: 12345,
            login: 'testuser',
            name: 'Test User',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        }),
      },
      activity: {
        starRepoForAuthenticatedUser: vi.fn().mockResolvedValue({}),
        unstarRepoForAuthenticatedUser: vi.fn().mockResolvedValue({}),
        listReposStarredByAuthenticatedUser: vi.fn().mockResolvedValue({
          data: [],
        }),
      },
    },
  })),
}));

const mockRedirectUri = 'http://localhost:3000';

// mock window.location
const mockLocation = {
  href: '',
  origin: mockRedirectUri,
};

// mock sessionStorage
const mockSessionStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock Math.random for predictable state generation
const mockMathRandom = vi.fn();

describe('githubAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // set environment variable for tests
    import.meta.env.VITE_GITHUB_CLIENT_ID = 'test-client-id';

    // Mock window.location with proper href getter/setter
    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        get href() {
          return mockLocation.href;
        },
        set href(value: string) {
          mockLocation.href = value;
        },
      },
      writable: true,
    });

    // mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });

    // Mock Math.random
    Object.defineProperty(Math, 'random', {
      value: mockMathRandom,
      writable: true,
    });
  });

  describe('startAuth', () => {
    it('should generate state and redirect to GitHub OAuth', async () => {
      // mock Math.random to return predictable value
      mockMathRandom.mockReturnValue(0.123456789);

      await startAuth('my-repo');

      // verify both target repo and state were stored
      const calls = mockSessionStorage.setItem.mock.calls;
      expect(calls).toHaveLength(2);

      // check for target repo call (first)
      const targetRepoCall = calls.find(
        call => call[0] === 'github_target_repo'
      );
      expect(targetRepoCall).toBeDefined();
      expect(targetRepoCall![1]).toBe('my-repo');

      // check for state call (second)
      const stateCall = calls.find(call => call[0] === 'github_oauth_state');
      expect(stateCall).toBeDefined();
      expect(typeof stateCall![1]).toBe('string');
      expect(stateCall![1].length).toBeGreaterThan(0);

      // verify redirect URL was constructed correctly
      expect(mockLocation.href).toContain(
        'https://github.com/login/oauth/authorize'
      );
      expect(mockLocation.href).toContain('client_id=test-client-id');
      expect(mockLocation.href).toContain(
        'redirect_uri=http%3A%2F%2Flocalhost%3A3000'
      );
      expect(mockLocation.href).toContain('scope=public_repo');
      expect(mockLocation.href).toContain('state=');
    });

    it('should store target repository when provided', async () => {
      mockMathRandom.mockReturnValue(0.123456789);

      await startAuth('test-repo');

      // verify target repo was stored
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'github_target_repo',
        'test-repo'
      );

      // verify state was stored
      const calls = mockSessionStorage.setItem.mock.calls;
      const stateCall = calls.find(call => call[0] === 'github_oauth_state');

      expect(stateCall).toBeDefined();
      expect(typeof stateCall![1]).toBe('string');
      expect(stateCall![1].length).toBeGreaterThan(0);

      // verify redirect URL
      expect(mockLocation.href).toContain(
        'https://github.com/login/oauth/authorize'
      );
      expect(mockLocation.href).toContain('client_id=test-client-id');
      expect(mockLocation.href).toContain(
        'redirect_uri=http%3A%2F%2Flocalhost%3A3000'
      );
      expect(mockLocation.href).toContain('scope=public_repo');
      expect(mockLocation.href).toContain('state=');
    });

    it('should handle valid repository name', async () => {
      mockMathRandom.mockReturnValue(0.123456789);

      await startAuth('facebook/react');

      // verify both state and target repo were stored
      const calls = mockSessionStorage.setItem.mock.calls;
      expect(calls).toHaveLength(2);

      // check for state call
      const stateCall = calls.find(call => call[0] === 'github_oauth_state');
      expect(stateCall).toBeDefined();
      expect(typeof stateCall![1]).toBe('string');
      expect(stateCall![1].length).toBeGreaterThan(0);

      // check for target repo call
      const targetRepoCall = calls.find(
        call => call[0] === 'github_target_repo'
      );
      expect(targetRepoCall).toBeDefined();
      expect(targetRepoCall![1]).toBe('facebook/react');
    });

    it('should generate a valid state string', async () => {
      mockMathRandom.mockReturnValue(0.123456789);

      await startAuth('test-repo');

      const calls = mockSessionStorage.setItem.mock.calls;
      const stateCall = calls.find(call => call[0] === 'github_oauth_state');

      expect(stateCall).toBeDefined();
      expect(typeof stateCall![1]).toBe('string');
      expect(stateCall![1].length).toBeGreaterThan(0);
      expect(stateCall![1].length).toBeLessThanOrEqual(15);
    });

    it('should generate a state when called', async () => {
      mockMathRandom.mockReturnValue(0.123456789);

      await startAuth('test-repo');

      const calls = mockSessionStorage.setItem.mock.calls;
      const stateCall = calls.find(call => call[0] === 'github_oauth_state');

      expect(stateCall).toBeDefined();
      expect(typeof stateCall![1]).toBe('string');
      expect(stateCall![1].length).toBeGreaterThan(0);
    });

    it('should construct URL with correct parameters', async () => {
      mockMathRandom.mockReturnValue(0.123456789);

      await startAuth('test-repo');

      expect(mockLocation.href).toContain(
        'https://github.com/login/oauth/authorize'
      );
      expect(mockLocation.href).toContain('client_id=test-client-id');
      expect(mockLocation.href).toContain(
        'redirect_uri=http%3A%2F%2Flocalhost%3A3000'
      );
      expect(mockLocation.href).toContain('scope=public_repo');
      expect(mockLocation.href).toContain('state=');
    });

    it('should handle different redirect URIs', async () => {
      // mock different origin
      const mockLocationWithDifferentOrigin = {
        ...mockLocation,
        origin: 'https://example.com',
        get href() {
          return mockLocation.href;
        },
        set href(value: string) {
          mockLocation.href = value;
        },
      };

      Object.defineProperty(window, 'location', {
        value: mockLocationWithDifferentOrigin,
        writable: true,
      });

      mockMathRandom.mockReturnValue(0.123456789);

      await startAuth('test-repo');

      expect(mockLocation.href).toContain(
        'https://github.com/login/oauth/authorize'
      );
      expect(mockLocation.href).toContain(
        'redirect_uri=https%3A%2F%2Fexample.com'
      );
      expect(mockLocation.href).toContain('client_id=test-client-id');
    });
  });

  describe('state generation', () => {
    it('should generate state with correct format', async () => {
      mockMathRandom.mockReturnValue(0.123456789);

      await startAuth('my-repo');

      // state should be a string generated from Math.random
      const calls = mockSessionStorage.setItem.mock.calls;
      const stateCall = calls.find(call => call[0] === 'github_oauth_state');
      expect(stateCall).toBeDefined();
      expect(typeof stateCall![1]).toBe('string');
      expect(stateCall![1].length).toBeGreaterThan(0);
    });
  });

  describe('sessionStorage usage', () => {
    it('should store state in sessionStorage', async () => {
      mockMathRandom.mockReturnValue(0.123456789);

      await startAuth('my-repo');

      const calls = mockSessionStorage.setItem.mock.calls;
      const stateCall = calls.find(call => call[0] === 'github_oauth_state');
      expect(stateCall).toBeDefined();
      expect(typeof stateCall![1]).toBe('string');
      expect(stateCall![1].length).toBeGreaterThan(0);
    });

    it('should store target repo in sessionStorage when provided', async () => {
      mockMathRandom.mockReturnValue(0.123456789);

      await startAuth('my-repo');

      const calls = mockSessionStorage.setItem.mock.calls;
      const targetRepoCall = calls.find(
        call => call[0] === 'github_target_repo'
      );
      expect(targetRepoCall).toBeDefined();
      expect(targetRepoCall![1]).toBe('my-repo');
    });
  });

  describe('handleCallback', () => {
    const mockUser = {
      id: 12345,
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const mockTokenResponse = {
      access_token: 'test-access-token',
    };

    beforeEach(() => {
      // Mock fetch for API calls
      global.fetch = vi.fn();

      // Mock localStorage
      const mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
    });

    it('should handle successful OAuth callback', async () => {
      // Setup mocks
      const mockState = 'test-state-123';
      const mockCode = 'test-code-456';
      const mockTargetRepo = 'facebook/react';

      // Mock sessionStorage
      mockSessionStorage.getItem.mockImplementation((key: string) => {
        if (key === 'github_oauth_state') return mockState;
        if (key === 'github_target_repo') return mockTargetRepo;
        return null;
      });

      // Mock fetch response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const { handleCallback } = await import('../githubAuth');
      const result = await handleCallback(mockCode, mockState);

      expect(result.success).toBe(true);
      expect(result.targetRepo).toBe(mockTargetRepo);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'github_oauth_state'
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'github_target_repo'
      );
    });

    it('should handle invalid state parameter', async () => {
      const mockState = 'test-state-123';
      const mockCode = 'test-code-456';

      mockSessionStorage.getItem.mockReturnValue('different-state');

      // Suppress console.error for expected error case
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { handleCallback } = await import('../githubAuth');
      const result = await handleCallback(mockCode, mockState);

      expect(result.success).toBe(false);
      consoleErrorSpy.mockRestore();
    });

    it('should handle API error response', async () => {
      const mockState = 'test-state-123';
      const mockCode = 'test-code-456';

      mockSessionStorage.getItem.mockReturnValue(mockState);

      // Mock fetch error response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid code' }),
      });

      // Suppress console.error for expected error case
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { handleCallback } = await import('../githubAuth');
      const result = await handleCallback(mockCode, mockState);

      expect(result.success).toBe(false);
      consoleErrorSpy.mockRestore();
    });

    it('should handle missing access token', async () => {
      const mockState = 'test-state-123';
      const mockCode = 'test-code-456';

      mockSessionStorage.getItem.mockReturnValue(mockState);

      // Mock fetch response without access token
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Suppress console.error for expected error case
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { handleCallback } = await import('../githubAuth');
      const result = await handleCallback(mockCode, mockState);

      expect(result.success).toBe(false);
      consoleErrorSpy.mockRestore();
    });

    it('should clear target repository after successful callback', async () => {
      const mockState = 'test-state-123';
      const mockCode = 'test-code-456';
      const mockTargetRepo = 'facebook/react';

      // Mock sessionStorage
      mockSessionStorage.getItem.mockImplementation((key: string) => {
        if (key === 'github_oauth_state') return mockState;
        if (key === 'github_target_repo') return mockTargetRepo;
        return null;
      });

      // Mock fetch response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const { handleCallback } = await import('../githubAuth');
      const result = await handleCallback(mockCode, mockState);

      expect(result.success).toBe(true);
      expect(result.targetRepo).toBe(mockTargetRepo);

      // Verify both state and target repo are cleared
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'github_oauth_state'
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'github_target_repo'
      );

      // Verify the calls were made in the correct order
      const removeItemCalls = mockSessionStorage.removeItem.mock.calls;
      expect(removeItemCalls).toHaveLength(2);
      expect(removeItemCalls[0][0]).toBe('github_target_repo');
      expect(removeItemCalls[1][0]).toBe('github_oauth_state');
    });

    it('should handle missing target repository', async () => {
      const mockState = 'test-state-123';
      const mockCode = 'test-code-456';

      // Mock sessionStorage to return state but no target repo
      mockSessionStorage.getItem.mockImplementation((key: string) => {
        if (key === 'github_oauth_state') return mockState;
        if (key === 'github_target_repo') return null; // This is the key change
        return null;
      });

      // Mock fetch response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      // Suppress console.error for expected error case
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { handleCallback } = await import('../githubAuth');
      const result = await handleCallback(mockCode, mockState);

      expect(result.success).toBe(false);
      // The function now redirects immediately instead of returning error
      expect(result.error).toBeUndefined();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('starRepository', () => {
    beforeEach(() => {
      // Mock sessionStorage
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });
    });

    it('should star repository successfully when authenticated', async () => {
      // Mock sessionStorage with token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue('test-token'),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      const { starRepository } = await import('../githubAuth');
      const result = await starRepository('facebook', 'react');

      expect(result).toBe(true);
    });

    it('should return false when no token is available', async () => {
      // Mock sessionStorage without token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue(null),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      const { starRepository } = await import('../githubAuth');
      const result = await starRepository('facebook', 'react');

      expect(result).toBe(false);
    });

    it('should return false when API call fails', async () => {
      // Mock sessionStorage with token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue('test-token'),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Reset the module to clear the cached octokit instance
      vi.resetModules();

      // Suppress console.error for expected error case
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Override the existing Octokit mock to throw an error for this test
      const { Octokit } = await import('octokit');
      vi.mocked(Octokit).mockImplementation(
        () =>
          ({
            rest: {
              activity: {
                starRepoForAuthenticatedUser: vi
                  .fn()
                  .mockRejectedValue(new Error('API Error')),
              },
            },
          }) as any
      );

      const { starRepository } = await import('../githubAuth');
      const result = await starRepository('facebook', 'react');

      expect(result).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getStarredRepositories', () => {
    beforeEach(() => {
      // Mock sessionStorage
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });
    });

    it('should return starred repositories when authenticated', async () => {
      // Mock sessionStorage with token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockImplementation((key: string) => {
          if (key === 'github_token') return 'test-token';
          return null;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Reset modules to ensure clean state
      vi.resetModules();

      // Ensure Octokit mock is properly set up
      const { Octokit } = await import('octokit');
      vi.mocked(Octokit).mockImplementation(
        () =>
          ({
            rest: {
              activity: {
                listReposStarredByAuthenticatedUser: vi.fn().mockResolvedValue({
                  data: [
                    { full_name: 'facebook/react' },
                    { full_name: 'vuejs/vue' },
                    { full_name: 'angular/angular' },
                  ],
                }),
              },
            },
          }) as any
      );

      const { getStarredRepositories } = await import('../githubAuth');
      const result = await getStarredRepositories();

      expect(result).toEqual([
        'facebook/react',
        'vuejs/vue',
        'angular/angular',
      ]);
    });

    it('should return empty array when no token is available', async () => {
      // Mock sessionStorage without token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue(null),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      const { getStarredRepositories } = await import('../githubAuth');
      const result = await getStarredRepositories();

      expect(result).toEqual([]);
    });

    it('should return empty array when API call fails', async () => {
      // Mock sessionStorage with token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue('test-token'),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Reset the module to clear the cached octokit instance
      vi.resetModules();

      // Suppress console.error for expected error case
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Override the existing Octokit mock to throw an error for this test
      const { Octokit } = await import('octokit');
      vi.mocked(Octokit).mockImplementation(
        () =>
          ({
            rest: {
              activity: {
                listReposStarredByAuthenticatedUser: vi
                  .fn()
                  .mockRejectedValue(new Error('API Error')),
              },
            },
          }) as any
      );

      const { getStarredRepositories } = await import('../githubAuth');
      const result = await getStarredRepositories();

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('unstarRepository', () => {
    beforeEach(() => {
      // Mock sessionStorage
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });
    });

    it('should unstar repository successfully when authenticated', async () => {
      // Mock sessionStorage with token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockImplementation((key: string) => {
          if (key === 'github_token') return 'test-token';
          return null;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Reset modules to ensure clean state
      vi.resetModules();

      // Ensure Octokit mock is properly set up
      const { Octokit } = await import('octokit');
      vi.mocked(Octokit).mockImplementation(
        () =>
          ({
            rest: {
              activity: {
                unstarRepoForAuthenticatedUser: vi.fn().mockResolvedValue({}),
              },
            },
          }) as any
      );

      const { unstarRepository } = await import('../githubAuth');
      const result = await unstarRepository('facebook', 'react');

      expect(result).toBe(true);
    });

    it('should return false when no token is available', async () => {
      // Mock sessionStorage without token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue(null),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      const { unstarRepository } = await import('../githubAuth');
      const result = await unstarRepository('facebook', 'react');

      expect(result).toBe(false);
    });

    it('should return false when API call fails', async () => {
      // Mock sessionStorage with token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue('test-token'),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Reset the module to clear the cached octokit instance
      vi.resetModules();

      // Suppress console.error for expected error case
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Override the existing Octokit mock to throw an error for this test
      const { Octokit } = await import('octokit');
      vi.mocked(Octokit).mockImplementation(
        () =>
          ({
            rest: {
              activity: {
                unstarRepoForAuthenticatedUser: vi
                  .fn()
                  .mockRejectedValue(new Error('API Error')),
              },
            },
          }) as any
      );

      const { unstarRepository } = await import('../githubAuth');
      const result = await unstarRepository('facebook', 'react');

      expect(result).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getAuthState', () => {
    beforeEach(() => {
      // Mock sessionStorage
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Mock localStorage
      const mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
    });

    it('should return authenticated state when token and user are available', async () => {
      // Mock sessionStorage with token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockImplementation((key: string) => {
          if (key === 'github_token') return 'test-token';
          return null;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Mock sessionStorage with user
      const mockUser = {
        id: 12345,
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
      };
      mockSessionStorage.getItem.mockImplementation((key: string) => {
        if (key === 'github_token') return 'test-token';
        if (key === 'github_user') return JSON.stringify(mockUser);
        return null;
      });

      const { getAuthState } = await import('../githubAuth');
      const result = getAuthState();

      expect(result).toEqual({
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
      });
    });

    it('should return unauthenticated state when no token is available', async () => {
      // Mock sessionStorage without token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue(null),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // No localStorage needed since we use sessionStorage for all data

      const { getAuthState } = await import('../githubAuth');
      const result = getAuthState();

      expect(result).toEqual({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    });

    it('should return unauthenticated state when no user is available', async () => {
      // Mock sessionStorage with token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockImplementation((key: string) => {
          if (key === 'github_token') return 'test-token';
          return null;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // No localStorage needed since we use sessionStorage for all data

      const { getAuthState } = await import('../githubAuth');
      const result = getAuthState();

      expect(result).toEqual({
        isAuthenticated: false,
        user: null,
        token: 'test-token',
      });
    });

    it('should handle invalid user JSON in sessionStorage', async () => {
      // Mock sessionStorage with token and invalid user JSON
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockImplementation((key: string) => {
          if (key === 'github_token') return 'test-token';
          if (key === 'github_user') return 'invalid-json';
          return null;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Suppress console.error for expected error case
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { getAuthState } = await import('../githubAuth');
      const result = getAuthState();

      expect(result).toEqual({
        isAuthenticated: false,
        user: null,
        token: 'test-token',
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('logout', () => {
    let mockSessionStorage: any;
    let mockLocalStorage: any;

    beforeEach(() => {
      // Mock sessionStorage
      mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Mock localStorage
      mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
    });

    it('should clear all authentication data', async () => {
      const { logout } = await import('../githubAuth');
      logout();

      // Verify all storage items are cleared
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'github_token'
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('github_user');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'github_oauth_state'
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'github_target_repo'
      );
    });

    it('should clear all required storage keys', async () => {
      const { logout } = await import('../githubAuth');
      logout();

      // Verify the exact calls made
      const removeItemCalls = mockSessionStorage.removeItem.mock.calls;
      expect(removeItemCalls).toHaveLength(4); // github_token, github_user, github_oauth_state, github_target_repo

      const localStorageRemoveItemCalls =
        mockLocalStorage.removeItem.mock.calls;
      expect(localStorageRemoveItemCalls).toHaveLength(0); // No localStorage calls

      // Check specific keys
      expect(removeItemCalls).toEqual(
        expect.arrayContaining([
          ['github_token'],
          ['github_user'],
          ['github_oauth_state'],
          ['github_target_repo'],
        ])
      );
      expect(localStorageRemoveItemCalls).toEqual([]);
    });
  });

  describe('initializeOctokit', () => {
    beforeEach(() => {
      // Mock sessionStorage
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });
    });

    it('should return null when no token is available', async () => {
      // Mock sessionStorage without token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue(null),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Reset modules to ensure clean state
      vi.resetModules();

      // We need to test the internal function indirectly through starRepository
      const { starRepository } = await import('../githubAuth');

      // Since starRepository calls initializeOctokit internally, we can test it this way
      const result = await starRepository('test', 'repo');
      expect(result).toBe(false);
    });

    it('should create Octokit instance when token is available', async () => {
      // Mock sessionStorage with token
      const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue('test-token'),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Reset modules to ensure clean state
      vi.resetModules();

      // Restore the original Octokit mock
      const { Octokit } = await import('octokit');
      vi.mocked(Octokit).mockImplementation(
        () =>
          ({
            rest: {
              users: {
                getAuthenticated: vi.fn().mockResolvedValue({
                  data: {
                    id: 12345,
                    login: 'testuser',
                    name: 'Test User',
                    avatar_url: 'https://example.com/avatar.jpg',
                  },
                }),
              },
              activity: {
                starRepoForAuthenticatedUser: vi.fn().mockResolvedValue({}),
              },
            },
          }) as any
      );

      // Test through starRepository which uses initializeOctokit
      const { starRepository } = await import('../githubAuth');
      const result = await starRepository('facebook', 'react');

      expect(result).toBe(true);
    });
  });
});
