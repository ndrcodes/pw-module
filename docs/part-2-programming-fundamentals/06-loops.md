# Chapter 2.6 — Loops

🟢 **Beginner** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [2.4](04-operators.md), [2.5](05-conditional-logic.md) |
| **Next chapter** | [2.7 Functions](07-functions.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Implement** iteration using `for`, `while`, `do...while`, `for...of`, and `forEach`.
2. **Choose** the appropriate loop for a given task and **justify** the choice on readability grounds.
3. **Trace** a loop by hand and **predict** its output, including off-by-one behavior.
4. **Use** `break` and `continue` correctly, and **explain** their effect on control flow.
5. **Identify** and **fix** infinite loops and off-by-one errors.
6. **Explain** why `forEach` cannot be used with `await`, preparing for [Chapter 2.12](12-asynchronous-programming.md).

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Conditions and boolean expressions | [Chapters 2.4](04-operators.md), [2.5](05-conditional-logic.md) |
| Arrays as a value type | [Chapter 2.2](02-data-types.md) |
| Tracing algorithms by hand | [Chapter 2.1](01-thinking-like-a-programmer.md) |

---

## C. Concept Explanation

### C.1 Iteration is the shape of QA work

A loop repeats work. In QA the work is almost always "do this for every item in a collection": every result in a run, every product in a search response, every row in a data table, every environment in a config list.

TypeScript gives you five ways to iterate. They all can produce the same numbers. They do not communicate the same intention. The real learning in this chapter is **choosing**, not typing `for`.

[Chapter 2.8](08-arrays.md) will replace many of these loops with `filter`, `map`, and `reduce`. You still need the loops. Those methods are loops with names, and you cannot choose a name until you can see the loop it replaced.

### C.2 Anatomy of a loop

Every loop has four parts, even when some of them are hidden:

| Part | Job |
|---|---|
| **Initialization** | Set up the starting state (a counter, an index, nothing) |
| **Condition** | Should we run the body again? |
| **Body** | The work |
| **Update** | Change the state so the condition can eventually become false |

If the update is missing or wrong, the condition stays true and the loop never ends. That is an infinite loop, and it is how beginners freeze their terminal.

### C.3 `for` with an index

```ts
for (let i = 0; i < 5; i++) {
  console.log(i);
}
// 0
// 1
// 2
// 3
// 4
```

Read it as: start `i` at 0; while `i` is less than 5, run the body and then add 1.

**When the index is actually needed:**

- You must print or use the position (`Test 3 of 40`).
- You must look at a neighbor (`results[i]` and `results[i - 1]`).
- You must step irregularly (`i += 2`) or walk backwards.

**When it is noise:**

```ts
const names = ["login", "checkout", "refund"];

for (let i = 0; i < names.length; i++) {
  console.log(names[i]);   // you never used i except to get the item
}
```

That is a `for...of` wearing a disguise.

### C.4 Off-by-one

The two classic mistakes:

```ts
const results = ["a", "b", "c"]; // length 3, valid indexes 0, 1, 2

for (let i = 0; i <= results.length; i++) {
  console.log(results[i]);
}
// "a", "b", "c", undefined     <- i becomes 3; 3 is not a valid index
```

`<= results.length` runs one extra time. `i < results.length` is the default for a reason: the last valid index is `length - 1`.

The other direction:

```ts
for (let i = 1; i < results.length; i++) {
  console.log(results[i]);
}
// "b", "c"                     <- skipped index 0
```

**Trace with a table** before you run it.

| i | `i < length`? | body sees |
|---|---|---|
| 0 | 0 < 3 → true | `"a"` |
| 1 | 1 < 3 → true | `"b"` |
| 2 | 2 < 3 → true | `"c"` |
| 3 | 3 < 3 → false | (stop) |

If your table has a row whose body is `undefined`, you have an off-by-one.

### C.5 `for...of`: the readable default

```ts
const names = ["login", "checkout", "refund"];

for (const name of names) {
  console.log(name);
}
```

No index. No `.length`. The loop variable *is* the item. Use `const` for that variable unless you reassign it inside the body.

**This is the only loop in this chapter that cooperates with `await`.** You cannot use that yet, but memorize the sentence: when you later write `for (const user of users) { await createUser(user); }`, the creates happen one after another. The same body inside `forEach` does not wait. Section C.9 and [Chapter 2.12](12-asynchronous-programming.md) exist because of that difference.

If you need the index *and* the item, you can still use `for...of` with `entries()`:

```ts
for (const [index, name] of names.entries()) {
  console.log(`${index + 1}. ${name}`);
}
```

### C.6 `while` and polling

`while` is right when you **do not know** how many times you will iterate.

```ts
let remaining = 3;

while (remaining > 0) {
  console.log(`Retries left: ${remaining}`);
  remaining--;
}
```

The update (`remaining--`) lives in the body. Forget it and the loop is infinite.

The QA-shaped use is **polling**: repeat until the world changes.

```ts
let attempts = 0;
const maxAttempts = 10;
let ready = false;

while (!ready && attempts < maxAttempts) {
  ready = checkHealth();     // imagine this asks a server
  attempts++;
}
```

Two things must be true of every polling loop:

1. **A termination condition that does not depend on success.** `attempts < maxAttempts` is that condition. Without it, a down server loops forever.
2. **An update that can make the condition false.** Here, `attempts++`.

In [Chapter 5.5](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md) you will learn that Playwright already writes this loop for you, correctly, with timeouts. Writing your own polling loop in a test is almost always a defect. Understanding the primitive is still required, because that is what `expect(locator).toBeVisible()` *is*.

### C.7 `do...while`

```ts
let input = "";
do {
  input = readLine();        // imagine this reads the keyboard
} while (input.trim() === "");
```

The body runs **once before** the condition is checked. Use it only when "zero times" is illegal — you must try at least once. In test automation that situation is rare. Prefer `while` unless you can name the reason the first iteration has no condition.

### C.8 `forEach`

```ts
const names = ["login", "checkout", "refund"];

names.forEach((name) => {
  console.log(name);
});
```

This is your first look at a **callback**: a function you pass to another function, which calls it once per item. [Chapter 2.7](07-functions.md) will make that idea precise. For now, read it as "for each name, run this block."

`forEach` is pleasant for simple side effects (printing, pushing into a pre-created array). It has two sharp edges.

**You cannot `break` out of it.** `return` inside the callback skips one item (like `continue`); it does not stop the loop.

```ts
names.forEach((name) => {
  if (name === "checkout") {
    return;                  // skips printing checkout, then continues
  }
  console.log(name);
});
// login
// refund
```

If you need to stop at the first failure, use `for...of` and `break`.

**It does not wait for asynchronous work.** This is the defect that motivates placing this chapter before Playwright.

### C.9 Why `forEach` + `await` is a silent bug

You do not have `async`/`await` yet. You need the shape now, because once you have Playwright you will write this by accident and it will look fine.

```ts
// Preview — you will write the real keywords in Chapter 2.12
//
// users.forEach(async (user) => {
//   await createUser(user);
// });
// console.log("done");
```

`forEach` calls the callback for user 1, does **not** wait, calls it for user 2, does not wait, then immediately runs `console.log("done")`. The creates are still in flight. The test that contains this reports green while the users do not exist.

`for...of` waits:

```ts
// for (const user of users) {
//   await createUser(user);
// }
// console.log("done");          // runs after every create finishes
```

**Rule you can use from today:** if the body might ever need to wait, do not use `forEach`. Use `for...of`. You will not regret the extra four characters.

### C.10 `break` and `continue`

```ts
const results = [
  { name: "login", status: "passed" },
  { name: "checkout", status: "failed" },
  { name: "refund", status: "passed" },
];

for (const result of results) {
  if (result.status === "failed") {
    console.log(`Stopping at first failure: ${result.name}`);
    break;                   // leave the loop entirely
  }
  console.log(`${result.name} ok`);
}
// login ok
// Stopping at first failure: checkout
// (refund is never visited)
```

`continue` skips the rest of *this* iteration and goes to the next item:

```ts
const flaky = new Set(["search-flaky"]);

for (const result of results) {
  if (flaky.has(result.name)) {
    continue;                // do not count this one
  }
  console.log(result.name);
}
```

Use `continue` when the skip is a one-line guard at the top of the body. If you are skipping for three different reasons with logic after each, you probably want a helper, not a thicket of `continue`s.

### C.11 Infinite loops

Causes you will actually produce:

| Cause | Example |
|---|---|
| Forgot the update | `while (i < 10) { console.log(i); }` |
| Update in the wrong direction | `for (let i = 0; i < 10; i--)` |
| Condition can never become false | `while (true)` with a `break` you never reach |
| Comparing the wrong thing | `while (results)` — a non-empty array is always truthy |

Symptoms: the terminal prints the same line forever, or prints nothing and never returns to a prompt, or your fan spins up.

**How to interrupt:** `Ctrl+C` in the terminal. Then fix the condition or the update before running again. Do not add a `break` at random; find the missing update.

A `while (true)` with a clearly named `break` is legal and sometimes the most honest polling loop. A `while (true)` whose `break` is ten lines down and behind two `if`s is how processes get stuck in CI.

### C.12 Nested loops

```ts
const suites = [
  { name: "auth", tests: ["login", "logout"] },
  { name: "cart", tests: ["add", "remove"] },
];

for (const suite of suites) {
  for (const test of suite.tests) {
    console.log(`${suite.name} / ${test}`);
  }
}
```

Two levels is fine when the data is genuinely nested. Three levels usually means you should change the data shape — flatten it, or give the inner collection to a helper. Nested loops are also where off-by-ones multiply: an extra iteration on the outer loop reruns the entire inner loop.

### C.13 Choosing a loop

| Situation | Choose | Do not choose |
|---|---|---|
| Do something with each item | `for...of` | index-`for`, unless you need the index |
| You need the index or a neighbor | index-`for` or `entries()` | `forEach` (no `break`) |
| Unknown number of tries; polling | `while` with a max | `forEach`, unbounded `while (true)` |
| Must run at least once | `do...while` | `while`, unless you can seed the condition |
| Simple side effect, no stop, no wait | `forEach` | anything heavier |
| Will need `await` (later) | `for...of` | **`forEach`** |
| Stop at the first match | `for...of` + `break` | `forEach` |
| Transform / filter / total | wait for [Chapter 2.8](08-arrays.md) | a loop you will immediately replace |

The last row is a preview, not a prohibition. Write the loop first. When you meet `map` and `filter`, you will recognize them as the loop you already understand.

---

## D. QA Context

### D.1 A run summary is a loop

```ts
const results = [
  { name: "login", status: "passed", durationMs: 800 },
  { name: "checkout", status: "failed", durationMs: 2400 },
  { name: "refund", status: "passed", durationMs: 1100 },
];

let failed = 0;
const failedNames: string[] = [];

for (const result of results) {
  if (result.status === "failed") {
    failed++;
    failedNames.push(result.name);
  }
}

console.log(`${failed} failed: ${failedNames.join(", ")}`);
// 1 failed: checkout
```

This is the kernel of [Project 1](../projects/project-1-test-result-analyzer.md). You will later write it with `filter` and `map`. The loop is how you should think it first: walk each result, decide, accumulate.

### D.2 A loop inside one test is not many tests

```ts
// One test, three assertions, first failure hides the rest
for (const region of ["CA", "OR", "NY"]) {
  expect(taxFor(region)).toBe(expectedTax(region));
}
```

If `CA` fails, `OR` and `NY` never run. You have one test named something like "tax is correct" and a report that mentions only California.

The later, correct form is **one test per row** (Playwright's `test.each`, [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md)). The loop belongs in the *runner*, not in the test body. Same idea as [Chapter 2.5](05-conditional-logic.md) D.2: a branch or a loop that changes what is asserted is usually two (or N) tests.

A loop over setup data — create three users, then run one assertion — is fine. The smell is a loop around assertions.

### D.3 Polling is the primitive behind waiting

Every `await expect(page.getByRole("button", { name: "Place order" })).toBeEnabled()` is a `while` loop with a timeout. Playwright writes it so you do not have to, and so you do not write this:

```ts
// Banned in this course, for reasons Chapter 5.5 will make precise
while (!buttonIsEnabled()) {
  wait(100);
}
```

No maximum. No diagnosis. Infinite if the button never enables. Understanding why that is wrong is the point of C.6.

### D.4 `forEach` + `await` in a real suite

The most common form you will see in the wild:

```ts
// Looks tidy. Leaves the cart empty.
items.forEach(async (item) => {
  await cart.add(item);
});
await expect(cart.badge).toHaveText(String(items.length));
```

The assertion runs before the adds finish. Sometimes it fails. Sometimes the adds finish just in time and it passes. That intermittent pass is a flake, and [Chapter 1.2](../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) already told you what a 5% flake rate does to a suite.

`for...of` + `await` is sequential and boring and correct. `Promise.all` (Chapter 2.12) is concurrent and correct when the adds do not depend on each other. `forEach` is neither.

---

## E. Code Examples

### E.1 Very simple — count to five, two ways

```ts
for (let i = 1; i <= 5; i++) {
  console.log(i);
}

let n = 1;
while (n <= 5) {
  console.log(n);
  n++;
}
```

Trace both. Same output. The `for` keeps the update where you can see it. The `while` hides it in the body — which is why `for` is safer when you *do* know the count.

### E.2 Practical — print every item

```ts
const tests = ["login", "search", "checkout"];

for (const test of tests) {
  console.log(test);
}

tests.forEach((test) => {
  console.log(test);
});
```

Prefer the first. It will still be right when the body grows an `await`.

### E.3 QA-oriented — count failures and collect names

See D.1. Extend it with a single-pass slowest-test finder:

```ts
let failed = 0;
const failedNames: string[] = [];
let slowestName = "";
let slowestMs = -1;

for (const result of results) {
  if (result.status === "failed") {
    failed++;
    failedNames.push(result.name);
  }
  if (result.durationMs > slowestMs) {
    slowestMs = result.durationMs;
    slowestName = result.name;
  }
}
```

One walk. Two accumulators. This is the medium exercise, and it is also how you should think about `reduce` when it arrives: a loop with a bundle of running totals.

### E.4 Automation-oriented — environments, and the `forEach` trap

```ts
const environments = [
  { name: "staging", baseUrl: "https://staging.shop.test" },
  { name: "sandbox", baseUrl: "https://sandbox.shop.test" },
];

for (const env of environments) {
  console.log(`Checking ${env.name} at ${env.baseUrl}`);
  // later: await request.get(env.baseUrl + "/health");
}
```

The broken preview, written so you can recognize it:

```ts
// Do not use this pattern. Shown so you can name it in a review.
environments.forEach(async (env) => {
  // await request.get(env.baseUrl + "/health");
  console.log(`started ${env.name}`);
});
console.log("all started");   // prints BEFORE the gets finish
```

If you remember only one example from this chapter, remember that the log order is the bug.

---

## F. Common Mistakes

### F.1 Off-by-one with `<=` and `.length`

`i <= array.length` reads the item past the end. Use `i < array.length`. Trace one table row past the end if you are unsure.

### F.2 Forgetting the update

`while (i < 10) { console.log(i); }` never increments `i`. `Ctrl+C`, then put the update where you can see it — or switch to `for`.

### F.3 `forEach` when you need to stop early

`return` inside `forEach` is `continue`, not `break`. Use `for...of`.

### F.4 `await` inside `forEach`

The test finishes before the work. Use `for...of`. This mistake is on the [instructor notes](instructor-notes.md) list for a reason.

### F.5 Mutating the array you are iterating

```ts
for (const result of results) {
  if (result.status === "skipped") {
    results.pop();           // the collection changes under you
  }
}
```

Items get skipped or visited twice. Build a new array instead. [Chapter 2.8](08-arrays.md) will make that the default.

### F.6 A loop you will immediately replace with `map`

```ts
const names: string[] = [];
for (const result of results) {
  names.push(result.name);
}
```

Fine today. In two chapters this is `results.map(r => r.name)`. Write the loop so you can see the transform; do not be precious about rewriting it later.

### F.7 Nesting where the data should flatten

Three nested loops over `suites → files → tests` is a sign you wanted a flat list of tests, each carrying its suite name. Change the shape; the loop gets simpler for free.

### F.8 Many assertions in one loop in one test

First failure hides the rest. One test per case, or a data-driven runner. See D.2.

---

## G. Exercise

Suggested total time: 100 minutes.

### G.1 Easy — Three loops, one list (20 min)

Given:

```ts
const results = [
  { name: "login", status: "passed" },
  { name: "checkout", status: "failed" },
  { name: "search", status: "skipped" },
];
```

Print `name: status` for each item using **index-`for`**, **`for...of`**, and **`forEach`**. Then write two sentences: which version would you keep, and which version becomes wrong the moment the body needs to wait.

### G.2 Medium — One pass, three numbers (35 min)

Using a **single** `for...of` over a supplied run of at least eight results (invent them; include one skipped, one failed, one 0 ms duration, and an empty-run second input):

1. Total duration of executed tests (passed + failed; skip skipped).
2. Failure count and a comma-separated list of failed names.
3. The slowest executed test's name and duration.

Print a four-line summary. Handle the empty run without `NaN` or `"undefined"`.

Then answer: why is one pass better than three loops, and when would three loops be clearer anyway?

### G.3 Challenge — Pick the loop (45 min)

For each scenario, name the construct you would use (`for`, `for...of`, `while`, `do...while`, `forEach`, or "not a loop — wait for Chapter 2.8") and one construct you would refuse. Two of the eight **must** be `while`. One **must** explain why `forEach` is wrong.

| # | Scenario |
|---|---|
| 1 | Print every test name in a run |
| 2 | Poll `/health` until it returns 200 or 10 seconds have passed |
| 3 | Stop at the first failed result and return its name |
| 4 | Create 20 users, waiting for each create to finish before the next |
| 5 | Prompt the user for a file path until they type a non-empty string |
| 6 | Pair each result with the previous one to detect status flips |
| 7 | Build an array of failed names from a run |
| 8 | Assert tax for 12 regions inside a single Playwright test |

---

## H. Coding Assignment

### Assignment 2.6 — Batch result reporter

**Objective.** Iterate a suite's results and print a formatted report: a per-test section, a failures section, totals, and the slowest three tests. Handle an empty run. Choose the most readable loop for each part.

**Deliverable.** `assignment-2-6/report.ts`.

**Input** (hardcode two runs: the eight-row run below, and an empty array):

```ts
interface Result {
  name: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
}

const run: Result[] = [
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

**Required output for the eight-row run** (spacing flexible, content not):

```text
RUN REPORT
----------
1. login valid        passed    820ms
2. login invalid      failed    640ms
...
8. order history      passed    700ms

FAILURES (2)
- login invalid (640ms)
- checkout card (3400ms)

TOTALS
executed  7
passed    5
failed    2
skipped   1
duration  9660ms
pass rate 71.4% of executed

SLOWEST
1. checkout card     3400ms
2. checkout wallet   2100ms
3. search lamp       1100ms
```

Empty run:

```text
RUN REPORT
----------
(no tests)

FAILURES (0)
(none)

TOTALS
executed  0
passed    0
failed    0
skipped   0
duration  0ms
pass rate n/a

SLOWEST
(none)
```

**Requirements.**

| # | Requirement |
|---|---|
| 1 | Per-test lines numbered from 1, using a loop that has access to the index |
| 2 | Failures section built by iterating; do not hardcode the two names |
| 3 | Totals computed in **one pass** (one loop, several accumulators) |
| 4 | Pass rate over executed tests; empty run prints `n/a`, never `NaN` |
| 5 | Slowest three by duration, descending; ties broken by earlier appearance; fewer than three if the run is smaller |
| 6 | Skipped tests are not executed and do not compete for "slowest" |
| 7 | No `forEach` anywhere — you will want `await` in this file later |
| 8 | No `==` except `== null` |
| 9 | `npx tsc --noEmit` clean under `strict`; no `any` |

**Constraints.**

- Loops, conditions, operators, arrays' `.push` / `.length` / index access. No `.filter` / `.map` / `.sort` / `.reduce` — those are Chapter 2.8, and the slowest-three requirement is specifically here so you write a selection loop by hand.
- Finding the slowest three: you may keep a small array of up to three results and insert into it as you walk. You may not copy the whole run and sort it.

**Suggested approach.**

1. Print the per-test section with `for` + index or `entries()`.
2. Write the totals loop next, including the empty-run guard on pass rate.
3. Build the failures list in that same pass (`push` names when status is failed).
4. Only then tackle slowest-three. Trace the eight-row run on paper: after each item, what are the current top three?
5. Run the empty array last.

**Acceptance criteria.**

- [ ] Both runs produce the specified sections
- [ ] Empty run has `n/a` and `(none)`, no `NaN` / `undefined`
- [ ] Slowest three match the fixture (card, wallet, search lamp)
- [ ] Totals from one pass
- [ ] No `forEach`, no `sort`
- [ ] `tsc --noEmit` clean

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Correct totals and empty-run | 25% | Executed vs skipped; `n/a`; no `NaN` |
| Slowest-three algorithm | 25% | Correct order; skips excluded; ties stable; works for 0–2 items |
| Loop choice | 20% | Index loop where the number is needed; `for...of` elsewhere; no `forEach` |
| Single-pass totals | 15% | One walk for counts and duration |
| Output completeness | 15% | All sections present for both runs |

**Self-check.** Add a ninth result: `search empty 2`, skipped, `99999ms`. It must not appear in SLOWEST. If it does, you used `durationMs` without checking status.

> **AI usage: restricted.**
>
> **Allowed:** "how do I format a number to one decimal place," "what is `entries()`."
> **Not allowed:** an implementation of slowest-three, or "write a loop that keeps the top N."
>
> The insertion loop is the thing this assignment teaches. Having it generated skips the tracing.

---

## I. Quiz

Nine questions. Answer key: [`answer-keys/part-2/06-loops.answers.md`](../answer-keys/part-2/06-loops.answers.md).

**1.** How many times does this body run?

```ts
for (let i = 0; i < 4; i++) {
  console.log(i);
}
```

- A) 3
- B) 4
- C) 5
- D) infinitely

**2.** What is printed?

```ts
const items = ["a", "b", "c"];
for (let i = 0; i <= items.length; i++) {
  console.log(items[i]);
}
```

- A) `a` `b` `c`
- B) `a` `b` `c` `undefined`
- C) `a` `b`
- D) a runtime crash, always

**3.** True or false: `return` inside a `forEach` callback stops the loop.

**4.** You need to create users one-by-one, waiting for each create to finish. Which loop?

- A) `forEach` with an `async` callback
- B) `for...of` (and later, `await` in the body)
- C) `do...while` over `users.length`
- D) An index-`for` that does not wait

**5.** Which loop is the best default for "do something with each item"?

- A) index-`for`
- B) `for...of`
- C) `while (true)`
- D) `do...while`

**6.** What is the main risk of this polling loop?

```ts
while (!ready) {
  ready = checkHealth();
}
```

- A) It uses `while` instead of `for`
- B) It has no maximum attempts, so a down server loops forever
- C) `checkHealth` cannot be called more than once
- D) It will skip the first check

**7.** `break` inside `for...of` does what?

- A) Skips one item
- B) Leaves the loop entirely
- C) Restarts the loop
- D) Throws

**8.** A Playwright test loops over 12 regions and asserts tax in the body. What is the design problem?

- A) Loops are not allowed in tests
- B) The first failing region hides the rest; this is one test pretending to be twelve
- C) Tax must be asserted with `==`
- D) There is no problem if the loop is `for...of`

**9.** Which statement about `forEach` is correct?

- A) It is the only loop that works with `await`
- B) You can `break` out of it
- C) It does not wait for async callbacks, so work started inside it may finish after the following code
- D) It cannot iterate arrays

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Four parts | Init, condition, body, update — miss the update and you loop forever |
| index-`for` | When you need the position or a neighbor |
| `for...of` | The default; the one that will work with `await` |
| `while` | Unknown count; always pair with a maximum |
| `do...while` | Body first; rare in test code |
| `forEach` | Simple side effects; no `break`; no `await` |
| Off-by-one | `i < length`, not `<=`; trace a table |
| `break` / `continue` | Leave the loop / skip this item |
| Loop vs many tests | A loop around assertions is N tests hiding in one |

### Mistakes recap

`<= length` · forgotten update · `forEach` when you need to stop · `forEach` + `await` · mutating while iterating · assertions in a loop inside one test.

### Competency check

> **Given a collection task, can you name the loop you would use and one loop you would not, with reasons?**

Do it on G.3 scenarios 3, 4, and 8 without notes. If you pick `forEach` for 4, reread C.9 before touching Playwright.

**Gate for this chapter:** you are ready for [Chapter 2.7](07-functions.md) when you can explain, out loud, why `forEach` plus waiting is a flake and why `for...of` is not. Functions will let you name the body of these loops; they will not save a loop that cannot wait.

---

[← 2.5 Conditional Logic](05-conditional-logic.md) · [Next: 2.7 Functions →](07-functions.md)
