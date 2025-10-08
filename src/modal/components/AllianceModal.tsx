import React, { useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { ModalPortal } from './ModalPortal';

/**
 * フロントエンド用アライアンス・モーダル・コンポーネント (モーダル用)
 * @param param0 フロントエンド用アライアンス・モーダル・コンポーネント (モーダル用)
 * @returns フロントエンド用アライアンス・モーダル・コンポーネント (モーダル用)
 */
interface AllianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content: string;
  showCloseButton?: boolean;
}

/**
 * フロントエンド用アライアンス・モーダル・コンポーネント (モーダル用)
 * @param param0 フロントエンド用アライアンス・モーダル・コンポーネント (モーダル用)
 * @returns フロントエンド用アライアンス・モーダル・コンポーネント (モーダル用)
 */
export const AllianceModal: React.FC<AllianceModalProps> = ({
  isOpen,
  onClose,
  title = __('Partner Message', 's2j-alliance-manager'),
  content,
  showCloseButton = true
}) => {
  const modalRef = useRef<any>(null);

  /**
   * フォーカス管理
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isOpen]);

  /**
   * オーバーレイクリックで閉じる機能
   * 「handleOverlayClick()」メソッドから呼ばれます。
   * @param e 
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="s2j-alliance-modal">
        <div 
          className="s2j-modal-overlay" 
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
        <div 
          className="s2j-modal-content"
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="s2j-modal-title"
          aria-describedby="s2j-modal-description"
        >
          <div className="s2j-modal-header">
            <h3 id="s2j-modal-title">{title}</h3>
            {showCloseButton && (
              <button 
                className="s2j-modal-close" 
                onClick={onClose}
                aria-label={__('Close modal', 's2j-alliance-manager')}
              >
                ×
              </button>
            )}
          </div>
          <div className="s2j-modal-body">
            <div 
              id="s2j-modal-description"
              className="s2j-modal-message"
            >
              {content}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
