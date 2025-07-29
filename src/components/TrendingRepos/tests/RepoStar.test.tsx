import React from 'react';
import { render, screen } from '@tests/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import RepoStar from '../RepoStar';
import { GitHubAuthProvider } from '@contexts/GitHubAuthContext';
import { repo } from '@tests/test_helper';

expect.extend(toHaveNoViolations);

const user = userEvent.setup();

vi.mock('@contexts/GitHubAuthContext', () => {
  const mockUseGitHubAuth = vi.fn();
  const GitHubAuthProvider = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  return {
    useGitHubAuth: mockUseGitHubAuth,
    GitHubAuthProvider,
  };
});

const renderRepoStar = async (contextValue: any) => {
  const { useGitHubAuth } = await import('@contexts/GitHubAuthContext');
  vi.mocked(useGitHubAuth).mockReturnValue(contextValue);

  return render(
    <GitHubAuthProvider>
      <RepoStar repo={repo} />
    </GitHubAuthProvider>
  );
};

describe('RepoStar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render star button with stargazers count', async () => {
    await renderRepoStar({
      userIsLoggedIn: false,
      openLoginModal: vi.fn(),
    });

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should call openLoginModal when user is not logged in and star is clicked', async () => {
    const mockOpenLoginModal = vi.fn();

    await renderRepoStar({
      userIsLoggedIn: false,
      openLoginModal: mockOpenLoginModal,
    });

    expect(mockOpenLoginModal).toHaveBeenCalledTimes(0);

    const starButton = screen.getByRole('button');
    await user.click(starButton);

    expect(mockOpenLoginModal).toHaveBeenCalledTimes(1);
  });

  it('should not call openLoginModal when user is logged in and star is clicked', async () => {
    const mockOpenLoginModal = vi.fn();

    await renderRepoStar({
      userIsLoggedIn: true,
      openLoginModal: mockOpenLoginModal,
    });

    expect(mockOpenLoginModal).toHaveBeenCalledTimes(0);

    const starButton = screen.getByRole('button');
    await user.click(starButton);

    expect(mockOpenLoginModal).not.toHaveBeenCalled();
  });

  it('should have correct title when user is not logged in', async () => {
    await renderRepoStar({
      userIsLoggedIn: false,
      openLoginModal: vi.fn(),
    });

    const starButton = screen.getByRole('button');
    expect(starButton).toHaveAttribute('title', 'Star this repository');
  });

  it('should not be disabled (currently hardcoded to false)', async () => {
    await renderRepoStar({
      userIsLoggedIn: false,
      openLoginModal: vi.fn(),
    });

    const starButton = screen.getByRole('button');
    expect(starButton).not.toBeDisabled();
  });

  it('should meet formal accessibility requirements', async () => {
    await renderRepoStar({
      userIsLoggedIn: false,
      openLoginModal: vi.fn(),
    });

    const { container } = render(
      <GitHubAuthProvider>
        <RepoStar repo={repo} />
      </GitHubAuthProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
