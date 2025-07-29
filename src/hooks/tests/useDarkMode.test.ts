import { act, renderHook, waitFor } from '@tests/test-utils';
import { useDarkMode } from '../useDarkMode';

describe('useDarkMode', () => {
  it('should switch the mode', async () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.darkMode).toBe(false);
    expect(typeof result.current.toggleDarkMode).toBe('function');

    act(() => result.current.toggleDarkMode());

    await waitFor(() => {
      expect(result.current.darkMode).toBe(true);
    });

    act(() => result.current.toggleDarkMode());

    await waitFor(() => {
      expect(result.current.darkMode).toBe(false);
    });
  });
});
