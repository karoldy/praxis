# Pattern recipes

Load the row you picked from SKILL.md. Each recipe is the minimum that makes
the illegal value uncompilable.

## 1. Discriminated union

When: loading / success / error / empty, draft vs published, result vs
failure. Mutually exclusive fields.

```ts
type Result<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
  | { status: 'empty' }

function render(state: Result<User[]>) {
  switch (state.status) {
    case 'loading':
      return spinner()
    case 'success':
      return list(state.data) // data is User[]
    case 'error':
      return errorView(state.message)
    case 'empty':
      return emptyView()
    default:
      return assertNever(state)
  }
}
```

Discriminant is a string literal field (`status`, `kind`, `type`). Do not use
booleans as the tag. Pair with §6.

## 2. `satisfies`

When: a config/object must match a shape, but callers still need the exact
literals (`theme` is `'dark'`, not `'light' | 'dark' | 'system'`).

```ts
type Config = {
  theme: 'light' | 'dark' | 'system'
  colors: Record<string, string>
}

const config = {
  theme: 'dark',
  colors: { primary: '#3d6fe8', secondary: '#7c3aed' },
} satisfies Config

config.theme // 'dark'
config.colors.primary // string, and a typo in `theme` still errors
```

`: Config` widens. `satisfies Config` validates and keeps the value type.
Use `: Config` only when widening is the point (e.g. a public export that
must not leak extra keys).

## 3. Template literal types

When: the legal strings are a cartesian product you control (HTTP method ×
route, `on${Event}`, `--${Token}`).

```ts
type HttpMethod = 'GET' | 'POST' | 'DELETE'
type Route = '/users' | '/orders' | '/products'
type ApiEndpoint = `${HttpMethod} ${Route}`

function callApi(endpoint: ApiEndpoint) {}
callApi('GET /users')   // ok
callApi('PATCH /users') // error
```

Open-ended user input stays `string` (parse it). Do not union 50 ad-hoc
literals by hand when a template can multiply two small unions.

## 4. Branded types

When: mixing two primitives is an incident — userId vs orderId, 元 vs 分,
seconds vs milliseconds, email vs raw string.

```ts
declare const brand: unique symbol
type Brand<T, B extends string> = T & { readonly [brand]: B }

type UserId = Brand<string, 'UserId'>
type OrderId = Brand<string, 'OrderId'>
type Cents = Brand<number, 'Cents'>

function asUserId(id: string): UserId {
  return id as UserId // only `as` in the codebase for this brand
}

function deleteOrder(id: OrderId) {}
deleteOrder(asUserId('user-42')) // error
```

Brand at the boundary (API parser, form, path param). Never `as UserId` in
business logic. If Zod is already a dependency:

```ts
const UserId = z.string().min(1).brand<'UserId'>()
type UserId = z.infer<typeof UserId>
```

Skip branding when the module has only one such primitive.

## 5. `infer` (stdlib first)

When: you need a piece of a type you do not want to rewrite.

```ts
type User = ReturnType<typeof getUser>
type Payload = Awaited<ReturnType<typeof fetchUser>>
type Args = Parameters<typeof createArticle>
```

Custom `infer` only when the stdlib cannot say it:

```ts
type Unwrap<T> = T extends Promise<infer V> ? V : T
type PropsOf<T> = T extends React.ComponentType<infer P> ? P : never
```

Do not reimplement `ReturnType` / `Awaited` / `Parameters`.

## 6. Exhaustiveness (`assertNever`)

When: any `switch` / if-else chain over a union (especially §1).

```ts
function assertNever(value: never, msg?: string): never {
  throw new Error(msg ?? `unhandled: ${JSON.stringify(value)}`)
}

function render(state: PageState) {
  switch (state.status) {
    case 'loading':
      return spinner()
    case 'success':
      return list(state.data)
    case 'error':
      return errorView(state.message)
    default:
      return assertNever(state)
  }
}
```

If someone adds `{ status: 'empty' }` to `PageState` and forgets a `case`,
`state` in `default` is not `never` → compile error. Put `assertNever` at
every match site, not just the first renderer.

## 7. Mapped types

When: the same rename or filter applies to every key, and there are enough
keys that listing them is the bug.

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type FunctionKeys<T> = {
  [K in keyof T as T[K] extends (...args: never[]) => unknown ? K : never]: T[K]
}
```

`as NewName` renames. `as never` drops a key. For two or three keys, write
them. Pair with §3 for the new name.

## 8. Type guards

When: a runtime check already happened and the compiler still sees the wide
type.

Predicate — branches stay in-process:

```ts
function isCat(animal: Animal): animal is Cat {
  return animal.kind === 'cat'
}
```

Assertion — failure throws, and every line after is narrowed:

```ts
function assertDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val == null) throw new Error('required value missing')
}

const user = getUser() // User | null
assertDefined(user)
user.name // User
```

Prefer a discriminant field (§1) over a custom guard. Use `asserts` at
trust boundaries (route params, env, parsed JSON). Do not `asserts` to hide
a model that should have been a union.

## 9. `as const` as the source of truth

When: a runtime array/object should define the union, not duplicate it.

```ts
const ROLES = ['admin', 'editor', 'viewer'] as const
type Role = (typeof ROLES)[number] // 'admin' | 'editor' | 'viewer'

const ROUTES = { home: '/', users: '/users', profile: '/profile' } as const
type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
```

Adding `'guest'` to `ROLES` adds it to `Role`. Never write `type Role =
'admin' | 'editor' | 'viewer'` next to the array.

Without `as const`, the array is `string[]` and the union cannot be derived.

## 10. Conditional types

When: a literal argument changes the return (or input) shape, and that
difference is part of the public contract.

```ts
type UserResponse<T extends boolean> = T extends true
  ? { user: User; posts: Post[] }
  : { user: User }

function fetchUser<T extends boolean>(
  id: string,
  includePosts: T,
): Promise<UserResponse<T>> {
  /* ... */
}

const withPosts = await fetchUser('123', true)
withPosts.posts // Post[]
const without = await fetchUser('123', false)
without.posts // error
```

```ts
type ArticleInput<M extends 'draft' | 'publish'> = M extends 'publish'
  ? { title: string; content: string; publishedAt: Date }
  : { title: string; content?: string }
```

Pitfall: a wide `boolean` / `string` generic keeps both branches. The
caller must pass a literal (`true`, `'publish'`), or the function must take
`T extends boolean` and be called with a literal. If the flag is a real
runtime `boolean` variable, split into two functions or return the union.

Skip this pattern when two named functions (`fetchUser` / `fetchUserWithPosts`)
are clearer.

## Combos that stay cheap

| Combo | Why |
|-------|-----|
| §1 + §6 | Model the states, then lock every match site |
| §9 + derived union | Data owns the type; no second list |
| §2 + §9 | `as const` object `satisfies` a wider Config |
| §4 + §8 | Predicate/parser at the boundary returns the brand |
| §5 + §10 | Conditional result, then `Awaited<ReturnType<...>>` |

If a combo needs more than one helper type besides the domain names, stop and
check whether two functions would do.
