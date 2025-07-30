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

export interface UseTrendingRepoReturn {
  availableLanguages: string[];
  changeLanguage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  changePerPage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  changeSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  end: string;
  error: string;
  language: string;
  pending: boolean;
  perPage: number;
  search: string;
  repoList: Repo[];
  start: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
}

export interface GitHubAuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
}

export interface LoginModalReturn {
  modalIsOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}
