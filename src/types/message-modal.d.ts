// MessageModal 専用の型定義
// WordPress 環境での型定義制約を回避するための独自型定義

// 基本的な DOM 型定義
export interface S2JNodeListOf<T> {
  readonly length: number;
  item(index: number): T | null;
  [index: number]: T;
}

export interface S2JEventTarget {
  addEventListener(type: string, listener: Function, options?: boolean | object): void;
  removeEventListener(type: string, listener: Function, options?: boolean | object): void;
  dispatchEvent(event: Event): boolean;
}

export interface S2JHTMLDivElement extends HTMLElement {
  querySelectorAll(selectors: string): S2JNodeListOf<Element>;
  focus(): void;
}

export interface S2JHTMLTextAreaElement extends HTMLElement {
  value: string;
  focus(): void;
  blur(): void;
}

export interface S2JKeyboardEvent extends Event {
  readonly key: string;
  readonly shiftKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;
  preventDefault(): void;
  stopPropagation(): void;
}

export interface S2JMouseEvent extends Event {
  readonly target: S2JEventTarget | null;
  readonly currentTarget: S2JEventTarget | null;
  readonly clientX: number;
  readonly clientY: number;
  preventDefault(): void;
  stopPropagation(): void;
}
