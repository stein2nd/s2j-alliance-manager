import React, { useState, useEffect, useRef, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, TextareaControl } from '@wordpress/components';

/**
 * React.FunctionComponent「メッセージ編集モーダル」インターフェイス
 * @param param0 React.FunctionComponent「メッセージ編集モーダル」インターフェイス
 * @returns React.FunctionComponent「メッセージ編集モーダル」インターフェイス
 */
interface MessageModalProps {
  message: string;
  onSave: (message: string) => void;
  onCancel: () => void;
  isOpen: boolean; // モーダル表示状態を制御
}

/**
 * React.FunctionComponent「メッセージ編集モーダル」
 * `src/admin/components/ContentList.tsx` で呼ばれる。
 * @param param0 React.FunctionComponent「メッセージ編集モーダル」
 * @returns React.FunctionComponent「メッセージ編集モーダル」
 */
export const MessageModal: React.FC<MessageModalProps> = ({
  message,
  onSave,
  onCancel,
  isOpen
}) => {
  const [formMessage, setFormMessage] = useState(message);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const modalRef = useRef<any>(null);
  const textareaRef = useRef<any>(null);

  /**
   * メッセージをキャンセルします。
   * 「modal-actions.secondary.onClick()」メソッドから呼ばれます。
   */
  const handleCancel = useCallback(() => {
    setFormMessage(message); // Reset to original value
    setErrors({});
    setIsSubmitting(false);
    onCancel();
  }, [message, onCancel]);

  /**
   * モーダル表示時のアニメーション制御
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // フォーカスをテキストエリアに移動
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  /**
   * ESC キーで閉じる機能
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // フォーカストラップの実装
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleCancel]);

  /**
   * フォーカストラップの実装
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: any) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  /**
   * バリデーション機能の実装
   * 「validateMessage()」メソッドから呼ばれます。
   * @param value バリデーション機能の実装
   * @returns バリデーション機能の実装
   */
  const validateMessage = (value: string): string[] => {
    const errors: string[] = [];

    if (!value.trim()) {
      errors.push(__('Message is required', 's2j-alliance-manager'));
    }

    if (value.length > 500) {
      errors.push(__('Message must be 500 characters or less', 's2j-alliance-manager'));
    }

    return errors;
  };

  /**
   * リアルタイョン
   * 「handleMessageChange()」メソッドから呼ばれます。
   * @param value リアルタイョン
   */
  const handleMessageChange = (value: string) => {
    setFormMessage(value);
    const validationErrors = validateMessage(value);
    setErrors({ message: validationErrors[0] || '' });
  };

  /**
   * オーバーレイ・クリックで閉じる機能
   * 「handleOverlayClick()」メソッドから呼ばれます。
   * @param e 
   */
  const handleOverlayClick = (e: any) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  /**
   * メッセージを保存します。
   * 「modal-actions.primary.onClick()」メソッドから呼ばれます。
   * @returns メッセージを保存します。
   */
  const handleSave = async () => {
    const validationErrors = validateMessage(formMessage);
    if (validationErrors.length > 0) {
      setErrors({ message: validationErrors[0] });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`s2j-message-modal ${isOpen ? 's2j-modal-open' : ''}`}>
      {/* オーバーレイ背景 */}
      <div 
        className={`s2j-modal-overlay ${isAnimating ? 's2j-modal-overlay-visible' : ''}`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      {/* モーダルコンテンツ */}
      <div 
        className={`s2j-modal-content ${isAnimating ? 's2j-modal-content-visible' : ''}`}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="s2j-modal-title"
        aria-describedby="s2j-modal-description"
        tabIndex={-1}
      >
        <h3 id="s2j-modal-title">{__('Edit Message', 's2j-alliance-manager')}</h3>
        <div id="s2j-modal-description" className="s2j-modal-description">
          {__('Edit the message that will be displayed when users click on the partner logo.', 's2j-alliance-manager')}
        </div>
        <div className="s2j-form-field">
          <TextareaControl
            ref={textareaRef}
            label={__('Message', 's2j-alliance-manager')}
            value={formMessage}
            onChange={handleMessageChange}
            help={__('This message will be displayed in a modal when the partner logo is clicked.', 's2j-alliance-manager')}
            rows={6}
            maxLength={500}
            __nextHasNoMarginBottom={true}
            aria-describedby="s2j-character-count s2j-field-error"
            aria-invalid={!!errors.message}
          />
          {errors.message && (
            <div 
              id="s2j-field-error" 
              className="s2j-field-error" 
              role="alert"
              aria-live="polite"
            >
              {errors.message}
            </div>
          )}
          <div id="s2j-character-count" className="s2j-character-count">
            {formMessage.length}/500 {__('characters', 's2j-alliance-manager')}
          </div>
        </div>
        {/* プレビュー機能 */}
        <div className="s2j-message-preview">
          <h4>{__('Preview', 's2j-alliance-manager')}</h4>
          <div className="s2j-preview-content">
            <div className="s2j-preview-modal" role="region" aria-label={__('Message preview', 's2j-alliance-manager')}>
              <div className="s2j-preview-header">
                <h5>{__('Partner Message', 's2j-alliance-manager')}</h5>
                <button 
                  type="button" 
                  className="s2j-preview-close"
                  aria-label={__('Close preview', 's2j-alliance-manager')}
                  tabIndex={-1}
                >
                  ×
                </button>
              </div>
              <div className="s2j-preview-body">
                {formMessage || (
                  <em className="s2j-preview-placeholder">
                    {__('Enter your message to see preview', 's2j-alliance-manager')}
                  </em>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="s2j-modal-actions">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
            aria-label={__('Cancel and close modal', 's2j-alliance-manager')}
          >
            {__('Cancel', 's2j-alliance-manager')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting || !!errors.message}
            aria-label={__('Save message and close modal', 's2j-alliance-manager')}
          >
            {isSubmitting ? __('Saving...', 's2j-alliance-manager') : __('Save Message', 's2j-alliance-manager')}
          </Button>
        </div>
      </div>
    </div>
  );
};
