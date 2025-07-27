import { render, screen } from "@testing-library/react";
import MainLayout from "../MainLayout";

describe('MainLayout', () => {
  it('should render', () => {
    render(<MainLayout />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('GitHub Trending Repositories (Last Week)');
  });
});