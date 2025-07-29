export function getLastWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function getTrendingReposUrl(language: string, perPage: number, start: string, end: string, debouncedSearch: string) {
  const queryLanguage = language === 'All' ? '' : ` language:${language}`;
  const query = `created:${start}..${end}${debouncedSearch ? ` ${debouncedSearch}` : ''}${queryLanguage}`;
  return `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`;
}
