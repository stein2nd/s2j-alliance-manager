<?php
/**
 * S2J Alliance Manager アンインストール・スクリプト
 *
 * @package S2J_Alliance_Manager
 */

// WordPress からアンインストールが呼び出されない場合、終了します。
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// プラグインオプションを削除します。
delete_option('s2j_alliance_manager_settings');

// トランジェントを削除します。
delete_transient('s2j_alliance_manager_cache');

// スケジュールイベントを削除します。
wp_clear_scheduled_hook('s2j_alliance_manager_cleanup');
