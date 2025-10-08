# S2J Alliance Manager SPEC - MessageModal 完全実装プラン

## はじめに

* 本ドキュメントでは、`SPEC_mod.md`の「4. MessageModal 完全実装案」で指摘された不足機能について、具体的な実装プランを提案します。
* 特に「モーダル表示機能」「プレビュー機能」「アクセシビリティ」の3つの項目に焦点を当てます。
* 現状分析→現状の問題点→完全実装プラン→実装スケジュール→期待される効果→今後の検討事項の順で構成します。

---

## 1. 現状分析

### 1.1 現在の実装状況

* **実装完了率**: 約20% (基本的なUI構造のみ)
* **実装済み機能**:
  * 基本的なフォーム構造
  * メッセージ入力フィールド
  * 保存・キャンセルボタン
* **不足機能**:
  * モーダル表示機能（オーバーレイ背景、アニメーション）
  * プレビュー機能
  * アクセシビリティ機能

### 1.2 現状の問題点

* モーダルが画面中央に表示されているが、オーバーレイ背景がない
* アニメーション効果がない
* プレビュー機能がない
* アクセシビリティ対応が不十分

---

## 2. モーダル表示機能の完全実装プラン

### 2.1 実装方針

* **オーバーレイ背景**: 画面全体をグレーアウトし、モーダルに集中させる
* **アニメーション**: フェードイン・フェードアウト効果でスムーズな表示切り替え
* **中央配置**: 画面の上下左右中央に配置
* **レスポンシブ対応**: モバイル環境でも適切に表示

### 2.2 実装詳細

#### 2.2.1 コンポーネント構造の拡張

```typescript
interface MessageModalProps {
  message: string;
  onSave: (message: string) => void;
  onCancel: () => void;
  isOpen: boolean; // モーダル表示状態を制御
}

interface MessageModalState {
  formMessage: string;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isAnimating: boolean;
}
```

#### 2.2.2 モーダル表示機能の実装

```typescript
const MessageModal: React.FC<MessageModalProps> = ({
  message,
  onSave,
  onCancel,
  isOpen
}) => {
  const [formMessage, setFormMessage] = useState(message);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // モーダル表示時のアニメーション制御
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // フォーカスをテキストエリアに移動
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  // ESCキーで閉じる機能
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // フォーカストラップの実装
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // オーバーレイクリックで閉じる機能
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div className={`s2j-message-modal ${isOpen ? 's2j-modal-open' : ''}`}>
      {/* オーバーレイ背景 */}
      <div 
        className={`s2j-modal-overlay ${isAnimating ? 's2j-modal-overlay-visible' : ''}`}
        onClick={handleOverlayClick}
      />
      
      {/* モーダルコンテンツ */}
      <div 
        className={`s2j-modal-content ${isAnimating ? 's2j-modal-content-visible' : ''}`}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="s2j-modal-title"
        aria-describedby="s2j-modal-description"
      >
        <h3 id="s2j-modal-title">{__('Edit Message', 's2j-alliance-manager')}</h3>
        
        <div className="s2j-form-field">
          <TextareaControl
            ref={textareaRef}
            label={__('Message', 's2j-alliance-manager')}
            value={formMessage}
            onChange={handleMessageChange}
            help={__('This message will be displayed in a modal when the partner logo is clicked.', 's2j-alliance-manager')}
            rows={6}
            maxLength={500}
            __nextHasNoMarginBottom={true}
          />
          {errors.message && (
            <div className="s2j-field-error" role="alert">
              {errors.message}
            </div>
          )}
          <div className="s2j-character-count">
            {formMessage.length}/500 {__('characters', 's2j-alliance-manager')}
          </div>
        </div>

        <div className="s2j-modal-actions">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {__('Cancel', 's2j-alliance-manager')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting || !!errors.message}
          >
            {isSubmitting ? __('Saving...', 's2j-alliance-manager') : __('Save Message', 's2j-alliance-manager')}
          </Button>
        </div>
      </div>
    </div>
  );
};
```

#### 2.2.3 CSS実装（SCSS）

```scss
// MessageModal スタイル
.s2j-message-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  &.s2j-modal-open {
    opacity: 1;
    visibility: visible;
  }

  .s2j-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;

    &.s2j-modal-overlay-visible {
      opacity: 1;
    }
  }

  .s2j-modal-content {
    position: relative;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    transform: scale(0.9) translateY(-20px);
    transition: transform 0.3s ease;

    &.s2j-modal-content-visible {
      transform: scale(1) translateY(0);
    }

    h3 {
      margin: 0 0 20px 0;
      padding: 20px 20px 0 20px;
      font-size: 1.5em;
      font-weight: 600;
    }

    .s2j-form-field {
      padding: 0 20px;
      margin-bottom: 20px;

      .s2j-field-error {
        color: #d63638;
        font-size: 0.875em;
        margin-top: 5px;
      }

      .s2j-character-count {
        text-align: right;
        font-size: 0.875em;
        color: #666;
        margin-top: 5px;
      }
    }

    .s2j-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 0 20px 20px 20px;
      border-top: 1px solid #e0e0e0;
      margin-top: 20px;
      padding-top: 20px;
    }
  }

  // レスポンシブ対応
  @media (max-width: 768px) {
    .s2j-modal-content {
      width: 95%;
      margin: 20px;
      max-height: calc(100vh - 40px);
    }
  }
}
```

---

## 3. プレビュー機能の完全実装プラン

### 3.1 実装方針

* **リアルタイムプレビュー**: 入力内容の変更を即座にプレビューに反映
* **モーダル表示再現**: 実際のモーダル表示時の見た目を再現
* **プレビューエリア**: モーダル内に専用のプレビューエリアを配置

### 3.2 実装詳細

#### 3.2.1 プレビュー機能の実装

```typescript
// プレビュー機能の追加
const MessageModal: React.FC<MessageModalProps> = ({
  message,
  onSave,
  onCancel,
  isOpen
}) => {
  // ... 既存のコード ...

  return (
    <div className={`s2j-message-modal ${isOpen ? 's2j-modal-open' : ''}`}>
      {/* ... 既存のモーダル構造 ... */}
      
      <div className="s2j-modal-content" ref={modalRef}>
        <h3 id="s2j-modal-title">{__('Edit Message', 's2j-alliance-manager')}</h3>
        
        <div className="s2j-form-field">
          {/* ... 既存のフォームフィールド ... */}
        </div>

        {/* プレビュー機能 */}
        <div className="s2j-message-preview">
          <h4>{__('Preview', 's2j-alliance-manager')}</h4>
          <div className="s2j-preview-content">
            <div className="s2j-preview-modal">
              <div className="s2j-preview-header">
                <h5>{__('Partner Message', 's2j-alliance-manager')}</h5>
                <button 
                  type="button" 
                  className="s2j-preview-close"
                  aria-label={__('Close preview', 's2j-alliance-manager')}
                >
                  ×
                </button>
              </div>
              <div className="s2j-preview-body">
                {formMessage || (
                  <em className="s2j-preview-placeholder">
                    {__('Enter your message to see preview', 's2j-alliance-manager')}
                  </em>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="s2j-modal-actions">
          {/* ... 既存のアクションボタン ... */}
        </div>
      </div>
    </div>
  );
};
```

#### 3.2.2 プレビュー用CSS実装

```scss
// プレビュー機能のスタイル
.s2j-message-preview {
  padding: 0 20px;
  margin-bottom: 20px;

  h4 {
    margin: 0 0 15px 0;
    font-size: 1.1em;
    font-weight: 600;
    color: #333;
  }

  .s2j-preview-content {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #f9f9f9;
    padding: 15px;
  }

  .s2j-preview-modal {
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .s2j-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: #f0f0f0;
      border-bottom: 1px solid #e0e0e0;

      h5 {
        margin: 0;
        font-size: 1em;
        font-weight: 600;
        color: #333;
      }

      .s2j-preview-close {
        background: none;
        border: none;
        font-size: 1.5em;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;

        &:hover {
          background: #e0e0e0;
          color: #333;
        }
      }
    }

    .s2j-preview-body {
      padding: 20px;
      min-height: 100px;
      line-height: 1.6;
      color: #333;

      .s2j-preview-placeholder {
        color: #999;
        font-style: italic;
      }
    }
  }
}
```

---

## 4. アクセシビリティ機能の完全実装プラン

### 4.1 実装方針

* **ARIA属性**: 適切なラベル・ロール・状態の設定
* **フォーカス管理**: フォーカストラップ・初期フォーカス設定
* **キーボードナビゲーション**: 全機能のキーボード操作対応
* **スクリーンリーダー対応**: 音声読み上げ対応

### 4.2 実装詳細

#### 4.2.1 アクセシビリティ機能の実装

```typescript
const MessageModal: React.FC<MessageModalProps> = ({
  message,
  onSave,
  onCancel,
  isOpen
}) => {
  // ... 既存のコード ...

  // フォーカストラップの実装
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  // バリデーション機能の実装
  const validateMessage = (value: string): string[] => {
    const errors: string[] = [];
    
    if (!value.trim()) {
      errors.push(__('Message is required', 's2j-alliance-manager'));
    }
    
    if (value.length > 500) {
      errors.push(__('Message must be 500 characters or less', 's2j-alliance-manager'));
    }
    
    return errors;
  };

  // リアルタイムバリデーション
  const handleMessageChange = (value: string) => {
    setFormMessage(value);
    const validationErrors = validateMessage(value);
    setErrors({ message: validationErrors[0] || '' });
  };

  return (
    <div className={`s2j-message-modal ${isOpen ? 's2j-modal-open' : ''}`}>
      <div 
        className={`s2j-modal-overlay ${isAnimating ? 's2j-modal-overlay-visible' : ''}`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      <div 
        className={`s2j-modal-content ${isAnimating ? 's2j-modal-content-visible' : ''}`}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="s2j-modal-title"
        aria-describedby="s2j-modal-description"
        tabIndex={-1}
      >
        <h3 id="s2j-modal-title">{__('Edit Message', 's2j-alliance-manager')}</h3>
        
        <div id="s2j-modal-description" className="s2j-modal-description">
          {__('Edit the message that will be displayed when users click on the partner logo.', 's2j-alliance-manager')}
        </div>
        
        <div className="s2j-form-field">
          <TextareaControl
            ref={textareaRef}
            label={__('Message', 's2j-alliance-manager')}
            value={formMessage}
            onChange={handleMessageChange}
            help={__('This message will be displayed in a modal when the partner logo is clicked.', 's2j-alliance-manager')}
            rows={6}
            maxLength={500}
            __nextHasNoMarginBottom={true}
            aria-describedby="s2j-character-count s2j-field-error"
            aria-invalid={!!errors.message}
          />
          {errors.message && (
            <div 
              id="s2j-field-error" 
              className="s2j-field-error" 
              role="alert"
              aria-live="polite"
            >
              {errors.message}
            </div>
          )}
          <div id="s2j-character-count" className="s2j-character-count">
            {formMessage.length}/500 {__('characters', 's2j-alliance-manager')}
          </div>
        </div>

        {/* プレビュー機能 */}
        <div className="s2j-message-preview">
          <h4>{__('Preview', 's2j-alliance-manager')}</h4>
          <div className="s2j-preview-content">
            <div className="s2j-preview-modal" role="region" aria-label={__('Message preview', 's2j-alliance-manager')}>
              <div className="s2j-preview-header">
                <h5>{__('Partner Message', 's2j-alliance-manager')}</h5>
                <button 
                  type="button" 
                  className="s2j-preview-close"
                  aria-label={__('Close preview', 's2j-alliance-manager')}
                  tabIndex={-1}
                >
                  ×
                </button>
              </div>
              <div className="s2j-preview-body">
                {formMessage || (
                  <em className="s2j-preview-placeholder">
                    {__('Enter your message to see preview', 's2j-alliance-manager')}
                  </em>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="s2j-modal-actions">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
            aria-label={__('Cancel and close modal', 's2j-alliance-manager')}
          >
            {__('Cancel', 's2j-alliance-manager')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting || !!errors.message}
            aria-label={__('Save message and close modal', 's2j-alliance-manager')}
          >
            {isSubmitting ? __('Saving...', 's2j-alliance-manager') : __('Save Message', 's2j-alliance-manager')}
          </Button>
        </div>
      </div>
    </div>
  );
};
```

#### 4.2.2 アクセシビリティ用CSS実装

```scss
// アクセシビリティ対応のスタイル
.s2j-message-modal {
  // フォーカス表示の改善
  .s2j-modal-content {
    &:focus {
      outline: 2px solid #0073aa;
      outline-offset: 2px;
    }
  }

  // フォーカス可能要素のフォーカス表示
  button:focus,
  textarea:focus {
    outline: 2px solid #0073aa;
    outline-offset: 2px;
  }

  // スクリーンリーダー用の非表示テキスト
  .s2j-modal-description {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  // エラーメッセージの強調表示
  .s2j-field-error {
    font-weight: 600;
    
    &[role="alert"] {
      animation: shake 0.5s ease-in-out;
    }
  }

  // プレビューエリアのアクセシビリティ
  .s2j-preview-modal {
    &[role="region"] {
      border: 2px solid transparent;
      
      &:focus-within {
        border-color: #0073aa;
      }
    }
  }
}

// アニメーション効果
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

// 高コントラストモード対応
@media (prefers-contrast: high) {
  .s2j-message-modal {
    .s2j-modal-overlay {
      background-color: rgba(0, 0, 0, 0.8);
    }
    
    .s2j-modal-content {
      border: 2px solid #000;
    }
  }
}

// モーション減少設定対応
@media (prefers-reduced-motion: reduce) {
  .s2j-message-modal {
    .s2j-modal-overlay,
    .s2j-modal-content {
      transition: none;
    }
  }
}
```

---

## 5. 実装スケジュール

### 5.1 Phase 1: モーダル表示機能の実装 (1日)

* オーバーレイ背景の実装
* アニメーション効果の実装
* 中央配置・レスポンシブ対応の実装
* ESCキー・クリックアウトサイドで閉じる機能の実装

### 5.2 Phase 2: プレビュー機能の実装 (1日)

* リアルタイムプレビューの実装
* プレビューエリアのUI実装
* プレビュー用CSSの実装

### 5.3 Phase 3: アクセシビリティ機能の実装 (1日)

* ARIA属性の実装
* フォーカス管理の実装
* キーボードナビゲーションの実装
* スクリーンリーダー対応の実装

### 5.4 Phase 4: 統合テスト・最終調整 (0.5日)

* 全機能の統合テスト
* アクセシビリティテスト
* 最終調整・ドキュメント更新

---

## 6. 期待される効果

### 6.1 ユーザー体験の向上

* **直感的な操作**: オーバーレイ背景によりモーダルに集中
* **スムーズな表示**: アニメーション効果による自然な表示切り替え
* **リアルタイム確認**: プレビュー機能による即座の確認

### 6.2 アクセシビリティの向上

* **全ユーザー対応**: キーボード・スクリーンリーダー対応
* **WCAG準拠**: アクセシビリティガイドライン準拠
* **ユニバーサルデザイン**: すべてのユーザーが利用可能

### 6.3 開発効率の向上

* **保守性向上**: 明確な責任分離・型安全性
* **拡張性向上**: モジュール化された設計
* **デバッグ効率**: 適切なエラーハンドリング・ログ出力

---

## 7. まとめ

本実装プランでは、MessageModalの不足機能である「モーダル表示機能」「プレビュー機能」「アクセシビリティ」について、具体的な実装方法を示しました。

これらの実装により、MessageModalの完成度が20%から100%に向上し、ユーザーにとって使いやすく、アクセシブルな高品質なモーダルコンポーネントが実現されます。

特に、現状で「画面右端と左端は、Grey-out になってない」という問題は、オーバーレイ背景の実装により完全に解決されます。
