import { render, screen } from '@tests/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import LoginModal from '../LoginModal';
import * as useTrendingReposHook from '@hooks/useTrendingRepos';

// Mock the startAuth function to prevent navigation
vi.mock('@services/githubAuth', () => ({
  startAuth: vi.fn(),
  getAuthState: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    token: null,
  })),
}));

expect.extend(toHaveNoViolations);

const useStarredReposSpy = vi.spyOn(useTrendingReposHook, 'useStarredRepos');

const user = userEvent.setup();

describe('LoginModal', () => {
  const defaultProps = {
    modalIsOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useStarredReposSpy.mockReturnValue({
      handleStarClick: vi.fn(),
      starredRepos: new Set(),
      selectedRepo: 'test-repo',
    });
  });

  it('should not render when modalIsOpen is false', () => {
    render(<LoginModal {...defaultProps} modalIsOpen={false} />);

    expect(screen.queryByText('Login Required')).not.toBeInTheDocument();
  });

  it('should render when modalIsOpen is true', () => {
    render(<LoginModal {...defaultProps} />);

    expect(screen.getByText('Login Required')).toBeInTheDocument();
    expect(
      screen.getByText(
        'To star repositories, you need to be logged into GitHub.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Login with GitHub' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should display repo name when provided', () => {
    render(<LoginModal {...defaultProps} />);

    expect(screen.getByText('Repository:')).toBeInTheDocument();
    expect(screen.getByText('test-repo')).toBeInTheDocument();
  });

  it('should not display repo name when not provided', () => {
    // Mock with no selectedRepo
    useStarredReposSpy.mockReturnValue({
      handleStarClick: vi.fn(),
      starredRepos: new Set(),
      selectedRepo: '',
    });

    render(<LoginModal {...defaultProps} />);

    expect(screen.queryByText('Repository:')).not.toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', async () => {
    render(<LoginModal {...defaultProps} />);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(0);

    const backdrop = screen.getByRole('presentation');
    await user.click(backdrop);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(<LoginModal {...defaultProps} />);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(0);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Login with GitHub button is clicked', async () => {
    render(<LoginModal {...defaultProps} />);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(0);

    const loginButton = screen.getByText('Login with GitHub');
    await user.click(loginButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', async () => {
    render(<LoginModal {...defaultProps} />);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(0);

    await user.keyboard('{Escape}');

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when other keys are pressed', async () => {
    render(<LoginModal {...defaultProps} />);

    await user.keyboard('{Enter}');

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should handle multiple Escape key presses', async () => {
    render(<LoginModal {...defaultProps} />);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(0);

    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');

    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });

  it('should only handle Escape key when modal is open', async () => {
    const { rerender } = render(
      <LoginModal {...defaultProps} modalIsOpen={false} />
    );

    await user.keyboard('{Escape}');
    expect(defaultProps.onClose).not.toHaveBeenCalled();

    rerender(<LoginModal {...defaultProps} modalIsOpen={true} />);
    await user.keyboard('{Escape}');
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle Escape key with different event properties', async () => {
    render(<LoginModal {...defaultProps} />);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(0);

    await user.keyboard('{Escape}');

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should have correct modal structure', () => {
    render(<LoginModal {...defaultProps} />);

    expect(screen.getByRole('presentation')).toBeInTheDocument();

    expect(screen.getByText('Login Required')).toBeInTheDocument();
    expect(
      screen.getByText(
        'To star repositories, you need to be logged into GitHub.'
      )
    ).toBeInTheDocument();
  });

  it('should set body overflow to hidden when modal opens', () => {
    const { rerender } = render(
      <LoginModal {...defaultProps} modalIsOpen={false} />
    );

    expect(document.body.style.overflow).toBe('unset');

    rerender(<LoginModal {...defaultProps} modalIsOpen={true} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body overflow when modal closes', () => {
    const { rerender } = render(
      <LoginModal {...defaultProps} modalIsOpen={true} />
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<LoginModal {...defaultProps} modalIsOpen={false} />);

    expect(document.body.style.overflow).toBe('unset');
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(<LoginModal {...defaultProps} />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('should meet formal accessibility requirements', async () => {
    const { container } = render(<LoginModal {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
