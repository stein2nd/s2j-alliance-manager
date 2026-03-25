<!--
目的：「Carousel の子要素数カウント、有効条件、フロント表示、バリデーション」の明文化
※ docs_mod: CPT 化に伴い、子要素数カウント方法を WP_Query ベースに更新
-->

# Carousel 仕様 (仕様変更案)

## 付録: Carousel 機能の実装詳細

### A.1. 子要素数のカウント方法 (CPT 化後)

* **カウント対象**: 各ランクに属するアライアンス・パートナー (CPT `s2j_am_alliance_partner`) のうち、`frontpage='YES'` のメタを持つレコード数
* **カウントタイミング**:
  * 管理画面の表示時: ランクラベル編集画面で Carousel 設定を表示する際に、該当ランクに属するパートナー数をカウント
  * アライアンス・パートナー変更時: パートナーの追加・削除・ランク変更時に再カウント
  * ランク変更時: パートナーのランク変更時に再カウント
* **カウント方法 (CPT 化後)**:
  * `s2j_am_alliance_partner` を `WP_Query` で取得
  * メタキー `_rank` が該当ランクのスラッグ/ID と一致するものをフィルター
  * メタキー `_frontpage` が `'YES'` のもののみカウント
  * または、タクソノミーでランクを紐付ける設計の場合: タームでフィルターし、`_frontpage='YES'` のものをカウント

```php
// 例: ランク $rank_slug に属する frontpage=YES のパートナー数
$count = new WP_Query(array(
    'post_type' => 's2j_am_alliance_partner',
    'post_status' => 'publish',
    'meta_query' => array(
        array('key' => '_rank', 'value' => $rank_slug),
        array('key' => '_frontpage', 'value' => 'YES'),
    ),
    'fields' => 'ids',
));
$child_count = $count->found_posts;
```

### A.2. Carousel 設定の有効/無効判定

* **有効条件**: 子要素数が4以上8以下
* **無効条件**: 子要素数が4未満または8超過
* **判定タイミング**:
  * ランクラベル編集画面の表示時: Block Editor 内で Carousel チェックボックスを表示する際に判定
  * アライアンス・パートナー変更時: 変更が保存されたら、該当ランクの子要素数が変動するため、次回表示時に再判定
  * 保存時: ランクラベル保存前に最終判定し、範囲外の場合は `carousel_enabled=false` に強制設定

### A.3. フロントエンド Carousel 表示の実装

* **表示条件**: 現行と同様
  * `carousel_enabled=true` かつ
  * 子要素数が4以上8以下
* **データ取得**: CPT `s2j_am_alliance_partner` を `WP_Query` で取得し、ランクごとにグループ化。`orderby=menu_order`、`order=ASC` で並び順を制御
* **表示方法**: 現行と同様 (自動スライド、ナビゲーション、インジケータ、タッチスワイプ、無限ループ等)
* **フォールバック**: 条件を満たさない場合、通常のグリッド表示にフォールバック

### A.4. バリデーションルール

* **ランクラベル編集画面でのバリデーション**:
  * 子要素数が4未満または8超過の場合、Carousel チェックボックスを無効化
  * 無効化時の理由をヘルプテキストで表示
* **保存時のバリデーション**:
  * 子要素数が4未満または8超過の場合、`_carousel_enabled` を `false` に強制設定
