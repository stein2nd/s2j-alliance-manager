# S2J Alliance Manager SPEC

## はじめに

* 本ドキュメントでは、WordPress プラグイン「s2j-alliance-manager」の専用仕様を定義します。
* 本プラグインの設計は、以下の共通 SPEC に準拠します。

- [WP_PLUGIN_SPEC.md (共通仕様)](https://github.com/stein2nd/wp-plugin-spec/blob/main/WP_PLUGIN_SPEC.md)

* 以下は、本プラグイン固有の仕様をまとめたものです。

---

## 1. プラグイン概要

* 名称: S2J Alliance Manager
* プラグイン・スラッグ: s2j-alliance-manager
* テキスト・ドメイン: s2j-alliance-manager
* ライセンス: GPL v2 以降
* 目的: アライアンス関係にある協力会社のリンク付きバナー (ロゴ・動画含む) を管理し、Front page 等でブロック表示します。
* 特徴:
  * Gutenberg ブロックエディターに対応します。
  * MetaBox により、Classic エディターに対応します。
    * Gutenberg ブロックでの処理内容を基本的に再現します。
  * 管理画面でバナー画像 (または動画)・リンク先 URL・グループ等を保存します。
    * 管理 UI は独自の React コンポーネントで実装します (設計において、[Create Content Model](https://github.com/Automattic/create-content-model) の機能を参考とします。
    * basic 版 / pro 版を視野に入れた設計とします。

## 2. プロジェクト構成

### 2.1 フォルダ構成・ファイル構成

```
`s2j-alliance-manager`/
├── `readme.md`
├── `LICENSE`
├── `SPEC.md` # プラグイン固有仕様
├── `vite.config.ts`
├── `tsconfig.json`
├── `eslint.config.js` # ESLint設定
├── `s2j-alliance-manager.php` # プラグイン本体
├── `uninstall.php` # プラグイン削除時の処理
├── `package.json` # ビルド設定
├── node_modules/
├┬─ languages/ # 翻訳ファイル (.pot、.po、.mo)
│└─ `s2j-alliance-manager.pot`
├┬─ includes/ # PHP クラス群 (設定画面、REST API、ブロック)
│├─ `SettingsPage.php` (設定画面)
│├─ `RestController.php` (REST API)
│└─ `AllianceManager.php` (Gutenberg ブロック)
├┬─ src/ # TypeScript/React (Gutenberg ブロック、設定画面) /SCSS ソース
│├┬─ admin/ # 設定画面用
││├─ `index.tsx` # 管理画面メイン・エントリーポイント
││├┬─ components/
│││├─ `SettingsForm.tsx` # 設定保存フォーム
│││├─ `ContentList.tsx` # 一覧表 UI (独自実装)
│││├─ `RankLabelManager.tsx` # ランクラベル管理 UI
│││├─ `MediaUploader.tsx` # WordPress メディアアップローダー統合
│││├─ `MessageModal.tsx` # メッセージ編集モーダル
│││└─ `FFmpegLibraryManager.tsx` # FFmpeg 設定・テスト機能
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
│└┬─ types/ # プラグイン用のグローバル型定義
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

### 2.2 主要ファイル

* `s2j-alliance-manager.php` : プラグイン起点、クラスロード・初期化、カスタム投稿タイプ登録
* `includes/SettingsPage.php` : 管理画面の HTML 構造・メニュー登録
* `includes/RestController.php` : REST API エンドポイント定義・データ処理
* `includes/AllianceManager.php` : Gutenberg ブロック登録・レンダリング
* `src/admin/index.tsx` : 管理画面のメイン・エントリーポイント (React 初期化・データ管理・ランクラベル状態管理)
* `src/admin/components/ContentList.tsx` : 一覧表 UI (Create Content Model 不使用)
* `src/admin/components/RankLabelManager.tsx` : ランクラベル管理 UI
* `src/admin/components/SettingsForm.tsx` : 表示形式設定フォーム
* `src/admin/components/MessageModal.tsx` : メッセージ編集モーダル
* `src/admin/components/MediaUploader.tsx` : WordPress メディア・アップローダ統合
* `src/admin/components/FFmpegLibraryManager.tsx` : FFmpeg 設定・テスト機能
* `src/admin/data/constants.ts` : 定数定義 (表示形式、ランク、動作オプション)
* `src/gutenberg/index.tsx` : Gutenberg ブロックの UI ロジック
* `src/classic/index.ts` : Classic エディタ対応スクリプト
* `src/types/index.ts` : TypeScript 型定義 (ContentModel、RankLabel 等)

---

## 3. ビルド要件

* Vite + TypeScript + SCSS
  * `vite.config.ts` を用いて IIFE 形式でバンドルします。
  * JavaScript は WordPress 同梱の jQuery を利用可能とします (外部 import 不要) (`jQuery(function($) { ... })`)。
  * CSS も IIFE 出力し、エディタ用・フロント用を区別します。
* 出力は `./dist` とします。

### 3.1 依存関係モジュールのバージョン選択理由

#### 3.1.1 React モジュール
* **React**: `^18.2.0`
* **React-DOM**: `^18.2.0`
* **理由**: WordPress 6.3以降で標準採用されているバージョンです。WordPress の Gutenberg エディタとの互換性を確保するため、最新版ではなく安定版を採用します。

#### 3.1.2 Rollup モジュール
* **Rollup**: `^4.50.2`
* **用途**: Vite の内部バンドラーとして使用します。IIFE 形式での出力と WordPress 環境での動作最適化を実現します。
* **理由**: Vite 7.x系との互換性を確保するため、最新版ではなく安定版を採用します。WordPress 環境でのビルド安定性を重視します。

#### 3.1.3 WordPress パッケージ群
* **@wordpress/api-fetch**: `^7.29.0` - REST API 通信とデータフェッチ機能
* **@wordpress/block-editor**: `^15.2.0` - Gutenberg ブロックエディタの UI コンポーネント
* **@wordpress/blocks**: `^15.2.0` - ブロック登録とレンダリング機能
* **@wordpress/components**: `^30.2.0` - WordPress 標準 UI コンポーネント（Button、SelectControl 等）
* **@wordpress/data**: `^10.29.0` - 状態管理とデータストア機能
* **@wordpress/element**: `^6.29.0` - React 要素とフック機能
* **@wordpress/i18n**: `^6.2.0` - 国際化機能（`__()`、`_e()` 関数）
* **@wordpress/scripts**: `^30.22.0` - WordPress 開発用スクリプトとツール
* **@wordpress/url**: `^4.29.0` - URL 処理とバリデーション機能
* **理由**: WordPress 6.3系での安定動作を確保するため、各パッケージの互換性を重視します。最新版ではなく、WordPress 公式で推奨される安定版を採用します。

### 3.2 `package.json` の `scripts`

* `npm run build:dev` → 開発用ビルド（minify 無効）
* `npm run build:production` → 本番用ビルド（minify 有効）

## 4. 技術的実装詳細

### 4.1 フロントエンド技術スタック

* **React 18.2**: 管理画面 UI の構築
* **TypeScript 5.9**: 型安全性の確保
* **SCSS**: スタイル管理とデザインシステム
* **Vite 7.1**: 高速ビルドとモジュールバンドリング

### 4.2 スタイル設計原則

* **統一されたデザインシステム**: すべてのボタンと UI コンポーネントで、一貫したスタイルを目指します。
* **レスポンシブ対応**: モバイル環境では縦積みレイアウトとします。
* **アクセシビリティ**: 適切なコントラスト比とフォーカス状態を目指します。
* **国際化対応**: すべての UI 要素を翻訳可能とします。

### 4.3 コンポーネント設計

* **ContentList**: アライアンス・パートナー一覧の管理 UI
* **RankLabelManager**: ランクラベル管理 UI (インライン編集、Up/Down ボタンによる並び替え)
* **MediaUploader**: WordPress メディア・ライブラリとの統合
* **MessageModal**: モーダル表示機能
* **SettingsForm**: 表示設定フォーム

### 4.4 FFmpeg 統合機能

* **FFmpegLibraryManager**: FFmpeg 設定とテスト機能を提供
* **動画サポート**: ロゴとして動画ファイルをアップロード可能
* **ポスター画像自動生成**: FFmpeg を使用して動画からポスター画像を生成
* **手動ポスターアップロード**: FFmpeg が利用できない場合の代替手段

#### 4.4.1 ポスターノティス機能

* **動画ファイル検出**: メディアアップローダーで動画ファイルが選択された場合の自動検出
* **ポスター画像存在確認**: 動画に対応するポスター画像の存在を REST API で確認
* **注意表示の制御**: ポスター画像が存在しない場合の注意表示の表示/非表示制御
  * 管理画面での表示条件に `model.poster === 0` を追加
  * ポスター画像が既に選択されている場合は警告表示を抑制
  * ユーザーエクスペリエンスの向上を実現
* **リアルタイム更新**: 動画ファイルの変更や Behavior 設定の変更に応じた注意表示の動的更新

### 4.5 パフォーマンス最適化

* **IIFE 形式**: WordPress 環境での最適な読み込みを目指します。
* **コード分割**: 管理画面、Gutenberg、Classic エディタ用を分離します。
* **最小化**: 本番環境でのファイルサイズ最適化を目指します。

### 4.6 デバッグ機能

* **条件付き表示**: Alliance Manager 専用管理画面でのみ表示
* **ヘルプタブ統合**: WordPress 標準のヘルプシステムを活用
* **視覚的デザイン**: カード形式、カラーコーディング、絵文字使用
* **レスポンシブ対応**: 管理画面の幅に応じた表示調整
* **FFmpeg 利用可能性表示**: デバッグ情報に FFmpeg の利用状況を表示

## 5. 国際化

* テキストはすべて `__()` または `_e()` を使用します。
* 翻訳ファイルは `languages/` に配置します。
* 翻訳テンプレート `.pot` は `makepot` により生成します。
* Text Domain は plugin-slug に合わせます。

---

## 6. 固有仕様

### 6.1 管理画面

* 下記 HTML 要素を内包する、専用管理画面を用意します。
  * 表示形式コンボボックス
  * 一覧表
* 保存は `update_option` / `get_option` を利用します。
* `sanitize_title` で slug 整形します。
* `esc_url_raw` で URL サニタイズします。
* `sanitize_textarea_field` でメッセージ整形します。
* メディアは `attachment_url_to_postid` で確認し、存在しない場合は無効化します。

#### 6.1.1 表示形式コンボボックス `display_style`

* 選択肢は下記のとおりとします:
  * `grid-single` … 単一カラムのグリッド
  * `grid-multi` … 複数カラムのグリッド
  * `masonry` … masonry (石畳) 表示 (pro 版限定予定)

#### 6.1.2 一覧表

* 独自の React コンポーネントで実装します。
  * 行番号表示、保留状態の視覚化、一括保存機能を含む管理 UI を提供します。
  * **行番号表示**: 各レコードに `#1`, `#2`, `#3` の形式で行番号を表示。
    * 保留状態では元の順序番号を表示し、変更の視覚化を行います。
  * **レイアウト**: メインコンテンツ (ContentList) を左側、サイドバー (Display Settings) を右側に配置。
    * レスポンシブデザインに対応し、モバイル環境では縦積みレイアウトとします。
  * **ボタンスタイル**: すべてのボタンラベルを span 要素でラップし、SCSS で統一管理。
  * **フィールド構成**:
    * `frontpage` (チェックボックス) … 掲出有無。
    * `rank` (コンボボックス) … ゴールド、シルバー等。
      * ランクラベルの登録/修正は、「ランクラベル管理」参照。
      * 選択肢は「ランクラベル管理」で登録されたラベルの `title` から動的生成。
    * `logo` (メディアボタン) … ロゴ画像・動画の追加/変更、ポスター画像生成。
      * サムネイル表示。
    * `jump_url` (テキストボックス) … 遷移先 URL。
    * `behavior` (コンボボックス)
      * 選択肢: `jump` … 指定 URL にジャンプ。
      * 選択肢: `modal` … モーダルで指定メッセージを表示。
    * `Up` (ボタン) … エントリーを上に移動 (Unicode 文字 ▲ 使用)。
    * `Down` (ボタン) … エントリーを下に移動 (Unicode 文字 ▼ 使用)。
    * `message` (ボタン) … 「メッセージ編集」モーダルを呼び出し。
    * `Delete` (ボタン) … エントリーを削除。
* **操作フロー**:
  1. 何らかの変更操作 → Save ボタン表示・保留状態の視覚化。
  2. Save ボタンクリック → 一括保存・通常状態に戻る。
* **翻訳対応**: すべての表示文字列が `__()` 関数でラップ済み。
* **スタイル管理**: インラインスタイルを排除し、SCSS ファイルで一元管理。
* **リアルタイム連携**: ランクラベル管理でラベルを保存すると、即座に rank 選択肢が更新される。

#### 6.1.2.1 ポスターノティス機能

* **動画ファイル対応時の注意表示**: 動画ファイルが選択され、Behavior が「Show Modal」に設定されている場合に、ポスター画像が存在しない旨の注意表示を表示します。
* **視覚的デザイン**: 赤いエラー色を使用した警告スタイルで、左側に太い境界線と警告アイコン (⚠️) を表示します。
* **表示条件**: 
  * `behavior === 'modal'` かつ `logo > 0` (動画ファイルが選択済み) かつ `poster === 0` (ポスター画像が未選択)
  * ポスター画像が存在しない場合にのみ表示
* **実装詳細**:
  * TypeScript での条件判定: `const hasPosterNotice = model.behavior === 'modal' && model.logo > 0 && model.poster === 0;`
  * 条件付きレンダリング: `{hasPosterNotice && (<div className="s2j-poster-notice">...)}`
  * リアルタイム更新: ポスター画像の生成・アップロード時に自動的にノティスが非表示になる

#### 6.1.3 メッセージ編集モーダル

* `behavior: 'modal'` の場合に表示します。
  * `text` (テキストエリア) … 補足メッセージ

#### 6.1.4 ランクラベル管理

* ランクは、本プラグインの専用「カスタム投稿タイプ」として扱い、その CPT スラッグは `s2j_am_rank_label` とします。
* ラベルは、`edit_s2j_am_rank_labels` 権限を設け、ユーザー自身で登録/修正できる形にします。
* CPT 一覧画面は、`show_in_menu => false` により非表示とします。
* 代わりとなる一覧画面を React UI で実装します。項目数が少ないので、インラインで直接編集可能にします (項目数が増えた段階で、モーダル画面で編集する様に変更)。
  * `title` (ラベル名)
  * `content` (説明)
  * `thumbnail_id` (サムネイル画像 ID)
  * `menu_order` (並び順)
* 並び替えは「Up」「Down」ボタンで行い、 `menu_order` を更新可能にします。
  * 将来的にドラッグ & ドロップ機能の追加を検討します。
* 変更内容は、メインコンテンツ (ContentList) とは別にローカル state 保持とします。
  * 「初期取得データ」と変動が発生した行の背景色はハイライト表示し、「保存前である」ことを視覚化します。
  * 「ランク保存」ボタンのクリックで一括保存します。
  * 「キャンセル」ボタンのクリックで、ローカル state を「初期取得データ」にリセットします。
* ラベルの多言語対応は、ユーザー自身で行える様、Polylang / WPML 対応とします。

#### 6.1.5 FFmpeg Library 管理

* FFmpeg 実行ファイルのパス設定機能
* FFmpeg 利用可能性のテスト機能
* 動画ファイルからポスター画像の自動生成機能
* 手動ポスター画像アップロード機能

#### 6.1.5.1 ポスターノティス表示機能

* **表示ロジック**: 動画ファイル選択 + Behavior「Show Modal」設定 + ポスター画像未選択時に注意表示
* **非表示条件**: ポスター画像が生成・アップロードされた場合に自動的に非表示
* **CSS 詳細度対応**: グリッドレイアウト内での確実なスタイル適用のための詳細度調整
* **ユーザビリティ**: 視覚的に目立つ警告デザインによる注意喚起 (不要な警告表示を防止し、適切なタイミングでの注意喚起を実現)

#### 6.1.6 データフローと状態管理

* **データフロー**: 親コンポーネント (AllianceManagerAdmin) でランクラベル・データを一元管理し、データの整合性を保証します。
* **リアルタイム連携**: ランクラベル保存後、即座に ContentList の rank 選択肢が更新されます。
* **状態管理**: ランクラベル管理とメインコンテンツ管理は、独立した状態管理とし、保留中の変更は視覚的にハイライト表示され、保存・キャンセル操作が可能です。
* **権限管理**: 管理者権限に `edit_s2j_am_rank_labels` 権限を自動付与します。

#### 6.1.7 データ構造と型定義

* **設定データの拡張**:
  ```php
  $settings = array(
      'display_style' => 'grid-single',
      'ffmpeg_path' => '',  // 新規追加
      'content_models' => array()
  );
  ```

* **型定義の追加**:
  * `FFmpegSettings`: FFmpeg 設定用インターフェイス
  * `FFmpegTestResult`: FFmpeg テスト結果用インターフェイス
  * `WordPressMedia`: WordPress メディア情報用インターフェイス

* **ContentModel 型定義の詳細**:
  * `poster: number` - ポスター画像の添付ファイル ID (0 = 未選択)
  * ポスターノティス表示判定に使用される重要なフィールド

### 6.2 動画・ポスター機能

* **動画ファイル対応**: ロゴとして動画ファイルをアップロード可能
* **ポスター画像自動生成**: FFmpeg を使用して動画からポスター画像を生成
* **手動ポスターアップロード**: FFmpeg が利用できない場合の代替手段
* **動画プレビュー**: 管理画面で動画ファイルのプレビュー表示
* **ポスター優先表示**: フロントエンドでは動画のポスター画像を優先表示

### 6.3 Gutenberg ブロック対応

* REST API 経由でデータを取得します。
  * `frontpage:'YES'` のレコードを抽出します。
  * 取得データは三次元配列とします。
    * `rank` slug で配列を分割します (「ランクラベル管理」で登録されたラベルの並び順)。
    * 一覧表の並び順を維持します。
* 取得した `display_style` に従って下記 HTML 要素を整形します。
  * ラベル「ランク」
  * 画像ボタン
    * `behavior: 'jump'` の場合は、「target='_blank' rel='noopener noreferrer'」で `jump_url` にジャンプ可能にします。
    * `behavior: 'modal'` の場合は、`logo` に `text` を添えて、モーダル表示します。

### 6.3 Classic エディタ対応

* Gutenberg ブロック同様、MetaBox として追加します。

## 7. REST API 仕様

### 7.1 エンドポイント

* `GET /wp-json/s2j-alliance-manager/v1/settings`
  * 管理画面設定取得

* `GET /wp-json/s2j-alliance-manager/v1/content-models`
  * 登録済みモデル一覧取得

* `POST /wp-json/s2j-alliance-manager/v1/save-all`
  * 設定＋モデル一括保存

* `GET /wp-json/s2j-alliance-manager/v1/rank-labels`
  * ランクラベル一覧取得

* `POST /wp-json/s2j-alliance-manager/v1/rank_labels`
  * ランクラベル一括保存

* `GET /wp-json/s2j-alliance-manager/v1/ffmpeg/settings`
  * FFmpeg 設定取得

* `POST /wp-json/s2j-alliance-manager/v1/ffmpeg/test`
  * FFmpeg 利用可能性テスト

* `POST /wp-json/s2j-alliance-manager/v1/ffmpeg/generate-poster`
  * ポスター画像生成

#### 7.1.1 ポスター画像関連エンドポイント

* `GET /wp-json/wp/v2/media?parent={video_id}&mime_type=image/jpeg&per_page=1`
  * 動画ファイルに対応するポスター画像の存在確認
  * パラメータ: `parent` (動画の添付ファイル ID), `mime_type` (画像タイプ), `per_page` (取得件数)

### 7.2 セキュリティ

* nonce チェック必須
* `current_user_can( 'manage_options' )` 権限がある場合のみ利用可

---

## 8. pro 版拡張予定

* Masonry レイアウト
* 並び順ドラッグ＆ドロップ対応
* 高度な検索フィルタ
* CLI コマンド (wp-cli) 連携

---
