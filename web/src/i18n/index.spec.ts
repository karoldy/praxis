import { describe, it, expect } from 'vitest';
import i18n, { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './index.js';

describe('i18n', () => {
  it('默认语言为 sc', () => {
    expect(i18n.resolvedLanguage).toBe('sc');
  });

  it('sc 关键文案可译', () => {
    expect(i18n.t('common.brand')).toBe('知行');
    expect(i18n.t('pages.documents.title')).toBe('文档中心');
  });

  it('支持 sc/tc/en 并切换生效', () => {
    expect(SUPPORTED_LOCALES).toEqual(['sc', 'tc', 'en']);

    i18n.changeLanguage('en');
    expect(i18n.t('common.tab.notes')).toBe('Learning');

    i18n.changeLanguage('tc');
    expect(i18n.t('common.tab.notes')).toBe('學習中心');

    // 归位，避免影响其他用例
    i18n.changeLanguage(DEFAULT_LOCALE);
    expect(i18n.resolvedLanguage).toBe('sc');
  });
});