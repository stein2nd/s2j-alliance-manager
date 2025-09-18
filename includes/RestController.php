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
}
