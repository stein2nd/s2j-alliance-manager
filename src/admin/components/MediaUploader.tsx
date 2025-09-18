import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { WordPressMedia } from '../../types';

/**
 * React.FunctionComponent「メディア・アップローダー」インターフェイス
 */
interface MediaUploaderProps {
  attachmentId: number;
  onSelect: (attachmentId: number) => void;
  label?: string;
  allowedTypes?: string[];
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
  allowedTypes = ['image', 'video']
}) => {
  const [media, setMedia] = useState<WordPressMedia | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (attachmentId > 0) {
      // メディアを読み込みます。
      loadMedia(attachmentId);
    } else {
      setMedia(null);
    }
  }, [attachmentId]);

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

  return (
    <div className="s2j-media-uploader">
      {media ? (
        <div className="s2j-media-preview">
          {isVideo(media.mime_type) ? (
            <video
              src={media.url}
              controls
              className="s2j-logo-preview"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              {__('Your browser does not support the video tag.', 's2j-alliance-manager')}
            </video>
          ) : (
            <img
              src={media.url}
              alt={media.alt}
              className="s2j-logo-preview"
            />
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
