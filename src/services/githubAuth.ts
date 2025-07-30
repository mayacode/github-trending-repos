import { Octokit } from 'octokit';
import {
  constructGitHubAuthUrl,
  generateState,
  setTargetRepo,
  getTargetRepo,
  getToken,
  setToken,
  setUser,
  getUser,
  clearTargetRepo,
} from '@helpers/githubAuthHelpers';
import type { GitHubAuthState } from '@/types';
import { TOKEN_KEY, USER_KEY } from '@/constants';

let octokit: Octokit | null = null;

function initializeOctokit(): Octokit | null {
  const token = getToken();
  if (!token) return null;

  if (!octokit) {
    octokit = new Octokit({
      auth: token,
    });
  }

  return octokit;
}

// set the target repository for the oauth flow
export async function startAuth(targetRepo: string): Promise<void> {
  const state = generateState();

  // store target repository
  setTargetRepo(targetRepo);

  const authUrl = constructGitHubAuthUrl(state, window.location.origin);

  // store state for verification
  sessionStorage.setItem('github_oauth_state', state);

  // redirect to github
  window.location.href = authUrl;
}

// handle oauth callback
export async function handleCallback(
  code: string,
  state: string
): Promise<{ success: boolean; targetRepo?: string; error?: string }> {
  try {
    // verify state
    const storedState = sessionStorage.getItem('github_oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // get target repository
    const targetRepo = getTargetRepo();

    if (!targetRepo) {
      throw new Error(
        'Target repository not found - OAuth flow may have been interrupted'
      );
    }

    // exchange code for token using API route
    const response = await fetch('/api/github-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Token exchange failed: ${response.status} ${response.statusText} - ${data.error || 'Unknown error'}`
      );
    }

    if (data.error) {
      throw new Error(`GitHub error: ${data.error}`);
    }

    if (!data.access_token) {
      throw new Error('No access token received');
    }

    // create octokit instance with user token
    octokit = new Octokit({
      auth: data.access_token,
    });

    // get user info
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // store authentication data
    setToken(data.access_token);
    setUser(user);

    clearTargetRepo();
    sessionStorage.removeItem('github_oauth_state');

    // try to star the repository
    if (targetRepo) {
      const [owner, repoName] = targetRepo.split('/');
      try {
        const starSuccess = await starRepository(owner, repoName);
        if (starSuccess) {
          // repository was starred successfully, redirect
          window.location.href = window.location.origin;
          return { success: true, targetRepo };
        } else {
          // starring failed, redirect with warning
          window.location.href = `${window.location.origin}?success=true&warning=STAR_FAILED`;
          return { success: true, targetRepo }; // oauth succeeded, starring failed
        }
      } catch (starError) {
        console.error('Failed to star repository:', starError);
        // starring failed with error, redirect with warning
        window.location.href = `${window.location.origin}?success=true&warning=STAR_FAILED`;
        return { success: true, targetRepo }; // oauth succeeded, starring failed
      }
    }

    // no target repo, redirect with warning
    window.location.href = `${window.location.origin}?success=true&warning=NO_TARGET_REPO`;
    return { success: true, targetRepo }; // oauth succeeded, no target repo
  } catch (error: any) {
    console.error('OAuth callback error:', error);

    // check if it's our specific target repo error
    if (
      error.message ===
      'Target repository not found - OAuth flow may have been interrupted'
    ) {
      // redirect with success and warning info
      window.location.href = `${window.location.origin}?success=true&warning=NO_TARGET_REPO`;
      return { success: false };
    }

    // for other errors, redirect with generic error
    window.location.href = `${window.location.origin}?error=${encodeURIComponent(error.message)}`;
    return { success: false };
  }
}

// get all starred repositories for the authenticated user
export async function getStarredRepositories(): Promise<string[]> {
  const octokitInstance = initializeOctokit();
  if (!octokitInstance) {
    return [];
  }

  try {
    const { data: starredRepos } =
      await octokitInstance.rest.activity.listReposStarredByAuthenticatedUser({
        per_page: 100, // get up to 100 starred repos
      });

    return starredRepos.map(repo => repo.full_name);
  } catch (error) {
    console.error('Get starred repositories error:', error);
    return [];
  }
}

// star a repository
export async function starRepository(
  owner: string,
  repo: string
): Promise<boolean> {
  const octokitInstance = initializeOctokit();
  if (!octokitInstance) return false;

  try {
    await octokitInstance.rest.activity.starRepoForAuthenticatedUser({
      owner,
      repo,
    });
    return true;
  } catch (error) {
    console.error('Star repository error:', error);
    return false;
  }
}

// unstar a repository
export async function unstarRepository(
  owner: string,
  repo: string
): Promise<boolean> {
  const octokitInstance = initializeOctokit();
  if (!octokitInstance) return false;

  try {
    await octokitInstance.rest.activity.unstarRepoForAuthenticatedUser({
      owner,
      repo,
    });
    return true;
  } catch (error) {
    console.error('Unstar repository error:', error);
    return false;
  }
}

// get current authentication state
export function getAuthState(): GitHubAuthState {
  const token = getToken();
  const user = getUser();

  return {
    isAuthenticated: !!token && !!user,
    user: user,
    token: token,
  };
}

// logout
export function logout(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('github_oauth_state');
  clearTargetRepo();
  octokit = null;
}
