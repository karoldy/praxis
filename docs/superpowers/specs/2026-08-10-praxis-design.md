# 知行（Praxis）系统设计

日期：2026-08-10  
状态：待用户评审

## 1. 产品定位

知行是一个学习闭环产品：笔记（学习）→ 任务 → 考试，共用一个后端，先做 Web，后续提供 App。

| 用户侧 | 工程侧 |
|--------|--------|
| 知行 | Praxis |

模块：

- **笔记中心（学习中心）**：笔记与学习材料
- **任务中心**：学习相关任务与进度
- **考试中心**：测验 / 考试

可选 Slogan：学 · 做 · 考，一体贯通。

## 2. 仓库与目录

根目录：`/Users/turbo.su/Personal/praxis`

```text
praxis/
├── apps/
│   ├── api/                 # NestJS 共用后端
│   ├── web/                 # 知行 Web
│   └── mobile/              # 知行 App（预留）
├── packages/
│   ├── shared/              # 跨端类型、常量、校验契约
│   ├── ui/                  # 可选共享 UI（初期可先放 web）
│   └── config/              # 共享 eslint / tsconfig 等
├── docs/
│   ├── branding.md
│   └── superpowers/specs/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

包管理：**pnpm workspace**。

命名约定：

| 路径 | 用户侧叫法 |
|------|------------|
| `praxis/` | 知行 |
| `apps/web` | 知行 Web |
| `apps/mobile` | 知行 App |
| `apps/api` | Praxis API |
| `modules/notes` | 笔记中心 |
| `modules/tasks` | 任务中心 |
| `modules/exams` | 考试中心 |

环境变量前缀：`PRAXIS_`。仓库 / 包名使用 `praxis-*` 或 `@praxis/*`。

## 3. 技术栈

| 层 | 选型 |
|----|------|
| 后端 | NestJS + TypeScript |
| 数据库 | PostgreSQL |
| ORM | Drizzle |
| 鉴权 | Better Auth（Drizzle adapter） |
| Web | Vite + React + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| 数据请求 / 路由 | TanStack Query + React Router |
| App | React Native（Expo），目录预留，首期不实现 |
| Monorepo | pnpm workspace |

## 4. 架构

### 4.1 总体

模块化单体后端 + 多端前端：

- Web / App 只通过 HTTP 调用 API，不直连数据库
- 三个业务中心与鉴权共用同一 Postgres
- `packages/shared` 承载可共享的 DTO / 类型 / 常量

```text
[知行 Web]          [知行 App · 后期]
     \                   /
      \                 /
       v               v
         Praxis API (NestJS)
              |
         Better Auth  (/api/auth/*)
              |
         PostgreSQL + Drizzle
```

### 4.2 API 内部结构

```text
apps/api/
├── src/
│   ├── auth/                # Better Auth 配置与 Nest 挂载
│   ├── db/
│   │   ├── schema/          # auth + notes/tasks/exams
│   │   ├── index.ts
│   │   └── migrations/
│   ├── modules/
│   │   ├── notes/
│   │   ├── tasks/
│   │   ├── exams/
│   │   └── identity/        # 业务侧用户资料（非 Better Auth 核心表）
│   ├── common/
│   └── main.ts
├── drizzle.config.ts
└── package.json
```

路由约定：

- `/api/auth/*` — Better Auth
- `/api/notes/*` — 笔记中心
- `/api/tasks/*` — 任务中心
- `/api/exams/*` — 考试中心

### 4.3 Web 内部结构

```text
apps/web/
├── src/
│   ├── features/
│   │   ├── notes/
│   │   ├── tasks/
│   │   └── exams/
│   ├── app/                 # 路由壳、布局
│   └── shared/
└── package.json
```

shadcn/ui 组件默认放在 `apps/web`；稳定后再考虑抽到 `packages/ui`。

### 4.4 Mobile

`apps/mobile` 仅预留。放入简短 README，说明后续使用 Expo + React Native，并复用 `packages/shared` 与同一套 API。首期不做业务实现。

## 5. 鉴权

- 使用 **Better Auth**，数据库适配 **Drizzle**，provider：`pg`
- 首期登录方式：**邮箱 + 密码**（不做第三方 OAuth，除非后续单独立项）
- Auth 表与业务表在同一 schema / 同一数据库
- Nest 将 Better Auth handler 挂载到 `/api/auth/*`
- Web 使用 Better Auth client；受保护的业务接口在 Nest 侧校验 session
- `identity` 模块只承载业务资料（如显示名、偏好），账号凭证以 Better Auth 为准
- App 鉴权接入方式在做 mobile 时再按 Better Auth 移动端指引实现；首期不阻塞

## 6. 数据层

- PostgreSQL 为唯一业务数据库
- Drizzle schema 分区组织：`schema/auth`、`schema/notes`、`schema/tasks`、`schema/exams`
- 迁移由 drizzle-kit 管理，位于 `apps/api`
- Prisma 不在范围内

## 7. 跨端共享

`packages/shared` 首期包含：

- 与 API 对齐的 TypeScript 类型 / DTO
- 共享常量（模块名、状态枚举等）
- 可选：zod schema（前后端可复用的输入校验）

不共享：

- 数据库 client
- Nest 模块实现
- Web 专用 UI（除非抽到 `packages/ui`）

## 8. 首期范围与非目标

### 首期做

1. 初始化 pnpm monorepo（`api` / `web` / `shared` / `config`，`mobile` 预留）
2. Nest API 骨架 + Drizzle + Postgres 连接
3. Better Auth 接入（邮箱密码或最小可用登录）
4. Web 骨架：Vite + React + Tailwind + shadcn + React Router + TanStack Query
5. 三个中心的空模块边界（路由 / feature 目录就位）
6. 至少一个中心的最小 CRUD 打通（建议笔记中心）以验证全链路

### 首期不做

- React Native App 业务功能
- 微服务拆分
- 复杂考试引擎 / 自动阅卷
- 多租户 / 组织账号（除非实现中发现必须）
- 国际化

## 9. 错误处理与测试（原则）

- API：统一错误响应形状；鉴权失败与校验失败有明确状态码
- Web：TanStack Query 统一处理请求错误；路由级需登录守卫
- 测试：首期以 API 模块的单元 / e2e 烟测为主；Web 关键路径可后续补

## 10. 文档

| 文件 | 用途 |
|------|------|
| `docs/branding.md` | 知行 / Praxis 命名约定 |
| `docs/superpowers/specs/2026-08-10-praxis-design.md` | 本设计 |

---

评审通过后，再写实现计划（implementation plan）并开始脚手架。
