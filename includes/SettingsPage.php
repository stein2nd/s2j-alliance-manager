<?php
/**
 * 設定ページ
 *
 * @package S2J_Alliance_Manager
 */

// 直接アクセスされた場合は、終了します。
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 設定ページ
 */
class S2J_Alliance_Manager_SettingsPage {

    /**
     * コンストラクター
     */
    public function __construct() {
        // サブメニューページ「S2J Alliance Manager」を追加します。
        add_action('admin_menu', array($this, 'add_admin_menu'));

        // 管理用設定とそのデータを登録します。
        add_action('admin_init', array($this, 'admin_init'));
    }

    /**
     * サブメニューページ「S2J Alliance Manager」を追加します。
     * 「コンストラクター」から呼ばれます。
     * 「add_admin_menu」フックから呼ばれます。
     *
     * @return void
     */
    public function add_admin_menu() {
        add_options_page(
            __('S2J Alliance Manager', 's2j-alliance-manager'),
            __('S2J Alliance Manager', 's2j-alliance-manager'),
            'manage_options',
            's2j-alliance-manager',
            array($this, 'admin_page')
        );
    }

    /**
     * 管理用設定とそのデータを登録します。
     * 「コンストラクター」から呼ばれます。
     * 「admin_init」フックから呼ばれます。
     *
     * @return void
     */
    public function admin_init() {
        register_setting(
            's2j_alliance_manager_settings',
            's2j_alliance_manager_settings',
            array($this, 'sanitize_settings')
        );
    }

    /**
     * 設定をサニタイズします。
     *
     * @param array<string, string> $input 設定
     * @return array<string, string> $sanitized サニタイズされた設定
     */
    public function sanitize_settings($input) {
        $sanitized = array();

        // 表示スタイルをサニタイズします。
        if (isset($input['display_style'])) {
            $allowed_styles = array('grid-single', 'grid-multi');
            $sanitized['display_style'] = in_array($input['display_style'], $allowed_styles) ? $input['display_style'] : 'grid-single';
        }

        // FFmpeg パスをサニタイズします。
        if (isset($input['ffmpeg_path'])) {
            $sanitized['ffmpeg_path'] = sanitize_text_field($input['ffmpeg_path']);
        }

        // コンテンツモデルをサニタイズします。
        if (isset($input['content_models']) && is_array($input['content_models'])) {
            $sanitized['content_models'] = array();
            foreach ($input['content_models'] as $model) {
                $sanitized_model = array();

                // frontpage をサニタイズします。
                $sanitized_model['frontpage'] = isset($model['frontpage']) ? 'YES' : 'NO';

                // rank をサニタイズします。
                $sanitized_model['rank'] = sanitize_title($model['rank'] ?? '');

                // logo (attachment ID) をサニタイズします。
                $sanitized_model['logo'] = intval($model['logo'] ?? 0);

                // jump_url をサニタイズします。
                $sanitized_model['jump_url'] = esc_url_raw($model['jump_url'] ?? '');

                // behavior をサニタイズします。
                $allowed_behaviors = array('jump', 'modal');
                $sanitized_model['behavior'] = in_array($model['behavior'] ?? '', $allowed_behaviors) ? $model['behavior'] : 'jump';

                // message をサニタイズします。
                $sanitized_model['message'] = sanitize_textarea_field($model['message'] ?? '');

                $sanitized['content_models'][] = $sanitized_model;
            }
        }

        return $sanitized;
    }

    /**
     * FFmpeg が利用可能かテストします。
     *
     * @param string $ffmpeg_path FFmpeg のパス
     * @return bool FFmpeg が利用可能な場合 true
     */
    public function test_ffmpeg_availability($ffmpeg_path = '') {
        if (empty($ffmpeg_path)) {
            $ffmpeg_path = 'ffmpeg';
        }

        // FFmpeg のバージョンを取得して利用可能性をテスト
        $command = escapeshellarg($ffmpeg_path) . ' -version 2>&1';
        $output = shell_exec($command);
        
        return !empty($output) && strpos($output, 'ffmpeg version') !== false;
    }

    /**
     * FFmpeg の設定を取得します。
     *
     * @return array FFmpeg 設定
     */
    public function get_ffmpeg_settings() {
        $settings = get_option('s2j_alliance_manager_settings', array());
        return array(
            'ffmpeg_path' => $settings['ffmpeg_path'] ?? '',
            'ffmpeg_available' => $this->test_ffmpeg_availability($settings['ffmpeg_path'] ?? '')
        );
    }

    /**
     * サブメニューページ「S2J Alliance Manager」のコンテンツを表示します。
     * 「admin_page」フックから呼ばれます。
     * React によって、「ランクラベル」「コンテンツモデル」「表示設定」がレンダリングされます。
     *
     * @return void
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <div id="s2j-alliance-manager-admin">
                <div class="s2j-admin-container">
                    <div class="s2j-admin-header">
                        <h2><?php _e('Alliance Partner Management', 's2j-alliance-manager'); ?></h2>
                        <p><?php _e('Manage your alliance partner banners and links.', 's2j-alliance-manager'); ?></p>
                    </div>
                    <div class="s2j-admin-content">
                        <div class="s2j-admin-main">
                            <div class="s2j-admin-card">
                                <div class="s2j-admin-card-header">
                                    <h3><?php _e('FFmpeg Library', 's2j-alliance-manager'); ?></h3>
                                </div>
                                <div id="s2j-ffmpeg-library-manager">
                                    <!-- FFmpeg Library Manager will be rendered here by React -->
                                </div>
                            </div>
                            <div class="s2j-admin-card">
                                <div class="s2j-admin-card-header">
                                    <h3><?php _e('Rank Management', 's2j-alliance-manager'); ?></h3>
                                </div>
                                <div id="s2j-rank-labels">
                                    <!-- Rank labels will be rendered here by React -->
                                </div>
                            </div>
                            <div class="s2j-admin-card">
                                <div class="s2j-admin-card-header">
                                    <h3><?php _e('Alliance Partners', 's2j-alliance-manager'); ?></h3>
                                </div>
                                <div id="s2j-content-models">
                                    <!-- Content models will be rendered here by React -->
                                </div>
                            </div>
                        </div>
                        <div class="s2j-admin-sidebar">
                            <div class="s2j-admin-card">
                                <h3><?php _e('Display Settings', 's2j-alliance-manager'); ?></h3>
                                <div id="s2j-display-settings">
                                    <!-- Display settings will be rendered here by React -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}
