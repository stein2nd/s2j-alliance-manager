import { __ } from '@wordpress/i18n';
// @ts-ignore
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
// @ts-ignore
import { PanelBody, SelectControl, Placeholder } from '@wordpress/components';
// @ts-ignore
import { registerBlockType } from '@wordpress/blocks';
import { displayStyles, alignmentOptions } from '../admin/data/constants';
import '@/styles/gutenberg.scss';

/**
 * React.FunctionComponent ブロックの属性「AllianceBanner：Attributes」インターフェイス (モーダル用)
 * @param param0 React.FunctionComponent ブロックの属性「AllianceBanner：Attributes」インターフェイス (モーダル用)
 * @returns React.FunctionComponent ブロックの属性「AllianceBanner：Attributes」インターフェイス (モーダル用)
 */
interface AllianceBannerAttributes {
  displayStyle: 'grid-single' | 'grid-multi';
  alignment?: 'left' | 'center' | 'right';
}

/**
 * React.FunctionComponent ブロックの属性「AllianceBanner：Props」インターフェイス (モーダル用)
 * @param param0 React.FunctionComponent ブロックの属性「AllianceBanner：Props」インターフェイス (モーダル用)
 * @returns React.FunctionComponent ブロックの属性「AllianceBanner：Props」インターフェイス (モーダル用)
 */
interface AllianceBannerProps {
  attributes: AllianceBannerAttributes;
  setAttributes: (attributes: Partial<AllianceBannerAttributes>) => void;
  isSelected: boolean;
}

/**
 * React.FunctionComponent「Gutenberg ブロックの UI ロジック」 (モーダル用)
 * @param param0 React.FunctionComponent「Gutenberg ブロックの UI ロジック」 (モーダル用)
 * @returns React.FunctionComponent「Gutenberg ブロックの UI ロジック」 (モーダル用)
 */
const AllianceBannerEdit: React.FC<AllianceBannerProps> = ({
  attributes,
  setAttributes,
  isSelected: _isSelected
}) => {
  const blockProps = useBlockProps({
    className: 'wp-block-s2j-alliance-manager-alliance-banner'
  });

  const { displayStyle, alignment } = attributes;

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
            __next40pxDefaultSize={true}
          />
          <SelectControl
            label={__('Alignment', 's2j-alliance-manager')}
            value={alignment || 'center'}
            options={alignmentOptions.map(option => ({
              label: option.label,
              value: option.value
            }))}
            onChange={(value: string) => setAttributes({ alignment: value as AllianceBannerAttributes['alignment'] })}
            help={__('Choose alignment for Single Column Grid display.', 's2j-alliance-manager')}
            disabled={displayStyle !== 'grid-single'}
            __next40pxDefaultSize={true}
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

/**
 * ブロックを登録します (サーバーサイドレンダリングを使用するため、saveはnull)。
 * 「registerBlockType」メソッドから呼ばれます。
 */
registerBlockType(
  's2j-alliance-manager/alliance-banner',
  {
    edit: AllianceBannerEdit,
    save: () => null
  }
);

/**
 * 編集コンポーナーをエクスポートし、`block.json` で使用できるようにします。
 */
export default AllianceBannerEdit;
