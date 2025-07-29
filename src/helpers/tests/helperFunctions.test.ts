import { getLastWeekRange, getTrendingReposUrl } from '../helperFunctions';

describe('helperFunctions', () => {
  it('getLastWeekRange should return the correct data', () => {
    vi.useFakeTimers();
    const date = new Date(2025, 1, 1, 13);
    vi.setSystemTime(date);

    const { start, end } = getLastWeekRange();
    expect(start).toBe('2025-01-25');
    expect(end).toBe('2025-02-01');

    vi.useRealTimers();
  });

  it('getTrendingReposUrl should return the correct data', () => {
    let url = getTrendingReposUrl('JavaScript', 29, '2025-01-01', '2025-01-14', 'react');
    expect(url).toBe(`https://api.github.com/search/repositories?q=${encodeURIComponent('created:2025-01-01..2025-01-14 react language:JavaScript')}&sort=stars&order=desc&per_page=29`);

    url = getTrendingReposUrl('All', 17, '2025-01-01', '2025-01-14', 'react');
    expect(url).toBe(`https://api.github.com/search/repositories?q=${encodeURIComponent('created:2025-01-01..2025-01-14 react')}&sort=stars&order=desc&per_page=17`);

    url = getTrendingReposUrl('JavaScript', 29, '2025-01-01', '2025-01-14', '');
    expect(url).toBe(`https://api.github.com/search/repositories?q=${encodeURIComponent('created:2025-01-01..2025-01-14 language:JavaScript')}&sort=stars&order=desc&per_page=29`);
  });
});
