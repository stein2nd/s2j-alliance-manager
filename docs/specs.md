# S2J Alliance Manager — 仕様書の起点

本プロジェクトの仕様は、以下のドキュメントに分散して定義しています。
共通仕様に加え、プラグイン固有の仕様を参照してください。

## 共通仕様

* [WP_PLUGIN_SPEC.md (共通仕様)](https://github.com/stein2nd/wp-plugin-spec/blob/main/docs/WP_PLUGIN_SPEC.md)

## プラグイン固有の仕様

| ドキュメント | 内容 |
|--------------|------|
| [概要](./overview.md) | プロジェクトの存在理由、概要、基本情報 |
| [アーキテクチャー](./architecture.md) | フォルダー構成、主要ファイル、技術スタック、ビルド、責務 |
| [データ辞書](./data_dictionary.md) | モデルの型、設定配列、CPT、メタキー、option、データフロー |
| [REST API 仕様](./rest_api_spec.md) | REST API エンドポイント、リクエスト/レスポンス、権限、セキュリティ |
| [ブロック仕様](./block_spec.md) | Gutenberg ブロックの属性、フロント表示、Classic 対応方針 |
| [管理画面の UI 仕様](./admin_ui_spec.md) | 管理画面のレイアウト、各機能 |
| [Carousel 仕様](./carousel_spec.md) | Carousel の子要素数カウント、有効条件、フロント表示、バリデーション |
| [実装状況](./status.md) | 実装状況サマリー、Backlog、品質レポート、まとめ |
| [SPEC.md](./SPEC.md) | レガシー起点 (上記へのリンク集) |
| [SPEC_STRUCTURE.md](./SPEC_STRUCTURE.md) | 仕様書の細分化ガイド (ベター・プラクティスと改善案) |

---

*本プラグインの設計は上記共通仕様に準拠し、ここに列挙したドキュメントがプラグイン固有の仕様を定義します。*
