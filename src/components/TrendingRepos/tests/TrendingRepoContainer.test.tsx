import { render, screen } from '@tests/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import TrendingRepoContainer from '../TrendingRepoContainer';
import * as useTrendingReposHook from '@hooks/useTrendingRepos';
import { hookUseTrendingReposReturnValue } from '@tests/test_helper';

expect.extend(toHaveNoViolations);

const useTrendingReposSpy = vi.spyOn(useTrendingReposHook, 'useTrendingRepos');

describe('TrendingRepoContainer', () => {
  beforeAll(() => {
    useTrendingReposSpy.mockReturnValue(hookUseTrendingReposReturnValue);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(<TrendingRepoContainer />);

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('should show the error', () => {
    useTrendingReposSpy.mockReturnValue({
      ...hookUseTrendingReposReturnValue,
      error: 'Error',
    });
    render(<TrendingRepoContainer />);

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should show loading', () => {
    useTrendingReposSpy.mockReturnValue({
      ...hookUseTrendingReposReturnValue,
      pending: true,
    });
    render(<TrendingRepoContainer />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should meet formal accessibility requirements', async () => {
    const { container } = render(<TrendingRepoContainer />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle OAuth success with NO_TARGET_REPO warning', () => {
    // Mock URL parameters
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?success=true&warning=NO_TARGET_REPO',
        search: '?success=true&warning=NO_TARGET_REPO',
      },
      writable: true,
    });

    render(<TrendingRepoContainer />);

    expect(
      screen.getByText(
        "Authentication successful! You are now logged in to GitHub. Repository wasn't starred, please try again."
      )
    ).toBeInTheDocument();
  });

  it('should handle OAuth success with STAR_FAILED warning', () => {
    // Mock URL parameters
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?success=true&warning=STAR_FAILED',
        search: '?success=true&warning=STAR_FAILED',
      },
      writable: true,
    });

    render(<TrendingRepoContainer />);

    expect(
      screen.getByText(
        'Authentication successful! You are now logged in to GitHub. Repository starring failed, please try again.'
      )
    ).toBeInTheDocument();
  });

  it('should handle OAuth error', () => {
    // Mock URL parameters
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?error=access_denied',
        search: '?error=access_denied',
      },
      writable: true,
    });

    render(<TrendingRepoContainer />);

    expect(
      screen.getByText('Authentication failed: access_denied')
    ).toBeInTheDocument();
  });

  it('should show success message in green color', () => {
    // Mock URL parameters
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?success=true&warning=NO_TARGET_REPO',
        search: '?success=true&warning=NO_TARGET_REPO',
      },
      writable: true,
    });

    const { container } = render(<TrendingRepoContainer />);

    const messageElement = screen.getByText(
      "Authentication successful! You are now logged in to GitHub. Repository wasn't starred, please try again."
    );
    expect(messageElement).toHaveClass('text-green-600', 'dark:text-green-400');
  });

  it('should show error message in red color', () => {
    // Mock URL parameters
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?error=access_denied',
        search: '?error=access_denied',
      },
      writable: true,
    });

    const { container } = render(<TrendingRepoContainer />);

    const messageElement = screen.getByText(
      'Authentication failed: access_denied'
    );
    expect(messageElement).toHaveClass('text-red-600', 'dark:text-red-400');
  });
});
