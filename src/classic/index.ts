import { __ } from '@wordpress/i18n';
import '@/styles/classic.scss';

/**
 * 「WordPress エディター」
 */
interface WordPressEditor {
  insertContent: (content: string) => void;
}

/**
 * AllianceManagerClassic
 * `src/classic/index.ts` で呼ばれる。
 */
class AllianceManagerClassic {

  /**
   * コンストラクター
   */
  constructor() {
    // 初期化します。
    this.init();
  }

  /**
   * 初期化します。
   * 
   * コンストラクターから呼ばれます。
   */
  private init() {
    // イベントをバインドします。
    this.bindEvents();
  }

  /**
   * イベントをバインドします。
   * 「init()」メソッドから呼ばれます。
   */
  private bindEvents() {
    // アライアンス・バナーを挿入するボタン
    const insertButton = document.getElementById('s2j-insert-alliance-banner');

    if (insertButton) {
      insertButton.addEventListener('click', () => {
        // アライアンス・バナーを挿入します。
        this.insertAllianceBanner();
      });
    }
  }

  /**
   * アライアンス・バナーを挿入します。
   * 「bindEvents()」メソッドから呼ばれます。
   */
  private insertAllianceBanner() {
    const displayStyle = (document.getElementById('s2j_alliance_display_style') as HTMLSelectElement)?.value || 'grid-single';

    // Create shortcode
    const shortcode = `[s2j_alliance_banner display_style="${displayStyle}"]`;

    // Insert into editor
    if (window.tinymce && window.tinymce.activeEditor) {
      // TinyMCE editor
      window.tinymce.activeEditor.insertContent(shortcode);
    } else if (window.wp && window.wp.media && window.wp.media.editor) {
      // WordPress editor
      const editor = window.wp.media.editor.get() as unknown as WordPressEditor;
      if (editor) {
        editor.insertContent(shortcode);
      }
    } else {
      // Fallback - try to insert into textarea
      const textarea = document.querySelector('textarea#content') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        textarea.value = before + shortcode + after;
        textarea.selectionStart = textarea.selectionEnd = start + shortcode.length;
        textarea.focus();

        // Trigger change event
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // 通知を表示します。
    this.showNotice('success', __('Alliance banner inserted successfully.', 's2j-alliance-manager'));
  }

  /**
   * 通知を表示します。
   * 「insertAllianceBanner()」メソッドから呼ばれます。
   * 
   * @param type タイプ
   * @param message メッセージ
   */
  private showNotice(type: 'success' | 'error', message: string) {
    const notice = document.createElement('div');
    notice.className = `notice notice-${type} is-dismissible`;
    notice.innerHTML = `<p>${message}</p>`;

    const container = document.querySelector('.wrap');

    if (container) {
      // 通知を配置します。
      container.insertBefore(notice, container.firstChild);

      // 3秒後に自動で消えます。
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 3000);
    }
  }
}

// DOM が準備完了時に、「アライアンス・マネージャー」を初期化します。
jQuery(document).ready(() => {
  // 「アライアンス・マネージャー」を初期化します。
  new AllianceManagerClassic();
});
