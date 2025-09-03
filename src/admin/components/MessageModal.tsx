import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, TextareaControl } from '@wordpress/components';

interface MessageModalProps {
  message: string;
  onSave: (message: string) => void;
  onCancel: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  message,
  onSave,
  onCancel
}) => {
  const [formMessage, setFormMessage] = useState(message);

  const handleSave = () => {
    onSave(formMessage);
  };

  const handleCancel = () => {
    setFormMessage(message); // Reset to original value
    onCancel();
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
            isSecondary
            onClick={handleCancel}
          >
            {__('Cancel', 's2j-alliance-manager')}
          </Button>
          <Button
            isPrimary
            onClick={handleSave}
          >
            {__('Save Message', 's2j-alliance-manager')}
          </Button>
        </div>
      </div>
    </div>
  );
};
