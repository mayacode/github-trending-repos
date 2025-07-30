import { useEffect, useState } from 'react';
import {
  handleCallback as handleGitHubCallback,
  starRepository,
} from '@services/githubAuth';

export function useAuthCallback() {
  const [authCallback, setAuthCallback] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      setAuthCallback(true);
    }
  }, []);

  return { authCallback };
}

export interface UseHandleCallbackReturn {
  status: 'loading' | 'success' | 'error';
  message: string;
}

export function useHandleCallback(): UseHandleCallbackReturn {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      // Prevent double execution by tracking processed codes in sessionStorage
      const processedCode = sessionStorage.getItem('processed_oauth_code');
      if (code && processedCode === code) {
        return;
      }

      if (code) {
        sessionStorage.setItem('processed_oauth_code', code);
      }

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing authorization code or state parameter');
        return;
      }

      try {
        const result = await handleGitHubCallback(code, state);
        if (result.success) {
          setStatus('success');

          // if there was a target repository, try to star it
          if (result.targetRepo) {
            const firstSlashIndex = result.targetRepo.indexOf('/');
            if (firstSlashIndex === -1) {
              // no slash found, treat as invalid format
              setMessage('Authentication successful! Redirecting...');
            } else {
              const owner = result.targetRepo.substring(0, firstSlashIndex);
              const repoName = result.targetRepo.substring(firstSlashIndex + 1);
              try {
                const starSuccess = await starRepository(owner, repoName);
                if (starSuccess) {
                  setMessage(
                    `Authentication successful! Repository "${result.targetRepo}" has been starred. Redirecting...`
                  );
                } else {
                  setMessage('Authentication successful! Redirecting...');
                }
              } catch (starError) {
                console.error('Failed to star repository:', starError);
                setMessage('Authentication successful! Redirecting...');
              }
            }
          } else {
            setMessage('Authentication successful! Redirecting...');
          }

          setTimeout(() => {
            window.location.href = window.location.origin;
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during authentication.');
      }
    };

    handleCallback();
  }, []);

  return { status, message };
}
