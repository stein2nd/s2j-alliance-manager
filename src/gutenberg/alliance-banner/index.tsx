import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { AllianceModal, useModal } from '../../modal';
import { ContentModel } from '../../types';

/**
 * フロントエンド用アライアンス・バナー・コンポーネント (モーダル用)
 * @param param0 フロントエンド用アライアンス・バナー・コンポーネント (モーダル用)
 * @returns フロントエンド用アライアンス・バナー・コンポーネント (モーダル用)
 */
interface AllianceBannerProps {
  contentModels: ContentModel[];
  displayStyle: 'grid-single' | 'grid-multi';
  alignment?: 'left' | 'center' | 'right';
}

/**
 * フロントエンド用アライアンス・バナー・コンポーネント (モーダル用)
 * @param param0 フロントエンド用アライアンス・バナー・コンポーネント (モーダル用)
 * @returns フロントエンド用アライアンス・バナー・コンポーネント (モーダル用)
 */
export const AllianceBanner: React.FC<AllianceBannerProps> = ({
  contentModels,
  displayStyle,
  alignment = 'center'
}) => {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedMessage, setSelectedMessage] = useState('');
  const [selectedJumpUrl, setSelectedJumpUrl] = useState('');

  /**
   * ロゴクリック
   * 「handleLogoClick」メソッドから呼ばれます。
   * @param message ロゴクリック
   * @param jumpUrl ジャンプURL
   */
  const handleLogoClick = (message: string, jumpUrl?: string) => {
    if (message && message.trim()) {
      setSelectedMessage(message);
      setSelectedJumpUrl(jumpUrl || '');
      openModal();
    }
  };

  /**
   * アライアンス・バナーの配置を取得します。
   * 「getAlignmentClass」メソッドから呼ばれます。
   * @returns アライアンス・バナーの配置
   */
  const getAlignmentClass = () => {
    if (displayStyle === 'grid-single') {
      return `s2j-alliance-banner--${alignment}`;
    }
    return '';
  };

  /**
   * アライアンス・バナーの表示スタイルを取得します。
   * 「getDisplayClass」メソッドから呼ばれます。
   * @returns アライアンス・バナーの表示スタイル
   */
  const getDisplayClass = () => {
    return `s2j-alliance-banner--${displayStyle}`;
  };

  /**
   * ロゴサイズ属性を取得します。
   * 「getLogoSizeAttributes()」メソッドから呼ばれます。
   * @param model コンテンツモデル
   * @returns ロゴサイズ属性とスタイルオブジェクト
   */
  const getLogoSizeAttributes = (model: ContentModel) => {
    const attributes: { width?: number; height?: number } = {};
    const style: React.CSSProperties = {};

    if (model.logo_size_type === 'width' && model.logo_size_value && model.logo_size_value > 0) {
      attributes.width = model.logo_size_value;
      style.width = `${model.logo_size_value}px`;
      style.maxWidth = `${model.logo_size_value}px`;
      style.height = 'auto';
    } else if (model.logo_size_type === 'height' && model.logo_size_value && model.logo_size_value > 0) {
      attributes.height = model.logo_size_value;
      style.height = `${model.logo_size_value}px`;
      style.width = 'auto';
      style.maxHeight = `${model.logo_size_value}px`;
    }

    return { attributes, style };
  };

  return (
    <>
      <div className={`s2j-alliance-banner ${getDisplayClass()} ${getAlignmentClass()}`}>
        {contentModels.map((model, index) => {
          // ロゴサイズ属性を取得
          const logoSizeData = getLogoSizeAttributes(model);

          if (model.behavior === 'modal' && model.logo > 0) {
            return (
              <div key={index} className="s2j-alliance-item">
                <button
                  className="s2j-alliance-logo"
                  onClick={() => handleLogoClick(model.message, model.jump_url)}
                  aria-label={__('View partner message', 's2j-alliance-manager')}
                >
                  <img
                    src={model.logo_url || ''}
                    alt={__('Partner logo', 's2j-alliance-manager')}
                    loading="lazy"
                    {...logoSizeData.attributes}
                    style={logoSizeData.style}
                  />
                </button>
              </div>
            );
          } else if (model.behavior === 'jump' && model.logo > 0 && model.jump_url) {
            return (
              <div key={index} className="s2j-alliance-item">
                <a
                  href={model.jump_url}
                  className="s2j-alliance-logo"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={__('Visit partner website', 's2j-alliance-manager')}
                >
                  <img
                    src={model.logo_url || ''}
                    alt={__('Partner logo', 's2j-alliance-manager')}
                    loading="lazy"
                    {...logoSizeData.attributes}
                    style={logoSizeData.style}
                  />
                </a>
              </div>
            );
          }
          return null;
        })}
      </div>
      <AllianceModal
        isOpen={isOpen}
        onClose={closeModal}
        title={__('Partner Message', 's2j-alliance-manager')}
        content={selectedMessage}
        jumpUrl={selectedJumpUrl}
        showCloseButton={true}
      />
    </>
  );
};

export default AllianceBanner;
