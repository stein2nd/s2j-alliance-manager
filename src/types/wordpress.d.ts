declare module '@wordpress/blocks' {
  export function registerBlockType(name: string, settings: Record<string, unknown>): void;
}

declare module '@wordpress/i18n' {
  export function __(text: string, domain: string): string;
  export function _e(text: string, domain: string): void;
}

declare module '@wordpress/block-editor' {
  export function useBlockProps(props?: Record<string, unknown>): Record<string, unknown>;
  export const InspectorControls: React.ComponentType<Record<string, unknown>>;
}

declare module '@wordpress/components' {
  export const PanelBody: React.ComponentType<Record<string, unknown>>;
  export const SelectControl: React.ComponentType<Record<string, unknown>>;
  export const Placeholder: React.ComponentType<Record<string, unknown>>;
  export const Button: React.ComponentType<Record<string, unknown>>;
  export const CheckboxControl: React.ComponentType<Record<string, unknown>>;
  export const TextControl: React.ComponentType<Record<string, unknown>>;
  export const TextareaControl: React.ComponentType<Record<string, unknown>>;
  export const Spinner: React.ComponentType<Record<string, unknown>>;
}

declare module '@wordpress/element' {
  export const render: (element: React.ReactElement, container: Element | null) => void;
}

declare module '@wordpress/data' {
  export const useSelect: (selector: (select: unknown) => unknown) => unknown;
  export const useDispatch: (store: string) => Record<string, unknown>;
}

declare module '@wordpress/api-fetch' {
  export default function apiFetch(options: Record<string, unknown>): Promise<unknown>;
}

declare global {
  interface Window {
    tinymce: {
      activeEditor: {
        insertContent(content: string): void;
      };
    };
    wp: {
      media: {
        (options: Record<string, unknown>): WordPressMediaFrame;
        editor: {
          get(): Record<string, unknown>;
        };
      };
      ajax: {
        post(action: string, data: Record<string, unknown>): Promise<unknown>;
      };
      apiFetch: unknown;
      element: unknown;
      components: unknown;
      i18n: unknown;
    };
  }
}

export interface WordPressMediaFrame {
  on(event: string, callback: () => void): void;
  open(): void;
  state(): {
    get(selection: string): {
      first(): {
        toJSON(): {
          id: number;
        };
      };
    };
  };
}
