import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen, waitFor } from '@tests/test-utils';
import ModeButton from '../ModeButton';
import userEvent from '@testing-library/user-event';

expect.extend(toHaveNoViolations);

describe('ModeButton', () => {
  it('should render', () => {
    render(<ModeButton />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAccessibleName(
      'Switch to dark mode'
    );
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

  it('should meet formal accessibility requirements', async () => {
    const { container } = render(<ModeButton />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
