import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import LoginModal from '@components/LoginModal/LoginModal';

interface GitHubAuthContextType {
  userIsLoggedIn: boolean;
  modalIsOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const GitHubAuthContext = createContext<GitHubAuthContextType | undefined>(
  undefined
);

export function GitHubAuthProvider({ children }: { children: ReactNode }) {
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openLoginModal = () => setModalIsOpen(true);
  const closeLoginModal = () => setModalIsOpen(false);

  const value: GitHubAuthContextType = {
    userIsLoggedIn,
    modalIsOpen,
    openLoginModal,
    closeLoginModal,
  };

  return (
    <GitHubAuthContext.Provider value={value}>
      {children}
      <LoginModal modalIsOpen={modalIsOpen} onClose={closeLoginModal} />
    </GitHubAuthContext.Provider>
  );
}

export function useGitHubAuth() {
  const context = useContext(GitHubAuthContext);
  if (context === undefined) {
    throw new Error('useGitHubAuth must be used within a GitHubAuthProvider');
  }
  return context;
}
