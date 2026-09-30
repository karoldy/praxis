# Web

Vite + React + shadcn（style `base-nova`，Base UI）。

字体离线，打进构建产物。默认 Noto Sans，缺字用 Noto Sans SC；`zh-Hant` / `zh-TW` / `zh-HK` 改用 Noto Sans TC。

界面文案用 i18next + react-i18next。语言码 `sc` / `tc` / `en`，默认 `sc`。`sc` 把 `html lang` 设为 `zh-CN`，`tc` 设为 `zh-Hant`，`en` 设为 `en`。

组件文档用 Storybook（`@storybook/react-vite`）。预览加载同一套字体、样式、主题和 i18n。

从 `web/` 启动：

```bash
pnpm install
pnpm dev
pnpm build
pnpm storybook
pnpm build-storybook
```
