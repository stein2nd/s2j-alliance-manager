import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { AllianceSettings } from '../../types';

interface SettingsFormProps {
  settings: AllianceSettings;
  onSave: (settings: AllianceSettings) => void;
  isLoading?: boolean;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AllianceSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleDisplayStyleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      display_style: value as AllianceSettings['display_style']
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="s2j-settings-form">
      <p>Settings form loaded successfully</p>
    </div>
  );
};
