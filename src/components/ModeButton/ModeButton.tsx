import SunIcon from '../../assets/SunIcon.svg?react';
import MoonIcon from '../../assets/MoonIcon.svg?react';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function ModeBar() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center right-6 gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-green-900 hover:bg-blue-200 dark:hover:bg-green-800 transition-colors text-lg"
    >
      {darkMode ? (
        <SunIcon className="w-6 h-6 text-yellow-400" />
      ) : (
        <MoonIcon className="w-6 h-6 text-blue-700" />
      )}
      <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-200">
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
}
