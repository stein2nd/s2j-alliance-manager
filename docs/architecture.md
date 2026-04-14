<!--
目的：「フォルダー構成、主要ファイル、技術スタック、ビルド、責務」の明文化
-->

# アーキテクチャー

## 2. プロジェクト構成

本章では、「フォルダー構成」を記載します。

### 2.1. フォルダー構成・ファイル構成

```
`s2j-alliance-manager`/
├── `README.md`
├── `README.txt`
├── `LICENSE`
├── `package.json`  # ビルド設定
├── node_modules/  # 依存 npm モジュール
├── `vite.config.ts`
├── `tsconfig.json`
├── `eslint.config.js`  # ESLint 設定
├┬─ docs/  # 開発ドキュメント
│└─ `SPEC.md`  # プラグイン固有仕様
├── `s2j-alliance-manager.php`  # プラグイン本体
├── `uninstall.php`  # プラグイン削除時の処理
├┬─ languages/  # 翻訳ファイル
│├─ `s2j-alliance-manager.pot`
│├─ `s2j-alliance-manager-[ロケール名].po`
│└─ `s2j-alliance-manager-[ロケール名].mo`  # WordPress 表示用バイナリ
├┬─ includes/  # PHP クラス群 (設定画面、REST API、ブロック)
│├─ `SettingsPage.php`  # WordPress 管理画面の HTML 構造・メニュー登録、設定サニタイゼーション (✅100%実装完了)
│├─ `RestController.php`  # REST API エンドポイント定義・データ処理、権限チェック (✅100%実装完了)
│└─ `AllianceManager.php`  # Gutenberg ブロック登録・レンダリング、ショートコード登録、Classic エディタ対応 (✅100%実装完了)
├┬─ src/  # TypeScript/React (Gutenberg ブロック、設定画面) /SCSS ソース
│├┬─ admin/  # 設定画面用
││├─ `index.tsx`  # 管理画面メイン・エントリーポイント
││├┬─ components/
│││├─ `SettingsForm.tsx`  # 設定保存フォーム (✅95% 実装完了)
│││├─ `ContentList.tsx`  # コンテンツモデル一覧表 UI (✅100% 実装完了)
│││├─ `RankLabelManager.tsx`  # ランクラベル管理 UI (✅100% 実装完了)
│││├─ `MediaUploader.tsx`  # WordPress メディア・アップローダー統合 (✅100% 実装完了)
│││├─ `MessageModal.tsx`  # メッセージ編集モーダル (✅85% 実装完了)
│││└─ `FFmpegLibraryManager.tsx`  # FFmpeg 設定・テスト機能 (✅100% 実装完了)
││├┬─ data/
│││└─ `constants.ts`  # 定数定義 (表示形式、ランク、動作オプション)
││└┬─ utils/  # ユーティリティ
││　├─ `errorHandler.ts`  # エラー・ハンドリング (✅100% 実装完了)
││　└─ `slugGenerator.ts`  # スラッグ生成 (✅100% 実装完了)
│├┬─ frontend/  # フロントエンド表示
││└─ `alliance-banner.tsx`  # コンポーネント (✅100% 実装完了)
│├┬─ gutenberg/  # Gutenberg ブロック用
││├─ `index.tsx` (✅100% 実装完了)
││└┬─ alliance-banner/  # ブロック編集
││　├─ `index.tsx`  # コンポーネント (✅100% 実装完了)
││　└─ `block.json`  # ブロック定義 (✅100% 実装完了)
│├┬─ modal/
││├┬─ components/  # コンポーネント
│││├─ `AllianceModal.tsx`  # アライアンス・モーダル (✅100% 実装完了)
│││└─ `ModalPortal.tsx`  # モーダル・ポータル (✅100% 実装完了)
││├┬─ hooks/  # フック
│││└─ `useModal.ts`  # モーダル状態管理 (✅100% 実装完了)
││└─ `index.ts`  # モーダル関連エクスポート (✅100% 実装完了)
│├┬─ classic/  # MetaBox 用
││└─ `index.ts` (✅100% 実装完了)
│├┬─ styles/  # プラグイン用のスタイル定義
││├─ `admin.scss`  # 設定画面用 (✅100% 実装完了)
││├─ `gutenberg.scss`  # Gutenberg ブロック用 (✅100% 実装完了)
││├─ `frontend.scss`  # フロントエンド表示用 (✅100% 実装完了)
││├─ `classic.scss`  # MetaBox 用 (✅100% 実装完了)
││├─ `modal.scss`  # モーダル用 (✅100% 実装完了)
││└─ `variables.scss`  # SCSS 変数定義 (✅100% 実装完了)
│└┬─ types/  # プラグイン用のグローバル型定義
│　├─ `index.ts`  # ContentModel (✅100% 実装完了)
│　├─ `wordpress.d.ts`  # WordPress (✅100% 実装完了)
│　├─ `dom.d.ts`  # DOM (✅100% 実装完了)
│　└─ `message-modal.d.ts`  # メッセージ・モーダル (✅100% 実装完了)
└┬─ dist/  # Vite ビルド成果物 (Git 管理外)、アイコン
　├┬─ blocks/
　│└┬─ alliance-banner/
　│　└─ `block.json`  # ブロック定義
　├┬─ css/  # プラグイン用のスタイル定義
　│├─ `s2j-alliance-manager-admin.css`
　│├─ `s2j-alliance-manager-gutenberg.css`
　│├─ `s2j-alliance-manager-frontend.css`
　│└─ `s2j-alliance-manager-classic.css`
　└┬─ js/  # プラグイン用の Gutenberg ブロック、設定画面
　　├─ `s2j-alliance-manager-admin.js`
　　├─ `s2j-alliance-manager-gutenberg.js`
　　├─ `s2j-alliance-manager-frontend.js`
　　└─ `s2j-alliance-manager-classic.js`
```

### 2.2. 主要ファイル

* `s2j-alliance-manager.php` : プラグイン起点、クラスロード・初期化、カスタム投稿タイプ登録 (✅100% 実装完了)
* `includes/SettingsPage.php` : 管理画面の HTML 構造・メニュー登録 (✅100% 実装完了)
* `includes/RestController.php` : REST API エンドポイント定義・データ処理 (✅100% 実装完了)
* `includes/AllianceManager.php` : Gutenberg ブロック登録・レンダリング (✅100% 実装完了)
* `src/admin/index.tsx` : 管理画面のメイン・エントリーポイント (React 初期化、データ管理、ランクラベル状態管理) (✅100% 実装完了、React v19対応完了)
* `src/admin/components/ContentList.tsx` : コンテンツモデル一覧表 UI (Create Content Model 不使用) (✅100% 実装完了)
* `src/admin/components/RankLabelManager.tsx` : ランクラベル管理 UI (✅100% 実装完了)
* `src/admin/components/SettingsForm.tsx` : 表示形式の設定フォーム (✅95% 実装完了)
* `src/admin/components/MessageModal.tsx` : メッセージ編集モーダル (✅85% 実装完了)
* `src/admin/components/MediaUploader.tsx` : WordPress メディア・アップローダー統合 (✅100% 実装完了)
* `src/admin/components/FFmpegLibraryManager.tsx` : FFmpeg 設定・テスト機能 (✅100% 実装完了)
* `src/admin/data/constants.ts` : 定数定義 (表示形式、ランク、動作オプション) (✅100% 実装完了)
* `src/admin/utils/errorHandler.ts` : エラーハンドリングユーティリティ (✅100% 実装完了)
* `src/admin/utils/slugGenerator.ts` : スラッグ生成ユーティリティ (✅100% 実装完了)
* `src/gutenberg/index.tsx` : Gutenberg ブロックの UI ロジック (✅100% 実装完了)
* `src/classic/index.ts` : Classic エディター対応スクリプト (✅100% 実装完了)
* `src/types/index.ts` : TypeScript 型定義 (ContentModel、RankLabel 等) (✅100% 実装完了)
* `src/types/wordpress.d.ts` : WordPress 型定義 (React v19対応、WordPress の React 互換性対応) (✅100% 実装完了)

### 2.3. フロント表示アセット (Alliance Banner)

* **`includes/AllianceManager.php`**: ブロックの `render_callback` と `[alliance_banner]` ショートコードは、どちらも同じ `render_alliance_banner_block()` に集約される。
* **`init` での登録**: `register_block_assets()` が `wp_register_style` / `wp_register_script` のみ行い、フロント全ページでの常時 enqueue は行わない。
* **レンダリング時の enqueue**: バナーを実際に出力する場合に限り `enqueue_alliance_banner_view_assets()` が `wp_enqueue_style` / `wp_enqueue_script` を呼ぶ。ブロックテーマで「ブロックが使われたページだけ読み込む」方針と整合し、Classic テーマで `echo do_shortcode( '[alliance_banner ...]' );` としたテンプレートでも同じ経路でアセットが載る。
* **`block.json`**: `style` と `viewScript` (WordPress v6.1以降で解釈。本プラグイン要件は v6.3以降) でフロント用アセットを宣言し、コアのブロック依存読み込みと合わせる。

---

## 3. 技術スタック・開発環境

本章では、「開発に必要な技術情報」を記載します。

* [WP_PLUGIN_SPEC.md (共通仕様)](https://github.com/stein2nd/wp-plugin-spec/blob/main/WP_PLUGIN_SPEC.md) に準拠します。

### 3.1. フロントエンド技術スタック

* **React v19.2**: 管理画面 UI の構築 (✅完全実装済み)
* **TypeScript v5.9**: 型安全性の確保 (✅完全実装済み)
* **SCSS**: スタイル管理とデザインシステム (✅完全実装済み)
* **ESLint + Stylelint**: コード品質の自動チェック (✅完全実装済み)
* **Vite v7.3**: 高速ビルドとモジュール・バンドリング (✅完全実装済み)
* **開発用 watch モード**: リアルタイムでの開発効率を向上 (✅完全実装済み)

### 3.2. ビルド要件

* Vite + TypeScript + SCSS
  * `vite.config.ts` を用いて IIFE 形式でバンドルします。
  * JavaScript は WordPress 同梱の jQuery を利用可能とし、外部 import 不要です (`jQuery(function($) { ... })`)。
  * CSS も IIFE 出力し、エディター用・フロント用を区別します。
  * **JSX 変換設定**: `tsconfig.json` の `jsx` オプションを `"react"` に設定し、JSX を `React.createElement` に変換します。これにより、実行時に WordPress が提供する React を使用できます。
* 出力は `./dist` とします。

**実装状況**: ✅**完全実装済み** - 本番環境で安定稼働中、React v19対応完了

### 3.3. 依存関係モジュールのバージョン選択理由

#### 3.3.1. React モジュール

* **React**: `^19.2.0`
* **React-DOM**: `^19.2.0`
* **理由**: WordPress 6.3以降で標準採用されているバージョンです。WordPress の Gutenberg エディターとの互換性を確保するため、最新版ではなく安定版を採用します。
* **WordPress 環境での互換性対応** (✅実装済み):
  * **JSX 変換設定**: `tsconfig.json` の `jsx` オプションを `"react"` に設定し、JSX を `React.createElement` に変換することで、実行時に WordPress が提供する React を使用できるようにしています。
  * **WordPress の React を使用**: `wp.element` から `React` オブジェクトを構築し、グローバル変数として設定することで、ビルド時に使用された React と実行時に使用される React のバージョン不一致を回避しています。
  * **@wordpress/element の render 関数を使用**: WordPress が提供する React v18を使用するため、`@wordpress/element` の `render` 関数を使用しています。これにより、WordPress 環境での互換性を保つことができます。
  * **注意事項**: 同様の問題が発生した場合は、ビルド時に使用された React と実行時に使用される React のバージョンが一致しているか確認してください。WordPress 環境では、`@wordpress/element` を使用することで互換性を保つことができます。

#### 3.3.2. Rollup モジュール

* **Rollup**: `^4.55.1`
* **用途**: Vite の内部バンドラーとして使用します。IIFE 形式での出力と WordPress 環境での動作最適化を実現します。
* **理由**: Vite v7系との互換性を確保するため、最新版ではなく安定版を採用します。WordPress 環境でのビルド安定性を重視します。

#### 3.3.3. WordPress パッケージ群

* **@WordPress/api-fetch**: `^7.29.0` - REST API 通信とデータフェッチ機能
* **@WordPress/block-editor**: `^15.2.0` - Gutenberg ブロック・エディターの UI コンポーネント
* **@WordPress/blocks**: `^15.2.0` - ブロック登録とレンダリング機能
* **@WordPress/components**: `^30.2.0` - WordPress 標準 UI コンポーネント (Button、SelectControl 等)
* **@WordPress/data**: `^10.29.0` - 状態管理とデータストア機能
* **@WordPress/element**: `^6.29.0` - React 要素とフック機能
* **@WordPress/i18n**: `^6.2.0` - 国際化機能 (`__()`、`_e()` 関数)
* **@WordPress/scripts**: `^31.0.0` - WordPress 開発用スクリプトとツール
* **@WordPress/url**: `^4.29.0` - URL 処理とバリデーション機能
* **理由**: WordPress 6.3系での安定動作を確保するため、各パッケージの互換性を重視します。最新版ではなく、WordPress 公式で推奨される安定版を採用します。

### 3.4. `package.json` の `scripts`

* `npm run build:dev` → 開発用ビルド (minify 無効) (✅実装済み)
* `npm run build:production` → 本番用ビルド (minify 有効) (✅実装済み)
* `npm run dev` → 開発用ビルド (watch モード) (✅実装済み)
* `npm run lint` → ESLint + Stylelint によるコード品質チェック (✅実装済み)
* `npm run makepot` → 翻訳テンプレート生成 (✅実装済み)

---

## 4. 国際化 (**実装状況**: ✅完全実装済み - 全コンポーネントで国際化対応、完了)

本章では、「多言語対応」を記載します。

* すべての表示文字列は `__()` または `_e()` 関数でラップします。
* すべての UI 要素を翻訳可能とします。
* 翻訳ファイルは `languages/` に配置します。
* 翻訳テンプレート `.pot` は `makepot` により生成します。
* Text Domain は plugin-slug に合わせます。

---

## 5. スタイル設計・コンポーネント設計

本章では、「デザインとコンポーネント」を記載します。

### 5.1. スタイル設計原則 (**実装状況**: ✅完全実装済み - 全原則にもとづく実装完了)

* **統一されたデザインシステム**: すべてのボタンと UI コンポーネントで、一貫したスタイルを目指します。
    * **スタイル管理**: インライン・スタイルを排除します。
    * **ボタンスタイル**: すべてのボタンラベルを span 要素でラップします。
* **レスポンシブ対応**: モバイル環境では、縦積みレイアウトとします。
* **アクセシビリティ**: 適切なコントラスト比とフォーカス状態を目指します。
* **モダン CSS**: モダンな CSS プロパティを使用して、コードの簡潔性を向上させます (例: モーダル・ダイアログに対して、`inset: 0` を利用して天地・左右での中央表示)。

### 5.2. コンポーネント設計

* **ContentList**: アライアンス・パートナー一覧の管理 UI (✅100% 実装完了)
* **RankLabelManager**: ランクラベル管理 UI (インライン編集、Up/Down ボタンによる並び替え) (✅100% 実装完了)
* **MediaUploader**: WordPress メディア・ライブラリとの統合 (✅100% 実装完了)
* **MessageModal**: モーダル表示機能 (✅85% 実装完了)
* **SettingsForm**: 表示設定フォーム (✅95% 実装完了)
* **FFmpegLibraryManager**: FFmpeg 設定とテスト機能 (✅100% 実装完了)

### 5.3. FFmpeg 統合機能 (**実装状況**: ✅完全実装済み)

* **動画サポート**: ロゴとして動画ファイルをアップロード可能
* **ポスター画像の自動生成**: FFmpeg を使用して動画からポスター画像を生成
* **手動ポスターアップロード**: FFmpeg が利用できない場合の代替手段

---

## 6. パフォーマンス最適化・デバッグ機能

本章では、「最適化とデバッグ」を記載します。

### 6.1. パフォーマンス最適化 (**実装状況**: ✅完全実装済み - すべての最適化機能が実装済み)

* **IIFE 形式**: WordPress 環境での最適な読み込みを目指します。
* **コード分割**: 管理画面、Gutenberg、Classic エディター用を分離します。
* **最小化**: 本番環境でのファイルサイズ最適化を目指します。
* **モダン CSS**: `inset: 0` などのモダンな CSS プロパティを使用してコードの簡潔性を向上させます。

### 6.2. デバッグ機能 (**実装状況**: ✅完全実装済み)

* **条件付き表示**: Alliance Manager 専用の管理画面でのみ表示
* **ヘルプタブ統合**: WordPress 標準のヘルプシステムを活用
* **視覚的デザイン**: カード形式、カラー・コーディング、絵文字使用
* **レスポンシブ対応**: 管理画面の幅に応じた表示調整
* **FFmpeg 利用可能性の表示**: デバッグ情報に FFmpeg の利用状況を表示
