<!--
目的：「モデルの型、設定配列、CPT、メタキー、option、データフロー」の明文化
※ docs_mod: CPT 再設計・ICPO 連携を反映した修正案
-->

# データ辞書

## 9. データ構造、型定義、データフロー

本章では、「データ関連」のうちデータ構造・型定義・データフローを記載します。REST API 仕様は [rest_api_spec.md](./rest_api_spec.md) を参照してください。

### 9.1. カスタム投稿タイプ (CPT)

#### 9.1.1. s2j_am_rank_label (ランクラベル) — 現行維持・一部変更

* **説明**: ランク (プラチナ、ゴールド等) の定義。現行 CPT を維持。
* **変更点**: `show_ui` を有効化し、サブメニューから CPT 一覧にアクセス可能とする。他プラグインからの直接アクセスは capability で制御。
* **並び順**: `menu_order`。ICPO が有効なら一覧画面でドラッグ & ドロップ可能。
* **サポート**: `title`, `editor`, `thumbnail`, `page-attributes`

**メタキー**:
* `_logo_size_type`: `'none'` | `'width'` | `'height'`
* `_logo_size_value`: 整数 (ピクセル)
* `_carousel_enabled`: boolean
* `_background_color`: 色指定 (任意)

#### 9.1.2. s2j_am_alliance_partner (アライアンス・パートナー) — 新規 CPT

* **説明**: 現行のコンテンツモデル (ContentModel) を CPT 化したもの。
* **保存先**: `wp_posts` (post_type = `s2j_am_alliance_partner`)
* **並び順**: `menu_order`。ICPO が有効なら一覧画面でドラッグ & ドロップ可能。
* **サポート**: `title` (任意)、`page-attributes` (menu_order)

**メタキー** (現行 ContentModel のフィールドをメタに移行):
* `_frontpage`: `'YES'` | `'NO'`
* `_rank`: ランクラベルの slug または post_id 参照
* `_logo`: 添付ファイル ID (画像/動画)
* `_poster`: 添付ファイル ID (ポスター画像)
* `_jump_url`: 遷移先 URL
* `_behavior`: `'jump'` | `'modal'`
* `_message`: モーダル表示用テキスト

### 9.2. 設定データ (wp_options) — 継続

* **s2j_alliance_manager_settings**:
  ```php
  array(
      'display_style' => 'grid-single',
      'alignment' => 'center',
      'ffmpeg_path' => '',
      // content_models は廃止。CPT に移行。
  );
  ```

### 9.3. 型定義 (TypeScript)

#### RankLabel (現行維持)

```typescript
export interface RankLabel {
  id: number;
  title: string;
  content: string;
  thumbnail_id: number;
  menu_order: number;
  slug: string;
  logo_size_type?: 'none' | 'width' | 'height';
  logo_size_value?: number;
  carousel_enabled?: boolean;
}
```

#### ContentModel / AlliancePartner (CPT 化後)

```typescript
export interface AlliancePartner {
  id: number;           // post ID
  menu_order: number;
  frontpage: 'YES' | 'NO';
  rank: string;         // ランクラベル slug または ID
  logo: number;
  poster: number;
  jump_url: string;
  behavior: 'jump' | 'modal';
  message: string;
  logo_size_type?: 'none' | 'width' | 'height';  // ランクから継承
  logo_size_value?: number;
}
```

### 9.4. データフロー (仕様変更案)

* **ランクラベル**: CPT `s2j_am_rank_label` から `get_posts` (orderby: menu_order)
* **アライアンス・パートナー**: CPT `s2j_am_alliance_partner` から `get_posts` (orderby: menu_order)
* **ランク別グルーピング**: 各パートナーの `_rank` メタでランクに紐付け、ランクラベルの `menu_order` 順に表示
* **フロント表示**: AllianceManager が両 CPT を取得し、現行と同様の構造に変換してレンダリング
* **RankLabel 参照**: パートナー編集時、`s2j_am_rank_label` の一覧を選択候補としてコンボボックス表示

### 9.5. 移行 (オプション → CPT)

* **対象**: `s2j_alliance_manager_settings['content_models']`
* **移行先**: `s2j_am_alliance_partner` の投稿
* **移行スクリプト**: `includes/Migration.php` で実装。プラグイン有効化時または専用ツールで実行。
