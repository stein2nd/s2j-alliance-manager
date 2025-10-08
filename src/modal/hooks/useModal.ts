import { useState, useCallback, useEffect } from 'react';

/**
 * モーダル状態管理用カスタムフック (モーダル用)
 * @param param0 モーダル状態管理用カスタムフック (モーダル用)
 * @returns モーダル状態管理用カスタムフック (モーダル用)
 */
interface UseModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

/**
 * モーダル状態管理用カスタムフック (モーダル用)
 * @param initialState モーダル状態管理用カスタムフック (モーダル用)
 * @returns モーダル状態管理用カスタムフック (モーダル用)
 */
export const useModal = (initialState = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  /**
   * モーダルを開きます。
   * 「openModal()」メソッドから呼ばれます。
   */
  const openModal = useCallback(() => {
    setIsOpen(true);
    // スクロールを無効化
    document.body.style.overflow = 'hidden';
  }, []);

  /**
   * モーダルを閉じます。
   * 「closeModal()」メソッドから呼ばれます。
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    // スクロールを有効化
    document.body.style.overflow = 'unset';
  }, []);

  /**
   * モーダルをトグルします。
   * 「toggleModal()」メソッドから呼ばれます。
   */
  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  /**
   * ESC キーで閉じる機能
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, closeModal]);

  /**
   * モーダルを閉じるときにボディのスタイルをリセットします。
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};
