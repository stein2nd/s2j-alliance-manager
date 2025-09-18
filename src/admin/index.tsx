import { render } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SettingsForm } from './components/SettingsForm';
import { ContentList } from './components/ContentList';
import { RankLabelManager } from './components/RankLabelManager';
import { FFmpegLibraryManager } from './components/FFmpegLibraryManager';
import { AllianceSettings, ContentModel, RankLabel, FFmpegSettings } from '../types';
import '@/styles/admin.scss';

/**
 * 管理用スクリプト
 */
class AllianceManagerAdmin {

  private settings: AllianceSettings = {
    display_style: 'grid-single',
    content_models: []
  };
  private rankLabels: RankLabel[] = [];
  private ffmpegSettings: FFmpegSettings = {
    ffmpeg_path: '',
    ffmpeg_available: false
  };
  private isInitialized = false;
  private isLoading = false;

  /**
   * コンストラクター
   */
  constructor() {
    // 初期化します。
    this.init();
  }

  /**
   * 初期化します。
   * コンストラクターから呼ばれます。
   */
  private async init() {
    // 設定を読み込みます。
    await this.loadData();

    // ランクラベルを読み込みます。
    await this.loadRankLabels();

    // FFmpeg 設定を読み込みます。
    await this.loadFFmpegSettings();

    // 初期化状態を設定します。
    this.isInitialized = true;

    // 管理用 UI をレンダリングします。
    this.renderAdmin();

    // イベントをバインドします。
    this.bindEvents();
  }

  /**
   * 設定を読み込みます。
   * 「init()」メソッドから呼ばれます。
   */
  private async loadData() {
    try {
      // 設定を取得します。
      const response = await fetch(
        `${window.s2jAllianceManager.apiUrl}settings`,
        {
          headers: {'X-WP-Nonce': window.s2jAllianceManager.nonce}
        }
      );

      if (response.ok) {
        const data = await response.json();
        this.settings = data;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * ランクラベルを読み込みます。
   * 「init()」メソッドから呼ばれます。
   */
  private async loadRankLabels() {
    try {
      // ランクラベルを取得します。
      const response = await fetch(
        `${window.s2jAllianceManager.apiUrl}rank-labels`,
        {
          headers: {'X-WP-Nonce': window.s2jAllianceManager.nonce}
        }
      );

      if (response.ok) {
        const data = await response.json();
        this.rankLabels = data;
      } else {
        console.error('Failed to load rank labels:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading rank labels:', error);
    }
  }

  /**
   * FFmpeg 設定を読み込みます。
   * 「init()」メソッドから呼ばれます。
   */
  private async loadFFmpegSettings() {
    try {
      // FFmpeg 設定を取得します。
      const response = await fetch(
        `${window.s2jAllianceManager.apiUrl}ffmpeg/settings`,
        {
          headers: {'X-WP-Nonce': window.s2jAllianceManager.nonce}
        }
      );

      if (response.ok) {
        const data = await response.json();
        this.ffmpegSettings = data;
      } else {
        console.error('Failed to load FFmpeg settings:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading FFmpeg settings:', error);
    }
  }

  /**
   * 管理用 UI をレンダリングします。
   * 「init()」メソッドから呼ばれます。
   * プロパティ「updateRankLabels」「updateContentModels」から呼ばれます。
   */
  private renderAdmin() {
    // 表示設定のコンテナを取得します。
    const displaySettingsContainer = document.getElementById('s2j-display-settings');

    if (displaySettingsContainer) {
      try {
        // 「SettingsForm」に、「表示設定のコンテナ」をレンダリングします。
        render(
          <SettingsForm
            settings={this.settings}
            onSave={this.updateSettings}
            isLoading={this.isLoading}
          />,
          displaySettingsContainer
        );
      } catch (error) {
        console.error('Error rendering SettingsForm:', error);
      }
    }

    // 「ランクラベル・マネージャーのコンテナ」を取得します。
    const rankLabelContainer = document.getElementById('s2j-rank-labels');

    if (rankLabelContainer && this.isInitialized) {
      try {
        // 「RankLabelManager」に、「ランクラベル・マネージャーのコンテナ」をレンダリングします。
        render(
          <RankLabelManager 
            rankLabels={this.rankLabels}
            onUpdate={this.updateRankLabels}
            isLoading={this.isLoading} 
          />,
          rankLabelContainer
        );
      } catch (error) {
        console.error('Error rendering RankLabelManager:', error);
      }
    } else {
      console.log('RankLabelManager not rendered - container:', !!rankLabelContainer, 'initialized:', this.isInitialized);
    }

    // 「コンテンツモデルのコンテナ」を取得します。
    const contentModelsContainer = document.getElementById('s2j-content-models');
    
    if (contentModelsContainer && this.isInitialized) {
      try {
        // 「ContentList」に、「コンテンツモデルのコンテナ」をレンダリングします。
        render(
          <ContentList
            contentModels={this.settings.content_models}
            onUpdate={this.updateContentModels}
            rankLabels={this.rankLabels}
            ffmpegSettings={this.ffmpegSettings}
            isLoading={this.isLoading}
          />,
          contentModelsContainer
        );
      } catch (error) {
        console.error('Error rendering ContentList:', error);
      }
    } else {
      console.log('ContentList not rendered - container:', !!contentModelsContainer, 'initialized:', this.isInitialized);
    }

    // FFmpeg Library Manager のコンテナを取得します。
    const ffmpegManagerContainer = document.getElementById('s2j-ffmpeg-library-manager');
    
    if (ffmpegManagerContainer && this.isInitialized) {
      try {
        // FFmpegLibraryManager に、FFmpeg Library Manager のコンテナをレンダリングします。
        render(
          <FFmpegLibraryManager
            settings={this.ffmpegSettings}
            onSave={this.updateFFmpegSettings}
            isLoading={this.isLoading}
          />,
          ffmpegManagerContainer
        );
      } catch (error) {
        console.error('Error rendering FFmpegLibraryManager:', error);
      }
    } else {
      console.log('FFmpegLibraryManager not rendered - container:', !!ffmpegManagerContainer, 'initialized:', this.isInitialized);
    }
  }

  /**
   * SettingsForm が update した際に、設定を更新します。
   * 「renderAdmin()」メソッドから呼ばれます。
   * 
   * @param settings 
   */
  private updateSettings = (settings: AllianceSettings) => {
    this.settings = { ...this.settings, ...settings };

    // 設定を保存します。
    this.saveData();
  };

  /**
   * 設定を保存します。
   * プロパティ「updateSettings」から呼ばれます。
   */
  private async saveData() {
    this.isLoading = true;

    // ローディング状態を更新します。
    this.updateLoadingState();

    try {
      // 設定とコンテンツモデルを保存します。
      const response = await fetch(
        `${window.s2jAllianceManager.apiUrl}save-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.s2jAllianceManager.nonce
          },
          body: JSON.stringify({
            settings: {
              display_style: this.settings.display_style,
              ffmpeg_path: this.settings.ffmpeg_path || ''
            },
            content_models: this.settings.content_models
          })
        }
      );

      if (response.ok) {
        // 結果を取得します。
        const result = await response.json();

        if (result.success) {
          // 通知を表示します。
          this.showNotice('success', result.message || __('Settings saved successfully.', 's2j-alliance-manager'));
        } else {
          // 通知を表示します。
          this.showNotice('error', result.message || __('Failed to save settings.', 's2j-alliance-manager'));
        }
      } else {
        // 通知を表示します。
        this.showNotice('error', __('Failed to save settings.', 's2j-alliance-manager'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);

      // 通知を表示します。
      this.showNotice('error', __('Failed to save settings.', 's2j-alliance-manager'));
    } finally {
      this.isLoading = false;

      // ローディング状態を更新します。
      this.updateLoadingState();
    }
  }

  /**
   * ローディング状態を更新します。
   * 「saveData()」メソッドから呼ばれます。
   */
  private updateLoadingState() {
    // 「ローディング状態を更新する要素」を取得します。
    const elements = document.querySelectorAll('.s2j-admin-loading');

    elements.forEach(el => {
      if (this.isLoading) {
        el.classList.add('loading');
      } else {
        el.classList.remove('loading');
      }
    });
  }

  /**
   * 通知を表示します。
   * 「saveData()」メソッドから呼ばれます。
   * 
   * @param type 
   * @param message 
   */
  private showNotice(type: 'success' | 'error', message: string) {
    // 「通知」を作成します。
    const notice = document.createElement('div');

    // 「通知」に、クラスを設定します。
    notice.className = `notice notice-${type} is-dismissible`;

    // 「通知」に、メッセージを設定します。
    notice.innerHTML = `<p>${message}</p>`;

    // 「通知」を配置するコンテナを取得します。
    const container = document.querySelector('.wrap');
    if (container) {
      // 「通知」を配置します。
      container.insertBefore(notice, container.firstChild);

      // 5秒後に自動で消えます。
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 5000);
    }
  }

  /**
   * RankLabelManager が update した際に、ランクラベルを更新します。
   * 「renderAdmin()」メソッドから呼ばれます。
   * 
   * @param rankLabels 
   */
  private updateRankLabels = async (rankLabels: RankLabel[]) => {
    this.rankLabels = rankLabels;

    // 管理用 UI をレンダリングします。
    this.renderAdmin();
  };

  /**
   * ContentList が update した際に、コンテンツモデルを更新します。
   * 「renderAdmin()」メソッドから呼ばれます。
   * 
   * @param contentModels 
   */
  private updateContentModels = async (contentModels: ContentModel[]) => {
    this.settings.content_models = contentModels;

    await this.saveData();

    // 管理用 UI をレンダリングします。
    this.renderAdmin();
  };

  /**
   * FFmpegLibraryManager が update した際に、FFmpeg 設定を更新します。
   * 「renderAdmin()」メソッドから呼ばれます。
   * 
   * @param ffmpegPath 
   */
  private updateFFmpegSettings = async (ffmpegPath: string) => {
    this.settings.ffmpeg_path = ffmpegPath;
    this.ffmpegSettings.ffmpeg_path = ffmpegPath;

    await this.saveData();

    // FFmpeg 設定を再読み込みします。
    await this.loadFFmpegSettings();

    // 管理用 UI をレンダリングします。
    this.renderAdmin();
  };

  /**
   * イベントをバインドします。
   * 「init()」メソッドから呼ばれます。
   */
  private bindEvents() {
    // イベントは現在、React コンポーネントによって処理されます。
    // 追加のイベントバインディングは不要です。
  }

}

// DOM が準備完了時に、「AllianceManagerAdmin」を初期化します。
jQuery(document).ready(() => {
  // 「AllianceManagerAdmin」を初期化します。
  new AllianceManagerAdmin();
});
