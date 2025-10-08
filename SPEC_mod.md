# S2J Alliance Manager SPEC - 完全実装案

## はじめに

* 本ドキュメントでは、`SPEC.md`で「部分実装」となっている機能の完全実装案を提案します。
* グッド・プラクティスに基づき、保守性・拡張性・ユーザビリティを重視した実装方針を示します。

---

## 1. 完全実装対象機能

### 1.1 優先実装予定機能 (完全実装案)

* **SettingsForm**: 表示設定フォームの完全実装
* **RankLabelManager**: ランクラベル管理 UI の完全実装  
* **MessageModal**: メッセージ編集モーダルの完全実装

---

## 2. SettingsForm 完全実装案

### 2.1 実装方針

* **WordPress Components 活用**: `@wordpress/components` の `SelectControl`, `RadioControl` を活用
* **バリデーション機能**: リアルタイム・バリデーションとエラー表示
* **アクセシビリティ対応**: 適切なラベル・ヘルプテキスト・キーボードナビゲーション
* **レスポンシブ・デザイン**: モバイル環境での使いやすさを重視

### 2.2 実装詳細

#### 2.2.1 コンポーネント構造

```typescript
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
}
```

#### 2.2.2 主要機能

* **表示形式選択**: `SelectControl` で `display_style` を選択
* **配置設定**: `RadioControl` で `alignment` を選択
* **FFmpeg パス設定**: `TextControl` で FFmpeg 実行ファイルパスを設定
* **リアルタイム・バリデーション**: 入力値の妥当性を即座にチェック
* **保存状態管理**: 変更検知・保存中状態の視覚化

#### 2.2.3 バリデーション規則

* **display_style**: 必須、有効な値のみ許可
* **alignment**: 必須、有効な値のみ許可
* **ffmpeg_path**: オプション、存在するファイルパスのみ許可
* **content_models**: 配列形式、各要素の妥当性チェック

#### 2.2.4 UI/UX 設計

* **カード形式レイアウト**: 各設定項目をカードで区切り
* **ヘルプテキスト**: 各設定項目に説明文を表示
* **プレビュー機能**: 設定変更時の即座プレビュー表示
* **保存ボタン**: 変更時のみ有効化、保存中はローディング表示

---

## 3. RankLabelManager 完全実装案

### 3.1 実装方針

* **インライン編集**: 項目数が少ないため、直接編集可能な UI
* **ドラッグ&ドロップ**: 将来的な拡張を考慮した設計
* **バリデーション**: タイトル重複チェック・必須項目チェック
* **状態管理**: 変更前後の状態を明確に区別

### 3.2 実装詳細

#### 3.2.1 現在の実装状況

* **実装完了率**: 約90% (UI 実装は完了、細かい調整が必要)
* **主要機能**: 追加・編集・削除・並び替え・保存・キャンセル
* **状態管理**: 保留中変更の視覚化・元データとの比較

#### 3.2.2 完全実装で追加する機能

* **バリデーション強化**: 
  * タイトル重複チェック
  * 必須項目チェック
  * スラッグ自動生成の改善
* **UX 改善**:
  * ドラッグ&ドロップ並び替え
  * キーボードショートカット
  * 一括操作機能
* **エラーハンドリング**:
  * ネットワークエラー対応
  * 部分保存失敗時の処理
  * ユーザーフレンドリーなエラーメッセージ

#### 3.2.3 実装改善点

```typescript
// バリデーション機能の追加
const validateRankLabel = (label: RankLabel, allLabels: RankLabel[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!label.title.trim()) {
    errors.push({ field: 'title', message: __('Title is required', 's2j-alliance-manager') });
  }
  
  if (allLabels.some(l => l.id !== label.id && l.title === label.title)) {
    errors.push({ field: 'title', message: __('Title must be unique', 's2j-alliance-manager') });
  }
  
  return errors;
};

// ドラッグ&ドロップ機能の追加
const handleDragStart = (e: React.DragEvent, index: number) => {
  e.dataTransfer.setData('text/plain', index.toString());
};

const handleDrop = (e: React.DragEvent, targetIndex: number) => {
  e.preventDefault();
  const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
  moveLabel(sourceIndex, targetIndex);
};
```

---

## 4. MessageModal 完全実装案

### 4.1 実装方針

* **モーダル表示**: オーバーレイ・ESC キー・クリックアウトサイドで閉じる
* **リアルタイムプレビュー**: 入力内容の即座プレビュー表示
* **バリデーション**: 文字数制限・必須項目チェック
* **アクセシビリティ**: フォーカス管理・スクリーンリーダー対応

### 4.2 実装詳細

#### 4.2.1 現在の実装状況

* **実装完了率**: 約20% (基本的な UI 構造のみ)
* **不足機能**: モーダル表示・バリデーション・プレビュー・アクセシビリティ

#### 4.2.2 完全実装で追加する機能

* **モーダル表示機能**:
  * オーバーレイ背景
  * 中央配置・アニメーション
  * ESC キー・クリックアウトサイドで閉じる
* **バリデーション機能**:
  * 文字数制限 (最大500文字)
  * 必須項目チェック
  * リアルタイムエラー表示
* **プレビュー機能**:
  * 入力内容の即座プレビュー
  * モーダル表示時の見た目を再現
* **アクセシビリティ**:
  * フォーカス・トラップ
  * スクリーンリーダー対応
  * キーボード・ナビゲーション

#### 4.2.3 実装コード例

```typescript
// モーダル表示機能
const MessageModal: React.FC<MessageModalProps> = ({ message, onSave, onCancel, isOpen }) => {
  const [formMessage, setFormMessage] = useState(message);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // フォーカス管理
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // バリデーション
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
      <div className="s2j-modal-overlay" onClick={handleCancel} />
      <div className="s2j-modal-content" ref={modalRef}>
        <h3>{__('Edit Message', 's2j-alliance-manager')}</h3>
        
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
            <div className="s2j-field-error">{errors.message}</div>
          )}
          <div className="s2j-character-count">
            {formMessage.length}/500 {__('characters', 's2j-alliance-manager')}
          </div>
        </div>

        {/* プレビュー機能 */}
        <div className="s2j-message-preview">
          <h4>{__('Preview', 's2j-alliance-manager')}</h4>
          <div className="s2j-preview-content">
            {formMessage || __('Enter your message to see preview', 's2j-alliance-manager')}
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

---

## 5. 共通実装方針

### 5.1 コード品質

* **TypeScript 厳密型チェック**: `strict: true` 設定での型安全性確保
* **ESLint ルール準拠**: WordPress コーディング規約に準拠
* **コンポーネント分割**: 単一責任の原則に基づく設計
* **カスタムフック活用**: ロジックの再利用性向上

### 5.2 パフォーマンス最適化

* **React.memo**: 不要な再レンダリング防止
* **useCallback/useMemo**: 関数・オブジェクトのメモ化
* **遅延読み込み**: 必要時のみコンポーネント読み込み
* **バンドルサイズ最適化**: 不要な依存関係の排除

### 5.3 アクセシビリティ

* **ARIA 属性**: 適切なラベル・ロール・状態の設定
* **キーボードナビゲーション**: 全機能のキーボード操作対応
* **スクリーンリーダー**: 音声読み上げ対応
* **コントラスト比**: WCAG 2.1 AA 準拠

### 5.4 国際化対応

* **翻訳関数**: すべての文字列を `__()` でラップ
* **複数形対応**: `_n()` 関数の適切な使用
* **RTL 対応**: 右から左の言語での表示対応
* **日付・数値フォーマット**: 地域別表示形式対応

---

## 6. 実装スケジュール

### 6.1 Phase 1: SettingsForm 完全実装 (1-2日)

* 表示形式選択機能の実装
* 配置設定機能の実装
* FFmpeg パス設定機能の実装
* バリデーション機能の実装
* 保存機能の実装

### 6.2 Phase 2: MessageModal 完全実装 (1-2日)

* モーダル表示機能の実装
* バリデーション機能の実装
* プレビュー機能の実装
* アクセシビリティ機能の実装

### 6.3 Phase 3: RankLabelManager 改善 (1日)

* バリデーション機能の強化
* UX 改善機能の実装
* エラーハンドリングの改善

### 6.4 Phase 4: 統合テスト・最終調整 (1日)

* 全機能の統合テスト
* パフォーマンステスト
* アクセシビリティテスト
* 最終調整・ドキュメント更新

---

## 7. 期待される効果

### 7.1 開発効率の向上

* **保守性向上**: 明確な責任分離・型安全性
* **拡張性向上**: モジュール化された設計
* **デバッグ効率**: 適切なエラーハンドリング・ログ出力

### 7.2 ユーザー体験の向上

* **直感的なUI**: 一貫したデザイン・操作感
* **アクセシビリティ**: すべてのユーザーが利用可能
* **パフォーマンス**: 高速な応答・スムーズな操作

### 7.3 品質の向上

* **バグ削減**: 型安全性・バリデーション機能
* **セキュリティ**: 適切なサニタイゼーション・権限チェック
* **国際化**: 多言語対応・地域別表示

---

## 8. まとめ

本実装案では、`SPEC.md`で「部分実装」となっている3つの機能を完全実装するための具体的な方針を示しました。

* **SettingsForm**: 表示設定フォームの完全実装
* **RankLabelManager**: ランクラベル管理 UI の完全実装
* **MessageModal**: メッセージ編集モーダルの完全実装

これらの実装により、プラグインの完成度が85%から100%に向上し、ユーザーにとって使いやすく、開発者にとって保守しやすい高品質なプラグインが実現されます。
