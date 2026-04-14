import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, TextControl, TextareaControl, RadioControl, CheckboxControl, ColorPicker } from '@wordpress/components';
import { RankLabel, ContentModel } from '../../types';
import { MediaUploader } from './MediaUploader';
import { SlugGenerator } from '../utils/slugGenerator';
import { ErrorHandler, ErrorType } from '../utils/errorHandler';

/**
 * React.FunctionComponent「カラーピッカー・ダイアログ」インターフェイス
 */
interface ColorPickerDialogProps {
  currentColor: string;
  onSelect: (color: string) => void;
  onCancel: () => void;
}

/**
 * React.FunctionComponent「カラーピッカー・ダイアログ」
 */
const ColorPickerDialog: React.FC<ColorPickerDialogProps> = ({
  currentColor,
  onSelect,
  onCancel
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(currentColor);
  const [isTransparent, setIsTransparent] = useState<boolean>(currentColor === 'transparent' || !currentColor);
  const dialogRef = useRef<HTMLDivElement>(null);

  /**
   * ESC キーで閉じる機能
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onCancel]);

  /**
   * オーバーレイ・クリックで閉じる機能
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  /**
   * Transparent を選択
   */
  const handleTransparentSelect = () => {
    setIsTransparent(true);
    setSelectedColor('transparent');
  };

  /**
   * カラーを選択
   */
  const handleColorSelect = (colors: string | { hex?: string; rgb?: { r: number; g: number; b: number; a?: number } }) => {
    setIsTransparent(false);
    let colorValue = 'transparent';
    if (typeof colors === 'string') {
      colorValue = colors || 'transparent';
    } else if (colors && typeof colors === 'object') {
      if (colors.hex) {
        colorValue = colors.hex === 'transparent' || !colors.hex ? 'transparent' : colors.hex;
      } else if (colors.rgb) {
        const { r, g, b, a } = colors.rgb;
        if (a !== undefined && a < 1) {
          colorValue = `rgba(${r}, ${g}, ${b}, ${a})`;
        } else {
          colorValue = `rgb(${r}, ${g}, ${b})`;
        }
      }
    }
    setSelectedColor(colorValue);
  };

  /**
   * 適用ボタンをクリック
   */
  const handleApply = () => {
    onSelect(selectedColor);
  };

  return (
    <div 
      className="s2j-color-picker-dialog-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000
      }}
    >
      <div
        ref={dialogRef}
        className="s2j-color-picker-dialog"
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          minWidth: '320px',
          maxWidth: '400px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
          {__('Select Background Color', 's2j-alliance-manager')}
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <Button
            variant={isTransparent ? 'primary' : 'secondary'}
            onClick={handleTransparentSelect}
            style={{ width: '100%', marginBottom: '8px' }}
          >
            {__('Transparent', 's2j-alliance-manager')}
          </Button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
            {__('Or select a color:', 's2j-alliance-manager')}
          </label>
          <ColorPicker
            color={isTransparent ? '#ffffff' : selectedColor}
            onChangeComplete={handleColorSelect}
            enableAlpha={true}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            {__('Cancel', 's2j-alliance-manager')}
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
          >
            {__('Apply', 's2j-alliance-manager')}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * React.FunctionComponent「ランクラベル管理 UI」インターフェイス
 * @param param0 React.FunctionComponent「ランクラベル管理 UI」インターフェイス
 * @returns React.FunctionComponent「ランクラベル管理 UI」インターフェイス
 */
interface RankLabelManagerProps {
  rankLabels: RankLabel[];
  contentModels: ContentModel[];
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
  contentModels,
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
   * カラーピッカー・ダイアログが開いているインデックス
   */
  const [openColorPickerIndex, setOpenColorPickerIndex] = useState<number | null>(null);

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
      slug: '',
      logo_size_type: 'none',
      logo_size_value: 0,
      carousel_enabled: false,
      background_color: 'transparent'
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

        // Carousel 設定のバリデーション: 子要素数が4〜8の範囲外の場合、Carousel 設定を無効化
        const validatedLabels = pendingLabels.map(label => {
          const childrenCount = childrenCountByRank[label.slug] || childrenCountByRank[label.title] || 0;
          const canEnableCarousel = childrenCount >= 4 && childrenCount <= 8;

          // carousel_enabled を明示的に設定 (false の場合も含む)
          const carouselEnabled = canEnableCarousel && (label.carousel_enabled === true) ? true : false;

          return { 
            ...label, 
            carousel_enabled: carouselEnabled
          };
        });

        // ランクラベルを保存
        const response = await fetch(
          `${window.s2jAllianceManager.apiUrl}rank-labels`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': window.s2jAllianceManager.nonce
            },
            body: JSON.stringify({rank_labels: validatedLabels})
          }
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            // 親コンポーネントに反映
            await onUpdate(validatedLabels);

            // 変更保留中のランクラベルをクリア
            setPendingLabels(null);

            // 変更保留中かどうかをクリア
            setHasUnsavedChanges(false);

            // 元の順序を更新
            setOriginalOrder(validatedLabels.map((_, index) => index));

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

  /**
   * 各ランクの子要素数 (コンテンツモデル数) をカウントします。
   * @param rankTitle ランクのタイトルまたはスラッグ
   * @param isFirstRank 最初のランクかどうか
   * @returns 子要素数
   */
  const countChildrenByRank = useCallback((rankTitle: string, isFirstRank: boolean): number => {
    return contentModels.filter(model => {
      const modelRank = model.rank || '';
      const rankTitleLower = rankTitle.toLowerCase();
      const modelRankLower = modelRank.toLowerCase();

      // default は最初のランクにのみマッチ
      if (modelRank === 'default') {
        return isFirstRank && model.frontpage === 'YES';
      }

      // 通常のランクマッチング
      return (modelRankLower === rankTitleLower) && model.frontpage === 'YES';
    }).length;
  }, [contentModels]);

  /**
   * 各ランクの子要素数をメモ化します。
   */
  const childrenCountByRank = useMemo(() => {
    const counts: { [key: string]: number } = {};
    displayLabels.forEach((label, index) => {
      const isFirstRank = index === 0;
      const slugCount = countChildrenByRank(label.slug, isFirstRank);
      const titleCount = countChildrenByRank(label.title, isFirstRank);
      counts[label.slug] = slugCount;
      counts[label.title] = titleCount;
    });
    return counts;
  }, [displayLabels, countChildrenByRank]);

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
          {/* 一括操作ボタン (選択モード時のみ表示) */}
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
                {/* 選択チェックボックス (選択モード時のみ表示) */}
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
                <div className="s2j-label-field logo-size">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                      {__('Logo Size', 's2j-alliance-manager')}
                    </label>
                    <RadioControl
                      selected={(label.logo_size_type === 'none' || label.logo_size_type === 'width' || label.logo_size_type === 'height') ? label.logo_size_type : 'none'}
                      options={[
                        { label: __('No size specification (current output)', 's2j-alliance-manager'), value: 'none' },
                        { label: __('Set width for this rank', 's2j-alliance-manager'), value: 'width' },
                        { label: __('Set height for this rank', 's2j-alliance-manager'), value: 'height' },
                      ]}
                      onChange={(value: string) => {
                        const sizeType = (value === 'none' || value === 'width' || value === 'height') ? value : 'none';
                        const currentLabels = pendingLabels || initialRankLabels;
                        const updated = [...currentLabels];
                        updated[index] = { 
                          ...updated[index], 
                          logo_size_type: sizeType,
                          logo_size_value: sizeType === 'none' ? 0 : (updated[index].logo_size_value || 0)
                        };
                        setPendingLabels(updated);
                        setHasUnsavedChanges(true);
                      }}
                    />
                    {(label.logo_size_type === 'width' || label.logo_size_type === 'height') && (
                      <TextControl
                        type="number"
                        value={label.logo_size_value?.toString() || ''}
                        onChange={(value: string) => {
                          const numValue = parseInt(value, 10) || 0;
                          updateLabel(index, 'logo_size_value', numValue);
                        }}
                        label={label.logo_size_type === 'width' ? __('Width (px)', 's2j-alliance-manager') : __('Height (px)', 's2j-alliance-manager')}
                        min={1}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                      />
                    )}
                  </div>
                </div>
                <div className="s2j-label-field carousel">
                  {(() => {
                    const childrenCount = childrenCountByRank[label.slug] || childrenCountByRank[label.title] || 0;
                    const canEnableCarousel = childrenCount >= 4 && childrenCount <= 8;
                    const helpText = canEnableCarousel 
                      ? __('Carousel display can be enabled when there are 4-8 child elements.', 's2j-alliance-manager')
                      : __('Carousel display is only available when there are 4-8 child elements (current: %d).', 's2j-alliance-manager').replace('%d', childrenCount.toString());

                    return (
                      <CheckboxControl
                        label={__('Enable Carousel Display', 's2j-alliance-manager')}
                        checked={label.carousel_enabled || false}
                        onChange={(checked: boolean) => {
                          const currentLabels = pendingLabels || initialRankLabels;
                          const updated = [...currentLabels];
                          updated[index] = { 
                            ...updated[index], 
                            carousel_enabled: canEnableCarousel ? checked : false
                          };
                          setPendingLabels(updated);
                          setHasUnsavedChanges(true);
                        }}
                        disabled={!canEnableCarousel}
                        help={helpText}
                        __nextHasNoMarginBottom={true}
                      />
                    );
                  })()}
                </div>
                <div className="s2j-label-field background-color">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                      {__('Background Color', 's2j-alliance-manager')}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label 
                        htmlFor={`s2j-background-color-btn-${index}`}
                        style={{ fontSize: '13px', fontWeight: 500 }}
                      >
                        {__('Background Color', 's2j-alliance-manager')}
                      </label>
                      <Button
                        id={`s2j-background-color-btn-${index}`}
                        onClick={() => setOpenColorPickerIndex(index)}
                        variant="secondary"
                        style={{ 
                          minWidth: '120px',
                          justifyContent: 'flex-start',
                          backgroundColor: label.background_color && label.background_color !== 'transparent' ? label.background_color : undefined
                        }}
                      >
                        {label.background_color === 'transparent' || !label.background_color 
                          ? __('Transparent', 's2j-alliance-manager')
                          : label.background_color}
                      </Button>
                    </div>
                    {openColorPickerIndex === index && (
                      <ColorPickerDialog
                        currentColor={label.background_color || 'transparent'}
                        onSelect={(color: string) => {
                          const currentLabels = pendingLabels || initialRankLabels;
                          const updated = [...currentLabels];
                          updated[index] = { 
                            ...updated[index], 
                            background_color: color
                          };
                          setPendingLabels(updated);
                          setHasUnsavedChanges(true);
                          setOpenColorPickerIndex(null);
                        }}
                        onCancel={() => setOpenColorPickerIndex(null)}
                      />
                    )}
                  </div>
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
