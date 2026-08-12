# Praxis API 基础层设计

日期：2026-08-12  
状态：设计完成，待写实现计划  
父文档：[Praxis 系统设计](./2026-08-10-praxis-design.md)

## 范围

首期只做基础设施，不做业务 CRUD：

1. NestJS API 骨架 + 目录就位
2. PostgreSQL 连接 + Drizzle ORM
3. Better Auth 鉴权（邮箱 + 密码）
4. 四个模块空边界（notes / tasks / exams / identity）
5. 公共层（异常过滤器 / 校验管道）
6. 基础 e2e 测试（health + auth）

## 目录结构

```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/
│   │   ├── auth.middleware.ts
│   │   ├── auth.guard.ts
│   │   └── current-user.decorator.ts
│   ├── db/
│   │   ├── schema/
│   │   │   ├── index.ts
│   │   │   └── auth.ts
│   │   ├── index.ts
│   │   └── migrations/
│   ├── modules/
│   │   ├── notes/
│   │   │   ├── notes.module.ts
│   │   │   └── notes.controller.ts
│   │   ├── tasks/
│   │   │   ├── tasks.module.ts
│   │   │   └── tasks.controller.ts
│   │   ├── exams/
│   │   │   ├── exams.module.ts
│   │   │   └── exams.controller.ts
│   │   └── identity/
│   │       ├── identity.module.ts
│   │       └── identity.controller.ts
│   └── common/
│       ├── filters/
│       │   └── global-exception.filter.ts
│       └── pipes/
│           └── validation.pipe.ts
├── test/
│   ├── setup.ts
│   ├── health.e2e-spec.ts
│   └── auth/
│       └── auth.e2e-spec.ts
├── drizzle.config.ts
├── tsconfig.json
└── package.json
```

## Better Auth 集成方式：混合桥接（方案 C）

Better Auth handler 以原生 Express 中间件形式挂载到 `/api/auth/*`，Nest 侧通过轻量 Guard 桥接读取 session。

```
请求 → Express → /api/auth/* → Better Auth handler（原生）
              → /api/notes/* → AuthGuard → Controller
```

### 组件职责

| 组件 | 职责 |
|------|------|
| `auth.middleware.ts` | 将 `auth.handler`（`toNodeHandler`）挂载为 Express 中间件，响应 `/api/auth/*` |
| `auth.guard.ts` | 调用 `auth.api.getSession()` 校验 session，失败抛 401 |
| `current-user.decorator.ts` | `@CurrentUser()` 参数装饰器，从 request 提取 user |

### 路由

| 路由 | 鉴权 | 说明 |
|------|------|------|
| `/api/auth/*` | 无（Better Auth 自行处理） | 登录、注册、session 管理 |
| `/api/health` | 无 | 健康检查 |
| `/api/notes/*` | 需登录 | 笔记（首期占位） |
| `/api/tasks/*` | 需登录 | 任务（首期占位） |
| `/api/exams/*` | 需登录 | 考试（首期占位） |
| `/api/identity/*` | 需登录 | 用户资料（首期占位） |

## 数据层

- Drizzle client 通过 `DRIZZLE` token 注册为全局 provider
- Schema 分区：`schema/auth.ts` 定义 Better Auth 所需表（user、session、account）
- 业务表（notes、tasks、exams）暂不创建
- 驱动：`pg`（node-postgres）
- 迁移命令：`pnpm --filter api db:generate` / `db:migrate`

## 公共层

### 统一错误响应

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "errorCode": "UNAUTHORIZED",
  "requestId": "req_<uuid>",
  "timestamp": "2026-08-12T08:30:00.000Z"
}
```

### Zod 校验管道

`ZodPipe` 替代 Nest 内置 `ValidationPipe`，传入 zod schema 做输入校验。与 `packages/shared` 复用 schema 定义。

## 测试

- 框架：**Vitest** + **supertest**
- 测试库：独立 `.env.test`（不会污染开发/生产数据）
- 首期覆盖：
  - `GET /api/health` 返回 `{ status: "ok" }`
  - 未登录访问 `/api/notes` 返回 401 + 标准错误形状

## 环境变量

```
DATABASE_URL=postgresql://...
# 测试用
DATABASE_URL_TEST=postgresql://...
```

## 非目标

- 不做业务 CRUD
- 不做 JWT 分发（只用 cookie session）
- 不做 OAuth / 第三方登录
- 不做邮件验证
- 不做 Swagger / OpenAPI
