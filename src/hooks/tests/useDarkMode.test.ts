import { renderHook, waitFor } from "@testing-library/react";
import { useDarkMode } from "../useDarkMode";

describe('useDarkMode', () => {
  it('should switch the mode', async () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.darkMode).toBe(false);
    expect(typeof result.current.toggleDarkMode).toBe('function');

    result.current.toggleDarkMode();

    await waitFor(() => {
      expect(result.current.darkMode).toBe(true);
    });

    result.current.toggleDarkMode();

    await waitFor(() => {
      expect(result.current.darkMode).toBe(false);
    });
  });
});