<?php
/**
 * Plugin Name: S2J Alliance Manager
 * Plugin URI: https://github.com/stein2nd/s2j-alliance-manager
 * Description: Manage linked banners (including logos and videos) for partner companies in alliance relationships and display them in blocks on the front page and other locations.
 * Version: 1.0.0
 * Author: stein2nd
 * Author URI: https://s2j.co.jp
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: s2j-alliance-manager
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 *
 * @package S2J_Alliance_Manager
 */

// 直接アクセスされた場合は、終了します。
if (!defined('ABSPATH')) {
    exit;
}

// プラグイン定数を定義します。
define('S2J_ALLIANCE_MANAGER_VERSION', '1.0.0');
define('S2J_ALLIANCE_MANAGER_PLUGIN_FILE', __FILE__);
define('S2J_ALLIANCE_MANAGER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('S2J_ALLIANCE_MANAGER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('S2J_ALLIANCE_MANAGER_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Singleton パターンで実装した、プラグインのメインクラス
 * 
 * @version 1.0.0
 * @since 1.0.0
 * @package S2J_Alliance_Manager
 */
class S2J_Alliance_Manager {
    
    /**
     * クラスの単一インスタンス
     */
    private static $instance = null;
    
    /**
     * Alliance Manager インスタンス
     */
    private $alliance_manager = null;
    
    /**
     * 単一インスタンスを取得します。
     *
     * @return $instance S2J_Alliance_Manager_AllianceManager インスタンス
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
    private function __construct() {
        // フックを初期化します。
        $this->init_hooks();

        // プラグインの依存関係をロードします。
        $this->load_dependencies();
    }
    
    /**
     * プラグインの依存関係をロードします。
     * 「コンストラクター」から呼ばれます。
     *
     * @return void
     */
    private function load_dependencies() {
        // 設定ページ
        require_once S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'includes/SettingsPage.php';

        // REST API コントローラー
        require_once S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'includes/RestController.php';

        // Alliance Manager
        require_once S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'includes/AllianceManager.php';
    }

    /**
     * フックを初期化します。
     * 「コンストラクター」から呼ばれます。
     *
     * @return void
     */
    private function init_hooks() {
        // プラグインを初期化します。
        add_action('init', array($this, 'init'));

        // 管理用アセット (s2j-alliance-manager-admin.js, s2j-alliance-manager-admin.css) を、キューに追加します。
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));

        // フロントエンド用スクリプトとフロントエンド用スタイルをキューに追加します。
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));

        // プラグインの翻訳済み文字列をロードします。
        add_action('plugins_loaded', array($this, 'load_textdomain'));
        
        // プラグインの起動フックを設定します。
        register_activation_hook(__FILE__, array($this, 'activate'));

        // プラグインの無効化フックを設定します。
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
        
    /**
     * プラグインを初期化します。
     * 「init」フックから呼ばれます。
     *
     * @return void
     */
    public function init() {
        // 重複初期化を防ぐ
        if ($this->alliance_manager !== null) {
            return;
        }
        
        // カスタム投稿タイプを登録します。
        $this->register_custom_post_types();
        
        // REST API コントローラー を初期化します。
        new S2J_Alliance_Manager_RestController();
        
        // 追加機能のため、AllianceManager を初期化します。
        $this->alliance_manager = new S2J_Alliance_Manager_AllianceManager();
        
        // 設定ページを初期化します。
        if (is_admin()) {
            new S2J_Alliance_Manager_SettingsPage();
        }
    }
    
    /**
     * 管理用アセット (s2j-alliance-manager-admin.js, s2j-alliance-manager-admin.css) を、キューに追加します。
     * 「admin_enqueue_scripts」フックから呼ばれます。
     *
     * @param mixed $hook
     * @return void
     */
    public function admin_enqueue_scripts($hook) {
        // 管理ページでのみ読み込みます。
        if (strpos($hook, 's2j-alliance-manager') === false) {
            return;
        }
        
        // メディアアップローダー用に、WordPress メディアスクリプトをキューに追加します。
        wp_enqueue_media();
        
        // 管理用スクリプトをキューに追加します。
        wp_enqueue_script(
            's2j-alliance-manager-admin',
            S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/s2j-alliance-manager-admin.js',
            array('jquery', 'wp-api-fetch', 'wp-components', 'wp-element', 'react', 'react-dom'),
            S2J_ALLIANCE_MANAGER_VERSION,
            true
        );
        
        // 管理用スタイルをキューに追加します。
        wp_enqueue_style(
            's2j-alliance-manager-admin',
            S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/s2j-alliance-manager-admin.css',
            array('wp-components'),
            S2J_ALLIANCE_MANAGER_VERSION
        );
        
        // 管理用スクリプトをローカライズします。
        wp_localize_script(
            's2j-alliance-manager-admin', 
            's2jAllianceManager', 
            array(
                'apiUrl' => rest_url('s2j-alliance-manager/v1/'),
                'nonce' => wp_create_nonce('wp_rest'),
                'strings' => array(
                    'save' => __('Save', 's2j-alliance-manager'),
                    'cancel' => __('Cancel', 's2j-alliance-manager'),
                    'delete' => __('Delete', 's2j-alliance-manager'),
                    'edit' => __('Edit', 's2j-alliance-manager'),
                    'addNew' => __('Add New', 's2j-alliance-manager'),
                    'confirmDelete' => __('Are you sure you want to delete this item?', 's2j-alliance-manager'),
                )
            )
        );
    }
    
    /**
     * フロントエンド用スクリプトとフロントエンド用スタイルをキューに追加します。
     * 「wp_enqueue_scripts」フックから呼ばれます。
     *
     * @return void
     */
    public function frontend_enqueue_scripts() {
        // ブロック・アセットは、register_block_type と block.json によって自動的にキューに追加されます。
        // このメソッドは、必要に応じて追加のフロントエンド・アセット用に用意されています。
    }
    
    /**
     * プラグインの翻訳済み文字列をロードします。
     * 「plugins_loaded」フックから呼ばれます。
     *
     * @return void
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            's2j-alliance-manager',
            false,
            dirname(S2J_ALLIANCE_MANAGER_PLUGIN_BASENAME) . '/languages'
        );
    }
        
    /**
     * プラグインの無効化フック
     * 「register_deactivation_hook()」メソッドから呼ばれます。
     *
     * @return void
     */
    public function deactivate() {
        // リライトルールを削除した後、リライトルールを再作成します。
        flush_rewrite_rules();
    }

    /**
     * プラグインの起動フック。
     * 「register_activation_hook()」メソッドから呼ばれます。
     *
     * @return void
     */
    public function activate() {
        // デフォルトのオプションを設定し、新規オプションとして追加します。
        $default_options = array(
            'display_style' => 'grid-single',
            'content_models' => array()
        );
        
        if (!get_option('s2j_alliance_manager_settings')) {
            add_option('s2j_alliance_manager_settings', $default_options);
        }
        
        // 管理者ロールに機能を追加します。
        $this->add_capabilities();
        
        // リライトルールを削除した後、リライトルールを再作成します。
        flush_rewrite_rules();
    }

    /**
     * 管理者ロールに機能を追加します。
     * 「activate()」メソッドから呼ばれます。
     *
     * @return void
     */
    private function add_capabilities() {
        // ロールオブジェクト「管理者」を取得します。
        $role = get_role('administrator');

        // ロールオブジェクト「管理者」に権限を追加します。
        if ($role) {
            $role->add_cap('edit_s2j_am_rank_labels');
        }
    }

    /**
     * カスタム投稿タイプを登録します。
     * 「init()」メソッドから呼ばれます。
     *
     * @return void
     */
    private function register_custom_post_types() {
        // カスタム投稿タイプ「ランクラベル」を登録します。
        register_post_type('s2j_am_rank_label', array(
            'labels' => array(
                'name' => __('Rank Labels', 's2j-alliance-manager'),
                'singular_name' => __('Rank Label', 's2j-alliance-manager'),
                'add_new' => __('Add New Rank Label', 's2j-alliance-manager'),
                'add_new_item' => __('Add New Rank Label', 's2j-alliance-manager'),
                'edit_item' => __('Edit Rank Label', 's2j-alliance-manager'),
                'new_item' => __('New Rank Label', 's2j-alliance-manager'),
                'view_item' => __('View Rank Label', 's2j-alliance-manager'),
                'search_items' => __('Search Rank Labels', 's2j-alliance-manager'),
                'not_found' => __('No rank labels found', 's2j-alliance-manager'),
                'not_found_in_trash' => __('No rank labels found in trash', 's2j-alliance-manager'),
            ),
            'public' => false,
            'publicly_queryable' => false,
            'show_ui' => false,
            'show_in_menu' => false,
            'show_in_nav_menus' => false,
            'show_in_admin_bar' => false,
            'show_in_rest' => true,
            'supports' => array('title', 'editor', 'thumbnail', 'page-attributes'),
            'hierarchical' => false,
            'has_archive' => false,
            'rewrite' => false,
            'capability_type' => 'post',
            'capabilities' => array(
                'edit_post' => 'edit_s2j_am_rank_labels',
                'read_post' => 'edit_s2j_am_rank_labels',
                'delete_post' => 'edit_s2j_am_rank_labels',
                'edit_posts' => 'edit_s2j_am_rank_labels',
                'edit_others_posts' => 'edit_s2j_am_rank_labels',
                'publish_posts' => 'edit_s2j_am_rank_labels',
                'read_private_posts' => 'edit_s2j_am_rank_labels',
            ),
            'map_meta_cap' => true,
        ));
    }
}

// プラグインを初期化します
S2J_Alliance_Manager::get_instance();
