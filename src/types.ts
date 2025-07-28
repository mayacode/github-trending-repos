export interface DarkModeProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  forks_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface UseTrendingReposReturn {
  availableLanguages: string[];
  changeLanguage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  changePerPage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  changeSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  end: string;
  language: string;
  perPage: number;
  search: string;
  repoList: Repo[];
  start: string;
}
