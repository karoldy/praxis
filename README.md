# 知行（Praxis）

学 · 做 · 考 · 记，一体贯通。

用户侧品牌：**知行** · 工程名：**Praxis**

> 知行是一套知识体系集群，围绕「输入 → 消化 → 检验 → 沉淀」的学习闭环组织内容，共用一个后端。

## 四大中心

| 中心 | 职责 |
|------|------|
| 学习中心 | 笔记与学习材料的输入、整理、回顾 |
| 考试中心 | 测验、考试与练习 |
| 任务中心 | 学习任务、计划与进度跟踪 |
| 文档中心 | 文档与知识的沉淀、管理 |

## 技术栈

| 层 | 选型 |
|----|------|
| 后端 | NestJS · TypeScript |
| 数据库 | PostgreSQL |
| ORM | Drizzle |
| 认证 | Better Auth + Drizzle |
| Web 前端 | Vite + React + TypeScript |
| App | React Native (Expo) — 目录预留 |

## 目录结构

> **不是 Monorepo / 工作区(workspace)架构。** 后端与前端是各自独立的工程,不通过 pnpm workspace 或共享包统一管理。目录只是把相关代码放在同一仓库下,各自持有独立的构建与依赖管理。

```text
api/         NestJS API  (Drizzle + Better Auth)
web/         Vite + React (独立工程, 独立 package.json)
app/         React Native (Expo) — 预留
docs/        设计与品牌文档
```

后端与前端之间只通过 HTTP 契约(OpenAPI)衔接,不共享代码包。

## 文档

- [系统设计](./docs/superpowers/specs/) — 需求与架构评审记录
- [品牌与命名](./docs/branding.md)

## 开发

（待补充：启动方式、环境变量、数据库迁移说明）