<?php
/**
 * IDE / static-analysis stubs for the WordPress PHPUnit test suite.
 *
 * Not loaded by tests/bootstrap.php. Real classes come from the WP test library at runtime.
 *
 * @package S2J_Alliance_Manager
 */

if ( class_exists( 'WP_UnitTestCase', false ) ) {
	return;
}

/**
 * WordPress core PHPUnit base test case (stub).
 */
abstract class WP_UnitTestCase extends \PHPUnit\Framework\TestCase {

	/**
	 * WordPress test data factory.
	 *
	 * @var WP_UnitTest_Factory
	 */
	protected $factory;
}

/**
 * WordPress test factory (stub).
 */
class WP_UnitTest_Factory {

	/**
	 * User factory.
	 *
	 * @var object
	 */
	public $user;

	/**
	 * Post factory.
	 *
	 * @var object
	 */
	public $post;
}

/**
 * REST server (stub).
 */
class WP_REST_Server {
}

/**
 * REST request (stub).
 */
class WP_REST_Request {
}
