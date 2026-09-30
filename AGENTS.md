# PRAXIS docs hub

This repo is docs + skills for 知行（Praxis）. It is not application source.

Never add `AGENTS.md`, `CLAUDE.md`, `.claude/`, or `.agents/` to `api`, `web`, or `app`.

## Where to edit

Only two places. Everything else is an alias or an index.

| Write here | Purpose |
| --- | --- |
| `skills/<name>/SKILL.md` | Agent procedures. This is the only skill copy. |
| `docs/...` | Technical docs. Follow the routing table. |

Skills live only in `skills/`. `.agents/skills`, `.claude/skills`, and `.cursor/skills` are symlinks to that directory. Do not copy skills.

Add a new doc page only when you have real content. Do not pre-create empty mirrors across project folders.

## Routing

| Project | Write / read |
| --- | --- |
| `api` | `docs/api/` + `docs/shared/` |
| `web` | `docs/web/` + `docs/shared/` |
| `app` | `docs/app/` + `docs/shared/` |
| All three (auth, API contract, design, release) | `docs/shared/` only. Project pages link here. |

Pick the folder from this table, then pick a skill. Catalog: [docs/index.md](docs/index.md).

## Skills

Hub:

- `docs-authoring` — add or update docs
- `app` — study mobile (React Native; not Expo / Expo Router)
- `web` — Vite + React + shadcn
- `api` — NestJS + PostgreSQL

Third-party skills live in `skills/` too:

- Mobile: `vercel-react-native-skills`, `react-navigation`, `creating-reanimated-animations` (ignore Expo / Expo Router)
- Web: `vercel-react-best-practices`, `tailwind-css`, `shadcn` (Vite + React; do not switch the app to Next.js)
- All three: `typescript-type-safety`

## Source code

Read-only if present on disk: `app/`, `web/`, or `api/` in this repo, or the same directory names one level up. Those repos stay AI-free.

Reply in Chinese. Code comments in English.
