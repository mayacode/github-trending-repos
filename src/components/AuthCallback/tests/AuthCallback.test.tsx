import { render, screen } from '@tests/test-utils';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import AuthCallback from '../AuthCallback';

const user = userEvent.setup();

vi.mock('@hooks/useAuthCallback', () => ({
  useHandleCallback: vi.fn(),
}));

describe('AuthCallback', () => {
  let mockUseHandleCallback: any;

  beforeEach(async () => {
    const useAuthCallback = await import('@hooks/useAuthCallback');
    mockUseHandleCallback = vi.mocked(useAuthCallback.useHandleCallback);
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockUseHandleCallback.mockReturnValue({
      status: 'loading',
      message: 'Authentication successful! Redirecting...',
    });

    render(<AuthCallback />);

    expect(screen.getByText('Authenticating...')).toBeInTheDocument();
    expect(
      screen.getByText('Authentication successful! Redirecting...')
    ).toBeInTheDocument();
  });

  it('should render success state without target repo', () => {
    mockUseHandleCallback.mockReturnValue({
      status: 'success',
      message: 'Authentication successful! Redirecting...',
    });

    render(<AuthCallback />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(
      screen.getByText('Authentication successful! Redirecting...')
    ).toBeInTheDocument();
  });

  it('should render success state with target repo and successful starring', () => {
    mockUseHandleCallback.mockReturnValue({
      status: 'success',
      message:
        'Authentication successful! Repository "facebook/react" has been starred. Redirecting...',
    });

    render(<AuthCallback />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Authentication successful! Repository "facebook/react" has been starred. Redirecting...'
      )
    ).toBeInTheDocument();
  });

  it('should render success state with target repo but failed starring', () => {
    mockUseHandleCallback.mockReturnValue({
      status: 'success',
      message: 'Authentication successful! Redirecting...',
    });

    render(<AuthCallback />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(
      screen.getByText('Authentication successful! Redirecting...')
    ).toBeInTheDocument();
  });

  it('should render error state with authentication failure', () => {
    mockUseHandleCallback.mockReturnValue({
      status: 'error',
      message: 'Authentication failed. Please try again.',
    });

    render(<AuthCallback />);

    expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
    expect(
      screen.getByText('Authentication failed. Please try again.')
    ).toBeInTheDocument();
  });

  it('should render error state with missing parameters', () => {
    mockUseHandleCallback.mockReturnValue({
      status: 'error',
      message: 'Missing authorization code or state parameter',
    });

    render(<AuthCallback />);

    expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
    expect(
      screen.getByText('Missing authorization code or state parameter')
    ).toBeInTheDocument();
  });

  it('should render error state with GitHub error', () => {
    mockUseHandleCallback.mockReturnValue({
      status: 'error',
      message: 'Authentication failed: access_denied',
    });

    render(<AuthCallback />);

    expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
    expect(
      screen.getByText('Authentication failed: access_denied')
    ).toBeInTheDocument();
  });

  it('should render error state with network error', () => {
    mockUseHandleCallback.mockReturnValue({
      status: 'error',
      message: 'An error occurred during authentication.',
    });

    render(<AuthCallback />);

    expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
    expect(
      screen.getByText('An error occurred during authentication.')
    ).toBeInTheDocument();
  });

  it('should handle Go Back button click', async () => {
    mockUseHandleCallback.mockReturnValue({
      status: 'error',
      message: 'Authentication failed. Please try again.',
    });

    // Mock window.location
    const mockLocation = {
      href: '',
      origin: 'http://localhost:5173',
    };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(<AuthCallback />);

    const goBackButton = screen.getByRole('button', { name: 'Go Back' });
    expect(goBackButton).toBeInTheDocument();

    await user.click(goBackButton);

    expect(mockLocation.href).toBe('http://localhost:5173');
  });

  it('should meet formal accessibility requirements', async () => {
    mockUseHandleCallback.mockReturnValue({
      status: 'success',
      message: 'Authentication successful! Redirecting...',
    });

    const { container } = render(<AuthCallback />);

    expect(screen.getByText('Success!')).toBeInTheDocument();

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
