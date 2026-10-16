<?php
/**
 * PHPUnit bootstrap for pure unit tests (no WordPress test suite / DB).
 *
 * @package S2J_Alliance_Manager
 */

define( 'TESTS_PLUGIN_DIR', dirname( __DIR__ ) );

$polyfills = TESTS_PLUGIN_DIR . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';
if ( file_exists( $polyfills ) ) {
	require_once $polyfills;
}

require_once __DIR__ . '/stubs/wordpress-unit-stubs.php';
require_once TESTS_PLUGIN_DIR . '/includes/RestController.php';
