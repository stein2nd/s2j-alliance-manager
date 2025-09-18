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
     * コンストラクター
     */
    public function __construct() {
        // `block.json` ファイルから Gutenberg ブロックタイプ (s2j-alliance-manager/alliance-banner) を登録します。
        add_action('init', array($this, 'register_blocks'), 20);
        
        // Classic エディター用のメタボックスを登録します。
        add_action('init', array($this, 'register_meta_boxes'));

        // Gutenberg エディター用登録済みスクリプトとスタイルのアセット (s2j-alliance-manager-gutenberg) をキューに追加します。
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets'));
        
        // フロントエンド用アセット (s2j-alliance-manager-gutenberg.css) をキューに追加します。
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        
        // デバッグ用のヘルプタブを表示します（Alliance Manager専用管理画面でのみ）。
        if (is_admin()) {
            add_action('admin_head', array($this, 'add_debug_help_tab'));
        }
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
        
        if (file_exists($js_path)) {
            // スクリプトを登録します（block.json で参照されるため必要）
            wp_register_script(
                's2j-alliance-manager-gutenberg',
                S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/s2j-alliance-manager-gutenberg.js',
                array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
                S2J_ALLIANCE_MANAGER_VERSION,
                true
            );
        }
        
        if (file_exists($css_path)) {
            // スタイルを登録します（block.json で参照されるため必要）
            wp_register_style(
                's2j-alliance-manager-gutenberg',
                S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/s2j-alliance-manager-gutenberg.css',
                array('wp-edit-blocks'),
                S2J_ALLIANCE_MANAGER_VERSION
            );
        }
    }

    /**
     * ブロックをレンダリングします。
     * 「register_blocks()」メソッドから呼ばれます。
     * 「register_block_type()」メソッドの「render_callback」属性から呼ばれます。
     *
     * @param array<string, string> $attributes 属性
     * @return string $html ブロックのHTML
     */
    public function render_alliance_banner_block($attributes) {
        $display_style = $attributes['displayStyle'] ?? 'grid-single';
        $alignment = $attributes['alignment'] ?? 'center';
        
        // コンテンツデータを取得します。
        $alliance_data = $this->get_alliance_data();
        
        // デバッグ用ログ（一時的）
        if (defined('WP_DEBUG') && WP_DEBUG) {
            // 設定データも確認
            $settings = get_option('s2j_alliance_manager_settings', array());

            // ランクラベルも確認
            $rank_labels = get_posts(array(
                'post_type' => 's2j_am_rank_label',
                'post_status' => 'publish',
                'numberposts' => -1,
                'orderby' => 'menu_order',
                'order' => 'ASC'
            ));
        }

        if (empty($alliance_data)) {
            return '<p>' . __('No alliance partners found.', 's2j-alliance-manager') . '</p>';
        }

        ob_start();

        // クラス名の構築
        $banner_class = 's2j-alliance-banner s2j-alliance-banner--' . esc_attr($display_style);
        if ($display_style === 'grid-single') {
            $banner_class .= ' s2j-alliance-banner--align-' . esc_attr($alignment);
        }
        ?>
        <div class="<?php echo $banner_class; ?>">
            <?php foreach ($alliance_data as $rank => $partners): ?>
                <div class="s2j-alliance-rank">
                    <h3 class="s2j-alliance-rank-title"><?php echo esc_html($rank); ?></h3>
                    <div class="s2j-alliance-partners">
                        <?php foreach ($partners as $partner): ?>
                            <div class="s2j-alliance-partner">
                                <?php if (isset($partner['is_placeholder']) && $partner['is_placeholder']): ?>
                                    <?php // 該当レコードなしの場合 ?>
                                    <div class="s2j-alliance-partner-placeholder">
                                        <?php echo esc_html($partner['message']); ?>
                                    </div>
                                <?php else: ?>
                                    <?php // 通常のパートナーレコード ?>
                                    <?php 
                                    $trimmed_jump_url = trim($partner['jump_url']);
                                    if ($partner['behavior'] === 'jump' && !empty($trimmed_jump_url)): ?>
                                        <?php // リンクの場合 ?>
                                        <a href="<?php echo esc_url($trimmed_jump_url); ?>" 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           class="s2j-alliance-partner-link">
                                            <?php echo $this->render_partner_logo($partner); ?>
                                        </a>
                                    <?php elseif ($partner['behavior'] === 'modal'): ?>
                                        <?php // モーダルの場合 ?>
                                        <div class="s2j-alliance-partner-modal" 
                                             data-message="<?php echo esc_attr($partner['message']); ?>"
                                             data-jump-url="<?php echo esc_attr($partner['jump_url']); ?>"
                                             data-logo-id="<?php echo esc_attr($partner['logo']); ?>">
                                            <?php echo $this->render_partner_logo($partner); ?>
                                        </div>
                                    <?php else: ?>
                                        <?php // jump_url が空の場合、何もラップしない ?>
                                        <?php echo $this->render_partner_logo($partner); ?>
                                    <?php endif; ?>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <?php // アライアンスパートナー向けメッセージ用モーダル ?>
        <div id="s2j-alliance-modal" class="s2j-alliance-modal" style="display: none;">
            <div class="s2j-alliance-modal-content">
                <span class="s2j-alliance-modal-close">&times;</span>
                <div class="s2j-alliance-modal-grid">
                    <div class="s2j-alliance-modal-cell s2j-alliance-modal-logo-cell">
                        <div class="s2j-alliance-modal-logo"></div>
                        <div class="s2j-alliance-modal-jump-url"></div>
                    </div>
                    <div class="s2j-alliance-modal-cell s2j-alliance-modal-message-cell">
                        <div class="s2j-alliance-modal-message"></div>
                    </div>
                </div>
            </div>
        </div>
        <?php // アライアンスパートナー向けメッセージ用モーダル・スクリプト ?>
        <script>
        (function() {
            function initAllianceModal() {
                // jQuery が利用可能かチェック
                if (typeof jQuery === 'undefined') {
                    // jQuery が利用できない場合は、setTimeout で再試行
                    setTimeout(initAllianceModal, 100);
                    return;
                }

                jQuery(document).ready(function($) {
                    $('.s2j-alliance-partner-modal').on('click', function() {
                        var $this = $(this);
                        var message = $this.data('message');
                        var jumpUrl = $this.data('jump-url');
                        var logoId = $this.data('logo-id');

                        // メッセージの処理（先頭・末尾の改行・TAB 文字をトリム）
                        var trimmedMessage = message ? message.replace(/^[\n\t\s]+|[\n\t\s]+$/g, '') : '';

                        // ジャンプ URL の処理（trim して空文字列でない場合のみ表示）
                        var trimmedJumpUrl = jumpUrl ? jumpUrl.trim() : '';

                        // ロゴの再レンダリング
                        if (logoId) {
                            // 既存のロゴ HTML を取得してモーダルに表示
                            var logoHtml = $this.find('.s2j-alliance-partner-logo, .s2j-alliance-partner-placeholder').clone();
                            $('#s2j-alliance-modal .s2j-alliance-modal-logo').html(logoHtml);
                        } else {
                            $('#s2j-alliance-modal .s2j-alliance-modal-logo').html('<div class="s2j-alliance-partner-placeholder">' + '<?php echo esc_js(__("No logo", "s2j-alliance-manager")); ?>' + '</div>');
                        }

                        // ジャンプ URL の表示
                        if (trimmedJumpUrl) {
                            $('#s2j-alliance-modal .s2j-alliance-modal-jump-url').html('<a href="' + encodeURIComponent(trimmedJumpUrl) + '" target="_blank" rel="noopener noreferrer" class="s2j-alliance-modal-link">' + trimmedJumpUrl + '</a>');
                        } else {
                            $('#s2j-alliance-modal .s2j-alliance-modal-jump-url').empty();
                        }

                        // メッセージの表示
                        if (trimmedMessage) {
                            // 改行を保持して表示
                            var formattedMessage = trimmedMessage.replace(/\n/g, '<br>');
                            $('#s2j-alliance-modal .s2j-alliance-modal-message').html(formattedMessage);
                        } else {
                            $('#s2j-alliance-modal .s2j-alliance-modal-message').empty();
                        }

                        $('#s2j-alliance-modal').show();
                    });

                    $('.s2j-alliance-modal-close').on('click', function() {
                        $('#s2j-alliance-modal').hide();
                    });

                    $(document).on('click', function(e) {
                        if ($(e.target).hasClass('s2j-alliance-modal')) {
                            $('#s2j-alliance-modal').hide();
                        }
                    });
                });
            }

            // 初期化を開始
            initAllianceModal();
        })();
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
                function($item) use ($rank_title) {
                    // 大文字小文字を区別しない比較と、default の特別処理
                    $item_rank = isset($item['rank']) ? strtolower($item['rank']) : '';
                    $rank_title_lower = strtolower($rank_title);

                    // default は最初のランク (Silver) にマッチさせる
                    if ($item_rank === 'default' && $rank_title_lower === 'silver') {
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
     * パートナーロゴを、画像の場合は画像タグ、動画の場合は動画タグとして、レンダリングします。
     * 「render_alliance_banner_block()」メソッドから呼ばれます。
     *
     * @param array<string, int|string> $partner パートナー
     * @return string $logo_html パートナーロゴ
     */
    private function render_partner_logo($partner) {
        if (empty($partner['logo'])) {
            return '<div class="s2j-alliance-partner-placeholder">' . 
                   __('No logo', 's2j-alliance-manager') . '</div>';
        }

        // 添付ファイルの URL を取得します。
        $logo_url = wp_get_attachment_url($partner['logo']);
        if (!$logo_url) {
            return '<div class="s2j-alliance-partner-placeholder">' . 
                   __('Invalid logo', 's2j-alliance-manager') . '</div>';
        }

        // 指定された投稿 ID の投稿メタフィールドを取得します。
        $alt_text = get_post_meta($partner['logo'], '_wp_attachment_image_alt', true);
        if (empty($alt_text)) {
            $alt_text = __('Alliance partner logo', 's2j-alliance-manager');
        }

        // ID に基づいて添付ファイルの MIME タイプを取得し、動画の場合は動画タグ、画像の場合は画像タグとしてレンダリングします。
        $mime_type = get_post_mime_type($partner['logo']);
        if (strpos($mime_type, 'video/') === 0) {
            return sprintf(
                '<video src="%s" class="s2j-alliance-partner-logo" controls></video>',
                esc_url($logo_url)
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

            // フロントエンド用スタイルを読み込む
            wp_enqueue_style(
                's2j-alliance-manager-gutenberg',
                S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/s2j-alliance-manager-gutenberg.css',
                array(),
                S2J_ALLIANCE_MANAGER_VERSION
            );
        }
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
            's2j-alliance-manager',
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
    private function get_debug_info() {
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

        $html = <<<HTML01
        <div class="s2j-debug-info">
            <div class="s2j-debug-header">
                <h2>{$debug_title}</h2>
                <p>{$debug_description}</p>
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
     * @return void
     */
    public function register_meta_boxes() {
        add_action('add_meta_boxes', array($this, 'add_alliance_meta_box'));
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
        wp_nonce_field('s2j_alliance_manager_meta_box', 's2j_alliance_manager_meta_box_nonce');

        $display_style = get_post_meta($post->ID, '_s2j_alliance_display_style', true);

        if (empty($display_style)) {
            $settings = get_option('s2j_alliance_manager_settings', array());

            $display_style = $settings['display_style'] ?? 'grid-single';
        }

        ?>
        <div id="s2j-alliance-classic-editor">
            <p>
                <label for="s2j_alliance_display_style">
                    <?php _e('Display Style:', 's2j-alliance-manager'); ?>
                </label>
                <select name="s2j_alliance_display_style" id="s2j_alliance_display_style">
                    <option value="grid-single" <?php selected($display_style, 'grid-single'); ?>>
                        <?php _e('Single Column Grid', 's2j-alliance-manager'); ?>
                    </option>
                    <option value="grid-multi" <?php selected($display_style, 'grid-multi'); ?>>
                        <?php _e('Multi Column Grid', 's2j-alliance-manager'); ?>
                    </option>
                    <?php // Masonry Layout will be available in pro version ?>
                </select>
            </p>
            <p>
                <button type="button" class="button button-primary" id="s2j-insert-alliance-banner">
                    <?php _e('Insert Alliance Banner', 's2j-alliance-manager'); ?>
                </button>
            </p>
        </div>
        <?php
    }
}
