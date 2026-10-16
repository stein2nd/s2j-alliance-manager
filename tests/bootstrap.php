<?php
/**
 * PHPUnit bootstrap for WordPress integration tests (local MySQL / no wp-env).
 *
 * @package S2J_Alliance_Manager
 */

define( 'TESTS_PLUGIN_DIR', dirname( __DIR__ ) );
define( 'TESTS_PLUGIN_FILE', TESTS_PLUGIN_DIR . '/s2j-alliance-manager.php' );

$polyfills = TESTS_PLUGIN_DIR . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';
if ( file_exists( $polyfills ) ) {
	require_once $polyfills;
}

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = TESTS_PLUGIN_DIR . '/tests/.wordpress-tests-lib';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo 'Could not find ' . $_tests_dir . '/includes/functions.php.' . PHP_EOL;
	echo 'Local: copy .env.tests.example to .env.tests, then run npm run test:unit:php:local' . PHP_EOL;
	echo 'Or: bash bin/install-wp-tests.sh <db> <user> <pass> [host]' . PHP_EOL;
	exit( 1 );
}

require_once $_tests_dir . '/includes/functions.php';
require_once __DIR__ . '/stubs/wordpress-test-functions.php';

/**
 * Load the plugin under test.
 *
 * @return void
 */
function _s2j_am_tests_load_plugin(): void {
	require TESTS_PLUGIN_FILE;
}

tests_add_filter( 'muplugins_loaded', '_s2j_am_tests_load_plugin' );

require $_tests_dir . '/includes/bootstrap.php';
