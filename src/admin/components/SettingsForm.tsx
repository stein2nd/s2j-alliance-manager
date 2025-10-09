import React, { useState, useEffect, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { 
  SelectControl, 
  RadioControl, 
  TextControl, 
  Button, 
  Card, 
  CardBody, 
  CardHeader,
  Notice,
  Spinner
} from '@wordpress/components';
import { AllianceSettings, RankLabel } from '../../types';
import { ErrorHandler } from '../utils/errorHandler';

/**
 * React.FunctionComponent「設定フォーム」インターフェイス
 */
interface SettingsFormProps {
  settings: AllianceSettings;
  onSave: (settings: AllianceSettings) => Promise<void>;
  isLoading?: boolean;
  rankLabels: RankLabel[]; // ランクラベル選択肢用
}

/**
 * React.FunctionComponent「設定フォーム」
 * `src/admin/index.tsx` で呼ばれます。
 */
export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSave,
  isLoading: _isLoading = false,
  rankLabels: _rankLabels
}) => {
  /**
   * フォームデータ
   */
  const [formData, setFormData] = useState<AllianceSettings>(settings);

  /**
   * エラー
   */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * 未保存の変更があるかどうか
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * 保存中かどうか
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * プレビューデータ
   */
  const [previewData, setPreviewData] = useState<{
    displayStyle: string;
    alignment: string;
    ffmpegPath?: string;
    sampleContent: Array<{
      id: number;
      title: string;
      logo: number;
      jump_url: string;
      behavior: string;
      rank: string;
      message?: string;
    }>;
  } | null>(null);

  /**
   * プレビューデータを生成します
   */
  const generatePreviewData = useCallback(() => {
    // プレビュー用のサンプルデータを生成
    const sampleData = {
      displayStyle: formData.display_style,
      alignment: formData.alignment,
      ffmpegPath: formData.ffmpeg_path,
      sampleContent: [
        {
          id: 1,
          title: 'Sample Partner 1',
          logo: 0,
          jump_url: 'https://example.com',
          behavior: 'jump',
          rank: 'gold'
        },
        {
          id: 2,
          title: 'Sample Partner 2',
          logo: 0,
          jump_url: '',
          behavior: 'modal',
          rank: 'silver',
          message: 'This is a sample message for modal display.'
        }
      ]
    };

    setPreviewData(sampleData);
  }, [formData]);

  /**
   * フィールドのバリデーション
   */
  const validateField = useCallback((field: keyof AllianceSettings, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'display_style':
        if (!value || !['grid-single', 'grid-multi'].includes(value)) {
          newErrors.display_style = __('Please select a valid display style.', 's2j-alliance-manager');
        } else {
          delete newErrors.display_style;
        }
        break;

      case 'alignment':
        if (!value || !['left', 'center', 'right'].includes(value)) {
          newErrors.alignment = __('Please select a valid alignment.', 's2j-alliance-manager');
        } else {
          delete newErrors.alignment;
        }
        break;

      case 'ffmpeg_path':
        if (value && !isValidFilePath(value)) {
          newErrors.ffmpeg_path = __('Please enter a valid file path.', 's2j-alliance-manager');
        } else {
          delete newErrors.ffmpeg_path;
        }
        break;
    }

    setErrors(newErrors);
  }, [errors]);

  /**
   * ファイルパスの妥当性をチェック
   */
  const isValidFilePath = (path: string): boolean => {
    // 基本的なファイルパス形式をチェック
    return /^[a-zA-Z0-9/\\:.\-_]+$/.test(path);
  };

  /**
   * フォーム全体のバリデーション
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // 必須フィールドのチェック
    if (!formData.display_style) {
      newErrors.display_style = __('Display style is required.', 's2j-alliance-manager');
    }

    if (!formData.alignment) {
      newErrors.alignment = __('Alignment is required.', 's2j-alliance-manager');
    }

    // FFmpeg パスのチェック
    if (formData.ffmpeg_path && !isValidFilePath(formData.ffmpeg_path)) {
      newErrors.ffmpeg_path = __('Please enter a valid file path.', 's2j-alliance-manager');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * フォームデータを更新します
   */
  const updateFormData = useCallback((field: keyof AllianceSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setHasUnsavedChanges(true);

    // リアルタイムバリデーション
    validateField(field, value);
  }, [validateField]);

  /**
   * 設定を保存します
   */
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      setHasUnsavedChanges(false);
      setErrors({});

        // 成功メッセージを表示
        ErrorHandler.showSuccess(
          __('Settings saved successfully.', 's2j-alliance-manager'), 'settings-save'
        );
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = ErrorHandler.parseError(error, 'settings-save');

      // エラーメッセージを表示
      ErrorHandler.showError(errorMessage, 'settings-save');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSave, validateForm]);

  /**
   * 変更をキャンセルします
   */
  const handleCancel = useCallback(() => {
    setFormData(settings);
    setHasUnsavedChanges(false);
    setErrors({});
  }, [settings]);

  /**
   * FFmpeg テスト機能の実装
   */
  const handleFFmpegTest = useCallback(async () => {
    if (!formData.ffmpeg_path) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${window.s2jAllianceManager.apiUrl}ffmpeg/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.s2jAllianceManager.nonce
        },
        body: JSON.stringify({ ffmpeg_path: formData.ffmpeg_path })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // 成功メッセージを表示
          ErrorHandler.showSuccess(
            __('FFmpeg is working correctly.', 's2j-alliance-manager'), 'ffmpeg-test'
          );
        } else {
          const errorMessage = ErrorHandler.parseError(
            { message: result.message || __('FFmpeg test failed.', 's2j-alliance-manager') },
            'ffmpeg-test'
          );

          // エラーメッセージを表示
          ErrorHandler.showError(errorMessage, 'ffmpeg-test');
        }
      } else {
        const errorMessage = ErrorHandler.parseError(
          { status: response.status, message: __('Failed to test FFmpeg.', 's2j-alliance-manager') },
          'ffmpeg-test'
        );

        // エラーメッセージを表示
        ErrorHandler.showError(errorMessage, 'ffmpeg-test');
      }
    } catch (error) {
      console.error('Error testing FFmpeg:', error);
      const errorMessage = ErrorHandler.parseError(error, 'ffmpeg-test');

      // エラーメッセージを表示
      ErrorHandler.showError(errorMessage, 'ffmpeg-test');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData.ffmpeg_path]);

  // 設定が変更された際にフォームデータを更新
  useEffect(() => {
    setFormData(settings);
    setHasUnsavedChanges(false);
    setErrors({});
  }, [settings]);

  // プレビューデータの生成
  useEffect(() => {
    generatePreviewData();
  }, [generatePreviewData]);

  return (
    <div className="s2j-settings-form">
      <div className="s2j-settings-header">
        <h2>{__('Display Settings', 's2j-alliance-manager')}</h2>
        <p className="s2j-settings-description">{__('Configure how alliance banners are displayed on your site.', 's2j-alliance-manager')}</p>
      </div>
      <div className="s2j-settings-content">
        {/* 表示形式設定 */}
        <Card className="s2j-settings-card">
          <CardHeader>
            <h3 className="s2j-settings-card-header-title">{__('Display Style', 's2j-alliance-manager')}</h3>
          </CardHeader>
          <CardBody>
            <SelectControl
              label={__('Display Style', 's2j-alliance-manager')}
              value={formData.display_style}
              onChange={(value: string) => updateFormData('display_style', value)}
              options={[
                { label: __('Single Column Grid', 's2j-alliance-manager'), value: 'grid-single' },
                { label: __('Multi Column Grid', 's2j-alliance-manager'), value: 'grid-multi' }
              ]}
              help={__('Choose how the alliance banners are arranged on your site.', 's2j-alliance-manager')}
              __nextHasNoMarginBottom={true}
              __next40pxDefaultSize={true}
            />{errors.display_style && (
              <Notice status="error" isDismissible={false}>{errors.display_style}</Notice>
            )}</CardBody>
        </Card>
        {/* 配置設定 */}
        <Card className="s2j-settings-card">
          <CardHeader>
            <h3 className="s2j-settings-card-header-title">{__('Alignment', 's2j-alliance-manager')}</h3>
          </CardHeader>
          <CardBody>
            <RadioControl
              label={__('Alignment', 's2j-alliance-manager')}
              selected={formData.alignment}
              options={[
                { label: __('Left', 's2j-alliance-manager'), value: 'left' },
                { label: __('Center', 's2j-alliance-manager'), value: 'center' },
                { label: __('Right', 's2j-alliance-manager'), value: 'right' }
              ]}
              onChange={(value: string) => updateFormData('alignment', value)}
              help={__('Choose the alignment of the alliance banners.', 's2j-alliance-manager')}
            />{errors.alignment && (
              <Notice status="error" isDismissible={false}>{errors.alignment}</Notice>
            )}</CardBody>
        </Card>
        {/* FFmpeg パス設定 */}
        <Card className="s2j-settings-card">
          <CardHeader>
            <h3 className="s2j-settings-card-header-title">{__('FFmpeg Settings', 's2j-alliance-manager')}</h3>
          </CardHeader>
          <CardBody>
            <TextControl
              label={__('FFmpeg Path', 's2j-alliance-manager')}
              value={formData.ffmpeg_path || ''}
              onChange={(value: string) => updateFormData('ffmpeg_path', value)}
              placeholder={__('Enter the path to FFmpeg executable', 's2j-alliance-manager')}
              help={__('Optional: Path to FFmpeg executable for video processing. Leave empty if not needed.', 's2j-alliance-manager')}
              __nextHasNoMarginBottom={true}
              __next40pxDefaultSize={true}
            />
            {errors.ffmpeg_path && (
              <Notice status="error" isDismissible={false}>{errors.ffmpeg_path}</Notice>
            )}
            {/* FFmpeg テストボタン */}
            {formData.ffmpeg_path && (
              <div className="s2j-ffmpeg-test">
                <Button
                  variant="secondary"
                  onClick={handleFFmpegTest}
                  disabled={isSubmitting}
                >{__('Test FFmpeg', 's2j-alliance-manager')}</Button>
              </div>
            )}
          </CardBody>
        </Card>
        {/* プレビュー機能 */}
        <Card className="s2j-settings-card">
          <CardHeader>
            <h3 className="s2j-settings-card-header-title">{__('Preview', 's2j-alliance-manager')}</h3>
          </CardHeader>
          <CardBody>
            <div className="s2j-settings-preview">
              <h4>{__('Preview', 's2j-alliance-manager')}</h4>
              <div className={`s2j-preview-container s2j-preview-${formData.display_style} s2j-preview-${formData.alignment}`}>
                {previewData?.sampleContent.map((item, index: number) => (
                  <div key={index} className="s2j-preview-item">
                    <div className="s2j-preview-logo">{item.logo ? '🖼️' : '📷'}</div>
                    <div className="s2j-preview-content">
                      <h5 className="s2j-preview-content-title">{item.title}</h5>
                      <p className="s2j-preview-content-rank">{item.rank}</p>
                      {item.behavior === 'modal' && (
                        <p className="s2j-preview-content-message">{item.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      {/* アクションボタン */}
      <div className="s2j-settings-actions">
        {hasUnsavedChanges && (
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >{__('Cancel', 's2j-alliance-manager')}</Button>
        )}
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSubmitting || !hasUnsavedChanges || Object.keys(errors).length > 0}
        >{isSubmitting ? (
            <>
              <Spinner />
              {__('Saving...', 's2j-alliance-manager')}
            </>
          ) : (
            __('Save Settings', 's2j-alliance-manager')
          )}</Button>
      </div>
    </div>
  );
};
