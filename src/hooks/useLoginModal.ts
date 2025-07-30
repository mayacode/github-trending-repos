import { useState, useCallback } from 'react';

export function useLoginModal() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openLoginModal = useCallback(() => {
    setModalIsOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setModalIsOpen(false);
  }, []);

  return {
    modalIsOpen,
    openLoginModal,
    closeLoginModal,
  };
}
