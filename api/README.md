# Praxis API

知行（Praxis）后端 —— **NestJS 12 · TypeScript (ESM) · Drizzle · Better Auth · pino**。

## 常用命令

```bash
pnpm install              # 安装依赖
pnpm dev                  # 开发：nest start --watch（tsc，支持装饰器元数据）
pnpm build                # 编译到 dist/
pnpm start                # 运行编译产物（生产路径）
pnpm test                 # 单元测试（vitest）
pnpm test:e2e             # 端到端测试（需要本地 Postgres）
pnpm db:push              # 按 src/db/schema.ts 直接推库（开发期）
pnpm db:generate          # 根据 schema 生成迁移脚本（drizzle/migrations）
pnpm better-auth generate --config better-auth.config.ts   # 重新生成 Better Auth 表定义
```

## 本地起库

```bash
docker compose up -d postgres   # postgres:16，映射 127.0.0.1:15432（设计 §7 高位端口）
```

环境变量前缀统一 `PRAXIS_`（见 `.env.example`）。首次可用 `cp .env.example .env`。

## 顺带提醒

- **不要用 `tsx src/main.ts` 直接跑**：esbuild/tsx 不会产出 `emitDecoratorMetadata`
  （`design:paramtypes`），会导致 Nest 控制器/守卫的构造注入全部变成 `undefined`。
  请用 `pnpm dev`（`nest start --watch`，基于 tsc）或 `pnpm build && pnpm start`。
- **路由前缀**：`/api/*`（global prefix）；Better Auth 挂在 `/api/auth/*`（toNodeHandler
  + path 守卫，避免前缀双重叠加）。
- **鉴权**：`AuthGuard`（校验会话）+ `@CurrentUser()`（注入当前用户）；超管引导、
  资源归属授权属后续业务层。
- **日志**：Nest 内部日志走 pino；`PRAXIS_LOG_FILE=true` 时 pino-roll 按日/大小滚动写 `logs/`。