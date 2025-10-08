<?php
/**
 * Alliance Manager
 *
 * @package S2J_Alliance_Manager
 */

// 直接アクセスされた場合は、終了します。
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Alliance Manager
 */
class S2J_Alliance_Manager_AllianceManager {

    /**
     * Block registration status
     */
    private $block_registered = false;
    private $using_block_json = false;
    private $initialized = false;

    /**
     * Singleton instance
     */
    private static $instance = null;

    /**
     * Singleton インスタンスを取得
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * コンストラクター
     */
    public function __construct() {
        // `block.json` ファイルから Gutenberg ブロックタイプ (s2j-alliance-manager/alliance-banner) を登録します。
        add_action('init', array($this, 'register_blocks'), 20);

        // Gutenberg エディター用登録済みスクリプトとスタイルのアセット (s2j-alliance-manager-gutenberg) をキューに追加します。
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets'));

        // フロントエンド用アセット (s2j-alliance-manager-gutenberg.css) をキューに追加します。
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));

        // デバッグ用のヘルプタブを表示します (Alliance Manager 専用管理画面でのみ)。
        if (is_admin()) {
            add_action('admin_head', array($this, 'add_debug_help_tab'));
        }

        // Shortcode を登録します。
        add_action('plugins_loaded', array($this, 'register_shortcode'), 10);
        add_action('init', array($this, 'register_shortcode'), 1);
        add_action('wp_loaded', array($this, 'register_shortcode'), 1);

        // Classic エディター用のメタボックスを登録します。
        add_action('init', array($this, 'register_meta_boxes'));

        // Classic エディター用のヘルプタブは管理画面に統合されました。
        // add_action('admin_head', array($this, 'add_shortcode_help_tab'));

        // Shortcode ブロックの処理を監視してアセットを読み込む
        add_filter('render_block', array($this, 'handle_shortcode_block'), 10, 2);

        // コンテンツ内のショートコードを確実に実行する
        add_filter('the_content', array($this, 'process_shortcodes_in_content'), 20);
    }

    /**
     * `block.json` ファイルから Gutenberg ブロックタイプ (s2j-alliance-manager/alliance-banner) を登録します。
     * コンストラクターから呼ばれます。
     * 「init」フックから呼ばれます。
     *
     * @return void
     */
    public function register_blocks() {
        // 重複登録を防ぐ
        if ($this->initialized) {
            return;
        }

        // ブロック登録関数が利用可能か否かをチェックします。
        if (!function_exists('register_block_type')) {
            return;
        }

        // ブロックアセットを登録します。
        $this->register_block_assets();

        // `block.json` ファイルのパスを取得します。
        $block_json_path = S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'dist/blocks/alliance-banner/block.json';
        if (!file_exists($block_json_path)) {
            return;
        }

        // ブロックタイプを登録します。
        // ブロックタイプの推奨登録方法は、`block.json` ファイルに保存されているメタデータを使用する方法。
        $result = register_block_type(
            $block_json_path, 
            array(
                'render_callback' => array($this, 'render_alliance_banner_block')
            )
        );

        if ($result && !is_wp_error($result)) {
            $this->block_registered = true;
        } else {
            $this->block_registered = false;
        }

        $this->initialized = true;
    }

    /**
     * Gutenberg ブロックアセット (s2j-alliance-manager-gutenberg.js, s2j-alliance-manager-gutenberg.css) を登録します。
     * 「register_blocks()」メソッドから呼ばれます。
     *
     * @return void
     */
    private function register_block_assets() {
        $js_path = S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'dist/js/s2j-alliance-manager-gutenberg.js';
        $css_path = S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'dist/css/s2j-alliance-manager-gutenberg.css';
        $frontend_js_path = S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'dist/js/s2j-alliance-manager-frontend.js';

        if (file_exists($js_path)) {
            // スクリプトを登録します (block.json で参照されるため必要)
            wp_register_script(
                's2j-alliance-manager-gutenberg',
                S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/s2j-alliance-manager-gutenberg.js',
                array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
                S2J_ALLIANCE_MANAGER_VERSION,
                true
            );
        }

        if (file_exists($frontend_js_path)) {
            // フロントエンド用スクリプトを登録します
            wp_register_script(
                's2j-alliance-manager-frontend',
                S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/s2j-alliance-manager-frontend.js',
                array('react', 'react-dom'),
                S2J_ALLIANCE_MANAGER_VERSION,
                true
            );
        }

        if (file_exists($css_path)) {
            // スタイルを登録します (block.json で参照されるため必要)
            wp_register_style(
                's2j-alliance-manager-gutenberg',
                S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/s2j-alliance-manager-gutenberg.css',
                array('wp-edit-blocks'),
                S2J_ALLIANCE_MANAGER_VERSION
            );
        }
    }

    /**
     * Shortcode を登録します。
     * コンストラクターから呼ばれます。
     * 「init」フックから呼ばれます。
     *
     * @return void
     */
    public function register_shortcode() {
        // 重複登録を防ぐ
        if (shortcode_exists('alliance_banner') && shortcode_exists('test_alliance')) {
            return;
        }

        add_shortcode('alliance_banner', array($this, 'render_alliance_banner_shortcode'));
        add_shortcode('test_alliance', array($this, 'test_shortcode'));
    }

    /**
     * Shortcode をレンダリングします。
     * 「register_shortcode()」メソッドから呼ばれます。
     * 「add_shortcode()」メソッドから呼ばれます。
     *
     * @param array<string, string> $atts 属性
     * @param string $content コンテンツ
     * @return string $html ショートコードの HTML
     */
    public function render_alliance_banner_shortcode($atts = array(), $content = '') {
        // デバッグ用ログ
        error_log('S2J Alliance Manager: Shortcode called with atts: ' . print_r($atts, true));

        // ファイルに直接書き込み
        file_put_contents(
            WP_CONTENT_DIR . '/debug.log',
            '[' . date('Y-m-d H:i:s') . '] S2J Alliance Manager: Shortcode called with atts: ' . print_r($atts, true) . PHP_EOL,
            FILE_APPEND | LOCK_EX
        );

        // block.json の attributes に合わせてデフォルト値を設定
        $atts = shortcode_atts(
            array(
                'displayStyle' => 'grid-single',
                'alignment' => 'center',
            ),
            $atts,
            'alliance_banner'
        );

        // 共通のレンダリング関数を呼び出し
        $result = $this->render_alliance_banner_block($atts);

        // デバッグ用: 結果の先頭にコメントを追加
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $result = '<!-- S2J Alliance Manager Shortcode Executed -->' . $result;
        }

        return $result;
    }

    /**
     * テスト用の簡単な shortcode をレンダリングします。
     *
     * @param array<string, string> $atts 属性
     * @param string $content コンテンツ
     * @return string $html ショートコードの HTML
     */
    public function test_shortcode($atts = array(), $content = '') {
        return '<div style="background: #f0f0f0; padding: 10px; border: 2px solid #0073aa; margin: 10px 0;">TEST SHORTCODE WORKS! Time: ' . date('Y-m-d H:i:s') . '</div>';
    }

    /**
     * ブロックをレンダリングします。
     * 「register_blocks()」メソッドから呼ばれます。
     * 「register_block_type()」メソッドの「render_callback」属性から呼ばれます。
     * 「render_alliance_banner_shortcode()」メソッドからも呼ばれます。
     *
     * @param array<string, string> $attributes 属性
     * @return string $html ブロックの HTML
     */
    public function render_alliance_banner_block($attributes) {
        $display_style = $attributes['displayStyle'] ?? 'grid-single';
        $alignment = $attributes['alignment'] ?? 'center';

        // コンテンツデータを取得します。
        $alliance_data = $this->get_alliance_data();

        if (empty($alliance_data)) {
            return '<p>' . __('No alliance partners found.', 's2j-alliance-manager') . '</p>';
        }

        // React コンポーネント用のデータを準備
        $content_models = $this->prepare_content_models($alliance_data);

        ob_start();
        ?>
        <div class="wp-block-s2j-alliance-manager-alliance-banner" 
             data-display-style="<?php echo esc_attr($display_style); ?>"
             data-alignment="<?php echo esc_attr($alignment); ?>">
            <!-- React コンポーネントがここにレンダリングされます -->
        </div>
        <script>
        // React コンポーネント用のデータを渡す
        window.s2jAllianceBannerData = {
            contentModels: <?php echo json_encode($content_models); ?>,
            attributes: {
                displayStyle: '<?php echo esc_js($display_style); ?>',
                alignment: '<?php echo esc_js($alignment); ?>'
            }
        };
        </script>
        <?php
        return ob_get_clean();
    }

    /**
     * コンテンツデータを取得します。
     * 「render_alliance_banner_block()」メソッドから呼ばれます。
     *
     * @return array<string, array<string, int|string>> $grouped_data グループ化されたデータ
     */
    private function get_alliance_data() {
        // ランクラベルを `menu_order` の昇順で取得します (「ランクラベル管理」で登録されたラベルの並び順)。
        $rank_labels = get_posts(array(
            'post_type' => 's2j_am_rank_label',
            'post_status' => 'publish',
            'numberposts' => -1,
            'orderby' => 'menu_order',
            'order' => 'ASC'
        ));

        $grouped_data = array();

        // 最初のランクを取得 (default のマッチング用)
        $first_rank_title = !empty($rank_labels) ? $rank_labels[0]->post_title : '';

        foreach ($rank_labels as $rank_label) {
            $rank_title = $rank_label->post_title;

            // オプション値「s2j_alliance_manager_settings」を取得します。
            $settings = get_option('s2j_alliance_manager_settings', array());

            // 設定「コンテンツモデル」を取得します。
            $content_models = $settings['content_models'] ?? array();

            // 配列の各値を反復処理し、それらをコールバック関数に渡します。
            // 反復処理の内容: `rank` が一致し、`frontpage` が `YES` である、設定「コンテンツモデル」を取得します。
            $matching_items = array_filter(
                $content_models,
                function($item) use ($rank_title, $first_rank_title) {
                    // 大文字小文字を区別しない比較と、default の特別処理
                    $item_rank = isset($item['rank']) ? strtolower($item['rank']) : '';
                    $rank_title_lower = strtolower($rank_title);
                    $first_rank_title_lower = strtolower($first_rank_title);

                    // default は最初のランクにマッチさせる
                    if ($item_rank === 'default' && $rank_title_lower === $first_rank_title_lower) {
                        return isset($item['frontpage']) && $item['frontpage'] === 'YES';
                    }

                    return $item_rank === $rank_title_lower && isset($item['frontpage']) && $item['frontpage'] === 'YES';
                }
            );

            // 「index」が存在する場合は、その値を使用して配列を値でソートします。
            // ユーザー定義の比較関数を使用して、配列を値でソートします (「index」の昇順でソート)。
            usort($matching_items, function($a, $b) {
                $index_a = $a['index'] ?? 0;

                $index_b = $b['index'] ?? 0;

                return $index_a - $index_b;
            });

            if (empty($matching_items)) {
                // 暫定的に「該当レコードなし」を表示
                $grouped_data[$rank_title] = array(
                    array(
                        'is_placeholder' => true,
                        'message' => __('No alliance partners found.', 's2j-alliance-manager')
                    )
                );
            } else {
                $grouped_data[$rank_title] = $matching_items;
            }
        }

        return $grouped_data;
    }

    /**
     * React コンポーネント用のコンテンツモデルを準備します。
     * 「render_alliance_banner_block()」メソッドから呼ばれます。
     *
     * @param array<string, array<string, int|string>> $alliance_data アライアンスデータ
     * @return array<array<string, int|string>> $content_models コンテンツモデル
     */
    private function prepare_content_models($alliance_data) {
        $content_models = array();

        foreach ($alliance_data as $rank => $partners) {
            foreach ($partners as $partner) {
                if (isset($partner['is_placeholder']) && $partner['is_placeholder']) {
                    continue; // プレースホルダーはスキップ
                }

                // ロゴ URL を取得
                $logo_url = '';
                if (!empty($partner['logo'])) {
                    $logo_url = wp_get_attachment_url($partner['logo']);
                }

                // ポスター画像 URL を取得
                $poster_url = '';
                if (!empty($partner['poster'])) {
                    $poster_url = wp_get_attachment_url($partner['poster']);
                }

                $content_models[] = array(
                    'rank' => $rank,
                    'logo' => $partner['logo'] ?? 0,
                    'logo_url' => $logo_url,
                    'poster_url' => $poster_url,
                    'message' => $partner['message'] ?? '',
                    'jump_url' => $partner['jump_url'] ?? '',
                    'behavior' => $partner['behavior'] ?? 'modal',
                    'poster' => $partner['poster'] ?? 0,
                    'frontpage' => $partner['frontpage'] ?? 'YES',
                    'index' => $partner['index'] ?? 0
                );
            }
        }

        return $content_models;
    }

    /**
     * パートナーロゴを、画像の場合は画像タグ、動画の場合は動画タグとして、レンダリングします。
     * 「render_alliance_banner_block()」メソッドから呼ばれます。
     *
     * @param array<string, int|string> $partner パートナー
     * @return string $logo_html パートナーロゴ
     */
    private function render_partner_logo($partner) {
        if (empty($partner['logo'])) {
            return '<div class="s2j-alliance-partner-placeholder">' . __('No logo', 's2j-alliance-manager') . '</div>';
        }

        // 添付ファイルの URL を取得します。
        $logo_url = wp_get_attachment_url($partner['logo']);
        if (!$logo_url) {
            return '<div class="s2j-alliance-partner-placeholder">' . __('Invalid logo', 's2j-alliance-manager') . '</div>';
        }

        // 指定された投稿 ID の投稿メタフィールドを取得します。
        $alt_text = get_post_meta($partner['logo'], '_wp_attachment_image_alt', true);
        if (empty($alt_text)) {
            $alt_text = __('Alliance partner logo', 's2j-alliance-manager');
        }

        // ID に基づいて添付ファイルの MIME タイプを取得し、動画の場合は動画タグ、画像の場合は画像タグとしてレンダリングします。
        $mime_type = get_post_mime_type($partner['logo']);
        if (strpos($mime_type, 'video/') === 0) {
            // 動画の場合、poster 画像の URL を取得
            $poster_url = '';

            if (!empty($partner['poster']) && $partner['poster'] > 0) {
                $poster_url = wp_get_attachment_url($partner['poster']);
            }

            $poster_attr = $poster_url ? sprintf(' poster="%s"', esc_attr($poster_url)) : '';

            return sprintf(
                '<video src="%s" class="s2j-alliance-partner-logo" controls playsinline%s></video>',
                esc_url($logo_url),
                $poster_attr
            );
        } else {
            return sprintf(
                '<img src="%s" alt="%s" class="s2j-alliance-partner-logo" />',
                esc_url($logo_url),
                esc_attr($alt_text)
            );
        }
    }

    /**
     * Gutenberg エディター用登録済みスクリプトとスタイルのアセット (s2j-alliance-manager-gutenberg) をキューに追加します。
     * コンストラクターから呼ばれます。
     * 「enqueue_block_editor_assets」フックから呼ばれます。
     *
     * @return void
     */
    public function enqueue_block_editor_assets() {
        // ブロックアセットは、`block.json` を使用して `register_block_type()` によって自動的にキューに追加されます。
        // このメソッドは、必要に応じて、追加のアセット用に用意されています。

        // 登録済みスクリプトをキューに追加します。
        // wp_enqueue_script('s2j-alliance-manager-gutenberg');
        // 登録済みスタイルをキューに追加します。
        // wp_enqueue_style('s2j-alliance-manager-gutenberg');
    }

    /**
     * 投稿エディタ/ページエディターであれば、Gutenberg エディター用登録済みスクリプトとスタイルのアセット (s2j-alliance-manager-gutenberg) をキューに追加します。
     * コンストラクターから呼ばれます。
     * 「admin_enqueue_scripts」フックから呼ばれます。
     *
     * @return void
     */
    public function admin_enqueue_scripts() {
        // 現在の画面オブジェクトを取得します。
        $screen = get_current_screen();
        if (!$screen) {
            return;
        }

        // 投稿エディター/ページエディターか否かを確認します。
        if (strpos($screen->id, 'post') !== false || strpos($screen->id, 'page') !== false) {
            $this->enqueue_block_editor_assets();
        }
    }

    /**
     * フロントエンド用アセット (s2j-alliance-manager-gutenberg.css) をキューに追加します。
     * コンストラクターから呼ばれます。
     * 「wp_enqueue_scripts」フックから呼ばれます。
     *
     * @return void
     */
    public function enqueue_frontend_assets() {
        // フロントエンドでのみスタイルと jQuery をキューに追加（管理画面では block.json が自動的に処理）
        if (!is_admin()) {
            // jQuery を確実に読み込む
            wp_enqueue_script('jquery');

            // フロントエンド用スタイルを読み込む (Block と Shortcode で共通)
            wp_enqueue_style(
                's2j-alliance-manager-gutenberg',
                S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/s2j-alliance-manager-gutenberg.css',
                array(),
                S2J_ALLIANCE_MANAGER_VERSION
            );

            // フロントエンド用Reactコンポーネントを読み込む
            wp_enqueue_script(
                's2j-alliance-manager-frontend',
                S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/s2j-alliance-manager-frontend.js',
                array('react', 'react-dom'),
                S2J_ALLIANCE_MANAGER_VERSION,
                true
            );

            // Shortcode が使用されている場合のみ JavaScript を読み込む
            if ($this->is_shortcode_used()) {
                wp_enqueue_script(
                    's2j-alliance-manager-gutenberg',
                    S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/s2j-alliance-manager-gutenberg.js',
                    array('jquery'),
                    S2J_ALLIANCE_MANAGER_VERSION,
                    true
                );
            }
        }
    }

    /**
     * 現在のページで Shortcode が使用されているかチェックします。
     * 「enqueue_frontend_assets()」メソッドから呼ばれます。
     *
     * @return bool
     */
    private function is_shortcode_used() {
        global $post;

        if (!$post) {
            return false;
        }

        // 投稿内容に shortcode が含まれているかチェック
        if (has_shortcode($post->post_content, 'alliance_banner')) {
            return true;
        }

        // Shortcode ブロック内の shortcode もチェック
        if (strpos($post->post_content, '[alliance_banner') !== false) {
            return true;
        }

        return false;
    }

    /**
     * デバッグ情報をヘルプタブに追加します。
     * コンストラクターから呼ばれます。
     * 「admin_head」フックから呼ばれます。
     * 
     * @return void
     */
    public function add_debug_help_tab() {

        // Alliance Manager 専用の管理画面かどうかを判定します。
        if (!$this->is_alliance_manager_admin_page()) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen) {
            return;
        }

        // デバッグ情報の HTML を生成します。
        $debug_info = $this->get_debug_info();

        // 画面のコンテキストヘルプに、ヘルプタブを追加します。
        $screen->add_help_tab(
            array(
                'id' => 's2j-alliance-manager-debug',
                'title' => __('Debug Info', 's2j-alliance-manager'),
                'content' => $debug_info
            )
        );

        // Shortcode ガイドのヘルプタブを追加します。
        $screen->add_help_tab(
            array(
                'id' => 's2j-alliance-manager-shortcode',
                'title' => __('Shortcode Guide', 's2j-alliance-manager'),
                'content' => $this->get_shortcode_help_content()
            )
        );
    }

    /**
     * Alliance Manager 専用の管理画面かどうかを判定します。
     * 「add_debug_help_tab()」メソッドから呼ばれます。
     * 
     * @return bool
     */
    private function is_alliance_manager_admin_page() {
        $screen = get_current_screen();
        if (!$screen) {
            return false;
        }

        // Alliance Manager 関連の管理画面をチェック
        $alliance_manager_pages = array(
            'alliance_banner',
            's2j_am_rank_label',
            'edit-s2j_am_rank_label'
        );

        // 現在の画面が Alliance Manager 関連かチェック
        foreach ($alliance_manager_pages as $page) {
            if (strpos($screen->id, $page) !== false) {
                return true;
            }
        }

        // メインの Alliance Manager 管理画面かチェック
        if (isset($_GET['page']) && strpos($_GET['page'], 's2j-alliance-manager') !== false) {
            return true;
        }

        return false;
    }

    /**
     * デバッグ情報の HTML を生成します。
     * 「add_debug_help_tab()」メソッドから呼ばれます。
     * 
     * @return string
     */
    public function get_debug_info() {
        $blocks_manifest_path = S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'dist/blocks/alliance-banner/block.json';
        $blocks_manifest_exists = file_exists($blocks_manifest_path);
        $blocks_manifest_url = S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/blocks/alliance-banner/block.json';

        // ブロックが登録されているか否かをチェックします。
        $block_registered = $this->is_block_registered();

        $js_exists = file_exists(S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'dist/js/s2j-alliance-manager-gutenberg.js');
        $js_url = S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/s2j-alliance-manager-gutenberg.js';

        // スクリプトが登録とキューに追加されているか否かをチェックします。
        $js_registered = wp_script_is('s2j-alliance-manager-gutenberg', 'registered');
        $js_enqueued = wp_script_is('s2j-alliance-manager-gutenberg', 'enqueued');

        $css_exists = file_exists(S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'dist/css/s2j-alliance-manager-gutenberg.css');
        $css_url = S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/s2j-alliance-manager-gutenberg.css';

        // スタイルが登録とキューに追加されているか否かをチェックします。
        $css_registered = wp_style_is('s2j-alliance-manager-gutenberg', 'registered');
        $css_enqueued = wp_style_is('s2j-alliance-manager-gutenberg', 'enqueued');

        $debug_title = '🔧 ' . __('S2J Alliance Manager Debug Information', 's2j-alliance-manager');
        $debug_description = __("Displays the plugin's operational status and system information.", 's2j-alliance-manager');

        // FFmpeg 情報
        $ffmpeg_settings = get_option('s2j_alliance_manager_settings', array());
        $ffmpeg_path = $ffmpeg_settings['ffmpeg_path'] ?? '';
        $settings_page = new S2J_Alliance_Manager_SettingsPage();
        $ffmpeg_available = $settings_page->test_ffmpeg_availability($ffmpeg_path);

        $ffmpeg_library_title = '🎬 ' . __('FFmpeg Library', 's2j-alliance-manager');
        $ffmpeg_available_label = __('FFmpeg Available', 's2j-alliance-manager');
        $ffmpeg_available_class = $ffmpeg_available ? 's2j-debug-value--success' : 's2j-debug-value--error';
        $ffmpeg_available_text = $ffmpeg_available ? __('Yes', 's2j-alliance-manager') : __('To be confirmed', 's2j-alliance-manager');

        $ffmpeg_path_label = __('FFmpeg path', 's2j-alliance-manager');
        $ffmpeg_path_value = esc_html($ffmpeg_path ?: __('Not set', 's2j-alliance-manager'));

        // WordPress 環境情報
        $wordpress_environment_title = '🌐 ' . __('WordPress Environment', 's2j-alliance-manager');
        $wordpress_version_label = __('WordPress Version', 's2j-alliance-manager');
        $wordpress_version_value = get_bloginfo('version');

        $gutenberg_available_label = __('Gutenberg Available', 's2j-alliance-manager');
        $gutenberg_status_class = function_exists('register_block_type') ? 's2j-debug-value--success' : 's2j-debug-value--error';
        $gutenberg_status_text = function_exists('register_block_type') ? __('✅ Yes', 's2j-alliance-manager') : __('❌ No', 's2j-alliance-manager');

        // ブロック情報
        $block_information_title = '🧩 ' . __('Block Information', 's2j-alliance-manager');
        $block_registered_label = __('Block Registered', 's2j-alliance-manager');
        $block_registered_class = $block_registered ? 's2j-debug-value--success' : 's2j-debug-value--error';
        $block_registered_text = $block_registered ? __('✅ Yes', 's2j-alliance-manager') : __('❌ No', 's2j-alliance-manager');

        // ブロックマニフェスト情報
        $block_manifest_label = __('Block Manifest', 's2j-alliance-manager');
        $block_manifest_class = $blocks_manifest_exists ? 's2j-debug-value--success' : 's2j-debug-value--error';
        $block_manifest_text = $blocks_manifest_exists ? __('✅ Exists', 's2j-alliance-manager') : __('❌ Missing', 's2j-alliance-manager');
        $manifest_url_label = __('Manifest URL', 's2j-alliance-manager');
        $manifest_url_value = esc_url($blocks_manifest_url);
        $manifest_url_display_text = esc_html($blocks_manifest_url);

        // JavaScript 情報
        $js_assets_title = '📜 ' . __('JavaScript Assets', 's2j-alliance-manager');
        $js_file_exists_label = __('File Exists', 's2j-alliance-manager');
        $js_file_exists_class = $js_exists ? 's2j-debug-value--success' : 's2j-debug-value--error';
        $js_file_exists_text = $js_exists ? __('✅ Yes', 's2j-alliance-manager') : __('❌ No', 's2j-alliance-manager');

        $js_registered_label = __('Registered', 's2j-alliance-manager');
        $js_registered_class = $js_registered ? 's2j-debug-value--success' : 's2j-debug-value--error';
        $js_registered_text = $js_registered ? __('✅ Yes', 's2j-alliance-manager') : __('❌ No', 's2j-alliance-manager');

        $js_enqueued_label = __('Enqueued', 's2j-alliance-manager');
        $js_enqueued_class = $js_enqueued ? 's2j-debug-value--success' : 's2j-debug-value--info';
        $js_enqueued_text = $js_enqueued ? __('✅ Yes', 's2j-alliance-manager') : __('ℹ️ No (Normal)', 's2j-alliance-manager');

        $js_file_url_label = __('File URL', 's2j-alliance-manager');
        $js_file_url_value = esc_url($js_url);
        $js_file_url_display_text = esc_html($js_url);

        // CSS 情報
        $css_assets_title = '🎨 ' . __('CSS Assets', 's2j-alliance-manager');
        $css_file_exists_label = __('File Exists', 's2j-alliance-manager');
        $css_file_exists_class = $css_exists ? 's2j-debug-value--success' : 's2j-debug-value--error';
        $css_file_exists_text = $css_exists ? __('✅ Yes', 's2j-alliance-manager') : __('❌ No', 's2j-alliance-manager');

        $css_registered_label = __('Registered', 's2j-alliance-manager');
        $css_registered_class = $css_registered ? 's2j-debug-value--success' : 's2j-debug-value--error';
        $css_registered_text = $css_registered ? __('✅ Yes', 's2j-alliance-manager') : __('❌ No', 's2j-alliance-manager');

        $css_enqueued_label = __('Enqueued', 's2j-alliance-manager');
        $css_enqueued_class = $css_enqueued ? 's2j-debug-value--success' : 's2j-debug-value--info';
        $css_enqueued_text = $css_enqueued ? __('✅ Yes', 's2j-alliance-manager') : __('ℹ️ No (Normal)', 's2j-alliance-manager');
        $css_file_url_label = __('File URL', 's2j-alliance-manager');
        $css_file_url_value = esc_url($css_url);
        $css_file_url_display_text = esc_html($css_url);

        $debug_tip_message = '💡 <strong>' . __('Tip:', 's2j-alliance-manager') . '</strong>' . __('When the block is used, JavaScript and CSS are automatically loaded.', 's2j-alliance-manager');
        $refresh_text = __('Refresh Debug Info', 's2j-alliance-manager');

        $html = <<<HTML01
        <div class="s2j-debug-info">
            <div class="s2j-debug-header">
                <h2>{$debug_title}</h2>
                <p>{$debug_description}</p>
                <button type="button" id="s2j-refresh-debug-info" class="button button-secondary">
                    <span class="dashicons dashicons-update" style="vertical-align: middle; margin-right: 5px;"></span>
                    <span class="refresh-text">{$refresh_text}</span>
                </button>
            </div>
            <div class="s2j-debug-section">
                <div class="s2j-debug-section-header">
                    <h3>{$ffmpeg_library_title}</h3>
                </div>
                <div class="s2j-debug-section-content">
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$ffmpeg_available_label}</span>
                        <span class="s2j-debug-value {$ffmpeg_available_class}">{$ffmpeg_available_text}</span>
                    </div>
                    <div class="s2j-debug-url-section">
                        <span class="s2j-debug-label">{$ffmpeg_path_label}</span>
                        <div class="s2j-debug-url-container">
                            <span>{$ffmpeg_path_value}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="s2j-debug-section">
                <div class="s2j-debug-section-header">
                    <h3>{$wordpress_environment_title}</h3>
                </div>
                <div class="s2j-debug-section-content">
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$wordpress_version_label}</span>
                        <span class="s2j-debug-value s2j-debug-value--info">{$wordpress_version_value}</span>
                    </div>
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$gutenberg_available_label}</span>
                        <span class="s2j-debug-value {$gutenberg_status_class}">{$gutenberg_status_text}</span>
                    </div>
                </div>
            </div>
            <div class="s2j-debug-section">
                <div class="s2j-debug-section-header">
                    <h3>{$block_information_title}</h3>
                </div>
                <div class="s2j-debug-section-content">
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$block_registered_label}</span>
                        <span class="s2j-debug-value {$block_registered_class}">{$block_registered_text}</span>
                    </div>
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$block_manifest_label}</span>
                        <span class="s2j-debug-value {$block_manifest_class}">{$block_manifest_text}</span>
                    </div>
                    <div class="s2j-debug-url-section">
                        <div class="s2j-debug-label">{$manifest_url_label}</div>
                        <div class="s2j-debug-url-container">
                            <a href="{$manifest_url_value}" target="_blank" class="s2j-debug-url-link">{$manifest_url_display_text}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="s2j-debug-section">
                <div class="s2j-debug-section-header">
                    <h3>{$js_assets_title}</h3>
                </div>
                <div class="s2j-debug-section-content">
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$js_file_exists_label}</span>
                        <span class="s2j-debug-value {$js_file_exists_class}">{$js_file_exists_text}</span>
                    </div>
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$js_registered_label}</span>
                        <span class="s2j-debug-value {$js_registered_class}">{$js_registered_text}</span>
                    </div>
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$js_enqueued_label}</span>
                        <span class="s2j-debug-value {$js_enqueued_class}">{$js_enqueued_text}</span>
                    </div>
                    <div class="s2j-debug-url-section">
                        <div class="s2j-debug-label">{$js_file_url_label}</div>
                        <div class="s2j-debug-url-container">
                            <a href="{$js_file_url_value}" target="_blank" class="s2j-debug-url-link">{$js_file_url_display_text}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="s2j-debug-section">
                <div class="s2j-debug-section-header">
                    <h3>{$css_assets_title}</h3>
                </div>
                <div class="s2j-debug-section-content">
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$css_file_exists_label}</span>
                        <span class="s2j-debug-value {$css_file_exists_class}">{$css_file_exists_text}</span>
                    </div>
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$css_registered_label}</span>
                        <span class="s2j-debug-value {$css_registered_class}">{$css_registered_text}</span>
                    </div>
                    <div class="s2j-debug-row">
                        <span class="s2j-debug-label">{$css_enqueued_label}</span>
                        <span class="s2j-debug-value {$css_enqueued_class}">{$css_enqueued_text}</span>
                    </div>
                    <div class="s2j-debug-url-section">
                        <div class="s2j-debug-label">{$css_file_url_label}</div>
                        <div class="s2j-debug-url-container">
                            <a href="{$css_file_url_value}" target="_blank" class="s2j-debug-url-link">{$css_file_url_display_text}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="s2j-debug-footer">
                <p>{$debug_tip_message}</p>
            </div>
        </div>
        HTML01;

        return $html;
    }

    /**
     * ブロックが登録されているか否かをチェックします。
     * 「get_debug_info()」メソッドから呼ばれます。
     *
     * @return boolean $block_registered ブロックが登録されているか否か
     */
    public function is_block_registered() {
        return WP_Block_Type_Registry::get_instance()->is_registered('s2j-alliance-manager/alliance-banner');
    }

    /**
     * Classic エディター用のメタボックスを登録します。
     * コンストラクターから呼ばれます。
     * 「init」フックから呼ばれます。
     * 
     * Note: Classic Editor は Gutenberg ブロックのフォールバックとして位置づけています。
     *
     * @return void
     */
    public function register_meta_boxes() {
        // Gutenberg が利用可能な場合は Classic エディターのメタボックスは登録しない
        if (function_exists('register_block_type')) {
            add_action('add_meta_boxes', array($this, 'add_alliance_meta_box'));
        }
    }

    /**
     * メタボックスを追加します。
     * 「register_meta_boxes」フックから呼ばれます。
     * 「add_meta_boxes」フックから呼ばれます。
     *
     * @return void
     */
    public function add_alliance_meta_box() {
        // 登録済みの「投稿タイプ」オブジェクトのリストを取得します。
        $post_types = get_post_types(array('public' => true), 'names');

        // 登録済みの「投稿タイプ」オブジェクトのリストをループします。
        foreach ($post_types as $post_type) {
            // メタボックスを追加します。
            add_meta_box(
                's2j_alliance_manager_meta_box',
                __('Alliance Banner', 's2j-alliance-manager'),
                array($this, 'alliance_meta_box_callback'),
                $post_type,
                'side',
                'default'
            );
        }
    }

    /**
     * メタボックスとして描画する画面です。
     * 「add_alliance_meta_box()」メソッドから呼ばれます。
     *
     * @param WP_Post $post 投稿
     * @return void
     */
    public function alliance_meta_box_callback($post) {
        ?>
        <div id="s2j-alliance-classic-editor">
            <p>
                <strong><?php _e('Alliance Banner Shortcode', 's2j-alliance-manager'); ?></strong>
            </p>
            <p>
                <?php _e('Use the following shortcode to display alliance banners:', 's2j-alliance-manager'); ?>
            </p>
            <p>
                <code>[alliance_banner displayStyle="grid-single" alignment="center"]</code>
            </p>
            <p>
                <strong><?php _e('Available Attributes:', 's2j-alliance-manager'); ?></strong><br>
                • <code>displayStyle</code>: <?php _e('grid-single, grid-multi', 's2j-alliance-manager'); ?><br>
                • <code>alignment</code>: <?php _e('left, center, right', 's2j-alliance-manager'); ?>
            </p>
            <p>
                <em><?php _e('Note: For advanced features, please use the Gutenberg block editor.', 's2j-alliance-manager'); ?></em>
            </p>
        </div>
        <?php
    }

    /**
     * Shortcode ヘルプのコンテンツを生成します。
     * 管理画面のヘルプタブから呼ばれます。
     * 
     * @return string
     */
    private function get_shortcode_help_content() {
        $shortcode_title = __('Alliance Banner Shortcode', 's2j-alliance-manager');
        $description = __('Use the following shortcode in the Shortcode block to display alliance partner banners:', 's2j-alliance-manager');

        $basic_usage_title = __('Basic Usage', 's2j-alliance-manager');
        $basic_usage_code = '[alliance_banner]';

        $advanced_usage_title = __('Advanced Usage with Attributes', 's2j-alliance-manager');
        $advanced_usage_code = '[alliance_banner displayStyle="grid-single" alignment="center"]';

        $attributes_title = __('Available Attributes', 's2j-alliance-manager');
        $display_style_label = __('displayStyle', 's2j-alliance-manager');
        $display_style_values = __('grid-single (default), grid-multi', 's2j-alliance-manager');
        $alignment_label = __('alignment', 's2j-alliance-manager');
        $alignment_values = __('left, center (default), right', 's2j-alliance-manager');

        $examples_title = __('Examples', 's2j-alliance-manager');
        $example1 = '[alliance_banner displayStyle="grid-multi"]';
        $example2 = '[alliance_banner alignment="left"]';

        $note_title = __('How to Use', 's2j-alliance-manager');
        $note_text = function_exists('register_block_type') ? __('1. Add a "Shortcode" block to your post/page. 2. Paste the shortcode into the block. 3. The alliance banners will be displayed automatically.', 's2j-alliance-manager') : __('For advanced features and better user experience, we recommend using the Gutenberg block editor.', 's2j-alliance-manager');

        $html = <<<HTML
        <div class="s2j-shortcode-help">
            <h3>{$shortcode_title}</h3>
            <p>{$description}</p>
            <h4>{$basic_usage_title}</h4>
            <p><code>{$basic_usage_code}</code></p>
            <h4>{$advanced_usage_title}</h4>
            <p><code>{$advanced_usage_code}</code></p>
            <h4>{$attributes_title}</h4>
            <ul>
                <li><strong>{$display_style_label}</strong>: {$display_style_values}</li>
                <li><strong>{$alignment_label}</strong>: {$alignment_values}</li>
            </ul>
            <h4>{$examples_title}</h4>
            <p><code>{$example1}</code></p>
            <p><code>{$example2}</code></p>
            <h4>{$note_title}</h4>
            <p><em>{$note_text}</em></p>
        </div>
        HTML;

        return $html;
    }

    /**
     * Shortcode ブロックの処理を監視してアセットを読み込みます。
     * コンストラクターから呼ばれます。
     * 「render_block」フックから呼ばれます。
     *
     * @param string $block_content ブロックのコンテンツ
     * @param array $block ブロックの配列
     * @return string $block_content ブロックのコンテンツ
     */
    public function handle_shortcode_block($block_content, $block) {
        // Shortcode ブロックかどうかをチェック
        if ($block['blockName'] === 'core/shortcode') {
            // ブロック内に shortcode が含まれているかチェック
            if (strpos($block_content, '[alliance_banner') !== false || strpos($block_content, '[test_alliance') !== false) {
                // アセットを強制的に読み込む
                $this->force_enqueue_assets();

                // ショートコードを実行
                $block_content = do_shortcode($block_content);
            }
        }

        return $block_content;
    }

    /**
     * コンテンツ内のショートコードを処理します。
     * 「the_content」フックから呼ばれます。
     *
     * @param string $content 投稿のコンテンツ
     * @return string $content 処理後のコンテンツ
     */
    public function process_shortcodes_in_content($content) {
        // 管理画面では実行しない
        if (is_admin()) {
            return $content;
        }

        // ショートコードが含まれているかチェック
        if (strpos($content, '[alliance_banner') !== false || strpos($content, '[test_alliance') !== false) {
            // アセットを強制的に読み込む
            $this->force_enqueue_assets();

            // ショートコードを実行
            $content = do_shortcode($content);
        }

        return $content;
    }

    /**
     * アセットを強制的に読み込みます。
     * 「handle_shortcode_block()」メソッドから呼ばれます。
     *
     * @return void
     */
    private function force_enqueue_assets() {
        // 既に読み込まれている場合はスキップ
        if (wp_style_is('s2j-alliance-manager-gutenberg', 'enqueued')) {
            return;
        }

        // フロントエンド用スタイルを読み込む
        wp_enqueue_style(
            's2j-alliance-manager-gutenberg',
            S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/s2j-alliance-manager-gutenberg.css',
            array(),
            S2J_ALLIANCE_MANAGER_VERSION
        );

        // フロントエンド用スクリプトを読み込む
        wp_enqueue_script(
            's2j-alliance-manager-gutenberg',
            S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/s2j-alliance-manager-gutenberg.js',
            array('jquery'),
            S2J_ALLIANCE_MANAGER_VERSION,
            true
        );
    }
}
