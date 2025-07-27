import { waitFor } from '@testing-library/react';

import { render, screen } from "@testing-library/react";
import ModeButton from "../ModeButton";
import userEvent from "@testing-library/user-event";

describe('ModeButton', () => {
  it('should render - formal check', () => {
    render(<ModeButton />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAccessibleName('Switch to dark mode');
  });

  it('should call toggleDarkMode when clicked', async () => {
    render(<ModeButton />);
    
    const htmlElement = document.documentElement;
    const button = screen.getByRole('button');

    expect(htmlElement).not.toHaveClass('dark');

    await userEvent.click(button);

    await waitFor(() => {
      expect(htmlElement).toHaveClass('dark');
    });
  });
});