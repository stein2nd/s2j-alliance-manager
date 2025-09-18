<?php
/**
 * REST API コントローラー
 *
 * @package S2J_Alliance_Manager
 */

// 直接アクセスされた場合は、終了します。
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API コントローラー
 */
class S2J_Alliance_Manager_RestController {

    /**
     * Namespace
     */
    const NAMESPACE = 's2j-alliance-manager/v1';

    /**
     * コンストラクター
     */
    public function __construct() {
        // REST API ルートを登録します。
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    /**
     * REST API ルートを登録します。
     * 「コンストラクター」から呼ばれます。
     * 「register_routes」フックから呼ばれます。
     *
     * @return void
     */
    public function register_routes() {
        // REST API ルート (ベース URL: '/settings') の GET メソッドに、「get_settings」メソッドを登録し、権限チェックの上で、設定を取得します。
        register_rest_route(
            self::NAMESPACE, 
            '/settings', 
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_settings'),
                'permission_callback' => array($this, 'check_permissions'),
            )
        );

        // REST API ルート (ベース URL: '/content-models') の GET メソッドに、「get_content_models」メソッドを登録し、権限チェックの上で、コンテンツモデルを取得します。
        register_rest_route(
            self::NAMESPACE, 
            '/content-models', 
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_content_models'),
                'permission_callback' => array($this, 'check_permissions'),
            )
        );

        // REST API ルート (ベース URL: '/save-all') の POST メソッドに、「save_all」メソッドを登録し、権限チェックの上で、設定とコンテンツモデルを保存します。
        // 設定とコンテンツモデルをサニタイズします。
        register_rest_route(
            self::NAMESPACE, 
            '/save-all', 
            array(
                'methods' => 'POST',
                'callback' => array($this, 'save_all'),
                'permission_callback' => array($this, 'check_permissions'),
                'args' => array(
                    'settings' => array(
                        'required' => true,
                        'type' => 'object',
                        'sanitize_callback' => array($this, 'sanitize_settings'),
                    ),
                    'content_models' => array(
                        'required' => true,
                        'type' => 'array',
                        'sanitize_callback' => array($this, 'sanitize_content_models'),
                    ),
                ),
            )
        );

        // REST API ルート (ベース URL: '/rank-labels') の GET メソッドに、「get_rank_labels」メソッドを登録し、権限チェックの上で、ランクラベルを取得します。
        register_rest_route(
            self::NAMESPACE, 
            '/rank-labels', 
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_rank_labels'),
                'permission_callback' => array($this, 'check_permissions'),
            )
        );

        // REST API ルート (ベース URL: '/rank-labels') の POST メソッドに、「save_rank_labels」メソッドを登録し、権限チェックの上で、ランクラベルを保存します。
        // ランクラベルをサニタイズします。
        register_rest_route(
            self::NAMESPACE, 
            '/rank-labels', 
            array(
                'methods' => 'POST',
                'callback' => array($this, 'save_rank_labels'),
                'permission_callback' => array($this, 'check_permissions'),
                'args' => array(
                    'rank_labels' => array(
                        'required' => true,
                        'type' => 'array',
                        'sanitize_callback' => array($this, 'sanitize_rank_labels'),
                    ),
                ),
            )
        );

        // REST API ルート (ベース URL: '/ffmpeg/test') の POST メソッドに、「test_ffmpeg」メソッドを登録し、権限チェックの上で、FFmpeg の利用可能性をテストします。
        register_rest_route(
            self::NAMESPACE, 
            '/ffmpeg/test', 
            array(
                'methods' => 'POST',
                'callback' => array($this, 'test_ffmpeg'),
                'permission_callback' => array($this, 'check_permissions'),
                'args' => array(
                    'ffmpeg_path' => array(
                        'required' => false,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // REST API ルート (ベース URL: '/ffmpeg/settings') の GET メソッドに、「get_ffmpeg_settings」メソッドを登録し、権限チェックの上で、FFmpeg 設定を取得します。
        register_rest_route(
            self::NAMESPACE, 
            '/ffmpeg/settings', 
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_ffmpeg_settings'),
                'permission_callback' => array($this, 'check_permissions'),
            )
        );

        // REST API ルート (ベース URL: '/ffmpeg/generate-poster') の POST メソッドに、「generate_poster」メソッドを登録し、権限チェックの上で、動画からポスター画像を生成します。
        register_rest_route(
            self::NAMESPACE, 
            '/ffmpeg/generate-poster', 
            array(
                'methods' => 'POST',
                'callback' => array($this, 'generate_poster'),
                'permission_callback' => array($this, 'check_permissions'),
                'args' => array(
                    'attachment_id' => array(
                        'required' => true,
                        'type' => 'integer',
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );
    }

    /**
     * 現在のユーザーが指定された権限を持っているか否かをチェックします。
     * 「register_routes」フックから呼ばれます。
     *
     * @return bool $permissions 権限
     */
    public function check_permissions() {
        return current_user_can('manage_options');
    }

    /**
     * REST API ルート (ベース URL: '/settings') の GET メソッドに登録され、設定を取得します。
     * 「register_routes」フックから呼ばれます。
     *
     * @return array<string, string> $settings 設定
     */
    public function get_settings() {
        $settings = get_option(
            's2j_alliance_manager_settings', 
            array(
                'display_style' => 'grid-single',
                'ffmpeg_path' => '',
                'content_models' => array()
            )
        );

        return rest_ensure_response($settings);
    }

    /**
     * REST API ルート (ベース URL: '/content-models') の GET メソッドに登録され、コンテンツモデルを取得します。
     * 「register_routes」フックから呼ばれます。
     *
     * @return array<string, int|string>[] $content_models コンテンツモデル
     */
    public function get_content_models() {
        $settings = get_option(
            's2j_alliance_manager_settings', 
            array()
        );

        $content_models = isset($settings['content_models']) ? $settings['content_models'] : array();

        // Validate and clean up content models
        $validated_models = array();
        foreach ($content_models as $model) {
            $validated_model = $this->validate_content_model($model);
            if ($validated_model) {
                $validated_models[] = $validated_model;
            }
        }

        return rest_ensure_response($validated_models);
    }

    /**
     * REST API ルート (ベース URL: '/save-all') の POST メソッドに登録され、設定とコンテンツモデルを保存します。
     * 「register_routes」フックから呼ばれます。
     *
     * @param WP_REST_Request $request リクエスト
     * @return array<string, bool|string> $result 保存結果
     */
    public function save_all($request) {
        $settings = $request->get_param('settings');

        $content_models = $request->get_param('content_models');

        $data = array(
            'display_style' => $settings['display_style'] ?? 'grid-single',
            'ffmpeg_path' => $settings['ffmpeg_path'] ?? '',
            'content_models' => $content_models
        );

        $result = update_option('s2j_alliance_manager_settings', $data);

        if ($result) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => __('Settings saved successfully.', 's2j-alliance-manager')
            ));
        } else {
            return new WP_Error(
                'save_failed',
                __('Failed to save settings.', 's2j-alliance-manager'),
                array('status' => 500)
            );
        }
    }

    /**
     * 設定をサニタイズします。
     * 「register_routes」フックから呼ばれます。
     *
     * @param array<string, string> $settings 設定
     * @return array<string, string> $sanitized サニタイズされた設定
     */
    public function sanitize_settings($settings) {
        $sanitized = array();

        // Sanitize display style
        if (isset($settings['display_style'])) {
            $allowed_styles = array('grid-single', 'grid-multi', 'masonry');
            $sanitized['display_style'] = in_array($settings['display_style'], $allowed_styles) ? $settings['display_style'] : 'grid-single';
        }

        // Sanitize FFmpeg path
        if (isset($settings['ffmpeg_path'])) {
            $sanitized['ffmpeg_path'] = sanitize_text_field($settings['ffmpeg_path']);
        }

        return $sanitized;
    }

    /**
     * コンテンツモデルをサニタイズします。
     * 「register_routes」フックから呼ばれます。
     *
     * @param array<string, int|string>[] $content_models コンテンツモデル
     * @return array<string, int|string>[] $sanitized サニタイズされたコンテンツモデル
     */
    public function sanitize_content_models($content_models) {
        $sanitized = array();

        foreach ($content_models as $model) {
            $sanitized_model = array();

            // Sanitize frontpage
            $sanitized_model['frontpage'] = isset($model['frontpage']) && $model['frontpage'] === 'YES' ? 'YES' : 'NO';

            // Sanitize rank
            $sanitized_model['rank'] = sanitize_title($model['rank'] ?? '');

            // Sanitize logo (attachment ID)
            $sanitized_model['logo'] = intval($model['logo'] ?? 0);

            // Sanitize jump_url
            $sanitized_model['jump_url'] = esc_url_raw($model['jump_url'] ?? '');

            // Sanitize behavior
            $allowed_behaviors = array('jump', 'modal');
            $sanitized_model['behavior'] = in_array($model['behavior'] ?? '', $allowed_behaviors) ? $model['behavior'] : 'jump';

            // Sanitize message
            $sanitized_model['message'] = sanitize_textarea_field($model['message'] ?? '');

            $sanitized[] = $sanitized_model;
        }

        return $sanitized;
    }

    /**
     * コンテンモデルを検証します。
     * 「register_routes」フックから呼ばれます。
     *
     * @param array<string, int|string> $model コンテンツモデル
     * @return array<string, int|string> $model コンテンツモデル
     */
    private function validate_content_model($model) {
        // Check if logo attachment exists
        if (isset($model['logo']) && $model['logo'] > 0) {
            $attachment_id = attachment_url_to_postid(wp_get_attachment_url($model['logo']));
            if (!$attachment_id) {
                // Logo doesn't exist, mark as invalid
                return false;
            }
        }

        return $model;
    }

    /**
     * REST API ルート (ベース URL: '/rank-labels') の GET メソッドに登録され、ランクラベルを取得します。
     * 「register_routes」フックから呼ばれます。
     *
     * @return array<string, int|string>[] $rank_labels ランクラベル
     */
    public function get_rank_labels() {
        $args = array(
            'post_type' => 's2j_am_rank_label',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => 'menu_order',
            'order' => 'ASC',
        );

        $posts = get_posts($args);
        $rank_labels = array();

        foreach ($posts as $post) {
            $rank_labels[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'content' => $post->post_content,
                'thumbnail_id' => get_post_thumbnail_id($post->ID),
                'menu_order' => $post->menu_order,
                'slug' => $post->post_name,
            );
        }

        return rest_ensure_response($rank_labels);
    }

    /**
     * REST API ルート (ベース URL: '/rank-labels') の POST メソッドに登録され、ランクラベルを保存します。
     * 「register_routes」フックから呼ばれます。
     *
     * @param WP_REST_Request $request リクエスト
     * @return array<string, bool|string> $result 保存結果
     */
    public function save_rank_labels($request) {
        $rank_labels = $request->get_param('rank_labels');

        foreach ($rank_labels as $rank_label) {
            $post_data = array(
                'ID' => $rank_label['id'],
                'post_title' => sanitize_text_field($rank_label['title']),
                'post_content' => sanitize_textarea_field($rank_label['content']),
                'post_name' => sanitize_title($rank_label['title']),
                'menu_order' => intval($rank_label['menu_order']),
                'post_type' => 's2j_am_rank_label',
                'post_status' => 'publish',
            );

            if ($rank_label['id'] === 0) {
                // New post
                unset($post_data['ID']);
                $post_id = wp_insert_post($post_data);
            } else {
                // Update existing post
                $post_id = wp_update_post($post_data);
            }

            if ($post_id && !is_wp_error($post_id)) {
                // Set thumbnail
                if (isset($rank_label['thumbnail_id']) && $rank_label['thumbnail_id'] > 0) {
                    set_post_thumbnail($post_id, intval($rank_label['thumbnail_id']));
                }
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Rank labels saved successfully.', 's2j-alliance-manager')
        ));
    }

    /**
     * ランクラベルをサニタイズします。
     * 「register_routes」フックから呼ばれます。
     *
     * @param array<string, int|string>[] $rank_labels ランクラベル
     * @return array<string, int|string>[] $sanitized サニタイズされたランクラベル
     */
    public function sanitize_rank_labels($rank_labels) {
        $sanitized = array();

        foreach ($rank_labels as $rank_label) {
            $sanitized_label = array();

            // Sanitize ID
            $sanitized_label['id'] = intval($rank_label['id'] ?? 0);

            // Sanitize title
            $sanitized_label['title'] = sanitize_text_field($rank_label['title'] ?? '');

            // Sanitize content
            $sanitized_label['content'] = sanitize_textarea_field($rank_label['content'] ?? '');

            // Sanitize thumbnail_id
            $sanitized_label['thumbnail_id'] = intval($rank_label['thumbnail_id'] ?? 0);

            // Sanitize menu_order
            $sanitized_label['menu_order'] = intval($rank_label['menu_order'] ?? 0);

            // Generate slug from title
            $sanitized_label['slug'] = sanitize_title($sanitized_label['title']);

            $sanitized[] = $sanitized_label;
        }

        return $sanitized;
    }

    /**
     * REST API ルート (ベース URL: '/ffmpeg/test') の POST メソッドに登録され、FFmpeg の利用可能性をテストします。
     * 「register_routes」フックから呼ばれます。
     *
     * @param WP_REST_Request $request リクエスト
     * @return array<string, bool|string> $result テスト結果
     */
    public function test_ffmpeg($request) {
        $ffmpeg_path = $request->get_param('ffmpeg_path');
        
        $settings_page = new S2J_Alliance_Manager_SettingsPage();
        $is_available = $settings_page->test_ffmpeg_availability($ffmpeg_path);
        
        return rest_ensure_response(array(
            'success' => true,
            'available' => $is_available,
            'message' => $is_available 
                ? __('FFmpeg is available.', 's2j-alliance-manager')
                : __('FFmpeg is not available.', 's2j-alliance-manager')
        ));
    }

    /**
     * REST API ルート (ベース URL: '/ffmpeg/settings') の GET メソッドに登録され、FFmpeg 設定を取得します。
     * 「register_routes」フックから呼ばれます。
     *
     * @return array<string, string|bool> $settings FFmpeg 設定
     */
    public function get_ffmpeg_settings() {
        $settings_page = new S2J_Alliance_Manager_SettingsPage();
        $settings = $settings_page->get_ffmpeg_settings();
        
        return rest_ensure_response($settings);
    }

    /**
     * REST API ルート (ベース URL: '/ffmpeg/generate-poster') の POST メソッドに登録され、動画からポスター画像を生成します。
     * 「register_routes」フックから呼ばれます。
     *
     * @param WP_REST_Request $request リクエスト
     * @return array<string, bool|string|int> $result 生成結果
     */
    public function generate_poster($request) {
        $attachment_id = $request->get_param('attachment_id');
        
        // 添付ファイルを取得
        $attachment = get_post($attachment_id);
        if (!$attachment || $attachment->post_type !== 'attachment') {
            return new WP_Error(
                'invalid_attachment',
                __('Invalid attachment ID.', 's2j-alliance-manager'),
                array('status' => 400)
            );
        }

        // ファイルパスを取得
        $file_path = get_attached_file($attachment_id);
        if (!$file_path || !file_exists($file_path)) {
            return new WP_Error(
                'file_not_found',
                __('Attachment file not found.', 's2j-alliance-manager'),
                array('status' => 404)
            );
        }

        // MIME タイプをチェック
        $mime_type = get_post_mime_type($attachment_id);
        if (!str_starts_with($mime_type, 'video/')) {
            return new WP_Error(
                'not_video',
                __('Attachment is not a video file.', 's2j-alliance-manager'),
                array('status' => 400)
            );
        }

        // FFmpeg 設定を取得
        $settings_page = new S2J_Alliance_Manager_SettingsPage();
        $ffmpeg_settings = $settings_page->get_ffmpeg_settings();
        
        if (!$ffmpeg_settings['ffmpeg_available']) {
            return new WP_Error(
                'ffmpeg_not_available',
                __('FFmpeg is not available.', 's2j-alliance-manager'),
                array('status' => 503)
            );
        }

        // ポスター画像を生成
        $result = $this->generate_video_poster($file_path, $attachment_id, $ffmpeg_settings['ffmpeg_path']);
        
        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response(array(
            'success' => true,
            'poster_id' => $result,
            'message' => __('Poster image generated successfully.', 's2j-alliance-manager')
        ));
    }

    /**
     * 動画からポスター画像を生成します。
     *
     * @param string $video_path 動画ファイルのパス
     * @param int $attachment_id 添付ファイル ID
     * @param string $ffmpeg_path FFmpeg のパス
     * @return int|WP_Error 生成されたポスター画像の添付ファイル ID、またはエラー
     */
    private function generate_video_poster($video_path, $attachment_id, $ffmpeg_path = '') {
        if (empty($ffmpeg_path)) {
            $ffmpeg_path = 'ffmpeg';
        }

        // ポスター画像のファイル名を生成
        $video_info = pathinfo($video_path);
        $poster_filename = $video_info['filename'] . '_poster.jpg';
        $poster_path = $video_info['dirname'] . '/' . $poster_filename;

        // FFmpeg コマンドを実行してポスター画像を生成
        $command = sprintf(
            '%s -i %s -ss 00:00:01 -vframes 1 -q:v 2 %s 2>&1',
            escapeshellarg($ffmpeg_path),
            escapeshellarg($video_path),
            escapeshellarg($poster_path)
        );

        $output = shell_exec($command);
        
        if (!file_exists($poster_path)) {
            return new WP_Error(
                'poster_generation_failed',
                __('Failed to generate poster image.', 's2j-alliance-manager'),
                array('status' => 500)
            );
        }

        // WordPress メディアライブラリに追加
        $wp_upload_dir = wp_upload_dir();
        $relative_path = str_replace($wp_upload_dir['basedir'], '', $poster_path);
        $poster_url = $wp_upload_dir['baseurl'] . $relative_path;

        $attachment_data = array(
            'post_mime_type' => 'image/jpeg',
            'post_title' => sanitize_file_name($video_info['filename'] . ' Poster'),
            'post_content' => '',
            'post_status' => 'inherit'
        );

        $poster_attachment_id = wp_insert_attachment($attachment_data, $poster_path, $attachment_id);
        
        if (is_wp_error($poster_attachment_id)) {
            return $poster_attachment_id;
        }

        // 添付ファイルのメタデータを生成
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attachment_metadata = wp_generate_attachment_metadata($poster_attachment_id, $poster_path);
        wp_update_attachment_metadata($poster_attachment_id, $attachment_metadata);

        return $poster_attachment_id;
    }
}
