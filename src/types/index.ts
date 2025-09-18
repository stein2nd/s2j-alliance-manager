// 型定義

/**
 * 「設定」インターフェイス
 */
export interface AllianceSettings {
  display_style: 'grid-single' | 'grid-multi';
  alignment?: 'left' | 'center' | 'right';
  ffmpeg_path?: string;
  content_models: ContentModel[];
}

/**
 * 「コンテンツモデル」インターフェイス
 */
export interface ContentModel {
  frontpage: 'YES' | 'NO';
  rank: string;
  logo: number; // WordPress attachment ID
  jump_url: string;
  behavior: 'jump' | 'modal';
  message: string;
}

/**
 * 「アライアンス・パートナー」インターフェイス
 */
export interface AlliancePartner {
  id: string;
  frontpage: boolean;
  rank: string;
  logo: {
    id: number;
    url: string;
    alt: string;
  };
  jump_url: string;
  behavior: 'jump' | 'modal';
  message: string;
}

/**
 * 「API レスポンス」インターフェイス
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * 「WordPress メディア」インターフェイス
 */
export interface WordPressMedia {
  id: number;
  url: string;
  alt: string;
  title: string;
  caption: string;
  description: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
}

/**
 * オプション「表示スタイル」インターフェイス
 */
export interface DisplayStyle {
  value: 'grid-single' | 'grid-multi';
  label: string;
  description: string;
}

/**
 * オプション「ランク」インターフェイス
 */
export interface RankOption {
  value: string;
  label: string;
}

/**
 * オプション「挙動」インターフェイス
 */
export interface BehaviorOption {
  value: 'jump' | 'modal';
  label: string;
  description: string;
}

/**
 * オプション「配置」インターフェイス
 */
export interface AlignmentOption {
  value: 'left' | 'center' | 'right';
  label: string;
}

/**
 * 「ランクラベル」インターフェイス
 */
export interface RankLabel {
  id: number;
  title: string;
  content: string;
  thumbnail_id: number;
  menu_order: number;
  slug: string;
}

/**
 * 「FFmpeg 設定」インターフェイス
 */
export interface FFmpegSettings {
  ffmpeg_path: string;
  ffmpeg_available: boolean;
}

/**
 * 「FFmpeg テスト結果」インターフェイス
 */
export interface FFmpegTestResult {
  success: boolean;
  available: boolean;
  message: string;
}

/**
 * WordPress ウィンドウ
 */
declare global {
  interface Window {
    s2jAllianceManager: {
      apiUrl: string;
      nonce: string;
      strings: {
        save: string;
        cancel: string;
        delete: string;
        edit: string;
        addNew: string;
        confirmDelete: string;
      };
    };
    wp: {
      media: {
        (options?: Record<string, unknown>): Record<string, unknown>;
        editor: {
          get(): Record<string, unknown>;
        };
      };
      apiFetch: unknown;
      element: unknown;
      components: unknown;
      i18n: unknown;
    };
    tinymce: {
      activeEditor: {
        insertContent(content: string): void;
      };
    };
  }
}
