import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { FFmpegSettings, FFmpegTestResult } from '../../types';

/**
 * React.FunctionComponent「FFmpeg Library Manager」インターフェイス
 */
interface FFmpegLibraryManagerProps {
  settings: FFmpegSettings;
  onSave: (ffmpegPath: string) => void;
  isLoading?: boolean;
}

/**
 * React.FunctionComponent「FFmpeg Library Manager」
 * FFmpeg の設定とテスト機能を提供します。
 * 
 * @param param0 プロパティ
 * @returns FFmpeg Library Manager
 */
export const FFmpegLibraryManager: React.FC<FFmpegLibraryManagerProps> = ({
  settings,
  onSave,
  isLoading = false
}) => {
  const [ffmpegPath, setFFmpegPath] = useState(settings.ffmpeg_path || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<FFmpegTestResult | null>(null);

  useEffect(() => {
    setFFmpegPath(settings.ffmpeg_path || '');
  }, [settings.ffmpeg_path]);

  /**
   * FFmpeg パスを変更します。
   * 
   * @param value 値
   */
  const handlePathChange = (value: string) => {
    setFFmpegPath(value);
    setTestResult(null);
  };

  /**
   * FFmpeg の利用可能性をテストします。
   */
  const handleTestFFmpeg = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`${window.s2jAllianceManager.apiUrl}ffmpeg/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.s2jAllianceManager.nonce,
        },
        body: JSON.stringify({
          ffmpeg_path: ffmpegPath || undefined,
        }),
      });

      const result: FFmpegTestResult = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Error testing FFmpeg:', error);
      setTestResult({
        success: false,
        available: false,
        message: __('Failed to test FFmpeg availability.', 's2j-alliance-manager'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * 設定を保存します。
   */
  const handleSave = () => {
    onSave(ffmpegPath);
  };

  return (
    <div className="s2j-ffmpeg-library-manager">
      <div className='s2j-ffmpeg-library-header'>
        <h3>{__('FFmpeg Library Management', 's2j-alliance-manager')}</h3>
        <div className="s2j-form-actions">
          <button
            type="button"
            className="s2j-btn s2j-btn--secondary"
            onClick={handleSave}
            disabled={isLoading}
          >
            <span className="s2j-button-text">{__('Save Settings', 's2j-alliance-manager')}</span>
          </button>
        </div>
      </div>
      <label htmlFor="s2j-ffmpeg-path" className="s2j-form-label">
          {__('FFmpeg Path', 's2j-alliance-manager')}
        </label>
      <div className="s2j-form-group">
        <div className="s2j-input-group">
          <input
            type="text"
            id="s2j-ffmpeg-path"
            className="s2j-form-input"
            value={ffmpegPath}
            onChange={(e) => handlePathChange(e.target.value)}
            placeholder={__('e.g., /usr/bin/ffmpeg or ffmpeg', 's2j-alliance-manager')}
            disabled={isLoading}
          />
          <button
            type="button"
            className="s2j-btn s2j-btn--primary"
            onClick={handleTestFFmpeg}
            disabled={isLoading || isTesting}
          >
            <span className="s2j-button-text">{isTesting ? __('Testing...', 's2j-alliance-manager') : __('Test FFmpeg', 's2j-alliance-manager')}</span>
          </button>
        </div>
        <p className="s2j-form-description">
          {__('Enter the path to the FFmpeg executable. Leave empty to use the system default.', 's2j-alliance-manager')}
        </p>
      </div>

      {testResult && (
        <div className={`s2j-test-result s2j-test-result--${testResult.available ? 'success' : 'error'}`}>
          <div className="s2j-test-result-icon">
            {testResult.available ? '✓' : '✗'}
          </div>
          <div className="s2j-test-result-message">
            {testResult.message}
          </div>
        </div>
      )}

    </div>
  );
};
