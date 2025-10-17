# S2J Alliance Manager

[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![WordPress](https://img.shields.io/badge/WordPress-6.3-blue.svg)](https://wordpress.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Dart SASS](https://img.shields.io/badge/SCSS-1.9-blue.svg)](https://sass-lang.com/dart-sass/)
[![Vite](https://img.shields.io/badge/vite-7.1-blue.svg)](https://vite.dev)

## Description

S2J Alliance Manager は、ロゴや動画付きの提携パートナーバナーを管理するために設計された、包括的な WordPress プラグインです。Gutenberg ブロックと Classic エディターの両方をサポートし、バナーとランクの直感的で柔軟な管理のためのモダンな React ベースの管理インターフェースを提供します。

このプラグインは、React18.2、TypeScript5.9、Vite7.1などの現代的な Web 技術で構築されており、最適なパフォーマンスと保守性を実現しています。

### 特徴

#### 🎯 コア機能

* **Gutenberg ブロック対応**: カスタマイズ可能な表示オプションを備えた、モダンなブロック・エディターとの統合
* **Classic エディター対応**: 従来の WordPress 編集体験を実現する、MetaBox との統合
* **動的ランク管理**: カスタム投稿タイプベースのランクラベルシステム (リアルタイム更新対応)
* **メディア管理**: 画像と動画の両方に対応し、自動ポスター生成機能を搭載
* **レスポンシブ・デザイン**: あらゆるデバイスと画面サイズに最適化された表示

#### 🛠️ 管理機能

* **直感的な管理 UI**: リアルタイム更新対応の、React ベース管理インターフェース
* **インライン編集**: ランクラベルとパートナー情報の直接編集
* **視覚的フィードバック**: 変更箇所のハイライト表示と、行番号表示による UX 向上
* **一括操作**: 効率的な管理のための保存・キャンセル機能
* **メディア統合**: サムネイル・プレビュー付き WordPress メディア・ライブラリ連携

#### 🔧 技術的特徴

* **TypeScript 対応**: 完全な型安全性と、強化された開発体験
* **モダンなビルドシステム**: Vite によるホット・リロード対応ビルドプロセス
* **コード品質**: 一貫したコードのための ESLint と Stylelint 統合
* **国際化**: `.pot` ファイル生成による完全な i18n サポート
* **REST API**: データ管理のための包括的な API エンドポイント

#### 🎨 表示オプション

* **シングル・カラム・グリッド**: 集中したプレゼンテーションのための、シンプルな単一カラムレイアウト
* **マルチ・カラム・グリッド**: 画面サイズに応じて適応する、レスポンシブ・グリッドレイアウト
* **Masonry レイアウト**: Pinterest スタイルの masonry (石畳) レイアウト (Pro 版で計画中)

## License

このプロジェクトは GPL v2以降の下でライセンスされています - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## Privacy Policy

このプラグインは個人データを収集、保存、送信しません。すべてのデータは WordPress データベースにローカルで保存され、第三者と共有されることはありません。

## Support and Contact

サポート、機能リクエスト、またはバグ報告については、[GitHub Issues](https://github.com/stein2nd/s2j-alliance-manager/issues) ページをご覧ください。

---

## Installation

### 前提条件

* WordPress 6.3以降 (Gutenberg 15.2.0対応のため)
* PHP 7.4以降
* JavaScript が有効な最新の Web ブラウザ
* Node.js18以降 (React18.2.0対応のため)
* npm または yarn

### 簡単インストール

1. プラグイン・フォルダーを WordPress の `/wp-content/plugins/` ディレクトリにアップロードします。
2. WordPress 管理画面の「プラグイン」メニューから有効化します。
3. 「設定」→「S2J Alliance Manager」から設定を開始します。

### 開発インストール

```zsh
# リポジトリをクローンする
git clone https://github.com/stein2nd/s2j-alliance-manager.git

# プラグイン・ディレクトリに移動する
cd s2j-alliance-manager

# 依存関係をインストールする
npm install --legacy-peer-deps

# プラグインをビルドする
npm run build:production
```

## Usage

### ランクラベルの設定

1. **設定 → S2J Alliance Manager** に移動します。
2. **Rank Management** セクションで、ランクラベルを追加します (例: プラチナ、ゴールド、シルバー、ブロンズ、スチール、マイクロ)。内部的にカスタム投稿タイプ `s2j_am_rank_label` として管理されます。
3. 表示順序を設定し、説明を追加します。
4. 変更を保存します。

### 提携パートナーの追加

1. **Partner Management** セクションで、**Add New Partner** をクリックします。
2. ロゴまたは動画ファイルをアップロードします。
3. 設定済みの選択肢から、パートナーのランクを設定します。
4. ジャンプ先 URL またはモーダル・メッセージを追加します。
5. 表示動作を選択します (「URL へジャンプ」または「モーダル表示」)。
6. 変更を保存します。

### Gutenberg ブロックの使用方法

1. ブロック・エディターで投稿またはページを編集します。
2. **+** ボタンをクリックして、ブロックインサーターで、**"Alliance Banner"** を検索して、新しいブロックを追加します。
3. 希望の表示スタイルを選択します。
4. コンテンツを公開または更新します。

### Classic エディターでの使用方法

1. Classic エディターで投稿またはページを編集します。
2. サイドバーにある **Alliance Banner** メタボックスを探します。
3. 希望の表示スタイルを選択します。
4. **Insert Alliance Banner** をクリックします。
5. コンテンツを公開または更新します。

## FAQ

### Q: このプラグインは、ページビルダと互換性がありますか ?

A: はい、このプラグインは Gutenberg ブロックとショートコードの両方をサポートしているため、ほとんどのページビルダと互換性があります。

### Q: 動画をパートナーロゴとして使用できますか ?

A: はい、このプラグインは画像と動画の両方をサポートしています。動画の場合、(FFmpeg 導入可能な環境では) FFmpeg を使用して自動的にポスター画像を生成できます。

### Q: プラグインは翻訳対応済みですか ?

A: はい、プラグインは完全に翻訳対応済みで、`.pot` ファイル生成をサポートしています。

### Q: 必要な WordPress のバージョンは ?

A: Gutenberg ブロック・エディターとの最適な互換性のため、WordPress 6.3以降が必要です。

### Q: パートナーランクはどのように管理しますか ? =

A: プラグイン設定の「ランク管理」セクションを使用して、カスタムランクラベル (例: ゴールド、シルバー、ブロンズ) を作成・管理します。これらのランクはパートナー管理インターフェースに自動的に表示されます。

### Q: 表示レイアウトをカスタマイズできますか ? =

A: はい、シングル・カラム・グリッド、マルチ・カラム・グリッドから選択できます。ブロック設定で追加のカスタマイズ・オプションが利用可能です。

## Screenshots

### 管理インターフェース

![管理インターフェース](screenshots/admin-interface.png)
*直感的なパートナー管理機能を備えた、モダンな React ベースの管理インターフェース*

### Gutenberg ブロック

![Gutenberg ブロック](screenshots/gutenberg-block.png)
*WordPress ブロックエディタとの、シームレスな統合*

### フロントエンド表示

![フロントエンド表示](screenshots/frontend-display.png)
*フロントエンドでの、レスポンシブ対応パートナーバナー表示*

### ランク管理

![ランク管理](screenshots/rank-management.png)
*柔軟なランクラベル管理システム*

### メディア・アップロード

![メディア・アップロード](screenshots/media-upload.png)
*WordPress メディア・ライブラリとの統合 (サムネイル・プレビュー付き)*

---

## Development

### 技術スタック

* **フロントエンド**:
  * React18.2
  * TypeScript5.9
  * SCSS1.93
* **ビルドツール**:
  * Vite7.1
* **コード品質**:
  * ESLint9.36
  * Stylelint16.24
* **WordPress**:
  * Gutenberg
  * API Fetch7.29, Block Editor15.2, Blocks15.2, Component Reference30.2, Data10.29, Element6.29, Internationalization (i18n) 6.2, Scripts30.22, URL4.29

### プロジェクト構造

```
`s2j-alliance-manager`/
├── `readme.md`
├── `LICENSE`
├── `SPEC.md`  # プラグイン固有仕様
├── `vite.config.ts`  # Vite 設定
├── `tsconfig.json`  # TypeScript 設定
├── `eslint.config.js`  # ESLint 設定
├── `s2j-alliance-manager.php`  # プラグイン本体
├── `uninstall.php`  # アンインストール処理
├── `package.json`  # ビルド設定
├── node_modules/
├┬─ languages/  # 翻訳ファイル (.pot、.po、.mo)
│└─ `s2j-alliance-manager.pot`
├┬─ includes/  # PHP クラス群 (REST、Settings、Admin UI)
│├─ `SettingsPage.php`  # 設定画面
│├─ `RestController.php`  # REST API
│└─ `AllianceManager.php`  # Gutenberg ブロック
├┬─ src/  # TypeScript/React (Gutenberg ブロック、設定画面) /SCSS ソース
│├┬─ admin/  # 管理インターフェース
││├─ `index.tsx`  # 管理画面メイン・エントリーポイント
││├┬─ components/  # React コンポーネント
│││├─ `SettingsForm.tsx`  # 設定保存フォーム
│││├─ `ContentList.tsx`  # 一覧表 UI (独自実装)
│││├─ `RankLabelManager.tsx`  # ランクラベル管理 UI
│││├─ `MediaUploader.tsx`  # WordPress メディア・アップローダー統合
│││└─ `MessageModal.tsx`  # メッセージ編集モーダル
││└┬─ data/  # 定数定義
││　└─ `constants.ts`
│├┬─ gutenberg/  # Gutenberg ブロック実装
││├─ `index.tsx`
││└┬─ alliance-banner
││　└─ `block.json`  # ブロック定義
│├┬─ classic/  # MetaBox 用
││└─ `index.ts`
│├┬─ styles/  # プラグイン用のスタイル定義
││├─ `admin.scss` (設定画面用)
││├─ `gutenberg.scss` (Gutenberg ブロック用)
││├─ `classic.scss` (MetaBox 用)
││└─ `variables.scss` (SCSS 変数定義)
│└┬─ types/  # プラグイン用のグローバル型定義
│　├─ `index.ts` (ContentModel 型定義)
│　└─ `wordpress.d.ts` (WordPress 型定義)
└┬─ dist/  # Vite ビルド成果物 (Git 管理外)、アイコン
　├┬─ blocks
　│└┬─ alliance-banner
　│　└─ `block.json`  # ブロック定義
　├┬─ css/  # プラグイン用のスタイル定義
　│├─ s2j-alliance-manager-admin.css
　│├─ s2j-alliance-manager-gutenberg.css
　│└─ s2j-alliance-manager-classic.css
　└┬─ js/  # プラグイン用の Gutenberg ブロック、設定画面
　　├─ s2j-alliance-manager-admin.js
　　├─ s2j-alliance-manager-gutenberg.js
　　└─ s2j-alliance-manager-classic.js
```

### 開発環境のセットアップ

```zsh
# 依存関係をインストールする
npm install --legacy-peer-deps

# linting を実行する
npm run lint

# 開発ビルド (非 minify 版) を開始する
npm run build:dev

# 翻訳ファイルを生成する
npm run makepot
```

### その他のコマンド

```zsh
# watch モードで開発ビルドを開始する
npm run dev

# 本番ビルド (minify 版) を開始する
npm run build:production
```

### セキュリティ

* nonce チェックが必須です。
* 基本設定の管理には、`manage_options` 権限が必要です。
* ランクラベル管理には `edit_s2j_am_rank_labels` 権限が必要です (管理者に自動付与)。

### データフローと状態管理 (アーキテクチャー)

* **親コンポーネント管理**: AllianceManagerAdmin クラスで、ランクラベルデータを一元管理
* **リアルタイム同期**: ランクラベル保存後、ContentList の rank 選択肢を即座に更新
* **状態の分離**: ランクラベル管理とメインコンテンツ管理は、独立した状態管理
* **視覚的フィードバック**: 保留中の変更は、背景色のハイライトで視覚化

### データフローと状態管理 (データの流れ)

```
AllianceManagerAdmin (親コンポーネント)
├─ RankLabelManager → ランクラベル管理・保存時に親に通知
└─ ContentList → 親からランクラベルを受け取り、選択肢を生成
```

### REST API エンドポイント

#### 設定

* `GET /wp-json/s2j-alliance-manager/v1/settings` - プラグイン設定を取得
* `POST /wp-json/s2j-alliance-manager/v1/save-all` - 設定とコンテンツモデルを保存

#### コンテンツ管理

* `GET /wp-json/s2j-alliance-manager/v1/content-models` - パートナーリストを取得
* `GET /wp-json/s2j-alliance-manager/v1/rank-labels` - ランクラベルを取得
* `POST /wp-json/s2j-alliance-manager/v1/rank-labels` - ランクラベルを保存

#### メディアと FFmpeg

* `GET /wp-json/s2j-alliance-manager/v1/ffmpeg/settings` - FFmpeg の設定を取得
* `POST /wp-json/s2j-alliance-manager/v1/ffmpeg/test` - FFmpeg の利用可能性をテスト
* `POST /wp-json/s2j-alliance-manager/v1/ffmpeg/generate-poster` - 動画ポスターを生成する

### データモデル (ランクラベル)

```typescript
interface RankLabel {
  id: number;
  title: string;
  content: string;
  thumbnail_id: number;
  menu_order: number;
  slug: string;
}
```

### データモデル (パートナーリスト)

```typescript
interface ContentModel {
  frontpage: 'YES' | 'NO';
  rank: string;
  logo: number;        // WordPress attachment ID
  poster: number;      // Video poster attachment ID
  jump_url: string;
  behavior: 'jump' | 'modal';
  message: string;
}
```

## Contributing

貢献をお待ちしています ! 以下の手順に従ってください:

1. リポジトリをフォークしてください。
2. 機能ブランチを作成してください (`git checkout -b feature/amazing-feature`)。
3. 変更をコミットしてください (`git commit -m 'Add some amazing feature'`)。
4. 機能ブランチにプッシュしてください (`git push origin feature/amazing-feature`)。
5. Pull Request を開いてください。

*詳細な情報については、[SPEC.md](SPEC.md) ファイルを参照してください。*

### 開発ガイドライン

* 既存のコードスタイルに従ってください。
* 新機能には、TypeScript 型を追加しましょう。
* 新機能には、テストを含めましょう。
* 必要に応じて、ドキュメントを更新してください。

## Contributors & Developers

**"S2J Alliance Manager"** はオープンソース・ソフトウェアです。以下の皆様がこのプラグインに貢献しています。

* **開発者**: Koutarou ISHIKAWA

---

## Changelog

### Version1.0.0

* 初回リリース
* Gutenberg ブロック対応
* Classic エディター統合
* React ベースの管理インターフェース
* ランクラベル管理システム
* メディア・アップロードと管理
* レスポンシブ・デザイン
* 国際化対応
* REST API エンドポイント
* 動画ポスター生成のための FFmpeg 統合

## Upgrade Notice

### 1.0.0
S2J Alliance Manager の初回リリース。このバージョンには、最新の WordPress 統合による提携パートナーバナー管理のための全コア機能が含まれています。
