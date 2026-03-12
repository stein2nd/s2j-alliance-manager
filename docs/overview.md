<!-- 
目的：「プロジェクトの存在理由、概要、基本情報」の明文化
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
* ライセンス: GPL v2以降
* 目的: アライアンス関係にある協力会社のリンク付きバナー (動画含む) を管理し、Front page 等でブロック表示します。
* 特徴:
  * Gutenberg ブロックエディターに対応します。
  * MetaBox により、Classic エディターに対応します。
    * Gutenberg ブロックでの処理内容を基本的に再現します。
  * 管理画面でバナー画像 (または動画)、リンク先 URL、グループ等を保存します。
    * 管理 UI は独自の React コンポーネントで実装します。設計において、[Create Content Model](https://github.com/Automattic/create-content-model) の機能を参考とします。
    * basic 版 / pro 版を視野に入れた設計とします。

**実装状況**: ✅ **完全実装済み** - 全機能が本番環境で稼働中
