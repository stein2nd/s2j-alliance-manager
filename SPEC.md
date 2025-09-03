# S2J Alliance Manager SPEC

## はじめに

本ドキュメントでは、WordPress プラグイン「s2j-alliance-manager」の専用仕様を定義します。
本プラグインの設計は、以下の共通 SPEC に準拠します。

- [WP_PLUGIN_SPEC.md (共通仕様)](https://github.com/stein2nd/wp-plugin-spec/blob/main/WP_PLUGIN_SPEC.md)

以下は、本プラグイン固有の仕様をまとめたものです。

---

## 2. プラグイン概要

* 名称: S2J Alliance Manager
* プラグイン・スラッグ: s2j-alliance-manager
* テキスト・ドメイン: s2j-alliance-manager
* ライセンス: GPL v2 以降
* 目的: アライアンス関係にある協力会社のリンク付きバナー（ロゴ・動画含む）を管理し、Front page 等でブロック表示します。
* 特徴:
  * Gutenberg ブロックエディタに対応します。
  * MetaBox により、Classic エディタに対応します。
    * Gutenberg ブロックでの処理内容を基本的に再現します。
  * 管理画面でバナー画像(または動画)・リンク先 URL・グループ等を保存します。
    * 管理 UI は [Create Content Model](https://github.com/Automattic/create-content-model) を取込んで実装します。
    * basic版 / pro版 を視野に入れた設計 (masonry 表示は pro 版にて提供)

## 3. プロジェクト構成

### 3.1 フォルダ構成

```
s2j-alliance-manager/
├─ `package.json` # ビルド設定
├─ `SPEC.md` # プラグイン固有仕様
├─ `vite.config.ts`
├─ `tsconfig.json`
├─ `eslint.config.js` # ESLint設定
├─ `LICENSE`
├─ `readme.md`
├─ `s2j-alliance-manager.php` # プラグイン本体
├─ `uninstall.php` # プラグイン削除時の処理
├─ includes/ # PHP クラス群 (REST、Settings、Admin UI)
│　├─ `SettingsPage.php` (設定画面)
│　├─ `RestController.php` (REST API)
│　├─ `AllianceManager.php` (Gutenberg ブロック)
│　└─ ...
├─ src/ # TypeScript/React (Gutenberg ブロック、設定画面) /SCSS ソース
│　├─ admin/ # 設定画面用
│　│　├── `index.tsx` # 管理画面メインエントリーポイント
│　│　├── components/
│　│　│　├── `SettingsForm.tsx` # 初期設定保存フォーム
│　│　│　├── `ContentList.tsx` # 一覧表 UI (Create Content Model実装)
│　│　│　├── `MessageModal.tsx` # メッセージ編集モーダル
│　│　│　└── `MediaUploader.tsx` # WPメディアアップローダ統合
│　│　└── data/
│　│　　　└── `constants.ts` # 定数定義 (表示形式、ランク、動作オプション)
│　├─ gutenberg/ # Gutenberg ブロック用
│　│　└─ `index.tsx`
│　├─ classic/ # MetaBox 用
│　│　└─ `index.ts`
│　├─ styles/ # プラグイン用のスタイル定義
│　│　├─ `admin.scss` (設定画面用)
│　│　├─ `gutenberg.scss` (Gutenberg ブロック用)
│　│　├─ `classic.scss` (MetaBox 用)
│　│　├─ `variables.scss` (SCSS 変数定義)
│　│　└─ ...
│　└─ types/ # プラグイン用のグローバル・タイプ・定義
│　　　├─ `index.ts` (ContentModel 型定義)
│　　　└─ `wordpress.d.ts` (WordPress 型定義)
├─ dist/ # Vite ビルド成果物 (Git 管理外)、アイコン
│　├─ js/ # プラグイン用のGutenberg ブロック、設定画面
│　│　└─ ...
│　└─ css/ # プラグイン用のスタイル定義
│　　　└─ ...
└─ languages/ # 翻訳ファイル (.pot、.po、.mo)
```

### 3.2 主要ファイル

* `s2j-alliance-manager.php` : プラグイン起点、クラスロード・初期化
* `includes/SettingsPage.php` : 管理画面のHTML構造・メニュー登録
* `includes/RestController.php` : REST API エンドポイント定義・データ処理
* `includes/AllianceManager.php` : Gutenberg ブロック登録・レンダリング
* `src/admin/index.tsx` : 管理画面のメインエントリーポイント (React初期化・データ管理)
* `src/admin/components/ContentList.tsx` : 一覧表UI (Create Content Model実装)
* `src/admin/components/SettingsForm.tsx` : 表示形式設定フォーム
* `src/admin/components/MessageModal.tsx` : メッセージ編集モーダル
* `src/admin/components/MediaUploader.tsx` : WordPressメディアアップローダ統合
* `src/admin/data/constants.ts` : 定数定義 (表示形式、ランク、動作オプション)
* `src/gutenberg/index.tsx` : Gutenberg ブロックの UI ロジック
* `src/classic/index.ts` : Classic エディタ対応スクリプト
* `src/types/index.ts` : TypeScript型定義 (ContentModel 等)

---

## 4. ビルド要件

* Vite + TypeScript + SCSS
  * `vite.config.ts` を用いて IIFE 形式でバンドルする
  * JavaScript は WordPress 同梱の jQuery を利用可能とする （外部 import 不要） (`jQuery(function($) { ... })`)
  * CSS も IIFE 出力し、エディタ用・フロント用を区別すること
* 出力は `./dist`

### 4.1 `package.json` の `scripts`

* `npm run build:dev` → 開発用ビルド（minify 無効）
* `npm run build:production` → 本番用ビルド（minify 有効）

## 5. 国際化

* テキストはすべて `__()` または `_e()` を使用
* 翻訳ファイルは `languages/` に配置
* 翻訳テンプレート `.pot` は `makepot` により生成
* Text Domain は plugin-slug に合わせる

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

* [Create Content Model](https://github.com/Automattic/create-content-model) で実装します。
  * **行番号表示**: 各レコードに `#1`, `#2`, `#3` の形式で行番号を表示
  * **保留状態の視覚化**: 変更がある場合は全行がクリーム色の背景に変更、左端にインジケーター表示
  * **Saveボタン**: 何らかの変更がある場合に表示、一括保存機能
  * **フィールド構成**:
    * `frontpage` (チェックボックス) … 掲出有無
    * `rank` (コンボボックス) … ゴールド、シルバー等
      * slug 追加可 (slug の並び順を、序列の順番とする)
    * `logo` (メディアボタン) … ロゴ画像 (または動画) の追加/変更
      * サムネイル表示
    * `jump_url` (テキストボックス) … 遷移先 URL
    * `behavior` (コンボボックス)
      * 選択肢: `jump` … 指定 URL にジャンプ
      * 選択肢: `modal` … モーダルで指定メッセージを表示
    * `message` (ボタン) … 「メッセージ編集」モーダルを呼び出し
    * `shiftUp` (ボタン) … エントリーを上に移動
    * `shiftDown` (ボタン) … エントリーを下に移動
    * `Delete` (ボタン) … エントリーを削除
* **操作フロー**:
  1. 何らかの変更操作 → Saveボタン表示・保留状態の視覚化
  2. Saveボタンクリック → 一括保存・通常状態に戻る
* **翻訳対応**: すべての表示文字列が `__()` 関数でラップ済み

#### 6.1.3 メッセージ編集モーダル

* `behavior: 'modal'` の場合に表示します。
  * `text` (テキストエリア) … 補足メッセージ

### 6.2 Gutenberg ブロック対応

* REST API 経由でデータを取得します。
  * `frontpage:'YES'` のレコードを抽出します。
  * 取得データは三次元配列とします。
    * `rank` slug で配列を分割します (序列の順番は、slug の並び順)。
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

### 7.2 セキュリティ

* nonce チェック必須
* `current_user_can( 'manage_options' )` 権限がある場合のみ利用可

## 8. pro 版拡張予定

* Masonry レイアウト
* 並び順ドラッグ＆ドロップ対応
* 高度な検索フィルタ
* CLI コマンド (wp-cli) 連携

---
