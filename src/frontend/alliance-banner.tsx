import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { ContentModel } from '../types';

/**
 * フロントエンド用アライアンス・バナーの初期化 (モーダル用)
 * @param param0 フロントエンド用アライアンス・バナーの初期化 (モーダル用)
 * @returns フロントエンド用アライアンス・バナーの初期化 (モーダル用)
 */
interface AllianceBannerAttributes {
  displayStyle: 'grid-single' | 'grid-multi';
  alignment?: 'left' | 'center' | 'right';
}

/**
 * フロントエンド用アライアンス・バナー・データ (モーダル用)
 * @param param0 フロントエンド用アライアンス・バナー・データ (モーダル用)
 * @returns フロントエンド用アライアンス・バナー・データ (モーダル用)
 */
interface AllianceBannerData {
  contentModels: ContentModel[];
  attributes: AllianceBannerAttributes;
}

/**
 * グローバル変数の型定義 (モーダル用)
 * @param param0 グローバル変数の型定義 (モーダル用)
 * @returns グローバル変数の型定義 (モーダル用)
 */
declare global {
  interface Window {
    s2jAllianceBannerData?: AllianceBannerData;
  }
}

/**
 * モーダル用 Portal コンポーネント (モーダル用)
 * @param param0 モーダル用 Portal コンポーネント (モーダル用)
 * @returns モーダル用 Portal コンポーネント (モーダル用)
 */
interface ModalPortalProps {
  children: React.ReactNode;
  containerId?: string;
}

/**
 * モーダル用 Portal コンポーネント (モーダル用)
 * @param param0 モーダル用 Portal コンポーネント (モーダル用)
 * @returns モーダル用 Portal コンポーネント (モーダル用)
 */
const ModalPortal: React.FC<ModalPortalProps> = ({
  children,
  containerId = 's2j-alliance-modal'
}) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  /**
   * モーダル用コンテナを作成
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    let modalContainer = document.getElementById(containerId);

    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = containerId;
      modalContainer.className = 's2j-modal-container';
      document.body.appendChild(modalContainer);
    }

    setContainer(modalContainer);

    return () => {
      if (modalContainer && modalContainer.parentNode) {
        modalContainer.parentNode.removeChild(modalContainer);
      }
    };
  }, [containerId]);

  if (!container) return null;

  return createPortal(children, container);
};

/**
 * フロントエンド用アライアンス・モーダル・コンポーネント (モーダル用)
 */
interface AllianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content: string;
  video?: {url: string, poster: string} | null;
  showCloseButton?: boolean;
}

/**
 * フロントエンド用アライアンス・モーダル・コンポーネント (モーダル用)
 * @param param0 フロントエンド用アライアンス・モーダル・コンポーネント (モーダル用)
 * @returns フロントエンド用アライアンス・モーダル・コンポーネント (モーダル用)
 */
const AllianceModalComponent: React.FC<AllianceModalProps> = ({
  isOpen,
  onClose,
  title = 'Partner Message',
  content,
  video,
  showCloseButton = true
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modalRef = useRef<any>(null);

  /**
   * フォーカス管理
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isOpen]);

  /**
   * オーバーレイ・クリックで閉じる機能
   * 「handleOverlayClick()」メソッドから呼ばれます。
   * @param e 
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className={`s2j-alliance-modal ${isOpen ? 's2j-modal-open' : ''}`}>
        <div 
          className={`s2j-modal-overlay ${isOpen ? 's2j-modal-overlay-visible' : ''}`}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
        <div 
          className={`s2j-modal-content ${isOpen ? 's2j-modal-content-visible' : ''}`}
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="s2j-modal-title"
          aria-describedby="s2j-modal-description"
        >
          <div className="s2j-modal-header">
            <h3 id="s2j-modal-title">{title}</h3>
            {showCloseButton && (
              <button 
                className="s2j-modal-close" 
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
          <div className="s2j-modal-body">
            {video && (
              <div className="s2j-modal-video">
                <video
                  src={video.url}
                  poster={video.poster}
                  controls
                  preload="metadata"
                  style={{ width: '100%', maxWidth: '100%', height: 'auto' }}
                >
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            <div 
              id="s2j-modal-description"
              className="s2j-modal-message"
            >
              {content}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

/**
 * モーダル状態管理用カスタムフック (モーダル用)
 */
interface UseModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

/**
 * モーダル状態管理用カスタムフック (モーダル用)
 * @param initialState 初期状態
 * @returns モーダル状態管理用カスタムフック (モーダル用)
 */
const useModal = (initialState = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  /**
   * モーダルを開きます。
   * 「openModal()」メソッドから呼ばれます。
   */
  const openModal = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  /**
   * モーダルを閉じます。
   * 「closeModal()」メソッドから呼ばれます。
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  /**
   * モーダルをトグルします。
   * 「toggleModal()」メソッドから呼ばれます。
   */
  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  /**
   * ESC キーでモーダルを閉じます。
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEscape = (e: any) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, closeModal]);

  /**
   * モーダルを閉じるときにボディのスタイルをリセットします。
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);  

  /**
   * モーダルの状態を返します。
   * 「useModal()」メソッドから呼ばれます。
   */
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

/**
 * フロントエンド用アライアンス・バナー・コンポーネント (モーダル用)
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
const AllianceBanner: React.FC<AllianceBannerProps> = ({
  contentModels,
  displayStyle,
  alignment = 'center'
}) => {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedMessage, setSelectedMessage] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<{url: string, poster: string} | null>(null);

  /**
   * ロゴをクリックしたときにモーダルを開きます。
   * 「handleLogoClick()」メソッドから呼ばれます。
   * @param message
   * @param videoUrl
   * @param posterUrl
   */
  const handleLogoClick = (message: string, videoUrl?: string, posterUrl?: string) => {
    console.log('Logo clicked, message:', message, 'videoUrl:', videoUrl);
    setSelectedMessage(message || '動画を再生するにはモーダルを開いてください。');
    if (videoUrl) {
      setSelectedVideo({ url: videoUrl, poster: posterUrl || '' });
    } else {
      setSelectedVideo(null);
    }
    openModal();
  };

  /**
   * アライアンス・バナーの配置を取得します。
   * 「getAlignmentClass()」メソッドから呼ばれます。
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
   * 「getDisplayClass()」メソッドから呼ばれます。
   * @returns アライアンス・バナーの表示スタイル
   */
  const getDisplayClass = () => {
    return `s2j-alliance-banner--${displayStyle}`;
  };

  /**
   * コンテンツモデルをランク別にグループ化します。
   * 「getGroupedContentModels()」メソッドから呼ばれます。
   * @returns ランク別にグループ化されたコンテンツモデル
   */
  const getGroupedContentModels = () => {
    const grouped: { [key: string]: ContentModel[] } = {};
    
    contentModels.forEach((model) => {
      const rank = model.rank || 'default';
      if (!grouped[rank]) {
        grouped[rank] = [];
      }
      grouped[rank].push(model);
    });
    
    return grouped;
  };

  /**
   * ランク別のバナーをレンダリングします。
   * 「renderRankBanners()」メソッドから呼ばれます。
   * @param rank ランク名
   * @param models そのランクのコンテンツモデル
   * @returns ランク別のバナー要素
   */
  const renderRankBanners = (rank: string, models: ContentModel[]) => {
    if (models.length === 0) return null;

    return (
      <div key={rank} className={`s2j-alliance-rank`}>
        <h3 className="s2j-alliance-rank-title">{rank}</h3>
        <div className={`s2j-alliance-banner ${getDisplayClass()} ${getAlignmentClass()}`}>
          {models.map((model, index) => {
            if (model.behavior === 'modal') {
              // 動画ファイルかどうかを判定
              const isVideo = model.logo_url && /\.(mp4|webm|ogg|mov)$/i.test(model.logo_url);
              // ポスター画像の URL を使用 (PHP 側で準備済み)
              const posterUrl = model.poster_url || '';

              return (
                <div key={`${rank}-${index}`} className="s2j-alliance-item">
                  <button
                    className="s2j-alliance-logo s2j-alliance-logo--modal"
                    onClick={() => handleLogoClick(model.message, isVideo ? model.logo_url : undefined, posterUrl)}
                    aria-label="View partner message"
                  >
                    {model.logo > 0 ? (
                      isVideo ? (
                        <video
                          poster={posterUrl}
                          preload="none"
                          controls={false}
                          muted
                          className="s2j-alliance-video"
                          style={{ pointerEvents: 'none' }}
                        >
                          <source src={model.logo_url || ''} type="video/mp4" />
                        </video>
                      ) : (
                        <img
                          src={model.logo_url || ''}
                          alt="Partner logo"
                          loading="lazy"
                        />
                      )
                    ) : (
                      <div className="s2j-alliance-placeholder">
                        <span>No Logo</span>
                      </div>
                    )}
                  </button>
                </div>
              );
            } else if (model.behavior === 'jump') {
              // 動画ファイルかどうかを判定
              const isVideo = model.logo_url && /\.(mp4|webm|ogg|mov)$/i.test(model.logo_url);
              // ポスター画像の URL を使用 (PHP 側で準備済み)
              const posterUrl = model.poster_url || '';

              // URLが設定されている場合はリンク、そうでなければボタンとして表示
              const content = model.logo > 0 ? (
                isVideo ? (
                  <video
                    poster={posterUrl}
                    preload="none"
                    controls={false}
                    muted
                    className="s2j-alliance-video"
                    style={{ pointerEvents: 'none' }}
                  >
                    <source src={model.logo_url || ''} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={model.logo_url || ''}
                    alt="Partner logo"
                    loading="lazy"
                  />
                )
              ) : (
                <div className="s2j-alliance-placeholder">
                  <span>No Logo</span>
                </div>
              );

              return (
                <div key={`${rank}-${index}`} className="s2j-alliance-item">
                  {model.jump_url ? (
                    <a
                      href={model.jump_url}
                      className="s2j-alliance-logo"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit partner website"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="s2j-alliance-logo s2j-alliance-logo--disabled">
                      {content}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  const groupedModels = getGroupedContentModels();

  return (
    <>
      <div className="s2j-alliance-banner-container">
        {Object.entries(groupedModels).map(([rank, models]) => 
          renderRankBanners(rank, models)
        )}
      </div>
      <AllianceModalComponent
        isOpen={isOpen}
        onClose={closeModal}
        title="Partner Message"
        content={selectedMessage}
        video={selectedVideo}
        showCloseButton={true}
      />
    </>
  );
};

/**
 * フロントエンド用アライアンス・バナーの初期化 (モーダル用)
 * @returns フロントエンド用アライアンス・バナーの初期化 (モーダル用)
 */
function initAllianceBanners() {
  // すべてのアライアンス・バナー・ブロックを取得
  const bannerBlocks = document.querySelectorAll('.wp-block-s2j-alliance-manager-alliance-banner');

  bannerBlocks.forEach((block: Element) => {
    const blockElement = block as HTMLElement;

    // ブロックの属性を取得
    const displayStyle = blockElement.dataset.displayStyle as 'grid-single' | 'grid-multi' || 'grid-single';
    const alignment = blockElement.dataset.alignment as 'left' | 'center' | 'right' || 'center';

    // コンテンツデータを取得 (WordPress から渡される)
    const contentModels = window.s2jAllianceBannerData?.contentModels || [];

    // React コンポーネントをレンダリング
    const root = createRoot(blockElement);
    root.render(
      <AllianceBanner
        contentModels={contentModels}
        displayStyle={displayStyle}
        alignment={alignment}
      />
    );
  });
}

// DOM が読み込まれた後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllianceBanners);
} else {
  initAllianceBanners();
}

// WordPress のブロックエディター用の初期化 (フロントエンドでは不要)
// フロントエンドでは通常の DOMContentLoaded イベントで十分

export { initAllianceBanners };
