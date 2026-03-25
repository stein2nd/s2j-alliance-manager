<!--
目的：「REST API エンドポイント、リクエスト/レスポンス、権限、セキュリティ」の明文化
※ docs_mod: CPT 再設計を反映した修正案
-->

# REST API 仕様

## 9.3. REST API 仕様 (仕様変更案)

データ構造・型定義は [data_dictionary.md](./data_dictionary.md) を参照してください。

### 9.3.1. 標準 WordPress REST API の活用

* **ランクラベル**: `GET/POST /wp-json/wp/v2/s2j_am_rank_label` (CPT の show_in_rest 有効化により自動提供)
* **アライアンス・パートナー**: `GET/POST /wp-json/wp/v2/s2j_am_alliance_partner` (同上)
* **メタフィールド**: 各 CPT のメタキーは REST で公開する場合は `register_post_meta` で登録
* **並び順**: `menu_order` は標準の `order` / `orderby` パラメータで取得可能。ICPO は一覧画面の UI のみを提供し、REST 自体は WordPress 標準に準拠

### 9.3.2. カスタムエンドポイント (継続)

以下のエンドポイントは、設定、FFmpeg、デバッグ用として継続します。

* `GET /wp-json/s2j-alliance-manager/v1/settings`
  * 表示設定 (display_style, alignment, ffmpeg_path) の取得
* `POST /wp-json/s2j-alliance-manager/v1/settings`
  * 表示設定の保存 (content_models 一括保存は廃止)
* `GET /wp-json/s2j-alliance-manager/v1/ffmpeg/settings`
* `POST /wp-json/s2j-alliance-manager/v1/ffmpeg/test`
* `POST /wp-json/s2j-alliance-manager/v1/ffmpeg/generate-poster`
* `GET /wp-json/s2j-alliance-manager/v1/debug-info`

### 9.3.3. 廃止エンドポイント

* `GET /wp-json/s2j-alliance-manager/v1/content-models` → 標準 REST `/wp/v2/s2j_am_alliance_partner` に置換
* `POST /wp-json/s2j-alliance-manager/v1/save-all` → 設定保存と CPT 保存を分離
* `GET /wp-json/s2j-alliance-manager/v1/rank-labels` → 標準 REST `/wp/v2/s2j_am_rank_label` に置換 (または互換用エンドポイントを残す場合は検討)
* `POST /wp-json/s2j-alliance-manager/v1/rank_labels` → 標準 REST に置換

### 9.3.4. セキュリティ

* nonce チェック必須
* 各 CPT の編集権限: `edit_s2j_am_rank_labels`, `edit_s2j_am_alliance_partners` (新規) を適切にチェック
* `manage_options` は設定、FFmpeg、デバッグ用エンドポイントに適用
