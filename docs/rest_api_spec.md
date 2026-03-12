<!--
目的：「REST API エンドポイント、リクエスト/レスポンス、権限、セキュリティ」の明文化
-->

# REST API 仕様

## 9.3. REST API 仕様 (**実装状況**: ✅完全実装済み)

データ構造・型定義は [data_dictionary.md](./data_dictionary.md) を参照してください。

### 9.3.1. エンドポイント

* `GET /wp-json/s2j-alliance-manager/v1/settings`
  * 管理画面の設定取得
* `GET /wp-json/s2j-alliance-manager/v1/content-models`
  * 登録済みモデル一覧取得
* `POST /wp-json/s2j-alliance-manager/v1/save-all`
  * 設定+モデル一括保存
* `GET /wp-json/s2j-alliance-manager/v1/rank-labels`
  * ランクラベル一覧取得
  * レスポンスに `logo_size_type` と `logo_size_value` を含む
  * レスポンスに `carousel_enabled` を含む
  * **実装状況**: ✅100% 完了 - `RestController.php` の `get_rank_labels()` メソッドで実装済み
* `POST /wp-json/s2j-alliance-manager/v1/rank_labels`
  * ランクラベル一括保存
  * リクエストボディに `logo_size_type`、`logo_size_value`、`carousel_enabled` を含む
  * 保存時に、子要素数が4〜8の範囲外の場合、`carousel_enabled` を `false` に強制設定
  * **実装状況**: ✅100% 完了 - `RestController.php` の `save_rank_labels()` メソッドで実装済み
  * **サニタイズ**: `sanitize_rank_labels()` メソッドで `carousel_enabled` を boolean 型にサニタイズ
* `GET /wp-json/s2j-alliance-manager/v1/ffmpeg/settings`
  * FFmpeg 設定取得
* `POST /wp-json/s2j-alliance-manager/v1/ffmpeg/test`
  * FFmpeg 利用可能性テスト
* `POST /wp-json/s2j-alliance-manager/v1/ffmpeg/generate-poster`
  * ポスター画像生成
* `GET /wp-json/s2j-alliance-manager/v1/debug-info`
  * デバッグ情報取得

### 9.3.2. ポスター画像関連エンドポイント

* `GET /wp-json/wp/v2/media?parent={video_id}&mime_type=image/jpeg&per_page=1`
  * 動画ファイルに対応するポスター画像の存在確認
  * パラメータ: `parent` (動画の添付ファイル ID)、`mime_type` (画像タイプ)、`per_page` (取得件数)

### 9.3.3. セキュリティ

* nonce チェック必須
* `current_user_can( 'manage_options' )` 権限がある場合のみ利用可
