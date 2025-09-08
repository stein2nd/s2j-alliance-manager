// S2J Alliance Manager - Type Definitions

export interface AllianceSettings {
  display_style: 'grid-single' | 'grid-multi' | 'masonry';
  content_models: ContentModel[];
}

export interface ContentModel {
  frontpage: 'YES' | 'NO';
  rank: string;
  logo: number; // WordPress attachment ID
  jump_url: string;
  behavior: 'jump' | 'modal';
  message: string;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

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

export interface DisplayStyle {
  value: 'grid-single' | 'grid-multi' | 'masonry';
  label: string;
  description: string;
}

export interface RankOption {
  value: string;
  label: string;
}

export interface BehaviorOption {
  value: 'jump' | 'modal';
  label: string;
  description: string;
}

export interface RankLabel {
  id: number;
  title: string;
  content: string;
  thumbnail_id: number;
  menu_order: number;
  slug: string;
}

// WordPress specific types
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
