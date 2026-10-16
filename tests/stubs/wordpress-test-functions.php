<?php
/**
 * IDE / static-analysis stubs for WordPress test bootstrap helpers.
 *
 * Loaded after the real includes/functions.php when present; no-op at runtime.
 *
 * @package S2J_Alliance_Manager
 */

if ( ! function_exists( 'tests_add_filter' ) ) {
	/**
	 * Register a filter for the test suite bootstrap.
	 *
	 * @param string   $tag Hook name.
	 * @param callable $function_to_add Callback.
	 * @param int      $priority Priority.
	 * @param int      $accepted_args Accepted argument count.
	 * @return void
	 */
	function tests_add_filter( $tag, $function_to_add, $priority = 10, $accepted_args = 1 ) {
		unset( $tag, $function_to_add, $priority, $accepted_args );
	}
}
