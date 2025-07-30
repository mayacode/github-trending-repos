import { useHandleCallback } from '@hooks/useAuthCallback';

export default function AuthCallback() {
  const { status, message } = useHandleCallback();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-green-900 to-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              status === 'loading'
                ? 'bg-blue-100 dark:bg-blue-900'
                : status === 'success'
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-red-100 dark:bg-red-900'
            }`}
          >
            {status === 'loading' && (
              <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
            )}
            {status === 'success' && (
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {status === 'error' && (
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {status === 'loading'
              ? 'Authenticating...'
              : status === 'success'
                ? 'Success!'
                : 'Authentication Failed'}
          </h2>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => (window.location.href = window.location.origin)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}
