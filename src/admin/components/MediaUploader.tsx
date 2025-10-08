import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { WordPressMedia, FFmpegSettings } from '../../types';
import { WordPressMediaFrame } from '../../types/wordpress';

/**
 * React.FunctionComponent「メディア・アップローダー」インターフェイス
 */
interface MediaUploaderProps {
  attachmentId: number;
  onSelect: (attachmentId: number) => void;
  label?: string;
  allowedTypes?: string[];
  onPosterNoticeChange?: (showNotice: boolean) => void;
  ffmpegSettings?: FFmpegSettings;
  posterId?: number;
  onPosterSelect?: (posterId: number) => void;
}

/**
 * React.FunctionComponent「メディア・アップローダー」
 * `src/admin/components/ContentList.tsx` で呼ばれる。
 * 
 * @param param0 メディア・アップローダー
 * @returns メディア・アップローダー
 */
export const MediaUploader: React.FC<MediaUploaderProps> = ({
  attachmentId,
  onSelect,
  label,
  allowedTypes = ['image', 'video'],
  onPosterNoticeChange,
  ffmpegSettings,
  posterId,
  onPosterSelect
}) => {
  const [media, setMedia] = useState<WordPressMedia | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [posterAttachmentId, setPosterAttachmentId] = useState<number | null>(null);
  const [posterMedia, setPosterMedia] = useState<WordPressMedia | null>(null);

  /**
   * メディアが動画かどうかを判定します。
   * 
   * @param mimeType MIME タイプ
   * @returns 動画かどうか
   */
  const isVideo = (mimeType: string) => {
    return mimeType.startsWith('video/');
  };

  /**
   * メディアを読み込みます。
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    if (attachmentId > 0) {
      // メディアを読み込みます。
      loadMedia(attachmentId);
      // ポスター画像を検索します。
      findPosterImage(attachmentId);
    } else {
      setMedia(null);
      setPosterAttachmentId(null);
    }
  }, [attachmentId]);

  /**
   * posterId が変更された時にポスター画像を読み込み
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    if (posterId && posterId > 0) {
      loadPosterMedia(posterId);
    } else {
      setPosterMedia(null);
    }
  }, [posterId]);

  /**
   * メディアが変更された時にポスター画像をリセット
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    if (media && isVideo(media.mime_type)) {
      // 動画の場合はポスター画像を検索
      findPosterImage(media.id);
    } else {
      // 画像の場合はポスター画像をリセット
      setPosterAttachmentId(null);
    }
  }, [media]);

  /**
   * ポスターノティスの表示状態を親コンポーネントに通知
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    if (onPosterNoticeChange) {
      const shouldShowNotice = Boolean(media && 
        isVideo(media.mime_type) && 
        !posterAttachmentId && 
        ffmpegSettings?.ffmpeg_available === false);

      onPosterNoticeChange(shouldShowNotice);
    }
  }, [media, posterAttachmentId, ffmpegSettings, onPosterNoticeChange]);

  /**
   * 動画に対応するポスター画像を検索します。
   * 「findPosterImage()」メソッドから呼ばれます。
   * @param videoId 動画の添付ファイル ID
   */
  const findPosterImage = async (videoId: number) => {
    try {
      const response = await fetch(`/wp-json/wp/v2/media?parent=${videoId}&mime_type=image/jpeg&per_page=1`);

      if (response.ok) {
        const posters = await response.json();
        if (posters.length > 0) {
          setPosterAttachmentId(posters[0].id);
        } else {
          // ポスター画像が見つからない場合は null に設定
          setPosterAttachmentId(null);
        }
      } else {
        console.error('Failed to find poster image:', response.status, response.statusText);

        setPosterAttachmentId(null);
      }
    } catch (error) {
      console.error('Error finding poster image:', error);

      setPosterAttachmentId(null);
    }
  };

  /**
   * メディアを読み込みます。
   * 「useEffect」から呼ばれます。
   * @param id 添付ファイルの ID
   */
  const loadMedia = async (id: number) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/wp-json/wp/v2/media/${id}`);

      if (response.ok) {
        const mediaData = await response.json();

        setMedia({
          id: mediaData.id,
          url: mediaData.source_url,
          alt: mediaData.alt_text || '',
          title: mediaData.title?.rendered || '',
          caption: mediaData.caption?.rendered || '',
          description: mediaData.description?.rendered || '',
          mime_type: mediaData.mime_type,
          file_size: mediaData.media_details?.filesize || 0,
          width: mediaData.media_details?.width || 0,
          height: mediaData.media_details?.height || 0
        });
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * poster 画像を読み込みます。
   * 「loadPosterMedia()」メソッドから呼ばれます。
   * @param id 添付ファイル ID
   */
  const loadPosterMedia = async (id: number) => {
    try {
      const response = await fetch(`/wp-json/wp/v2/media/${id}`);

      if (response.ok) {
        const mediaData = await response.json();

        setPosterMedia({
          id: mediaData.id,
          url: mediaData.source_url,
          alt: mediaData.alt_text || '',
          title: mediaData.title?.rendered || '',
          caption: mediaData.caption?.rendered || '',
          description: mediaData.description?.rendered || '',
          mime_type: mediaData.mime_type,
          file_size: mediaData.media_details?.filesize || 0,
          width: mediaData.media_details?.width || 0,
          height: mediaData.media_details?.height || 0
        });
      }
    } catch (error) {
      console.error('Error loading poster media:', error);

      setPosterMedia(null);
    }
  };

  /**
   * メディア・ライブラリを開きます。
   * 「s2j-media-select-btn.onClick()」メソッドから呼ばれます。
   * @returns メディア・ライブラリを開きます。
   */
  const openMediaLibrary = () => {
    if (!window.wp?.media) {
      console.error('WordPress media library not available');
      return;
    }

    // メディア・ライブラリを開きます。
    const frame = window.wp.media({
      title: label || __('Select Media', 's2j-alliance-manager'),
      button: {
        text: __('Select', 's2j-alliance-manager')
      },
      multiple: false,
      library: {
        type: allowedTypes
      }
    }) as unknown as WordPressMediaFrame;

    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();

      // メディアを選択します。
      onSelect(attachment.id);
    });

    frame.open();
  };

  /**
   * メディアを削除します。
   */
  const removeMedia = () => {
    onSelect(0);

    // poster画像も削除
    if (onPosterSelect) {
      onPosterSelect(0);
    }

    // ローカル状態もリセット
    setMedia(null);
    setPosterAttachmentId(null);
    setPosterMedia(null);
  };

  /**
   * 動画からポスター画像を生成します。
   * 「s2j-generate-poster-btn.onClick()」メソッドから呼ばれます。
   * @returns 動画からポスター画像を生成します。
   */
  const generatePoster = async () => {
    if (!media || !isVideo(media.mime_type)) {
      return;
    }

    // FFmpeg が利用可能かチェック
    if (!ffmpegSettings?.ffmpeg_available) {
      window.alert(__('FFmpeg is not available. Please upload a poster image manually.', 's2j-alliance-manager'));
      return;
    }

    setIsGeneratingPoster(true);

    try {
      const response = await fetch(`${window.s2jAllianceManager.apiUrl}ffmpeg/generate-poster`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.s2jAllianceManager.nonce,
        },
        body: JSON.stringify({
          attachment_id: media.id,
        }),
      });

      const result = await response.json();

      if (result.success && result.poster_id) {
        // ポスター生成成功
        setPosterAttachmentId(result.poster_id);
        // poster 画像を読み込み
        loadPosterMedia(result.poster_id);

        if (onPosterSelect) {
          onPosterSelect(result.poster_id);
        }
      } else {
        console.error('Failed to generate poster:', result.message);
        window.alert(result.message || __('Failed to generate poster image.', 's2j-alliance-manager'));
      }
    } catch (error) {
      console.error('Error generating poster:', error);
      window.alert(__('Failed to generate poster image.', 's2j-alliance-manager'));
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  /**
   * ポスター画像を手動でアップロードします。
   * 「s2j-upload-poster-btn.onClick()」メソッドから呼ばれます。
   * @returns ポスター画像を手動でアップロードします。
   */
  const uploadPoster = () => {
    if (!window.wp?.media) {
      console.error('WordPress media library not available');
      return;
    }

    // ポスター画像用のメディア・ライブラリを開きます。
    const frame = window.wp.media({
      title: __('Select Poster Image', 's2j-alliance-manager'),
      button: {
        text: __('Select Poster', 's2j-alliance-manager')
      },
      multiple: false,
      library: {
        type: ['image']
      }
    }) as unknown as WordPressMediaFrame;

    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();

      // ポスター画像を動画の子として設定
      if (media && isVideo(media.mime_type)) {
        // ローディング状態を設定
        setIsLoading(true);

        // ポスター画像の親を動画に設定 (REST API を使用)
        fetch(`/wp-json/wp/v2/media/${attachment.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.s2jAllianceManager.nonce,
          },
          body: JSON.stringify({
            parent: media.id
          })
        }).then(response => {
          if (response.ok) {
            setPosterAttachmentId(attachment.id);
            // poster 画像を読み込み
            loadPosterMedia(attachment.id);

            if (onPosterSelect) {
              onPosterSelect(attachment.id);
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        }).catch((error: unknown) => {
          console.error('Error updating attachment parent:', error);
          window.alert(__('Failed to set poster image. Please try again.', 's2j-alliance-manager'));
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        window.alert(__('Please select a video file first.', 's2j-alliance-manager'));
      }
    });

    frame.open();
  };

  if (isLoading) {
    return (
      <div className="s2j-media-uploader">
        <div className="s2j-media-preview">
          <div className="s2j-logo-placeholder">
            <span>{__('Loading...', 's2j-alliance-manager')}</span>
          </div>
        </div>
      </div>
    );
  }

  /**
   * 表示するメディアを決定します。
   * 動画の場合は常に動画を表示し、poster 画像は別途表示します。
   * 「getDisplayMedia()」メソッドから呼ばれます。
   * @returns 表示するメディアを決定します。
   */
  const getDisplayMedia = () => {
    if (!media) return null;

    if (isVideo(media.mime_type)) {
      // 動画の場合は常に動画を表示
      return {
        type: 'video',
        url: media.url,
        alt: media.alt
      };
    } else {
      // 画像の場合はそのまま表示
      return {
        type: 'image',
        url: media.url,
        alt: media.alt
      };
    }
  };

  const displayMedia = getDisplayMedia();

  return (
    <div className="s2j-media-uploader">
      {media ? (
        <div className="s2j-media-preview">
          {displayMedia?.type === 'video' ? (
            <video
              src={displayMedia.url}
              controls
              className="s2j-logo-preview"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              {__('Your browser does not support the video tag.', 's2j-alliance-manager')}
            </video>
          ) : displayMedia?.type === 'poster' ? (
            <img
              src={displayMedia.url}
              alt={displayMedia.alt}
              className="s2j-logo-preview s2j-poster-preview"
            />
          ) : displayMedia?.type === 'image' ? (
            <img
              src={displayMedia.url}
              alt={displayMedia.alt}
              className="s2j-logo-preview"
            />
          ) : null}
          {/* Poster 画像のプレビュー (動画の場合のみ) */}
          {media && isVideo(media.mime_type) && (posterAttachmentId || posterMedia) && (
            <div className="s2j-poster-preview-container">
              <img
                src={posterMedia?.url || (posterAttachmentId ? `/wp-json/wp/v2/media/${posterAttachmentId}` : '')}
                alt={`${posterMedia?.title || media.title} Poster`}
                className="s2j-poster-preview"
                style={{ maxWidth: '100%', height: 'auto', marginTop: '8px' }}
                onError={(e) => {
                  console.error('Failed to load poster image:', e);
                  // エラーが発生した場合、画像を非表示にする
                  const target = e.target as { style?: { display: string } };
                  if (target && target.style) {
                    target.style.display = 'none';
                  }
                }}
              />
              <div className="s2j-poster-label">
                {__('Poster Image', 's2j-alliance-manager')}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="s2j-media-preview">
          <div className="s2j-logo-placeholder">
            <span>{__('No media', 's2j-alliance-manager')}</span>
          </div>
        </div>
      )}
      <div className="s2j-media-actions">
        <Button
          size="small"
          onClick={openMediaLibrary}
          className="s2j-media-select-btn"
        >
          <span>{media ? __('Change', 's2j-alliance-manager') : __('Select', 's2j-alliance-manager')}</span>
        </Button>
        {/* 動画の場合のポスター関連ボタン */}
        {media && isVideo(media.mime_type) && (
          <>
            {/* FFmpeg が利用可能な場合のポスター生成ボタン */}
            {ffmpegSettings?.ffmpeg_available && (
              <Button
                size="small"
                onClick={generatePoster}
                disabled={isGeneratingPoster}
                className="s2j-generate-poster-btn"
              >
                <span>
                  {isGeneratingPoster 
                    ? __('Generating...', 's2j-alliance-manager') 
                    : __('Generate Poster', 's2j-alliance-manager')
                  }
                </span>
              </Button>
            )}
            {/* ポスター画像アップロードボタン */}
            <Button
              size="small"
              onClick={uploadPoster}
              className="s2j-upload-poster-btn"
            >
              <span>
                {posterAttachmentId 
                  ? __('Change Poster', 's2j-alliance-manager')
                  : __('Upload Poster', 's2j-alliance-manager')
                }
              </span>
            </Button>
            {/* FFmpeg が利用不可能な場合の注意表示 */}
            {!ffmpegSettings?.ffmpeg_available && (
              <div className="s2j-ffmpeg-notice">
                <small>
                  {__('FFmpeg not available. Please upload a poster image manually.', 's2j-alliance-manager')}
                </small>
              </div>
            )}
          </>
        )}
        {media && (
          <Button
            size="small"
            variant="destructive"
            onClick={removeMedia}
            className="s2j-media-remove-btn"
          >
            <span>{__('Remove', 's2j-alliance-manager')}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
