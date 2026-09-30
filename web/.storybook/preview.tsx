import type { Preview } from "@storybook/react-vite"
import { ThemeProvider } from "@/components/theme-provider"
import i18n, { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@/i18n"
import "unfonts.css"
import "../src/index.css"

function readLocale(value: unknown): Locale {
  if (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  ) {
    return value as Locale
  }

  return DEFAULT_LOCALE
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  globalTypes: {
    locale: {
      description: "Locale",
      toolbar: {
        title: "Locale",
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "sc", title: "简体中文" },
          { value: "tc", title: "繁體中文" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: DEFAULT_LOCALE },
  async beforeEach(context) {
    await i18n.changeLanguage(readLocale(context.globals.locale))
  },
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
}

export default preview
