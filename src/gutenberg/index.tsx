import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, Placeholder } from '@wordpress/components';
import { displayStyles } from '../admin/data/constants';
import '@/styles/gutenberg.scss';

interface AllianceBannerAttributes {
  displayStyle: 'grid-single' | 'grid-multi' | 'masonry';
}

interface AllianceBannerProps {
  attributes: AllianceBannerAttributes;
  setAttributes: (attributes: Partial<AllianceBannerAttributes>) => void;
  isSelected: boolean;
}

const AllianceBannerEdit: React.FC<AllianceBannerProps> = ({
  attributes,
  setAttributes,
  isSelected: _isSelected
}) => {
  const blockProps = useBlockProps({
    className: 'wp-block-s2j-alliance-manager-alliance-banner'
  });

  const { displayStyle } = attributes;

  return (
    <>
      <InspectorControls>
        <PanelBody title={__('Display Settings', 's2j-alliance-manager')}>
          <SelectControl
            label={__('Display Style', 's2j-alliance-manager')}
            value={displayStyle}
            options={displayStyles.map(style => ({
              label: style.label,
              value: style.value
            }))}
            onChange={(value: string) => setAttributes({ displayStyle: value as AllianceBannerAttributes['displayStyle'] })}
            help={__('Choose how alliance banners are displayed.', 's2j-alliance-manager')}
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <div className="s2j-alliance-banner s2j-alliance-banner--preview">
          <Placeholder
            icon="groups"
            label={__('Alliance Banner', 's2j-alliance-manager')}
            instructions={__('This block will display your alliance partner banners. Configure the display style in the block settings.', 's2j-alliance-manager')}
          >
            <div className="s2j-preview-info">
              <p><strong>{__('Display Style:', 's2j-alliance-manager')}</strong> {displayStyles.find(s => s.value === displayStyle)?.label}</p>
              <p>{__('Alliance banners will be displayed here based on your settings.', 's2j-alliance-manager')}</p>
            </div>
          </Placeholder>
        </div>
      </div>
    </>
  );
};

const AllianceBannerSave: React.FC<{ attributes: AllianceBannerAttributes }> = ({ attributes }) => {
  const blockProps = useBlockProps({
    className: 'wp-block-s2j-alliance-manager-alliance-banner'
  });

  return (
    <div {...blockProps}>
      <div className="s2j-alliance-banner" data-display-style={attributes.displayStyle}>
        {/* Content will be rendered server-side */}
      </div>
    </div>
  );
};

registerBlockType('s2j-alliance-manager/alliance-banner', {
  title: __('Alliance Banner', 's2j-alliance-manager'),
  description: __('Display alliance partner banners with customizable layouts.', 's2j-alliance-manager'),
  icon: 'groups',
  category: 'widgets',
  keywords: [
    __('alliance', 's2j-alliance-manager'),
    __('partners', 's2j-alliance-manager'),
    __('banners', 's2j-alliance-manager'),
    __('logos', 's2j-alliance-manager')
  ],
  attributes: {
    displayStyle: {
      type: 'string',
      default: 'grid-single'
    }
  },
  edit: AllianceBannerEdit,
  save: AllianceBannerSave,
  supports: {
    align: ['wide', 'full'],
    html: false
  }
});
