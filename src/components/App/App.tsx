import { useAuthCallback } from '@hooks/useAuthCallback';
import AuthCallback from '../AuthCallback/AuthCallback';
import MainLayout from '../MainLayout/MainLayout';

function App() {
  const { authCallback } = useAuthCallback();

  if (authCallback) {
    return <AuthCallback />;
  }

  return <MainLayout />;
}

export default App;
