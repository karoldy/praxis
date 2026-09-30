---
name: app
description: >
  Documents or reasons about changes in the Praxis mobile app.
  Use when the user mentions the app, React Native screens, or mobile release.
  This app is not Expo and not Expo Router.
---

# App

Assume AGENTS.md has already routed to `docs/app/` + `docs/shared/`.

## Stack

React Native. Not Expo. Not Expo Router. Versions and installed libraries come from the app `package.json` and `docs/app/`.

## Read first

1. `docs/app/overview.md`
2. Other markdown in that folder or `docs/shared/`
3. RN implementation: `vercel-react-native-skills`, then `react-navigation` when the task is navigation
4. Animation: `creating-reanimated-animations`
5. TypeScript models: `typescript-type-safety`

## Skip from third-party RN skills

- Expo, Expo Router, and Expo config plugins. Never add Expo to satisfy a skill
- Rules that assume a package the app has not installed
- Do not install a native dependency as a side effect of following a skill

## Then

- Shared facts go in `docs/shared/`, not copied here
- This repo is not app source. `app/` stays read-only for AI files

## Checklist

- [ ] Overview still matches React Native, not Expo / Expo Router
- [ ] Stack claims match `package.json`, not planned work
