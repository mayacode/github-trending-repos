import type { UseTrendingRepoReturn } from "../src/types";

export const repo = {
  id: 1,
  name: 'repo name',
  full_name: 'full repo name',
  description: 'repo description',
  html_url: 'some_url',
  stargazers_count: 10,
  language: 'JavaScript',
  forks_count: 3,
  owner: {
    login: 'username',
    avatar_url: 'avatar_url',
  }
}

export const hookUseTrendingReposReturnValue = {
  availableLanguages: ['JavaScript', 'TypeScript', 'Python'],
  changeLanguage: vi.fn(),
  changePerPage: vi.fn(),
  changeSearch: vi.fn(),
  end: '20',
  error: '',
  language: 'All',
  pending: false,
  perPage: 10,
  repoList: [repo],
  search: '',
  start: '1'
} as UseTrendingRepoReturn;
