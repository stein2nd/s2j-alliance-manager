# S2J Alliance Manager

WordPressプラグイン「S2J Alliance Manager」は、アライアンス関係にある協力会社のリンク付きバナー（ロゴ・動画含む）を管理し、Front page 等でブロック表示するためのプラグインです。

## 特徴

- **Gutenberg ブロックエディタ対応**: モダンなブロックエディタで簡単にアライアンスバナーを配置
- **Classic エディタ対応**: MetaBox により従来のエディタでも利用可能
- **管理画面でのバナー管理**: 画像・動画・リンク先URL・グループ等を直感的に管理
- **Create Content Model 統合**: 管理UIは Create Content Model を採用
- **レスポンシブ対応**: 様々なデバイスで最適な表示
- **国際化対応**: 多言語環境での利用が可能

## 表示形式

- **Single Column Grid**: 単一カラムのグリッド表示
- **Multi Column Grid**: 複数カラムのレスポンシブグリッド表示
- **Masonry Layout**: 石畳（Pinterest風）レイアウト（Pro版予定）

## インストール

1. プラグインフォルダを WordPress の `/wp-content/plugins/` ディレクトリにアップロード
2. WordPress 管理画面の「プラグイン」メニューから有効化
3. 「設定」→「S2J Alliance Manager」から設定を開始

## 開発環境セットアップ

### 必要な環境

- Node.js 18以上 (React 18.2.0対応のため)
- npm または yarn
- WordPress 6.3以上 (Gutenberg 15.2.0対応のため)

### セットアップ手順

```bash
# 依存関係のインストール
npm install

# 開発用ビルド
npm run build:dev

# 本番用ビルド
npm run build:production

# 翻訳ファイルの生成
npm run makepot
```

## 使用方法

### 管理画面での設定

1. WordPress管理画面の「設定」→「S2J Alliance Manager」にアクセス
2. 表示形式を選択
3. アライアンス・パートナーを追加・編集
4. 各パートナーのロゴ、リンク先、ランク等を設定

### Gutenberg ブロックでの使用

1. 投稿・固定ページの編集画面で「+」ボタンをクリック
2. 「Alliance Banner」ブロックを検索・選択
3. ブロック設定で表示形式を選択
4. 公開・更新

### Classic エディタでの使用

1. 投稿・固定ページの編集画面で右サイドバーの「Alliance Banner」メタボックスを確認
2. 表示形式を選択
3. 「Insert Alliance Banner」ボタンをクリック
4. 公開・更新

## ファイル構成

```
`s2j-alliance-manager`/
├─ `s2j-alliance-manager.php`  # プラグイン本体
├─ `uninstall.php`  # アンインストール処理
├─ `package.json`  # ビルド設定
├─ `SPEC.md`  # プラグイン固有仕様
├─ `vite.config.ts`  # Vite 設定
├─ `tsconfig.json`  # TypeScript 設定
├─ `eslint.config.js`  # ESLint 設定
├─ `includes`/  # PHP クラス群
│├─ `SettingsPage.php`  # 設定画面
│├─ `RestController.php`  # REST API
│└─ `AllianceManager.php`  # メイン機能
├─ `src`/  # TypeScript/React ソース
│├─ `admin`/  # 管理画面用
││├─ `index.tsx`  # 管理画面メインエントリーポイント
││├─ `components`/  # React コンポーネント
│││├─ `ContentList.tsx`  # 一覧表 UI
│││├─ `SettingsForm.tsx`  # 設定フォーム
│││├─ `MessageModal.tsx`  # メッセージ編集モーダル
│││└─ `MediaUploader.tsx`  # メディアアップローダ
││└─ `data`/  # 定数定義
│├─ `gutenberg`/  # Gutenberg ブロック用
│├─ `classic`/  # Classic エディタ用
│├─ `styles`/  # SCSS スタイル
││├─ `admin.scss`  # 管理画面用スタイル
││├─ `gutenberg.scss`  # Gutenberg 用スタイル
││├─ `classic.scss`  # Classic 用スタイル
││└─ `variables.scss`  # SCSS 変数定義
│└─ `types`/  # TypeScript 型定義
├─ `dist`/  # ビルド成果物
└─ `languages`/  # 翻訳ファイル
```

## 技術スタック

- **React 18.2**: 管理画面 UI の構築
- **TypeScript 5.9**: 型安全性の確保
- **SCSS**: スタイル管理とデザインシステム
- **Vite 7.1**: 高速ビルドとモジュールバンドリング
- **WordPress パッケージ群**: Gutenberg、Components、API-Fetch 等

## 依存関係

### 主要パッケージ
- **React 18.2.0**: WordPress 6.3系との互換性確保
- **@wordpress/components 30.2.0**: WordPress 標準 UI コンポーネント
- **@wordpress/block-editor 15.2.0**: Gutenberg ブロックエディタ
- **Vite 7.1.4**: 高速ビルドとモジュールバンドリング

詳細な依存関係とバージョン選択理由については、[SPEC.md](./SPEC.md) を参照してください。

## REST API

### エンドポイント

- `GET /wp-json/s2j-alliance-manager/v1/settings` - 設定取得
- `GET /wp-json/s2j-alliance-manager/v1/content-models` - コンテンツモデル一覧取得
- `POST /wp-json/s2j-alliance-manager/v1/save-all` - 設定・モデル一括保存

### セキュリティ

- nonce チェック必須
- `manage_options` 権限が必要

## ライセンス

GPL v2 以降

## 開発者

stein2nd

## サポート

問題やご質問がございましたら、GitHub の Issues までお願いします。