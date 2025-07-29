import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import App from '../App';

expect.extend(toHaveNoViolations);

vi.mock('../../TrendingRepos/TrendingRepoContainer', () => ({ 
  default: () => {
    return <div>TrendingRepoContainer</div>
  }, 
})) 

describe('App', () => {
  it('should render the App component', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('GitHub Trending Repositories (Last Week)');
    expect(screen.getByRole('button')).toHaveAccessibleName('Switch to dark mode');
    expect(screen.getByText('TrendingRepoContainer')).toBeInTheDocument();
  });

  it('should meet formal accessibility requirements', async () => {
    const { container } = render(<App />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
