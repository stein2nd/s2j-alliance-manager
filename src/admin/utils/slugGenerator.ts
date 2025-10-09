import { __ } from '@wordpress/i18n';
import { RankLabel } from '../../types';

/**
 * スラッグ生成のためのユーティリティ関数
 */
export class SlugGenerator {
  /**
   * タイトルからスラッグを生成します
   * @param title タイトル
   * @param existingLabels 既存のラベル一覧
   * @param excludeIndex 除外するインデックス（編集時）
   * @returns 生成されたスラッグ
   */
  static generateSlug(
    title: string, 
    existingLabels: RankLabel[], 
    excludeIndex?: number
  ): string {
    if (!title.trim()) {
      return '';
    }

    // 基本的なスラッグ生成
    const baseSlug = this.sanitizeTitle(title);

    // 重複チェック
    let finalSlug = baseSlug;
    let counter = 1;

    while (this.isSlugDuplicate(finalSlug, existingLabels, excludeIndex)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }

  /**
   * タイトルをサニタイズしてスラッグ用の文字列に変換
   * @param title タイトル
   * @returns サニタイズされた文字列
   */
  private static sanitizeTitle(title: string): string {
    return title
      .toLowerCase()
      .trim()
      // スラッグとして許容される文字のみを残す
      .replace(/[^a-z0-9\s-]/g, '-')
      // 連続するハイフンを単一に
      .replace(/-+/g, '-')
      // 先頭・末尾のハイフンを削除
      .replace(/^-+|-+$/g, '')
      // スペースをハイフンに変換
      .replace(/\s+/g, '-');
  }

  /**
   * スラッグの重複をチェック
   * @param slug チェックするスラッグ
   * @param existingLabels 既存のラベル一覧
   * @param excludeIndex 除外するインデックス
   * @returns 重複しているかどうか
   */
  static isSlugDuplicate(
    slug: string, 
    existingLabels: RankLabel[], 
    excludeIndex?: number
  ): boolean {
    return existingLabels.some((label, index) => 
      index !== excludeIndex && label.slug === slug
    );
  }

  /**
   * スラッグの妥当性をチェック
   * @param slug チェックするスラッグ
   * @returns 妥当性チェック結果
   */
  static validateSlug(slug: string): { isValid: boolean; message?: string } {
    if (!slug.trim()) {
      return { isValid: false, message: __('Slug is required.', 's2j-alliance-manager') };
    }

    // スラッグとして許容される文字のみかチェック
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { 
        isValid: false, 
        message: __('Slug can only contain lowercase letters, numbers, and hyphens.', 's2j-alliance-manager') 
      };
    }

    // 先頭・末尾がハイフンでないかチェック
    if (slug.startsWith('-') || slug.endsWith('-')) {
      return { 
        isValid: false, 
        message: __('Slug cannot start or end with a hyphen.', 's2j-alliance-manager') 
      };
    }

    // 連続するハイフンがないかチェック
    if (slug.includes('--')) {
      return { 
        isValid: false, 
        message: __('Slug cannot contain consecutive hyphens.', 's2j-alliance-manager') 
      };
    }

    return { isValid: true };
  }
}
