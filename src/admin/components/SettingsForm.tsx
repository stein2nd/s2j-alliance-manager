import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { SelectControl, Button, Spinner } from '@wordpress/components';
import { displayStyles } from '../data/constants';
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
      <div className="form-field">
        <SelectControl
          label={__('Display Style', 's2j-alliance-manager')}
          value={formData.display_style}
          options={displayStyles.map(style => ({
            label: style.label,
            value: style.value
          }))}
          onChange={handleDisplayStyleChange}
          help={__('Choose how alliance banners are displayed on the frontend.', 's2j-alliance-manager')}
        />
      </div>
      
      <div className="form-actions">
        <Button
          isPrimary
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner />
              {__('Saving...', 's2j-alliance-manager')}
            </>
          ) : (
            __('Save Settings', 's2j-alliance-manager')
          )}
        </Button>
      </div>
    </div>
  );
};
