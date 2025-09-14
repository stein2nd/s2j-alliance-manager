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
        // JavaScript と CSS は block.json の設定により自動的に処理されるため、ここでは登録しません。
        // これにより、ブロックが使用される時のみアセットが読み込まれます。
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
        
        // コンテンツデータを取得します。
        $alliance_data = $this->get_alliance_data();
        
        
        if (empty($alliance_data)) {
            return '<p>' . __('No alliance partners found.', 's2j-alliance-manager') . '</p>';
        }
        
        ob_start();
        ?>
        <div class="s2j-alliance-banner s2j-alliance-banner--<?php echo esc_attr($display_style); ?>">
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
                                    <?php if ($partner['behavior'] === 'jump' && !empty($partner['jump_url'])): ?>
                                        <?php // リンクの場合 ?>
                                        <a href="<?php echo esc_url($partner['jump_url']); ?>" 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           class="s2j-alliance-partner-link">
                                            <?php echo $this->render_partner_logo($partner); ?>
                                        </a>
                                    <?php else: ?>
                                        <?php // モーダルの場合 ?>
                                        <div class="s2j-alliance-partner-modal" 
                                             data-message="<?php echo esc_attr($partner['message']); ?>">
                                            <?php echo $this->render_partner_logo($partner); ?>
                                        </div>
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
                <div class="s2j-alliance-modal-message"></div>
            </div>
        </div>
        <?php // アライアンスパートナー向けメッセージ用モーダル・スクリプト ?>
        <script>
        jQuery(document).ready(function($) {
            $('.s2j-alliance-partner-modal').on('click', function() {
                var message = $(this).data('message');
                $('#s2j-alliance-modal .s2j-alliance-modal-message').html(message);
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
                    return isset($item['rank']) && $item['rank'] === $rank_title && isset($item['frontpage']) && $item['frontpage'] === 'YES';
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
        
        // 投稿エディタ/ページエディターか否かを確認します。
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
        // フロントエンドでのみスタイルをキューに追加（管理画面では block.json が自動的に処理）
        if (!is_admin()) {
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

        // Alliance Manager専用の管理画面かどうかを判定します。
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
     * Alliance Manager専用の管理画面かどうかを判定します。
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

        $html = <<<HTML01
        <div class="s2j-debug-info" style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen-Sans, Ubuntu, Cantarell, \'Helvetica Neue\', sans-serif;">
            <div style="background: #f1f1f1; padding: 15px; margin: -10px -10px 20px -10px; border-left: 4px solid #0073aa;">
        HTML01;

        $html .= '<h2 style="margin: 0; color: #23282d; font-size: 18px;">🔧' . __('S2J Alliance Manager Debug Information', 's2j-alliance-manager') . '</h2>';
        $html .= '<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">' . __("Displays the plugin's operational status and system information.", 's2j-alliance-manager') . '</p>';

        $html .= <<<HTML01A
            </div>
            <div style="background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; margin-bottom: 20px; overflow: hidden;">
                <div style="background: #f9f9f9; padding: 12px 15px; border-bottom: 1px solid #ccd0d4;">
        HTML01A;

        $html .= '<h3 style="margin: 0; font-size: 16px; color: #23282d;">🌐 ' . __('WordPress Environment', 's2j-alliance-manager') . '</h3>';

        $html .= <<<HTML01B
                </div>
                <div style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f1;">
        HTML01B;

        $html .= '<span style="font-weight: 600; color: #23282d;">' . __('WordPress Version', 's2j-alliance-manager') . '</span>';

        $html .= <<<HTML01C
                        <span style="background: #e7f3ff; color: #0073aa; padding: 4px 8px; border-radius: 3px; font-size: 13px;">
        HTML01C;

        // WordPress環境情報
        $html .= '' . get_bloginfo('version') . '</span>';

        $html .= <<<HTML02
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
        HTML02;

        $html .= '<span style="font-weight: 600; color: #23282d;">' . __('Gutenberg Available', 's2j-alliance-manager') . '</span>';
        $html .= '<span style="background: ' . (function_exists('register_block_type') ? '#d4edda' : '#f8d7da') . '; color: ' . (function_exists('register_block_type') ? '#155724' : '#721c24') . '; padding: 4px 8px; border-radius: 3px; font-size: 13px;">' . (function_exists('register_block_type') ? '✅ Yes' : '❌ No') . '</span>';

        $html .= <<<HTML03
                    </div>
                </div>
            </div>
            <div style="background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; margin-bottom: 20px; overflow: hidden;">
                <div style="background: #f9f9f9; padding: 12px 15px; border-bottom: 1px solid #ccd0d4;">
        HTML03;

        $html .= '<h3 style="margin: 0; font-size: 16px; color: #23282d;">🧩 ' . __('Block Information', 's2j-alliance-manager') . '</h3>';

        $html .= <<<HTML03A
                </div>
                <div style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f1;">
        HTML03A;

        $html .= '<span style="font-weight: 600; color: #23282d;">' . __('Block Registered', 's2j-alliance-manager') . '</span>';

        // ブロック情報
        $html .= '<span style="background: ' . ($block_registered ? '#d4edda' : '#f8d7da') . '; color: ' . ($block_registered ? '#155724' : '#721c24') . '; padding: 4px 8px; border-radius: 3px; font-size: 13px;">' . ($block_registered ? '✅ Yes' : '❌ No') . '</span>';

        $html .= <<<HTML04
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f1;">
        HTML04;

        $html .= '<span style="font-weight: 600; color: #23282d;">' . __('Block Manifest', 's2j-alliance-manager') . '</span>';

        $html .= '<span style="background: ' . ($blocks_manifest_exists ? '#d4edda' : '#f8d7da') . '; color: ' . ($blocks_manifest_exists ? '#155724' : '#721c24') . '; padding: 4px 8px; border-radius: 3px; font-size: 13px;">' . ($blocks_manifest_exists ? '✅ Exists' : '❌ Missing') . '</span>';

        $html .= <<<HTML05
                    </div>
                    <div style="padding: 8px 0;">
        HTML05;

        $html .= '<div style="font-weight: 600; color: #23282d; margin-bottom: 5px;">' . __('Manifest URL', 's2j-alliance-manager') . '</div>';

        $html .= <<<HTML05A
                        <div style="background: #f8f9fa; padding: 8px; border-radius: 3px; font-family: monospace; font-size: 12px; word-break: break-all;">
        HTML05A;

        $html .= '<a href="' . esc_url($blocks_manifest_url) . '" target="_blank" style="color: #0073aa; text-decoration: none;">' . esc_html($blocks_manifest_url) . '</a>';

        $html .= <<<HTML06
                        </div>
                    </div>
                </div>
            </div>
            <div style="background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; margin-bottom: 20px; overflow: hidden;">
                <div style="background: #f9f9f9; padding: 12px 15px; border-bottom: 1px solid #ccd0d4;">
        HTML06;

        $html .= '<h3 style="margin: 0; font-size: 16px; color: #23282d;">📜' . __('JavaScript Assets', 's2j-alliance-manager') . '</h3>';

        $html .= <<<HTML06A
                </div>
                <div style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f1;">
        HTML06A;

        $html .= '<span style="font-weight: 600; color: #23282d;">' . __('File Exists', 's2j-alliance-manager') . '</span>';

        // JavaScript情報
        $html .= '<span style="background: ' . ($js_exists ? '#d4edda' : '#f8d7da') . '; color: ' . ($js_exists ? '#155724' : '#721c24') . '; padding: 4px 8px; border-radius: 3px; font-size: 13px;">' . ($js_exists ? '✅ Yes' : '❌ No') . '</span>';

        $html .= <<<HTML07
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f1;">
        HTML07;

        $html .= '<span style="font-weight: 600; color: #23282d;">' . __('Registered', 's2j-alliance-manager') . '</span>';

        $html .= '<span style="background: ' . ($js_registered ? '#d4edda' : '#f8d7da') . '; color: ' . ($js_registered ? '#155724' : '#721c24') . '; padding: 4px 8px; border-radius: 3px; font-size: 13px;">' . ($js_registered ? '✅ Yes' : '❌ No') . '</span>';

        $html .= <<<HTML08
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f1;">
        HTML08;

        $html .= '<span style="font-weight: 600; color: #23282d;">' . __('Enqueued', 's2j-alliance-manager') . '</span>';

        $html .= '<span style="background: ' . ($js_enqueued ? '#d4edda' : '#e7f3ff') . '; color: ' . ($js_enqueued ? '#155724' : '#0073aa') . '; padding: 4px 8px; border-radius: 3px; font-size: 13px;">' . ($js_enqueued ? '✅ Yes' : 'ℹ️ No (Normal)') . '</span>';

        $html .= <<<HTML09
                    </div>
                    <div style="padding: 8px 0;">
        HTML09;

        $html .= '<div style="font-weight: 600; color: #23282d; margin-bottom: 5px;">' . __('File URL', 's2j-alliance-manager') . '</div>';

        $html .= <<<HTML09A
                        <div style="background: #f8f9fa; padding: 8px; border-radius: 3px; font-family: monospace; font-size: 12px; word-break: break-all;">
        HTML09A;

        $html .= '<a href="' . esc_url($js_url) . '" target="_blank" style="color: #0073aa; text-decoration: none;">' . esc_html($js_url) . '</a>';

        $html .= <<<HTML09
                        </div>
                    </div>
                </div>
            </div>
            <div style="background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; margin-bottom: 20px; overflow: hidden;">
                <div style="background: #f9f9f9; padding: 12px 15px; border-bottom: 1px solid #ccd0d4;">
        HTML09;

        $html .= '<h3 style="margin: 0; font-size: 16px; color: #23282d;">🎨' . __('CSS Assets', 's2j-alliance-manager') . '</h3>';

        $html .= <<<HTML09A
                </div>
                <div style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f1;">
        HTML09A;

        $html .= '<span style="font-weight: 600; color: #23282d;">' . __('File Exists', 's2j-alliance-manager') . '</span>';

        // CSS情報
        $html .= '<span style="background: ' . ($css_exists ? '#d4edda' : '#f8d7da') . '; color: ' . ($css_exists ? '#155724' : '#721c24') . '; padding: 4px 8px; border-radius: 3px; font-size: 13px;">' . ($css_exists ? '✅ Yes' : '❌ No') . '</span>';

        $html .= <<<HTML10
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f1;">
        HTML10;

        $html .= '<span style="font-weight: 600; color: #23282d;">' . __('Registered', 's2j-alliance-manager') . '</span>';

        $html .= '<span style="background: ' . ($css_registered ? '#d4edda' : '#f8d7da') . '; color: ' . ($css_registered ? '#155724' : '#721c24') . '; padding: 4px 8px; border-radius: 3px; font-size: 13px;">' . ($css_registered ? '✅ Yes' : '❌ No') . '</span>';

        $html .= <<<HTML11
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f1;">
        HTML11;

        $html .= '<span style="font-weight: 600; color: #23282d;">' . __('Enqueued', 's2j-alliance-manager') . '</span>';

        $html .= '<span style="background: ' . ($css_enqueued ? '#d4edda' : '#e7f3ff') . '; color: ' . ($css_enqueued ? '#155724' : '#0073aa') . '; padding: 4px 8px; border-radius: 3px; font-size: 13px;">' . ($css_enqueued ? '✅ Yes' : 'ℹ️ No (Normal)') . '</span>';

        $html .= <<<HTML12
                    </div>
                    <div style="padding: 8px 0;">
        HTML12;

        $html .= '<div style="font-weight: 600; color: #23282d; margin-bottom: 5px;">' . __('File URL', 's2j-alliance-manager') . '</div>';

        $html .= <<<HTML12A
                        <div style="background: #f8f9fa; padding: 8px; border-radius: 3px; font-family: monospace; font-size: 12px; word-break: break-all;">
        HTML12A;

        $html .= '<a href="' . esc_url($css_url) . '" target="_blank" style="color: #0073aa; text-decoration: none;">' . esc_html($css_url) . '</a>';

        $html .= <<<HTML12
                        </div>
                    </div>
                </div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; margin: 20px -10px -10px -10px; border-top: 1px solid #ccd0d4; text-align: center;">
        HTML12;

        $html .= '<p style="margin: 0; color: #666; font-size: 13px;">💡 <strong>' . __('Tip:', 's2j-alliance-manager') . '</strong>' . __('When the block is used, JavaScript and CSS are automatically loaded.', 's2j-alliance-manager') . '</p>';
        
        $html .= <<<HTML12A
                    </div>
        </div>
        HTML12A;

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
