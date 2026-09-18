# 知行（Praxis）数据库模型与系统设计

日期：2026-09-18
状态：待用户评审

## 1. 产品定位

知行是一套知识体系集群，围绕「学 → 做 → 考 → 记」的学习闭环组织内容，共用一个后端。

四大中心（首期实现学习 / 考试 / 文档；任务中心本轮不做）：

| 中心 | 职责 | 首期 |
|------|------|------|
| 学习中心 | 笔记与学习材料的输入、整理、回顾 | ✅ |
| 考试中心 | 测验、考试与练习 | ✅ |
| 文档中心 | 文档与知识的沉淀、管理 | ✅ |
| 任务中心 | 学习任务、待办与进度跟踪 | ⏸ 后续

## 2. 仓库结构（非 Monorepo）

> 不是 Monorepo / workspace 架构。三个目录各自独立工程，不通过 pnpm workspace 或共享代码包统一管理，仅在 HTTP 契约层衔接。

```text
praxis/
├── api/         NestJS API       (Drizzle + Better Auth)
├── web/         Vite + React     (独立工程)
├── app/         React Native (Expo) — 预留
└── docs/       设计与品牌文档
```

命名约定：用户侧品牌**知行**，工程名 **Praxis**。环境变量前缀 `PRAXIS_`。

## 3. 技术栈

| 层 | 选型 |
|----|------|
| 后端 | NestJS · TypeScript |
| 数据库 | PostgreSQL |
| ORM | Drizzle |
| 认证 | Better Auth + Drizzle adapter |
| Web 前端 | Vite + React + TypeScript |
| App | React Native (Expo) — 预留 |
| 多语言 | 支持 sc（简中）/ tc（繁中）/ en（英文），数据库层 i18n（独立翻译表） |

## 4. 权限模型

目标：去 RBAC，采用**资源归属 + 单超级管理员**的简化访问控制。

- **超级管理员**：全表仅 1 个（唯一约束），拥有全部资源的一切操作。
- **全局共享**：所有资源全局可见（public read）。
- **编辑 / 删除**：仅 `created_by` 等于当前用户，或当前用户为超级管理员。
- **普通用户**：只能编辑 / 删除自己创建的资源，可查看所有人资源。

校验落点：在后端改 / 删操作处校验 `resource.created_by === 当前用户 || 当前用户.isSuperAdmin`；前端据此隐藏不可编辑的入口。

## 5. 数据模型

### 5.0 全局约定

- 每个业务表含 `id`、`created_by`、`created_at`、`updated_at`。`created_by` 指向 Better Auth 的 `user.id`；鉴权用户表本身不含 `created_by`。主键用自增或 UUID 见实施阶段确定。
- **多语言（i18n）采用方案 2：独立翻译表**。支持语言：`sc`（简体中文）、`tc`（繁体中文）、`en`（英文）。需要本地化文本的实体，其主表只保留非语言字段，文本字段抽取到 `主表名_i18n` 翻译表，主键为 `(实体_id, locale)`，locale ∈ {sc, tc, en}。查询时按当前语言取行，缺失时回落到默认语言（default_locale）或任一可用语言。
- 题型、优先级、状态等枚举值不做数据库 i18n，由前端 UI 翻译层处理。

### 5.0.1 软删除（逻辑删除）

- 业务主表（notes、note_folders、question_banks、questions、options、papers、documents、doc_folders、tags）增加 `deleted_at` 时间戳字段。`NULL` = 未删除；有值 = 已删除。
- 默认查询过滤：`WHERE deleted_at IS NULL`。唯一约束若涉及（如同名标签），软删后需能重建同名，实现时用部分唯一索引（`WHERE deleted_at IS NULL`）解决。
- **不做软删除的表**：`_i18n` 翻译表（依附主表，随主表 deleted_at 过滤，不加字段）；`resource_tags`（关联表）；`attempts` / `attempt_answers`（作答记录是历史事实，硬保留）；`paper_questions` / `paper_question_options`（试卷快照，随试卷生命周期）；`user_profile`。
- **删除权限**：创建者本人或超管可将资源置 `deleted_at`（逻辑删除）。
- **恢复权限（不对称）**：仅超管可恢复已删除项（清除 `deleted_at`）。普通用户即使 `created_by` 是自己，也不能恢复自己已删除的资源。超管可查询含已删除的列表并恢复。

### 5.1 公共层

**鉴权用户表（Better Auth 管理）**

用户鉴权由 Better Auth 自动建表，默认 `user` 表含：`id`、`name`、`email`(unique)、`emailVerified`、`image`、`createdAt`、`updatedAt`。此外 Better Auth 自动创建 `session`、`account`、`verification`、`oauthAccount` 等表。这些表不在本模型手写，由 Better Auth + Drizzle adapter 管理。

**user_profile（业务用户资料，方案 A 扩展表）**
| 字段 | 说明 |
|------|------|
| id | PK |
| userId | FK → Better Auth user.id（unique，一对一） |
| display_name | 昵称（可回落到 Better Auth 的 name） |
| avatar_url | 头像，可空（可回落到 image） |
| is_super_admin | boolean（全表 ≤1 个 true，约束/逻辑保障） |
| created_at / updated_at | 审计字段 |

> `user_profile` 通过 `userId` 与 Better Auth 的 `user` 表一对一关联，不侵入 Better Auth 维护的表，保证其 schema 与升级兼容。

**tags（主）**：`id`、`created_by`。
**tags_i18n**（PK：tag_id + locale）：`tag_id`、`locale`、`name`。

**resource_tags**：通用多对多打标签：`resource_type`(enum)、`resource_id`、`tag_id`。

### 5.2 学习中心（笔记）

**notes（主）**
| 字段 | 说明 |
|------|------|
| id | PK |
| folder_id | FK → note_folders，可空（笔记归入文件夹） |
| created_by / created_at / updated_at | 审计 |

**notes_i18n**（PK：note_id + locale）：`note_id`、`locale`、`title`、`content`(Markdown)、`summary`(可空)。

**note_folders（主）**：`id`、`parent_id`(自引用树，null 为根)、`created_by`。
**note_folders_i18n**（PK：note_folder_id + locale）：`note_folder_id`、`locale`、`name`。

> 学习中心提供**导入接口**（归学习中心），把本地笔记/目录层级写入 notes/note_folders 及对应 i18n，纯一次性写入，不保留来源路径字段。

> 间隔复习（艾宾浩斯）本轮不做，无相关表。

### 5.3 考试中心

**question_banks（主）**：`id`、`created_by`。
**question_banks_i18n**（PK：question_bank_id + locale）：`question_bank_id`、`locale`、`name`、`description`(可空)。

**questions（主）**
| 字段 | 说明 |
|------|------|
| id | PK |
| type | 题型：single_choice / multi_choice / true_false / fill_blank / essay |
| answer | 仅选择题：关联 options.id（全局 id，不 i18n）；非选择题为空 |
| difficulty | 难度，可空 |
| bank_id | FK → question_banks |
| created_by / created_at / updated_at | 审计 |

**questions_i18n**（PK：question_id + locale）：`question_id`、`locale`、`stem`(题干)、`answer`(填空/判断/简答的答案文本；选择题此列为空)、`explanation`(解析，可空)。

> 答案归属约定：**选择题 answer 存 options.id 在主表**（全局 id，不 i18n）；**填空/判断/简答的 answer 是文本，存 i18n 表**。按题型二选一分布。

**options（主）**：`id`、`question_id`(FK)、`is_correct`、`seq`(顺序)。仅选择题使用。
**options_i18n**（PK：option_id + locale）：`option_id`、`locale`、`text`。

**papers（主）**：`id`、`created_by`。
**papers_i18n**（PK：paper_id + locale）：`paper_id`、`locale`、`title`、`description`(可空)。

**paper_questions（主，试卷题目快照 方案 A）**：`id`、`paper_id`(FK)、`question_id`(FK，仅溯源)、`type`(题型)、`score`(分值)、`order`(排序)。
**paper_questions_i18n**（PK：paper_question_id + locale，快照文本）：`paper_question_id`、`locale`、`stem`、`answer`(选择题关联快照选项 id/或文本按题型)、`explanation`(可空)。

> 组卷时把题目文本按三语快照进 i18n，之后题库改动不影响已组试卷；作答逻辑读快照 i18n。答案按题型同 questions 约定。

**paper_question_options（主，快照选项）**：`id`、`paper_question_id`(FK)、`seq`(顺序)。
**paper_question_options_i18n**（PK：paper_question_option_id + locale）：`paper_question_option_id`、`locale`、`text`。

> 快照选项承载多语文本。作答时对的是快照选项 id，而非题库 options。

**attempts**：`id`、`paper_id`(FK，必填，仅试卷作答，无练习模式)、`user_id`(FK)、`started_at`、`submitted_at`(可空)。

**attempt_answers**：`attempt_id`(FK)、`paper_question_id`(FK)、`user_answer`(关联快照选项 id 串)、`is_correct`。答题明细（user_answer 本身是选项 id 串或文本，非实体标题，不需 i18n）。

### 5.4 文档中心

**documents（主）**
| 字段 | 说明 |
|------|------|
| id | PK |
| file_name | 原文件名，**不翻译** |
| file_type | 类型枚举：pdf / image / other |
| file_url | 对象存储地址（MinIO 对象 URL / key） |
| mime_type | MIME 类型，可空 |
| file_size | 文件大小（字节），可空 |
| folder_id | FK → doc_folders，可空（文档归入文件夹） |
| created_by / created_at / updated_at | 审计 |

**documents_i18n**（PK：document_id + locale）：`document_id`、`locale`、`name`(用户输入的文档名，可翻译)。

> 文档中心存**文件**（图片、PDF 等），非 Markdown 文本，无 content 字段。`file_name` 是原始文件名不翻译；`name` 是用户输入的文档名（进 i18n）。文件存储用 **MinIO**（Docker 部署，对象存储）。提供上传接口（写入 MinIO + documents 记录 + i18n），普通用户可上传；删除/改归属自己或超管。

**doc_folders（主）**：`id`、`parent_id`(自引用树)、`created_by`。
**doc_folders_i18n**（PK：doc_folder_id + locale）：`doc_folder_id`、`locale`、`name`。

> 笔记与文档**分开两张表**（用户确认），不做合并。版本历史 / 回收站本轮不做。

## 6. 核心关系

```text
BetterAuth user ─┬─< resource_tags（通用标签）
                 ├─< notes / questions / papers / documents (created_by)
                 ├─< attempts (user_id)
                 └─| user_profile (userId, 超管唯一)

question_banks ─< questions ─< options
papers ─< paper_questions ─< paper_question_options   (快照，question_id 仅溯源)
paper_questions ─< attempt_answers
papers ─< attempts ─< attempt_answers
note_folders / doc_folders 自引用树
notes ─< note_folders (folder_id, 笔记归入文件夹, 支持导入重建目录)

# 每张 i18n 文本表配一个 `_i18n` 翻译表（PK: 实体id + locale），
# 覆盖 notes/note_folders/tags/question_banks/questions/options/
# papers/paper_questions/paper_question_options/documents(name)/doc_folders
```

## 7. 部署约束

体系**只在本地 / 自建服务器运行，不公网暴露**。访问方式：本机 localhost + 局域网可达（其他设备按需访问）。所有服务**不使用默认端口**，映射到自定义高位端口段。

| 服务 | 默认端口 | 本系统端口 |
|------|---------|-----------|
| PostgreSQL | 5432 | 15432 |
| MinIO API | 9000 | 19000 |
| MinIO 控制台 | 9001 | 19001 |
| NestJS 后端 | 3000 | 13000 |
| React 前端（dev） | 5173 | 15173 |

绑定策略：本机访问绑 `127.0.0.1`；局域网访问时相应服务绑 `0.0.0.0` 并由防火墙/白名单限制来源。数据库与对象存储凭据不提交 git（`.env` 管理）。

## 8. 前端需求

### 8.1 技术栈

`Vite + React + React Router + i18n + shadcn/ui（基于 @base-ui/react）+ TailwindCSS + axios + react-query + vitest`

- i18n：前端语言切换 sc / tc / en，与后端数据库 i18n 呼应。
- 组件：**能用 shadcn/ui 就用 shadcn/ui，不重复造轮子**；shadcn 未覆盖的能力（如 FAB、Bottom Sheet 等）才自建。
- 状态：axios 请求 + react-query 服务端状态。

### 8.2 设计风格

- **Google Material Design v3（Material You）**，包括组件与设计理念。
- **主题色：#094dcc**（映射为 M3 的 primary 主色），secondary / surface 等派生色由 #094dcc 推导。
- 视觉落法（组合方案）：**底层交互组件用 shadcn/ui 实现质量，整体视觉风格按 M3 规范 + #094dcc 主题 token**。组件结构近 shadcn，视觉近 M3，二者通过 design token（颜色/圆角/阴影/动效）融合。

### 8.3 布局

- 响应式布局，适配**移动端 / iPad / 桌面**（断点 + 触控交互）。
- 产品形态为 Web（React/Vite），手机/iPad 通过浏览器访问并做响应式适配，不是原生 App。App（RN/Expo）仍为预留。

### 8.4 前端多语言与后端 i18n 的衔接

- 前端按当前 locale 请求后端；后端按 locale 返回对应翻译。前端 UI 文案走 i18n 资源文件，数据文本走后端 i18n 表。

## 9. API 路由约定（后端）

- `/api/notes/*` · `/api/exams/*` · `/api/documents/*` — 三大中心
- `/api/auth/*` — Better Auth

具体端点（CRUD、分页、搜索、打标签）在实施计划阶段展开。

## 10. 实施范围（本轮）

- 建好三大中心（学习/考试/文档）+ 公共层的数据模型（Drizzle schema）
- 数据库迁移初始脚本
- Better Auth + 单超管引导（首个用户设为超管）
- NestJS 模块骨架：auth / notes / exams / documents / common
- 前端：Vite + React 工程初始化，M3（#094dcc）主题 + shadcn/ui + 响应式布局 + i18n + 三大中心页面

## 11. 明确不做的（YAGNI）

- 任务中心（本轮不做，后续再加）
- 间隔复习（艾宾浩斯）
- 文档版本历史 / 回收站
- 多人协作 / 分享链接管控（所有人可见=天然共享）
- 微服务拆分（模块化单体）