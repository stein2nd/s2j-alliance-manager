# S2J Alliance Manager

## Description
WordPress プラグイン「S2J Alliance Manager」は、アライアンス関係にある協力会社のリンク付きバナー (ロゴ・動画含む) を管理し、Front page 等でブロック表示するためのプラグインです。

### 特徴

- **Gutenberg ブロックエディタ対応**: モダンなブロックエディタで簡単にアライアンスバナーを配置
- **Classic エディタ対応**: MetaBox により従来のエディタでも利用可能
- **管理画面でのバナー管理**: 画像・動画・リンク先 URL・グループ等を直感的に管理
- **ランクラベル管理**: カスタム投稿タイプによる、柔軟なランク分類システム
- **リアルタイム連携**: ランクラベル保存後、即座にパートナー管理画面の選択肢が更新
- **直感的な管理 UI**: React ベースの独自管理インターフェース
- **レスポンシブ対応**: 様々なデバイスで最適な表示
- **国際化対応**: 多言語環境での利用が可能

### 表示形式

- **Single Column Grid**: 単一カラムのグリッド表示
- **Multi Column Grid**: 複数カラムのレスポンシブ・グリッド表示
- **Masonry Layout**: 石畳 (Pinterest 風) レイアウト (Pro 版予定)

## 開発者

stein2nd

## ライセンス

GPL v2 以降

---

## 技術スタック

- **React 18.2**: 管理画面 UI の構築 (WordPress 6.3系との互換性確保)
- **TypeScript 5.9**: 型安全性の確保
- **SCSS**: スタイル管理とデザインシステム
- **Vite 7.1**: 高速ビルドとモジュールバンドリング
- **WordPress パッケージ群**: Gutenberg、Components、API-Fetch 等
- **カスタム投稿タイプ**: ランクラベル管理のための、柔軟なデータ構造
- **独自管理 UI**: React ベースの直感的な管理インターフェース

## 開発環境セットアップ

### 必要な環境

- Node.js 18以上 (React 18.2.0対応のため)
- npm または yarn
- WordPress 6.3以上 (Gutenberg 15.2.0対応のため)

### 依存関係 (主要パッケージ)
- **@wordpress/components 30.2.0**: WordPress 標準 UI コンポーネント
- **@wordpress/block-editor 15.2.0**: Gutenberg ブロックエディタ

詳細な依存関係とバージョン選択理由については、[SPEC.md](./SPEC.md) を参照してください。

### セットアップ手順

```bash
# 依存関係のインストール
npm install --legacy-peer-deps

# 開発用ビルド
npm run build:dev

# 本番用ビルド
npm run build:production

# 翻訳ファイルの生成
npm run makepot
```

## インストール

1. プラグインフォルダを WordPress の `/wp-content/plugins/` ディレクトリにアップロード
2. WordPress 管理画面の「プラグイン」メニューから有効化
3. 「設定」→「S2J Alliance Manager」から設定を開始

---

## 使用方法

### 管理画面での設定

1. WordPress 管理画面の「設定」→「S2J Alliance Manager」にアクセス
2. **ランクラベル管理** でランク分類を設定 (例：ゴールド、シルバー、ブロンズ等)
3. 表示形式を選択
4. アライアンス・パートナーを追加・編集
5. 各パートナーのロゴ、リンク先、ランク等を設定
  - ランク選択肢は「ランクラベル管理」で設定したラベルから動的生成されます

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

### 管理画面の詳細機能

#### パートナー管理
- **行番号表示**: 各パートナーに `#1`, `#2`, `#3` の形式で行番号を表示
- **保留状態の視覚化**: 変更がある場合、全行の背景がクリーム色に変化
- **一括保存**: 変更内容を一括で保存可能
- **並び順変更**: Up/Down ボタンでパートナーの並び順を変更

#### ランクラベル管理
- **インライン編集**: ラベル名、説明、サムネイルを直接編集
- **並び順管理**: Up/Down ボタンでランクの表示順序を変更
- **視覚的フィードバック**: 変更行のハイライト表示

---

## ランクラベル管理

### 概要
アライアンス・パートナーのランク分類を柔軟に管理できる機能です。カスタム投稿タイプ `s2j_am_rank_label` を使用して、ユーザー独自のランク分類を作成・管理できます。

### 主な機能
- **インライン編集**: 各フィールドを直接編集可能
- **並び順管理**: Up/Down ボタンによる並び順の変更
- **視覚的フィードバック**: 変更行のハイライト表示と行番号表示
- **一括操作**: 保存・キャンセル機能
- **メディア・アップローダー**: WordPress メディアライブラリとの統合
- **リアルタイム連携**: 保存後、即座にパートナー管理画面の選択肢が更新

### フィールド構成
- **title**: ラベル名 (例：ゴールド、シルバー)
- **content**: 説明文
- **thumbnail_id**: サムネイル画像 ID
- **menu_order**: 並び順

### 使用方法
1. 管理画面の「Rank Management」セクションでランクラベルを追加
2. 各フィールドを編集
3. 「Save Rank Labels」ボタンで保存
4. パートナー管理画面の「Rank」選択肢に自動反映

### セキュリティ

- nonce チェック必須
- 基本設定の管理には、`manage_options` 権限が必要
- ランクラベル管理には `edit_s2j_am_rank_labels` 権限が必要 (管理者に自動付与)

---

## データフローと状態管理

### アーキテクチャ
- **親コンポーネント管理**: AllianceManagerAdmin クラスでランクラベルデータを一元管理
- **リアルタイム同期**: ランクラベル保存後、ContentList の rank 選択肢が即座に更新
- **状態の分離**: ランクラベル管理とメインコンテンツ管理は、独立した状態管理
- **視覚的フィードバック**: 保留中の変更は、背景色のハイライトで視覚化

### データの流れ
```
AllianceManagerAdmin (親コンポーネント)
├─ RankLabelManager → ランクラベル管理・保存時に親に通知
└─ ContentList → 親からランクラベルを受け取り、選択肢を生成
```

---

## REST API

### エンドポイント

- `GET /wp-json/s2j-alliance-manager/v1/settings` - 設定取得
- `GET /wp-json/s2j-alliance-manager/v1/content-models` - コンテンツモデル一覧取得
- `POST /wp-json/s2j-alliance-manager/v1/save-all` - 設定・モデル一括保存
- `GET /wp-json/s2j-alliance-manager/v1/rank-labels` - ランクラベル一覧取得
- `POST /wp-json/s2j-alliance-manager/v1/rank-labels` - ランクラベル一括保存

## フォルダ構成・ファイル構成

```
`s2j-alliance-manager`/
├── `readme.md`
├── `LICENSE`
├── `SPEC.md` # プラグイン固有仕様
├── `vite.config.ts` # Vite 設定
├── `tsconfig.json` # TypeScript 設定
├── `eslint.config.js` # ESLint 設定
├── `s2j-alliance-manager.php` # プラグイン本体
├── `uninstall.php` # アンインストール処理
├── `package.json` # ビルド設定
├── node_modules/
├┬─ languages/ # 翻訳ファイル (.pot、.po、.mo)
│└─ `s2j-alliance-manager.pot`
├┬─ includes/ # PHP クラス群 (REST、Settings、Admin UI)
│├─ `SettingsPage.php` # 設定画面
│├─ `RestController.php` # REST API
│└─ `AllianceManager.php` # Gutenberg ブロック
├┬─ src/ # TypeScript/React (Gutenberg ブロック、設定画面) /SCSS ソース
│├┬─ admin/ # 設定画面用
││├─ `index.tsx` # 管理画面メイン・エントリーポイント
││├┬─ components/ # React コンポーネント
│││├─ `SettingsForm.tsx` # 設定保存フォーム
│││├─ `ContentList.tsx` # 一覧表 UI (独自実装)
│││├─ `RankLabelManager.tsx`  # ランクラベル管理 UI
│││├─ `MediaUploader.tsx` # WordPress メディアアップローダー統合
│││└─ `MessageModal.tsx` # メッセージ編集モーダル
││└┬─ data/
││　└─ `constants.ts` # 定数定義 (表示形式、ランク、動作オプション)
│├┬─ gutenberg/ # Gutenberg ブロック用
││├─ `index.tsx`
││└┬─ alliance-banner
││　└─ `block.json` # ブロック定義
│├┬─ classic/ # MetaBox 用
││└─ `index.ts`
│├┬─ styles/ # プラグイン用のスタイル定義
││├─ `admin.scss` (設定画面用)
││├─ `gutenberg.scss` (Gutenberg ブロック用)
││├─ `classic.scss` (MetaBox 用)
││└─ `variables.scss` (SCSS 変数定義)
│└┬─ types/ # プラグイン用のグローバル・タイプ・定義
│　├─ `index.ts` (ContentModel 型定義)
│　└─ `wordpress.d.ts` (WordPress 型定義)
└┬─ dist/ # Vite ビルド成果物 (Git 管理外)、アイコン
　├┬─ blocks
　│└┬─ alliance-banner
　│　└─ `block.json` # ブロック定義
　├┬─ css/ # プラグイン用のスタイル定義
　│├─ s2j-alliance-manager-admin.css
　│├─ s2j-alliance-manager-gutenberg.css
　│└─ s2j-alliance-manager-classic.css
　└┬─ js/ # プラグイン用の Gutenberg ブロック、設定画面
　　├─ s2j-alliance-manager-admin.js
　　├─ s2j-alliance-manager-gutenberg.js
　　└─ s2j-alliance-manager-classic.js
```

## FAQ

問題やご質問がございましたら、GitHub の Issues までお願いします。

## スクリーンショット

## Changelog

## サポート

問題やご質問がございましたら、GitHub の Issues までお願いします。