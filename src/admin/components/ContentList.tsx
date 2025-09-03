import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, CheckboxControl, SelectControl, TextControl } from '@wordpress/components';
import { ContentModel } from '../../types';
import { rankOptions, behaviorOptions } from '../data/constants';
import { MediaUploader } from './MediaUploader';
import { MessageModal } from './MessageModal';

interface ContentListProps {
  contentModels: ContentModel[];
  onUpdate: (models: ContentModel[]) => Promise<void>;
  isLoading?: boolean;
}

export const ContentList: React.FC<ContentListProps> = ({
  contentModels,
  onUpdate,
  isLoading = false
}) => {
  const [showMessageModal, setShowMessageModal] = useState<number | null>(null);

  const addNewModel = async () => {
    console.log('addNewModel called, current models:', contentModels.length);
    const newModel: ContentModel = {
      frontpage: 'NO',
      rank: 'default',
      logo: 0,
      jump_url: '',
      behavior: 'jump',
      message: ''
    };
    const updatedModels = [...contentModels, newModel];
    console.log('Updated models:', updatedModels.length);
    await onUpdate(updatedModels);
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

  console.log('ContentList rendering with models:', contentModels.length, 'isLoading:', isLoading);

  return (
    <div className="s2j-content-list">
      <div className="s2j-content-actions">
        <button
          onClick={addNewModel}
          disabled={isLoading}
          style={{ padding: '8px 16px', backgroundColor: '#0073aa', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {__('Add New Partner', 's2j-alliance-manager')}
        </button>
      </div>

      <div className="s2j-content-models">
        {contentModels.length === 0 ? (
          <div className="s2j-empty-state">
            <p>{__('No alliance partners added yet. Click "Add New Partner" to get started.', 's2j-alliance-manager')}</p>
          </div>
        ) : (
          contentModels.map((model, index) => (
            <div key={`model-${index}-${model.logo}`} className="s2j-content-model">
              <p>Partner {index + 1}: {model.rank}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
