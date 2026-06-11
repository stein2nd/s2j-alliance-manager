# S2J Alliance Manager - CHANGELOG

## unreleased

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
