<?php
/**
 * Settings Page Class
 *
 * @package S2J_Alliance_Manager
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Settings Page Class
 */
class S2J_Alliance_Manager_SettingsPage {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
    }
    
    /**
     * Add admin menu
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
     * Admin init
     */
    public function admin_init() {
        register_setting(
            's2j_alliance_manager_settings',
            's2j_alliance_manager_settings',
            array($this, 'sanitize_settings')
        );
    }
    
    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        // Sanitize display style
        if (isset($input['display_style'])) {
            $allowed_styles = array('grid-single', 'grid-multi', 'masonry');
            $sanitized['display_style'] = in_array($input['display_style'], $allowed_styles) 
                ? $input['display_style'] 
                : 'grid-single';
        }
        
        // Sanitize content models
        if (isset($input['content_models']) && is_array($input['content_models'])) {
            $sanitized['content_models'] = array();
            foreach ($input['content_models'] as $model) {
                $sanitized_model = array();
                
                // Sanitize frontpage
                $sanitized_model['frontpage'] = isset($model['frontpage']) ? 'YES' : 'NO';
                
                // Sanitize rank
                $sanitized_model['rank'] = sanitize_title($model['rank'] ?? '');
                
                // Sanitize logo (attachment ID)
                $sanitized_model['logo'] = intval($model['logo'] ?? 0);
                
                // Sanitize jump_url
                $sanitized_model['jump_url'] = esc_url_raw($model['jump_url'] ?? '');
                
                // Sanitize behavior
                $allowed_behaviors = array('jump', 'modal');
                $sanitized_model['behavior'] = in_array($model['behavior'] ?? '', $allowed_behaviors) 
                    ? $model['behavior'] 
                    : 'jump';
                
                // Sanitize message
                $sanitized_model['message'] = sanitize_textarea_field($model['message'] ?? '');
                
                $sanitized['content_models'][] = $sanitized_model;
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Admin page
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
                        <div class="s2j-admin-sidebar">
                            <div class="s2j-admin-card">
                                <h3><?php _e('Display Settings', 's2j-alliance-manager'); ?></h3>
                                <div id="s2j-display-settings">
                                    <!-- Display settings will be rendered here by React -->
                                </div>
                            </div>
                        </div>
                        
                        <div class="s2j-admin-main">
                            <div class="s2j-admin-card">
                                <div class="s2j-admin-card-header">
                                    <h3><?php _e('Alliance Partners', 's2j-alliance-manager'); ?></h3>
                                </div>
                                <div id="s2j-content-models">
                                    <!-- Content models will be rendered here by React -->
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
