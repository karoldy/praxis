# 知行（Praxis）

Docs and agent skills hub. This is not application source.

用户侧品牌：**知行** · 工程名：**Praxis**

| Project | Stack |
| --- | --- |
| Web | Vite + React + shadcn |
| API | NestJS + PostgreSQL |
| App | React Native（不用 Expo / Expo Router） |

**Edit only these two places:**

| What | Canonical path | Do not edit |
| --- | --- | --- |
| Skills | [`skills/`](skills/) | `.agents/skills`, `.claude/skills`, `.cursor/skills` only symlink here |
| Technical docs | [`docs/`](docs/) using the table below | Do not copy the same fact into more than one project folder |

| Topic | Folder |
| --- | --- |
| Mobile app | [docs/app/](docs/app/) |
| Web | [docs/web/](docs/web/) |
| API | [docs/api/](docs/api/) |
| True for every project (auth, API contract, design, release) | [docs/shared/](docs/shared/) |

Catalog: [docs/index.md](docs/index.md). Add a page only when you have real content. Do not pre-create empty files.

Do not put `AGENTS.md`, `CLAUDE.md`, `.claude/`, or `.agents/` in the `app`, `web`, or `api` repos.
