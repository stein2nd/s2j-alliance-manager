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
  jumpUrl?: string;
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
  jumpUrl,
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
            {jumpUrl && (
              <div className="s2j-modal-jump-url">
                <a
                  href={jumpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="s2j-jump-link"
                >
                  Visit Partner Website
                </a>
              </div>
            )}
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
  rankCarouselMap?: { [key: string]: boolean };
}

/**
 * フロントエンド用アライアンス・バナー・コンポーネント (モーダル用)
 * @param param0 フロントエンド用アライアンス・バナー・コンポーネント (モーダル用)
 * @returns フロントエンド用アライアンス・バナー・コンポーネント (モーダル用)
 */
const AllianceBanner: React.FC<AllianceBannerProps> = ({
  contentModels,
  displayStyle,
  alignment = 'center',
  rankCarouselMap = {}
}) => {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedMessage, setSelectedMessage] = useState('');
  const [selectedJumpUrl, setSelectedJumpUrl] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<{url: string, poster: string} | null>(null);

  /**
   * ロゴをクリックしたときにモーダルを開きます。
   * 「handleLogoClick()」メソッドから呼ばれます。
   * @param message
   * @param jumpUrl
   * @param videoUrl
   * @param posterUrl
   */
  const handleLogoClick = (message: string, jumpUrl?: string, videoUrl?: string, posterUrl?: string) => {
    console.log('Logo clicked, message:', message, 'jumpUrl:', jumpUrl, 'videoUrl:', videoUrl);
    setSelectedMessage(message || '動画を再生するにはモーダルを開いてください。');
    setSelectedJumpUrl(jumpUrl || '');
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
   * @param rank ランク名
   * @param modelsCount そのランクのコンテンツモデル数
   * @returns アライアンス・バナーの表示スタイル
   */
  const getDisplayClass = (rank?: string, modelsCount?: number) => {
    // Carousel 表示の条件をチェック
    if (rank && modelsCount !== undefined) {
      const carouselEnabled = rankCarouselMap[rank] || false;
      const canUseCarousel = modelsCount >= 4 && modelsCount <= 8;

      if (carouselEnabled && canUseCarousel) {
        return 's2j-alliance-banner--carousel';
      }
    }

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

  /**
   * 個別のバナー項目をレンダリングします。
   * 「renderBannerItem()」メソッドから呼ばれます。
   * @param model コンテンツモデル
   * @param rank ランク名
   * @param index インデックス
   * @returns バナー項目要素
   */
  const renderBannerItem = (model: ContentModel, rank: string, index: number) => {
    // ロゴサイズ属性を取得
    const logoSizeData = getLogoSizeAttributes(model);

    if (model.behavior === 'modal') {
      // 動画ファイルかどうかを判定
      const isVideo = model.logo_url && /\.(mp4|webm|ogg|mov)$/i.test(model.logo_url);
      // ポスター画像の URL を使用 (PHP 側で準備済み)
      const posterUrl = model.poster_url || '';

      return (
        <li key={`${rank}-${index}`} className="s2j-alliance-item">
          <button
            className="s2j-alliance-logo s2j-alliance-logo--modal"
            onClick={() => handleLogoClick(model.message, model.jump_url, isVideo ? model.logo_url : undefined, posterUrl)}
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
                  {...logoSizeData.attributes}
                  style={logoSizeData.style}
                />
              )
            ) : (
              <div className="s2j-alliance-placeholder">
                <span>No Logo</span>
              </div>
            )}
          </button>
        </li>
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
            {...logoSizeData.attributes}
            style={logoSizeData.style}
          />
        )
      ) : (
        <div className="s2j-alliance-placeholder">
          <span>No Logo</span>
        </div>
      );

      return (
        <li key={`${rank}-${index}`} className="s2j-alliance-item">
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
        </li>
      );
    }
    return null;
  };

  /**
   * Carousel コンポーネント
   * ナビゲーション、インジケータ、タッチスワイプ対応を含む
   */
  interface CarouselProps {
    rank: string;
    models: ContentModel[];
    displayClass: string;
  }

  const Carousel: React.FC<CarouselProps> = ({ rank, models, displayClass }) => {
    const carouselRef = useRef<HTMLUListElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const autoPlayIntervalRef = useRef<number | null>(null);
    const isTransitioningRef = useRef(false);
    const minSwipeDistance = 50;

    const modelsCount = models.length;

    /**
     * 次のスライドに移動
     */
    const goToNext = useCallback(() => {
      if (isTransitioningRef.current) return;

      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;

        // 最後のスライドに達したら、アニメーションなしで最初に戻す
        if (nextIndex >= modelsCount) {
          isTransitioningRef.current = true;

          // アニメーション完了後に、アニメーションなしで2番目のセットの最初に移動
          setTimeout(() => {
            if (carouselRef.current) {
              const firstItem = carouselRef.current.querySelector('.s2j-alliance-item') as HTMLElement;
              if (firstItem) {
                const itemWidth = firstItem.offsetWidth;
                const gap = parseInt(window.getComputedStyle(carouselRef.current).gap) || 16;
                const itemWidthWithGap = itemWidth + gap;
                const baseOffset = -modelsCount * itemWidthWithGap; // 2番目のセットの開始位置

                // アニメーションなしで2番目のセットの最初に移動
                carouselRef.current.style.transition = 'none';
                carouselRef.current.style.transform = `translateX(${baseOffset}px)`;

                // 次のフレームでアニメーションを復元し、最初のスライドに設定
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    if (carouselRef.current) {
                      carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
                      setCurrentIndex(0);
                      isTransitioningRef.current = false;
                    }
                  });
                });
              }
            }
          }, 500);

          return modelsCount - 1; // 最後の位置を返す
        }

        return nextIndex;
      });
      setIsAutoPlaying(false);
    }, [modelsCount]);

    /**
     * 前のスライドに移動
     */
    const goToPrevious = useCallback(() => {
      if (isTransitioningRef.current) return;

      setCurrentIndex((prev) => {
        const prevIndex = prev - 1;

        // 最初のスライドから前へ移動したら、アニメーションなしで最後に戻す
        if (prevIndex < 0) {
          isTransitioningRef.current = true;

          // アニメーション完了後に、アニメーションなしで2番目のセットの最後に移動
          setTimeout(() => {
            if (carouselRef.current) {
              const firstItem = carouselRef.current.querySelector('.s2j-alliance-item') as HTMLElement;
              if (firstItem) {
                const itemWidth = firstItem.offsetWidth;
                const gap = parseInt(window.getComputedStyle(carouselRef.current).gap) || 16;
                const itemWidthWithGap = itemWidth + gap;
                const baseOffset = -modelsCount * itemWidthWithGap; // 2番目のセットの開始位置
                const lastOffset = baseOffset - (modelsCount - 1) * itemWidthWithGap; // 2番目のセットの最後

                // アニメーションなしで2番目のセットの最後に移動
                carouselRef.current.style.transition = 'none';
                carouselRef.current.style.transform = `translateX(${lastOffset}px)`;

                // 次のフレームでアニメーションを復元し、最後のスライドに設定
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    if (carouselRef.current) {
                      carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
                      setCurrentIndex(modelsCount - 1);
                      isTransitioningRef.current = false;
                    }
                  });
                });
              }
            }
          }, 500);

          return 0; // 最初の位置を返す
        }

        return prevIndex;
      });
      setIsAutoPlaying(false);
    }, [modelsCount]);

    /**
     * 指定されたインデックスに移動
     */
    const goToSlide = useCallback((index: number) => {
      if (isTransitioningRef.current) return;
      setCurrentIndex(index);
      setIsAutoPlaying(false);
    }, []);

    /**
     * タッチ開始時の処理
     */
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }, []);

    /**
     * タッチ移動時の処理
     */
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    }, []);

    /**
     * タッチ終了時の処理 (スワイプ判定)
     */
    const handleTouchEnd = useCallback(() => {
      if (!touchStart || !touchEnd) return;

      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
        goToNext();
      } else if (isRightSwipe) {
        goToPrevious();
      }
    }, [touchStart, touchEnd, goToNext, goToPrevious]);

    /**
     * 自動再生の制御
     */
    useEffect(() => {
      if (isAutoPlaying && modelsCount > 0) {
        autoPlayIntervalRef.current = window.setInterval(() => {
          setCurrentIndex((prev) => {
            const nextIndex = prev + 1;
            // 最後のスライドに達したら、アニメーションなしで最初に戻す
            if (nextIndex >= modelsCount) {
              isTransitioningRef.current = true;
              setTimeout(() => {
                if (carouselRef.current) {
                  carouselRef.current.style.transition = 'none';
                  const firstItem = carouselRef.current.querySelector('.s2j-alliance-item') as HTMLElement;
                  if (firstItem) {
                    const itemWidth = firstItem.offsetWidth;
                    const gap = parseInt(window.getComputedStyle(carouselRef.current).gap) || 16;
                    const itemWidthWithGap = itemWidth + gap;
                    const baseOffset = -modelsCount * itemWidthWithGap;
                    carouselRef.current.style.transform = `translateX(${baseOffset}px)`;

                    requestAnimationFrame(() => {
                      if (carouselRef.current) {
                        carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
                        setCurrentIndex(0);
                        isTransitioningRef.current = false;
                      }
                    });
                  }
                }
              }, 500);
              return modelsCount; // 一時的に最後の位置を返す
            }
            return nextIndex;
          });
        }, 3000); // 3秒ごとに自動スライド
      } else {
        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current);
          autoPlayIntervalRef.current = null;
        }
      }

      return () => {
        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current);
        }
      };
    }, [isAutoPlaying, modelsCount]);

    /**
     * スライド位置の更新
     * 無限ループを実現するため、2番目のセット (modelsCount から 2 * modelsCount - 1) を使用
     */
    const updateSlidePosition = useCallback(() => {
      if (carouselRef.current && modelsCount > 0) {
        // 最初のアイテムの幅を取得 (gap を含む)
        const firstItem = carouselRef.current.querySelector('.s2j-alliance-item') as HTMLElement;
        if (firstItem) {
          const itemWidth = firstItem.offsetWidth;
          const gap = parseInt(window.getComputedStyle(carouselRef.current).gap) || 16; // デフォルト gap
          const itemWidthWithGap = itemWidth + gap;

          // currentIndex が範囲外の場合は処理しない (遷移中)
          if (currentIndex < 0 || currentIndex >= modelsCount) {
            return;
          }

          // 2番目のセット (modelsCount から 2 * modelsCount - 1) の位置を使用
          // これにより、最初と最後のスライドで無限ループを実現
          const baseOffset = -modelsCount * itemWidthWithGap; // 2番目のセットの開始位置
          const translateX = baseOffset - (currentIndex * itemWidthWithGap);

          // 遷移中でない場合のみアニメーションを適用
          if (!isTransitioningRef.current) {
            carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
          }
          carouselRef.current.style.transform = `translateX(${translateX}px)`;
        }
      }
    }, [currentIndex, modelsCount]);

    useEffect(() => {
      updateSlidePosition();
    }, [updateSlidePosition]);

    /**
     * 初期化時に2番目のセットの位置から開始
     */
    useEffect(() => {
      if (carouselRef.current && modelsCount > 0) {
        const firstItem = carouselRef.current.querySelector('.s2j-alliance-item') as HTMLElement;
        if (firstItem) {
          const itemWidth = firstItem.offsetWidth;
          const gap = parseInt(window.getComputedStyle(carouselRef.current).gap) || 16;
          const itemWidthWithGap = itemWidth + gap;
          const baseOffset = -modelsCount * itemWidthWithGap; // 2番目のセットの開始位置

          // 初期化時はアニメーションなしで2番目のセットの最初に移動
          carouselRef.current.style.transition = 'none';
          carouselRef.current.style.transform = `translateX(${baseOffset}px)`;

          // 次のフレームでアニメーションを有効化
          requestAnimationFrame(() => {
            if (carouselRef.current) {
              carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
            }
          });
        }
      }
    }, [modelsCount]); // 初期化時のみ実行

    /**
     * ウィンドウサイズ変更時の処理
     */
    useEffect(() => {
      const handleResize = () => {
        updateSlidePosition();
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [updateSlidePosition]);

    /**
     * ホバー時の自動再生一時停止
     */
    const handleMouseEnter = useCallback(() => {
      setIsAutoPlaying(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsAutoPlaying(true);
    }, []);

    // Carousel 表示の場合、コンテンツを複製して無限ループを作成
    // より滑らかな連続スクロールのため、3倍に複製
    const itemsToRender = [...models, ...models, ...models];

    return (
      <div 
        className="s2j-alliance-banner-wrapper s2j-alliance-banner-wrapper--carousel"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          className="s2j-alliance-carousel-nav s2j-alliance-carousel-nav--prev"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          <span>◀</span>
        </button>
        <ul
          ref={carouselRef}
          className={`s2j-alliance-banner ${displayClass} ${getAlignmentClass()}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {itemsToRender.map((model, index) => 
            renderBannerItem(model, rank, index)
          )}
        </ul>
        <button
          className="s2j-alliance-carousel-nav s2j-alliance-carousel-nav--next"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <span>▶</span>
        </button>
        <div className="s2j-alliance-carousel-indicators">
          {models.map((_, index) => (
            <button
              key={index}
              className={`s2j-alliance-carousel-indicator ${index === currentIndex ? 's2j-alliance-carousel-indicator--active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
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

    const modelsCount = models.length;
    const displayClass = getDisplayClass(rank, modelsCount);
    const isCarousel = displayClass === 's2j-alliance-banner--carousel';

    // ランクごとの背景色を取得 (最初のモデルから取得)
    const backgroundColor = models[0]?.background_color || 'transparent';

    return (
      <div 
        key={rank} 
        className="s2j-alliance-rank"
        style={{ 
          '--rank-background-color': backgroundColor 
        } as React.CSSProperties}
      >
        <h3 className="s2j-alliance-rank-title">{rank}</h3>
        {isCarousel ? (
          <Carousel rank={rank} models={models} displayClass={displayClass} />
        ) : (
          <div className="s2j-alliance-banner-wrapper">
            <ul className={`s2j-alliance-banner ${displayClass} ${getAlignmentClass()}`}>
              {models.map((model, index) => 
                renderBannerItem(model, rank, index)
              )}
            </ul>
          </div>
        )}
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
        jumpUrl={selectedJumpUrl}
        video={selectedVideo}
        showCloseButton={true}
      />
    </>
  );
};

// 初期化済みの要素を追跡するSet
const initializedElements = new Set<HTMLElement>();

/**
 * アライアンス・バナー要素を初期化します
 * @param element 初期化する要素
 */
function initializeBannerElement(element: HTMLElement) {
  // 既に初期化済みの場合はスキップ
  if (initializedElements.has(element)) {
    return;
  }

  // コンテンツデータを取得 (DOM 属性から)
  let contentModels: ContentModel[] = [];
  try {
    const contentModelsData = element.dataset.contentModels;
    if (contentModelsData) {
      contentModels = JSON.parse(contentModelsData);
    }
  } catch (error) {
    console.error('S2J Alliance Manager: Error parsing content models:', error);
    // フォールバックとして window オブジェクトから取得
    contentModels = window.s2jAllianceBannerData?.contentModels || [];
  }
  
  // ランク別の carousel_enabled 情報を取得
  let rankCarouselMap: { [key: string]: boolean } = {};
  try {
    const rankCarouselMapData = element.dataset.rankCarouselMap;
    if (rankCarouselMapData) {
      rankCarouselMap = JSON.parse(rankCarouselMapData);
    }
  } catch (error) {
    console.error('S2J Alliance Manager: Error parsing rank carousel map:', error);
  }

  // 属性を取得 (DOM 属性から直接取得)
  const displayStyle = (element.dataset.displayStyle as 'grid-single' | 'grid-multi') || 'grid-single';
  const alignment = (element.dataset.alignment as 'left' | 'center' | 'right') || 'center';

  // React コンポーネントをレンダリング
  const root = createRoot(element);
  root.render(
    <AllianceBanner
      contentModels={contentModels}
      displayStyle={displayStyle}
      alignment={alignment}
      rankCarouselMap={rankCarouselMap}
    />
  );

  // 初期化済みとしてマーク
  initializedElements.add(element);
}

/**
 * すべてのアライアンス・バナー・ブロックを初期化します
 */
function initAllianceBanners() {
  // すべてのアライアンス・バナー・ブロックを取得
  const bannerBlocks = document.querySelectorAll('.wp-block-s2j-alliance-manager-alliance-banner');

  bannerBlocks.forEach((block: Element) => {
    const blockElement = block as HTMLElement;
    initializeBannerElement(blockElement);
  });
}

/**
 * MutationObserverを使用してDOM変更を監視し、新しいアライアンス・バナー要素を初期化します
 */
function setupMutationObserver() {
  // デバウンス用のタイマー
  let debounceTimer: number | null = null;

  const observer = new MutationObserver((mutations) => {
    // デバウンス処理: 短時間に複数の変更があった場合は最後の変更のみを処理
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = window.setTimeout(() => {
      mutations.forEach((mutation) => {
        // 追加されたノードをチェック
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Node.ELEMENT_NODE
            const element = node as Element;
            
            // 追加された要素自体がアライアンス・バナー要素の場合
            if (element.classList.contains('wp-block-s2j-alliance-manager-alliance-banner')) {
              initializeBannerElement(element as HTMLElement);
            }
            
            // 追加された要素の子要素にアライアンス・バナー要素がある場合
            const bannerElements = element.querySelectorAll('.wp-block-s2j-alliance-manager-alliance-banner');
            if (bannerElements.length > 0) {
              bannerElements.forEach((bannerElement: Element) => {
                initializeBannerElement(bannerElement as HTMLElement);
              });
            }
          }
        });
      });
    }, 100); // 100ms後に実行
  });

  // ドキュメント全体の変更を監視
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
}

// DOM が読み込まれた後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAllianceBanners();
    setupMutationObserver();
  });
} else {
  initAllianceBanners();
  setupMutationObserver();
}

// WordPress のブロックエディター用の初期化 (フロントエンドでは不要)
// フロントエンドでは通常の DOMContentLoaded イベントで十分

export { initAllianceBanners };
