import { REPO_NAME_KEY, TOKEN_KEY, USER_KEY } from '@constants';
import type { GitHubUser } from '@types';

// GitHub OAuth URL construction helper
export function constructGitHubAuthUrl(
  state: string,
  redirectUri?: string
): string {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const defaultRedirectUri = window.location.origin;

  const authUrl = `https://github.com/login/oauth/authorize?${new URLSearchParams(
    {
      client_id: clientId,
      redirect_uri: redirectUri || defaultRedirectUri,
      scope: 'public_repo',
      state: state,
    }
  ).toString()}`;

  return authUrl;
}

// generate a random state for the oauth flow
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

// store the target repository for the oauth flow
export function setTargetRepo(targetRepo: string): void {
  sessionStorage.setItem(REPO_NAME_KEY, targetRepo);
}

export function getTargetRepo(): string | null {
  return sessionStorage.getItem(REPO_NAME_KEY);
}

export function clearTargetRepo(): void {
  sessionStorage.removeItem(REPO_NAME_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setUser(user: GitHubUser): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): GitHubUser | null {
  const userStr = sessionStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Failed to parse user data from storage:', error);
    return null;
  }
}

export function getSelectedRepo(): string {
  return sessionStorage.getItem(REPO_NAME_KEY) || '';
}

export function setSelectedRepo(repoName: string): void {
  sessionStorage.setItem(REPO_NAME_KEY, repoName);
}

export function clearSelectedRepo(): void {
  sessionStorage.removeItem(REPO_NAME_KEY);
}
