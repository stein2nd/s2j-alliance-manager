import { render } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SettingsForm } from './components/SettingsForm';
import { ContentList } from './components/ContentList';
import { AllianceSettings, ContentModel } from '../types';
import '@/styles/admin.scss';

class AllianceManagerAdmin {
  private settings: AllianceSettings = {
    display_style: 'grid-single',
    content_models: []
  };
  private isInitialized = false;
  private isLoading = false;

  constructor() {
    this.init();
  }

  private async init() {
    await this.loadData();
    this.isInitialized = true;
    this.renderAdmin();
    this.bindEvents();
  }

  private async loadData() {
    try {
      const response = await fetch(`${window.s2jAllianceManager.apiUrl}settings`, {
        headers: {
          'X-WP-Nonce': window.s2jAllianceManager.nonce
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.settings = data;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  private async saveData() {
    this.isLoading = true;
    this.updateLoadingState();

    try {
      const response = await fetch(`${window.s2jAllianceManager.apiUrl}save-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.s2jAllianceManager.nonce
        },
        body: JSON.stringify({
          settings: {
            display_style: this.settings.display_style
          },
          content_models: this.settings.content_models
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          this.showNotice('success', result.message || __('Settings saved successfully.', 's2j-alliance-manager'));
        } else {
          this.showNotice('error', result.message || __('Failed to save settings.', 's2j-alliance-manager'));
        }
      } else {
        this.showNotice('error', __('Failed to save settings.', 's2j-alliance-manager'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showNotice('error', __('Failed to save settings.', 's2j-alliance-manager'));
    } finally {
      this.isLoading = false;
      this.updateLoadingState();
    }
  }

  private updateSettings = (settings: AllianceSettings) => {
    this.settings = { ...this.settings, ...settings };
    this.saveData();
  };

  private updateContentModels = (contentModels: ContentModel[]) => {
    this.settings.content_models = contentModels;
    this.saveData();
  };

  private updateLoadingState() {
    const elements = document.querySelectorAll('.s2j-admin-loading');
    elements.forEach(el => {
      if (this.isLoading) {
        el.classList.add('loading');
      } else {
        el.classList.remove('loading');
      }
    });
  }

  private showNotice(type: 'success' | 'error', message: string) {
    const notice = document.createElement('div');
    notice.className = `notice notice-${type} is-dismissible`;
    notice.innerHTML = `<p>${message}</p>`;
    
    const container = document.querySelector('.wrap');
    if (container) {
      container.insertBefore(notice, container.firstChild);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 5000);
    }
  }

  private renderAdmin() {
    // Render display settings
    const displaySettingsContainer = document.getElementById('s2j-display-settings');
    if (displaySettingsContainer) {
      render(
        <SettingsForm
          settings={this.settings}
          onSave={this.updateSettings}
          isLoading={this.isLoading}
        />,
        displaySettingsContainer
      );
    }

    // Render content models
    const contentModelsContainer = document.getElementById('s2j-content-models');
    if (contentModelsContainer && this.isInitialized) {
      render(
        <ContentList
          contentModels={this.settings.content_models}
          onUpdate={this.updateContentModels}
          isLoading={this.isLoading}
        />,
        contentModelsContainer
      );
    }
  }

  private bindEvents() {
    // Events are now handled by React components
    // No additional event binding needed
  }
}

// Initialize admin when DOM is ready
jQuery(document).ready(() => {
  new AllianceManagerAdmin();
});
