# 仕様変更案 (docs_mod)

本フォルダーには、CPT 再設計および Intuitive Custom Post Order (ICPO) 連携を前提とした、各仕様書の修正案を格納しています。

## 変更の概要

* **管理画面の構成**:
    * VK Block Patterns 風のサブボタン形式へ変更
* **RankLabelManager**:
    * CPT 一覧画面として提示 (専用 Block Editor で編集)
* **ContentList**:
    * コンテンツモデルを CPT 化し、CPT 一覧 + 専用 Block Editor で編集
* **並び順**:
    * ICPO により、両 CPT の一覧画面でドラッグ & ドロップ並び替えを提供
* **RankLabel 参照**:
    * ContentList エントリー編集時、RankLabel は定義済み選択候補のコンボボックスとして表示

## ドキュメント一覧

| ファイル | 元 | 主な変更内容 |
|----------|-----|--------------|
| [overview.md](./overview.md) | docs/overview.md | CPT 設計、Block Editor 編集、ICPO 連携の追記 |
| [architecture.md](./architecture.md) | docs/architecture.md | 新 CPT、Block Editor、移行スクリプト、サブメニュー構成 |
| [data_dictionary.md](./data_dictionary.md) | docs/data_dictionary.md | ContentModel の CPT 化、メタキー、データフロー |
| [rest_api_spec.md](./rest_api_spec.md) | docs/rest_api_spec.md | CPT 用 REST の標準利用、残存エンドポイント |
| [block_spec.md](./block_spec.md) | docs/block_spec.md | アライアンス・パートナー編集ブロック、ランクラベル編集ブロック |
| [admin_ui_spec.md](./admin_ui_spec.md) | docs/admin_ui_spec.md | サブボタン構成、CPT 一覧、ICPO、Block Editor 呼び出し |
| [carousel_spec.md](./carousel_spec.md) | docs/carousel_spec.md | CPT 化に伴う子要素数カウント方法の更新 |
| [status.md](./status.md) | docs/status.md | 仕様変更に伴う実装状況の見直し、移行タスク |

## 参照

* 元の仕様書:
    * `docs/` フォルダー
* Intuitive Custom Post Order:
    * https://github.com/hijiriworld/intuitive-custom-post-order
* VK Block Patterns (UI 参考):
    * サブメニュー形式の管理画面の構成
