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
});
