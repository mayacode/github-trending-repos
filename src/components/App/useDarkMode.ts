import { useEffect, useState } from "react";
import type { DarkModeProps } from "../../types";

export function useDarkMode(): DarkModeProps {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkMode]);

  function toggleDarkMode() {
    setDarkMode(!darkMode);
  }

  return { darkMode, toggleDarkMode }
}
