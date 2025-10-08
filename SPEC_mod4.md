# S2J Alliance Manager SPEC - SettingsForm 完全実装プラン

## はじめに

* 本ドキュメントでは、`SPEC_mod.md`の「2. SettingsForm 完全実装案」で指摘された不足機能について、具体的な実装プランを提案します。
* 現在のSettingsFormは基本的なインターフェイス定義のみで、実際の設定フォーム機能が未実装の状態です。
* 現状分析→現状の問題点→完全実装プラン→実装スケジュール→期待される効果→今後の検討事項の順で構成します。

---

## 1. 現状分析

### 1.1 現在の実装状況

* **実装完了率**: 約5% (基本的なインターフェイス定義のみ)
* **実装済み機能**:
  * 基本的なコンポーネント構造
  * TypeScript型定義
  * 基本的なprops受け渡し
* **不足機能**:
  * 表示形式選択機能
  * 配置設定機能
  * FFmpeg パス設定機能
  * バリデーション機能
  * 保存機能
  * プレビュー機能
  * エラーハンドリング

### 1.2 現状の問題点

* 設定フォームが表示されない（プレースホルダーメッセージのみ）
* ユーザーが設定を変更できない
* バリデーション機能がない
* エラーハンドリングがない
* プレビュー機能がない

---

## 2. 基本フォーム機能の完全実装プラン

### 2.1 実装方針

* **WordPress Components 活用**: `@wordpress/components` の `SelectControl`, `RadioControl`, `TextControl` を活用
* **バリデーション機能**: リアルタイム・バリデーションとエラー表示
* **アクセシビリティ対応**: 適切なラベル・ヘルプテキスト・キーボードナビゲーション
* **レスポンシブ・デザイン**: モバイル環境での使いやすさを重視
* **プレビュー機能**: 設定変更時の即座プレビュー表示

### 2.2 実装詳細

#### 2.2.1 コンポーネント構造の拡張

```typescript
// src/admin/components/SettingsForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { 
  SelectControl, 
  RadioControl, 
  TextControl, 
  Button, 
  Card, 
  CardBody, 
  CardHeader,
  Notice,
  Spinner
} from '@wordpress/components';
import { AllianceSettings, RankLabel } from '../../types';

interface SettingsFormProps {
  settings: AllianceSettings;
  onSave: (settings: AllianceSettings) => Promise<void>;
  isLoading?: boolean;
  rankLabels: RankLabel[]; // ランクラベル選択肢用
}

interface SettingsFormState {
  formData: AllianceSettings;
  errors: Record<string, string>;
  hasUnsavedChanges: boolean;
  isSubmitting: boolean;
  previewData: any; // プレビュー用データ
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSave,
  isLoading = false,
  rankLabels
}) => {
  const [formData, setFormData] = useState<AllianceSettings>(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // 設定が変更された際にフォームデータを更新
  useEffect(() => {
    setFormData(settings);
    setHasUnsavedChanges(false);
    setErrors({});
  }, [settings]);

  // プレビューデータの生成
  useEffect(() => {
    generatePreviewData();
  }, [formData]);

  /**
   * プレビューデータを生成します
   */
  const generatePreviewData = useCallback(() => {
    // プレビュー用のサンプルデータを生成
    const sampleData = {
      displayStyle: formData.display_style,
      alignment: formData.alignment,
      ffmpegPath: formData.ffmpeg_path,
      sampleContent: [
        {
          id: 1,
          title: 'Sample Partner 1',
          logo: 0,
          jump_url: 'https://example.com',
          behavior: 'jump',
          rank: 'gold'
        },
        {
          id: 2,
          title: 'Sample Partner 2',
          logo: 0,
          jump_url: '',
          behavior: 'modal',
          rank: 'silver',
          message: 'This is a sample message for modal display.'
        }
      ]
    };
    
    setPreviewData(sampleData);
  }, [formData]);

  /**
   * フォームデータを更新します
   */
  const updateFormData = useCallback((field: keyof AllianceSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setHasUnsavedChanges(true);
    
    // リアルタイムバリデーション
    validateField(field, value);
  }, []);

  /**
   * フィールドのバリデーション
   */
  const validateField = useCallback((field: keyof AllianceSettings, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'display_style':
        if (!value || !['grid-single', 'grid-multi'].includes(value)) {
          newErrors.display_style = __('Please select a valid display style.', 's2j-alliance-manager');
        } else {
          delete newErrors.display_style;
        }
        break;
        
      case 'alignment':
        if (!value || !['left', 'center', 'right'].includes(value)) {
          newErrors.alignment = __('Please select a valid alignment.', 's2j-alliance-manager');
        } else {
          delete newErrors.alignment;
        }
        break;
        
      case 'ffmpeg_path':
        if (value && !isValidFilePath(value)) {
          newErrors.ffmpeg_path = __('Please enter a valid file path.', 's2j-alliance-manager');
        } else {
          delete newErrors.ffmpeg_path;
        }
        break;
    }
    
    setErrors(newErrors);
  }, [errors]);

  /**
   * ファイルパスの妥当性をチェック
   */
  const isValidFilePath = (path: string): boolean => {
    // 基本的なファイルパス形式をチェック
    return /^[a-zA-Z0-9\/\\:\.\-_]+$/.test(path);
  };

  /**
   * フォーム全体のバリデーション
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    // 必須フィールドのチェック
    if (!formData.display_style) {
      newErrors.display_style = __('Display style is required.', 's2j-alliance-manager');
    }
    
    if (!formData.alignment) {
      newErrors.alignment = __('Alignment is required.', 's2j-alliance-manager');
    }
    
    // FFmpeg パスのチェック
    if (formData.ffmpeg_path && !isValidFilePath(formData.ffmpeg_path)) {
      newErrors.ffmpeg_path = __('Please enter a valid file path.', 's2j-alliance-manager');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * 設定を保存します
   */
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      setHasUnsavedChanges(false);
      setErrors({});
      
      // 成功メッセージを表示
      showNotice('success', __('Settings saved successfully.', 's2j-alliance-manager'));
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotice('error', __('Failed to save settings. Please try again.', 's2j-alliance-manager'));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSave, validateForm]);

  /**
   * 変更をキャンセルします
   */
  const handleCancel = useCallback(() => {
    setFormData(settings);
    setHasUnsavedChanges(false);
    setErrors({});
  }, [settings]);

  /**
   * 通知を表示します
   */
  const showNotice = (type: 'success' | 'error' | 'info', message: string) => {
    const notice = document.createElement('div');
    notice.className = `notice notice-${type} is-dismissible`;
    notice.innerHTML = `<p>${message}</p>`;
    
    const container = document.querySelector('.wrap');
    if (container) {
      container.insertBefore(notice, container.firstChild);
      
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 5000);
    }
  };

  return (
    <div className="s2j-settings-form">
      <div className="s2j-settings-header">
        <h2>{__('Display Settings', 's2j-alliance-manager')}</h2>
        <p className="s2j-settings-description">
          {__('Configure how alliance banners are displayed on your site.', 's2j-alliance-manager')}
        </p>
      </div>

      <div className="s2j-settings-content">
        {/* 表示形式設定 */}
        <Card className="s2j-settings-card">
          <CardHeader>
            <h3>{__('Display Style', 's2j-alliance-manager')}</h3>
          </CardHeader>
          <CardBody>
            <SelectControl
              label={__('Display Style', 's2j-alliance-manager')}
              value={formData.display_style}
              onChange={(value) => updateFormData('display_style', value)}
              options={[
                { label: __('Single Column Grid', 's2j-alliance-manager'), value: 'grid-single' },
                { label: __('Multi Column Grid', 's2j-alliance-manager'), value: 'grid-multi' }
              ]}
              help={__('Choose how the alliance banners are arranged on your site.', 's2j-alliance-manager')}
              __nextHasNoMarginBottom={true}
            />
            {errors.display_style && (
              <Notice status="error" isDismissible={false}>
                {errors.display_style}
              </Notice>
            )}
          </CardBody>
        </Card>

        {/* 配置設定 */}
        <Card className="s2j-settings-card">
          <CardHeader>
            <h3>{__('Alignment', 's2j-alliance-manager')}</h3>
          </CardHeader>
          <CardBody>
            <RadioControl
              label={__('Alignment', 's2j-alliance-manager')}
              selected={formData.alignment}
              options={[
                { label: __('Left', 's2j-alliance-manager'), value: 'left' },
                { label: __('Center', 's2j-alliance-manager'), value: 'center' },
                { label: __('Right', 's2j-alliance-manager'), value: 'right' }
              ]}
              onChange={(value) => updateFormData('alignment', value)}
              help={__('Choose the alignment of the alliance banners.', 's2j-alliance-manager')}
            />
            {errors.alignment && (
              <Notice status="error" isDismissible={false}>
                {errors.alignment}
              </Notice>
            )}
          </CardBody>
        </Card>

        {/* FFmpeg パス設定 */}
        <Card className="s2j-settings-card">
          <CardHeader>
            <h3>{__('FFmpeg Settings', 's2j-alliance-manager')}</h3>
          </CardHeader>
          <CardBody>
            <TextControl
              label={__('FFmpeg Path', 's2j-alliance-manager')}
              value={formData.ffmpeg_path || ''}
              onChange={(value) => updateFormData('ffmpeg_path', value)}
              placeholder={__('Enter the path to FFmpeg executable', 's2j-alliance-manager')}
              help={__('Optional: Path to FFmpeg executable for video processing. Leave empty if not needed.', 's2j-alliance-manager')}
              __nextHasNoMarginBottom={true}
            />
            {errors.ffmpeg_path && (
              <Notice status="error" isDismissible={false}>
                {errors.ffmpeg_path}
              </Notice>
            )}
            
            {/* FFmpeg テストボタン */}
            {formData.ffmpeg_path && (
              <div className="s2j-ffmpeg-test">
                <Button
                  variant="secondary"
                  onClick={handleFFmpegTest}
                  disabled={isSubmitting}
                >
                  {__('Test FFmpeg', 's2j-alliance-manager')}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* プレビュー機能 */}
        <Card className="s2j-settings-card">
          <CardHeader>
            <h3>{__('Preview', 's2j-alliance-manager')}</h3>
          </CardHeader>
          <CardBody>
            <div className="s2j-settings-preview">
              <h4>{__('Preview', 's2j-alliance-manager')}</h4>
              <div className={`s2j-preview-container s2j-preview-${formData.display_style} s2j-preview-${formData.alignment}`}>
                {previewData?.sampleContent.map((item: any, index: number) => (
                  <div key={index} className="s2j-preview-item">
                    <div className="s2j-preview-logo">
                      {item.logo ? '🖼️' : '📷'}
                    </div>
                    <div className="s2j-preview-content">
                      <h5>{item.title}</h5>
                      <p className="s2j-preview-rank">{item.rank}</p>
                      {item.behavior === 'modal' && (
                        <p className="s2j-preview-message">{item.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* アクションボタン */}
      <div className="s2j-settings-actions">
        {hasUnsavedChanges && (
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {__('Cancel', 's2j-alliance-manager')}
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSubmitting || !hasUnsavedChanges || Object.keys(errors).length > 0}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              {__('Saving...', 's2j-alliance-manager')}
            </>
          ) : (
            __('Save Settings', 's2j-alliance-manager')
          )}
        </Button>
      </div>
    </div>
  );
};
```

#### 2.2.2 FFmpeg テスト機能の実装

```typescript
// FFmpeg テスト機能の実装
const handleFFmpegTest = useCallback(async () => {
  if (!formData.ffmpeg_path) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const response = await fetch(`${window.s2jAllianceManager.apiUrl}ffmpeg/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.s2jAllianceManager.nonce
      },
      body: JSON.stringify({ ffmpeg_path: formData.ffmpeg_path })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        showNotice('success', __('FFmpeg is working correctly.', 's2j-alliance-manager'));
      } else {
        showNotice('error', result.message || __('FFmpeg test failed.', 's2j-alliance-manager'));
      }
    } else {
      showNotice('error', __('Failed to test FFmpeg.', 's2j-alliance-manager'));
    }
  } catch (error) {
    console.error('Error testing FFmpeg:', error);
    showNotice('error', __('Failed to test FFmpeg.', 's2j-alliance-manager'));
  } finally {
    setIsSubmitting(false);
  }
}, [formData.ffmpeg_path]);
```

---

## 3. プレビュー機能の完全実装プラン

### 3.1 実装方針

* **リアルタイムプレビュー**: 設定変更時の即座プレビュー表示
* **視覚的フィードバック**: 設定変更を即座にプレビューに反映
* **レスポンシブ対応**: モバイル環境でも適切に表示

### 3.2 実装詳細

#### 3.2.1 プレビュー機能の実装

```typescript
// プレビュー機能の実装
const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSave,
  isLoading = false,
  rankLabels
}) => {
  // ... 既存のコード ...

  return (
    <div className="s2j-settings-form">
      {/* ... 既存のコード ... */}

      <div className="s2j-settings-content">
        {/* ... 既存の設定カード ... */}

        {/* プレビュー機能 */}
        <Card className="s2j-settings-card">
          <CardHeader>
            <h3>{__('Preview', 's2j-alliance-manager')}</h3>
          </CardHeader>
          <CardBody>
            <div className="s2j-settings-preview">
              <h4>{__('Preview', 's2j-alliance-manager')}</h4>
              <div className={`s2j-preview-container s2j-preview-${formData.display_style} s2j-preview-${formData.alignment}`}>
                {previewData?.sampleContent.map((item: any, index: number) => (
                  <div key={index} className="s2j-preview-item">
                    <div className="s2j-preview-logo">
                      {item.logo ? '🖼️' : '📷'}
                    </div>
                    <div className="s2j-preview-content">
                      <h5>{item.title}</h5>
                      <p className="s2j-preview-rank">{item.rank}</p>
                      {item.behavior === 'modal' && (
                        <p className="s2j-preview-message">{item.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ... 既存のコード ... */}
    </div>
  );
};
```

---

## 4. CSS実装（SCSS）

### 4.1 基本フォーム機能のスタイル

```scss
// SettingsForm スタイル
.s2j-settings-form {
  .s2j-settings-header {
    margin-bottom: 30px;
    
    h2 {
      margin: 0 0 10px 0;
      font-size: 1.8em;
      font-weight: 600;
    }
    
    .s2j-settings-description {
      margin: 0;
      color: #666;
      font-size: 1.1em;
    }
  }
  
  .s2j-settings-content {
    display: grid;
    gap: 20px;
    margin-bottom: 30px;
    
    .s2j-settings-card {
      .components-card__header {
        background: #f9f9f9;
        border-bottom: 1px solid #e0e0e0;
        
        h3 {
          margin: 0;
          font-size: 1.2em;
          font-weight: 600;
        }
      }
      
      .components-card__body {
        padding: 20px;
      }
    }
  }
  
  .s2j-settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px 0;
    border-top: 1px solid #e0e0e0;
  }
  
  // FFmpeg テスト機能のスタイル
  .s2j-ffmpeg-test {
    margin-top: 15px;
    
    .components-button {
      background: #f0f0f0;
      border: 1px solid #ccc;
      
      &:hover:not(:disabled) {
        background: #e0e0e0;
      }
    }
  }
  
  // レスポンシブ対応
  @media (max-width: 768px) {
    .s2j-settings-content {
      .s2j-settings-card {
        .components-card__body {
          padding: 15px;
        }
      }
    }
    
    .s2j-settings-actions {
      flex-direction: column;
      
      .components-button {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
```

### 4.2 プレビュー機能のスタイル

```scss
// プレビュー機能のスタイル
.s2j-settings-preview {
  .s2j-preview-container {
    display: grid;
    gap: 15px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #f9f9f9;
    
    &.s2j-preview-grid-single {
      grid-template-columns: 1fr;
    }
    
    &.s2j-preview-grid-multi {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
    
    &.s2j-preview-left {
      justify-items: start;
    }
    
    &.s2j-preview-center {
      justify-items: center;
    }
    
    &.s2j-preview-right {
      justify-items: end;
    }
    
    .s2j-preview-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      .s2j-preview-logo {
        font-size: 2em;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        border-radius: 4px;
      }
      
      .s2j-preview-content {
        flex: 1;
        
        h5 {
          margin: 0 0 5px 0;
          font-size: 1em;
          font-weight: 600;
        }
        
        .s2j-preview-rank {
          margin: 0 0 5px 0;
          font-size: 0.9em;
          color: #666;
          text-transform: capitalize;
        }
        
        .s2j-preview-message {
          margin: 0;
          font-size: 0.85em;
          color: #888;
          font-style: italic;
        }
      }
    }
  }
}
```

---

## 5. 実装スケジュール

### 5.1 Phase 1: 基本フォーム機能の実装 (1日)

* 表示形式選択機能の実装
* 配置設定機能の実装
* FFmpeg パス設定機能の実装
* 基本的なバリデーション機能の実装

### 5.2 Phase 2: プレビュー機能の実装 (1日)

* リアルタイムプレビューの実装
* プレビュー用CSSの実装
* レスポンシブ対応の実装

### 5.3 Phase 3: エラーハンドリング・UX改善 (0.5日)

* エラーハンドリング機能の実装
* 通知機能の実装
* ローディング状態の実装

### 5.4 Phase 4: 統合テスト・最終調整 (0.5日)

* 全機能の統合テスト
* ユーザビリティテスト
* 最終調整・ドキュメント更新

---

## 6. 期待される効果

### 6.1 ユーザー体験の向上

* **直感的な設定**: 分かりやすいUIで設定を変更可能
* **リアルタイムプレビュー**: 設定変更時の即座プレビュー表示
* **バリデーション**: 入力値の妥当性を即座にチェック

### 6.2 開発効率の向上

* **保守性向上**: 明確な責任分離・型安全性
* **拡張性向上**: モジュール化された設計
* **デバッグ効率**: 適切なエラーハンドリング・ログ出力

### 6.3 品質の向上

* **バグ削減**: バリデーション機能・エラーハンドリング
* **セキュリティ**: 適切なサニタイゼーション・権限チェック
* **国際化**: 多言語対応・地域別表示

---

## 7. 今後の検討事項

### 7.1 ドラッグ&ドロップ並び替え

* **現状**: 基本的な設定フォーム機能のみ実装
* **将来の拡張**: ドラッグ&ドロップによる設定項目の並び替え
* **実装時期**: Backlog として検討（RankLabelManagerと同様）

### 7.2 高度な設定機能

* **カスタムCSS**: ユーザー独自のCSS設定
* **テンプレート機能**: プリセット設定の保存・読み込み
* **エクスポート/インポート**: 設定のバックアップ・復元

### 7.3 Pro版機能の統合

* **Masonry レイアウト**: Pro版で搭載予定のマソンリーレイアウト機能
* **高度な設定オプション**: Pro版限定の設定項目
* **実装時期**: Pro版リリース時に統合

### 7.4 パフォーマンス最適化

* **遅延読み込み**: 必要時のみコンポーネント読み込み
* **キャッシュ機能**: 設定値のキャッシュ
* **バンドルサイズ最適化**: 不要な依存関係の排除

---

## 8. まとめ

本実装プランでは、SettingsFormの不足機能について、具体的な実装方法を示しました。

### 8.1 主要な実装内容

* **表示形式選択**: グリッド・マソンリーレイアウトの選択
* **配置設定**: 左・中央・右の配置選択
* **FFmpeg パス設定**: 動画処理用のFFmpegパス設定
* **プレビュー機能**: 設定変更時の即座プレビュー表示
* **バリデーション**: リアルタイム・バリデーションとエラー表示

### 8.2 実装効果

これらの実装により、SettingsFormの完成度が5%から100%に向上し、ユーザーにとって使いやすく、開発者にとって保守しやすい高品質な設定フォームが実現されます。

なお、「ドラッグ&ドロップ並び替え」については、RankLabelManagerと同様に今後の実装課題として残しておきます。
