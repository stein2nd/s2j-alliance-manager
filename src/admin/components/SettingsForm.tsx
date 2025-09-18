import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { AllianceSettings } from '../../types';

/**
 * React.FunctionComponent「設定フォーム」インターフェイス
 */
interface SettingsFormProps {
  settings: AllianceSettings;
  onSave: (settings: AllianceSettings) => void;
  isLoading?: boolean;
}

/**
 * React.FunctionComponent「設定フォーム」
 * `src/admin/index.tsx` で呼ばれる。
 * 
 * @param param0 設定
 * @returns 設定フォーム
 */
export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AllianceSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  /**
   * 表示形式を変更します。
   * 「s2j-display-style-select.onChange()」メソッドから呼ばれます。
   * 
   * @param value 値
   */
  const handleDisplayStyleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      display_style: value as AllianceSettings['display_style']
    }));
  };

  /**
   * 設定を保存します。
   * 「s2j-save-settings-btn.onClick()」メソッドから呼ばれます。
   */
  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="s2j-settings-form">
      <p>{__('Settings form loaded successfully', 's2j-alliance-manager')}</p>
    </div>
  );
};
