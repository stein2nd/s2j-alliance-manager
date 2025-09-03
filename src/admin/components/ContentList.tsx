import React, { useState, useEffect } from 'react';
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
  const [pendingModels, setPendingModels] = useState<ContentModel[] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<number[]>([]);

  // contentModelsが変更された時に元の順序を初期化
  useEffect(() => {
    if (contentModels.length > 0 && originalOrder.length === 0) {
      setOriginalOrder(contentModels.map((_, index) => index));
    }
  }, [contentModels, originalOrder.length]);

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

  const updateModel = async (index: number, field: keyof ContentModel, value: any) => {
    const updated = [...contentModels];
    updated[index] = { ...updated[index], [field]: value };
    await onUpdate(updated);
  };

  const deleteModel = async (index: number) => {
    if (window.confirm(__('Are you sure you want to delete this item?', 's2j-alliance-manager'))) {
      const updated = contentModels.filter((_, i) => i !== index);
      await onUpdate(updated);
    }
  };

  const moveModel = (index: number, direction: 'up' | 'down') => {
    const currentModels = pendingModels || contentModels;
    const updated = [...currentModels];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < updated.length) {
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      setPendingModels(updated);
      setHasUnsavedChanges(true);
    }
  };

  const openMessageModal = (index: number) => {
    setShowMessageModal(index);
  };

  const closeMessageModal = () => {
    setShowMessageModal(null);
  };

  const updateMessage = async (index: number, message: string) => {
    await updateModel(index, 'message', message);
    closeMessageModal();
  };

  const saveChanges = async () => {
    if (pendingModels) {
      await onUpdate(pendingModels);
      setPendingModels(null);
      setHasUnsavedChanges(false);
      // 保存後、元の順序をリセット（新しい順序が元の順序になる）
      setOriginalOrder(pendingModels.map((_, index) => index));
    }
  };

  console.log('ContentList rendering with models:', contentModels.length, 'isLoading:', isLoading);

  // 表示するモデルを決定（保留中の変更がある場合はそれを使用、なければ保存済みのモデルを使用）
  const displayModels = pendingModels || contentModels;
  const displayModelsLength = displayModels.length;

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
        {hasUnsavedChanges && (
          <button
            onClick={saveChanges}
            disabled={isLoading}
            style={{ padding: '8px 16px', backgroundColor: '#00a32a', color: 'white', border: 'none', borderRadius: '4px', marginLeft: '8px' }}
          >
            {__('Save', 's2j-alliance-manager')}
          </button>
        )}
      </div>

      <div className="s2j-content-models">
        {displayModelsLength === 0 ? (
          <div className="s2j-empty-state">
            <p>{__('No alliance partners added yet. Click "Add New Partner" to get started.', 's2j-alliance-manager')}</p>
          </div>
        ) : (
          displayModels.map((model, index) => {
            // 保留中の変更がある場合は元の順序を表示、なければ現在のインデックス+1を表示
            const rowNumber = hasUnsavedChanges && originalOrder.length > index 
              ? originalOrder[index] + 1 
              : index + 1;
            
            return (
            <div key={`model-${index}-${model.logo}`} className="s2j-content-model">
              <div className="s2j-row-number">#{rowNumber}</div>
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
                  size="small"
                  onClick={() => moveModel(index, 'up')}
                  disabled={index === 0}
                  title={__('Move Up', 's2j-alliance-manager')}
                >
                  ↑
                </Button>
                <Button
                  size="small"
                  onClick={() => moveModel(index, 'down')}
                  disabled={index === displayModelsLength - 1}
                  title={__('Move Down', 's2j-alliance-manager')}
                >
                  ↓
                </Button>
                <Button
                  size="small"
                  onClick={() => openMessageModal(index)}
                  disabled={model.behavior !== 'modal'}
                  title={model.behavior === 'modal' ? __('Edit Message', 's2j-alliance-manager') : __('Message is only available when behavior is set to "Show Modal"', 's2j-alliance-manager')}
                >
                  {__('Message', 's2j-alliance-manager')}
                </Button>
                <Button
                  size="small"
                  variant="destructive"
                  onClick={() => deleteModel(index)}
                  title={__('Delete', 's2j-alliance-manager')}
                >
                  {__('Delete', 's2j-alliance-manager')}
                </Button>
              </div>
            </div>
            );
          })
        )}
      </div>

      {showMessageModal !== null && (
        <MessageModal
          message={displayModels[showMessageModal]?.message || ''}
          onSave={(message) => updateMessage(showMessageModal, message)}
          onCancel={closeMessageModal}
        />
      )}
    </div>
  );
};
