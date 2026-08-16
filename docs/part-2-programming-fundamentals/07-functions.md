# Chapter 2.7 — Functions

🟢 **Beginner** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [2.5](05-conditional-logic.md), [2.6](06-loops.md) |
| **Next chapter** | [2.8 Arrays](08-arrays.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Declare** functions with typed parameters and a typed return value.
2. **Distinguish** returning a value from printing one, and **explain** why returning makes a function testable and composable.
3. **Use** optional parameters, default parameters, and **explain** when each is appropriate.
4. **Write** arrow functions and **explain** their relationship to function declarations.
5. **Explain** scope: where a name exists, and what shadowing does.
6. **Write** pure functions, and **identify** side effects in impure ones.
7. **Pass** a function as an argument to another function, preparing for array methods in [Chapter 2.8](08-arrays.md).

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Types and annotations | [Chapters 2.2](02-data-types.md), [2.3](03-variables-and-constants.md) |
| Conditions and loops | [Chapters 2.5](05-conditional-logic.md), [2.6](06-loops.md) |
| Decomposing a problem into steps | [Chapter 2.1](01-thinking-like-a-programmer.md) |

---

## C. Concept Explanation

### C.1 A function is a named idea

A function takes inputs, does something, and returns a result. That is the input-process-output frame from [Chapter 2.1](01-thinking-like-a-programmer.md), now given a name you can call.

The name matters as much as the reuse. `isCriticalFailure(result)` used **exactly once** is still better than an inline condition, because the name tells the reader what the condition *means*. Functions are how a program is decomposed into ideas rather than instructions.

Beginners think functions exist so you do not type the same code twice. That is a side benefit. The reason they exist is so a 200-line file can be read as ten sentences.

### C.2 Declaration, parameters, arguments, return type

```ts
function add(left: number, right: number): number {
  return left + right;
}

const total = add(2, 3);   // 5
console.log(total);
```

| Word | Meaning in this example |
|---|---|
| `add` | The function's name |
| `left`, `right` | **Parameters** — the names the function uses internally |
| `number, number` | Parameter types |
| `: number` after the `)` | **Return type** — what comes back |
| `2`, `3` | **Arguments** — the values you pass at the call site |
| `return` | Hands a value back to the caller and leaves the function |

Write the return type. If the body stops matching it, the compiler tells you *here*, not at some distant `console.log`. A missing return type is how `undefined` leaks into a total.

### C.3 Returning versus printing

This is the most important distinction in Part II, and the most common defect in [Project 1](../projects/project-1-test-result-analyzer.md).

```ts
// Prints. The caller cannot use the value.
function printPassRate(passed: number, total: number): void {
  const rate = total === 0 ? 0 : (passed / total) * 100;
  console.log(rate);
}

// Returns. The caller decides what to do.
function calculatePassRate(passed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (passed / total) * 100;
}

const rate = calculatePassRate(9, 10);
console.log(`Pass rate: ${rate.toFixed(1)}%`);
if (rate < 90) {
  console.log("Do not promote");
}
```

`printPassRate` can be looked at. `calculatePassRate` can be **reused, composed, and tested**. You can feed it to another function, put it in a table, or assert that `calculatePassRate(9, 10)` is `90`. You cannot assert anything useful about a function whose only output is a line on the screen.

**`void` means "returns nothing useful."** A function with no `return` (or `return;` with no value) yields `undefined`. If you assign that to a variable, you have a silent `undefined` where a number should be.

**Rule:** functions that compute, return. Printing is the caller's job — or a dedicated `formatReport` that *returns a string*, which the caller then prints. That second shape is how Project 1 stays testable: you assert on the string, you do not scrape the terminal.

### C.4 Optional and default parameters

```ts
function formatDuration(ms: number, decimals: number = 0): string {
  const seconds = ms / 1000;
  return `${seconds.toFixed(decimals)}s`;
}

formatDuration(1500);      // "2s"     (0 decimals, rounds)
formatDuration(1500, 2);   // "1.50s"
```

A **default** (`decimals = 0`) means "if the caller omits this, use this value." The parameter is still a `number` inside the function.

```ts
function formatDuration(ms: number, decimals?: number): string {
  const places = decimals ?? 0;
  return `${(ms / 1000).toFixed(places)}s`;
}
```

An **optional** (`decimals?`) means "this might be `undefined`." You must handle `undefined` yourself. Use a default when there is an obvious value. Use optional when absence is information — "the caller did not say" is different from "the caller said 0."

Order constraint: optional and defaulted parameters come **after** required ones. `function f(a?: number, b: number)` is a compile error, because a caller could not skip `a` and still pass `b`.

### C.5 Arrow functions

```ts
function double(n: number): number {
  return n * 2;
}

const doubleArrow = (n: number): number => {
  return n * 2;
};

const doubleShort = (n: number): number => n * 2;
```

The third form has an **implicit return**: no braces, no `return` keyword, the expression *is* the result. One expression only. The moment you need two statements, use braces and an explicit `return`.

```ts
// Implicit return of an object needs parentheses, or `{ name }` is a block
const toRow = (name: string): { name: string } => ({ name });
```

Arrow functions are values. That is why they sit on the right of `const` and why they can be passed as arguments. Function declarations are also values — `double` without `()` is the function, `double(3)` is a call — but arrows are the form you will see inside `filter` and `map`.

For named, reusable helpers, prefer `function` declarations. They are hoisted (you can call them above their definition) and they read as a heading in a file. For short callbacks, prefer arrows.

### C.6 Scope and shadowing

A name exists in the **block** (`{ ... }`) where it was declared, and in nested blocks, and not outside.

```ts
function classify(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "fail") {
    const label = "failed";
    return label;
  }
  return normalized;
}

// console.log(normalized);  // compile error: not in this scope
```

**Shadowing** is declaring a name that already exists in an outer scope:

```ts
const status = "passed";

function demo(): void {
  const status = "failed";   // shadows the outer status
  console.log(status);       // "failed"
}

demo();
console.log(status);         // "passed" — outer one unchanged
```

Legal. Confusing. In a test suite, a shadowed `page` or `request` is a defect that looks like a Playwright bug.

**Globals** — values declared at module top and mutated from functions — are how parallel tests contaminate each other. [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) will make this concrete. The habit starts now: **a function that needs a value takes it as a parameter.** It does not reach out and grab it.

### C.7 Purity and side effects

A **pure** function has two properties:

1. The same inputs always produce the same output.
2. It does not change anything outside itself — no printing, no writing files, no mutating arguments, no reading the clock unless the clock is an input.

```ts
function passRate(passed: number, total: number): number {
  if (total === 0) return 0;
  return (passed / total) * 100;
}
```

Pure. Give it `9, 10` a thousand times, get `90` a thousand times. Test it by calling it.

```ts
let published = false;

function publish(rate: number): void {
  if (rate === 100) {
    published = true;        // mutates outer state
    console.log("published"); // talks to the world
  }
}
```

Impure. To test it you must reset `published`, capture stdout, and pray nothing else touched either. That is setup and teardown — the cost of side effects.

**Side effects are not sins.** A test that clicks a button is nothing *but* side effects. The point is to **put them at the edges** and keep the middle — calculations, classifications, formatting — pure. Project 1 is almost entirely the middle. If your helpers print, you have put the edge in the wrong place.

### C.8 Single responsibility

A function should do one thing you can name in a short phrase. If the name needs "and," it is two functions.

```ts
// Two things, named for one of them
function processResults(results: { status: string; durationMs: number }[]): void {
  let failed = 0;
  for (const result of results) {
    if (result.status === "failed") failed++;
  }
  console.log(`Failed: ${failed}`);
  // ...also writes a file, also sends Slack...
}
```

Split:

```ts
function countFailed(results: { status: string }[]): number { /* ... */ }
function formatFailedCount(count: number): string { /* ... */ }
function writeReport(text: string): void { /* ... */ }
```

The first two are pure and testable. The third is the edge. [Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) will call this layering. It starts as a naming habit.

### C.9 Functions are values — callbacks

A function can be stored and passed, like a number.

```ts
function isFailed(status: string): boolean {
  return status === "failed";
}

const check = isFailed;       // not called — no ()
console.log(check("failed")); // true
```

A **callback** is a function you pass to another function, which calls it later:

```ts
function countWhere(
  items: string[],
  matches: (item: string) => boolean,
): number {
  let count = 0;
  for (const item of items) {
    if (matches(item)) {
      count++;
    }
  }
  return count;
}

const statuses = ["passed", "failed", "failed", "skipped"];

const failed = countWhere(statuses, isFailed);
const skipped = countWhere(statuses, (status) => status === "skipped");

console.log(failed);   // 2
console.log(skipped);  // 1
```

Read the type `(item: string) => boolean` as "a function that takes a string and returns a boolean." That is the same shape as `isFailed`. The arrow passed on the second call is an anonymous version of the same idea.

This is the entire conceptual leap of [Chapter 2.8](08-arrays.md). `results.filter(r => r.status === "failed")` is `countWhere` with a different name, returning the items instead of the count. If this section is foggy, do not start 2.8. Redo E.4 and G.1 until you can say, out loud, "I am passing the *rule*, not the *answer*."

### C.10 Naming

| Kind | Pattern | Examples |
|---|---|---|
| Action | verb + object | `calculatePassRate`, `formatDuration`, `buildTestUser` |
| Predicate | `is` / `has` / `can` | `isFailed`, `hasError`, `canPublish` |
| Factory | `build` / `create` / `make` | `buildTestUser` |
| Formatter | `format` / `toX` | `formatDuration`, `toReportLine` |

Names that say nothing: `processData`, `handle`, `doStuff`, `helper2`, `run`, `go`. If you cannot finish the sentence "this function _____," the name is not done.

A predicate that returns a string is misnamed. `isFailed` returns `boolean`. `failureReason` returns `string`. The prefix is a contract.

---

## D. QA Context

### D.1 Helpers become the utility layer

Every suite grows a `src/support` or `src/utils` folder. The functions in it are this chapter: `calculatePassRate`, `formatDuration`, `isRetryable`. [Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) will tell you they belong below the tests and above nothing. If they print, they cannot sit there — printing is an output edge.

The assignment at the end of this chapter *is* that folder, started early, reused in Project 1.

### D.2 Page object methods are functions

```ts
// Preview of Chapter 6.1 — a method is a function attached to an object
async function submitCheckout(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Place order" }).click();
}
```

The same rules apply: one job, an honest name, parameters instead of globals. A method named `submitCheckout` that also asserts the confirmation number is doing two things — interaction *and* verdict — which is why [Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md) will forbid assertions inside page objects.

### D.3 A factory is defaults plus overrides

```ts
interface TestUser {
  email: string;
  password: string;
  role: "buyer" | "admin";
}

function buildTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    email: `buyer-${Date.now()}@shop.test`,
    password: "CorrectHorse9!",
    role: "buyer",
    ...overrides,
  };
}

const admin = buildTestUser({ role: "admin" });
```

`Partial` arrives properly in [Chapter 2.10](10-typescript-fundamentals.md). The idea is available now: a defaulted object parameter, spread last so the caller wins. This is [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md) in miniature, and it is example E.4.

Unique emails (`Date.now()`) are a side effect — the function is not pure. That is acceptable at the factory edge. Do not put `Date.now()` inside `calculatePassRate`.

### D.4 Pure functions are how you test the test code

You cannot easily unit-test a function that clicks a browser. You can unit-test `classify`, `passRate`, and `formatDuration` in milliseconds, without Playwright, without a server. That is why Project 1 forbids printing inside logic: so the same functions can be reused and so you can prove them with fixtures, the way you proved Assignment 2.5.

---

## E. Code Examples

### E.1 Very simple — add, call, print at the edge

```ts
function add(left: number, right: number): number {
  return left + right;
}

console.log(add(2, 3));   // 5
```

The function does not print. The script does.

### E.2 Practical — print versus return, demonstrated

```ts
function printTotal(passed: number, failed: number): void {
  console.log(passed + failed);
}

function total(passed: number, failed: number): number {
  return passed + failed;
}

printTotal(9, 1);                 // you see 10; you cannot add 1 to it
const executed = total(9, 1);     // 10
const remaining = 40 - executed;  // 30 — composition
```

If `printTotal` is the only version you write, `remaining` is impossible without rewriting.

### E.3 QA-oriented — pass rate and a predicate

```ts
function calculatePassRate(passed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (passed / total) * 100;
}

function isCriticalFailure(result: {
  status: string;
  severity?: string;
}): boolean {
  return result.status === "failed" && result.severity === "critical";
}

console.log(calculatePassRate(9, 10));                          // 90
console.log(isCriticalFailure({ status: "failed", severity: "critical" })); // true
console.log(isCriticalFailure({ status: "failed" }));           // false
```

Two functions, two names, two tests you could write today: `calculatePassRate(0, 0) === 0`, `isCriticalFailure({ status: "passed", severity: "critical" }) === false`.

### E.4 Automation-oriented — factory plus a callback

```ts
interface TestUser {
  email: string;
  password: string;
  role: "buyer" | "admin";
}

function buildTestUser(overrides: {
  email?: string;
  password?: string;
  role?: "buyer" | "admin";
} = {}): TestUser {
  return {
    email: overrides.email ?? "buyer@shop.test",
    password: overrides.password ?? "CorrectHorse9!",
    role: overrides.role ?? "buyer",
  };
}

function countWhere<T>(items: T[], matches: (item: T) => boolean): number {
  let count = 0;
  for (const item of items) {
    if (matches(item)) count++;
  }
  return count;
}

const users = [
  buildTestUser(),
  buildTestUser({ role: "admin", email: "admin@shop.test" }),
  buildTestUser({ role: "buyer", email: "buyer-2@shop.test" }),
];

const admins = countWhere(users, (user) => user.role === "admin");
console.log(admins);   // 1
```

You just used a generic (`<T>`) — a preview of [Chapter 2.10](10-typescript-fundamentals.md). Read it as "this works for any item type." The callback is the point. If you can follow `countWhere(users, (user) => user.role === "admin")`, you are ready for `filter`.

---

## F. Common Mistakes

### F.1 Printing instead of returning

The classic Project 1 defect. `console.log` inside `calculatePassRate` makes the function untestable and uncomposable. Return the number. Format in another function. Print at the edge.

### F.2 Functions that do three things and are named for one

`processResults` that counts, formats, and writes a file. Split until the name does not need "and."

### F.3 No return type

The mistake surfaces at the call site as `undefined`, not at the function. Annotate the return. Let the compiler fail locally.

### F.4 Reaching for outer variables

```ts
let total = 0;
function addFailed(): void {
  total++;   // hidden input, hidden output
}
```

Pass `total` in, return the new value. Hidden state is how tests pass alone and fail together.

### F.5 A long parameter list instead of an object

`function report(p, f, s, b, d, c, env, label)` is unreadable at the call site. One object parameter, named fields.

### F.6 Optional where a default was meant

`decimals?: number` then `decimals ?? 0` is a default in two steps. Write `decimals = 0` unless absence means something other than zero.

### F.7 Names like `doStuff`, `handle`, `process2`

If the name does not finish "this function _____," it is not a name yet.

### F.8 Forgetting that no `return` yields `undefined`

```ts
function double(n: number) {
  n * 2;          // computed, discarded
}
console.log(double(4));   // undefined
```

The compiler catches this if you write `: number`. That is the whole argument for return types.

---

## G. Exercise

Suggested total time: 110 minutes.

### G.1 Easy — Five signatures (25 min)

Implement these exactly. No printing inside any of them.

```ts
function calculatePassRate(passed: number, total: number): number
function formatDuration(ms: number, decimals?: number): string
function isFailed(status: string): boolean
function truncateName(name: string, maxLength: number): string
function shouldRetry(attempt: number, maxAttempts: number, statusCode: number): boolean
```

Rules: pass rate is 0 when `total === 0`; `formatDuration` defaults to 0 decimals and uses seconds; `truncateName` appends `...` only when it actually truncates, and `maxLength` must be at least 4; `shouldRetry` uses the policy from [Chapter 2.5](05-conditional-logic.md) G.3.

Write one call per function that proves the empty/boundary case.

### G.2 Medium — Unprint three functions (35 min)

Here are three functions that print. Convert each to a returning function. Update a small caller so the printed output is identical.

```ts
function showRate(passed: number, total: number): void {
  if (total === 0) {
    console.log("n/a");
    return;
  }
  console.log(`${((passed / total) * 100).toFixed(1)}%`);
}

function showFailures(names: string[]): void {
  if (names.length === 0) {
    console.log("(none)");
    return;
  }
  for (const name of names) {
    console.log(`- ${name}`);
  }
}

function showVerdict(rate: number): void {
  if (rate === 100) console.log("GREEN");
  else if (rate >= 90) console.log("AMBER");
  else console.log("RED");
}
```

Then **compose**: write `function summary(passed: number, total: number, failedNames: string[]): string` that uses your returning versions and returns one multi-line string. The caller prints that string once.

### G.3 Challenge — Extract four functions (50 min)

The script below works. It is also a 60-line paragraph. Extract **at least four** well-named functions with **no behavior change**. Justify each boundary in a comment of one sentence.

```ts
const rows = [
  { name: "login", status: "passed", durationMs: 800 },
  { name: "checkout", status: "failed", durationMs: 2400 },
  { name: "search", status: "skipped", durationMs: 0 },
  { name: "refund", status: "passed", durationMs: 1100 },
];

let executed = 0;
let passed = 0;
let failed = 0;
let duration = 0;
const failedNames: string[] = [];

for (const row of rows) {
  if (row.status !== "skipped") {
    executed++;
    duration += row.durationMs;
    if (row.status === "passed") {
      passed++;
    } else if (row.status === "failed") {
      failed++;
      failedNames.push(row.name);
    }
  }
}

let rateText = "n/a";
if (executed > 0) {
  rateText = `${((passed / executed) * 100).toFixed(1)}%`;
}

console.log("RUN");
console.log(`executed ${executed}`);
console.log(`passed   ${passed}`);
console.log(`failed   ${failed}`);
console.log(`duration ${duration}ms`);
console.log(`rate     ${rateText}`);
console.log("FAILURES");
if (failedNames.length === 0) {
  console.log("(none)");
} else {
  for (const name of failedNames) {
    console.log(`- ${name}`);
  }
}
```

Constraints: no printing inside extracted *compute* functions; at most one function may print, and it must take a string (or a structured report) and print it. If you cannot name a function without "and," keep splitting.

---

## H. Coding Assignment

### Assignment 2.7 — QA helper library

**Objective.** Build a small module of reusable, typed, **pure** helpers that the rest of Part II and [Project 1](../projects/project-1-test-result-analyzer.md) will import. No function in this module prints.

**Deliverable.** `assignment-2-7/qaHelpers.ts` exporting the functions below, plus `assignment-2-7/demo.ts` that imports them and prints a demo (the only file allowed to print).

```ts
export function calculatePassRate(passed: number, total: number): number
export function formatPassRate(passed: number, total: number): string
export function formatDuration(ms: number, decimals?: number): string
export function isFailedStatus(status: string): boolean
export function isExecutedStatus(status: string): boolean
export function normalizeStatus(raw: string | undefined): string
export function normalizeName(raw: string | undefined): string
export function countWhere<T>(items: T[], matches: (item: T) => boolean): number
```

**Behavior.**

| Function | Rules |
|---|---|
| `calculatePassRate` | `total <= 0` → `0`; otherwise `(passed / total) * 100` |
| `formatPassRate` | `total <= 0` → `"n/a"`; otherwise one decimal plus `%`, e.g. `"90.0%"` |
| `formatDuration` | default 0 decimals; format as milliseconds if `ms < 1000` (`"820ms"`), else seconds (`"2.4s"` at 1 decimal when `ms >= 1000` and `decimals` omitted — if `decimals` is provided, use seconds with that many places) |
| `isFailedStatus` | true for `failed`, `fail`, `error` after trim+lowercase |
| `isExecutedStatus` | true for passed/failed aliases; false for skipped/blocked/unknown |
| `normalizeStatus` | trim+lowercase; `undefined` / `""` → `"unknown"` |
| `normalizeName` | trim; missing/blank → `"(unnamed)"` |
| `countWhere` | count items for which `matches` returns true; empty array → `0` |

**Required demo output** (from `demo.ts`, using the helpers — no recalculation in `demo.ts`):

```text
rate      71.4%
duration  2.4s
failed    2
executed  7
unknown   unknown
unnamed   (unnamed)
```

Use this fixture in `demo.ts`:

```ts
const results = [
  { name: "login valid", status: "passed", durationMs: 820 },
  { name: "login invalid", status: "failed", durationMs: 640 },
  { name: "search lamp", status: "passed", durationMs: 1100 },
  { name: "search empty", status: "skipped", durationMs: 0 },
  { name: "add to cart", status: "passed", durationMs: 900 },
  { name: "checkout card", status: "failed", durationMs: 3400 },
  { name: "checkout wallet", status: "passed", durationMs: 2100 },
  { name: "order history", status: "passed", durationMs: 700 },
];
```

`71.4%` is 5/7. `2.4s` is `formatDuration(2400)` (the checkout-card duration, as a single-value demo). `failed` / `executed` come from `countWhere`.

**Requirements.**

| # | Requirement |
|---|---|
| 1 | Every exported function is **pure** — no `console`, no outer mutation, no `Date.now` |
| 2 | Every function has an explicit return type |
| 3 | `countWhere` is used in `demo.ts` for both failed and executed counts |
| 4 | `formatPassRate` uses `calculatePassRate` (or shared logic); do not duplicate the division |
| 5 | Empty / invalid inputs follow the table; no `NaN`, no empty strings from `normalizeName` |
| 6 | No `==` except `== null` |
| 7 | `npx tsc --noEmit` clean under `strict`; no `any` |

**Constraints.**

- No array methods from Chapter 2.8 (`filter`/`map`/`reduce`). `countWhere` is the callback practice; implement it with `for...of`.
- Do not throw. Invalid input becomes the documented default.

**Suggested approach.**

1. Write `calculatePassRate` and `formatPassRate` first; prove `0/0` → `0` and `"n/a"`.
2. Write the two predicates; prove `" ERROR "` is failed and not executed? — `"error"` *is* executed (it is a failed alias). Document that.
3. Implement `countWhere` and use it immediately in `demo.ts` so the callback is real, not decorative.
4. Only then `formatDuration` — the unit switch is the fiddly part; write three calls (`820`, `2400`, `1000`) before trusting it.

**Acceptance criteria.**

- [ ] `demo.ts` output matches the six lines
- [ ] Helpers contain zero `console` calls
- [ ] `0/0` → `0` and `"n/a"`
- [ ] `countWhere` used twice in the demo
- [ ] `tsc --noEmit` clean

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Purity and return-vs-print | 25% | No printing in helpers; demo is the only edge |
| Degenerate input | 20% | `0` totals, missing names/statuses, empty `countWhere` |
| Callback use | 20% | `countWhere` correct; demo uses it, not a hand-rolled duplicate |
| Types and signatures | 15% | Return types everywhere; no `any` |
| Composition | 10% | `formatPassRate` reuses `calculatePassRate` |
| Naming and focus | 10% | Each function is one honest phrase |

**Self-check.** From a new file, import `calculatePassRate` and log `calculatePassRate(1, 0)`. If you cannot import it, it is not a library yet. If it prints anything besides what *you* logged, it is not pure.

> **AI usage: restricted.**
>
> **Allowed:** "what does `toFixed` do with 2.45," "how do I export a function."
> **Not allowed:** the body of `countWhere`, or a complete `qaHelpers.ts`.
>
> `countWhere` is the callback you must write yourself. Chapter 2.8 is unreadable without it.

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-2/07-functions.answers.md`](../answer-keys/part-2/07-functions.answers.md).

**1.** What does this log?

```ts
function double(n: number): number {
  n * 2;
}
console.log(double(4));
```

- A) `8`
- B) `undefined`
- C) `4`
- D) a compile error, always, even without a return type

**2.** Why is a returning `calculatePassRate` better than a printing one?

- A) It runs faster
- B) The caller can reuse, compose, and test the value
- C) TypeScript forbids `console.log` in functions
- D) Printing is deprecated

**3.** True or false: a function used only once should not exist.

**4.** What is the type of `matches` in `countWhere(items, matches)` as written in C.9?

- A) `boolean`
- B) `string`
- C) `(item: string) => boolean`
- D) `number`

**5.** Which function is pure?

- A) `function f(n: number): number { console.log(n); return n; }`
- B) `function f(n: number): number { return n * 2; }`
- C) `function f(): number { return Date.now(); }`
- D) `function f(arr: number[]): number { arr.push(1); return arr.length; }`

**6.** `function format(ms: number, decimals: number = 0)` — what is `decimals` if the caller writes `format(500)`?

- A) `undefined`
- B) `0`
- C) `500`
- D) a compile error

**7.** A function reads a module-level `let total` and increments it. What is the main problem in a test suite?

- A) It is slower
- B) Hidden shared state; tests can pass alone and fail together
- C) TypeScript will not compile it
- D) `let` is not allowed

**8.** Why is `processData` a poor name?

- A) It is too short
- B) It does not say what is processed or what is produced
- C) Names cannot contain "Data"
- D) It should be camelCase

**9.** What does this log?

```ts
const status = "passed";
function demo(): void {
  const status = "failed";
  console.log(status);
}
demo();
console.log(status);
```

- A) `failed` then `failed`
- B) `passed` then `passed`
- C) `failed` then `passed`
- D) a compile error

**10.** A helper computes a pass rate and also writes the report file. Why is it hard to test?

- A) Pass rates cannot be tested
- B) It has two responsibilities; asserting the rate requires performing the side effect
- C) Files are always empty in tests
- D) It needs a `switch`

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Function | A named input → process → output |
| Return vs print | Compute functions return; the caller (or a formatter) prints |
| `void` / `undefined` | No useful return; easy to leak if the type is missing |
| Default vs optional | "Use this if omitted" vs "omission is a value you must handle" |
| Arrow | A function value; implicit return for one expression |
| Scope | A name lives in its block; do not reach for globals |
| Pure | Same inputs → same output; no outside change |
| Callback | A function passed as an argument, called later |
| Name | A short honest phrase; predicates start with `is`/`has`/`can` |

### Mistakes recap

Printing from compute functions · "and" functions · no return type · hidden outer state · `processData` · forgetting `return` · starting 2.8 without understanding callbacks.

### Competency check

> **Can you look at a function and say what it takes, what it returns, whether it is pure, and whether its name is honest?**

Do it on `publish` from C.7 and `countWhere` from C.9. If you cannot explain `countWhere`'s second parameter, stop and redo E.4 before [Chapter 2.8](08-arrays.md).

This chapter is load-bearing. Array methods are callbacks with names. Page objects are functions with a `this`. Factories are defaults plus overrides. If returning versus printing is still fuzzy, Project 1 will be a rewrite, not a project.

---

[← 2.6 Loops](06-loops.md) · [Next: 2.8 Arrays →](08-arrays.md)
