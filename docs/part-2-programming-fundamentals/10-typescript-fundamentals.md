# Chapter 2.10 — TypeScript Fundamentals

🟡 **Intermediate** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [2.7](07-functions.md), [2.8](08-arrays.md), [2.9](09-objects.md) |
| **Next chapter** | [2.11 Error Handling](11-error-handling.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Apply** type annotations and **explain** when inference is sufficient.
2. **Define** type aliases and interfaces, and **justify** a house rule for choosing between them.
3. **Model** a value with a union type, and **narrow** it safely before use.
4. **Use** optional properties, readonly properties, and enums (or union literals) appropriately.
5. **Write** a simple generic function and **explain** what the type parameter buys you.
6. **Read** a TypeScript compiler error and **translate** it into plain language.
7. **Explain** the cost of `any` and **replace** an `any` with a correct type.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Primitives, arrays, objects | [Chapters 2.2](02-data-types.md), [2.9](09-objects.md) |
| Typed function signatures | [Chapter 2.7](07-functions.md) |
| Array methods over arrays of objects | [Chapter 2.8](08-arrays.md) |

---

## C. Concept Explanation

### C.1 Types are free assertions

TypeScript is JavaScript plus a description of what your values are supposed to be, checked **before the code runs**. That check is the cheapest test you will ever have: no environment, no browser, no CI minutes. It catches a misspelled property, a string where a number was expected, a field that might be absent — at the moment you type, not at 2 a.m. in a pipeline.

Types **compile away**. The JavaScript that runs has no interfaces left in it. So types do not validate an API response at runtime. They validate *your* code against the shape you claimed. That gap is the subject of [Chapter 2.13](13-json.md) and [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md). Learn it now: **the compiler is not a contract test.**

### C.2 Annotations versus inference

```ts
const passed = 40;                 // inferred as number
const label: string = "GREEN";     // annotated
function add(a: number, b: number): number {
  return a + b;
}
```

**Annotate boundaries. Trust inference in the middle.**

| Annotate | Infer |
|---|---|
| Function parameters and return types | `const x = 5` |
| Exported objects and public models | Locals assigned from typed functions |
| Empty arrays (`const ids: string[] = []`) | `const ids = ["a", "b"]` |

An untyped empty array becomes `never[]` — you cannot `push` a string onto it. That is the one local you should annotate.

### C.3 `type` versus `interface` — house rule

```ts
interface TestResult {
  name: string;
  status: TestStatus;
  durationMs: number;
  error?: { message: string };
}

type TestStatus = "passed" | "failed" | "skipped" | "blocked";
```

**House rule for this course:**

- **`interface`** for object shapes (entities, request/response bodies, fixtures).
- **`type`** for unions, aliases, and function types.

They overlap. Interfaces can `extend`; type aliases can use unions and mapped types. Do not spend energy on edge cases. Pick the rule, hold it, and your suite will look like one person wrote it.

### C.4 Union types and literal types

```ts
type TestStatus = "passed" | "failed" | "skipped" | "blocked";
type Environment = "local" | "staging" | "production";

function label(status: TestStatus): string {
  // status is not an arbitrary string
}
```

A **literal type** is a specific value used as a type (`"passed"`). A **union** is a set of those. Together they model a closed set.

`status: string` would accept `"PASS"`, `"ok"`, and `"timedOut"`. The union makes those a compile error at the *write* site — unless the value came from `JSON.parse`, which is `any` and bypasses this. Types protect code you type. They do not protect the network.

### C.5 Narrowing

A union is useful only if you **narrow** it before using a member that is not on every variant.

```ts
function durationLabel(value: number | null): string {
  if (value === null) {
    return "n/a";
  }
  return `${value}ms`;   // value is number here
}
```

Common narrowing tools:

| Check | Narrows |
|---|---|
| `typeof x === "string"` | primitives |
| `x === null` / `x == null` | null / nullish |
| `typeof x === "object" && x !== null` | objects (careful: arrays are objects) |
| `"error" in result` | objects that have that key |
| `Array.isArray(x)` | arrays |

**Discriminated unions** — a shared field that identifies the variant — are the form you want for results:

```ts
type Result =
  | { status: "passed"; durationMs: number }
  | { status: "failed"; durationMs: number; error: { message: string } }
  | { status: "skipped"; reason: string };

function errorText(result: Result): string {
  if (result.status === "failed") {
    return result.error.message;   // safe — only failed has error
  }
  return "none";
}
```

After `result.status === "failed"`, TypeScript knows the other fields. That is the payoff.

### C.6 Exhaustive `switch`

```ts
function actionFor(status: TestStatus): string {
  switch (status) {
    case "passed":
      return "none";
    case "failed":
      return "investigate";
    case "skipped":
      return "review skip";
    case "blocked":
      return "unblock";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
```

`never` means "this should be impossible." Add `"timedOut"` to `TestStatus` and the `default` assignment fails to compile — every `switch` written this way becomes a todo list. [Project 2](../projects/project-2-test-case-management.md) requires this. Graders will add a status and ask which files break.

If you omit `default` and cover every current case, TypeScript may already treat the switch as exhaustive under `strict`. The `never` default makes the failure *local and obvious* when the union grows.

### C.7 Optional and `readonly`

```ts
interface TestCase {
  readonly id: string;
  title: string;
  owner?: string;
}
```

`owner?` means the property may be absent (`string | undefined`). `readonly id` means you cannot assign `id` after creation — a type-level lock, compiled away, not a runtime freeze.

```ts
const tc: TestCase = { id: "TC-1", title: "login" };
// tc.id = "TC-2";   // compile error
tc.title = "logout"; // allowed
```

Use `readonly` on identifiers you generate and never want overwritten. Use optional for fields that are genuinely optional, not for "we might forget to set this."

### C.8 Enums versus union literals

```ts
enum StatusEnum {
  Passed = "passed",
  Failed = "failed",
}

type StatusUnion = "passed" | "failed";
```

**This course uses union literals**, not enums. Reasons: they serialize to JSON without mapping, they exhaust in `switch` cleanly, and they do not produce a runtime object. Numeric enums have surprising reverse mappings. If you meet an enum in a library, you can read it; do not introduce one in your suite without a reason you can defend.

### C.9 Function types

```ts
type Predicate<T> = (item: T) => boolean;

function countWhere<T>(items: T[], matches: Predicate<T>): number {
  return items.filter(matches).length;
}
```

You already wrote this in [Chapter 2.7](07-functions.md). The type alias names the callback so signatures stay short.

### C.10 Generics — one good example, then a wrapper

A generic is a function (or type) parameterized by another type.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const name = first(["login", "checkout"]);  // string | undefined
const n = first([1, 2, 3]);                 // number | undefined
```

Without `T`, you would return `any` or write `firstString` / `firstNumber`. `T` preserves the item type.

The automation-shaped example:

```ts
interface ApiResponse<T> {
  status: number;
  data: T;
}

function unwrap<T>(response: ApiResponse<T>): T {
  if (response.status >= 400) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.data;
}

const order = unwrap<Order>(response);  // T is Order — or inferred from response
```

Stop there. Do not write a generic unless you have two concrete call sites that would otherwise duplicate.

### C.11 Utility types worth knowing now

```ts
type UserDraft = Partial<User>;           // every field optional — factory overrides
type UserEmail = Pick<User, "id" | "email">;
type UserPublic = Omit<User, "password">;
type Counts = Record<TestStatus, number>; // keys are the union, values are numbers
```

`Partial` is the factory override type in [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md). `Record<TestStatus, number>` forces you to provide every status when you initialize a counts object — another exhaustiveness tool.

### C.12 `any`, `unknown`, and `as`

| Type | Meaning |
|---|---|
| `any` | Turn off checking. The value can do anything. **Banned without a one-line justification.** |
| `unknown` | "We have a value and we do not know its type." You must narrow before using it. |
| `as TestResult` | A **claim**, not a check. The compiler believes you. Runtime does not care. |

```ts
const parsed = JSON.parse(text);           // any
const claimed = JSON.parse(text) as TestResult;  // still no check
const unknownParsed: unknown = JSON.parse(text);
// unknownParsed.name  // compile error — you must narrow first
```

`any` is how a `durationMs` string from JSON survives into an addition and becomes concatenation. Replacing `any` with a real type is not paperwork. It is removing a lie.

### C.13 Reading compiler errors

Three you will see constantly:

**1. `Type 'string' is not assignable to type 'number'`.**
You passed or assigned the wrong kind of value. Look at the annotated site, not the use site.

**2. `Object is possibly 'undefined'`.**
You read a property that the type says might be missing (`find`, optional field, array index). Narrow or provide a default.

**3. `Argument of type 'X' is not assignable to parameter of type 'Y'`.**
The function does not accept what you offered. Either the argument is wrong or the signature is.

Translate each error into: *what did I claim, what did I provide, where is the mismatch?* Do not add `as` or `any` to make the line go green. That is disabling the test.

### C.14 `tsconfig` essentials

This course uses `strict: true`. That flag turns on `strictNullChecks`, `noImplicitAny`, and several others. Do not turn them off to silence an error. Empty `noImplicitAny` is how `any` sneaks in without you writing the word.

You do not need to memorize the rest of `tsconfig.json`. You need to refuse to weaken `strict`.

---

## D. QA Context

### D.1 Models are executable documentation

An `interface Order` with `items: LineItem[]` and `discount?: Discount` is a document the compiler keeps honest. When the API adds `giftWrap`, the interface change fails every unupdated caller. That is [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md).

### D.2 Unions for statuses, environments, roles

```ts
type Environment = "local" | "staging" | "production";
type Role = "buyer" | "admin";
```

A typo `"prodution"` is a compile error. A config object typed `Record<Environment, string>` cannot forget production.

### D.3 Typed fixtures and `Partial`

```ts
function buildUser(overrides: Partial<User> = {}): User {
  return { id: "u1", email: "buyer@shop.test", role: "buyer", ...overrides };
}
```

Autocomplete on `overrides` is why newcomers can use a framework. `Partial` is the type that makes that true.

### D.4 `JSON.parse` is where types stop

The compiler believes `as Order`. The network sent an HTML error page. Your test then reads `.id` of a string and fails in a way that looks like a product bug. Runtime validation is not optional. This chapter teaches you to *stop claiming*; [Chapter 2.13](13-json.md) teaches you to *check*.

---

## E. Code Examples

### E.1 Very simple — the compiler rejects a wrong value

```ts
function setStatus(status: TestStatus): void {
  console.log(status);
}

// setStatus("PASS");   // compile error
setStatus("passed");
```

### E.2 Practical — interface plus union

```ts
interface TestResult {
  name: string;
  status: TestStatus;
  durationMs: number;
}

const row: TestResult = {
  name: "login",
  status: "passed",
  durationMs: 820,
};
```

### E.3 QA-oriented — exhaustive switch, then add a status

```ts
type TestStatus = "passed" | "failed" | "skipped" | "blocked";
// After adding | "timedOut", the default: never line fails.

function bucket(status: TestStatus): "ok" | "action" {
  switch (status) {
    case "passed":
    case "skipped":
      return "ok";
    case "failed":
    case "blocked":
      return "action";
    default: {
      const _: never = status;
      return _;
    }
  }
}
```

### E.4 Automation-oriented — `ApiResponse<T>` and `first`

```ts
interface ApiResponse<T> {
  status: number;
  data: T;
}

function first<T>(items: T[]): T | undefined {
  return items[0];
}

function body<T>(response: ApiResponse<T>): T {
  return response.data;
}

const products = body<Product[]>({ status: 200, data: [/* ... */] });
const featured = first(products);
```

---

## F. Common Mistakes

### F.1 `any` to silence an error

The error was the test. `any` deletes it.

### F.2 `as` to force a shape the data does not have

A claim. Use it only at a boundary you immediately validate.

### F.3 `status: string`

Loses exhaustiveness. Use a union.

### F.4 Annotating every local

Noise. Annotate boundaries.

### F.5 Untyped `[]` becoming `never[]`

`const ids: string[] = []`.

### F.6 Interfaces that describe today's accident

`durationMs: number | string` because JSON sometimes sends a string. That encodes a bug. Parse, then type the *valid* shape.

### F.7 Generics with one call site

Write `firstResult(results: TestResult[])` until you have a second type.

### F.8 Disabling `strict`

You did not fix the type error. You unplugged the alarm.

### F.9 Believing types validate API responses

They do not. See C.1 and D.4.

---

## G. Exercise

Suggested total time: 110 minutes.

### G.1 Easy — Annotate ten sites (20 min)

A file of ten untyped functions and variables is supplied by your instructor (or invent them: pass rate, format duration, a result object, an empty names array, a callback parameter, a union-worthy status, a nullable duration, a `Record` of counts, a `Partial` override, a function return). Add the *minimal* correct annotations. Do not annotate inferred locals.

### G.2 Medium — Model and break a switch (40 min)

Model `TestCase`, `TestRun`, and `Environment` with interfaces and unions. Write `describeStatus(status)` as an exhaustive `switch` with a `never` default. Then add `"timedOut"` to the status union and **do not** update the switch. Paste the compiler error and translate it into one sentence. Then fix the switch.

### G.3 Challenge — Remove every `any` (50 min)

An 80-line module (write one if none is supplied) uses `any` in at least four places: a `JSON.parse` result, a callback parameter, a counts object, and a function return. Replace each `any` with a correct type. Write one paragraph: which `any` was hiding a real bug (invent the bug if needed — e.g. `durationMs` as string), and what the compiler said once you removed it.

---

## H. Coding Assignment

### Assignment 2.10 — Typed QA domain model

**Objective.** Convert Chapter 2.9's models into a fully typed module: interfaces, union literals, optional and readonly fields, one generic helper, an exhaustive status handler, zero `any`, `strict` on. Reused in [Project 2](../projects/project-2-test-case-management.md).

**Deliverable.** `assignment-2-10/domain.ts` and `demo.ts`.

**Required types.**

```ts
export type Priority = "critical" | "high" | "medium" | "low";
export type CaseStatus = "draft" | "active" | "deprecated";
export type ResultStatus = "passed" | "failed" | "skipped" | "blocked";
export type Environment = "local" | "staging" | "production";

export interface TestStep { readonly order: number; action: string; data?: string }
export interface TestCase {
  readonly id: string;
  title: string;
  suite: string;
  priority: Priority;
  status: CaseStatus;
  steps: TestStep[];
  owner?: string;
}
export interface TestResult {
  name: string;
  status: ResultStatus;
  durationMs: number;
  error?: { message: string };
}
export interface TestRun {
  readonly id: string;
  environment: Environment;
  results: TestResult[];
}
```

**Required functions.**

```ts
export function emptyCounts(): Record<ResultStatus, number>
export function countByStatus(results: TestResult[]): Record<ResultStatus, number>
export function describeResult(status: ResultStatus): string  // exhaustive switch
export function first<T>(items: T[]): T | undefined
export function pickResult<K extends keyof TestResult>(
  result: TestResult,
  key: K,
): TestResult[K]
```

`describeResult` must use a `switch` with a `never` default. `emptyCounts` must include every `ResultStatus` key (the compiler will nag if you forget one).

**Requirements.**

| # | Requirement |
|---|---|
| 1 | Zero `any`; zero unjustified `as` |
| 2 | `npx tsc --noEmit` clean under `strict` |
| 3 | Adding `"timedOut"` to `ResultStatus` makes `describeResult` and/or `emptyCounts` fail to compile (document which) |
| 4 | `first` used in `demo.ts` on both `TestCase[]` and `number[]` |
| 5 | House rule respected: interfaces for objects, types for unions |
| 6 | `demo.ts` only printer |

**Self-check.** Add `"timedOut"` locally, run `tsc`, paste the errors into a comment, revert. If nothing failed, the switch is not exhaustive.

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Unions and exhaustiveness | 30% | `never` default; `Record<ResultStatus, number>` complete |
| Modeling | 25% | `readonly` on ids; optional only where specified |
| Generics | 15% | `first` preserves type at both call sites |
| No escape hatches | 15% | No `any`; no lazy `as` |
| House rule and clarity | 15% | Consistent `interface`/`type`; readable names |

> **AI usage: restricted.** Do not ask for the exhaustive `switch` or `emptyCounts`. Those are the lesson.

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-2/10-typescript-fundamentals.answers.md`](../answer-keys/part-2/10-typescript-fundamentals.answers.md).

**1.** In this course, when do you prefer `interface` over `type`?

- A) Always
- B) Object shapes vs unions/aliases
- C) Never
- D) Only for classes

**2.** True or false: TypeScript types are checked again at runtime when an API responds.

**3.** What does `any` do?

- A) Makes the value optional
- B) Turns off type checking for that value
- C) Validates JSON
- D) Forces a deep copy

**4.** `const ids = []` then `ids.push("a")` often fails because:

- A) Arrays cannot grow
- B) `ids` is inferred as `never[]`
- C) `"a"` is not a string
- D) `push` is banned

**5.** A `switch` over `TestStatus` with a `const _: never = status` in `default` — what happens if you add a status to the union and do not update the switch?

- A) Nothing
- B) Runtime crash only
- C) Compile error at the `never` assignment
- D) The new status is treated as `"passed"`

**6.** `as TestResult` after `JSON.parse` means:

- A) The data was validated
- B) You claimed a shape; nothing was checked
- C) TypeScript will throw if the shape is wrong
- D) It converts dates correctly

**7.** Which is the better type for a test status in this course?

- A) `string`
- B) `any`
- C) `"passed" \| "failed" \| "skipped" \| "blocked"`
- D) `enum` with numeric values

**8.** `Partial<User>` is useful for:

- A) Making the user immutable
- B) Factory overrides — every field optional
- C) Removing the email
- D) Runtime validation

**9.** After `if (result.status === "failed")` on a discriminated union, `result.error` is:

- A) Still possibly undefined
- B) Known to exist if `error` is on the failed variant
- C) Always `any`
- D) A compile error

**10.** A `durationMs` field arrives from JSON as `"1240"`. You typed it `number` and cast the parse. What happens?

- A) The compiler rejects the string at runtime
- B) The claim succeeds; `"1240" + 10` may concatenate; the bug is silent at compile time
- C) TypeScript converts it to `1240`
- D) The program will not start

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Types compile away | They check your code, not the network |
| Annotate boundaries | Infer the middle; type empty arrays |
| House rule | `interface` for objects, `type` for unions |
| Union + narrow | Closed set, then prove which member you have |
| Exhaustive `switch` | `never` default finds every forgotten case |
| `readonly` / optional | Lock ids; mark genuine absence |
| Generic | One implementation, preserved item type |
| `Partial` / `Record` | Overrides and complete maps |
| `any` vs `unknown` vs `as` | Off / must-narrow / claim |

### Mistakes recap

`any` to silence · `as` without a check · `status: string` · `never[]` · disabling `strict` · thinking types validate JSON.

### Competency check

> **Can you model an unfamiliar API response as types, and explain what the compiler will and will not protect you from?**

Sketch `Order` from Chapter 2.9 E.4 as interfaces, then say out loud what happens if the server omits `id`.

**Gate:** you are ready for [Chapter 2.11](11-error-handling.md) when you can add a union member and *want* the compiler to fail.

---

[← 2.9 Objects](09-objects.md) · [Next: 2.11 Error Handling →](11-error-handling.md)
