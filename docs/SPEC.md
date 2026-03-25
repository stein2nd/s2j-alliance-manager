# S2J Alliance Manager SPEC (レガシー起点)

本ドキュメントは、従来の単一仕様書の **目次** です。詳細は分割された各 spec に移行済みです。  
**仕様の起点** は [specs.md](./specs.md) です。

---

## はじめに

* 本ドキュメントでは、WordPress プラグイン「s2j-alliance-manager」の専用仕様を定義します。
* 本プラグインの設計は、以下の共通 SPEC に準拠します。
  * [WP_PLUGIN_SPEC.md (共通仕様)](https://github.com/stein2nd/wp-plugin-spec/blob/main/docs/WP_PLUGIN_SPEC.md)
* プラグイン固有の仕様は、下記の分割ドキュメントに記載されています。

---

## 分割仕様書へのリンク

| 章・付録 | ドキュメント | 内容 |
|----------|--------------|------|
| §1 | [overview.md](./overview.md) | プラグイン概要・基本情報・はじめに |
| §2〜§6 | [architecture.md](./architecture.md) | プロジェクト構成、技術スタック、国際化、スタイル設計、パフォーマンス・デバッグ |
| §7 | [block_spec.md](./block_spec.md) | Gutenberg ブロック対応、Classic エディター対応 |
| §5.2 + §8 | [admin_ui_spec.md](./admin_ui_spec.md) | コンポーネント一覧、機能仕様、UI/UX 設計 |
| §9.1〜§9.2 | [data_dictionary.md](./data_dictionary.md) | データ構造、型定義、データフロー |
| §9.3 | [rest_api_spec.md](./rest_api_spec.md) | REST API エンドポイント・セキュリティ |
| 付録 A | [carousel_spec.md](./carousel_spec.md) | Carousel 機能の実装詳細 |
| §10〜§13 | [status.md](./status.md) | 実装状況サマリー、Backlog、品質レポート、まとめ |

---

## 関連ドキュメント

* [specs.md](./specs.md) — 仕様書の起点 (共通仕様へのリンク、各 spec の参照)
* [SPEC_STRUCTURE.md](./SPEC_STRUCTURE.md) — 仕様書の細分化ガイド (ベター・プラクティスと本プロジェクト向け改善案)

---

*詳細は上記の各ドキュメントを参照してください。*
