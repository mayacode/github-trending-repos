import { useEffect } from 'react';
import LoginStarIcon from '@assets/LoginStarIcon.svg?react';
import GitHubIcon from '@assets/GitHubIcon.svg?react';
// import { startAuth } from '../services/githubAuth';

interface LoginModalProps {
  modalIsOpen: boolean;
  onClose: () => void;
  repoName?: string;
}

export default function LoginModal({
  modalIsOpen,
  onClose,
  repoName,
}: LoginModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (modalIsOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modalIsOpen, onClose]);

  if (!modalIsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-blue-900/75 dark:bg-blue-950/75"
        onClick={onClose}
        role="presentation"
      />

      {/* modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <LoginStarIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Login Required
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            To star repositories, you need to be logged into GitHub.
          </p>
          {repoName && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Repository:{' '}
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {repoName}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={async () => {
              // await startAuth(repoName);
              onClose();
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <GitHubIcon />
            Login with GitHub
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
