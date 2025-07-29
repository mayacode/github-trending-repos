import { render, screen } from "@testing-library/react";
import TrendingRepoContainer from "../TrendingRepoContainer";
import * as useTrendingReposHook from '../../../hooks/useTrendingRepos';
import { hookUseTrendingReposReturnValue } from "../../../../tests/test_helper";

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
    useTrendingReposSpy.mockReturnValue({ ...hookUseTrendingReposReturnValue, error: 'Error' });
    render(<TrendingRepoContainer />);

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should show loading', () => {
    useTrendingReposSpy.mockReturnValue({ ...hookUseTrendingReposReturnValue, pending: true });
    render(<TrendingRepoContainer />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});