// DOM 型定義ファイル
// WordPress 環境での型定義制約を回避するための独自型定義

declare global {
  // 基本的な DOM 型定義
  interface NodeListOf<T> {
    readonly length: number;
    item(index: number): T | null;
    [index: number]: T;
  }

  interface EventTarget {
    addEventListener(type: string, listener: Function, options?: boolean | object): void;
    removeEventListener(type: string, listener: Function, options?: boolean | object): void;
    dispatchEvent(event: Event): boolean;
  }

  // HTMLDivElement の型定義
  interface HTMLDivElement extends HTMLElement {
    querySelectorAll(selectors: string): NodeListOf<Element>;
    focus(): void;
  }

  // HTMLUListElement の型定義
  interface HTMLUListElement extends HTMLElement {
    querySelector(selectors: string): Element | null;
    querySelectorAll(selectors: string): NodeListOf<Element>;
    scrollWidth: number;
    style: CSSStyleDeclaration;
  }

  // HTMLTextAreaElement の型定義
  interface HTMLTextAreaElement extends HTMLElement {
    value: string;
    focus(): void;
    blur(): void;
  }

  // CSSStyleDeclaration の型定義
  interface CSSStyleDeclaration {
    gap: string;
    transform: string;
    transition: string;
  }

  // Window の型定義 (getComputedStyle 用)
  interface Window {
    getComputedStyle(element: Element, pseudoElement?: string | null): CSSStyleDeclaration;
  }

  // KeyboardEvent の型定義
  interface KeyboardEvent extends Event {
    readonly key: string;
    readonly shiftKey: boolean;
    readonly ctrlKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    preventDefault(): void;
    stopPropagation(): void;
  }

  // MouseEvent の型定義
  interface MouseEvent extends Event {
    readonly target: EventTarget | null;
    readonly currentTarget: EventTarget | null;
    readonly clientX: number;
    readonly clientY: number;
    preventDefault(): void;
    stopPropagation(): void;
  }
}

export {};
