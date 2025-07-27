import RepoIcon from '../../assets/RepoIcon.svg?react';
import ModeButton from "../ModeButton/ModeButton";
import { useDarkMode } from "../../hooks/useDarkMode";

export default function MainLayout() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-300 bg-white dark:bg-gradient-to-br dark:from-blue-900 dark:via-green-900 dark:to-gray-900 text-gray-900 dark:text-gray-100"
    >
      <header className="w-full flex items-center justify-between px-6 py-4 shadow-md bg-blue-100 dark:bg-gray-900 dark:bg-opacity-80">
        <div className="flex items-center gap-2">
          <RepoIcon className="w-8 h-8 text-blue-500 dark:text-green-400" />
          <h1 className="text-2xl font-bold tracking-tight">
            GitHub Trending Repositories (Last Week)
          </h1>
        </div>
        <ModeButton darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </header>
    </div>
  )
}