import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from "@testing-library/react";
import MainLayout from "../MainLayout";

expect.extend(toHaveNoViolations);

describe('MainLayout', () => {
  it('should render', () => {
    render(<MainLayout />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('GitHub Trending Repositories (Last Week)');
  });

  it('should meet formal accessibility requirements', async () => {
    const { container } = render(<MainLayout />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});