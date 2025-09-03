<?php
/**
 * Uninstall script for S2J Alliance Manager
 *
 * @package S2J_Alliance_Manager
 */

// If uninstall not called from WordPress, then exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Remove plugin options
delete_option('s2j_alliance_manager_settings');

// Remove any transients
delete_transient('s2j_alliance_manager_cache');

// Clear any scheduled events
wp_clear_scheduled_hook('s2j_alliance_manager_cleanup');
