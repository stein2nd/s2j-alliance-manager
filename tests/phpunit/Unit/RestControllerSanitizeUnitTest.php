<?php
/**
 * Pure unit tests for RestController sanitizers (no WordPress DB).
 *
 * @package S2J_Alliance_Manager
 */

/**
 * RestController sanitize_* unit tests.
 */
class RestControllerSanitizeUnitTest extends \PHPUnit\Framework\TestCase {

	/**
	 * Controller under test.
	 *
	 * @var S2J_Alliance_Manager_RestController
	 */
	private $controller;

	/**
	 * Set up controller instance.
	 *
	 * @return void
	 */
	protected function setUp(): void {
		parent::setUp();
		$this->controller = new S2J_Alliance_Manager_RestController();
	}

	/**
	 * Invalid display_style falls back to grid-single.
	 *
	 * @return void
	 */
	public function test_sanitize_settings_rejects_invalid_display_style(): void {
		$result = $this->controller->sanitize_settings(
			array(
				'display_style' => 'invalid-style',
			)
		);

		$this->assertSame( 'grid-single', $result['display_style'] );
	}

	/**
	 * Valid alignment is preserved.
	 *
	 * @return void
	 */
	public function test_sanitize_settings_accepts_valid_alignment(): void {
		$result = $this->controller->sanitize_settings(
			array(
				'alignment' => 'right',
			)
		);

		$this->assertSame( 'right', $result['alignment'] );
	}

	/**
	 * Unknown behavior defaults to jump in content models.
	 *
	 * @return void
	 */
	public function test_sanitize_content_models_defaults_behavior_to_jump(): void {
		$result = $this->controller->sanitize_content_models(
			array(
				array(
					'behavior' => 'unknown',
					'rank'     => 'Gold',
				),
			)
		);

		$this->assertCount( 1, $result );
		$this->assertSame( 'jump', $result[0]['behavior'] );
		$this->assertSame( 'gold', $result[0]['rank'] );
	}
}
