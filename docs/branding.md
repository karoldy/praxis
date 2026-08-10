# 知行 / Praxis 品牌与命名

## 双品牌

| 层 | 名称 | 用途 |
|----|------|------|
| 对内 / 用户可见 | **知行** | App 名、页面标题、关于页、宣传文案 |
| 工程 / 英文 | **Praxis** | 仓库、包名、API、域名、技术文档 |

## 用户侧

- 产品：知行
- Web：知行
- App：知行
- 模块：笔记中心 · 任务中心 · 考试中心  
  （文案也可写「知行 · 笔记」等）

可选 Slogan：学 · 做 · 考，一体贯通。

## 工程侧

| 用途 | 命名 |
|------|------|
| 根仓库 | `praxis` |
| 后端 | `apps/api` / `praxis-api` |
| Web | `apps/web` / `praxis-web` |
| App | `apps/mobile` / `praxis-app` |
| 共享包 | `@praxis/shared`、`@praxis/ui`、`@praxis/config` |
| 环境变量 | `PRAXIS_*` |

## 原则

- 用户界面默认只出现「知行」，不暴露 Praxis（除非 About / 开源致谢需要）
- 代码、仓库、CI、包管理一律用 Praxis
- 不要用「台 / 中心 / Hub」当主品牌名；「中心」仅作模块名
