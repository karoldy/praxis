# Praxis API 基础层 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Praxis monorepo + NestJS API with PostgreSQL/Drizzle, Better Auth (email+password), empty module boundaries, common layer, and basic e2e tests.

**Architecture:** pnpm monorepo with root workspace config. NestJS on Express. Drizzle ORM with pg driver. Better Auth runs as a native Express middleware under `/api/auth/*`; a thin Nest Guard bridges session reads for protected controllers. DB client is a NestJS provider also available as a direct import for auth setup.

**Tech Stack:** pnpm 9, Node 22, TypeScript 5.x, NestJS 11, Drizzle ORM, Better Auth, PostgreSQL (pg), Vitest + supertest

## Global Constraints

- Environment variable prefix: `PRAXIS_` (passed through to `process.env` for DB)
- Route prefix: `/api/auth/*` for Better Auth, `/api/<module>/*` for business modules
- Cookie-based sessions (no JWT)
- Node driver: `pg` (node-postgres), not `postgres-js`
- Auth: email + password only, no OAuth, no email verification (first pass)
- Error shape: `{ statusCode, message, errorCode, requestId, timestamp }` — no `path`
- Testing: Vitest + supertest, separate `.env.test` database
- `packages/shared` stays a placeholder; all types live in `apps/api` for now

---

## File Map

```
praxis/
├── package.json                          # root: workspaces, scripts
├── pnpm-workspace.yaml                   # apps/* packages/*
├── tsconfig.base.json                    # shared TS options
├── apps/api/
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts
│   ├── .env                              # PRAXIS_DATABASE_URL=...
│   ├── .env.test                         # PRAXIS_DATABASE_URL=... (test db)
│   └── src/
│       ├── main.ts                       # bootstrap, auth middleware mount
│       ├── app.module.ts                 # root module, global providers
│       ├── health.controller.ts          # GET /api/health
│       ├── auth/
│       │   ├── index.ts                  # Better Auth instance
│       │   ├── auth.middleware.ts         # Express middleware wrapper
│       │   ├── auth.guard.ts             # CanActivate guard
│       │   └── current-user.decorator.ts # @CurrentUser() param decorator
│       ├── db/
│       │   ├── schema/
│       │   │   ├── index.ts             # barrel export
│       │   │   └── auth.ts              # user, session, account, verification tables
│       │   ├── index.ts                 # Drizzle client + DRIZZLE provider
│       │   └── migrations/              # drizzle-kit output
│       ├── modules/
│       │   ├── notes/
│       │   │   ├── notes.module.ts
│       │   │   └── notes.controller.ts
│       │   ├── tasks/
│       │   │   ├── tasks.module.ts
│       │   │   └── tasks.controller.ts
│       │   ├── exams/
│       │   │   ├── exams.module.ts
│       │   │   └── exams.controller.ts
│       │   └── identity/
│       │       ├── identity.module.ts
│       │       └── identity.controller.ts
│       ├── common/
│       │   ├── filters/
│       │   │   └── global-exception.filter.ts
│       │   └── pipes/
│       │       └── zod-validation.pipe.ts
│       └── types/
│           └── express.d.ts             # Express Request augmentation
├── packages/shared/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts                     # placeholder: export {}
└── packages/config/
    ├── package.json
    └── tsconfig.base.json               # if needed
```

---

### Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`

**Produces:** `pnpm install` succeeds at root.

- [ ] **Step 1: Write root package.json**

```json
{
  "name": "praxis",
  "private": true,
  "scripts": {
    "api": "pnpm --filter @praxis/api",
    "web": "pnpm --filter @praxis/web",
    "shared": "pnpm --filter @praxis/shared"
  },
  "engines": {
    "node": ">=22",
    "pnpm": ">=9"
  }
}
```

- [ ] **Step 2: Write pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Write tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Create packages/shared placeholder**

`packages/shared/package.json`:
```json
{
  "name": "@praxis/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {}
}
```

`packages/shared/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist" },
  "include": ["src"]
}
```

`packages/shared/src/index.ts`:
```ts
// @praxis/shared — placeholder; DTOs, types, and zod schemas will go here
export {};
```

- [ ] **Step 5: Install root deps and verify**

```bash
pnpm install
```

Expected: installs nothing (no root deps yet), prints success.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json packages/shared/
git commit -m "chore: scaffold pnpm monorepo with shared package placeholder

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: API package & NestJS skeleton

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/health.controller.ts`
- Create: `apps/api/.env`
- Create: `apps/api/.env.test`

**Consumes:** Task 1 (root tsconfig, pnpm workspace)

**Produces:** `pnpm --filter @praxis/api dev` starts a NestJS server on port 3000. `GET /api/health` returns `{ status: "ok" }`.

- [ ] **Step 1: Write apps/api/package.json**

```json
{
  "name": "@praxis/api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/main.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "better-auth": "^1.0.0",
    "dotenv": "^16.4.0",
    "drizzle-orm": "^0.42.0",
    "pg": "^8.13.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0",
    "uuid": "^10.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^11.0.0",
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/pg": "^8.11.0",
    "@types/supertest": "^6.0.0",
    "@types/uuid": "^10.0.0",
    "drizzle-kit": "^0.31.0",
    "supertest": "^7.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Write apps/api/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src", "test"]
}
```

- [ ] **Step 3: Install API dependencies**

```bash
pnpm install
```

Expected: all packages install successfully.

- [ ] **Step 4: Write apps/api/src/main.ts**

```ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Praxis API running on http://localhost:3000');
}

bootstrap();
```

- [ ] **Step 5: Write apps/api/src/app.module.ts**

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller.js';
import { databaseProvider } from './db/index.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController],
  providers: [databaseProvider],
})
export class AppModule {}
```

- [ ] **Step 6: Write apps/api/src/health.controller.ts**

```ts
import { Controller, Get } from '@nestjs/common';

@Controller('api/health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
```

- [ ] **Step 7: Create env files**

`apps/api/.env`:
```
DATABASE_URL=postgresql://localhost:5432/praxis_dev
```

`apps/api/.env.test`:
```
DATABASE_URL=postgresql://localhost:5432/praxis_test
```

- [ ] **Step 8: Verify server starts**

```bash
pnpm --filter @praxis/api dev &
sleep 3
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok"}`. Kill the dev server after verifying.

- [ ] **Step 9: Commit**

```bash
git add apps/api/
git commit -m "feat(api): scaffold NestJS app with health endpoint

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Database schema & Drizzle client

**Files:**
- Create: `apps/api/src/db/schema/auth.ts`
- Create: `apps/api/src/db/schema/index.ts`
- Create: `apps/api/src/db/index.ts`
- Create: `apps/api/drizzle.config.ts`

**Consumes:** Task 2 (NestJS app, env files, deps)

**Produces:** Drizzle client is available for import. `pnpm --filter @praxis/api db:generate` produces migration files.

- [ ] **Step 1: Write apps/api/src/db/schema/auth.ts**

```ts
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

- [ ] **Step 2: Write apps/api/src/db/schema/index.ts**

```ts
export { user, session, account, verification } from './auth.js';
```

- [ ] **Step 3: Write apps/api/src/db/index.ts**

```ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export const DRIZZLE = Symbol('DRIZZLE');

export const databaseProvider = {
  provide: DRIZZLE,
  useValue: db,
};
```

- [ ] **Step 4: Write apps/api/drizzle.config.ts**

```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

- [ ] **Step 5: Verify drizzle-kit can read schema**

```bash
pnpm --filter @praxis/api exec drizzle-kit generate
```

Expected: creates migration files under `src/db/migrations/`. If no Postgres is running, drizzle-kit generate still works (it analyzes schema, doesn't need a live DB).

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/db/ apps/api/drizzle.config.ts apps/api/src/db/migrations/
git commit -m "feat(api): add Drizzle schema and database client

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Better Auth instance & integration

**Files:**
- Create: `apps/api/src/auth/index.ts`
- Create: `apps/api/src/auth/auth.middleware.ts`
- Create: `apps/api/src/auth/auth.guard.ts`
- Create: `apps/api/src/auth/current-user.decorator.ts`
- Create: `apps/api/src/types/express.d.ts`
- Modify: `apps/api/src/main.ts` — mount auth middleware
- Modify: `apps/api/src/app.module.ts` — add AuthGuard as global

**Consumes:** Task 3 (Drizzle client, schema)

**Produces:** Better Auth handles `/api/auth/*`. AuthGuard returns 401 for unauthenticated requests. `@CurrentUser()` extracts user from request.

- [ ] **Step 1: Write apps/api/src/types/express.d.ts**

```ts
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image?: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    session?: {
      id: string;
      userId: string;
      token: string;
      expiresAt: Date;
    };
  }
}
```

- [ ] **Step 2: Write apps/api/src/auth/index.ts**

```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema/index.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
```

- [ ] **Step 3: Write apps/api/src/auth/auth.middleware.ts**

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './index.js';

const handler = toNodeHandler(auth);

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, _next: NextFunction) {
    return handler(req, res);
  }
}
```

- [ ] **Step 4: Write apps/api/src/auth/auth.guard.ts**

```ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { auth } from './index.js';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw new UnauthorizedException('Authentication required');
    }

    request.user = session.user;
    request.session = session.session;
    return true;
  }
}
```

- [ ] **Step 5: Write apps/api/src/auth/current-user.decorator.ts**

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
```

- [ ] **Step 6: Modify apps/api/src/main.ts — mount auth middleware**

Replace `apps/api/src/main.ts` with:

```ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AuthMiddleware } from './auth/auth.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mount Better Auth under /api/auth (native Express middleware)
  const authMiddleware = app.get(AuthMiddleware);
  app.use('/api/auth', (req, res, next) => authMiddleware.use(req, res, next));

  await app.listen(3000);
  console.log('Praxis API running on http://localhost:3000');
}

bootstrap();
```

- [ ] **Step 7: Modify apps/api/src/app.module.ts — register middleware and guard**

Replace `apps/api/src/app.module.ts` with:

```ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller.js';
import { databaseProvider } from './db/index.js';
import { AuthMiddleware } from './auth/auth.middleware.js';
import { AuthGuard } from './auth/auth.guard.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController],
  providers: [
    databaseProvider,
    AuthMiddleware,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
```

Wait — registering AuthGuard globally via `APP_GUARD` protects ALL routes including `/api/auth` and `/api/health`. That's wrong. We need the guard only on business routes, not on auth or health routes.

**Fix:** Don't use `APP_GUARD`. Instead, create a `@Public()` decorator to skip auth, or apply guard only on module controllers. Since modules (notes/tasks/exams/identity) will each get their own guard, the cleanest approach: remove `APP_GUARD`, create a `@Public()` decorator, and use a global guard that checks for `@Public()`.

But for this foundation phase, simpler: don't register globally. Let each protected module import the guard. Health stays unprotected.

Replace step 7's code with:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller.js';
import { databaseProvider } from './db/index.js';
import { AuthMiddleware } from './auth/auth.middleware.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController],
  providers: [databaseProvider, AuthMiddleware],
})
export class AppModule {}
```

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/auth/ apps/api/src/types/ apps/api/src/main.ts apps/api/src/app.module.ts
git commit -m "feat(api): add Better Auth integration with guard and middleware

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Empty module boundaries

**Files:**
- Create: `apps/api/src/modules/notes/notes.module.ts`
- Create: `apps/api/src/modules/notes/notes.controller.ts`
- Create: `apps/api/src/modules/tasks/tasks.module.ts`
- Create: `apps/api/src/modules/tasks/tasks.controller.ts`
- Create: `apps/api/src/modules/exams/exams.module.ts`
- Create: `apps/api/src/modules/exams/exams.controller.ts`
- Create: `apps/api/src/modules/identity/identity.module.ts`
- Create: `apps/api/src/modules/identity/identity.controller.ts`
- Modify: `apps/api/src/app.module.ts` — import the four modules

**Consumes:** Task 4 (AuthGuard available, middleware mounted)

**Produces:** `GET /api/notes` returns 401 without session; each module route exists. With a valid session, each returns `{ module: "<name>" }`.

- [ ] **Step 1: Write notes module**

`apps/api/src/modules/notes/notes.controller.ts`:
```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';

@Controller('api/notes')
@UseGuards(AuthGuard)
export class NotesController {
  @Get()
  status() {
    return { module: 'notes' };
  }
}
```

`apps/api/src/modules/notes/notes.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller.js';

@Module({
  controllers: [NotesController],
})
export class NotesModule {}
```

- [ ] **Step 2: Write tasks module**

`apps/api/src/modules/tasks/tasks.controller.ts`:
```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';

@Controller('api/tasks')
@UseGuards(AuthGuard)
export class TasksController {
  @Get()
  status() {
    return { module: 'tasks' };
  }
}
```

`apps/api/src/modules/tasks/tasks.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller.js';

@Module({
  controllers: [TasksController],
})
export class TasksModule {}
```

- [ ] **Step 3: Write exams module**

`apps/api/src/modules/exams/exams.controller.ts`:
```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';

@Controller('api/exams')
@UseGuards(AuthGuard)
export class ExamsController {
  @Get()
  status() {
    return { module: 'exams' };
  }
}
```

`apps/api/src/modules/exams/exams.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller.js';

@Module({
  controllers: [ExamsController],
})
export class ExamsModule {}
```

- [ ] **Step 4: Write identity module**

`apps/api/src/modules/identity/identity.controller.ts`:
```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';
import { CurrentUser } from '../../auth/current-user.decorator.js';

@Controller('api/identity')
@UseGuards(AuthGuard)
export class IdentityController {
  @Get()
  status(@CurrentUser() user?: { id: string; email: string; name: string }) {
    return { module: 'identity', userId: user?.id ?? null };
  }
}
```

`apps/api/src/modules/identity/identity.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller.js';

@Module({
  controllers: [IdentityController],
})
export class IdentityModule {}
```

- [ ] **Step 5: Register modules in AppModule**

Modify `apps/api/src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller.js';
import { databaseProvider } from './db/index.js';
import { AuthMiddleware } from './auth/auth.middleware.js';
import { NotesModule } from './modules/notes/notes.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';
import { ExamsModule } from './modules/exams/exams.module.js';
import { IdentityModule } from './modules/identity/identity.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotesModule,
    TasksModule,
    ExamsModule,
    IdentityModule,
  ],
  controllers: [HealthController],
  providers: [databaseProvider, AuthMiddleware],
})
export class AppModule {}
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/ apps/api/src/app.module.ts
git commit -m "feat(api): add empty module boundaries for notes, tasks, exams, identity

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Common layer — exception filter & Zod pipe

**Files:**
- Create: `apps/api/src/common/filters/global-exception.filter.ts`
- Create: `apps/api/src/common/pipes/zod-validation.pipe.ts`
- Modify: `apps/api/src/main.ts` — register global filter

**Consumes:** Task 2 (NestJS app)

**Produces:** All HTTP errors return the standard shape `{ statusCode, message, errorCode, requestId, timestamp }`. Zod pipe is available for future modules.

- [ ] **Step 1: Write apps/api/src/common/filters/global-exception.filter.ts**

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message =
        typeof exResponse === 'string'
          ? exResponse
          : (exResponse as Record<string, unknown>).message != null
            ? String((exResponse as Record<string, unknown>).message)
            : exception.message;
      errorCode = this.statusToErrorCode(status);
    } else {
      console.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message.join('; ') : message,
      errorCode,
      requestId: `req_${uuidv4()}`,
      timestamp: new Date().toISOString(),
    });
  }

  private statusToErrorCode(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
    };
    return map[status] ?? 'INTERNAL_SERVER_ERROR';
  }
}
```

- [ ] **Step 2: Write apps/api/src/common/pipes/zod-validation.pipe.ts**

```ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }
    const messages = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    throw new BadRequestException(messages);
  }
}
```

- [ ] **Step 3: Register global filter in main.ts**

Modify `apps/api/src/main.ts`:

```ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AuthMiddleware } from './auth/auth.middleware.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());

  const authMiddleware = app.get(AuthMiddleware);
  app.use('/api/auth', (req, res, next) => authMiddleware.use(req, res, next));

  await app.listen(3000);
  console.log('Praxis API running on http://localhost:3000');
}

bootstrap();
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/common/ apps/api/src/main.ts
git commit -m "feat(api): add global exception filter and Zod validation pipe

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Testing infrastructure & e2e tests

**Files:**
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/test/setup.ts`
- Create: `apps/api/test/health.e2e-spec.ts`
- Create: `apps/api/test/auth/auth.e2e-spec.ts`

**Consumes:** Task 5 (modules exist), Task 6 (global filter shapes errors)

**Produces:** `pnpm --filter @praxis/api test` runs and passes both test files.

- [ ] **Step 1: Write apps/api/vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    setupFiles: ['./test/setup.ts'],
    env: {
      DATABASE_URL: 'postgresql://localhost:5432/praxis_test',
    },
  },
});
```

- [ ] **Step 2: Write apps/api/test/setup.ts**

```ts
import { beforeAll, afterAll } from 'vitest';

// Set env before any imports read from process.env
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://localhost:5432/praxis_test';

beforeAll(() => {
  console.log('Test database:', process.env.DATABASE_URL);
});

afterAll(() => {
  // cleanup if needed
});
```

- [ ] **Step 3: Write apps/api/test/health.e2e-spec.ts**

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter.js';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
```

- [ ] **Step 4: Write apps/api/test/auth/auth.e2e-spec.ts**

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/notes without session returns 401 with standard error shape', async () => {
    const res = await request(app.getHttpServer()).get('/api/notes');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      errorCode: 'UNAUTHORIZED',
    });
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('requestId');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body.requestId).toMatch(/^req_/);
  });

  it('GET /api/health is not protected', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
```

- [ ] **Step 5: Run tests**

```bash
pnpm --filter @praxis/api test
```

Expected: 3 tests pass (health test, 401 shape test, health-not-protected test).

Note: The 401 test exercises the auth guard and the global exception filter together.

- [ ] **Step 6: Commit**

```bash
git add apps/api/vitest.config.ts apps/api/test/
git commit -m "test(api): add e2e tests for health and auth guard

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Final wiring & verification

**Files:**
- No new files. Verify all pieces work together.

**Consumes:** All previous tasks.

**Produces:** Clean test run. Dev server starts without errors.

- [ ] **Step 1: Run full test suite**

```bash
pnpm --filter @praxis/api test
```

Expected: All tests pass.

- [ ] **Step 2: Verify dev server boots clean**

```bash
timeout 5 pnpm --filter @praxis/api dev 2>&1 || true
```

Expected: "Praxis API running on http://localhost:3000" with no errors.

- [ ] **Step 3: Verify TypeScript compilation**

```bash
pnpm --filter @praxis/api exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A
git status
# If clean, done. If there are changes, review and commit:
git commit -m "chore(api): final wiring and cleanup

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---
