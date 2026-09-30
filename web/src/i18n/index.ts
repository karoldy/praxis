import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { en } from "./resources/en"
import { sc } from "./resources/sc"
import { tc } from "./resources/tc"

export const SUPPORTED_LOCALES = ["sc", "tc", "en"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "sc"

const HTML_LANG: Record<Locale, string> = {
  sc: "zh-CN",
  tc: "zh-Hant",
  en: "en",
}

function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/** Keep document language aligned so Noto Sans SC/TC follow the UI locale. */
export function applyDocumentLang(lng: string) {
  if (typeof document === "undefined") return
  const locale = isLocale(lng) ? lng : DEFAULT_LOCALE
  document.documentElement.lang = HTML_LANG[locale]
}

void i18n.use(initReactI18next).init({
  resources: {
    sc: { translation: sc },
    tc: { translation: tc },
    en: { translation: en },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
})

i18n.on("languageChanged", applyDocumentLang)
applyDocumentLang(i18n.language)

export default i18n
