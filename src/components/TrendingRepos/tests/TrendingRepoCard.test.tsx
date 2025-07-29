import { render, screen } from '@tests/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import TrendingRepoCard from '../TrendingRepoCard';
import { repo } from '@tests/test_helper';
import { GitHubAuthProvider } from '@contexts/GitHubAuthContext';

expect.extend(toHaveNoViolations);

const props = { repo };

describe('TrendingRepoCard', () => {
  it('should render', () => {
    render(
      <GitHubAuthProvider>
        <TrendingRepoCard {...props} />
      </GitHubAuthProvider>
    );

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

  it('should meet formal accessibility requirements', async () => {
    const { container } = render(
      <GitHubAuthProvider>
        <ul>
          <TrendingRepoCard {...props} />
        </ul>
      </GitHubAuthProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
