import { renderHook, waitFor, act } from '@tests/test-utils';
import { vi } from 'vitest';
import { useAuthCallback, useHandleCallback } from '../useAuthCallback';

// Mock the GitHub auth service
vi.mock('@services/githubAuth', () => ({
  handleCallback: vi.fn(),
  starRepository: vi.fn(),
  getAuthState: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    token: null,
  })),
}));

// Mock window.location
const mockLocation = {
  search: '',
  href: '',
  origin: 'http://localhost:5173',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock URLSearchParams
const mockURLSearchParams = new Map();
const mockGet = vi.fn((key: string) => mockURLSearchParams.get(key));

Object.defineProperty(window, 'URLSearchParams', {
  value: vi.fn(() => ({
    get: mockGet,
  })),
  writable: true,
});

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

describe('useAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockURLSearchParams.clear();
    mockLocation.search = '';
    mockLocation.href = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return authCallback as false when no code and state parameters', () => {
    // No parameters set

    const { result } = renderHook(() => useAuthCallback());

    expect(result.current.authCallback).toBe(false);
  });

  it('should return authCallback as true when both code and state parameters are present', () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');

    const { result } = renderHook(() => useAuthCallback());

    expect(result.current.authCallback).toBe(true);
  });

  it('should return authCallback as false when only code parameter is present', () => {
    mockURLSearchParams.set('code', 'test-code');
    // state is not set

    const { result } = renderHook(() => useAuthCallback());

    expect(result.current.authCallback).toBe(false);
  });

  it('should return authCallback as false when only state parameter is present', () => {
    mockURLSearchParams.set('state', 'test-state');
    // code is not set

    const { result } = renderHook(() => useAuthCallback());

    expect(result.current.authCallback).toBe(false);
  });
});

describe('useHandleCallback', () => {
  let mockHandleCallback: any;
  let mockStarRepository: any;

  beforeEach(async () => {
    const githubAuth = await import('@services/githubAuth');
    mockHandleCallback = vi.mocked(githubAuth.handleCallback);
    mockStarRepository = vi.mocked(githubAuth.starRepository);

    vi.clearAllMocks();
    mockURLSearchParams.clear();
    mockLocation.search = '';
    mockLocation.href = '';

    // Reset sessionStorage mock to return null by default
    mockSessionStorage.getItem.mockReturnValue(null);
    mockSessionStorage.setItem.mockImplementation(() => {});

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with loading status when valid parameters are present', async () => {
    // Set up valid parameters so the hook doesn't immediately error
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({ success: true });

    // Ensure sessionStorage returns null for processed code check
    mockSessionStorage.getItem.mockImplementation((key: string) => {
      if (key === 'processed_oauth_code') return null;
      return null;
    });

    const { result } = renderHook(() => useHandleCallback());

    // The hook should start with loading status before the async operation completes
    await waitFor(() => {
      expect(result.current.status).toBe('loading');
    });
    expect(result.current.message).toBe('');
  });

  it('should immediately show error when no parameters are present', () => {
    // No parameters set

    const { result } = renderHook(() => useHandleCallback());

    expect(result.current.status).toBe('error');
    expect(result.current.message).toBe(
      'Missing authorization code or state parameter'
    );
  });

  it('should handle GitHub error parameter', async () => {
    mockURLSearchParams.set('error', 'access_denied');
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.message).toBe('Authentication failed: access_denied');
    expect(mockHandleCallback).not.toHaveBeenCalled();
  });

  it('should handle missing code parameter', async () => {
    mockURLSearchParams.set('state', 'test-state');
    // code is not set

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.message).toBe(
      'Missing authorization code or state parameter'
    );
    expect(mockHandleCallback).not.toHaveBeenCalled();
  });

  it('should handle missing state parameter', async () => {
    mockURLSearchParams.set('code', 'test-code');
    // state is not set

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.message).toBe(
      'Missing authorization code or state parameter'
    );
    expect(mockHandleCallback).not.toHaveBeenCalled();
  });

  it('should handle successful authentication without target repo', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({ success: true });

    // Ensure sessionStorage returns null for processed code check
    mockSessionStorage.getItem.mockImplementation((key: string) => {
      if (key === 'processed_oauth_code') return null;
      return null;
    });

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.message).toBe(
      'Authentication successful! Redirecting...'
    );
    expect(mockHandleCallback).toHaveBeenCalledWith('test-code', 'test-state');
    expect(mockStarRepository).not.toHaveBeenCalled();
  });

  it('should handle successful authentication with target repo and successful starring', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({
      success: true,
      targetRepo: 'facebook/react',
    });
    mockStarRepository.mockResolvedValue(true);

    // Ensure sessionStorage returns null for processed code check
    mockSessionStorage.getItem.mockImplementation((key: string) => {
      if (key === 'processed_oauth_code') return null;
      return null;
    });

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.message).toBe(
      'Authentication successful! Repository "facebook/react" has been starred. Redirecting...'
    );
    expect(mockHandleCallback).toHaveBeenCalledWith('test-code', 'test-state');
    expect(mockStarRepository).toHaveBeenCalledWith('facebook', 'react');
  });

  it('should handle successful authentication with target repo but failed starring', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({
      success: true,
      targetRepo: 'facebook/react',
    });
    mockStarRepository.mockResolvedValue(false);

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.message).toBe(
      'Authentication successful! Redirecting...'
    );
    expect(mockHandleCallback).toHaveBeenCalledWith('test-code', 'test-state');
    expect(mockStarRepository).toHaveBeenCalledWith('facebook', 'react');
  });

  it('should handle successful authentication with target repo but starring throws error', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({
      success: true,
      targetRepo: 'facebook/react',
    });
    mockStarRepository.mockRejectedValue(new Error('Starring failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.message).toBe(
      'Authentication successful! Redirecting...'
    );
    expect(mockHandleCallback).toHaveBeenCalledWith('test-code', 'test-state');
    expect(mockStarRepository).toHaveBeenCalledWith('facebook', 'react');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to star repository:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should handle authentication failure', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.message).toBe(
      'Authentication failed. Please try again.'
    );
    expect(mockHandleCallback).toHaveBeenCalledWith('test-code', 'test-state');
  });

  it('should handle handleCallback throwing error', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.message).toBe(
      'An error occurred during authentication.'
    );
    expect(mockHandleCallback).toHaveBeenCalledWith('test-code', 'test-state');
  });

  it('should redirect after successful authentication', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({ success: true });

    renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(mockHandleCallback).toHaveBeenCalled();
    });

    // Fast-forward timers to trigger redirect
    vi.advanceTimersByTime(2000);

    expect(mockLocation.href).toBe('http://localhost:5173');
  });

  it('should handle target repo with no slash (invalid format)', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({
      success: true,
      targetRepo: 'single-repo',
    });
    mockStarRepository.mockResolvedValue(true);

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.message).toBe(
      'Authentication successful! Redirecting...'
    );
    expect(mockStarRepository).not.toHaveBeenCalled();
  });

  it('should handle target repo with multiple slashes', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({
      success: true,
      targetRepo: 'org/team/repo',
    });
    mockStarRepository.mockResolvedValue(true);

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.message).toBe(
      'Authentication successful! Repository "org/team/repo" has been starred. Redirecting...'
    );
    expect(mockStarRepository).toHaveBeenCalledWith('org', 'team/repo');
  });

  it('should handle target repo with special characters', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({
      success: true,
      targetRepo: 'user/repo-name_with.dots',
    });
    mockStarRepository.mockResolvedValue(true);

    // Ensure sessionStorage returns null for processed code check
    mockSessionStorage.getItem.mockImplementation((key: string) => {
      if (key === 'processed_oauth_code') return null;
      return null;
    });

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.message).toBe(
      'Authentication successful! Repository "user/repo-name_with.dots" has been starred. Redirecting...'
    );
    expect(mockStarRepository).toHaveBeenCalledWith(
      'user',
      'repo-name_with.dots'
    );
  });

  it('should handle target repo with multiple slashes correctly', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({
      success: true,
      targetRepo: 'org/team/subteam/project-name',
    });
    mockStarRepository.mockResolvedValue(true);

    // Ensure sessionStorage returns null for processed code check
    mockSessionStorage.getItem.mockImplementation((key: string) => {
      if (key === 'processed_oauth_code') return null;
      return null;
    });

    const { result } = renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.message).toBe(
      'Authentication successful! Repository "org/team/subteam/project-name" has been starred. Redirecting...'
    );
    expect(mockStarRepository).toHaveBeenCalledWith(
      'org',
      'team/subteam/project-name'
    );
  });

  it('should prevent double execution with processed code', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockSessionStorage.getItem.mockReturnValue('test-code'); // Already processed

    const { result } = renderHook(() => useHandleCallback());

    // Should not call handleCallback since code was already processed
    expect(mockHandleCallback).not.toHaveBeenCalled();
    expect(result.current.status).toBe('loading');
    expect(result.current.message).toBe('');
  });

  it('should set processed code in sessionStorage', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({ success: true });

    renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'processed_oauth_code',
        'test-code'
      );
    });
  });

  it('should handle redirect timeout', async () => {
    mockURLSearchParams.set('code', 'test-code');
    mockURLSearchParams.set('state', 'test-state');
    mockHandleCallback.mockResolvedValue({ success: true });

    // Ensure sessionStorage returns null for processed code check
    mockSessionStorage.getItem.mockImplementation((key: string) => {
      if (key === 'processed_oauth_code') return null;
      return null;
    });

    renderHook(() => useHandleCallback());

    await waitFor(() => {
      expect(mockHandleCallback).toHaveBeenCalled();
    });

    // Fast-forward timers to trigger redirect
    vi.advanceTimersByTime(2000);

    expect(mockLocation.href).toBe('http://localhost:5173');
  });
});
