<?php
/**
 * REST Controller Class
 *
 * @package S2J_Alliance_Manager
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST Controller Class
 */
class S2J_Alliance_Manager_RestController {
    
    /**
     * Namespace
     */
    const NAMESPACE = 's2j-alliance-manager/v1';
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register REST routes
     */
    public function register_routes() {
        // Get settings
        register_rest_route(self::NAMESPACE, '/settings', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_settings'),
            'permission_callback' => array($this, 'check_permissions'),
        ));
        
        // Get content models
        register_rest_route(self::NAMESPACE, '/content-models', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_content_models'),
            'permission_callback' => array($this, 'check_permissions'),
        ));
        
        // Save all (settings + content models)
        register_rest_route(self::NAMESPACE, '/save-all', array(
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
        ));
    }
    
    /**
     * Check permissions
     */
    public function check_permissions() {
        return current_user_can('manage_options');
    }
    
    /**
     * Get settings
     */
    public function get_settings() {
        $settings = get_option('s2j_alliance_manager_settings', array(
            'display_style' => 'grid-single',
            'content_models' => array()
        ));
        
        return rest_ensure_response($settings);
    }
    
    /**
     * Get content models
     */
    public function get_content_models() {
        $settings = get_option('s2j_alliance_manager_settings', array());
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
     * Save all data
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
     * Sanitize settings
     */
    public function sanitize_settings($settings) {
        $sanitized = array();
        
        // Sanitize display style
        if (isset($settings['display_style'])) {
            $allowed_styles = array('grid-single', 'grid-multi', 'masonry');
            $sanitized['display_style'] = in_array($settings['display_style'], $allowed_styles) 
                ? $settings['display_style'] 
                : 'grid-single';
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize content models
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
            $sanitized_model['behavior'] = in_array($model['behavior'] ?? '', $allowed_behaviors) 
                ? $model['behavior'] 
                : 'jump';
            
            // Sanitize message
            $sanitized_model['message'] = sanitize_textarea_field($model['message'] ?? '');
            
            $sanitized[] = $sanitized_model;
        }
        
        return $sanitized;
    }
    
    /**
     * Validate content model
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
}
