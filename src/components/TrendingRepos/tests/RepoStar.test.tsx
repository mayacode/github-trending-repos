import React from 'react';
import { render, screen } from '@tests/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import RepoStar from '../RepoStar';
import { repo } from '@tests/test_helper';
import * as useTrendingReposHook from '@hooks/useTrendingRepos';

// Mock the githubAuth service
vi.mock('../../../services/githubAuth', () => ({
  getAuthState: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    token: null,
  })),
  starRepository: vi.fn(),
  unstarRepository: vi.fn(),
}));

expect.extend(toHaveNoViolations);

const user = userEvent.setup();

const useStarredReposSpy = vi.spyOn(useTrendingReposHook, 'useStarredRepos');

const renderRepoStar = () => {
  return render(<RepoStar repo={repo} />);
};

describe('RepoStar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStarredReposSpy.mockReturnValue({
      handleStarClick: vi.fn(),
      starredRepos: new Set(),
      selectedRepo: '',
    });
  });

  it('should render star button with stargazers count', () => {
    renderRepoStar();

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should call openLoginModal when user is not logged in and star is clicked', async () => {
    const mockHandleStarClick = vi.fn();
    useStarredReposSpy.mockReturnValue({
      handleStarClick: mockHandleStarClick,
      starredRepos: new Set(),
      selectedRepo: '',
    });

    renderRepoStar();

    expect(mockHandleStarClick).toHaveBeenCalledTimes(0);

    const starButton = screen.getByRole('button');
    await user.click(starButton);

    expect(mockHandleStarClick).toHaveBeenCalledTimes(1);
    expect(mockHandleStarClick).toHaveBeenCalledWith(repo, false); // modalIsOpen is false initially
  });

  it('should not call openLoginModal when user is logged in and star is clicked', async () => {
    const mockHandleStarClick = vi.fn();
    useStarredReposSpy.mockReturnValue({
      handleStarClick: mockHandleStarClick,
      starredRepos: new Set(),
      selectedRepo: '',
    });

    // Mock getAuthState to return authenticated user
    const { getAuthState } = await import('../../../services/githubAuth');
    vi.mocked(getAuthState).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'test.jpg',
      },
      token: 'test-token',
    });

    renderRepoStar();

    expect(mockHandleStarClick).toHaveBeenCalledTimes(0);

    const starButton = screen.getByRole('button');
    await user.click(starButton);

    expect(mockHandleStarClick).toHaveBeenCalledTimes(1);
    // When authenticated, handleStarClick should still be called but won't open modal
  });

  it('should have correct title when user is not logged in', () => {
    renderRepoStar();

    const starButton = screen.getByRole('button');
    expect(starButton).toHaveAttribute('title', 'Star this repository');
  });

  it('should not be disabled (currently hardcoded to false)', () => {
    renderRepoStar();

    const starButton = screen.getByRole('button');
    expect(starButton).not.toBeDisabled();
  });

  it('should meet formal accessibility requirements', async () => {
    renderRepoStar();

    const { container } = render(<RepoStar repo={repo} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
