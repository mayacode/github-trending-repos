import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import App from '../App';

expect.extend(toHaveNoViolations);

describe('App', () => {
  it('renders the App component', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('GitHub Trending Repositories (Last Week)');
    expect(screen.getByRole('button')).toHaveAccessibleName('Switch to dark mode');
  });

  it('should meet formal accessibility requirements', async () => {
    const { container } = render(<App />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
