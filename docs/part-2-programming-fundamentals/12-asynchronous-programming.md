# Chapter 2.12 — Asynchronous Programming

🟡 **Intermediate** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 6 hours independent work |
| **Prerequisite chapters** | [2.7](07-functions.md), [2.10](10-typescript-fundamentals.md), [2.11](11-error-handling.md) |
| **Next chapter** | [2.13 JSON](13-json.md) |

---

> **This is the most important chapter in Part II.** Nearly every Playwright call returns a Promise. A learner who does not understand this chapter cannot debug a Playwright test — they can only guess. Do not move past it while it still feels unclear.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** the difference between synchronous and asynchronous execution, and **predict** the output order of interleaved operations.
2. **Describe** a Promise and its three states, and **explain** what a function returns when it is declared `async`.
3. **Use** `async` and `await` correctly, including inside loops.
4. **Identify** a missing `await` by reading code, and **describe** its observable symptom.
5. **Choose** between sequential execution and concurrent execution with `Promise.all()`, and **justify** the choice.
6. **Handle** errors in asynchronous code with `try`/`catch` around `await`, and **explain** what an unhandled rejection is.
7. **Explain** why `forEach` with `await` does not do what it appears to do.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Functions, callbacks, and return values | [Chapter 2.7](07-functions.md) |
| Loops, especially `for...of` versus `forEach` | [Chapter 2.6](06-loops.md) |
| Types and generics (`Promise<T>`) | [Chapter 2.10](10-typescript-fundamentals.md) |
| `try`/`catch` and error semantics | [Chapter 2.11](11-error-handling.md) |

---

## C. Concept Explanation

### C.1 Waiting without freezing

Most code you have written runs top to bottom: each line finishes before the next begins. That is **synchronous**.

Some operations take time for reasons outside your program — a network request, a file read, a browser painting a button. Blocking the entire program while they finish would freeze the UI and waste the CPU. JavaScript **starts** the operation, **continues**, and **comes back** when the result is ready. That is **asynchronous**.

A **Promise** is the object that represents the not-yet-available result.

### C.2 Promise states

```text
          pending
         /       \
   fulfilled     rejected
   (has a value) (has a reason)
```

**Settled** means fulfilled or rejected — finished, one way or the other. A Promise settles **once**. You cannot reuse it as a second request.

```ts
function delay(ms: number): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`waited ${ms}ms`), ms);
  });
}
```

You will rarely construct Promises by hand. You will consume them: Playwright, `fetch`, `fs.promises`. You need the states so you can say "this is still pending" instead of "it's broken."

### C.3 `async` always returns a Promise

```ts
async function ready(): Promise<boolean> {
  return true;
}

const value = ready();
console.log(value);            // Promise { true }  — not true
console.log(value instanceof Promise);  // true
```

Marking a function `async` means: whatever you `return` is wrapped in a fulfilled Promise; whatever you `throw` becomes a rejected Promise. The return type is `Promise<T>`, never bare `T`.

### C.4 `await` unwraps

```ts
async function demo(): Promise<void> {
  const text = await delay(50);
  console.log(text);           // "waited 50ms"
}

demo();
```

`await` is allowed only inside `async` functions (or at the top level of an ES module). It **pauses this function** until the Promise settles, then yields the value — or throws if the Promise rejected.

It does not pause the whole program. Other work can run while this function is paused. That is the point.

Reading a type: `Promise<TestResult>` means "eventually a `TestResult`." `await` is how you get the `TestResult`.

### C.5 The missing-`await` bug — three symptoms

Omitting `await` is catastrophic because **nothing looks broken**.

**Symptom 1 — you have a Promise where you wanted a value.**

```ts
const text = delay(50);
console.log(text);             // Promise { <pending> }
```

**Symptom 2 — a Promise is always truthy.**

```ts
async function isReady(): Promise<boolean> {
  return false;
}

if (isReady()) {
  console.log("ready");        // ALWAYS prints — an object is truthy
}

if (await isReady()) {
  console.log("ready");        // does not print
}
```

This is the demo the [instructor notes](instructor-notes.md) tell staff to run live.

**Symptom 3 — an unawaited assertion never fails.**

```ts
// Preview of Playwright — the shape is what matters
async function expectStatus(actual: number, expected: number): Promise<void> {
  if (actual !== expected) {
    throw new Error(`expected ${expected}, got ${actual}`);
  }
}

async function test(): Promise<void> {
  expectStatus(500, 201);      // missing await — the throw is a rejected Promise nobody handles
  console.log("green");        // still runs
}
```

The test function finishes. The rejection happens later as an **unhandled rejection**, or is lost. The test runner may have already recorded a pass. **Your test went green while verifying nothing.**

This single failure mode is why this chapter exists before Playwright.

**How to spot it when reading:** every call that returns `Promise<...>` needs `await` (or to be returned, or passed to `Promise.all`). If the next line uses the result as a boolean, a number, or a field (`result.id`), and there is no `await`, that line is the bug.

### C.6 Sequential `await` in `for...of`

```ts
async function createAll(users: string[]): Promise<void> {
  for (const user of users) {
    await createUser(user);    // each waits for the previous
  }
}
```

Order is guaranteed. Total time is the sum. Use this when each step needs the previous result, or when the server cannot take parallel writes.

### C.7 `Promise.all` — concurrent, ordered results

```ts
const [a, b, c] = await Promise.all([
  fetchResult("t1"),
  fetchResult("t2"),
  fetchResult("t3"),
]);
```

All three start together. You wait for the **slowest**. Results stay in argument order, not finish order.

If **any** Promise rejects, `Promise.all` rejects immediately. The others may still be in flight.

```ts
const settled = await Promise.allSettled([
  fetchResult("t1"),
  fetchResult("t2"),
]);
// [{ status: "fulfilled", value }, { status: "rejected", reason }, ...]
```

Use `allSettled` when you want a report of the batch, not a single abort.

### C.8 When concurrency is wrong

| Situation | Sequential | `Promise.all` |
|---|---|---|
| Three independent GETs | Wasteful | Correct |
| POST user, then POST order that needs `user.id` | Correct | **Wrong** — order starts without an id |
| Twenty writes to a rate-limited API | Maybe required | May get 429s |
| Shared cart mutated by two adds | Race | **Wrong** unless the API is safe |

Concurrency is not an optimization you apply by default. It is a claim that the operations do not depend on each other and do not share unsafe state. [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) is the same claim at test-worker scale.

### C.9 Errors: `try`/`catch` around `await`

```ts
async function load(id: string): Promise<Result> {
  try {
    return await fetchResult(id);
  } catch (error) {
    throw new Error(`load(${id}) failed: ${messageOf(error)}`);
  }
}
```

`await` on a rejected Promise **throws**. That is why `try`/`catch` works the same as in [Chapter 2.11](11-error-handling.md). Forgetting `await` means the rejection is *not* thrown here — it becomes an unhandled rejection later.

**Unhandled rejection:** a Promise rejected and nobody `await`ed it or attached `.catch`. In Node it prints a warning and, in modern versions, can fail the process. In a test runner it may or may not fail the test — which is why you never rely on that.

Do not swallow. The [Chapter 2.11](11-error-handling.md) rule still applies.

### C.10 `forEach` + `await` does not wait

You were warned in [Chapter 2.6](06-loops.md). Here is the real code.

```ts
async function broken(users: string[]): Promise<void> {
  users.forEach(async (user) => {
    await createUser(user);
  });
  console.log("done");         // prints BEFORE the creates finish
}
```

`forEach` does not await the Promises its callback returns. It fires all callbacks and returns `undefined`. `"done"` is a lie.

```ts
async function sequential(users: string[]): Promise<void> {
  for (const user of users) {
    await createUser(user);
  }
  console.log("done");
}

async function concurrent(users: string[]): Promise<void> {
  await Promise.all(users.map((user) => createUser(user)));
  console.log("done");
}
```

Those two are honest. Pick based on C.8.

### C.11 `.then` — read, do not write

```ts
delay(50).then((text) => console.log(text)).catch((err) => console.error(err));
```

Older code looks like this. This course uses `async`/`await`. You need to recognize `.then` so a stack overflow answer does not look like a second language.

### C.12 Timeline (order of logs)

```ts
console.log("A");
void delay(0).then(() => console.log("B"));
console.log("C");
// A, C, B
```

Synchronous lines run first. Fulfilled callbacks run after the current stack clears — even with `delay(0)`. Predicting this order is the easy quiz item; applying it to "why did my test finish before the click?" is the job.

---

## D. QA Context

### D.1 Every Playwright API is async

`page.goto`, `locator.click`, `expect(locator).toBeVisible()`, `request.get` — all return Promises. Missing `await` on `expect` is the false-green in C.5 symptom 3, in production form. [Chapter 5.1](../part-5-web-automation-playwright/01-playwright-fundamentals.md) will repeat this. Learn it here, cheaply.

### D.2 Unawaited `expect` — worked shape

```ts
test("checkout", async ({ page }) => {
  await page.goto("/checkout");
  expect(page.getByText("Order confirmed")).toBeVisible(); // missing await
});
```

`toBeVisible()` returns a Promise. Without `await`, the test function ends. Playwright may warn; it may not fail the test. The confirmation never appeared. The report is green. This is the flake-shaped cousin of a false pass: sometimes the UI is fast enough that a later implicit wait saves you, sometimes not.

### D.3 Seeding data with `Promise.all`

```ts
const [buyer, admin, product] = await Promise.all([
  api.createUser({ role: "buyer" }),
  api.createUser({ role: "admin" }),
  api.createProduct({ sku: "LAMP" }),
]);
```

Independent creates: concurrent. Then:

```ts
const order = await api.createOrder({ userId: buyer.id, sku: product.sku });
```

Dependent: sequential. Mixing these up is how you POST an order with `userId: undefined`.

### D.4 "The test finished before the app did"

A large share of flakes have this shape: the test moved on; the UI or API had not. Sometimes the fix is `await` on the action you forgot. Sometimes it is a web-first assertion ([Chapter 5.4](../part-5-web-automation-playwright/04-web-assertions.md)). It is almost never `waitForTimeout`. The mental model is this chapter's: you continued before the Promise you cared about settled.

---

## E. Code Examples

### E.1 Very simple — with and without `await`

```ts
async function show(): Promise<void> {
  console.log(delay(10));          // Promise
  console.log(await delay(10));    // "waited 10ms"
}
```

### E.2 Practical — `if (isReady())`

```ts
async function isReady(): Promise<boolean> {
  return false;
}

async function gate(): Promise<void> {
  if (isReady()) {
    console.log("always");
  }
  if (await isReady()) {
    console.log("never");
  }
}
```

### E.3 QA-oriented — sequential vs `all`, plus a dependency

```ts
async function loadSequential(ids: string[]): Promise<Result[]> {
  const out: Result[] = [];
  for (const id of ids) {
    out.push(await fetchResult(id));
  }
  return out;
}

async function loadConcurrent(ids: string[]): Promise<Result[]> {
  return Promise.all(ids.map((id) => fetchResult(id)));
}

async function userThenOrder(email: string): Promise<Order> {
  const user = await createUser(email);          // must finish
  return createOrder(user.id);                   // needs user.id
  // Promise.all([createUser(email), createOrder(???)]) cannot work
}
```

Time both loaders on six IDs. Concurrent should be close to the slowest ID, not the sum — if your fake `fetchResult` actually delays.

### E.4 Automation-oriented — false pass and `forEach`

```ts
async function falseGreen(): Promise<void> {
  void expectStatus(500, 201);     // not awaited
}

async function foreachTrap(ids: string[]): Promise<void> {
  ids.forEach(async (id) => {
    await fetchResult(id);
  });
}
```

Replace the first with `await expectStatus(...)`. Replace the second with `for...of` or `Promise.all`.

---

## F. Common Mistakes

### F.1 Forgetting `await` on a value

You log a Promise. You store `undefined` from `.id` on a Promise.

### F.2 Forgetting `await` on an assertion

The test cannot fail. See C.5.

### F.3 `await` inside `forEach`

Does not wait. See C.10.

### F.4 `Promise.all` on a dependency chain

The second call starts without the first result.

### F.5 Awaiting a slow independent loop

Correct, but you paid the sum. Use `Promise.all` when C.8 says so.

### F.6 `await` without `async`

Compile error. Add `async` to the function — and then its callers must `await` it too. The keyword spreads upward.

### F.7 Creating a Promise and never awaiting it

Unhandled rejection. `void delay(10)` is an explicit "I am ignoring this" — still usually wrong in tests.

### F.8 `try`/`catch` that swallows a rejected `await`

[Chapter 2.11](11-error-handling.md) again.

### F.9 Removing `await` to "make it faster"

You did not make it faster. You made it incorrect. Concurrency is `Promise.all`, not deleted `await`s.

---

## G. Exercise

Suggested total time: 130 minutes.

### G.1 Easy — Predict the order (20 min)

Predict the print order, then run:

```ts
console.log("1");
void delay(0).then(() => console.log("2"));
console.log("3");
void (async () => {
  console.log("4");
  await delay(0);
  console.log("5");
})();
console.log("6");
```

Write the order before you run. Then explain any miss in one sentence.

### G.2 Medium — Sequential to concurrent (40 min)

Fake `fetchRecord(id)` with a 200ms delay. Load six IDs sequentially; measure. Load them with `Promise.all`; measure. Print both timings.

Then write: a case where your concurrent change would be **incorrect** (dependency, rate limit, or shared mutation). Do not say "if the server is down."

### G.3 Challenge — Bug hunt (70 min)

Eight snippets (write them in `bugs.ts`). Each has a missing or misplaced `await`, a `forEach` trap, or a bad `Promise.all`. For **each**:

1. State the observable symptom **before** you fix it.
2. Fix it.
3. One line: why the symptom matches the bug.

At least one snippet must be the `if (isReady())` shape, one an unawaited "assertion," one `forEach`, one dependent `Promise.all`.

This is the assignment's sibling. If you cannot do this, you cannot debug Playwright.

---

## H. Coding Assignment

### Assignment 2.12 — Concurrent result loader

**Objective.** Fetch results for many IDs in sequential and concurrent modes, handle per-item failures without aborting the batch, measure both modes, and explain when each is appropriate.

**Required AI usage log.** Per the [AI policy](../00-course-overview/05-ai-policy.md#4-required-ai-usage): introduce a bug on purpose (a missing `await` or `forEach`), ask an AI to explain it, record whether the explanation was right, and fix it yourself. Submit `AI-USAGE.md`.

**Deliverable.** `assignment-2-12/loader.ts`, `demo.ts`, `AI-USAGE.md`.

```ts
export interface LoadOk { id: string; status: "ok"; durationMs: number }
export interface LoadErr { id: string; status: "error"; message: string }
export type LoadItem = LoadOk | LoadErr;

export function fakeFetch(id: string, failIds?: Set<string>): Promise<{ id: string; durationMs: number }>
export function loadSequential(ids: string[], failIds?: Set<string>): Promise<LoadItem[]>
export function loadConcurrent(ids: string[], failIds?: Set<string>): Promise<LoadItem[]>
```

`fakeFetch` delays 80–150ms (deterministic from `id.length` is fine) and rejects if `id` is in `failIds`.

Both loaders: return one `LoadItem` per id, **same order as `ids`**. A failure becomes `LoadErr`, not a throw from the loader. Sequential uses `for...of`. Concurrent uses `Promise.allSettled` (or `all` + per-item `try`).

`demo.ts` runs both on 8 ids including 2 failures, prints counts, prints elapsed ms for each mode, and asserts (via `throw`) that order matches `ids`.

**Requirements.**

| # | Requirement |
|---|---|
| 1 | No `forEach` + `await` |
| 2 | Concurrent is measurably faster on 8 delayed fetches |
| 3 | Failures do not abort the batch |
| 4 | Order preserved |
| 5 | `try`/`catch` around `await` only to convert to `LoadErr`, not to swallow |
| 6 | `AI-USAGE.md` in the course format |
| 7 | `tsc --noEmit` clean |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Correct async | 25% | Awaited; no `forEach` trap; order held |
| Batch errors | 20% | Per-item `LoadErr`; loader does not throw on a single fail |
| Concurrency judgment | 20% | Concurrent faster; comment on when sequential is required |
| AI log | 20% | Real bug, real prompt, verdict on the explanation |
| Types and purity | 15% | Discriminated `LoadItem`; no `any` |

> **AI usage: required log**, still **restricted on implementation**. The AI may explain *your* bug. It may not write `loadConcurrent`.

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-2/12-asynchronous-programming.answers.md`](../answer-keys/part-2/12-asynchronous-programming.answers.md).

**1.** What are the three Promise states?

- A) start, middle, end
- B) pending, fulfilled, rejected
- C) async, await, then
- D) true, false, unknown

**2.** `async function f(): Promise<boolean> { return false; }` — what is `Boolean(f())`?

- A) `false`
- B) `true` (a Promise object is truthy)
- C) `undefined`
- D) a compile error

**3.** True or false: `await` pauses the entire JavaScript program.

**4.** An unawaited Playwright `expect(...).toBeVisible()` typically:

- A) Always fails the test
- B) May let the test pass without checking visibility
- C) Blocks the browser
- D) Converts the locator to a string

**5.** `users.forEach(async (u) => { await create(u); }); console.log("done");` — when does `"done"` print?

- A) After every create
- B) Before the creates finish
- C) Never
- D) Only if `users` is empty

**6.** When is `Promise.all` the wrong choice?

- A) Always
- B) When the second operation needs the first operation's result
- C) When operations are independent GETs
- D) When you have fewer than three Promises

**7.** `await` on a rejected Promise:

- A) Returns `undefined`
- B) Throws, so `try`/`catch` can handle it
- C) Retries
- D) Converts to `null`

**8.** `Promise.all` result order is:

- A) Finish order
- B) Argument order
- C) Random
- D) Alphabetical by id

**9.** What is an unhandled rejection?

- A) A compile error
- B) A Promise that rejected with no `await` or `.catch`
- C) A failed assertion
- D) A 404

**10.** You remove `await` to make a test faster. What did you actually do?

- A) Made it concurrent correctly
- B) Made it incorrect; the work may not finish before the next line
- C) Enabled `Promise.all`
- D) Nothing observable

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Promise | A value that will fulfill or reject later |
| `async` | This function returns a Promise |
| `await` | Pause *this* function until settle; unwrap or throw |
| Missing `await` | Promise-as-value; always-truthy; assertions that cannot fail |
| `for...of` + `await` | Sequential, ordered, honest |
| `Promise.all` | Concurrent; argument order; fails fast |
| `allSettled` | Concurrent; report every outcome |
| `forEach` + `await` | Does not wait |
| Unhandled rejection | Nobody was listening when it failed |

### Mistakes recap

Missing `await` · unawaited `expect` · `forEach` · `all` on dependencies · swallow · delete `await` for speed.

### Competency check

> **Can you scan an unfamiliar async file and spot every missing `await`, and say what each one would do to a test?**

Do G.3's eight snippets again tomorrow without notes. If you miss the `if (isReady())` case, reread C.5.

**Gate:** do not proceed to Part IV until this is comfortable. The bug hunt is cheaper now than in Week 18.

---

[← 2.11 Error Handling](11-error-handling.md) · [Next: 2.13 JSON →](13-json.md)
