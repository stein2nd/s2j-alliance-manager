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
    console.log('AllianceManagerAdmin init started');
    await this.loadData();
    console.log('Data loaded, settings:', this.settings);
    this.isInitialized = true;
    console.log('isInitialized set to true');
    this.renderAdmin();
    this.bindEvents();
    console.log('AllianceManagerAdmin init completed');
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

  private updateContentModels = async (contentModels: ContentModel[]) => {
    console.log('updateContentModels called with:', contentModels.length, 'models');
    this.settings.content_models = contentModels;
    console.log('Settings updated, triggering saveData');
    await this.saveData();
    console.log('saveData completed, re-rendering admin');
    this.renderAdmin();
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
    console.log('renderAdmin called, isInitialized:', this.isInitialized);
    
    // Render display settings
    const displaySettingsContainer = document.getElementById('s2j-display-settings');
    console.log('displaySettingsContainer:', displaySettingsContainer);
    if (displaySettingsContainer) {
      try {
        console.log('About to render SettingsForm');
        render(
          <SettingsForm
            settings={this.settings}
            onSave={this.updateSettings}
            isLoading={this.isLoading}
          />,
          displaySettingsContainer
        );
        console.log('SettingsForm rendered successfully');
      } catch (error) {
        console.error('Error rendering SettingsForm:', error);
      }
    }

    // Render content models
    console.log('About to get contentModelsContainer');
    const contentModelsContainer = document.getElementById('s2j-content-models');
    console.log('contentModelsContainer:', contentModelsContainer);
    console.log('this.isInitialized:', this.isInitialized);
    console.log('this.settings.content_models:', this.settings.content_models);
    
    if (contentModelsContainer && this.isInitialized) {
      console.log('Rendering ContentList component');
      try {
        render(
          <ContentList
            contentModels={this.settings.content_models}
            onUpdate={this.updateContentModels}
            isLoading={this.isLoading}
          />,
          contentModelsContainer
        );
        console.log('ContentList rendered successfully');
      } catch (error) {
        console.error('Error rendering ContentList:', error);
      }
    } else {
      console.log('ContentList not rendered - container:', !!contentModelsContainer, 'initialized:', this.isInitialized);
    }
  }

  private bindEvents() {
    // Events are now handled by React components
    // No additional event binding needed
  }
}

// Initialize admin when DOM is ready
jQuery(document).ready(() => {
  console.log('jQuery document ready, initializing AllianceManagerAdmin');
  new AllianceManagerAdmin();
});
