import { render, screen } from '@tests/test-utils';
import TrendingRepoCard from '../TrendingRepoCard';
import { repo } from '@tests/test_helper';

const props = { repo };

describe('TrendingRepoCard', () => {
  it('should render', () => {
    render(<TrendingRepoCard {...props} />);

    expect(screen.getByText(props.repo.description)).toBeInTheDocument();
    expect(screen.getByText(props.repo.language)).toBeInTheDocument();
    expect(
      screen.getByText(`Forks: ${props.repo.forks_count}`)
    ).toBeInTheDocument();
    expect(screen.getByText(props.repo.stargazers_count)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: props.repo.full_name })
    ).toHaveAttribute('href', 'some_url');
  });
});
