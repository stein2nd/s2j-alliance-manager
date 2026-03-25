# S2J Alliance Manager — 仕様変更案の起点

本ドキュメントは、CPT 再設計、ICPO 連携を前提とした仕様変更案の入口です。
各修正案は `docs_mod/` 配下に格納しています。

## 概要

[README.md](./README.md) に変更の全体像を記載しています。

## 修正案ドキュメント一覧

| ドキュメント | 内容 |
|--------------|------|
| [概要](./overview.md) | プロジェクトの存在理由、概要、基本情報 (CPT 設計、ICPO 追記) |
| [アーキテクチャー](./architecture.md) | フォルダー構成、主要ファイル、技術スタック (新 CPT、Block Editor、移行) |
| [データ辞書](./data_dictionary.md) | モデルの型、CPT、メタキー、データフロー (ContentModel CPT 化) |
| [REST API 仕様](./rest_api_spec.md) | エンドポイント、リクエスト/レスポンス (CPT 標準 REST 活用) |
| [ブロック仕様](./block_spec.md) | ブロックの属性、編集ブロック、フロント表示 |
| [管理画面の UI 仕様](./admin_ui_spec.md) | サブボタン構成、CPT 一覧、ICPO、Block Editor 呼び出し |
| [Carousel 仕様](./carousel_spec.md) | 子要素数カウント、有効条件 (CPT 化に伴う更新) |
| [実装状況](./status.md) | 実装状況サマリー、移行タスク、Backlog |

---

*元の仕様書は `docs/` フォルダーを参照してください。*
