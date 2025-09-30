import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, TextareaControl } from '@wordpress/components';

/**
 * React.FunctionComponent「メッセージ編集モーダル」インターフェイス
 */
interface MessageModalProps {
  message: string;
  onSave: (message: string) => void;
  onCancel: () => void;
}

/**
 * React.FunctionComponent「メッセージ編集モーダル」
 * `src/admin/components/ContentList.tsx` で呼ばれる。
 * 
 * @param param0 メッセージ編集モーダル
 * @returns メッセージ編集モーダル
 */
export const MessageModal: React.FC<MessageModalProps> = ({
  message,
  onSave,
  onCancel
}) => {
  const [formMessage, setFormMessage] = useState(message);

  /**
   * メッセージをキャンセルします。
   * 「modal-actions.secondary.onClick()」メソッドから呼ばれます。
   */
  const handleCancel = () => {
    setFormMessage(message); // Reset to original value

    onCancel();
  };

  /**
   * メッセージを保存します。
   * 「modal-actions.primary.onClick()」メソッドから呼ばれます。
   */
  const handleSave = () => {
    onSave(formMessage);
  };

  return (
    <div className="s2j-message-modal">
      <div className="s2j-message-modal-content">
        <h3>{__('Edit Message', 's2j-alliance-manager')}</h3>
        <div className="form-field">
          <TextareaControl
            label={__('Message', 's2j-alliance-manager')}
            value={formMessage}
            onChange={setFormMessage}
            help={__('This message will be displayed in a modal when the partner logo is clicked.', 's2j-alliance-manager')}
            rows={6}
          />
        </div>
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={handleCancel}
          >
            {__('Cancel', 's2j-alliance-manager')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
          >
            {__('Save Message', 's2j-alliance-manager')}
          </Button>
        </div>
      </div>
    </div>
  );
};
