import { act, renderHook, waitFor } from "@testing-library/react";
import { useTrendingRepos } from "../useTrendingRepos";
import { repo } from "../../../tests/test_helper";

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ items: [repo] }),
  } as unknown as Response),
);

describe('useTrendingRepos', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('should return the correct data', async () => {
    vi.useFakeTimers();
    const date = new Date(2025, 1, 1, 13);
    vi.setSystemTime(date);
    
    const { result } = renderHook(() => useTrendingRepos());
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
    const { result } = renderHook(() => useTrendingRepos());
    await waitFor(() => expect(result.current.error).toEqual('Something went wrong'));
    expect(result.current.repoList).toEqual([]);
    expect(result.current.availableLanguages).toEqual([]);
  });

  it('should change the language', async () => {
    const { result } = renderHook(() => useTrendingRepos());

    expect(result.current.language).toEqual('All');

    await act(async () => { 
      result.current.changeLanguage({ target: { value: 'JavaScript' } } as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.language).toEqual('JavaScript');
  });

  it('should change the per page', async () => {
    const { result } = renderHook(() => useTrendingRepos());

    expect(result.current.perPage).toEqual(20);

    await act(async () => { 
      result.current.changePerPage({ target: { value: '15' } } as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.perPage).toEqual(15);
  });

  it('should debounce search changes', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ items: [repo] }),
      } as unknown as Response)
    );
    global.fetch = mockFetch;

    const { result } = renderHook(() => useTrendingRepos());

    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.changeSearch({ target: { value: 'a' } } as React.ChangeEvent<HTMLInputElement>);
    });
    
    await act(async () => {
      result.current.changeSearch({ target: { value: 'ab' } } as React.ChangeEvent<HTMLInputElement>);
    });
    
    await act(async () => {
      result.current.changeSearch({ target: { value: 'abc' } } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(700);
    });

    // Should have been called again with the final search value
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.stringContaining('abc')
    );
  });
});