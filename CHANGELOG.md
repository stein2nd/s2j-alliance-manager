# S2J Alliance Manager - CHANGELOG

## unreleased

## 2.0.7 - 2026-10-04

### Changed

* `tsconfig.json` の `paths` を `./src/*` 形式に変更し、不要になった `baseUrl` を削除
* `@s2j/docs-linter` を v1.0.27に更新

## 2.0.6 - 2026-10-03

### Changed

* 依存 npm モジュールを最新化 (Vite v8.3.2、Sass v1.105.1、ESLint v10.12、Rollup v4.64、`@typescript-eslint/*` v8.71等)
* `@s2j/docs-linter` を v1.0.26に更新

## 2.0.5 - 2026-09-26

### Changed

* 依存 npm モジュールを最新化 (React v19.3、Vite v8.3.1、Sass v1.105、ESLint v10.11等)
* WordPress パッケージを更新 (`@wordpress/components` v41、`@wordpress/block-editor` v18、`@wordpress/blocks` v16等)
* `@s2j/docs-linter` を v1.0.25に更新

## 2.0.4 - 2026-09-09

### Changed

* 依存 npm モジュールを最新化 (Vite v8.2.2、Sass v1.104、ESLint v10.10、`@typescript-eslint/*` v8.70等)
* WordPress パッケージを更新 (`@wordpress/components` v40、`@wordpress/block-editor` v17等)
* `@s2j/docs-linter` を v1.0.24に更新
* 未使用の `@wordpress/scripts` を削除し、間接依存に起因する npm 脆弱性警告を解消

## 2.0.3 - 2026-08-11

### Changed

* `@typescript-eslint/*` を v8.67.0に更新
* TypeScript v7.0 (`tsc`) を維持しつつ、`typescript-eslint` 向けに `@typescript/typescript6` を併用 (公式の side-by-side 構成)
* `allowScripts` のキーを `@s2j/docs-linter` に簡略化
* `vite.config.ts` で `__dirname` を `import.meta.dirname` に置換し、無効な `inlineDynamicImports` 指定を削除

## 2.0.2 - 2026-08-08

### Added

* 日本語翻訳ファイル (`languages/s2j-alliance-manager-ja.po` / `.mo`) を追加
* npm v12以降向けに `@s2j/docs-linter` の install script 実行を許可 (`package.json` の `allowScripts`)

### Changed

* 依存 npm モジュールを最新化 (React v19.2.8、TypeScript v7.0、Vite v8.2、Sass v1.102等)
* WordPress パッケージを更新 (`@wordpress/components` v38、`@wordpress/scripts` v34、`@wordpress/block-editor` v16等)
* `@s2j/docs-linter` を v1.0.22に更新
* `.npmrc` に `allow-git=all` を追加 (`@s2j/docs-linter` の GitHub 依存取得用)
* 翻訳テンプレート `languages/s2j-alliance-manager.pot` を更新

## 2.0.1 - 2026-06-11

### Fixed

* 配布 zip 生成スクリプト `tools/dist/make-dist-zip.mjs` を復元 (npm 更新時に誤削除されていたため、GitHub Actions の配布 zip ワークフローが失敗していた)
* Linux CI 向けに `readme.txt` / `README.txt` の大文字/小文字の差異に対応

## 2.0.0 - 2026-06-11

### Breaking Changes

* ライセンスを GPL v2から GPL v3に変更

### Added

* ランクごとにカルーセル表示を指定可能に
* 配布 zip 生成スクリプト (`npm run dist`) と GitHub ワークフロー
* 仕様書を `docs/` 配下の個別ドキュメント (architecture, block_spec, carousel_spec 等) に細分化
* S2J Docs Linter によるドキュメント lint (`npm run lint:docs`)

### Changed

* React v18から React v19に更新
* 管理 UI、Gutenberg ブロック、フロントエンド表示の各種改善
* 依存 npm モジュールの更新

## 1.0.0

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
