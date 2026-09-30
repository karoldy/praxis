---
name: typescript-type-safety
description: >
  Write and review TypeScript so illegal states cannot compile. Apply
  discriminated unions, satisfies, branded types, as const, exhaustiveness
  checks, type guards, template-literal types, mapped types, infer, and
  conditional types. Use when writing or reviewing TypeScript/TS/TSX, designing
  types, fixing type errors, modeling page/async state, or when the user wants
  类型安全, 可辨识联合, 品牌类型, 资深 TS, or "make illegal states
  unrepresentable". Use when the user runs /typescript-type-safety.
when-to-use: >
  TypeScript, TSX, 写 TS, 类型安全, 可辨识联合, 品牌类型, discriminated
  union, branded type, satisfies, as const, assertNever, type guard
argument-hint: "[write|review]"
metadata:
  short-description: "Make illegal TypeScript states unrepresentable"
---

# TypeScript type safety

Types are a logic firewall, not labels. If a bug is still a legal value, the
type is a comment. Make that value unrepresentable.

Stay on this skill for the whole TypeScript task. Off only when the user
switches away. New and changed code must follow it; do not rewrite untouched
files unless asked.

Argument: `review` → run the checklist on the diff and stop. Anything else
(including empty) → write with these rules.

## Default move

Before adding a type, name the combinations that must be impossible. Encode
those as unrepresentable.

First choice for exclusive states: a discriminated union with a `status` (or
`kind`) tag. Never a bag of optional fields.

```ts
// rejected — loading + error + data can all be set
type PageState = { data?: User[]; error?: string; loading?: boolean }

// required
type PageState =
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; message: string }
```

`data` exists only on success. `message` exists only on error. A page that
spins and errors at the same time cannot be typed.

## Pattern picker

Use the first matching row. Do not stack mapped/conditional types on a
two-field object. Recipes: `references/patterns.md`.

| When | Use |
|------|-----|
| Mutually exclusive states | Discriminated union |
| `switch` / if-chain over a union | `assertNever` on the leftover |
| Runtime list/map should own the union | `as const` + `typeof x[number]` |
| Check a value against a type without widening | `satisfies T` |
| Same primitive, different meaning (ids, 元/分, s/ms) | Brand at the I/O boundary |
| Runtime check the compiler will not honor | `x is T` or `asserts x is T` |
| Structured strings (method × route, event names) | Template literal types |
| Same rename/filter on every key | Mapped type (`as`, `never` to drop) |
| Need fn return / params / Promise inner | `ReturnType` / `Parameters` / `Awaited` |
| Return shape depends on a literal argument | Conditional type on a generic |

## Hard rules

1. Exclusive states are a union. Optional-field "state" objects are invalid.
2. Every union match is exhaustive. The leftover branch is `never`. Adding a
   member must fail the build at every unmatched site.
3. One source of truth. Runtime constants get `as const`; types are derived.
   Do not keep a string union beside an array of the same strings.
4. Brand at the boundary. Parse once (API, form, route param), then pass
   branded values. The only `as Brand` lives inside the constructor. If Zod is
   already in the project, `z.string().brand<'UserId'>()` is the constructor.
5. `as` / `!` that invent fields or skip null are bugs. Narrow or remodel.
6. Do not widen literals still needed downstream. Prefer `satisfies` or
   `as const` over `: WideType`.
7. Stdlib utilities first: `ReturnType`, `Awaited`, `Parameters`,
   `NonNullable`, `Pick`, `Omit`, `Extract`, `Exclude`. Custom `infer` only
   when those cannot express it.

## Review checklist

Flag each of these on changed TypeScript. Fix the model; do not add a runtime
`if` that papers over a state the type still allows.

- Optional-field state that allows loading + error + data together
- Bare `string` / `number` used for two domain ids or two units
- String union duplicated next to a runtime array
- `: Type` on an object that erased a literal the caller needed
- Union `switch` / if-else with no `never` leftover
- `as` / `!` silencing null or a missing field
- Conditional return type whose generic is wide `boolean` (both branches live)

Review output: location, illegal state still representable, pattern that
closes it. No finding → say so in one line.

## Output

The illegal call must be a compile error. Do not leave comments of the form
"data is only present on success" — that belongs in the type.

If a pattern would be cleverer than the code needs, skip it and say so in one
line.
