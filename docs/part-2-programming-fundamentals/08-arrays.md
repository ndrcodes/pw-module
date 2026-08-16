# Chapter 2.8 — Arrays

🟡 **Intermediate** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 2 sessions (180 min) + 6 hours independent work |
| **Prerequisite chapters** | [2.6](06-loops.md), [2.7](07-functions.md) |
| **Next chapter** | [2.9 Objects](09-objects.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Access** and **modify** array contents using indexing, `push`, `pop`, `shift`, and `unshift`.
2. **Search** arrays using `includes`, `indexOf`, and `find`, and **choose** correctly between them.
3. **Transform** arrays using `filter` and `map`, and **explain** why `map` returns while `forEach` does not.
4. **Interrogate** arrays using `some` and `every`, and **express** QA questions as one or the other.
5. **Sort** arrays safely, **explain** that `sort` mutates and compares as strings by default, and **write** a comparator.
6. **Aggregate** arrays using `reduce`, and **identify** the accumulator and initial value.
7. **Chain** array methods to answer a multi-part question about test data readably.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| **Functions as values, and callbacks** | [Chapter 2.7](07-functions.md) — hard prerequisite |
| Loops and iteration | [Chapter 2.6](06-loops.md) |
| Arrays as a type; type annotations | [Chapters 2.2](02-data-types.md), [2.3](03-variables-and-constants.md) |

If you cannot yet explain what it means to pass a function to another function, return to [Chapter 2.7](07-functions.md) first. Everything in this chapter depends on it.

---

## C. Concept Explanation

### C.1 An array is the QA data structure

A test run is an array of results. A search response is an array of products. A data-driven scenario is an array of input cases. Everything you will ever want to know about a run is a question about an array: how many failed, which ones, what was the slowest, did any exceed the timeout, what is the total duration.

The first half of this chapter is mechanical: indexing, adding, removing, searching. The second half changes how you write code. `filter`, `map`, `find`, `some`, `every`, `sort`, and `reduce` are loops with names. They take a function as an argument — the callback from [Chapter 2.7](07-functions.md). Prefer them not for brevity but for **intent**: `results.filter(isFailed).map(r => r.name)` states what you want. A loop states how to get it. Test code is read under stress. Intent is worth a great deal.

Two sharp edges, early: **`sort` mutates** and sorts numbers as strings unless you give it a comparator. **`map` returns**; if you ignore the return, you wanted `forEach`.

### C.2 Creating, typing, indexing

```ts
const statuses: string[] = ["passed", "failed", "skipped"];
const empty: number[] = [];

console.log(statuses[0]);        // "passed"
console.log(statuses[2]);        // "skipped"
console.log(statuses[3]);        // undefined — not a crash
console.log(statuses.length);    // 3
```

Indexes start at 0. The last item is `length - 1`. Out-of-range access is `undefined`, which is why off-by-ones from [Chapter 2.6](06-loops.md) are quiet.

```ts
const last = statuses[statuses.length - 1];
```

Prefer `string[]` over `Array<string>` in this course. Same type; one house style.

### C.3 Adding and removing

| Method | Where | Returns | Mutates? |
|---|---|---|---|
| `push(item)` | end | new length | yes |
| `pop()` | end | removed item | yes |
| `unshift(item)` | start | new length | yes |
| `shift()` | start | removed item | yes |
| `splice(start, count)` | middle | removed items | yes |

```ts
const names = ["login", "checkout"];
names.push("refund");            // ["login", "checkout", "refund"]
const last = names.pop();        // last === "refund"
```

`push`/`pop` at the end are cheap and common. `shift`/`unshift` at the start move every item; fine for small arrays, a smell on a 10,000-row report.

**In test code, prefer building a new array over mutating a shared one.** Mutation of a fixture that two tests share is how suites fail only under `--workers=4`. [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) will show the flake. The habit starts here: `const next = [...names, "refund"]` instead of `names.push("refund")` when `names` is not yours alone.

### C.4 Search: `includes`, `indexOf`, `find`

```ts
const statuses = ["passed", "failed", "skipped"];

statuses.includes("failed");     // true
statuses.indexOf("failed");      // 1
statuses.indexOf("blocked");     // -1  (not found — not undefined)
```

`includes` answers "is it here?" `indexOf` answers "where?" and uses `-1` for absence — a number you will eventually treat as a real index if you forget to check.

`find` takes a callback and returns the **first matching item**, or `undefined`:

```ts
const results = [
  { name: "login", status: "passed" },
  { name: "checkout", status: "failed" },
];

const firstFailure = results.find((r) => r.status === "failed");
// { name: "checkout", status: "failed" }

const firstBlocked = results.find((r) => r.status === "blocked");
// undefined
```

Use `includes` for primitives. Use `find` for objects — `includes` will not find `{ name: "login" }` unless it is the *same* object in memory. Use `findIndex` when you need the position of an object.

Always handle `undefined`. `firstFailure.name` crashes when nothing failed.

### C.5 `filter` — select a subset

```ts
const results = [
  { name: "login", status: "passed", durationMs: 800 },
  { name: "checkout", status: "failed", durationMs: 2400 },
  { name: "search", status: "skipped", durationMs: 0 },
];

const failed = results.filter((r) => r.status === "failed");
// [{ name: "checkout", status: "failed", durationMs: 2400 }]
```

`filter` returns a **new** array. The original is unchanged. The callback is a predicate: return `true` to keep the item.

```ts
function isFailed(r: { status: string }): boolean {
  return r.status === "failed";
}

const failed = results.filter(isFailed);
```

Same thing. The named predicate is what you already wrote in [Chapter 2.7](07-functions.md). An empty source produces an empty result, not `undefined` and not an error. That is why empty-run handling in Project 1 is mostly "filter, then look at `.length`."

### C.6 `map` — transform every item

```ts
const names = results.map((r) => r.name);
// ["login", "checkout", "search"]

const labels = results.map((r) => `${r.name}: ${r.status}`);
```

`map` returns a **new** array of the same length. Every item becomes something else. If you do not use the return value, you wanted `forEach`:

```ts
results.map((r) => {
  console.log(r.name);    // works, but you built an array of undefined and threw it away
});

results.forEach((r) => {
  console.log(r.name);    // honest: a side effect, no result
});
```

This is the [instructor notes](instructor-notes.md) misconception: "`map` and `forEach` are interchangeable." They are not. `map` returns. `forEach` discards.

### C.7 `some` and `every` — yes/no questions

```ts
const anyFailed = results.some((r) => r.status === "failed");   // true
const allPassed = results.every((r) => r.status === "passed");  // false
```

| Question | Method |
|---|---|
| Did **any** test fail? | `some` |
| Did **all** tests pass? | `every` |
| Is the run empty of failures? | `!results.some(isFailed)` or `results.every(r => r.status !== "failed")` |

On an **empty** array: `some` is `false` (nothing matched), `every` is `true` (nothing failed the rule — "vacuous truth"). That surprises people and is correct. A run with zero tests has no failures (`every` "all passed" is true) and also no passes worth celebrating. Project 1 treats that as `NO DATA`, not `GREEN` — you still have to check `.length === 0` first.

### C.8 `sort` — mutates, and sorts strings by default

```ts
const numbers = [1, 10, 2];
numbers.sort();
console.log(numbers);   // [1, 10, 2]  — wait, [1, 10, 2] sorted as strings is [1, 10, 2]
```

Actually:

```ts
[1, 10, 2].sort();      // [1, 10, 2]  — "1", "10", "2"  ("10" < "2" as strings)
[1, 10, 2].sort((a, b) => a - b);   // [1, 2, 10]
```

**Default `sort` converts to string and compares.** `"10" < "2"` because `"1" < "2"`. Always pass a comparator for numbers.

**`sort` mutates the array it is called on** and also returns it. Sorting a shared fixture reorders it for every later test.

```ts
const byDuration = [...results].sort((a, b) => b.durationMs - a.durationMs);
```

Copy first (`[...]` or `.slice()`), then sort. The original run order stays intact.

Multi-key: failed first, then slowest:

```ts
const ranked = [...results].sort((a, b) => {
  if (a.status === "failed" && b.status !== "failed") return -1;
  if (b.status === "failed" && a.status !== "failed") return 1;
  return b.durationMs - a.durationMs;
});
```

A comparator returns negative if `a` comes first, positive if `b` comes first, `0` if they tie.

### C.9 `reduce` — built from a loop you already know

You have written this:

```ts
let total = 0;
for (const r of results) {
  total += r.durationMs;
}
```

`reduce` is that loop, with the running total (the **accumulator**) and the **initial value** (`0`) made explicit:

```ts
const total = results.reduce((acc, r) => acc + r.durationMs, 0);
```

| Piece | In the loop | In `reduce` |
|---|---|---|
| Running total | `total` | `acc` |
| Starting point | `let total = 0` | the `0` after the comma |
| Update | `total += r.durationMs` | `return acc + r.durationMs` |
| Each item | `r` | `r` |

**Always pass the initial value.** Without it, `reduce` uses the first item as the accumulator, which is wrong for an empty array (it throws) and wrong when the item is an object and you wanted a number.

Grouping — the other shape you will actually use:

```ts
const byStatus = results.reduce(
  (acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>,
);
// { passed: 1, failed: 1, skipped: 1 }
```

If `reduce` feels like a puzzle, write the `for` loop first, then translate. That is how this course teaches it, and it is how you should debug it.

### C.10 Chaining

```ts
const slowFailedNames = results
  .filter((r) => r.status === "failed")
  .filter((r) => r.durationMs >= 2000)
  .map((r) => r.name);
```

Read top to bottom: keep failures, keep slow ones, take names. Each method returns an array (except `reduce`/`find`/`some`/`every`), so they compose.

A chain that needs a comment to explain it is too long. Three steps is usually fine. Six is a function with a name.

```ts
function slowFailedNames(results: Result[]): string[] {
  return results
    .filter((r) => r.status === "failed" && r.durationMs >= 2000)
    .map((r) => r.name);
}
```

Two filters that are one idea should be one predicate. Do not chain for the sake of chaining.

### C.11 Empty arrays

| Expression | Empty array yields |
|---|---|
| `.length` | `0` |
| `.filter(...)` | `[]` |
| `.map(...)` | `[]` |
| `.find(...)` | `undefined` |
| `.some(...)` | `false` |
| `.every(...)` | `true` |
| `.reduce(fn)` (no init) | **throws** |
| `.reduce(fn, 0)` | `0` |

Design for the empty run first. Project 1's empty fixture exists because of this table.

---

## D. QA Context

### D.1 Project 1 is this chapter

[Project 1](../projects/project-1-test-result-analyzer.md) asks for counts, rates, failed names, slowest tests, and an empty-run story. Every one of those is `filter` / `map` / `reduce` / a copy-then-`sort`. If you solve Project 1 with index-`for` loops only, it will work and it will miss the point: the rubric asks for array methods where they are the natural expression.

### D.2 Asserting on arrays in API responses

```ts
// Preview of Chapter 4.3
const names = products.map((p) => p.name);
expect(names).toContain("Aeron Desk Lamp");
expect(products.every((p) => p.price > 0)).toBe(true);
expect(products.some((p) => p.stock === 0)).toBe(true);
```

`every` is "every item is valid." `some` is "at least one is out of stock." `map` then `toContain` is membership on a derived field. You will write these exact shapes for [Project 3](../projects/project-3-api-automation.md).

### D.3 Data-driven cases are arrays

```ts
const cases = [
  { subtotal: 99.99, shipping: 4.99 },
  { subtotal: 100.0, shipping: 0 },
  { subtotal: 100.01, shipping: 0 },
];
```

The array is the specification. A loop *inside one test* over this array is still one test (Chapter 2.6 D.2). The later form is `test.each(cases)`. The data shape does not change.

### D.4 Shared mutation is a parallel flake

```ts
const shared = ["buyer@shop.test", "admin@shop.test"];

// Test A
shared.sort();                 // mutates shared

// Test B, running at the same time, expected original order
expect(shared[0]).toBe("buyer@shop.test");  // fails if A sorted first
```

Copy before you sort. Do not `push` onto a fixture. Build new arrays. This is the same independence rule as [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md), at the data-structure level.

---

## E. Code Examples

### E.1 Very simple — index and `push`

```ts
const tests = ["login"];
tests.push("checkout");
console.log(tests[0]);   // "login"
console.log(tests[1]);   // "checkout"
```

### E.2 Practical — `filter` and `map`

```ts
const results = [
  { name: "login", status: "passed" },
  { name: "checkout", status: "failed" },
  { name: "search", status: "failed" },
];

const failedNames = results
  .filter((r) => r.status === "failed")
  .map((r) => r.name);

console.log(failedNames);   // ["checkout", "search"]
```

### E.3 QA-oriented — the questions a run asks

```ts
interface Result {
  name: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
}

function summarize(results: Result[]): {
  executed: number;
  failed: number;
  failedNames: string[];
  totalMs: number;
  anyFailed: boolean;
} {
  const executed = results.filter((r) => r.status !== "skipped");
  const failed = executed.filter((r) => r.status === "failed");
  return {
    executed: executed.length,
    failed: failed.length,
    failedNames: failed.map((r) => r.name),
    totalMs: executed.reduce((acc, r) => acc + r.durationMs, 0),
    anyFailed: failed.length > 0,
  };
}
```

This is a small Project 1. Notice `reduce` has an initial `0`, so an empty `executed` yields `0`, not a throw.

### E.4 Automation-oriented — sort safely, chain, empty

```ts
function slowestNames(results: Result[], n: number): string[] {
  return [...results]
    .filter((r) => r.status !== "skipped")
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, n)
    .map((r) => r.name);
}

console.log(slowestNames([], 3));   // []
```

Copy, filter, sort, slice, map. Five names, one pipeline, empty-safe. Compare with Assignment 2.6, where you were forbidden to `sort` so you would feel the insertion loop. Now you may `sort` — on a copy.

---

## F. Common Mistakes

### F.1 Treating `map` and `forEach` as interchangeable

`map` returns a new array. Ignoring it is wasted work and a lie about intent. Use `forEach` for side effects.

### F.2 `sort` without a comparator, on numbers

`[1, 10, 2].sort()` is lexicographic. Pass `(a, b) => a - b`.

### F.3 `sort` on a shared array

Mutates in place. Copy first.

### F.4 `reduce` without an initial value

Throws on `[]`. Always pass the identity of the accumulation (`0` for sums, `[]` for collected items, `{}` for groups).

### F.5 `find` without handling `undefined`

`results.find(...)!.name` will crash on a clean run. Guard, or use a documented default.

### F.6 `indexOf` === `-1` used as an index

`items[items.indexOf("missing")]` is `items[-1]`, which is `undefined`, not a throw. Check for `-1`.

### F.7 Mutating while filtering in your head

`filter` does not change the source. If you `push` onto the source inside a `map` callback, you are mixing two models. Don't.

### F.8 A chain that is a paragraph

If you cannot read it aloud as a short sentence, extract a function.

---

## G. Exercise

Suggested total time: 130 minutes (this chapter is two sessions).

### G.1 Easy — Same question, three methods (25 min)

Given the `results` array from E.2, produce the failed names using:

1. a `for...of` and `push`
2. `filter` + `map`
3. `reduce`

Then write which version you would commit, and why the other two still matter.

### G.2 Medium — Run statistics (45 min)

Using a run of at least ten results (include skipped, a 0 ms pass, two failures, and a second empty-run call):

Compute, using array methods only (no index-`for`): executed count, pass rate over executed (`n/a` if none), failed names, whether any test exceeded 2000 ms (`some`), whether every executed test has `durationMs >= 0` (`every`), and the slowest three names (copy + `sort` + `slice`).

Print a structured summary. Handle the empty run with the C.11 table, not with luck.

### G.3 Challenge — Eight questions, one method each (60 min)

For each question, write **one expression** (a chain is one expression) and name the method that does the real work. If you reach for a `for` loop, you are answering a different exercise.

| # | Question |
|---|---|
| 1 | How many results are there? |
| 2 | What are the names, in run order? |
| 3 | Which results failed? |
| 4 | Did any test fail? |
| 5 | Did every executed test pass? |
| 6 | What is the total duration of executed tests? |
| 7 | What is the first test slower than 2000 ms, if any? |
| 8 | What are the failed names, sorted alphabetically, without mutating the source? |

Then: take expressions 3, 4, and 8 and compose them into one named function `failedNamesSorted(results)`. Prove it on `[]`.

---

## H. Coding Assignment

### Assignment 2.8 — Result query library

**Objective.** Answer a run's questions with array methods, including empty and single-item runs. This is the computational core of [Project 1](../projects/project-1-test-result-analyzer.md).

**Deliverable.** `assignment-2-8/queries.ts` exporting the functions below, plus `demo.ts` that prints results for two fixtures: the eight-row run from Assignment 2.6, and `[]`.

```ts
export interface Result {
  name: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
}

export function executed(results: Result[]): Result[]
export function failed(results: Result[]): Result[]
export function failedNames(results: Result[]): string[]
export function passRate(results: Result[]): number | null
export function totalDuration(results: Result[]): number
export function anyFailed(results: Result[]): boolean
export function allExecutedPassed(results: Result[]): boolean
export function slowest(results: Result[], n: number): Result[]
export function countByStatus(results: Result[]): Record<string, number>
```

**Rules.**

| Function | Behavior |
|---|---|
| `executed` | status not `skipped` |
| `failed` | status `failed` |
| `failedNames` | names of `failed`, source order |
| `passRate` | passed/executed * 100, or `null` if executed is 0 |
| `totalDuration` | sum of `durationMs` of executed; `0` if none |
| `anyFailed` | `some` |
| `allExecutedPassed` | `every` on executed; **empty executed → `true`** (vacuous); callers who want `NO DATA` check `executed(results).length === 0` themselves |
| `slowest` | copy, exclude skipped, sort by duration desc, take `n`; empty → `[]` |
| `countByStatus` | `reduce` to `{ passed, failed, skipped }` with missing keys as `0` |

**Requirements.**

| # | Requirement |
|---|---|
| 1 | `filter` / `map` / `some` / `every` / `reduce` / copy-then-`sort` used where they are the natural method; no index-`for` |
| 2 | `sort` never called on the input array (copy first) |
| 3 | `reduce` for `totalDuration` and `countByStatus` has an explicit initial value |
| 4 | Empty fixture: `passRate` is `null`, `slowest` is `[]`, `countByStatus` is `{ passed: 0, failed: 0, skipped: 0 }` |
| 5 | Pure functions; no printing in `queries.ts` |
| 6 | `npx tsc --noEmit` clean; no `any` |

**Acceptance criteria.**

- [ ] Eight-row fixture: failed names `login invalid`, `checkout card`; pass rate ≈ 71.428… (you may return the number, `demo.ts` formats it)
- [ ] `slowest(run, 3)` names: checkout card, checkout wallet, search lamp
- [ ] Empty fixture matches the table above
- [ ] `allExecutedPassed([])` is `true`; `passRate([])` is `null`
- [ ] Input arrays have the same order after every call (prove it in `demo.ts` by printing the first name before and after `slowest`)

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Method choice | 25% | The natural method for each question; no disguised loops |
| Empty-run behavior | 25% | Matches C.11; `reduce` initialized; `passRate` null |
| Non-mutation | 20% | Source order preserved; `sort` on a copy |
| Composition | 15% | `failedNames` uses `failed` (or shared filter); no duplicated predicates |
| Types and purity | 15% | Return types; no `any`; no print in the library |

> **AI usage: restricted.**
>
> **Allowed:** "why does `every` on `[]` return true," "what does `slice` return if `n` is larger than length."
> **Not allowed:** the body of `countByStatus` or `slowest`.
>
> `reduce` for grouping and copy-then-`sort` are the two things this assignment exists to make you write.

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-2/08-arrays.answers.md`](../answer-keys/part-2/08-arrays.answers.md).

**1.** What does `[1, 10, 2].sort()` produce?

- A) `[1, 2, 10]`
- B) `[1, 10, 2]`
- C) `[10, 2, 1]`
- D) a compile error

**2.** True or false: `sort` returns a new array and leaves the original unchanged.

**3.** What is the difference between `map` and `forEach`?

- A) There is no difference
- B) `map` returns a new array; `forEach` returns `undefined` and is for side effects
- C) `forEach` is faster
- D) `map` cannot take a callback

**4.** What does `[].every((x) => x > 0)` return?

- A) `true`
- B) `false`
- C) `undefined`
- D) it throws

**5.** What does `[].reduce((a, b) => a + b)` do?

- A) Returns `0`
- B) Returns `undefined`
- C) Throws
- D) Returns `[]`

**6.** You need the first failed result, or to know there was none. Which method?

- A) `filter`
- B) `find`
- C) `map`
- D) `every`

**7.** `results.filter(isFailed).map(r => r.name)` — what does this express?

- A) A count of failures
- B) The names of failed results, in source order
- C) A mutated source array of names
- D) The first failed name

**8.** Why copy before `sort` in a test suite?

- A) `sort` is slow
- B) `sort` mutates; a shared fixture reordered by one test breaks others
- C) TypeScript requires it
- D) Copying sorts twice

**9.** Which method answers "did any test exceed 2000 ms?"

- A) `every`
- B) `some`
- C) `map`
- D) `indexOf`

**10.** A test does `sharedUsers.push(buildTestUser())` on a module-level array. What is the risk?

- A) `push` is deprecated
- B) Shared mutation; later tests (or parallel workers) see leftover users
- C) `buildTestUser` cannot be called twice
- D) Arrays cannot grow

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Index | Starts at 0; out of range is `undefined` |
| `filter` | New array of items that match a predicate |
| `map` | New array of transformed items; use the return |
| `forEach` | Side effects only; discards |
| `find` | First match or `undefined` |
| `some` / `every` | Any? / all? — empty `every` is `true` |
| `sort` | Mutates; default is string compare; copy first |
| `reduce` | Loop with an accumulator; always pass the initial value |
| Chain | A readable pipeline; extract when it needs a comment |

### Mistakes recap

`map` used as `forEach` · `sort` as strings · `sort` in place · `reduce` without init · `find` unchecked · mutating shared fixtures.

### Competency check

> **Given a question about a test run, can you write the answer as a single readable expression, and does it still work when the run is empty?**

Do G.3 questions 4, 6, and 8 without notes. If you write a `for` loop, you can, but you have not finished the chapter.

**Gate:** you are ready for [Chapter 2.9](09-objects.md) when `filter`/`map`/`reduce` are how you *think* the question, not decorations you add after a loop. Project 1 is next after 2.8 in the course calendar; objects (2.9) give the results a typed shape first.

---

[← 2.7 Functions](07-functions.md) · [Next: 2.9 Objects →](09-objects.md)
