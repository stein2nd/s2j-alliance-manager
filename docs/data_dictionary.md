<!--
目的：「モデルの型、設定配列、CPT、メタキー、option、データフロー」の明文化
-->

# データ辞書

## 9. データ構造、型定義、データフロー

本章では、「データ関連」のうちデータ構造・型定義・データフローを記載します。REST API 仕様は [rest_api_spec.md](./rest_api_spec.md) を参照してください。

### 9.1. データ構造と型定義 (**実装状況**: ✅完全実装済み - 全型定義が実装済み)

* **設定データの拡張**:
  ```php
  $settings = array(
      'display_style' => 'grid-single',
      'alignment' => 'center',
      'ffmpeg_path' => '',  // 新規追加
      'content_models' => array()
  );
  ```

* **型定義の追加**:
  * `FFmpegSettings`: FFmpeg 設定用インターフェイス
  * `FFmpegTestResult`: FFmpeg テスト結果用インターフェイス
  * `WordPressMedia`: WordPress メディア情報用インターフェイス
* **RankLabel 型定義の詳細** (**実装状況**: ✅100% 完了):

  ```typescript
  export interface RankLabel {
    id: number;
    title: string;
    content: string;
    thumbnail_id: number;
    menu_order: number;
    slug: string;
    logo_size_type?: 'none' | 'width' | 'height'; // ロゴサイズの指定タイプ
    logo_size_value?: number; // ロゴサイズの値 (width または height)
    carousel_enabled?: boolean; // Carousel 表示の有効/無効
  }
  ```

  * `logo_size_type`: ロゴサイズの指定タイプ
    * `'none'`: サイズ指定なし (既存の CSS に従う)
    * `'width'`: 横幅を指定
    * `'height'`: 縦高を指定
  * `logo_size_value`: ロゴサイズの値 (ピクセル単位)
    * `logo_size_type` が `'width'` の場合: 横幅のピクセル値
    * `logo_size_type` が `'height'` の場合: 縦高のピクセル値
    * `logo_size_type` が `'none'` の場合: `0` または未設定
  * `carousel_enabled`: Carousel 表示の有効/無効
    * `true`: Carousel 表示を有効化 (子要素数が4〜8の場合のみ有効)
    * `false`: Carousel 表示を無効化 (通常のグリッド表示)
    * `undefined`: 未設定 (通常のグリッド表示)
    * **実装状況**: ✅100% 完了 - REST API、PHP 側のデータ取得・保存、フロントエンド表示制御が実装済み
* **ContentModel 型定義の詳細**:

  ```typescript
  export interface ContentModel {
    frontpage: 'YES' | 'NO';
    rank: string;
    logo: number; // WordPress attachment ID
    logo_url?: string; // WordPress attachment URL
    poster: number; // WordPress attachment ID for video poster
    poster_url?: string; // WordPress attachment URL for video poster
    jump_url: string;
    behavior: 'jump' | 'modal';
    message: string;
    logo_size_type?: 'none' | 'width' | 'height'; // ロゴサイズの指定タイプ (ランクから継承)
    logo_size_value?: number; // ロゴサイズの値 (ランクから継承)
  }
  ```

  * `logo_size_type`: ランクラベルから継承されるロゴサイズの指定タイプ
  * `logo_size_value`: ランクラベルから継承されるロゴサイズの値
  * PHP 側の `prepare_content_models()` メソッドで、各コンテンツモデルの `rank` に対応するランクラベルからロゴサイズ情報を取得し、ContentModel に追加
  * `poster: number` - ポスター画像の添付ファイル ID (0 = 未選択)
  * ポスターノティス表示判定に使用される重要なフィールド
* **データ保存**:
  * ランクラベルのロゴサイズ情報は、カスタム投稿タイプ `s2j_am_rank_label` のメタデータとして保存されます:
    * `_logo_size_type`: サイズ指定タイプ (`'none'`, `'width'`, `'height'`)
    * `_logo_size_value`: サイズ値 (整数、ピクセル単位)
  * ランクラベルの Carousel 設定は、カスタム投稿タイプ `s2j_am_rank_label` のメタデータとして保存されます:
    * `_carousel_enabled`: Carousel 表示の有効/無効 (`true` または `false`)
    * **実装状況**: ✅100% 完了 - `RestController.php` の `save_rank_labels()` メソッドで実装済み
* **データ取得**:
  * REST API エンドポイント `GET /wp-json/s2j-alliance-manager/v1/rank-labels` でランクラベル情報とともにロゴサイズ情報、Carousel 設定を取得
  * フロントエンド表示時、PHP 側でコンテンツモデルを準備する際に、各ランクに対応するロゴサイズ情報を取得し、ContentModel に追加
  * フロントエンド表示時、PHP 側の `AllianceManager.php` の `get_rank_carousel_map()` メソッドで各ランクに対応する Carousel 設定を取得し、ランク別の表示制御に使用

### 9.2. データフローと状態管理 (**実装状況**: ✅完全実装済み - すべての状態管理の機能が実装済み)

* **データフロー**: 親コンポーネント (AllianceManagerAdmin) でランクラベル・データを一元管理し、データの整合性を保証します。
* **リアルタイム連携**: ランクラベル保存後、即座に ContentList の rank 選択肢が更新されます。
* **状態管理**: ランクラベル管理とメインコンテンツ管理は、独立した状態管理とし、保留中の変更は視覚的にハイライト表示され、保存・キャンセル操作が可能です。
* **権限管理**: 管理者権限に `edit_s2j_am_rank_labels` 権限を自動付与します。
* **ロゴサイズ情報の伝播**: ランクラベルで設定されたロゴサイズ情報は、フロントエンド表示時に自動的に各コンテンツモデルに反映されます。
* **Carousel 設定の伝播**: ランクラベルで設定された Carousel 設定は、フロントエンド表示時に自動的に各ランクの表示制御に反映されます。
* **子要素数の動的管理**: コンテンツモデルの変更時に、各ランクの子要素数を再計算し、Carousel 設定の有効/無効を動的に更新します。
