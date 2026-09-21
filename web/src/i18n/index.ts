import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { sc } from './resources/sc.js';
import { tc } from './resources/tc.js';
import { en } from './resources/en.js';

/**
 * 前端多语言（设计 §8.1/§8.4）：UI 文案走 i18next 资源文件；数据文本走后端 i18n 表。
 * 默认语言 `sc`，缺失回落到 `sc`。
 */
void i18n
  .use(initReactI18next)
  .init({
    resources: {
      sc: { translation: sc },
      tc: { translation: tc },
      en: { translation: en },
    },
    lng: 'sc',
    fallbackLng: 'sc',
    // 内联资源 + 同步初始化：import 后立即可用（利于测试与首帧渲染）
    initImmediate: false,
    interpolation: { escapeValue: false },
    returnNull: false,
  });

/** 暴露的语言列表（含默认语言标记） */
export const SUPPORTED_LOCALES = ['sc', 'tc', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'sc';

export default i18n;