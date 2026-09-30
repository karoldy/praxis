---
name: api
description: >
  Documents or reasons about changes in the Praxis API.
  Use when the user mentions the API server, NestJS, PostgreSQL, or backend release.
---

# API

Assume AGENTS.md has already routed to `docs/api/` + `docs/shared/`.

## Stack

NestJS + PostgreSQL. Versions and other libraries come from the api `package.json` and `docs/api/`.

## Read first

1. `docs/api/overview.md`
2. Other markdown in that folder or `docs/shared/`
3. TypeScript models: `typescript-type-safety`

## Then

- Shared facts (auth, API contract, release) go in `docs/shared/`
- This repo is not API source. `api/` stays read-only for AI files

## Checklist

- [ ] Overview still matches NestJS + PostgreSQL
- [ ] Contract facts that web or app also need live in `docs/shared/`
