import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * モーダル用 Portal コンポーネント (モーダル用)
 * @param param0 モーダル用 Portal コンポーネント (モーダル用)
 * @returns モーダル用 Portal コンポーネント (モーダル用)
 */
interface ModalPortalProps {
  children: React.ReactNode;
  containerId?: string;
}

/**
 * モーダル用 Portal コンポーネント (モーダル用)
 * @param param0 モーダル用 Portal コンポーネント (モーダル用)
 * @returns モーダル用 Portal コンポーネント (モーダル用)
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({
  children,
  containerId = 's2j-alliance-modal'
}) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  /**
   * body 直下にモーダル用コンテナを作成
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    // body 直下にモーダル用コンテナを作成
    let modalContainer = document.getElementById(containerId);
    
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = containerId;
      modalContainer.className = 's2j-modal-container';
      document.body.appendChild(modalContainer);
    }
    
    setContainer(modalContainer);

    return () => {
      /**
       * モーダルを閉じるときにモーダル用コンテナを削除します。
       * 「useEffect()」メソッドから呼ばれます。
       */
      if (modalContainer && modalContainer.parentNode) {
        modalContainer.parentNode.removeChild(modalContainer);
      }
    };
  }, [containerId]);

  if (!container) return null;

  return createPortal(children, container);
};
