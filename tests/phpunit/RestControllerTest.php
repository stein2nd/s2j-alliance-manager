<?php
/**
 * REST API integration tests.
 *
 * @package S2J_Alliance_Manager
 */

require_once dirname( __DIR__ ) . '/stubs/wordpress-test-stubs.php';

/**
 * REST controller integration tests.
 */
class RestControllerTest extends WP_UnitTestCase {

	/**
	 * REST server instance.
	 *
	 * @var WP_REST_Server
	 */
	private $server;

	/**
	 * Set up REST server and routes.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$this->server       = $wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );
	}

	/**
	 * Unauthenticated requests are rejected.
	 *
	 * @return void
	 */
	public function test_settings_route_requires_manage_options(): void {
		wp_set_current_user( 0 );

		$request  = new WP_REST_Request(
			'GET',
			'/' . S2J_Alliance_Manager_RestController::NAMESPACE . '/settings'
		);
		$response = $this->server->dispatch( $request );

		$this->assertSame( 401, $response->get_status() );
	}

	/**
	 * Administrator receives default settings payload.
	 *
	 * @return void
	 */
	public function test_settings_route_returns_defaults_for_admin(): void {
		$user_id = $this->factory->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$request  = new WP_REST_Request(
			'GET',
			'/' . S2J_Alliance_Manager_RestController::NAMESPACE . '/settings'
		);
		$response = $this->server->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertSame( 'grid-single', $data['display_style'] );
		$this->assertSame( 'center', $data['alignment'] );
		$this->assertIsArray( $data['content_models'] );
	}
}
