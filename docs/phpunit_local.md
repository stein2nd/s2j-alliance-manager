# S2J Alliance Manager - PHPUnit (wp-env / Docker なし)

## 正本

MySQL / `svn` / `.env.tests`、Local の socket、開発 DB `local` を使わない方針は **[wp-plugin-spec: PHPUNIT_LOCAL.md](https://github.com/stein2nd/wp-plugin-spec/blob/main/docs/PHPUNIT_LOCAL.md)** を参照してください。

本ファイルは **S2J Alliance Manager** 固有の件数・コマンドのみを書きます。

## テスト構成 (5件)

| 種別 | 件数 | 設定 | 主な対象 |
| --- | --- | --- | --- |
| ユニット | 3 | `phpunit.unit.xml.dist` | `RestController` の `sanitize_*` (`tests/phpunit/Unit/RestControllerSanitizeUnitTest.php`)。**DB 不要** |
| 統合 | 2 | `phpunit.xml.dist` | `RestControllerTest` (REST `/settings` 権限・デフォルト値)。**`wordpress_test` のみ** |

## 実行コマンド

| コマンド | 件数 | 備考 |
| --- | --- | --- |
| `npm run test:unit:php:unit-only` | 3 | PHP + Composer のみ |
| `npm run test:unit:php:local` | 5 | `bin/phpunit-local.sh` (初回は MySQL + `svn` で WP テスト lib 取得) |
| `npm run test:smoke:local` | — | Local 実サイト上の WP-CLI スモーク (`tests/smoke-local.sh`) |
| `composer test:unit` / `composer test:all` | 3 / 5 | Node 不要 |

```bash
composer install
cp .env.tests.example .env.tests   # 正本に従い編集
npm run test:unit:php:local
```

## 関連ファイル

| パス | 役割 |
| --- | --- |
| `phpunit.unit.xml.dist` / `phpunit.xml.dist` | ユニット / 統合 |
| `tests/bootstrap-unit.php` / `tests/bootstrap.php` | bootstrap |
| `bin/phpunit-local.sh` | ローカル5件 |
| `bin/install-wp-tests.sh` | テスト lib + `wordpress_test` |
| `tests/.wordpress` / `tests/.wordpress-tests-lib` | 初回 install 成果物 (gitignore) |
