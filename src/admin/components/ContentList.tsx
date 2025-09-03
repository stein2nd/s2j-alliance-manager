import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, CheckboxControl, SelectControl, TextControl } from '@wordpress/components';
import { ContentModel } from '../../types';
import { rankOptions, behaviorOptions } from '../data/constants';
import { MediaUploader } from './MediaUploader';
import { MessageModal } from './MessageModal';

interface ContentListProps {
  contentModels: ContentModel[];
  onUpdate: (models: ContentModel[]) => void;
  isLoading?: boolean;
}

export const ContentList: React.FC<ContentListProps> = ({
  contentModels,
  onUpdate,
  isLoading = false
}) => {
  const [showMessageModal, setShowMessageModal] = useState<number | null>(null);

  const addNewModel = () => {
    const newModel: ContentModel = {
      frontpage: 'NO',
      rank: 'default',
      logo: 0,
      jump_url: '',
      behavior: 'jump',
      message: ''
    };
    onUpdate([...contentModels, newModel]);
  };

  const updateModel = (index: number, field: keyof ContentModel, value: any) => {
    const updated = [...contentModels];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const deleteModel = (index: number) => {
    if (window.confirm(__('Are you sure you want to delete this item?', 's2j-alliance-manager'))) {
      const updated = contentModels.filter((_, i) => i !== index);
      onUpdate(updated);
    }
  };

  const moveModel = (index: number, direction: 'up' | 'down') => {
    const updated = [...contentModels];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < updated.length) {
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      onUpdate(updated);
    }
  };

  const openMessageModal = (index: number) => {
    setShowMessageModal(index);
  };

  const closeMessageModal = () => {
    setShowMessageModal(null);
  };

  const updateMessage = (index: number, message: string) => {
    updateModel(index, 'message', message);
    closeMessageModal();
  };

  return (
    <div className="s2j-content-list">
      <div className="s2j-content-models">
        {contentModels.map((model, index) => (
          <div key={`model-${index}-${model.logo}`} className="s2j-content-model">
            <div className="s2j-model-field frontpage">
              <CheckboxControl
                checked={model.frontpage === 'YES'}
                onChange={(checked: boolean) => updateModel(index, 'frontpage', checked ? 'YES' : 'NO')}
                label={__('Frontpage', 's2j-alliance-manager')}
              />
            </div>

            <div className="s2j-model-field rank">
              <SelectControl
                value={model.rank}
                options={rankOptions.map(option => ({
                  label: option.label,
                  value: option.value
                }))}
                onChange={(value: string) => updateModel(index, 'rank', value)}
                label={__('Rank', 's2j-alliance-manager')}
              />
            </div>

            <div className="s2j-model-field logo">
              <MediaUploader
                attachmentId={model.logo}
                onSelect={(attachmentId) => updateModel(index, 'logo', attachmentId)}
                label={__('Logo', 's2j-alliance-manager')}
              />
            </div>

            <div className="s2j-model-field jump-url">
              <TextControl
                value={model.jump_url}
                onChange={(value: string) => updateModel(index, 'jump_url', value)}
                label={__('Jump URL', 's2j-alliance-manager')}
                type="url"
                placeholder="https://example.com"
              />
            </div>

            <div className="s2j-model-field behavior">
              <SelectControl
                value={model.behavior}
                options={behaviorOptions.map(option => ({
                  label: option.label,
                  value: option.value
                }))}
                onChange={(value: string) => updateModel(index, 'behavior', value)}
                label={__('Behavior', 's2j-alliance-manager')}
              />
            </div>

            <div className="s2j-model-field actions">
              <Button
                isSmall
                onClick={() => moveModel(index, 'up')}
                disabled={index === 0}
                title={__('Move Up', 's2j-alliance-manager')}
              >
                ↑
              </Button>
              <Button
                isSmall
                onClick={() => moveModel(index, 'down')}
                disabled={index === contentModels.length - 1}
                title={__('Move Down', 's2j-alliance-manager')}
              >
                ↓
              </Button>
              <Button
                isSmall
                onClick={() => openMessageModal(index)}
                title={__('Edit Message', 's2j-alliance-manager')}
              >
                {__('Message', 's2j-alliance-manager')}
              </Button>
              <Button
                isSmall
                isDestructive
                onClick={() => deleteModel(index)}
                title={__('Delete', 's2j-alliance-manager')}
              >
                {__('Delete', 's2j-alliance-manager')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="s2j-content-actions">
        <Button
          isPrimary
          onClick={addNewModel}
          disabled={isLoading}
        >
          {__('Add New Partner', 's2j-alliance-manager')}
        </Button>
      </div>

      {showMessageModal !== null && (
        <MessageModal
          message={contentModels[showMessageModal]?.message || ''}
          onSave={(message) => updateMessage(showMessageModal, message)}
          onCancel={closeMessageModal}
        />
      )}
    </div>
  );
};
