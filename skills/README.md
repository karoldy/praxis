# Skills

Edit only `skills/<name>/SKILL.md`. `.agents/skills`, `.claude/skills`, and `.cursor/skills` symlink here.

Hub skills are short. Third-party skills may contain many `rules/` files — that is one skill, not many.

## Hub

- `docs-authoring` — add or update docs
- `app` — study mobile (React Native, not Expo). Stack: `docs/app/`
- `web` — Vite + React + shadcn. Stack: `docs/web/`
- `api` — NestJS + PostgreSQL. Stack: `docs/api/`

## Installed

| Skill | Source | Use for |
| --- | --- | --- |
| `vercel-react-native-skills` | [vercel-labs](https://skills.sh/vercel-labs/agent-skills/vercel-react-native-skills) | Mobile. Ignore Expo and any rule for a package the app has not installed. |
| `creating-reanimated-animations` | [estevg/skills](https://skills.sh/estevg/skills/creating-reanimated-animations) | Mobile animation. Follow the version the app actually depends on. |
| `react-navigation` | [Callstack](https://skills.sh/callstackincubator/agent-skills/react-navigation) | React Navigation. Confirm it is a dependency before writing navigators. |
| `vercel-react-best-practices` | [vercel-labs](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices) | Web React performance on Vite. Do not switch the app to Next.js. |
| `tailwind-css` | [sablier-labs](https://www.skills.sh/sablier-labs/plugin-marketplace/tailwind-css) | Web Tailwind. Follow the theme setup in `docs/web/`; do not migrate it unprompted. |
| `shadcn` | [shadcn/ui](https://skills.sh/shadcn/ui) | Web UI components. Do not run `shadcn init` from this hub. `add` does not install the base library — check the web `package.json`. |
| `typescript-type-safety` | [hjj0711/Skill-Kit](https://github.com/hjj0711/Skill-Kit/blob/main/typescript-type-safety/references/patterns.md) | All three projects. Discriminated unions, `satisfies`, brands. |

## Deliberately not installed

| Topic | Why |
| --- | --- |
| i18n skill (`i18next` / `react-i18next`) | No i18n skill until `docs/web/` or `docs/app/` names the library. |
| RN styling (NativeWind / Unistyles / gluestack) | Do not add a styling library from a skill. Conventions belong in `app` once `docs/app/` records them. |
| `migrate-radix-to-base` (shadcn/ui) | Nothing in this hub is on Radix yet. |
| Zustand skills | No store is recorded in docs yet. |
| Multi-agent RN/Next suites | Expo-heavy or Next-specific, and they override this hub's routing. |

MCP: [.mcp.json](../.mcp.json) starts the shadcn server inside the nested `web` clone. The server reads `components.json` from its working directory and ignores `-c`, so the config `cd`s first. Pin `shadcn` to the web app's devDependency once that repo exists. Until `web/` is cloned, the server cannot start.

Lockfile: [skills-lock.json](../skills-lock.json). Routing: [AGENTS.md](../AGENTS.md).
