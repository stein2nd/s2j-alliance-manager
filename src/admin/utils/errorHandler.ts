import { __ } from '@wordpress/i18n';

/**
 * エラーメッセージの種類
 */
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  PERMISSION = 'permission',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * エラーメッセージのインターフェイス
 */
export interface ErrorMessage {
  type: ErrorType;
  title: string;
  message: string;
  suggestion?: string;
  action?: string;
}

/**
 * エラーハンドリングのためのユーティリティクラス
 */
export class ErrorHandler {
  /**
   * エラーを解析してユーザーフレンドリーなメッセージを生成
   * @param error エラーオブジェクト
   * @param _context エラーのコンテキスト
   * @returns エラーメッセージ
   */
  static parseError(error: unknown, _context: string): ErrorMessage {
    // ネットワークエラー
    if (error && typeof error === 'object' && 'name' in error && 'message' in error && 
        error.name === 'TypeError' && typeof error.message === 'string' && error.message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        title: __('Connection Error', 's2j-alliance-manager'),
        message: __('Unable to connect to the server. Please check your internet connection and try again.', 's2j-alliance-manager'),
        suggestion: __('Check your internet connection and refresh the page.', 's2j-alliance-manager'),
        action: __('Retry', 's2j-alliance-manager')
      };
    }

    // HTTP ステータスエラー
    if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
      switch (error.status) {
        case 400:
          return {
            type: ErrorType.VALIDATION,
            title: __('Invalid Request', 's2j-alliance-manager'),
            message: __('The data you entered is invalid. Please check your input and try again.', 's2j-alliance-manager'),
            suggestion: __('Please review the form fields and ensure all required information is provided.', 's2j-alliance-manager')
          };
        case 401:
          return {
            type: ErrorType.PERMISSION,
            title: __('Authentication Required', 's2j-alliance-manager'),
            message: __('You need to log in again to continue.', 's2j-alliance-manager'),
            suggestion: __('Please refresh the page and log in again.', 's2j-alliance-manager'),
            action: __('Refresh Page', 's2j-alliance-manager')
          };
        case 403:
          return {
            type: ErrorType.PERMISSION,
            title: __('Access Denied', 's2j-alliance-manager'),
            message: __('You do not have permission to perform this action.', 's2j-alliance-manager'),
            suggestion: __('Contact your administrator if you believe this is an error.', 's2j-alliance-manager')
          };
        case 404:
          return {
            type: ErrorType.SERVER,
            title: __('Not Found', 's2j-alliance-manager'),
            message: __('The requested resource was not found.', 's2j-alliance-manager'),
            suggestion: __('The item may have been deleted. Please refresh the page.', 's2j-alliance-manager'),
            action: __('Refresh Page', 's2j-alliance-manager')
          };
        case 500:
          return {
            type: ErrorType.SERVER,
            title: __('Server Error', 's2j-alliance-manager'),
            message: __('A server error occurred. Please try again later.', 's2j-alliance-manager'),
            suggestion: __('If the problem persists, contact your administrator.', 's2j-alliance-manager'),
            action: __('Retry', 's2j-alliance-manager')
          };
        default:
          return {
            type: ErrorType.SERVER,
            title: __('Server Error', 's2j-alliance-manager'),
            message: __('An unexpected error occurred. Please try again.', 's2j-alliance-manager'),
            suggestion: __('If the problem persists, contact your administrator.', 's2j-alliance-manager'),
            action: __('Retry', 's2j-alliance-manager')
          };
      }
    }

    // バリデーションエラー
    if (error && typeof error === 'object' && 'validation' in error && error.validation) {
      return {
        type: ErrorType.VALIDATION,
        title: __('Validation Error', 's2j-alliance-manager'),
        message: (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : null) || __('Please check your input and try again.', 's2j-alliance-manager'),
        suggestion: __('Review the highlighted fields and correct any errors.', 's2j-alliance-manager')
      };
    }

    // デフォルトエラー
    return {
      type: ErrorType.UNKNOWN,
      title: __('Unexpected Error', 's2j-alliance-manager'),
      message: __('An unexpected error occurred. Please try again.', 's2j-alliance-manager'),
      suggestion: __('If the problem persists, contact your administrator.', 's2j-alliance-manager'),
      action: __('Retry', 's2j-alliance-manager')
    };
  }

  /**
   * エラーメッセージを表示
   * @param errorMessage エラーメッセージ
   * @param context エラーのコンテキスト
   */
  static showError(errorMessage: ErrorMessage, context: string): void {
    const notice = document.createElement('div');
    notice.className = `notice notice-error is-dismissible s2j-error-notice`;
    notice.setAttribute('data-context', context);

    const noticeContent = `
      <div class="s2j-error-content">
        <div class="s2j-error-header">
          <h4 class="s2j-error-title">${errorMessage.title}</h4>
          <button type="button" class="notice-dismiss" aria-label="${__('Dismiss this notice.', 's2j-alliance-manager')}">
            <span class="screen-reader-text">${__('Dismiss this notice.', 's2j-alliance-manager')}</span>
          </button>
        </div>
        <div class="s2j-error-body">
          <p class="s2j-error-message">${errorMessage.message}</p>
          ${errorMessage.suggestion ? `<p class="s2j-error-suggestion">${errorMessage.suggestion}</p>` : ''}
        </div>
        ${errorMessage.action ? `
          <div class="s2j-error-actions">
            <button type="button" class="button s2j-error-action-btn" data-action="${errorMessage.action.toLowerCase().replace(/\s+/g, '-')}">
              ${errorMessage.action}
            </button>
          </div>
        ` : ''}
      </div>`;

    notice.innerHTML = noticeContent;

    const container = document.querySelector('.wrap');

    if (container) {
      container.insertBefore(notice, container.firstChild);

      // 自動で消える（エラーの場合は長めに）
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 10000);

      // アクションボタンのイベントリスナー
      const actionBtn = notice.querySelector('.s2j-error-action-btn');

      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          const action = actionBtn.getAttribute('data-action');
          if (action === 'retry') {
            // リトライ処理
            window.location.reload();
          } else if (action === 'refresh-page') {
            // ページリフレッシュ
            window.location.reload();
          }
        });
      }
    }
  }

  /**
   * 成功メッセージを表示
   * @param message メッセージ
   * @param context コンテキスト
   */
  static showSuccess(message: string, context: string): void {
    const notice = document.createElement('div');
    notice.className = `notice notice-success is-dismissible s2j-success-notice`;
    notice.setAttribute('data-context', context);
    notice.innerHTML = `
      <div class="s2j-success-content">
        <p>${message}</p>
        <button type="button" class="notice-dismiss" aria-label="${__('Dismiss this notice.', 's2j-alliance-manager')}">
          <span class="screen-reader-text">${__('Dismiss this notice.', 's2j-alliance-manager')}</span>
        </button>
      </div>`;

    const container = document.querySelector('.wrap');
    if (container) {
      container.insertBefore(notice, container.firstChild);

      // 5秒後に自動で消える
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 5000);
    }
  }
}
