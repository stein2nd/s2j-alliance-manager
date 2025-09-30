import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, CheckboxControl, SelectControl, TextControl } from '@wordpress/components';
import { ContentModel, RankLabel, FFmpegSettings } from '../../types';
import { behaviorOptions } from '../data/constants';
import { MediaUploader } from './MediaUploader';
import { MessageModal } from './MessageModal';

/**
 * React.FunctionComponent「一覧表 UI」インターフェイス
 */
interface ContentListProps {
  contentModels: ContentModel[];
  onUpdate: (models: ContentModel[]) => Promise<void>;
  rankLabels: RankLabel[];
  ffmpegSettings?: FFmpegSettings;
  isLoading?: boolean;
}

/**
 * React.FunctionComponent「一覧表 UI」
 * `src/admin/index.tsx` で呼ばれる。
 * 
 * @param param0 コンテンツモデル
 * @returns 一覧表 UI
 */
export const ContentList: React.FC<ContentListProps> = ({
  contentModels,
  onUpdate,
  rankLabels,
  ffmpegSettings,
  isLoading = false
}) => {
  const [showMessageModal, setShowMessageModal] = useState<number | null>(null);
  const [pendingModels, setPendingModels] = useState<ContentModel[] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<number[]>([]);

  // contentModels が変更された時に、元の順序を初期化
  useEffect(() => {
    if (contentModels.length > 0 && originalOrder.length === 0) {
      setOriginalOrder(contentModels.map((_, index) => index));
    }
  }, [contentModels, originalOrder.length]);

  /**
   * 新しいモデルを追加します。
   * 「s2j-add-partner-btn.onClick()」メソッドから呼ばれます。
   */
  const addNewModel = async () => {
    const newModel: ContentModel = {
      frontpage: 'NO',
      rank: 'default',
      logo: 0,
      poster: 0,
      jump_url: '',
      behavior: 'jump',
      message: ''
    };
    const currentModels = pendingModels || contentModels;
    const updatedModels = [...currentModels, newModel];

    // 追加は常に保留状態にする
    setPendingModels(updatedModels);
    setHasUnsavedChanges(true);

    // 新しいモデルの元の順序を追加
    setOriginalOrder([...originalOrder, originalOrder.length]);
  };

  /**
   * 変更を保存します。
   * 「s2j-save-changes-btn.onClick()」メソッドから呼ばれます。
   */
  const saveChanges = async () => {
    if (pendingModels) {
      await onUpdate(pendingModels);

      setPendingModels(null);
      setHasUnsavedChanges(false);

      // 保存後、元の順序をリセット（新しい順序が元の順序になる）
      setOriginalOrder(pendingModels.map((_, index) => index));
    }
  };

  /**
   * モデルを更新します。
   * 「s2j-model-field frontpage.CheckboxControl.onChange()」メソッド、「s2j-model-field rank.SelectControl.onChange()」メソッド、「s2j-model-field logo.MediaUploader.onSelect()」メソッド、「s2j-model-field jump-url.TextControl.onChange()」メソッド、「s2j-model-field behavior.SelectControl.onChange()」メソッドから呼ばれます。
   * 
   * @param index インデックス
   * @param field フィールド
   * @param value 値
   */
  const updateModel = async (index: number, field: keyof ContentModel, value: string | number) => {
    const currentModels = pendingModels || contentModels;
    const updated = [...currentModels];

    updated[index] = { ...updated[index], [field]: value };

    // 更新は常に保留状態にする
    setPendingModels(updated);

    setHasUnsavedChanges(true);
  };

  /**
   * モデルを移動します。
   * 「s2j-move-up-btn.onClick()」メソッド、「s2j-move-down-btn.onClick()」メソッドから呼ばれます。
   * 
   * @param index インデックス
   * @param direction 方向
   */
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

  /**
   * モデルを削除します。
   * 「s2j-delete-btn.onClick()」メソッドから呼ばれます。
   * 
   * @param index インデックス
   */
  const deleteModel = async (index: number) => {
    if (window.confirm(__('Are you sure you want to delete this item?', 's2j-alliance-manager'))) {
      const currentModels = pendingModels || contentModels;
      const updated = currentModels.filter((_, i) => i !== index);

      // 削除は常に保留状態にする
      setPendingModels(updated);
      setHasUnsavedChanges(true);

      // 元の順序も更新（削除されたインデックス以降を1つずつ前にずらす）
      const newOriginalOrder = originalOrder.filter((_, i) => i !== index);

      setOriginalOrder(newOriginalOrder);
    }
  };

  /**
   * ランクオプションを生成します。
   * 「s2j-model-field rank.SelectControl.onChange()」メソッドから呼ばれます。
   * 
   * @returns ランクオプション
   */
  const getRankOptions = () => {
    const options = rankLabels.map(label => ({
      value: label.slug,
      label: label.title
    }));

    // ラベルが存在しない場合に、デフォルトオプションを追加します
    if (options.length === 0) {
      options.push({
        value: 'default',
        label: __('Default', 's2j-alliance-manager')
      });
    }

    return options;
  };

  /**
   * メッセージ・モーダルを開きます。
   * 「s2j-message-btn.onClick()」メソッドから呼ばれます。
   * 
   * @param index インデックス
   */
  const openMessageModal = (index: number) => {
    setShowMessageModal(index);
  };

  /**
   * メッセージを更新します。
   * 「s2j-content-models.MessageModal.onSave()」メソッドから呼ばれます。
   * 
   * @param index インデックス
   * @param message メッセージ
   */
  const updateMessage = async (index: number, message: string) => {
    await updateModel(index, 'message', message);

    // メッセージ・モーダルを閉じます。
    closeMessageModal();
  };

  /**
   * メッセージ・モーダルを閉じます。
   * 「updateMessage()」メソッドから呼ばれます。
   */
  const closeMessageModal = () => {
    setShowMessageModal(null);
  };

  // 表示するモデルを決定（保留中の変更がある場合はそれを使用、なければ保存済みのモデルを使用）
  const displayModels = pendingModels || contentModels;
  const displayModelsLength = displayModels.length;

  return (
    <div className="s2j-content-list">
      <div className="s2j-content-actions">
        <button
          onClick={addNewModel}
          disabled={isLoading}
          className="s2j-add-partner-btn"
        >
          <span className="s2j-button-text">{__('Add New Partner', 's2j-alliance-manager')}</span>
        </button>
        {hasUnsavedChanges && (
          <button
            onClick={saveChanges}
            disabled={isLoading}
            className="s2j-save-changes-btn"
          >
            <span className="s2j-button-text">{__('Save', 's2j-alliance-manager')}</span>
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
            const rowNumber = hasUnsavedChanges && originalOrder.length > index ? originalOrder[index] + 1 : index + 1;

            // ポスターノティスの表示状態を取得
            // Behavior が「Show Modal」の場合のみポスターノティスを表示
            // 動画ファイルが選択されていて、ポスター画像が存在しない場合に表示
            const hasPosterNotice = model.behavior === 'modal' && model.logo > 0 && model.poster === 0;

            return (
            <div key={`model-${index}-${model.logo}`} className={`s2j-content-model ${hasUnsavedChanges ? 's2j-pending-changes' : ''} ${hasPosterNotice ? 's2j-has-poster-notice' : ''}`}>
              <div className="s2j-row-number">#{rowNumber}</div>
              <div className="s2j-model-field frontpage">
                <CheckboxControl
                  checked={model.frontpage === 'YES'}
                  onChange={(checked: boolean) => updateModel(index, 'frontpage', checked ? 'YES' : 'NO')}
                  label={__('Frontpage', 's2j-alliance-manager')}
                  __nextHasNoMarginBottom={true}
                />
              </div>
              <div className="s2j-model-field rank">
                <SelectControl
                  value={model.rank}
                  options={getRankOptions()}
                  onChange={(value: string) => updateModel(index, 'rank', value)}
                  label={__('Rank', 's2j-alliance-manager')}
                  __next40pxDefaultSize={true}
                  __nextHasNoMarginBottom={true}
                />
              </div>
              <div className="s2j-model-field logo">
                <MediaUploader
                  attachmentId={model.logo}
                  onSelect={(attachmentId) => updateModel(index, 'logo', attachmentId)}
                  posterId={model.poster}
                  onPosterSelect={(posterId) => updateModel(index, 'poster', posterId)}
                  ffmpegSettings={ffmpegSettings}
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
                  __next40pxDefaultSize={true}
                  __nextHasNoMarginBottom={true}
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
                  __next40pxDefaultSize={true}
                  __nextHasNoMarginBottom={true}
                />
              </div>
              <div className="s2j-model-field actions">
                <div className="s2j-navigation-actions">
                  <Button
                    size="small"
                    onClick={() => moveModel(index, 'up')}
                    disabled={index === 0}
                    title={__('Move Up', 's2j-alliance-manager')}
                    className="s2j-move-up-btn"
                  >
                    <span className="s2j-button-text">▲ {__('Up', 's2j-alliance-manager')}</span>
                  </Button>
                  <Button
                    size="small"
                    onClick={() => moveModel(index, 'down')}
                    disabled={index === displayModelsLength - 1}
                    title={__('Move Down', 's2j-alliance-manager')}
                    className="s2j-move-down-btn"
                  >
                    <span className="s2j-button-text">▼ {__('Down', 's2j-alliance-manager')}</span>
                  </Button>
                </div>
                <div className="s2j-management-actions">
                  <Button
                    size="small"
                    onClick={() => openMessageModal(index)}
                    disabled={model.behavior !== 'modal'}
                    title={model.behavior === 'modal' ? __('Edit Message', 's2j-alliance-manager') : __('Message is only available when behavior is set to "Show Modal"', 's2j-alliance-manager')}
                    className="s2j-message-btn"
                  >
                    {__('Message', 's2j-alliance-manager')}
                  </Button>
                  <Button
                    size="small"
                    variant="destructive"
                    onClick={() => deleteModel(index)}
                    title={__('Delete', 's2j-alliance-manager')}
                    className="s2j-delete-btn"
                  >
                    {__('Delete', 's2j-alliance-manager')}
                  </Button>
                </div>
              </div>
              {/* ポスターノティス（独立した行として表示） */}
              {hasPosterNotice && (
                <div className="s2j-poster-notice">
                  <p>{__('No poster image available. Please generate or upload one.', 's2j-alliance-manager')}</p>
                </div>
              )}
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
