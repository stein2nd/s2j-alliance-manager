import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { WordPressMedia, FFmpegSettings } from '../../types';

/**
 * React.FunctionComponent「メディア・アップローダー」インターフェイス
 */
interface MediaUploaderProps {
  attachmentId: number;
  onSelect: (attachmentId: number) => void;
  label?: string;
  allowedTypes?: string[];
  onPosterGenerated?: (posterId: number) => void;
  ffmpegSettings?: FFmpegSettings;
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
  onPosterGenerated,
  ffmpegSettings
}) => {
  const [media, setMedia] = useState<WordPressMedia | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [posterAttachmentId, setPosterAttachmentId] = useState<number | null>(null);

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
   * 動画に対応するポスター画像を検索します。
   * 
   * @param videoId 動画の添付ファイル ID
   */
  const findPosterImage = async (videoId: number) => {
    try {
      const response = await fetch(`/wp-json/wp/v2/media?parent=${videoId}&mime_type=image/jpeg&per_page=1`);
      if (response.ok) {
        const posters = await response.json();
        if (posters.length > 0) {
          setPosterAttachmentId(posters[0].id);
        }
      }
    } catch (error) {
      console.error('Error finding poster image:', error);
    }
  };

  /**
   * メディアを読み込みます。
   * 「useEffect」から呼ばれます。
   * 
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
   * メディア・ライブラリを開きます。
   * 「s2j-media-select-btn.onClick()」メソッドから呼ばれます。
   * 
   * @returns 
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
    }) as any;

    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();

      // メディアを選択します。
      onSelect(attachment.id);
    });

    frame.open();
  };

  /**
   * メディアを削除します。
   * 「s2j-media-remove-btn.onClick()」メソッドから呼ばれます。
   */
  const removeMedia = () => {
    onSelect(0);
  };

  /**
   * 動画からポスター画像を生成します。
   * 「s2j-generate-poster-btn.onClick()」メソッドから呼ばれます。
   */
  const generatePoster = async () => {
    if (!media || !isVideo(media.mime_type)) {
      return;
    }

    // FFmpeg が利用可能かチェック
    if (!ffmpegSettings?.ffmpeg_available) {
      alert(__('FFmpeg is not available. Please upload a poster image manually.', 's2j-alliance-manager'));
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
        if (onPosterGenerated) {
          onPosterGenerated(result.poster_id);
        }
        // ポスター画像を再検索
        findPosterImage(attachmentId);
      } else {
        console.error('Failed to generate poster:', result.message);
        alert(result.message || __('Failed to generate poster image.', 's2j-alliance-manager'));
      }
    } catch (error) {
      console.error('Error generating poster:', error);
      alert(__('Failed to generate poster image.', 's2j-alliance-manager'));
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  /**
   * ポスター画像を手動でアップロードします。
   * 「s2j-upload-poster-btn.onClick()」メソッドから呼ばれます。
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
    }) as any;

    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      
      // ポスター画像を動画の子として設定
      if (media && isVideo(media.mime_type)) {
        // ポスター画像の親を動画に設定
        (window as any).wp.ajax.post('update-attachment', {
          id: attachment.id,
          parent: media.id
        }).then(() => {
          setPosterAttachmentId(attachment.id);
          if (onPosterGenerated) {
            onPosterGenerated(attachment.id);
          }
        });
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
   * メディアが動画かどうかを判定します。
   * 
   * @param mimeType MIME タイプ
   * @returns 動画かどうか
   */
  const isVideo = (mimeType: string) => {
    return mimeType.startsWith('video/');
  };

  /**
   * 表示するメディアを決定します。
   * 動画の場合はポスター画像を優先表示し、なければ動画を表示します。
   */
  const getDisplayMedia = () => {
    if (!media) return null;

    if (isVideo(media.mime_type)) {
      // 動画の場合、ポスター画像があればそれを表示
      if (posterAttachmentId) {
        return {
          type: 'poster',
          url: `/wp-json/wp/v2/media/${posterAttachmentId}`,
          alt: `${media.title} Poster`
        };
      } else {
        // ポスター画像がない場合は動画を表示
        return {
          type: 'video',
          url: media.url,
          alt: media.alt
        };
      }
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
          
          {/* 動画でポスター画像がない場合の注意表示 */}
          {isVideo(media.mime_type) && !posterAttachmentId && (
            <div className="s2j-poster-notice">
              <p>{__('No poster image available. Please generate or upload one.', 's2j-alliance-manager')}</p>
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
