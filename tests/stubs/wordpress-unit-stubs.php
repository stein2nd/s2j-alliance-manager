<?php
/**
 * Minimal WordPress function stubs for RestController unit tests.
 *
 * @package S2J_Alliance_Manager
 */

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', '/' );
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	/**
	 * @param string $str String to sanitize.
	 * @return string
	 */
	function sanitize_text_field( $str ) {
		return is_string( $str ) ? trim( $str ) : '';
	}
}

if ( ! function_exists( 'sanitize_title' ) ) {
	/**
	 * @param string $title Title.
	 * @return string
	 */
	function sanitize_title( $title ) {
		return is_string( $title ) ? strtolower( preg_replace( '/[^a-z0-9]+/i', '-', $title ) ) : '';
	}
}

if ( ! function_exists( 'esc_url_raw' ) ) {
	/**
	 * @param string $url URL.
	 * @return string
	 */
	function esc_url_raw( $url ) {
		return is_string( $url ) ? $url : '';
	}
}

if ( ! function_exists( 'sanitize_textarea_field' ) ) {
	/**
	 * @param string $str String to sanitize.
	 * @return string
	 */
	function sanitize_textarea_field( $str ) {
		return is_string( $str ) ? $str : '';
	}
}

if ( ! function_exists( 'add_action' ) ) {
	/**
	 * @param string   $hook Hook name.
	 * @param callable $callback Callback.
	 * @param int      $priority Priority.
	 * @param int      $accepted_args Accepted args.
	 * @return void
	 */
	function add_action( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
		unset( $hook, $callback, $priority, $accepted_args );
	}
}
