<!--
目的：「フォルダー構成、主要ファイル、技術スタック、ビルド、責務」の明文化
※ docs_mod: CPT 再設計・ICPO 連携・Block Editor 編集を反映した修正案
-->

# アーキテクチャー

## 2. プロジェクト構成

本章では、「フォルダー構成」を記載します。

### 2.1. フォルダー構成・ファイル構成 (仕様変更案)

```
`s2j-alliance-manager`/
├── `README.md`
├── `README.txt`
├── `LICENSE`
├── `package.json`
├── node_modules/
├── `vite.config.ts`
├── `tsconfig.json`
├── `eslint.config.js`
├┬─ docs/           # 現行仕様書
├┬─ docs_mod/       # CPT 再設計・ICPO 連携の修正案
│├─ `README.md`     # 修正案の概要・変更点一覧
│├─ `overview.md`
│├─ `architecture.md`
│├─ `data_dictionary.md`
│├─ `rest_api_spec.md`
│├─ `block_spec.md`
│├─ `admin_ui_spec.md`
│├─ `carousel_spec.md`
│└─ `status.md`
├── `s2j-alliance-manager.php`
├── `uninstall.php`
├┬─ languages/
├┬─ includes/
│├─ `SettingsPage.php`       # サブボタン形式のメニュー登録 (変更)
│├─ `RestController.php`    # CPT 用 REST は標準活用、残存エンドポイント (変更)
│├─ `AllianceManager.php`   # ブロック・レンダリング、フロント表示 (変更: CPT からのデータ取得)
│└─ `Migration.php`         # 【新規】オプション→CPT 移行スクリプト
├┬─ src/
│├┬─ admin/                  # 設定画面用 (構成変更)
││├─ `index.tsx`             # 親画面・サブ画面のルーティング等 (変更)
││├┬─ components/
│││├─ `SettingsForm.tsx`     # 表示設定フォーム (継続)
│││├─ `FFmpegLibraryManager.tsx` (継続)
│││└─ ...                   # ContentList/RankLabelManager は CPT 一覧に置換
││└─ ...
│├┬─ gutenberg/
││├─ `index.tsx`
││├┬─ alliance-banner/       # フロント表示ブロック (継続)
││├┬─ alliance-partner-edit/   # 【新規】アライアンス・パートナー編集ブロック
│││├─ `index.tsx`           # RankLabel コンボボックス、MediaUploader 等
│││└─ `block.json`
││└┬─ rank-label-edit/         # 【新規】ランクラベル編集ブロック
││  ├─ `index.tsx`           # title, slug, thumbnail, logo_size, carousel
││  └─ `block.json`
│├┬─ modal/                  # 継続 (フロント用)
│├┬─ classic/                # 継続
│├┬─ styles/
│└┬─ types/
└┬─ dist/
```

### 2.2. 主要変更点の概要

| 項目 | 現行 | 仕様変更案 |
|------|------|------------|
| ランクラベル一覧 | React UI (RankLabelManager) | CPT 一覧画面、ICPO で並び替え |
| アライアンス・パートナー一覧 | React UI (ContentList)、wp_options | CPT `s2j_am_alliance_partner` 一覧、ICPO で並び替え |
| ランクラベル編集 | インライン編集 | 専用 Block Editor (rank-label-edit) |
| アライアンス・パートナー編集 | インライン編集 | 専用 Block Editor (alliance-partner-edit) |
| メニュー構成 | 単一の管理画面に縦積み | 親メニュー + サブボタン (RankLabel / ContentList / 表示設定 等) |
| 並び順 | Up/Down ボタン、配列 index | ICPO によるドラッグ & ドロップ (`menu_order`) |

### 2.3. 新規・変更ファイル

* `includes/Migration.php`: 既存 `content_models` (wp_options) から CPT `s2j_am_alliance_partner` へのデータ移行
* `src/gutenberg/alliance-partner-edit/`: アライアンス・パートナー編集用 Block Editor ブロック
* `src/gutenberg/rank-label-edit/`: ランクラベル編集用 Block Editor ブロック
* `includes/SettingsPage.php`: `add_menu_page` + `add_submenu_page` によるサブボタン構成

---

## 3. 技術スタック・開発環境

* 現行と同様。[WP_PLUGIN_SPEC.md](https://github.com/stein2nd/wp-plugin-spec/blob/main/WP_PLUGIN_SPEC.md) に準拠します。
* **ICPO 前提**: Intuitive Custom Post Order プラグインが有効である場合、両 CPT の並び替えが ICPO により可能となります。必須依存とはせず、あれば利用する形とします。

---

## 4. 国際化

* 現行と同様。すべての表示文字列を `__()` / `_e()` でラップします。

---

## 5. スタイル設計・コンポーネント設計

### 5.1. コンポーネント (仕様変更案)

* **SettingsForm**: 表示設定フォーム (親メニュー or サブボタンから表示)
* **FFmpegLibraryManager**: FFmpeg 設定・テスト (同上)
* **RankLabelManager**: CPT 一覧画面として提供 (React インライン編集は廃止)
* **ContentList**: CPT 一覧画面として提供 (React インライン編集は廃止)
* **alliance-partner-edit ブロック**: アライアンス・パートナー編集 UI
* **rank-label-edit ブロック**: ランクラベル編集 UI
