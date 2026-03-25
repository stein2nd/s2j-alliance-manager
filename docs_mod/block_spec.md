<!--
目的：「Gutenberg ブロックの属性、フロント表示、Classic 対応方針」の明文化
※ docs_mod: CPT 再設計・専用 Block Editor 編集を反映した修正案
-->

# ブロック仕様

## 7. Gutenberg ブロック対応、Classic エディター対応

### 7.1. フロント表示ブロック「Alliance Banner」— 継続

現行の仕様を維持します。データ取得元のみ CPT に変更されます。

* REST API 経由またはサーバーサイドで、`s2j_am_rank_label` と `s2j_am_alliance_partner` を取得
* `rank` でグルーピングし、`menu_order` 順に表示
* 表示形式、配置、Carousel 等は現行と同様

### 7.2. 編集用ブロック (新規)

#### 7.2.1. ランクラベル編集ブロック (rank-label-edit)

* **用途**: CPT `s2j_am_rank_label` の編集画面で使用する専用 Block Editor ブロック
* **表示場所**: ランクラベル一覧から「編集」をクリックしたときの編集画面
* **フィールド**:
  * **TextControl**: `title` (ラベル名)
  * **TextControl**: `slug`
  * **TextareaControl**: `content` (説明)
  * **MediaUploader**: `thumbnail` (サムネイル画像)
  * **RadioControl**: `logo_size_type` (none / width / height)
  * **TextControl (NumberInput)**: `logo_size_value`
  * **CheckboxControl**: `carousel_enabled`
* **保存**: 標準のブロックエディター保存フローに従い、投稿とメタを更新

#### 7.2.2. アライアンス・パートナー編集ブロック (alliance-partner-edit)

* **用途**: CPT `s2j_am_alliance_partner` の編集画面で使用する専用 Block Editor ブロック
* **表示場所**: アライアンス・パートナー一覧から「編集」をクリックしたときの編集画面
* **フィールド**:
  * **CheckboxControl**: `frontpage` (YES/NO)
  * **SelectControl (コンボボックス)**: `rank` — 定義済みランクラベルを選択候補として表示
    * 選択候補は `s2j_am_rank_label` の `menu_order` 順に取得
    * 新規ランクを追加したい場合は、「RankLabelManager のエントリー編集を開きますか ?」と意思確認し、肯定ならランクラベル新規作成/編集画面へ遷移
  * **MediaUploader**: `logo` (画像/動画)
  * **MediaUploader**: `poster` (ポスター画像、動画時)
  * **TextControl**: `jump_url`
  * **SelectControl**: `behavior` (jump / modal)
  * **TextareaControl**: `message` (behavior=modal 時)
* **保存**: 投稿とメタを更新。ロゴサイズ情報はランクから継承 (フロント表示時)

### 7.3. Classic エディター対応 — 継続

* 現行のショートコード、MetaBox は継続
* データ取得元が CPT に変更されるため、AllianceManager 側のデータ取得ロジックを更新
