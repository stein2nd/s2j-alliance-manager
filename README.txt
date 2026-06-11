=== S2J Alliance Manager ===
Contributors: stein2nd
Tags: gutenberg, blocks, alliance, partners, management, banners, logos, videos
Requires at least: 6.3
Tested up to: 6.8
Requires PHP: 8.2
Stable tag: 2.0.0
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

== Description ==

S2J Alliance Manager は、ロゴや動画付きの提携パートナーバナーを管理するために設計された、包括的な WordPress プラグインです。Gutenberg ブロックと Classic エディターの両方をサポートし、バナーとランクの直感的で柔軟な管理のためのモダンな React ベースの管理インターフェースを提供します。

このプラグインは、React v19.2、TypeScript v5.9、Vite v7.2などの現代的なウェブ技術で構築されており、最適なパフォーマンスと保守性を実現しています。WordPress 環境での互換性を確保するため、`@wordpress/element` を使用して React コンポーネントをレンダリングしています。

= 特徴 =

* **Gutenberg ブロック対応**: カスタマイズ可能な表示オプションを備えた、モダンなブロックエディタとの統合
* **Classic エディタ対応**: 従来の WordPress 編集体験を実現する、MetaBox との統合
* **動的ランク管理**: カスタム投稿タイプベースのランクラベルシステム (リアルタイム更新対応)
* **メディア管理**: 画像と動画の両方に対応し、自動ポスター生成機能を搭載
* **レスポンシブ・デザイン**: あらゆるデバイスと画面サイズに最適化された表示

= 管理機能 =

* **直感的な管理 UI**: リアルタイム更新対応の、React ベース管理インターフェース
* **インライン編集**: ランクラベルとパートナー情報の直接編集
* **視覚的フィードバック**: 変更箇所のハイライト表示と、行番号表示による UX 向上
* **一括操作**: 効率的な管理のための保存・キャンセル機能
* **メディア統合**: サムネイル・プレビュー付き WordPress メディア・ライブラリ連携

* **国際化**: `.pot` ファイル生成による完全な i18n サポート
* **REST API**: データ管理のための包括的な API エンドポイント

= 技術的特徴 =

* **TypeScript 対応**: 完全な型安全性と、強化された開発体験
* **モダンなビルドシステム**: Vite によるホット・リロード対応ビルドプロセス
* **コード品質**: 一貫したコードのための ESLint と Stylelint 統合
* **国際化**: `.pot` ファイル生成による完全な i18n サポート
* **REST API**: データ管理のための包括的な API エンドポイント

= 表示オプション =

* **シングル・カラム・グリッド**: 集中したプレゼンテーションのための、シンプルな単一カラムレイアウト
* **マルチ・カラム・グリッド**: 画面サイズに応じて適応する、レスポンシブ・グリッドレイアウト
* **Masonry レイアウト**: Pinterest スタイルの masonry (石畳) レイアウト (Pro 版で計画中)

== License ==

このプロジェクトは GPL v3以降の下でライセンスされています - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

== Privacy Policy ==

このプラグインは個人データを収集、保存、送信しません。すべてのデータは WordPress データベースにローカルで保存され、第三者と共有されることはありません。

== Support and Contact ==

サポート、機能リクエスト、またはバグ報告については、[GitHub Issues](https://github.com/stein2nd/s2j-alliance-manager/issues) ページをご覧ください。

---

== Installation ==

= 前提条件 =

* WordPress 6.3 以降 (Gutenberg v15.2対応のため)
* PHP v7.4 以降
* JavaScript が有効な最新のウェブブラウザ
* Node.js v18 以降 (React v19.2対応のため)
* npm または yarn

= 簡単インストール =

1. プラグインフォルダを WordPress の `/wp-content/plugins/` ディレクトリにアップロードします。
2. WordPress 管理画面の「プラグイン」メニューから有効化します。
3. 「設定」→「S2J Alliance Manager」から設定を開始します。

= 開発インストール =

```zsh
# リポジトリをクローンする
git clone https://github.com/stein2nd/s2j-alliance-manager.git

# プラグイン・ディレクトリに移動する
cd s2j-alliance-manager

# 依存関係をインストールする
npm install --legacy-peer-deps

# プラグインをビルドする
npm run build:production
```

== Usage ==

= ランクラベルの設定 =

1. **設定 → S2J Alliance Manager** に移動します。
2. **Rank Management** セクションで、ランクラベルを追加します (例: プラチナ、ゴールド、シルバー、ブロンズ、スチール、マイクロ)。内部的にカスタム投稿タイプ `s2j_am_rank_label` として管理されます。
3. 表示順序を設定し、説明を追加します。
4. 変更を保存します。

= 提携パートナーの追加 =

1. **Partner Management** セクションで、**Add New Partner** をクリックします。
2. ロゴまたは動画ファイルをアップロードします。
3. 設定済みの選択肢から、パートナーのランクを設定します。
4. ジャンプ先 URL またはモーダル・メッセージを追加します。
5. 表示動作を選択します (「URL へジャンプ」または「モーダル表示」)。
6. 変更を保存します。

= Gutenberg ブロックの使用方法 =

1. ブロックエディタで投稿またはページを編集します。
2. **+** ボタンをクリックして、ブロックインサーターで、**"Alliance Banner"** を検索して、新しいブロックを追加します。
3. 希望の表示スタイルを選択します。
4. コンテンツを公開または更新します。

= Classic エディタでの使用方法 =

1. Classic エディタで投稿またはページを編集します。
2. サイドバーにある **Alliance Banner** メタボックスを探します。
3. 希望の表示スタイルを選択します。
4. **Insert Alliance Banner** をクリックします。
5. コンテンツを公開または更新します。

= ショートコードとテーマテンプレート (Classic テーマ、ブロックテーマ共通) =

投稿本文やウィジェット以外に、PHP テンプレートから次のように埋め込んでも問題ありません。

`
echo do_shortcode( '[alliance_banner displayStyle="grid-multi" alignment="center"]' );
`

バナー用の CSS とフロント用スクリプトは、**実際にバナーがレンダリングされるタイミング** (ブロックの render_callback またはショートコード処理の共通関数内) で `wp_enqueue_*` されます。本文にショートコードやブロックがないページでは読み込まれません。

`block.json` の `viewScript` は WordPress v6.1以降で解釈されます。本プラグインの動作要件は WordPress v6.3以降のため、ブロック経由の宣言的なスクリプト読み込みもこの要件内で利用できます。

== Frequently Asked Questions ==

= このプラグインは、ページビルダーと互換性がありますか ? =

はい、このプラグインは Gutenberg ブロックとショートコードの両方をサポートしているため、ほとんどのページビルダーと互換性があります。

= 動画をパートナーロゴとして使用できますか ? =

はい、このプラグインは画像と動画の両方をサポートしています。動画の場合、(FFmpeg 導入可能環境では) FFmpeg を使用して自動的にポスター画像を生成できます。

= プラグインは翻訳対応済みですか ? =

はい、プラグインは完全に翻訳対応済みで、`.pot` ファイル生成をサポートしています。

= 必要な WordPress のバージョンは ? =

Gutenberg ブロックエディタとの最適な互換性のため、WordPress v6.3以降が必要です。フロント表示向けの `block.json` `viewScript` は WordPress v6.1以降で解釈されますが、プラグイン全体としては v6.3未満は対象外です。

= パートナーランクはどのように管理しますか ? =

プラグイン設定の「ランク管理」セクションを使用して、カスタムランクラベル (例: ゴールド、シルバー、ブロンズ) を作成・管理します。これらのランクはパートナー管理インターフェースに自動的に表示されます。

= 表示レイアウトをカスタマイズできますか ? =

はい、シングル・カラム・グリッド、マルチ・カラム・グリッドから選択できます。ブロック設定で追加のカスタマイズ・オプションが利用可能です。

== Screenshots ==

1. **管理インターフェース**: 直感的なパートナー管理機能を備えた、モダンな React ベースの管理インターフェース
2. **Gutenberg ブロック**: WordPress ブロックエディタとの、シームレスな統合
3. **フロントエンド表示**: フロントエンドでの、レスポンシブ対応パートナーバナー表示
4. **ランク管理**: 柔軟なランクラベル管理システム
5. **メディア・アップロード**: WordPress メディア・ライブラリとの統合 (サムネイル・プレビュー付き)

---

== Development ==

= 技術スタック =

* **フロントエンド**:
    * React v19.2、TypeScript v5.9、SCSS v1.94
* **ビルドツール**:
    * Vite 7.1
* **コード品質**:
    * ESLint 9.36、Stylelint 16.24
* **WordPress**:
    * Gutenberg
    * API Fetch v7.29、Block Editor v15.2、Blocks v15.2、Component Reference v30.2、Data v10.29、Element v6.29、Internationalization (i18n) v6.2、Scripts v31.0、URL v4.29

= プロジェクト構造 =

```
s2j-alliance-manager/
├─── includes/        # PHP クラス群
├┬── src/             # TypeScript/React ソース
│├┬─ admin/           # 管理インターフェース・コンポーネント
││├─ components/      # React コンポーネント
││└─ data/            # 定数定義
│├┬─ gutenberg/       # Gutenberg ブロック実装
││└─ alliance-banner  # ブロック定義
│├── classic/         # Classic エディタサポート
│├── styles/          # SCSS スタイルシート
│└── types/           # TypeScript 型定義
├┬── dist/            # ビルド成果物
│├┬─ blocks
││└─ alliance-banner  # ブロック定義
│├── css/             # プラグイン用のスタイル定義
│└── js/              # プラグイン用の Gutenberg ブロック、設定画面
└─── languages/       # 翻訳ファイル
```

= 開発環境のセットアップ =

```zsh
# 依存関係をインストールする
npm install --legacy-peer-deps

# linting を実行する
npm run lint

# 開発ビルド (非 minify 版) を開始する
npm run build:dev

# 翻訳ファイルを生成する
npm run makepot
```

= その他のコマンド =

```zsh
# watch モードで開発ビルドを開始する
npm run dev

# 本番ビルド (minify 版) を開始する
npm run build:production
```

= セキュリティ =

* nonce チェックが必須です。
* 基本設定の管理には、`manage_options` 権限が必要です。
* ランクラベル管理には `edit_s2j_am_rank_labels` 権限が必要です (管理者に自動付与)。

= WordPress 環境での React 互換性 =

このプラグインは React v19.2 を使用していますが、WordPress 環境では `@wordpress/element` を使用して React コンポーネントをレンダリングすることで、互換性を確保しています。

* **JSX 変換**: `tsconfig.json` の `jsx` オプションを `"react"` に設定し、JSX を `React.createElement` に変換しています。
* **WordPress の React を使用**: `wp.element` から `React` オブジェクトを構築し、グローバル変数として設定しています。
* **@wordpress/element の render 関数**: WordPress が提供する React v18 を使用するため、`@wordpress/element` の `render` 関数を使用しています。

**注意事項**: 同様の問題が発生した場合は、ビルド時に使用された React と実行時に使用される React のバージョンが一致しているか確認してください。WordPress 環境では、`@wordpress/element` を使用することで互換性を保つことができます。

= データフローと状態管理 (アーキテクチャ) =

* **親コンポーネント管理**: AllianceManagerAdmin クラスで、ランクラベルデータを一元管理
* **リアルタイム同期**: ランクラベル保存後、ContentList の rank 選択肢を即座に更新
* **状態の分離**: ランクラベル管理とメインコンテンツ管理は、独立した状態管理
* **視覚的フィードバック**: 保留中の変更は、背景色のハイライトで視覚化

= データフローと状態管理 (データの流れ) =

```
AllianceManagerAdmin (親コンポーネント)
├─ RankLabelManager → ランクラベル管理・保存時に親に通知
└─ ContentList → 親からランクラベルを受け取り、選択肢を生成
```

= REST API エンドポイント =

* `GET /wp-json/s2j-alliance-manager/v1/settings` - プラグイン設定を取得
* `POST /wp-json/s2j-alliance-manager/v1/save-all` - 設定とコンテンツモデルを保存
* `GET /wp-json/s2j-alliance-manager/v1/content-models` - パートナーリストを取得
* `GET /wp-json/s2j-alliance-manager/v1/rank-labels` - ランクラベルを取得
* `POST /wp-json/s2j-alliance-manager/v1/rank-labels` - ランクラベルを保存
* `GET /wp-json/s2j-alliance-manager/v1/ffmpeg/settings` - FFmpeg の設定を取得
* `POST /wp-json/s2j-alliance-manager/v1/ffmpeg/test` - FFmpeg の利用可能性をテスト
* `POST /wp-json/s2j-alliance-manager/v1/ffmpeg/generate-poster` - 動画ポスターを生成する

= データモデル (ランクラベル) =

```typescript
interface RankLabel {
  id: number;
  title: string;
  content: string;
  thumbnail_id: number;
  menu_order: number;
  slug: string;
}
```

= データモデル (パートナーリスト) =

```typescript
interface ContentModel {
  frontpage: 'YES' | 'NO';
  rank: string;
  logo: number;        // WordPress attachment ID
  poster: number;      // Video poster attachment ID
  jump_url: string;
  behavior: 'jump' | 'modal';
  message: string;
}
```

== Contributing ==

貢献をお待ちしています ! 以下の手順に従ってください:

1. リポジトリをフォークしてください。
2. 機能ブランチを作成してください (`git checkout -b feature/amazing-feature`)。
3. 変更をコミットしてください (`git commit -m 'Add some amazing feature'`)。
4. 機能ブランチにプッシュしてください (`git push origin feature/amazing-feature`)。
5. Pull Request を開いてください。

*詳細な情報については、[SPEC.md](SPEC.md) ファイルを参照してください。*

= 開発ガイドライン =

* 既存のコードスタイルに従ってください。
* 新機能には、TypeScript 型を追加しましょう。
* 新機能には、テストを含めましょう。
* 必要に応じて、ドキュメントを更新してください。

== Contributors & Developers ==

**"S2J Alliance Manager"** はオープンソース・ソフトウェアです。以下の皆様がこのプラグインに貢献しています。

* **開発者**: Koutarou ISHIKAWA

---

== Changelog ==

= 2.0.0 =
* 破壊的変更: ライセンスを GPL v2 から GPL v3 に変更
* ランクごとにカルーセル表示を指定可能に
* React 18 から React 19 へ更新
* 配布 zip 生成スクリプトと GitHub ワークフローを追加
* 仕様書を docs/ 配下の個別ドキュメントに細分化
* S2J Docs Linter によるドキュメント lint を導入
* 管理 UI・Gutenberg ブロック・フロントエンド表示の各種改善
* 依存 npm モジュールの更新

= 1.0.0 =
* 初回リリース
* Gutenberg ブロック対応
* Classic エディタ統合
* React ベースの管理インターフェース
* ランクラベル管理システム
* メディア・アップロードと管理
* レスポンシブ・デザイン
* 国際化対応
* REST API エンドポイント
* 動画ポスター生成のための FFmpeg 統合

== Upgrade Notice ==

= 2.0.0 =
ライセンスが GPL v3 に変更されました。再配布・改変を行う場合は GPL v3 の条件に従ってください。

= 1.0.0 =
S2J Alliance Manager の初回リリース。このバージョンには、最新の WordPress 統合による提携パートナーバナー管理のための全コア機能が含まれています。
