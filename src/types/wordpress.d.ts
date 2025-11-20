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
  export const createElement: typeof React.createElement;
  export const Fragment: typeof React.Fragment;
  export const Component: typeof React.Component;
}

// WordPress の React 型定義を拡張
import * as ReactTypes from 'react';

declare global {
  var React: typeof ReactTypes;

  namespace React {
    type ReactElement = ReactTypes.ReactElement;
    type ReactNode = ReactTypes.ReactNode;
    // WordPress の React 18 に合わせて FC の型を調整
    type FC<P = {}> = (props: P) => ReactTypes.ReactElement | null;
    type FunctionComponent<P = {}> = FC<P>;
    const createElement: typeof ReactTypes.createElement;
    const Fragment: typeof ReactTypes.Fragment;
    const Component: typeof ReactTypes.Component;
  }
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

// DOM 型定義の追加
declare global {
  interface HTMLDivElement extends HTMLElement {}
  interface HTMLTextAreaElement extends HTMLElement {
    value: string;
    focus(): void;
  }
  interface KeyboardEvent extends Event {
    key: string;
    shiftKey: boolean;
    preventDefault(): void;
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
