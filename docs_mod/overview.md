<!-- 
目的：「プロジェクトの存在理由、概要、基本情報」の明文化
※ docs_mod: CPT 再設計・ICPO 連携を反映した修正案
 -->

# 概要

## はじめに

* 本ドキュメントでは、WordPress プラグイン「s2j-alliance-manager」の専用仕様を定義します。
* 本プラグインの設計は、以下の共通 SPEC に準拠します。
    * [WP_PLUGIN_SPEC.md (共通仕様)](https://github.com/stein2nd/wp-plugin-spec/blob/main/docs/WP_PLUGIN_SPEC.md)

---

## 1. プラグイン概要

本章では、「基本情報」を記載します。

* 名称: S2J Alliance Manager
* プラグイン・スラッグ: s2j-alliance-manager
* テキスト・ドメイン: s2j-alliance-manager
* ライセンス: GPL v3以降
* 目的: アライアンス関係にある協力会社のリンク付きバナー (動画含む) を管理し、Front page 等でブロック表示します。
* 特徴:
  * Gutenberg ブロックエディターに対応します。
  * MetaBox により、Classic エディターに対応します。
    * Gutenberg ブロックでの処理内容を基本的に再現します。
  * 管理画面でバナー画像 (または動画)、リンク先 URL、グループ等を保存します。
  * **【仕様変更案】管理画面は次の構成を採用します:**
    * VK Block Patterns 風のサブボタン形式 (親メニュー配下に「ランクラベル」「アライアンス・パートナー」等のサブ項目)
    * ランクラベル、アライアンス・パートナーは、それぞれ CPT 一覧画面で表示し、一覧から専用 Block Editor を呼び出して編集
    * 並び順は [Intuitive Custom Post Order (ICPO)](https://github.com/hijiriworld/intuitive-custom-post-order) によりドラッグ & ドロップで変更可能
  * basic 版 / pro 版を視野に入れた設計とします。

**実装状況**: 現行実装は ✅ 完全実装済み。上記【仕様変更案】は docs_mod として検討中。
