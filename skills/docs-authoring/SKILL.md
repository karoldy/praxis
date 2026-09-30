---
name: docs-authoring
description: >
  Adds or updates technical docs in this hub. Use when the user asks to write,
  expand, restructure, or correct Praxis documentation.
---

# Docs authoring

AGENTS.md already selected the doc tree. Follow it. Do not duplicate that table here.

## Where to write

- Edit skills only under `skills/`. Do not create `.claude/` or `.agents/`.
- Facts used by more than one project → `docs/shared/`. Project pages only record differences and link.
- Project-only facts → that project's folder under `docs/` (`api`, `web`, or `app`).
- Update `docs/index.md` when adding or renaming a page.
- Do not pre-create empty pages. Do not put long architecture into a skill.
- Stacks are fixed: `web` is Vite + React + shadcn, `api` is NestJS + PostgreSQL, `app` is React Native (not Expo / Expo Router).

## Page shape

Each page should answer: what it is, where it lives, how it differs from the other projects (or link to shared), and known pitfalls.

Keep overviews able to stand alone: stack, entry, how to run, boundary with the other projects.

## After editing

- [ ] New page is listed in `docs/index.md`
- [ ] Shared facts are not copied into a project page
- [ ] Filename is lowercase-hyphen markdown
- [ ] No secrets, `.env` values, or large source dumps
