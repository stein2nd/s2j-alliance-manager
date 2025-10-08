import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { AllianceSettings } from '../../types';

/**
 * React.FunctionComponent「設定フォーム」インターフェイス
 * @param param0 React.FunctionComponent「設定フォーム」インターフェイス
 * @returns React.FunctionComponent「設定フォーム」インターフェイス
 */
interface SettingsFormProps {
  settings: AllianceSettings;
  onSave: (settings: AllianceSettings) => void;
  isLoading?: boolean;
}

/**
 * React.FunctionComponent「設定フォーム」
 * `src/admin/index.tsx` で呼ばれます。
 * @param param0 React.FunctionComponent「設定フォーム」
 * @returns React.FunctionComponent「設定フォーム」
 */
export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSave: _onSave,
  isLoading: _isLoading = false
}) => {
  const [, _setFormData] = useState<AllianceSettings>(settings);

  /**
   * settings が変更された際に、formData を更新します。
   * 「useEffect()」メソッドから呼ばれます。
   */
  useEffect(() => {
    _setFormData(settings);
  }, [settings]);

  return (
    <div className="s2j-settings-form">
      <p>{__('Settings form loaded successfully', 's2j-alliance-manager')}</p>
    </div>
  );
};
