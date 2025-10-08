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

  /**
   * ロゴクリック
   * 「handleLogoClick」メソッドから呼ばれます。
   * @param message ロゴクリック
   */
  const handleLogoClick = (message: string) => {
    if (message && message.trim()) {
      setSelectedMessage(message);
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

  return (
    <>
      <div className={`s2j-alliance-banner ${getDisplayClass()} ${getAlignmentClass()}`}>
        {contentModels.map((model, index) => {
          if (model.behavior === 'modal' && model.logo > 0) {
            return (
              <div key={index} className="s2j-alliance-item">
                <button
                  className="s2j-alliance-logo"
                  onClick={() => handleLogoClick(model.message)}
                  aria-label={__('View partner message', 's2j-alliance-manager')}
                >
                  <img
                    src={model.logo_url || ''}
                    alt={__('Partner logo', 's2j-alliance-manager')}
                    loading="lazy"
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
        showCloseButton={true}
      />
    </>
  );
};

export default AllianceBanner;
