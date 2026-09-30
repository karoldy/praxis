---
name: web
description: >
  Documents or reasons about changes in the Praxis web app.
  Use when the user mentions the web app, Vite, React, shadcn, or web release.
---

# Web

Assume AGENTS.md has already routed to `docs/web/` + `docs/shared/`.

## Stack

Vite + React + shadcn. Not Next.js. Versions and other libraries come from the web `package.json` and `docs/web/`.

## Read first

1. `docs/web/overview.md`
2. Other markdown in that folder or `docs/shared/`
3. React implementation: `vercel-react-best-practices` (skip Next.js-only advice)
4. Tailwind: `tailwind-css`
5. UI components: `shadcn` (target Vite, not Next.js)
6. TypeScript models: `typescript-type-safety`

## Skip

- Do not run `shadcn init` from this hub
- Do not add Next.js, the App Router, or `next-i18n-router`
- Do not add a bundler other than Vite

## Then

- Shared facts go in `docs/shared/`
- This repo is not web source. `web/` stays read-only for AI files

## Checklist

- [ ] Overview still matches Vite + React + shadcn
- [ ] New pages exist only with real content, listed in `docs/index.md`
