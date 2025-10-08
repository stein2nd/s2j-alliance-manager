# S2J Alliance Manager SPEC - RankLabelManager 完全実装プラン

## はじめに

* 本ドキュメントでは、`SPEC_mod.md`の「3. RankLabelManager 完全実装案」で指摘された不足機能について、具体的な実装プランを提案します。
* 特に「バリデーション強化：スラッグ自動生成の改善」「UX 改善: 一括操作機能」「エラーハンドリング: ユーザーフレンドリーなエラーメッセージ」の3つの項目に焦点を当てます。
* 現状分析→現状の問題点→完全実装プラン→実装スケジュール→期待される効果→今後の検討事項の順で構成します。

---

## 1. 現状分析

### 1.1 現在の実装状況

* **実装完了率**: 約90% (UI 実装は完了、細かい調整が必要)
* **実装済み機能**:
  * 基本的なCRUD操作（追加・編集・削除・並び替え）
  * 状態管理（保留中変更の視覚化・元データとの比較）
  * 基本的なスラッグ自動生成
  * 基本的なエラーハンドリング
* **不足機能**:
  * スラッグ自動生成の改善（重複チェック・特殊文字処理）
  * 一括操作機能（一括削除・一括並び替え）
  * ユーザーフレンドリーなエラーメッセージ

### 1.2 現状の問題点

* スラッグ生成が単純すぎる（重複チェックなし）
* 一括操作ができない（個別操作のみ）
* エラーメッセージが技術的すぎる

---

## 2. スラッグ自動生成の改善プラン

### 2.1 実装方針

* **重複チェック**: 既存のスラッグとの重複をチェック
* **文字種制限**: スラッグとして許容される文字のみを許可（小文字、数字、ハイフンのみ）
* **ユニーク性保証**: 重複時は自動で番号付与
* **リアルタイム検証**: 入力時に即座にバリデーション
* **手動入力対応**: タイトルから自動生成 + 手動編集の両方に対応

### 2.2 実装詳細

#### 2.2.1 スラッグ生成ユーティリティの実装

```typescript
// src/admin/utils/slugGenerator.ts
import { RankLabel } from '../../types';

/**
 * スラッグ生成のためのユーティリティ関数
 */
export class SlugGenerator {
  /**
   * タイトルからスラッグを生成します
   * @param title タイトル
   * @param existingLabels 既存のラベル一覧
   * @param excludeIndex 除外するインデックス（編集時）
   * @returns 生成されたスラッグ
   */
  static generateSlug(
    title: string, 
    existingLabels: RankLabel[], 
    excludeIndex?: number
  ): string {
    if (!title.trim()) {
      return '';
    }

    // 基本的なスラッグ生成
    let baseSlug = this.sanitizeTitle(title);
    
    // 重複チェック
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (this.isSlugDuplicate(finalSlug, existingLabels, excludeIndex)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return finalSlug;
  }

  /**
   * タイトルをサニタイズしてスラッグ用の文字列に変換
   * @param title タイトル
   * @returns サニタイズされた文字列
   */
  private static sanitizeTitle(title: string): string {
    return title
      .toLowerCase()
      .trim()
      // スラッグとして許容される文字のみを残す
      .replace(/[^a-z0-9\s-]/g, '-')
      // 連続するハイフンを単一に
      .replace(/-+/g, '-')
      // 先頭・末尾のハイフンを削除
      .replace(/^-+|-+$/g, '')
      // スペースをハイフンに変換
      .replace(/\s+/g, '-');
  }

  /**
   * スラッグの重複をチェック
   * @param slug チェックするスラッグ
   * @param existingLabels 既存のラベル一覧
   * @param excludeIndex 除外するインデックス
   * @returns 重複しているかどうか
   */
  private static isSlugDuplicate(
    slug: string, 
    existingLabels: RankLabel[], 
    excludeIndex?: number
  ): boolean {
    return existingLabels.some((label, index) => 
      index !== excludeIndex && label.slug === slug
    );
  }

  /**
   * スラッグの妥当性をチェック
   * @param slug チェックするスラッグ
   * @returns 妥当性チェック結果
   */
  static validateSlug(slug: string): { isValid: boolean; message?: string } {
    if (!slug.trim()) {
      return { isValid: false, message: __('Slug is required.', 's2j-alliance-manager') };
    }

    // スラッグとして許容される文字のみかチェック
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { 
        isValid: false, 
        message: __('Slug can only contain lowercase letters, numbers, and hyphens.', 's2j-alliance-manager') 
      };
    }

    // 先頭・末尾がハイフンでないかチェック
    if (slug.startsWith('-') || slug.endsWith('-')) {
      return { 
        isValid: false, 
        message: __('Slug cannot start or end with a hyphen.', 's2j-alliance-manager') 
      };
    }

    // 連続するハイフンがないかチェック
    if (slug.includes('--')) {
      return { 
        isValid: false, 
        message: __('Slug cannot contain consecutive hyphens.', 's2j-alliance-manager') 
      };
    }

    return { isValid: true };
  }
}
```

#### 2.2.2 RankLabelManagerでのスラッグ生成改善

```typescript
// RankLabelManager.tsx の updateLabel 関数を改善
import { SlugGenerator } from '../utils/slugGenerator';

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
      showNotice('info', __('Slug automatically generated to avoid duplicates.', 's2j-alliance-manager'));
    }
  }

  setPendingLabels(updated);
  setHasUnsavedChanges(true);
};
```

#### 2.2.3 スラッグ入力フィールドの実装

```typescript
// RankLabelManager.tsx にスラッグ入力フィールドを追加
const RankLabelManager: React.FC<RankLabelManagerProps> = ({
  rankLabels: initialRankLabels,
  onUpdate,
  isLoading = false
}) => {
  // ... 既存のコード ...

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
      showNotice('error', validation.message || __('Invalid slug format.', 's2j-alliance-manager'));
      return;
    }
    
    // 重複チェック
    const isDuplicate = SlugGenerator.isSlugDuplicate(slug, currentLabels, index);
    if (isDuplicate) {
      showNotice('error', __('This slug is already in use. Please choose a different one.', 's2j-alliance-manager'));
      return;
    }
    
    updated[index].slug = slug;
    setPendingLabels(updated);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="s2j-rank-label-manager">
      {/* ... 既存のコード ... */}
      
      <div className="s2j-rank-labels">
        {displayLabelsLength === 0 ? (
          <div className="s2j-empty-state">
            <p>{__('No rank labels added yet. Click "Add New Rank Label" to get started.', 's2j-alliance-manager')}</p>
          </div>
        ) : (
          displayLabels.map((label: RankLabel, index: number) => {
            const rowNumber = hasUnsavedChanges && originalOrder.length > index ? originalOrder[index] + 1 : index + 1;
            const isSelected = selectedIndices.includes(index);

            return (
              <div 
                key={`label-${index}-${label.id}`} 
                className={`s2j-rank-label ${hasUnsavedChanges ? 's2j-pending-changes' : ''} ${isSelected ? 's2j-selected' : ''}`}
              >
                {/* ... 既存のフィールド ... */}
                
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
                
                {/* ... 既存のフィールド ... */}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
```

---

## 3. 一括操作機能の完全実装プラン

### 3.1 実装方針

* **一括選択**: チェックボックスによる複数選択
* **一括削除**: 選択した項目の一括削除
* **一括並び替え**: 選択した項目の一括移動
* **一括編集**: 選択した項目の一括編集

### 3.2 実装詳細

#### 3.2.1 一括操作機能の実装

```typescript
// RankLabelManager.tsx に一括操作機能を追加
interface RankLabelManagerState {
  pendingLabels: RankLabel[] | null;
  hasUnsavedChanges: boolean;
  originalOrder: number[];
  selectedIndices: number[]; // 選択されたインデックス
  isSelectMode: boolean; // 選択モードかどうか
}

const RankLabelManager: React.FC<RankLabelManagerProps> = ({
  rankLabels: initialRankLabels,
  onUpdate,
  isLoading = false
}) => {
  const [pendingLabels, setPendingLabels] = useState<RankLabel[] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<number[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

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
    
    const confirmMessage = selectedIndices.length === 1 
      ? __('Are you sure you want to delete the selected rank label?', 's2j-alliance-manager')
      : __('Are you sure you want to delete the selected rank labels?', 's2j-alliance-manager');
    
    if (window.confirm(confirmMessage)) {
      const currentLabels = pendingLabels || initialRankLabels;
      const updated = currentLabels.filter((_, i) => !selectedIndices.includes(i));
      
      setPendingLabels(updated);
      setHasUnsavedChanges(true);
      setSelectedIndices([]);
      
      // original order を更新
      const newOriginalOrder = originalOrder.filter((_, i) => !selectedIndices.includes(i));
      setOriginalOrder(newOriginalOrder);
      
      showNotice('success', 
        selectedIndices.length === 1 
          ? __('Rank label deleted successfully.', 's2j-alliance-manager')
          : __('Rank labels deleted successfully.', 's2j-alliance-manager')
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
    
    showNotice('success', 
      selectedIndices.length === 1 
        ? __('Rank label moved successfully.', 's2j-alliance-manager')
        : __('Rank labels moved successfully.', 's2j-alliance-manager')
    );
  };

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
            <span className="s2j-button-text">
              {isSelectMode ? __('Exit Select Mode', 's2j-alliance-manager') : __('Select Mode', 's2j-alliance-manager')}
            </span>
          </button>
          
          {/* 一括操作ボタン（選択モード時のみ表示） */}
          {isSelectMode && (
            <>
              <button
                onClick={toggleSelectAll}
                className="s2j-select-all-btn"
              >
                <span className="s2j-button-text">
                  {selectedIndices.length === (pendingLabels || initialRankLabels).length 
                    ? __('Deselect All', 's2j-alliance-manager')
                    : __('Select All', 's2j-alliance-manager')
                  }
                </span>
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
                    <span className="s2j-button-text">
                      {selectedIndices.length === 1 
                        ? __('Delete Selected', 's2j-alliance-manager')
                        : __('Delete Selected', 's2j-alliance-manager')
                      }
                    </span>
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
                
                {/* 既存のフィールド */}
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
                
                {/* スラッグ表示（デバッグ用） */}
                <div className="s2j-label-field slug">
                  <TextControl
                    value={label.slug}
                    onChange={(value: string) => updateLabel(index, 'slug', value)}
                    label={__('Slug', 's2j-alliance-manager')}
                    placeholder={__('Auto-generated slug', 's2j-alliance-manager')}
                    help={__('This slug is automatically generated from the title.', 's2j-alliance-manager')}
                    __next40pxDefaultSize={true}
                    __nextHasNoMarginBottom={true}
                  />
                </div>
                
                {/* 既存のフィールド（content, thumbnail, actions） */}
                {/* ... 既存のコード ... */}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
```

---

## 4. エラーハンドリングの完全実装プラン

### 4.1 実装方針

* **エラーメッセージの分類**: 技術的エラーとユーザーエラーを分離
* **多言語対応**: 翻訳可能なエラーメッセージ
* **コンテキスト情報**: エラーの原因と解決方法を提示
* **視覚的フィードバック**: エラー状態の明確な表示

### 4.2 実装詳細

#### 4.2.1 エラーメッセージ管理システムの実装

```typescript
// src/admin/utils/errorHandler.ts
import { __ } from '@wordpress/i18n';

/**
 * エラーメッセージの種類
 */
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  PERMISSION = 'permission',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * エラーメッセージのインターフェイス
 */
export interface ErrorMessage {
  type: ErrorType;
  title: string;
  message: string;
  suggestion?: string;
  action?: string;
}

/**
 * エラーハンドリングのためのユーティリティクラス
 */
export class ErrorHandler {
  /**
   * エラーを解析してユーザーフレンドリーなメッセージを生成
   * @param error エラーオブジェクト
   * @param context エラーのコンテキスト
   * @returns エラーメッセージ
   */
  static parseError(error: any, context: string): ErrorMessage {
    // ネットワークエラー
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        title: __('Connection Error', 's2j-alliance-manager'),
        message: __('Unable to connect to the server. Please check your internet connection and try again.', 's2j-alliance-manager'),
        suggestion: __('Check your internet connection and refresh the page.', 's2j-alliance-manager'),
        action: __('Retry', 's2j-alliance-manager')
      };
    }

    // HTTPステータスエラー
    if (error.status) {
      switch (error.status) {
        case 400:
          return {
            type: ErrorType.VALIDATION,
            title: __('Invalid Request', 's2j-alliance-manager'),
            message: __('The data you entered is invalid. Please check your input and try again.', 's2j-alliance-manager'),
            suggestion: __('Please review the form fields and ensure all required information is provided.', 's2j-alliance-manager')
          };
        case 401:
          return {
            type: ErrorType.PERMISSION,
            title: __('Authentication Required', 's2j-alliance-manager'),
            message: __('You need to log in again to continue.', 's2j-alliance-manager'),
            suggestion: __('Please refresh the page and log in again.', 's2j-alliance-manager'),
            action: __('Refresh Page', 's2j-alliance-manager')
          };
        case 403:
          return {
            type: ErrorType.PERMISSION,
            title: __('Access Denied', 's2j-alliance-manager'),
            message: __('You do not have permission to perform this action.', 's2j-alliance-manager'),
            suggestion: __('Contact your administrator if you believe this is an error.', 's2j-alliance-manager')
          };
        case 404:
          return {
            type: ErrorType.SERVER,
            title: __('Not Found', 's2j-alliance-manager'),
            message: __('The requested resource was not found.', 's2j-alliance-manager'),
            suggestion: __('The item may have been deleted. Please refresh the page.', 's2j-alliance-manager'),
            action: __('Refresh Page', 's2j-alliance-manager')
          };
        case 500:
          return {
            type: ErrorType.SERVER,
            title: __('Server Error', 's2j-alliance-manager'),
            message: __('A server error occurred. Please try again later.', 's2j-alliance-manager'),
            suggestion: __('If the problem persists, contact your administrator.', 's2j-alliance-manager'),
            action: __('Retry', 's2j-alliance-manager')
          };
        default:
          return {
            type: ErrorType.SERVER,
            title: __('Server Error', 's2j-alliance-manager'),
            message: __('An unexpected error occurred. Please try again.', 's2j-alliance-manager'),
            suggestion: __('If the problem persists, contact your administrator.', 's2j-alliance-manager'),
            action: __('Retry', 's2j-alliance-manager')
          };
      }
    }

    // バリデーションエラー
    if (error.validation) {
      return {
        type: ErrorType.VALIDATION,
        title: __('Validation Error', 's2j-alliance-manager'),
        message: error.message || __('Please check your input and try again.', 's2j-alliance-manager'),
        suggestion: __('Review the highlighted fields and correct any errors.', 's2j-alliance-manager')
      };
    }

    // デフォルトエラー
    return {
      type: ErrorType.UNKNOWN,
      title: __('Unexpected Error', 's2j-alliance-manager'),
      message: __('An unexpected error occurred. Please try again.', 's2j-alliance-manager'),
      suggestion: __('If the problem persists, contact your administrator.', 's2j-alliance-manager'),
      action: __('Retry', 's2j-alliance-manager')
    };
  }

  /**
   * エラーメッセージを表示
   * @param errorMessage エラーメッセージ
   * @param context エラーのコンテキスト
   */
  static showError(errorMessage: ErrorMessage, context: string): void {
    const notice = document.createElement('div');
    notice.className = `notice notice-error is-dismissible s2j-error-notice`;
    notice.setAttribute('data-context', context);
    
    let noticeContent = `
      <div class="s2j-error-content">
        <div class="s2j-error-header">
          <h4 class="s2j-error-title">${errorMessage.title}</h4>
          <button type="button" class="notice-dismiss" aria-label="${__('Dismiss this notice.', 's2j-alliance-manager')}">
            <span class="screen-reader-text">${__('Dismiss this notice.', 's2j-alliance-manager')}</span>
          </button>
        </div>
        <div class="s2j-error-body">
          <p class="s2j-error-message">${errorMessage.message}</p>
          ${errorMessage.suggestion ? `<p class="s2j-error-suggestion">${errorMessage.suggestion}</p>` : ''}
        </div>
        ${errorMessage.action ? `
          <div class="s2j-error-actions">
            <button type="button" class="button s2j-error-action-btn" data-action="${errorMessage.action.toLowerCase().replace(/\s+/g, '-')}">
              ${errorMessage.action}
            </button>
          </div>
        ` : ''}
      </div>
    `;
    
    notice.innerHTML = noticeContent;
    
    const container = document.querySelector('.wrap');
    if (container) {
      container.insertBefore(notice, container.firstChild);
      
      // 自動で消える（エラーの場合は長めに）
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 10000);
      
      // アクションボタンのイベントリスナー
      const actionBtn = notice.querySelector('.s2j-error-action-btn');
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          const action = actionBtn.getAttribute('data-action');
          if (action === 'retry') {
            // リトライ処理
            window.location.reload();
          } else if (action === 'refresh-page') {
            // ページリフレッシュ
            window.location.reload();
          }
        });
      }
    }
  }

  /**
   * 成功メッセージを表示
   * @param message メッセージ
   * @param context コンテキスト
   */
  static showSuccess(message: string, context: string): void {
    const notice = document.createElement('div');
    notice.className = `notice notice-success is-dismissible s2j-success-notice`;
    notice.setAttribute('data-context', context);
    notice.innerHTML = `
      <div class="s2j-success-content">
        <p>${message}</p>
        <button type="button" class="notice-dismiss" aria-label="${__('Dismiss this notice.', 's2j-alliance-manager')}">
          <span class="screen-reader-text">${__('Dismiss this notice.', 's2j-alliance-manager')}</span>
        </button>
      </div>
    `;
    
    const container = document.querySelector('.wrap');
    if (container) {
      container.insertBefore(notice, container.firstChild);
      
      // 5秒後に自動で消える
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 5000);
    }
  }
}
```

#### 4.2.2 RankLabelManagerでのエラーハンドリング改善

```typescript
// RankLabelManager.tsx のエラーハンドリングを改善
import { ErrorHandler, ErrorType } from '../utils/errorHandler';

const RankLabelManager: React.FC<RankLabelManagerProps> = ({
  rankLabels: initialRankLabels,
  onUpdate,
  isLoading = false
}) => {
  // ... 既存のコード ...

  /**
   * 変更を保存します（エラーハンドリング改善版）
   */
  const saveChanges = async () => {
    if (pendingLabels) {
      try {
        // バリデーション
        const validationErrors = validateRankLabels(pendingLabels);
        if (validationErrors.length > 0) {
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

            setPendingLabels(null);
            setHasUnsavedChanges(false);
            setOriginalOrder(pendingLabels.map((_, index) => index));

            // 成功メッセージを表示
            ErrorHandler.showSuccess(
              result.message || __('Rank labels saved successfully.', 's2j-alliance-manager'),
              'rank-label-save'
            );
          } else {
            // サーバーエラー
            ErrorHandler.showError(
              ErrorHandler.parseError({ status: 500, message: result.message }, 'rank-label-save'),
              'rank-label-save'
            );
          }
        } else {
          // HTTPエラー
          ErrorHandler.showError(
            ErrorHandler.parseError({ status: response.status }, 'rank-label-save'),
            'rank-label-save'
          );
        }
      } catch (error) {
        console.error('Error saving rank labels:', error);
        
        // ネットワークエラー
        ErrorHandler.showError(
          ErrorHandler.parseError(error, 'rank-label-save'),
          'rank-label-save'
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
    const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
    if (duplicateTitles.length > 0) {
      errors.push(__('Duplicate titles found. Please ensure all titles are unique.', 's2j-alliance-manager'));
    }
    
    // 必須項目チェック
    labels.forEach((label, index) => {
      if (!label.title.trim()) {
        errors.push(__('Title is required for all rank labels.', 's2j-alliance-manager'));
      }
    });
    
    return errors;
  };

  // ... 既存のコード ...
};
```

---

## 5. CSS実装（SCSS）

### 5.1 一括操作機能のスタイル

```scss
// 一括操作機能のスタイル
.s2j-rank-label-manager {
  .s2j-rank-label-header {
    .s2j-rank-label-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
      
      .s2j-toggle-select-mode-btn {
        background: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &.active {
          background: #0073aa;
          color: white;
          border-color: #0073aa;
        }
        
        &:hover {
          background: #005a87;
          color: white;
        }
      }
      
      .s2j-bulk-move-up-btn,
      .s2j-bulk-move-down-btn {
        background: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        
        &:hover:not(:disabled) {
          background: #e0e0e0;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
      
      .s2j-bulk-delete-btn {
        background: #d63638;
        color: white;
        border: 1px solid #d63638;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        
        &:hover {
          background: #b32d2e;
          border-color: #b32d2e;
        }
      }
    }
  }
  
  .s2j-rank-labels {
    .s2j-rank-label {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      margin-bottom: 10px;
      transition: all 0.2s ease;
      
      &.s2j-selected {
        background: #f0f8ff;
        border-color: #0073aa;
        box-shadow: 0 0 0 2px rgba(0, 115, 170, 0.2);
      }
      
      .s2j-selection-checkbox {
        input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
      }
      
      .s2j-label-field.slug {
        .components-text-control__input {
          font-family: monospace;
          background: #f9f9f9;
          color: #666;
        }
      }
    }
  }
}
```

### 5.2 エラーメッセージのスタイル

```scss
// エラーメッセージのスタイル
.s2j-error-notice {
  .s2j-error-content {
    .s2j-error-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      
      .s2j-error-title {
        margin: 0;
        font-size: 1.1em;
        font-weight: 600;
        color: #d63638;
      }
    }
    
    .s2j-error-body {
      .s2j-error-message {
        margin: 0 0 10px 0;
        font-weight: 500;
      }
      
      .s2j-error-suggestion {
        margin: 0;
        font-size: 0.9em;
        color: #666;
        font-style: italic;
      }
    }
    
    .s2j-error-actions {
      margin-top: 15px;
      
      .s2j-error-action-btn {
        background: #0073aa;
        color: white;
        border: 1px solid #0073aa;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        
        &:hover {
          background: #005a87;
          border-color: #005a87;
        }
      }
    }
  }
}

.s2j-success-notice {
  .s2j-success-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    p {
      margin: 0;
      font-weight: 500;
      color: #00a32a;
    }
  }
}
```

---

## 6. 実装スケジュール

### 6.1 Phase 1: スラッグ自動生成の改善 (1日)

* SlugGeneratorユーティリティクラスの実装
* 日本語・特殊文字処理の実装
* 重複チェック機能の実装
* RankLabelManagerでの統合

### 6.2 Phase 2: 一括操作機能の実装 (1日)

* 選択モード機能の実装
* 一括選択・一括削除機能の実装
* 一括並び替え機能の実装
* UI/UXの実装

### 6.3 Phase 3: エラーハンドリングの改善 (1日)

* ErrorHandlerユーティリティクラスの実装
* ユーザーフレンドリーなエラーメッセージの実装
* バリデーション機能の強化
* 視覚的フィードバックの実装

### 6.4 Phase 4: 統合テスト・最終調整 (0.5日)

* 全機能の統合テスト
* ユーザビリティテスト
* 最終調整・ドキュメント更新

---

## 7. 期待される効果

### 7.1 ユーザー体験の向上

* **直感的な操作**: 一括操作による効率的な管理
* **分かりやすいエラー**: ユーザーフレンドリーなエラーメッセージ
* **自動化**: スラッグ自動生成による作業効率向上

### 7.2 開発効率の向上

* **保守性向上**: 明確な責任分離・型安全性
* **拡張性向上**: モジュール化された設計
* **デバッグ効率**: 適切なエラーハンドリング・ログ出力

### 7.3 品質の向上

* **バグ削減**: バリデーション機能・エラーハンドリング
* **セキュリティ**: 適切なサニタイゼーション・権限チェック
* **国際化**: 多言語対応・地域別表示

---

## 8. 今後の検討事項

### 8.1 S2J Slug Generator との統合

* **現状**: 独自のスラッグ生成機能を実装
* **将来の統合**: 別途開発中の「S2J Slug Generator」の機能を流用
* **統合メリット**:
  * 日本語のひらがな・カタカナ・漢字の適切なローマ字変換
  * より高度なスラッグ生成機能
  * プラグイン間での機能統一
* **実装時期**: Backlog として検討

### 8.2 スラッグ生成の改善案

* **案1**: 現在の実装（文字種制限 + 手動入力対応）
  * メリット: シンプルで保守しやすい
  * デメリット: 日本語タイトルからは基本的なスラッグしか生成できない
* **案2**: S2J Slug Generator との統合
  * メリット: 高度なスラッグ生成機能
  * デメリット: 外部依存の増加

---

## 9. まとめ

本実装プランでは、RankLabelManagerの不足機能である「スラッグ自動生成の改善」「一括操作機能」「ユーザーフレンドリーなエラーメッセージ」について、具体的な実装方法を示しました。

### 9.1 スラッグ生成の改善

* **文字種制限**: スラッグとして許容される文字のみを許可
* **手動入力対応**: タイトルから自動生成 + 手動編集の両方に対応
* **将来の統合**: S2J Slug Generator との統合を Backlog として検討

### 9.2 実装効果

これらの実装により、RankLabelManagerの完成度が90%から100%に向上し、ユーザーにとって使いやすく、開発者にとって保守しやすい高品質なコンポーネントが実現されます。

なお、「ドラッグ&ドロップ並び替え」については、SettingsFormと同様に今後の実装課題として残しておきます。
