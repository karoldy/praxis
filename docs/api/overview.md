# API

NestJS + PostgreSQL。ORM 用 Drizzle（`drizzle-orm` + `postgres`）。

从 `api/` 启动：

```bash
pnpm install
docker compose up -d
cp .env.example .env
pnpm dev
pnpm test
```

`GET /api/health` 对数据库执行 `select 1`。表写在 `src/db/schema.ts`，迁移用 `pnpm db:generate` 和 `pnpm db:migrate`。
