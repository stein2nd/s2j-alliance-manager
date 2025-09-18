import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, TextControl, TextareaControl } from '@wordpress/components';
import { RankLabel } from '../../types';
import { MediaUploader } from './MediaUploader';

/**
 * React.FunctionComponent「ランクラベル管理 UI」インターフェイス
 */
interface RankLabelManagerProps {
  rankLabels: RankLabel[];
  onUpdate: (rankLabels: RankLabel[]) => Promise<void>;
  isLoading?: boolean;
}

/**
 * React.FunctionComponent「ランクラベル管理 UI」
 * `src/admin/index.tsx` で呼ばれる。
 * 
 * @param param0 ランクラベル
 * @returns ランクラベル・マネージャー
 */
export const RankLabelManager: React.FC<RankLabelManagerProps> = ({
  rankLabels: initialRankLabels,
  onUpdate,
  isLoading = false
}) => {
  const [pendingLabels, setPendingLabels] = useState<RankLabel[] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<number[]>([]);

  // ランクラベルが変更された際に、original order を初期化します。
  useEffect(() => {
    if (initialRankLabels.length > 0 && originalOrder.length === 0) {
      setOriginalOrder(initialRankLabels.map((_, index) => index));
    }
  }, [initialRankLabels, originalOrder.length]);

  /**
   * ランクラベルを追加します。
   * 「s2j-add-rank-label-btn.onClick()」メソッドから呼ばれます。
   */
  const addNewLabel = () => {
    const newLabel: RankLabel = {
      id: 0,
      title: '',
      content: '',
      thumbnail_id: 0,
      menu_order: initialRankLabels.length,
      slug: ''
    };

    const currentLabels = pendingLabels || initialRankLabels;
    const updatedLabels = [...currentLabels, newLabel];

    setPendingLabels(updatedLabels);

    setHasUnsavedChanges(true);

    setOriginalOrder([...originalOrder, originalOrder.length]);
  };

  /**
   * 変更を保存します。
   * 「s2j-save-rank-labels-btn.onClick()」メソッドから呼ばれます。
   */
  const saveChanges = async () => {
    if (pendingLabels) {
      try {
        // ランクラベルを保存します。
        const response = await fetch(
          `${window.s2jAllianceManager.apiUrl}rank-labels`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': window.s2jAllianceManager.nonce
            },
            body: JSON.stringify({rank_labels: pendingLabels})
          }
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            // 親コンポーネントに、新規ランクラベルを反映します。
            await onUpdate(pendingLabels);

            setPendingLabels(null);

            setHasUnsavedChanges(false);

            setOriginalOrder(pendingLabels.map((_, index) => index));

            // 通知を表示します。
            showNotice('success', result.message || __('Rank labels saved successfully.', 's2j-alliance-manager'));
          } else {
            // 通知を表示します。
            showNotice('error', result.message || __('Failed to save rank labels.', 's2j-alliance-manager'));
          }
        } else {
          // 通知を表示します。
          showNotice('error', __('Failed to save rank labels.', 's2j-alliance-manager'));
        }
      } catch (error) {
        console.error('Error saving rank labels:', error);

        // 通知を表示します。
        showNotice('error', __('Failed to save rank labels.', 's2j-alliance-manager'));
      }
    }
  };

  /**
   * 変更をキャンセルします。
   * 「s2j-cancel-rank-labels-btn.onClick()」メソッドから呼ばれます。
   */
  const cancelChanges = () => {
    setPendingLabels(null);

    setHasUnsavedChanges(false);

    setOriginalOrder(initialRankLabels.map((_, index) => index));
  };

  /**
   * ランクラベルを更新します。
   * 「s2j-label-field title.TextControl.onChange()」メソッド、「s2j-label-field content.TextareaControl.onChange()」メソッド、「s2j-label-field thumbnail.MediaUploader.onSelect()」メソッドから呼ばれます。
   * 
   * @param index 
   * @param field 
   * @param value 
   */
  const updateLabel = (index: number, field: keyof RankLabel, value: any) => {
    const currentLabels = pendingLabels || initialRankLabels;
    const updated = [...currentLabels];
    updated[index] = { ...updated[index], [field]: value };

    // title 変更時に slug を更新します。
    if (field === 'title') {
      updated[index].slug = value.toLowerCase().replace(/\s+/g, '-');
    }

    setPendingLabels(updated);

    setHasUnsavedChanges(true);
  };

  /**
   * ランクラベルを移動します。
   * 「s2j-move-up-btn.onClick()」メソッド、「s2j-move-down-btn.onClick()」メソッドから呼ばれます。
   * 
   * @param index 
   * @param direction 
   */
  const moveLabel = (index: number, direction: 'up' | 'down') => {
    const currentLabels = pendingLabels || initialRankLabels;
    const updated = [...currentLabels];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < updated.length) {
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

      // `menu_order` を更新します。
      updated.forEach((label, idx) => {
        label.menu_order = idx;
      });

      setPendingLabels(updated);
      setHasUnsavedChanges(true);
    }
  };

  /**
   * ランクラベルを削除します。
   * 「s2j-delete-btn.onClick()」メソッドから呼ばれます。
   * 
   * @param index 
   */
  const deleteLabel = (index: number) => {
    if (window.confirm(__('Are you sure you want to delete this rank label?', 's2j-alliance-manager'))) {
      const currentLabels = pendingLabels || initialRankLabels;
      const updated = currentLabels.filter((_, i) => i !== index);

      setPendingLabels(updated);
      setHasUnsavedChanges(true);

      // original order を更新します。
      const newOriginalOrder = originalOrder.filter((_, i) => i !== index);
      setOriginalOrder(newOriginalOrder);
    }
  };

  /**
   * 通知を表示します。
   * 「saveChanges()」メソッドから呼ばれます。
   * 
   * @param type 
   * @param message 
   */
  const showNotice = (type: 'success' | 'error', message: string) => {
    const notice = document.createElement('div');
    notice.className = `notice notice-${type} is-dismissible`;
    notice.innerHTML = `<p>${message}</p>`;

    const container = document.querySelector('.wrap');
    if (container) {
      container.insertBefore(notice, container.firstChild);

      // 5秒後に自動で消えます。
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 5000);
    }
  };

  // 表示ラベル (変更保留中と保存済み)
  const displayLabels = pendingLabels || initialRankLabels;
  const displayLabelsLength = displayLabels.length;

  console.log('RankLabelManager render - displayLabelsLength:', displayLabelsLength, 'hasUnsavedChanges:', hasUnsavedChanges);

  return (
    <div className="s2j-rank-label-manager">
      <div className="s2j-rank-label-header">
        <h3>{__('Rank Label Management', 's2j-alliance-manager')}</h3>
        <div className="s2j-rank-label-actions">
          <button
            onClick={addNewLabel}
            disabled={isLoading}
            className="s2j-add-rank-label-btn"
          >
            <span className="s2j-button-text">{__('Add New Rank Label', 's2j-alliance-manager')}</span>
          </button>
          {hasUnsavedChanges && (
            <>
              <button
                onClick={saveChanges}
                disabled={isLoading}
                className="s2j-save-rank-labels-btn"
              >
                <span className="s2j-button-text">{__('Save Rank Labels', 's2j-alliance-manager')}</span>
              </button>
              <button
                onClick={cancelChanges}
                disabled={isLoading}
                className="s2j-cancel-rank-labels-btn"
              >
                <span className="s2j-button-text">{__('Cancel', 's2j-alliance-manager')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="s2j-rank-labels">
        {displayLabelsLength === 0 ? (
          <div className="s2j-empty-state">
            <p>{__('No rank labels added yet. Click "Add New Rank Label" to get started.', 's2j-alliance-manager')}</p>
          </div>
        ) : (
          displayLabels.map((label: RankLabel, index: number) => {
            // Show original order number when there are unsaved changes
            const rowNumber = hasUnsavedChanges && originalOrder.length > index ? originalOrder[index] + 1 : index + 1;

            return (
              <div key={`label-${index}-${label.id}`} className={`s2j-rank-label ${hasUnsavedChanges ? 's2j-pending-changes' : ''}`}>
                <div className="s2j-row-number">#{rowNumber}</div>

                <div className="s2j-label-field title">
                  <TextControl
                    value={label.title}
                    onChange={(value: string) => updateLabel(index, 'title', value)}
                    label={__('Title', 's2j-alliance-manager')}
                    placeholder={__('Enter rank label title', 's2j-alliance-manager')}
                  />
                </div>

                <div className="s2j-label-field content">
                  <TextareaControl
                    value={label.content}
                    onChange={(value: string) => updateLabel(index, 'content', value)}
                    label={__('Description', 's2j-alliance-manager')}
                    placeholder={__('Enter description', 's2j-alliance-manager')}
                    rows={2}
                  />
                </div>

                <div className="s2j-label-field thumbnail">
                  <MediaUploader
                    attachmentId={label.thumbnail_id}
                    onSelect={(attachmentId) => updateLabel(index, 'thumbnail_id', attachmentId)}
                    label={__('Thumbnail', 's2j-alliance-manager')}
                  />
                </div>

                <div className="s2j-label-field actions">
                  <Button
                    size="small"
                    onClick={() => moveLabel(index, 'up')}
                    disabled={index === 0}
                    title={__('Move Up', 's2j-alliance-manager')}
                    className="s2j-move-up-btn"
                  >
                    <span className="s2j-button-text">▲ {__('Up', 's2j-alliance-manager')}</span>
                  </Button>
                  <Button
                    size="small"
                    onClick={() => moveLabel(index, 'down')}
                    disabled={index === displayLabelsLength - 1}
                    title={__('Move Down', 's2j-alliance-manager')}
                    className="s2j-move-down-btn"
                  >
                    <span className="s2j-button-text">▼ {__('Down', 's2j-alliance-manager')}</span>
                  </Button>
                  <Button
                    size="small"
                    variant="destructive"
                    onClick={() => deleteLabel(index)}
                    title={__('Delete', 's2j-alliance-manager')}
                    className="s2j-delete-btn"
                  >
                    {__('Delete', 's2j-alliance-manager')}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
