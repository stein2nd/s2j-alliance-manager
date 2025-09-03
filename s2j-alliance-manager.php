<?php
/**
 * Plugin Name: S2J Alliance Manager
 * Plugin URI: https://github.com/stein2nd/s2j-alliance-manager
 * Description: アライアンス関係にある協力会社のリンク付きバナー（ロゴ・動画含む）を管理し、Front page 等でブロック表示します。
 * Version: 1.0.0
 * Author: S2J
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

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('S2J_ALLIANCE_MANAGER_VERSION', '1.0.0');
define('S2J_ALLIANCE_MANAGER_PLUGIN_FILE', __FILE__);
define('S2J_ALLIANCE_MANAGER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('S2J_ALLIANCE_MANAGER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('S2J_ALLIANCE_MANAGER_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main plugin class
 */
class S2J_Alliance_Manager {
    
    /**
     * Single instance of the class
     */
    private static $instance = null;
    
    /**
     * Get single instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
        $this->load_dependencies();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        add_action('init', array($this, 'init'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));
        add_action('plugins_loaded', array($this, 'load_textdomain'));
        
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
        
    /**
     * Initialize plugin
     */
    public function init() {
        // Initialize REST API
        new S2J_Alliance_Manager_RestController();
        
        // Initialize Gutenberg blocks
        new S2J_Alliance_Manager_AllianceManager();
        
        // Initialize admin settings page
        if (is_admin()) {
            new S2J_Alliance_Manager_SettingsPage();
        }
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function admin_enqueue_scripts($hook) {
        // Only load on our admin page
        if (strpos($hook, 's2j-alliance-manager') === false) {
            return;
        }
        
        // Enqueue WordPress media scripts for media uploader
        wp_enqueue_media();
        
        wp_enqueue_script(
            's2j-alliance-manager-admin',
            S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/s2j-alliance-manager-admin.js',
            array('jquery', 'wp-api-fetch', 'wp-components', 'wp-element', 'react', 'react-dom'),
            S2J_ALLIANCE_MANAGER_VERSION,
            true
        );
        
        wp_enqueue_style(
            's2j-alliance-manager-admin',
            S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/s2j-alliance-manager-admin.css',
            array('wp-components'),
            S2J_ALLIANCE_MANAGER_VERSION
        );
        
        // Localize script
        wp_localize_script('s2j-alliance-manager-admin', 's2jAllianceManager', array(
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
        ));
    }
    
    /**
     * Enqueue frontend scripts and styles
     */
    public function frontend_enqueue_scripts() {
        // Gutenberg エディターが利用可能な場合のみスクリプトを読み込み
        if (!function_exists('register_block_type')) {
            return;
        }

        wp_enqueue_script(
            's2j-alliance-manager-frontend',
            S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/s2j-alliance-manager-gutenberg.js',
            array(),
            S2J_ALLIANCE_MANAGER_VERSION,
            true
        );

        wp_enqueue_style(
            's2j-alliance-manager-frontend',
            S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/s2j-alliance-manager-gutenberg.css',
            array(),
            S2J_ALLIANCE_MANAGER_VERSION
        );
    }
    
    /**
     * Load plugin textdomain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            's2j-alliance-manager',
            false,
            dirname(S2J_ALLIANCE_MANAGER_PLUGIN_BASENAME) . '/languages'
        );
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Set default options
        $default_options = array(
            'display_style' => 'grid-single',
            'content_models' => array()
        );
        
        if (!get_option('s2j_alliance_manager_settings')) {
            add_option('s2j_alliance_manager_settings', $default_options);
        }
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Load plugin dependencies
     */
    private function load_dependencies() {
        require_once S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'includes/SettingsPage.php';
        require_once S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'includes/RestController.php';
        require_once S2J_ALLIANCE_MANAGER_PLUGIN_DIR . 'includes/AllianceManager.php';
    }
}

// Initialize the plugin
S2J_Alliance_Manager::get_instance();
