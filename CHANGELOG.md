# S2J Alliance Manager - CHANGELOG

## unreleased

## 2.0.15 - 2026-10-24

### Fixed

* GitHub Actions「dist」で `makejson` (`wp i18n make-json`) が `wp` 未導入のため失敗する問題 (`.github/workflows/dist-zip.yml` に PHP v8.3 + WP-CLI を追加)

## 2.0.14 - 2026-10-24

### Added

* npm スクリプト `makemo` / `makejson` / `makei18n`、本番 Gutenberg ビルド後の `makejson` (`postbuild:production:gutenberg`)

### Changed

* 対応 PHP の下限を **8.3** に引き上げ (WordPress 推奨要件に合わせ、`Requires PHP` / Composer `>=8.3` / platform v8.3.28、`README` 表記を更新)
* 依存 npm モジュールを最新化 (WordPress パッケージ v8– v11系、Vite v8.3.5、Rollup v4.65.0、`@s2j/docs-linter` v1.0.30、`@typescript-eslint/*` v8.72.0等)
* 日本語翻訳を更新 (`.mo`、Gutenberg 用 `.json`)

## 2.0.13 - 2026-10-16

### Added

* wp-env / Docker なしのローカル PHPUnit (`phpunit.unit.xml.dist` / `phpunit.xml.dist`、`bin/phpunit-local.sh`、`bin/install-wp-tests.sh`)
* ユニット3件・統合2件 (`RestController` サニタイズ / REST `/settings`)、Local 用 WP-CLI スモーク `tests/smoke-local.sh`
* npm スクリプト `test:unit:php:unit-only` / `test:unit:php:local` / `test:smoke:local`、`.env.tests.example`、`docs/phpunit_local.md`

### Changed

* Composer の `test:unit` / `test:integration` / `test:all` に分割 (従来の `composer test` は全件実行)

## 2.0.12 - 2026-10-16

### Added

* Composer 開発依存 (PHPStan、WPCS、PHPUnit 等) と `composer.json` / `composer.lock`
* WPCS 用 `phpcs.wpcs.xml.dist`、PHPStan 用 `phpstan.neon.dist` / `phpstan-bootstrap.php`
* npm スクリプト `lint:php` / `phpstan` / `phpcs` (Composer 経由)

### Changed

* PHP ソースを WordPress Coding Standards (WPCS) に準拠 (整形、DocBlock、エスケープ出力等)
* PHPStan level-5を `includes/` で通過するよう PHPDoc と実装を整理
* プラグインメインクラス / `AllianceManager` のシングルトン等にプロパティ型を付与
* 未使用の `render_partner_logo()` とブロック登録状態用プロパティを削除

### Fixed

* 管理画面での出力の `_e()` を `esc_html_e()` に変更、`in_array` の strict 比較、JSON/日時、GET サニタイズ等の WPCS 指摘を修正

## 2.0.11 - 2026-10-15

### Changed

* 依存 npm モジュールを最新化 (React v19.3.1、Rollup v4.64.7、`@typescript-eslint/*` v8.71.2等)
* `@s2j/docs-linter` を v1.0.29に更新
* textlint の許可パターンに `#status-*` アンカー ID を追加

## 2.0.10 - 2026-10-11

### Changed

* 依存 npm モジュールを最新化 (Vite v8.3.4、Rollup v4.64.5、`@typescript-eslint/*` v8.71.1等)
* WordPress パッケージを更新 (`@wordpress/components` v42、`@wordpress/block-editor` v18.1、`@wordpress/element` v9等)

## 2.0.10 - 2026-10-10

### Changed

* ドキュメント表記を統一 (「URL へジャンプ」→「URL にジャンプ」、「へ遷移/へ変更/へ移行」→「に遷移/に変更/に移行」等)

## 2.0.9 - 2026-10-08

### Changed

* ドキュメント表記を統一 (`次の` / `ときの` 等 → `下記の` / `場合の` 等)

## 2.0.8 - 2026-10-05

### Changed

* ドキュメント表記を統一 (`以下` → `下記`、Markdown 表ヘッダー区切りを `| --- |` 形式に統一)

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
