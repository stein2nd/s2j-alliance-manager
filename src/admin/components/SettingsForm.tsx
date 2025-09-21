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
  onSave: _onSave,
  isLoading: _isLoading = false
}) => {
  const [, _setFormData] = useState<AllianceSettings>(settings);

  useEffect(() => {
    _setFormData(settings);
  }, [settings]);

  return (
    <div className="s2j-settings-form">
      <p>{__('Settings form loaded successfully', 's2j-alliance-manager')}</p>
    </div>
  );
};
