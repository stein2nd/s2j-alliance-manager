<?php
/**
 * Alliance Manager Class
 *
 * @package S2J_Alliance_Manager
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Alliance Manager Class
 */
class S2J_Alliance_Manager_AllianceManager {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'register_blocks'));
        add_action('init', array($this, 'register_meta_boxes'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_block_assets'));
    }
    
    /**
     * Register Gutenberg blocks
     */
    public function register_blocks() {
        if (!function_exists('register_block_type')) {
            return;
        }
        
        register_block_type('s2j-alliance-manager/alliance-banner', array(
            'editor_script' => 's2j-alliance-manager-gutenberg',
            'editor_style' => 's2j-alliance-manager-gutenberg',
            'style' => 's2j-alliance-manager-frontend',
            'render_callback' => array($this, 'render_alliance_banner_block'),
            'attributes' => array(
                'displayStyle' => array(
                    'type' => 'string',
                    'default' => 'grid-single',
                ),
            ),
        ));
    }
    
    /**
     * Register meta boxes for classic editor
     */
    public function register_meta_boxes() {
        add_action('add_meta_boxes', array($this, 'add_alliance_meta_box'));
    }
    
    /**
     * Add alliance meta box
     */
    public function add_alliance_meta_box() {
        $post_types = get_post_types(array('public' => true), 'names');
        
        foreach ($post_types as $post_type) {
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
     * Alliance meta box callback
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
                    <option value="masonry" <?php selected($display_style, 'masonry'); ?>>
                        <?php _e('Masonry Layout', 's2j-alliance-manager'); ?>
                    </option>
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
    
    /**
     * Enqueue block assets
     */
    public function enqueue_block_assets() {
        if (is_admin()) {
            wp_enqueue_script(
                's2j-alliance-manager-gutenberg',
                S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/js/gutenberg.js',
                array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
                S2J_ALLIANCE_MANAGER_VERSION,
                true
            );
            
            wp_enqueue_style(
                's2j-alliance-manager-gutenberg',
                S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/gutenberg.css',
                array('wp-edit-blocks'),
                S2J_ALLIANCE_MANAGER_VERSION
            );
        }
        
        wp_enqueue_style(
            's2j-alliance-manager-frontend',
            S2J_ALLIANCE_MANAGER_PLUGIN_URL . 'dist/css/gutenberg.css',
            array(),
            S2J_ALLIANCE_MANAGER_VERSION
        );
    }
    
    /**
     * Render alliance banner block
     */
    public function render_alliance_banner_block($attributes) {
        $display_style = $attributes['displayStyle'] ?? 'grid-single';
        
        // Get alliance data
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
                                <?php if ($partner['behavior'] === 'jump' && !empty($partner['jump_url'])): ?>
                                    <a href="<?php echo esc_url($partner['jump_url']); ?>" 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       class="s2j-alliance-partner-link">
                                        <?php echo $this->render_partner_logo($partner); ?>
                                    </a>
                                <?php else: ?>
                                    <div class="s2j-alliance-partner-modal" 
                                         data-message="<?php echo esc_attr($partner['message']); ?>">
                                        <?php echo $this->render_partner_logo($partner); ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        
        <!-- Modal for alliance partner messages -->
        <div id="s2j-alliance-modal" class="s2j-alliance-modal" style="display: none;">
            <div class="s2j-alliance-modal-content">
                <span class="s2j-alliance-modal-close">&times;</span>
                <div class="s2j-alliance-modal-message"></div>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            // Modal functionality
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
     * Get alliance data
     */
    private function get_alliance_data() {
        $settings = get_option('s2j_alliance_manager_settings', array());
        $content_models = $settings['content_models'] ?? array();
        
        // Filter only frontpage items
        $frontpage_items = array_filter($content_models, function($item) {
            return isset($item['frontpage']) && $item['frontpage'] === 'YES';
        });
        
        // Group by rank
        $grouped_data = array();
        foreach ($frontpage_items as $item) {
            $rank = $item['rank'] ?? 'default';
            if (!isset($grouped_data[$rank])) {
                $grouped_data[$rank] = array();
            }
            $grouped_data[$rank][] = $item;
        }
        
        return $grouped_data;
    }
    
    /**
     * Render partner logo
     */
    private function render_partner_logo($partner) {
        if (empty($partner['logo'])) {
            return '<div class="s2j-alliance-partner-placeholder">' . 
                   __('No logo', 's2j-alliance-manager') . '</div>';
        }
        
        $logo_url = wp_get_attachment_url($partner['logo']);
        if (!$logo_url) {
            return '<div class="s2j-alliance-partner-placeholder">' . 
                   __('Invalid logo', 's2j-alliance-manager') . '</div>';
        }
        
        $alt_text = get_post_meta($partner['logo'], '_wp_attachment_image_alt', true);
        if (empty($alt_text)) {
            $alt_text = __('Alliance partner logo', 's2j-alliance-manager');
        }
        
        return sprintf(
            '<img src="%s" alt="%s" class="s2j-alliance-partner-logo" />',
            esc_url($logo_url),
            esc_attr($alt_text)
        );
    }
}
