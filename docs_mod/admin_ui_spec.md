<!--
目的：「管理画面のレイアウト、各機能」の明文化
※ docs_mod: CPT 再設計・ICPO 連携・サブボタン形式を反映した修正案
-->

# 管理画面の UI 仕様 (仕様変更案)

## 1. 管理画面の全体構成

### 1.1. VK Block Patterns 風のサブボタン形式

* **親メニュー**:
    * 「S2J Alliance Manager」等の名称で、WordPress 管理画面のサイドメニューに親項目を追加します。
* **サブボタン**:
    * 親メニュー配下に次のサブ項目を用意します。
        * **ランクラベル** … CPT `s2j_am_rank_label` の一覧画面へ遷移
        * **アライアンス・パートナー** … CPT `s2j_am_alliance_partner` の一覧画面へ遷移
        * **表示設定** … 表示形式、配置、FFmpeg 設定等のフォーム画面へ遷移
        * (将来拡張) その他のサブ項目を追加可能な構造とします。

### 1.2. 実装方針

* `add_menu_page()` で親メニューを登録し、`add_submenu_page()` で各サブ項目を登録します。
* ランクラベル、アライアンス・パートナーのサブ項目は、それぞれ CPT の `edit.php?post_type=xxx` 相当の URL にリダイレクトするか、同画面をラップした形で提供します。
* 他プラグインからのアクセスを防ぐため、ランクラベル、アライアンス・パートナーの CPT は `show_in_menu` を親メニューの slug に設定し、WordPress 標準の「投稿」「固定ページ」等の一覧には表示されないようにします。

---

## 2. ランクラベル管理 (RankLabelManager)

### 2.1. 一覧画面

* **表示形態**:
    * CPT `s2j_am_rank_label` の、標準的な一覧画面 (WP_List_Table) として表示します。
* **アクセス制御**:
    * 本プラグインの親メニュー配下からのみアクセス可能とし、許可を与えない限り他プラグインからは直接 URL でアクセスされないよう、capability (`edit_s2j_am_rank_labels`) で制御します。
* **並び順**:
    * [Intuitive Custom Post Order (ICPO)](https://github.com/hijiriworld/intuitive-custom-post-order) を利用可能とした場合、一覧画面にドラッグ & ドロップの並び替え UI が表示されます。ICPO が無効の場合は、`menu_order` による表示順を維持します。
* **CPT 登録**:
    * `supports` に `page-attributes` を含め、`menu_order` を利用可能にします。

### 2.2. 編集画面

* **編集 UI**:
    * 一覧から各エントリーの「編集」をクリックすると、**専用 Block Editor** を呼び出します。
* **専用 Block Editor**:
    * `rank-label-edit` ブロックを編集画面のメインコンテンツとして表示します。
* **編集可能な項目**:
    * `title` (ラベル名)
    * `slug`
    * `content` (説明)
    * `thumbnail` (サムネイル画像)
    * ロゴサイズ指定 (`logo_size_type`, `logo_size_value`)
    * Carousel 表示 (`carousel_enabled`)
* **保存**:
    * 標準の Block Editor 保存フローに従い、投稿 (CPT) として保存します。

### 2.3. 旧 React インライン編集の廃止

* 現行の `RankLabelManager.tsx` によるインライン編集は廃止し、CPT 一覧 + Block Editor 編集に統一します。

---

## 3. アライアンス・パートナー管理 (ContentList)

### 3.1. 一覧画面

* **表示形態**:
    * CPT `s2j_am_alliance_partner` の、標準的な一覧画面として表示します。
* **データ保存**:
    * コンテンツモデルは `wp_options` の配列から CPT へ移行し、`wp_posts` に保存します。
* **並び順**:
    * ICPO が有効な場合、一覧画面でドラッグ & ドロップ並び替えが可能です。`orderby=menu_order` で取得します。

### 3.2. 編集画面

* **編集 UI**:
    * 一覧から各エントリーの「編集」をクリックすると、**専用 Block Editor** を呼び出します。
* **専用 Block Editor**:
    * `alliance-partner-edit` ブロックを編集画面のメインコンテンツとして表示します。
* **編集可能な項目**:
    * `frontpage` (Front page への掲出有無)
    * `rank` … **定義済み選択候補のコンボボックス** として表示
        * 選択肢は CPT `s2j_am_rank_label` から取得し、`menu_order` 昇順で表示
        * 選択候補を追加したい場合は、「新しいランクを追加」等のアクションを提供し、クリック時に「RankLabelManager のエントリー編集画面を開きますか ?」の意思確認ダイアログを表示。肯定の場合、新規ランクラベル編集画面へ遷移
    * `logo` (ロゴ画像・動画)
    * `poster` (ポスター画像)
    * `jump_url`
    * `behavior` (jump / modal)
    * `message` (modal 時のメッセージ)

### 3.3. 旧 React インライン編集の廃止

* 現行の `ContentList.tsx` によるインライン編集は廃止し、CPT 一覧 + Block Editor 編集に統一します。

---

## 4. 表示設定 (SettingsForm)

* **表示位置**:
    * サブボタン「表示設定」から表示します。
* **構成**:
    * 現行と同様に、表示形式 (`display_style`)、配置 (`alignment`)、FFmpeg 設定等を提供します。
* **データ保存**:
    * `wp_options` の `s2j_alliance_manager_settings` を利用します。`content_models` は廃止し、CPT からデータを取得します。

---

## 5. ICPO 連携

* **前提**:
    * Intuitive Custom Post Order プラグインがインストール・有効化されていること。
* **設定**:
    * 管理画面の Settings > Intuitive CPO にて、`s2j_am_rank_label` と `s2j_am_alliance_partner` を並び替え対象に登録します。
* **動作**:
    * 両 CPT の一覧画面にドラッグハンドルが表示され、ドラッグ & ドロップで `menu_order` を更新できます。
* **ICPO 未使用時**:
    * プラグインが無効の場合は、従来通り `menu_order` の昇順で表示されます。並び替えは手動で `menu_order` を変更するか、ICPO を有効化することで可能になります。

---

## 6. 共通 UI 仕様

* **メディア・アップローダー**:
    * Block Editor 内で `MediaUploader` 相当のコンポーネントを使用します。
* **メッセージ編集**:
    * `behavior: 'modal'` 時の `message` は、Block Editor 内の TextareaControl 等で編集します。
* **バリデーション**:
    * 保存前のバリデーション、エラーメッセージ表示は Block Editor 内で実装します。
* **国際化**:
    * 全ラベル・メッセージを `__()` / `_e()` でラップします。
* **アクセシビリティ**:
    * ARIA 属性、キーボード・ナビゲーション、フォーカス管理を適切に実装します。
