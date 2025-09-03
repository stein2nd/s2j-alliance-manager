import { __ } from '@wordpress/i18n';
import '@/styles/classic.scss';

interface WordPressEditor {
  insertContent: (content: string) => void;
}

class AllianceManagerClassic {
  constructor() {
    this.init();
  }

  private init() {
    this.bindEvents();
  }

  private bindEvents() {
    // Insert alliance banner button
    const insertButton = document.getElementById('s2j-insert-alliance-banner');
    if (insertButton) {
      insertButton.addEventListener('click', () => {
        this.insertAllianceBanner();
      });
    }
  }

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

    // Show success message
    this.showNotice('success', __('Alliance banner inserted successfully.', 's2j-alliance-manager'));
  }

  private showNotice(type: 'success' | 'error', message: string) {
    const notice = document.createElement('div');
    notice.className = `notice notice-${type} is-dismissible`;
    notice.innerHTML = `<p>${message}</p>`;
    
    const container = document.querySelector('.wrap');
    if (container) {
      container.insertBefore(notice, container.firstChild);
      
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 3000);
    }
  }
}

// Initialize classic editor support when DOM is ready
jQuery(document).ready(() => {
  new AllianceManagerClassic();
});
