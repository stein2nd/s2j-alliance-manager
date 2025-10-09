import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, TextControl, TextareaControl } from '@wordpress/components';
import { RankLabel } from '../../types';
import { MediaUploader } from './MediaUploader';
import { SlugGenerator } from '../utils/slugGenerator';
import { ErrorHandler, ErrorType } from '../utils/errorHandler';

/**
 * React.FunctionComponent「ランクラベル管理 UI」インターフェイス
 * @param param0 React.FunctionComponent「ランクラベル管理 UI」インターフェイス
 * @returns React.FunctionComponent「ランクラベル管理 UI」インターフェイス
 */
interface RankLabelManagerProps {
  rankLabels: RankLabel[];
  onUpdate: (rankLabels: RankLabel[]) => Promise<void>;
  isLoading?: boolean;
}

/**
 * React.FunctionComponent「ランクラベル管理 UI」
 * `src/admin/index.tsx` で呼ばれる。
 * @param param0 React.FunctionComponent「ランクラベル管理 UI」
 * @returns React.FunctionComponent「ランクラベル管理 UI」
 */
export const RankLabelManager: React.FC<RankLabelManagerProps> = ({
  rankLabels: initialRankLabels,
  onUpdate,
  isLoading = false
}) => {
  /**
   * 変更保留中のランクラベル
   */
  const [pendingLabels, setPendingLabels] = useState<RankLabel[] | null>(null);

  /**
   * 変更保留中かどうか
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * 元の順序
   */
  const [originalOrder, setOriginalOrder] = useState<number[]>([]);

  /**
   * 選択されたインデックス
   */
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  /**
   * 選択モードかどうか
   */
  const [isSelectMode, setIsSelectMode] = useState(false);

  /**
   * ランクラベルが変更された際に、original order を初期化します。
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    if (initialRankLabels.length > 0 && originalOrder.length === 0) {
      setOriginalOrder(initialRankLabels.map((_, index) => index));
    }
  }, [initialRankLabels, originalOrder.length]);

  /**
   * ランクラベルを追加します。
   * 「s2j-add-rank-label-btn.onClick()」メソッドから呼ばれます。
   * @returns ランクラベルを追加します。
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

    /**
     * 現在のランクラベル
     */
    const currentLabels = pendingLabels || initialRankLabels;

    /**
     * 更新されたランクラベル
     */
    const updatedLabels = [...currentLabels, newLabel];

    // 変更保留中のランクラベルを更新
    setPendingLabels(updatedLabels);

    // 変更保留中かどうかを更新
    setHasUnsavedChanges(true);

    // 元の順序を更新
    setOriginalOrder([...originalOrder, originalOrder.length]);
  };

  /**
   * 変更を保存します (エラーハンドリング改善版)
   * 「s2j-save-rank-labels-btn.onClick()」メソッドから呼ばれます。
   * @returns 変更を保存します。
   */
  const saveChanges = async () => {
    if (pendingLabels) {
      try {
        // バリデーションチェック
        const validationErrors = validateRankLabels(pendingLabels);

        if (validationErrors.length > 0) {
          // バリデーションエラーを表示
          ErrorHandler.showError({
            type: ErrorType.VALIDATION,
            title: __('Validation Error', 's2j-alliance-manager'),
            message: __('Please correct the following errors before saving:', 's2j-alliance-manager'),
            suggestion: validationErrors.join(' ')
          }, 'rank-label-save');
          return;
        }

        // ランクラベルを保存
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
            // 親コンポーネントに反映
            await onUpdate(pendingLabels);

            // 変更保留中のランクラベルをクリア
            setPendingLabels(null);

            // 変更保留中かどうかをクリア
            setHasUnsavedChanges(false);

            // 元の順序を更新
            setOriginalOrder(pendingLabels.map((_, index) => index));

            // 成功メッセージを表示
            ErrorHandler.showSuccess(
              result.message || __('Rank labels saved successfully.', 's2j-alliance-manager'), 'rank-label-save'
            );
          } else {
            // サーバーエラーを表示
            ErrorHandler.showError(
              ErrorHandler.parseError({ status: 500, message: result.message }, 'rank-label-save'), 'rank-label-save');
          }
        } else {
          // HTTP エラーを表示
          ErrorHandler.showError(
            ErrorHandler.parseError({ status: response.status }, 'rank-label-save'), 'rank-label-save'
          );
        }
      } catch (error) {
        console.error('Error saving rank labels:', error);
        
        // ネットワークエラーを表示
        ErrorHandler.showError(
          ErrorHandler.parseError(error, 'rank-label-save'), 'rank-label-save'
        );
      }
    }
  };

  /**
   * ランクラベルのバリデーション
   * @param labels バリデーションするラベル一覧
   * @returns エラーメッセージの配列
   */
  const validateRankLabels = (labels: RankLabel[]): string[] => {
    const errors: string[] = [];

    // タイトルの重複チェック
    const titles = labels.map(label => label.title.trim()).filter(title => title);

    // タイトルの重複
    const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);

    if (duplicateTitles.length > 0) {
      // エラーメッセージを追加
      errors.push(__('Duplicate titles found. Please ensure all titles are unique.', 's2j-alliance-manager'));
    }

    // 必須項目チェック
    labels.forEach((label) => {
      if (!label.title.trim()) {
        errors.push(__('Title is required for all rank labels.', 's2j-alliance-manager'));
      }
    });

    return errors;
  };

  /**
   * 変更をキャンセルします。
   * 「s2j-cancel-rank-labels-btn.onClick()」メソッドから呼ばれます。
   * @returns 変更をキャンセルします。
   */
  const cancelChanges = () => {
    setPendingLabels(null);

    setHasUnsavedChanges(false);

    setOriginalOrder(initialRankLabels.map((_, index) => index));
  };

  /**
   * ランクラベルを更新します。
   * 「s2j-label-field title.TextControl.onChange()」メソッド、「s2j-label-field content.TextareaControl.onChange()」メソッド、「s2j-label-field thumbnail.MediaUploader.onSelect()」メソッドから呼ばれます。
   * @param index インデックス
   * @param field フィールド
   * @param value 値
   * @returns ランクラベルを更新します。
   */
  const updateLabel = (index: number, field: keyof RankLabel, value: string | number) => {
    const currentLabels = pendingLabels || initialRankLabels;
    const updated = [...currentLabels];
    updated[index] = { ...updated[index], [field]: value };

    // title 変更時にスラッグを自動生成
    if (field === 'title' && typeof value === 'string') {
      const newSlug = SlugGenerator.generateSlug(value, currentLabels, index);
      updated[index].slug = newSlug;

      // スラッグの重複警告を表示
      if (newSlug !== value.toLowerCase().replace(/\s+/g, '-')) {
        ErrorHandler.showSuccess(
          __('Slug automatically generated to avoid duplicates.', 's2j-alliance-manager'), 'rank-label-slug'
        );
      }
    }

    setPendingLabels(updated);
    setHasUnsavedChanges(true);
  };

  /**
   * スラッグを手動で更新します
   * @param index インデックス
   * @param slug スラッグ
   */
  const updateSlug = (index: number, slug: string) => {
    const currentLabels = pendingLabels || initialRankLabels;
    const updated = [...currentLabels];

    // スラッグの妥当性をチェック
    const validation = SlugGenerator.validateSlug(slug);
    if (!validation.isValid) {
      ErrorHandler.showError({
        type: ErrorType.VALIDATION,
        title: __('Validation Error', 's2j-alliance-manager'),
        message: validation.message || __('Invalid slug format.', 's2j-alliance-manager')
      }, 'rank-label-slug');
      return;
    }

    // 重複チェック
    const isDuplicate = SlugGenerator.isSlugDuplicate(slug, currentLabels, index);
    if (isDuplicate) {
      ErrorHandler.showError({
        type: ErrorType.VALIDATION,
        title: __('Validation Error', 's2j-alliance-manager'),
        message: __('This slug is already in use. Please choose a different one.', 's2j-alliance-manager')
      }, 'rank-label-slug');
      return;
    }

    updated[index].slug = slug;
    setPendingLabels(updated);
    setHasUnsavedChanges(true);
  };

  /**
   * ランクラベルを移動します。
   * 「s2j-move-up-btn.onClick()」メソッド、「s2j-move-down-btn.onClick()」メソッドから呼ばれます。
   * @param index インデックス
   * @param direction 方向
   * @returns ランクラベルを移動します。
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
   * @param index インデックス
   * @returns ランクラベルを削除します。
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
   * 選択モードを切り替えます
   */
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIndices([]);
  };

  /**
   * 個別選択を切り替えます
   * @param index インデックス
   */
  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  /**
   * 全選択を切り替えます
   */
  const toggleSelectAll = () => {
    const displayLabels = pendingLabels || initialRankLabels;
    if (selectedIndices.length === displayLabels.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(displayLabels.map((_, index) => index));
    }
  };

  /**
   * 選択した項目を一括削除します
   */
  const bulkDelete = () => {
    if (selectedIndices.length === 0) return;

    // 確認メッセージ
    const confirmMessage = selectedIndices.length === 1 ? __('Are you sure you want to delete the selected rank label?', 's2j-alliance-manager') : __('Are you sure you want to delete the selected rank labels?', 's2j-alliance-manager');

    if (window.confirm(confirmMessage)) {
      // 現在のランクラベル
      const currentLabels = pendingLabels || initialRankLabels;

      // 更新されたランクラベル
      const updated = currentLabels.filter((_, i) => !selectedIndices.includes(i));

      setPendingLabels(updated);
      setHasUnsavedChanges(true);
      setSelectedIndices([]);

      // original order を更新
      const newOriginalOrder = originalOrder.filter((_, i) => !selectedIndices.includes(i));
      setOriginalOrder(newOriginalOrder);

      ErrorHandler.showSuccess(
        selectedIndices.length === 1 ? __('Rank label deleted successfully.', 's2j-alliance-manager') : __('Rank labels deleted successfully.', 's2j-alliance-manager'), 'rank-label-bulk-delete'
      );
    }
  };

  /**
   * 選択した項目を一括移動します
   * @param direction 移動方向
   */
  const bulkMove = (direction: 'up' | 'down') => {
    if (selectedIndices.length === 0) return;

    const currentLabels = pendingLabels || initialRankLabels;
    const updated = [...currentLabels];
    const step = direction === 'up' ? -1 : 1;

    // 選択された項目を移動
    const sortedIndices = [...selectedIndices].sort((a, b) => 
      direction === 'up' ? a - b : b - a
    );

    for (const index of sortedIndices) {
      const newIndex = index + step;
      if (newIndex >= 0 && newIndex < updated.length) {
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      }
    }

    // menu_order を更新
    updated.forEach((label, idx) => {
      label.menu_order = idx;
    });

    setPendingLabels(updated);
    setHasUnsavedChanges(true);

    ErrorHandler.showSuccess(
      selectedIndices.length === 1 ? __('Rank label moved successfully.', 's2j-alliance-manager') : __('Rank labels moved successfully.', 's2j-alliance-manager'), 'rank-label-bulk-move'
    );
  };

  // 表示ラベル (変更保留中と保存済み)
  const displayLabels = pendingLabels || initialRankLabels;
  const displayLabelsLength = displayLabels.length;

  return (
    <div className="s2j-rank-label-manager">
      <div className="s2j-rank-label-header">
        <h3>{__('Rank Label Management', 's2j-alliance-manager')}</h3>
        <div className="s2j-rank-label-actions">
          {/* 選択モード切り替えボタン */}
          <button
            onClick={toggleSelectMode}
            className={`s2j-toggle-select-mode-btn ${isSelectMode ? 'active' : ''}`}
          >
            <span className="s2j-button-text">{isSelectMode ? __('Exit Select Mode', 's2j-alliance-manager') : __('Select Mode', 's2j-alliance-manager')}</span>
          </button>
          {/* 一括操作ボタン（選択モード時のみ表示） */}
          {isSelectMode && (
            <>
              <button
                onClick={toggleSelectAll}
                className="s2j-select-all-btn"
              >
                <span className="s2j-button-text">{selectedIndices.length === (pendingLabels || initialRankLabels).length ? __('Deselect All', 's2j-alliance-manager') : __('Select All', 's2j-alliance-manager') }</span>
              </button>
              {selectedIndices.length > 0 && (
                <>
                  <button
                    onClick={() => bulkMove('up')}
                    disabled={selectedIndices.some(i => i === 0)}
                    className="s2j-bulk-move-up-btn"
                  >
                    <span className="s2j-button-text">▲ {__('Move Up', 's2j-alliance-manager')}</span>
                  </button>
                  <button
                    onClick={() => bulkMove('down')}
                    disabled={selectedIndices.some(i => i === (pendingLabels || initialRankLabels).length - 1)}
                    className="s2j-bulk-move-down-btn"
                  >
                    <span className="s2j-button-text">▼ {__('Move Down', 's2j-alliance-manager')}</span>
                  </button>
                  <button
                    onClick={bulkDelete}
                    className="s2j-bulk-delete-btn destructive"
                  >
                    <span className="s2j-button-text">{selectedIndices.length === 1 ? __('Delete Selected', 's2j-alliance-manager') : __('Delete Selected', 's2j-alliance-manager') }</span>
                  </button>
                </>
              )}
            </>
          )}
          {/* 既存のボタン */}
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
            // 変更保留中の場合は、元の順番を表示、なければ現在のインデックス+1を表示
            const rowNumber = hasUnsavedChanges && originalOrder.length > index ? originalOrder[index] + 1 : index + 1;
            const isSelected = selectedIndices.includes(index);

            return (
              <div 
                key={`label-${index}-${label.id}`} 
                className={`s2j-rank-label ${hasUnsavedChanges ? 's2j-pending-changes' : ''} ${isSelected ? 's2j-selected' : ''}`}
              >
                {/* 選択チェックボックス（選択モード時のみ表示） */}
                {isSelectMode && (
                  <div className="s2j-selection-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(index)}
                      aria-label={__('Select this rank label', 's2j-alliance-manager')}
                    />
                  </div>
                )}
                <div className="s2j-row-number">#{rowNumber}</div>
                <div className="s2j-label-field title">
                  <TextControl
                    value={label.title}
                    onChange={(value: string) => updateLabel(index, 'title', value)}
                    label={__('Title', 's2j-alliance-manager')}
                    placeholder={__('Enter rank label title', 's2j-alliance-manager')}
                    __next40pxDefaultSize={true}
                    __nextHasNoMarginBottom={true}
                  />
                </div>
                {/* スラッグ入力フィールド */}
                <div className="s2j-label-field slug">
                  <TextControl
                    value={label.slug}
                    onChange={(value: string) => updateSlug(index, value)}
                    label={__('Slug', 's2j-alliance-manager')}
                    placeholder={__('Enter slug (lowercase letters, numbers, hyphens only)', 's2j-alliance-manager')}
                    help={__('This slug will be used in URLs. Only lowercase letters, numbers, and hyphens are allowed.', 's2j-alliance-manager')}
                    __next40pxDefaultSize={true}
                    __nextHasNoMarginBottom={true}
                    className="s2j-slug-input"
                  />
                </div>
                <div className="s2j-label-field content">
                  <TextareaControl
                    value={label.content}
                    onChange={(value: string) => updateLabel(index, 'content', value)}
                    label={__('Description', 's2j-alliance-manager')}
                    placeholder={__('Enter description', 's2j-alliance-manager')}
                    rows={2}
                    __nextHasNoMarginBottom={true}
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
