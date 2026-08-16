# Chapter 2.3 — Variables and Constants

🟢 **Beginner** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 3.5 hours independent work |
| **Prerequisite chapters** | [2.1](01-thinking-like-a-programmer.md), [2.2](02-data-types.md) |
| **Next chapter** | [2.4 Operators](04-operators.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Declare** variables with `let` and constants with `const`, and **explain** the difference in terms of rebinding.
2. **Distinguish** declaration, initialization, assignment, and reassignment.
3. **Explain** why `const` is the default choice in this course and what class of bug it prevents.
4. **Demonstrate** that `const` prevents rebinding but not mutation of an array or object's contents.
5. **Apply** type inference and type annotations appropriately, and **justify** when an explicit annotation adds value.
6. **Name** variables so that a reader can understand code without comments.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Primitive types, arrays, objects | [Chapter 2.2](02-data-types.md) |
| Running a TypeScript file from the terminal | [Chapter 2.1](01-thinking-like-a-programmer.md) |

---

## C. Concept Explanation

### C.1 A variable is a name bound to a value

```ts
const expectedStatusCode = 200;
```

That line creates a **binding**: the name `expectedStatusCode` now refers to the value `200`. Wherever you write the name, you get the value.

The useful mental model is a label on a box, not the box itself. The name is attached *to* a value; it is not a container that holds one. This sounds like hair-splitting and it explains everything surprising in Section C.5, so it is worth adopting now.

Why bother naming things at all? Because `200` appearing in fifteen places is fifteen places to change and fifteen places where a reader has to work out what it means. `expectedStatusCode` says it once.

Compare these two lines, which compile to identical programs:

```ts
const r = t.filter((x) => x.s === "f").length;

const failedCount = results.filter((result) => result.status === "failed").length;
```

The second costs three more seconds to type and is the difference between code a colleague can review and code they have to reverse-engineer. Naming is not cosmetic; it is the primary mechanism by which code communicates. That claim is graded in every project rubric in this course and again in [Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md).

### C.2 Four precise terms

These words get used loosely, and the looseness causes confusion when error messages use them precisely.

```ts
let durationMs;              // declaration — the name now exists, value is undefined
durationMs = 1240;           // initialization — its first value
durationMs = 2050;           // reassignment — pointing the name at a different value

const timeoutMs = 30000;     // declaration AND initialization in one step
```

| Term | Meaning |
|---|---|
| **Declaration** | Bringing the name into existence |
| **Initialization** | Giving it its first value |
| **Assignment** | Binding a value to the name |
| **Reassignment** | Binding a *different* value to a name that already had one |

`const` requires declaration and initialization together — you cannot declare a `const` and fill it in later — and forbids reassignment entirely. That is the whole difference.

### C.3 `let` versus `const`

```ts
let attemptCount = 0;
attemptCount = 1;            // fine

const maxRetries = 3;
maxRetries = 5;              // error TS2588: Cannot assign to 'maxRetries'
                             // because it is a constant.
```

`let` permits rebinding. `const` does not. That is it.

**This course defaults to `const` and requires a reason for `let`.** Three reasons, in increasing order of importance:

**It reduces what you have to track.** When you read `const budget = 2000` you know that `budget` is 2000 for the rest of its life. With `let`, you must scan every line between the declaration and the point you care about, looking for reassignment. On a twenty-line function that is mild. On a two-hundred-line one it is the difference between reading and auditing.

**It turns a class of bug into a compile error.** Accidental reassignment — usually a typo, or a copy-pasted line, or a loop variable reused — stops compiling instead of producing a wrong answer at runtime.

**It matters under parallel execution.** In [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) your tests run concurrently. Shared mutable state is the primary cause of intermittent failure in parallel suites, and `let` at module scope is where that state lives. Defaulting to `const` does not eliminate the problem, but it makes every instance of it visible and deliberate.

**When `let` is legitimate.** Genuinely:

```ts
let slowest = results[0];                  // an accumulator updated as you scan
for (const result of results) {
  if (result.durationMs > slowest.durationMs) {
    slowest = result;
  }
}
```

That is the C.7 algorithm from [Chapter 2.1](01-thinking-like-a-programmer.md), and the reassignment is the point. Accumulator variables in loops, and values assigned in different branches of a conditional, are the two honest uses. [Chapter 2.8](08-arrays.md) will show that even most accumulators can be expressed without `let` — but the pattern above is correct code, not a violation.

### C.4 Why this book never uses `var`

You will encounter `var` in older code and tutorials. It is the original declaration keyword, and it has two behaviors that cause bugs:

**It ignores block scope.** A `var` declared inside an `if` block is visible outside it, which means loops and conditionals leak names.

**It permits redeclaration.** `var x = 1; var x = 2;` in the same scope is legal, which silently hides typos and copy-paste mistakes.

`let` and `const` fixed both. There is no situation in modern TypeScript where `var` is the right answer. If you see it in a codebase you inherit, it is a signal about the code's age, and replacing it is usually safe — though verify, because a rare piece of code depends on the leaking.

### C.5 `const` prevents rebinding, not mutation

This is the most misunderstood thing in the chapter and it is worth slowing down for.

```ts
const results = [
  { name: "login", status: "passed" },
];

results.push({ name: "checkout", status: "failed" });   // ALLOWED
console.log(results.length);                            // 2

results[0].status = "failed";                           // ALLOWED
console.log(results[0].status);                         // "failed"

results = [];                                           // ERROR
// Cannot assign to 'results' because it is a constant.
```

The first two operations changed the array's *contents*. The third tried to point the name at a *different array*. `const` forbids only the third.

Return to the label model from C.1. `const` means the label is nailed to that particular value. It says nothing about whether the value itself can be modified. An array is a mutable value, so a `const` array is a permanently-labeled mutable thing.

The same applies to objects:

```ts
const config = { baseUrl: "https://staging.example", retries: 2 };

config.retries = 3;                       // ALLOWED — changing a property
config = { baseUrl: "x", retries: 0 };    // ERROR — rebinding the name
```

**Why this matters, concretely.** Learners who believe `const` means "immutable" write this and are baffled:

```ts
const sharedCart = { items: [] as string[] };

// test A
sharedCart.items.push("lamp");
// test B, running later
console.log(sharedCart.items);   // ["lamp"] — test A's data is still here
```

`const` gave no protection. This is the test-isolation failure from [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) arriving through a door the learner thought was locked. If you want genuine immutability you need `Object.freeze`, or `readonly` types, or — far better and the approach this course teaches — you avoid shared mutable state in the first place by building fresh data per test ([Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md)).

### C.6 Type inference

TypeScript works out types from values. You do not have to say what is obvious.

```ts
const testName = "checkout";      // inferred: string
const durationMs = 2050;          // inferred: number
const passed = false;             // inferred: boolean
const tags = ["smoke", "cart"];   // inferred: string[]
```

Hover over any of these in VS Code and the editor tells you the inferred type. The checking is identical to what you would get by annotating — inference is not a weaker mode.

One subtlety with a practical consequence. Inference differs between `const` and `let`:

```ts
const status = "failed";     // inferred: "failed"   <- the literal type
let mutableStatus = "failed"; // inferred: string     <- widened
```

Because a `const` can never change, TypeScript infers the narrowest possible type: not `string`, but the specific value `"failed"`. This is called a **literal type**, and it becomes useful in [Chapter 2.10](10-typescript-fundamentals.md) — it is why `const` declarations sometimes work in places where `let` declarations mysteriously do not.

### C.7 When an annotation earns its keep

Annotating everything adds noise. Annotating nothing leaves gaps. Four cases where the annotation is worth writing:

**1. Empty collections.** Without an annotation, an empty array has no values to infer from:

```ts
const failures = [];              // inferred: any[] — or never[] under strict
failures.push("login broke");     // may error, or silently accept anything

const failures: string[] = [];    // correct
failures.push("login broke");     // fine, and type-checked
```

This is the most common real need for an annotation, and it appears constantly in QA code because you frequently start with an empty list and fill it.

**2. Function boundaries.** Parameters and return types, covered properly in [Chapter 2.7](07-functions.md):

```ts
function passRate(passed: number, total: number): number {
  return total === 0 ? 0 : (passed / total) * 100;
}
```

Inference cannot help with parameters — there is no value to infer from — and an explicit return type catches the case where your function accidentally returns the wrong thing on one branch.

**3. When you want a wider or narrower type than the value implies.**

```ts
const status: "passed" | "failed" | "skipped" = "passed";
```

You are stating that this name may later hold any of the three, or that it participates in a union elsewhere. Inference would have given you just `"passed"`.

**4. When the value's type is not visible on the page.**

```ts
const config: EnvironmentConfig = loadConfig();
```

The reader learns what they are dealing with without opening `loadConfig`.

**When to skip it.** Obvious literals. `const durationMs: number = 2050` says "number" twice, and the annotation is pure noise. This course's rubrics treat over-annotation as a readability defect, not a virtue.

### C.8 Naming

Names are how code explains itself. The conventions:

**camelCase for variables and functions.**

```ts
const failedTestCount = 3;
const baseUrl = "https://staging.demoshop.example";
```

**SCREAMING_SNAKE_CASE for module-level configuration constants.** Optional, and common enough to recognize:

```ts
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
```

Those underscores in `30_000` are numeric separators — ignored by the language, useful to the eye.

**Meaningful nouns for values, questions for booleans.**

```ts
// bad
const flag = true;
const status = true;
const check = results.length > 0;

// good
const isRetryable = true;
const hasFailures = results.length > 0;
const shouldSkipCleanup = false;
```

A boolean's name should read as a yes/no question. `isX`, `hasX`, `shouldX`, `canX`. If `if (status)` reads oddly, the name is wrong.

**No abbreviations that cost the reader anything.**

| Bad | Good | Why |
|---|---|---|
| `r` | `result` | Unreadable outside a one-line callback |
| `res` | `response` or `result` | Ambiguous — which one? |
| `tc2` | `expiredCardTestCase` | `2` means nothing to anyone |
| `tmp` | `sortedByDuration` | Names what it is, not that it is temporary |
| `data` | `testResults` | `data` describes everything and nothing |
| `arr` | `failedTestNames` | Says the type, not the meaning |

The exception is a genuinely conventional short name in a tiny scope: `r` in `results.filter(r => ...)` is acceptable to most reviewers because the scope is one line and the meaning is unmissable. Prefer the full word anyway; it costs six characters.

**Put units and qualifiers in the name.** `durationMs`, `timeoutMs`, `priceCents`, `failedCount`. This is the C.12 rule from [Chapter 2.2](02-data-types.md) restated because it is the highest-value naming habit in QA code.

**The test for a good name:** could a colleague delete every comment in your file and still understand it? If the answer requires the comments, the names are doing too little work. That is the standard applied in [Chapter 8.1](../part-8-professional-engineering/01-clean-code-for-automation.md).

### C.9 Scope, briefly

A name exists only inside the block where it was declared. A block is anything between `{` and `}`.

```ts
const results = loadResults();

if (results.length === 0) {
  const message = "No results to report";
  console.log(message);          // fine
}

console.log(message);            // ERROR: Cannot find name 'message'
```

`message` existed only inside the `if` block. This is a feature: names that are relevant in one place do not clutter everywhere else, and two blocks can each have a `message` without interfering.

Full treatment, including function scope and why it matters for shared state, is in [Chapter 2.7](07-functions.md). For now, one practical consequence: **declare names in the smallest block where they are needed.** A name declared at the top of a file is visible everywhere and mutable from everywhere, which is the shared-state problem from C.3 in embryo.

### C.10 Constants for test configuration

Putting it together on the problem you will actually face. Here is a test script's worth of inline literals:

```ts
// before
await page.goto("https://staging.demoshop.example/login");
await page.fill("#email", "qa-user-42@example.com");
await page.fill("#password", "Str0ngP4ss!");
await page.click("#submit");
await page.waitForURL("https://staging.demoshop.example/dashboard", { timeout: 30000 });
if (response.status() !== 200) throw new Error("bad status");
```

Every value is buried. Changing the environment means finding two URLs. Changing the timeout means finding every `30000`. And nobody reading `!== 200` knows whether 200 was a deliberate expectation or the number someone happened to observe.

```ts
// after
const BASE_URL = "https://staging.demoshop.example";
const DEFAULT_TIMEOUT_MS = 30_000;
const HTTP_OK = 200;

const testUser = {
  email: "qa-user-42@example.com",
  password: "Str0ngP4ss!",
};

await page.goto(`${BASE_URL}/login`);
await page.fill("#email", testUser.email);
await page.fill("#password", testUser.password);
await page.click("#submit");
await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: DEFAULT_TIMEOUT_MS });
if (response.status() !== HTTP_OK) throw new Error("bad status");
```

Same behavior. Three differences that compound across a suite: the environment changes in one place, the timeout changes in one place, and `HTTP_OK` documents that 200 was expected rather than merely observed.

This is the first step of a road that continues for the rest of the course. Those constants belong in a config file ([Chapter 6.5](../part-6-framework-engineering/05-configuration.md)), `testUser` belongs in a data factory ([Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md)), and those selectors belong in a page object ([Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md)). Naming is where all of it starts.

---

## D. QA Context

### D.1 Hardcoded values are the configuration problem in embryo

The "before" snippet in C.10 is not a strawman. It is what almost every automation suite looks like at three months old, and the pain arrives predictably.

The suite works on staging. Someone asks whether it can run against a preview environment. Now you are grepping for a hostname across forty files, and you will miss two, and those two tests will fail against the wrong environment in a way that looks like an application bug.

The name for what went wrong is that **the environment was never a concept in the code** — it was a string, repeated. Chapter 6.5 solves this properly with typed configuration objects and environment resolution. But the fix is only available to code that named things, because you cannot centralize a value you cannot find.

The habit is cheap now and expensive to retrofit, which is why [Project 4](../projects/project-4-web-automation.md) and the [capstone](../capstone/00-capstone-overview.md) both carry explicit rubric lines for zero hardcoded URLs and credentials.

### D.2 Naming is assessed, everywhere, for the rest of the course

Every project rubric in this course includes a code-quality dimension, and naming is the largest component of it. This is not because the course is fussy. It is because automation code has an unusual read/write ratio.

A test is written once and read every time it fails. When a checkout test fails at 2am in CI, the person triaging it — possibly not you — has your names and the failure output, and nothing else. Compare:

```ts
// version A
if (x.length !== 3) throw new Error("wrong count");

// version B
if (cartItems.length !== EXPECTED_CART_ITEM_COUNT) {
  throw new Error(
    `Cart should contain ${EXPECTED_CART_ITEM_COUNT} items, found ${cartItems.length}`
  );
}
```

Version A's failure message tells the triager nothing. Version B's tells them what was expected, what happened, and — because the names are meaningful — which part of the application to look at. The [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) verifiability criterion has a runtime twin: a failure should explain itself, and it can only do that with the vocabulary your names provide.

[Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) treats unclear naming as a blocking review comment rather than a nitpick, for this reason.

### D.3 Mutable shared state and intermittent failure

Here is the bug that makes `const`-by-default worth more than a style preference.

```ts
// helpers.ts — module scope
export let currentUser = { email: "qa-user@example.com", cartTotal: 0 };
```

```ts
// two tests, running in parallel workers
test("adding a lamp updates the total", async () => {
  currentUser.cartTotal += 99;
  expect(currentUser.cartTotal).toBe(99);
});

test("adding clips updates the total", async () => {
  currentUser.cartTotal += 1;
  expect(currentUser.cartTotal).toBe(1);
});
```

Run alone, both pass. Run together, either might see the other's value depending on timing, and the failure appears in a *different* test from the one that caused it. That is the signature of a flakiness class that costs teams weeks: non-deterministic, order-dependent, unreproducible locally.

Two lessons, and the second is the one people miss:

**`let` at module scope is the mechanism.** Making it `const` would have prevented reassignment — but as C.5 established, it would not have prevented `cartTotal += 99`, because that mutates rather than rebinds.

**So `const` is necessary and not sufficient.** The real fix is that each test builds its own data, which is [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md) and the isolation principle in [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md). What `const` buys you is that every remaining piece of shared mutable state is *visible* — it had to be written deliberately — and visible problems get fixed.

[Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) covers the diagnosis: if a test passes alone and fails in a suite, look for shared state before anything else.

### D.4 Well-named test data makes failures self-explanatory

A small habit with a large payoff. Compare two ways of building the same test data:

```ts
// version A
const u1 = { email: "a@b.com", card: "4000000000000002" };

// version B
const customerWithDeclinedCard = {
  email: "qa-declined-card@example.com",
  cardNumber: DECLINED_TEST_CARD,
};
```

When version A's test fails, the output mentions `u1` and a card number, and the triager must know that `4000000000000002` is Stripe's decline-test card to understand the test's intent. When version B fails, the intent is in the name, and the failure reads as a sentence about the business.

This becomes acute in the data factories of [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md), where the difference between `createUser()` and `createCustomerWithExpiredSubscription()` determines whether a suite is readable at fifty tests.

---

## E. Code Examples

Type these and predict each output first.

### E.1 Very simple — declaring, and attempting reassignment

```ts
// declarations.ts
let attemptCount = 0;
const maxRetries = 3;

console.log("attemptCount:", attemptCount);
console.log("maxRetries:  ", maxRetries);

attemptCount = 1;
attemptCount = attemptCount + 1;
console.log("attemptCount after two changes:", attemptCount);

// Uncomment the next line to see the compile error:
// maxRetries = 5;
// error TS2588: Cannot assign to 'maxRetries' because it is a constant.
```

```text
attemptCount: 0
maxRetries:   3
attemptCount after two changes: 2
```

Uncomment the last line. Note that the error appears in your editor *immediately*, before you run anything — the compile-time protection from [Chapter 2.2](02-data-types.md) C.11 doing its job.

### E.2 Practical — binding versus contents

```ts
// const-mutation.ts
const results = [{ name: "login", status: "passed" }];

console.log("initial length:", results.length);

results.push({ name: "checkout", status: "failed" });
console.log("after push:    ", results.length);

results[0].status = "failed";
console.log("after mutation:", results[0].status);

const config = { baseUrl: "https://staging.example", retries: 2 };
config.retries = 3;
console.log("after property change:", config.retries);

// Both of these are errors:
// results = [];
// config = { baseUrl: "x", retries: 0 };
```

```text
initial length: 1
after push:     2
after mutation: failed
after property change: 3
```

Every mutation succeeded. `const` protected the *name*, not the data. If this surprises you, reread C.5 — it is the single most common misconception in this chapter, and misunderstanding it makes the isolation failures in D.3 impossible to reason about.

**If you want real immutability**, and occasionally you do:

```ts
const frozen = Object.freeze({ baseUrl: "https://staging.example", retries: 2 });
// frozen.retries = 3;   // error under strict TypeScript; silently ignored at runtime
```

Note that `Object.freeze` is shallow — nested objects remain mutable — which is why avoiding shared state beats trying to lock it down.

### E.3 QA-oriented — a readability rewrite

The same working code, twice. First the version that arrives in code review:

```ts
// before.ts
const d = [
  { n: "login", s: "passed", t: 1240 },
  { n: "checkout", s: "failed", t: 2050 },
  { n: "search", s: "failed", t: 3180 },
];

let c = 0;
let m = d[0];
for (const x of d) {
  if (x.s === "failed") c = c + 1;
  if (x.t > m.t) m = x;
}
const p = ((d.length - c) / d.length) * 100;
console.log(c, p.toFixed(1), m.n);
```

```text
2 33.3 search
```

It works. Now try to answer, without running it: what does `p` represent? Is `33.3` a pass rate or a failure rate? What is `m`?

```ts
// after.ts
const testResults = [
  { name: "login", status: "passed", durationMs: 1240 },
  { name: "checkout", status: "failed", durationMs: 2050 },
  { name: "search", status: "failed", durationMs: 3180 },
];

let failedCount = 0;
let slowestResult = testResults[0];

for (const result of testResults) {
  if (result.status === "failed") {
    failedCount = failedCount + 1;
  }
  if (result.durationMs > slowestResult.durationMs) {
    slowestResult = result;
  }
}

const passedCount = testResults.length - failedCount;
const passRatePercent = (passedCount / testResults.length) * 100;

console.log(`Failed:    ${failedCount}`);
console.log(`Pass rate: ${passRatePercent.toFixed(1)}%`);
console.log(`Slowest:   ${slowestResult.name} (${slowestResult.durationMs} ms)`);
```

```text
Failed:    2
Pass rate: 33.3%
Slowest:   search (3180 ms)
```

Identical behavior. Four things the rename bought:

The output is now self-describing, so a reader of the *output* also knows what they are looking at.

`p` turned out to be a pass rate, which was genuinely ambiguous before — and `33.3` looks much more like a failure rate at a glance, so a reviewer of `before.ts` could easily have approved a real bug here.

The two `let` declarations are visibly accumulators, which is C.3's legitimate use, so a reviewer knows not to object.

Nothing needed a comment.

**One thing the rewrite did not fix:** `passRatePercent` divides by `testResults.length` with no empty check. Rename a bug and you still have the bug. Naming makes defects easier to see; it does not remove them. [Chapter 2.7](07-functions.md) fixes this properly.

### E.4 Automation-oriented — named constants for test data

```ts
// test-data.ts
const BASE_URL = "https://staging.demoshop.example";
const API_BASE_URL = "https://staging-api.demoshop.example";
const DEFAULT_TIMEOUT_MS = 30_000;
const HTTP_OK = 200;
const HTTP_PAYMENT_REQUIRED = 402;

// Stripe's documented test cards — the comment earns its place because
// the meaning of these numbers is not derivable from the code.
const VALID_TEST_CARD = "4242424242424242";
const DECLINED_TEST_CARD = "4000000000000002";

const customerWithValidCard = {
  email: "qa-valid-card@example.com",
  password: "Str0ngP4ss!",
  cardNumber: VALID_TEST_CARD,
  expectedCheckoutStatus: HTTP_OK,
};

const customerWithDeclinedCard = {
  email: "qa-declined-card@example.com",
  password: "Str0ngP4ss!",
  cardNumber: DECLINED_TEST_CARD,
  expectedCheckoutStatus: HTTP_PAYMENT_REQUIRED,
};

const checkoutScenarios = [customerWithValidCard, customerWithDeclinedCard];

for (const scenario of checkoutScenarios) {
  console.log(
    `${scenario.email} -> expects HTTP ${scenario.expectedCheckoutStatus} ` +
      `at ${API_BASE_URL}/checkout (timeout ${DEFAULT_TIMEOUT_MS} ms)`
  );
}
```

```text
qa-valid-card@example.com -> expects HTTP 200 at https://staging-api.demoshop.example/checkout (timeout 30000 ms)
qa-declined-card@example.com -> expects HTTP 402 at https://staging-api.demoshop.example/checkout (timeout 30000 ms)
```

This is close to real framework code, and four decisions in it are worth naming.

**Every environment-specific value is a constant at the top.** Changing environments touches two lines.

**`expectedCheckoutStatus` lives with the scenario data.** The expectation travels with the input, so a data-driven test can read it rather than embedding a `if (declined) 402 else 200` branch. This is the parameterized-test pattern from [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md).

**The scenario names describe the business case**, not the index. `customerWithDeclinedCard` fails informatively; `u2` does not.

**The one comment in the file explains something the code cannot.** That card numbers are Stripe's documented test values is external knowledge. Comments that restate the code are noise; comments that supply missing context are essential. That distinction is [Chapter 8.1](../part-8-professional-engineering/01-clean-code-for-automation.md)'s central claim about comments.

---

## F. Common Mistakes

### F.1 Using `let` everywhere out of habit

**The mistake:** declaring every variable with `let`, because it always works.

**Why it happens:** `let` never produces an error, so there is no feedback telling you it was the wrong choice.

**What it costs:** every reader must now scan for reassignment before trusting any value, and every accidental reassignment becomes a runtime wrong answer instead of a compile error. At module scope it also creates exactly the shared mutable state that produces the parallel-execution flakiness in D.3.

**Instead:** default to `const`. Reach for `let` only when you have a reason — an accumulator in a loop, or a value assigned in different branches — and expect a reviewer to ask what the reason is.

### F.2 Believing `const` makes an object immutable

**The mistake:** assuming `const results = [...]` prevents `results.push(...)`.

**Why it happens:** "constant" strongly implies unchanging, and the language chose a misleading word.

**What it costs:** false confidence about shared state. A learner who believes their `const` fixture is protected cannot explain why test B sees test A's data, and will look everywhere except the actual cause.

**Instead:** internalize the C.5 distinction. `const` nails the label to a value; the value may still be mutable. Real immutability needs `readonly` types or `Object.freeze`, and avoiding shared state beats both.

### F.3 Single-letter and abbreviated names

**The mistake:** `r`, `res`, `tc2`, `tmp`, `d`, `arr`.

**Why it happens:** it is faster to type, and while you are writing the code you know what everything means.

**What it costs:** you will not know in three weeks, and the person triaging your failed test at 2am never knew. Example E.3's `before.ts` is the demonstration: it is only twelve lines and it is genuinely hard to say whether `33.3` is a pass rate or a failure rate.

**Instead:** full words. The exception is a conventional short name in a one-line callback scope, and even there the full word costs six characters.

### F.4 Annotating everything

**The mistake:** `const durationMs: number = 2050;`

**Why it happens:** it feels rigorous, and beginners are often told that explicit types are good.

**What it costs:** noise. It says "number" twice, and the redundancy trains readers to skim annotations — so the annotations that *do* carry information get skimmed too.

**Instead:** trust inference for obvious literals. Annotate function boundaries, empty collections, and cases where you want a type the value does not imply.

### F.5 Annotating nothing, including empty arrays

**The mistake:** `const failures = [];`

**Why it happens:** inference usually works, so it is reasonable to assume it always does.

**What it costs:** there is no value to infer from, so you get `any[]` or `never[]` depending on configuration. With `never[]`, the first `push` is a compile error that reads confusingly; with `any[]`, all type checking on that array is silently switched off.

**Instead:** annotate empty collections. `const failures: string[] = [];` This is the most common legitimate need for an annotation in QA code, because building a list by filling an empty one is a constant pattern.

### F.6 Reusing one variable for two meanings

**The mistake:**

```ts
let result = fetchUser();
// ...forty lines...
result = calculatePassRate(results);   // now it means something else entirely
```

**Why it happens:** the name is generic enough to fit both, and declaring a second variable feels wasteful.

**What it costs:** the reader's model of what `result` means becomes wrong halfway down the function, and debugging becomes a search for where the meaning changed. It also blocks the `const` default, since a name with two meanings must be reassigned.

**Instead:** one name, one meaning, for its whole lifetime. Two meanings means two `const` declarations with two accurate names.

### F.7 Booleans named as nouns

**The mistake:** `const status = true;` or `const flag = false;`

**Why it happens:** `status` is what the value is *about*, so it feels descriptive.

**What it costs:** `if (status)` does not read as a question, so the reader cannot tell what `true` means. Does `status = true` mean passed, or enabled, or complete? Worse, a `status` that is sometimes a boolean and sometimes the string `"passed"` is a real defect pattern — and [Chapter 2.2](02-data-types.md) D.2 showed what the string `"false"` does to a truthiness check.

**Instead:** name booleans as questions. `isPassed`, `hasFailures`, `shouldRetry`, `canCheckout`.

---

## G. Exercise

Suggested total time: 85 minutes.

### G.1 Easy — `let` or `const`? (20 min)

For each declaration, choose `let` or `const` and justify in one line. Some are genuinely arguable — say why.

| # | The value |
|---|---|
| 1 | The base URL of the environment under test |
| 2 | A running count of failed tests, built up in a loop |
| 3 | The array of all test results, loaded once at startup |
| 4 | The slowest result seen so far, while scanning |
| 5 | The default timeout in milliseconds |
| 6 | A user record that will have its `cartTotal` property updated |
| 7 | The list of failed test names, built by pushing into it |
| 8 | The current retry attempt number |
| 9 | An HTTP status code you expect a request to return |
| 10 | A page title read from the browser, used once |
| 11 | A message that is one string if the suite passed and another if it failed |
| 12 | The set of browsers to run against, read from configuration |

Then answer:

**A.** Items 6 and 7 should both be `const`, and both involve values that change. Explain why that is not a contradiction.

**B.** Item 11 can be done with `let` or with `const`. Show both, and say which you prefer. (The `const` version needs the ternary operator — look it up, or read ahead to [Chapter 2.5](05-conditional-logic.md).)

**C.** Of the twelve, exactly three genuinely need `let`. Which, and what do they have in common?

### G.2 Medium — Rename fifteen variables (30 min)

Here is a working script. Rename every variable so that a colleague could understand it with no comments, and add annotations only where they earn their keep.

```ts
const u = "https://staging.demoshop.example";
const t = 30000;
const s = 200;
const d = [
  { n: "GET /products", c: 200, ms: 340, e: null },
  { n: "POST /cart", c: 201, ms: 890, e: null },
  { n: "POST /checkout", c: 500, ms: 4200, e: "internal error" },
  { n: "GET /orders", c: 200, ms: 410, e: null },
];

let a = 0;
let b = 0;
let x = [];
let m = d[0];

for (const i of d) {
  if (i.c >= 200 && i.c < 300) {
    a = a + 1;
  } else {
    b = b + 1;
    x.push(i.n);
  }
  if (i.ms > m.ms) {
    m = i;
  }
}

const p = (a / d.length) * 100;
const f = p >= 95;

console.log(a, b, p.toFixed(1), f, m.n, x);
```

**Task A.** Rewrite it. Every name meaningful, `const` wherever possible, annotations only where useful, and the output made self-describing with labels.

**Task B.** Explain two of your renaming choices in detail — say what the old name allowed a reader to get wrong.

**Task C.** One variable in the original has a name whose type is *misleading*, not merely vague. Identify it.

**Task D.** `let x = []` has a specific type problem beyond its name. What is it, and what does your rewrite do about it?

**Task E.** After renaming, one latent bug in this script becomes much easier to see. Find it. (Consider what happens with a different input.)

### G.3 Challenge — Eliminate the `let`s (35 min)

Here is a script with six `let` declarations. Refactor it so that **at most one** remains, without changing behavior.

```ts
let environment = "staging";
let baseUrl = "";
if (environment === "staging") {
  baseUrl = "https://staging.demoshop.example";
} else {
  baseUrl = "https://demoshop.example";
}

let results = [
  { name: "login", status: "passed", durationMs: 1240, retries: 0 },
  { name: "search", status: "failed", durationMs: 3180, retries: 2 },
  { name: "cart", status: "passed", durationMs: 890, retries: 0 },
  { name: "checkout", status: "failed", durationMs: 2050, retries: 1 },
];

let totalDuration = 0;
for (const result of results) {
  totalDuration = totalDuration + result.durationMs;
}

let retriedTests = [];
for (const result of results) {
  if (result.retries > 0) {
    retriedTests.push(result.name);
  }
}

let verdict = "";
let passCount = 0;
for (const result of results) {
  if (result.status === "passed") passCount = passCount + 1;
}
if (passCount === results.length) {
  verdict = "GREEN";
} else if (passCount / results.length >= 0.9) {
  verdict = "AMBER";
} else {
  verdict = "RED";
}

console.log(baseUrl, totalDuration, retriedTests, verdict);
```

**Task A.** Refactor. State for each removed `let` what technique replaced it.

**Task B.** For the one `let` you keep — or if you keep none, for the one you found hardest to remove — write a paragraph justifying the choice to a reviewer.

**Task C.** Two of the `let` variables exist only because a value is computed inside a block and used outside it. Name the general technique for fixing that shape, and explain how it also improves testability. (You do not need [Chapter 2.7](07-functions.md) to answer, but it is the chapter that formalizes it.)

**Task D.** The script loops over `results` three separate times. Is combining them into one loop an improvement? Argue both sides in a short paragraph each, then state your position. This is a real disagreement among engineers and there is no single right answer — the reasoning is what is assessed.

**Task E.** After your refactor, add a `// TODO` comment identifying one remaining problem the refactor did not solve. There is at least one; example E.3 hints at what to look for.

<details>
<summary>Hint on Task A, if you are stuck on the first `let`</summary>

`baseUrl` is assigned in two branches of a conditional, which is one of C.3's legitimate `let` uses — so the technique is to replace the conditional itself, not to be clever about the assignment. Either a ternary (`const baseUrl = environment === "staging" ? A : B`) or a lookup object (`const URLS = { staging: A, production: B }` and then `URLS[environment]`) removes the need. The second scales better to five environments, which is a hint about where [Chapter 6.5](../part-6-framework-engineering/05-configuration.md) is heading.

</details>

---

## H. Coding Assignment

### Assignment 2.3 — Configuration constants refactor

**Objective.** Take working but unreadable code and make it readable, with zero behavior change, and be able to defend every decision.

**The starting point.** Create `assignment-2-3/before.ts` containing exactly this, and confirm it runs:

```ts
const a = "https://staging.demoshop.example";
const b = "https://staging-api.demoshop.example";
const c = 30000;
const e = 3;

const q = [
  { n: "login valid", s: "passed", t: 1240, r: 0, g: ["smoke", "auth"] },
  { n: "login locked", s: "blocked", t: 0, r: 0, g: ["auth"] },
  { n: "search results", s: "failed", t: 3180, r: 2, g: ["smoke", "search"] },
  { n: "cart add", s: "passed", t: 890, r: 0, g: ["cart"] },
  { n: "cart remove", s: "passed", t: 1310, r: 1, g: ["cart"] },
  { n: "checkout valid", s: "passed", t: 12400, r: 0, g: ["smoke", "checkout"] },
  { n: "checkout declined", s: "failed", t: 2050, r: 3, g: ["checkout", "payment"] },
  { n: "checkout offline", s: "skipped", t: 0, r: 0, g: ["checkout"] },
];

let x = 0;
let y = 0;
let z = 0;
let w = 0;
let m = q[0];
let v = [];
let u = [];

for (const i of q) {
  if (i.s === "passed") x = x + 1;
  else if (i.s === "failed") { y = y + 1; v.push(i.n); }
  else if (i.s === "skipped") z = z + 1;
  else w = w + 1;
  if (i.t > m.t) m = i;
  if (i.r >= e) u.push(i.n);
  if (i.g.includes("smoke") && i.s === "failed") console.log("SMOKE BROKE: " + i.n);
}

const p = (x / (x + y)) * 100;
const o = p === 100 ? "GREEN" : p >= 90 ? "AMBER" : "RED";

console.log(a, b, c);
console.log(x, y, z, w, p.toFixed(1), o);
console.log(m.n, m.t);
console.log(v);
console.log(u);
```

**Your task.** Produce `assignment-2-3/after.ts` with identical behavior and readable code, plus a written defense.

**Requirements.**

| # | Requirement |
|---|---|
| 1 | Every variable renamed to something meaningful; no single-letter names except a conventional callback parameter |
| 2 | Every object property renamed (`n`, `s`, `t`, `r`, `g` → meaningful names) |
| 3 | Quantities carry units in their names |
| 4 | Every `let` that can be `const` is `const`; each remaining `let` justified in a comment |
| 5 | All environment values and thresholds declared as named constants at the top |
| 6 | Booleans, if you introduce any, named as questions |
| 7 | Annotations on empty collections; no redundant annotations on obvious literals |
| 8 | `status` typed as a union of its four legal values, not `string` |
| 9 | Output labelled and self-describing — a reader of the output knows what each number means |
| 10 | **Identical behavior.** Same numbers, same names, same order |
| 11 | `npx tsc --noEmit` clean under `strict`; no `any`, no casts |
| 12 | A `DEFENSE.md` (see below) |

**`DEFENSE.md` must contain:**

1. A table of every renaming: old name, new name, one line on what the old name let a reader get wrong.
2. For each surviving `let`, a paragraph justifying it.
3. Your reasoning for the `passRate` denominator, which the original computes as `x / (x + y)` — say what that means, whether it is the right choice, and what it does to `blocked` and `skipped` results.
4. **Three bugs or latent problems in the original that your refactor made visible but did not fix.** Describe each and say what fixing it would need. There are at least four to find.
5. One paragraph: which single rename most improved the code's readability, and why.

**Constraints.**

- Behavior must not change. Verify by running both files and diffing the output:

```bash
npx tsx before.ts > before.txt
npx tsx after.ts > after.txt
diff before.txt after.txt    # must be empty
```

- Do not restructure into functions. That is [Chapter 2.7](07-functions.md), and mixing refactoring with restructuring makes the diff impossible to verify — which is itself a professional lesson worth learning here.
- Do not fix the bugs you find. Document them. Separating "make it readable" from "make it correct" into two changes is exactly what [Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) asks of a reviewable pull request.

**Acceptance criteria.**

- [ ] `diff` between the two outputs is empty
- [ ] No single-letter variables; all object properties renamed
- [ ] Units in the names of all quantities
- [ ] Every avoidable `let` eliminated; survivors justified in comments
- [ ] Environment values and thresholds are named constants
- [ ] `status` is a union type
- [ ] Empty collections annotated; no redundant annotations
- [ ] Output labelled
- [ ] `tsc --noEmit` clean, no `any`
- [ ] `DEFENSE.md` complete, with ≥3 documented latent problems

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Naming quality | 30% | Every name says what the value means; units present; booleans as questions |
| `const` discipline | 15% | Only genuine accumulators remain as `let`, each justified |
| Behavior preservation | 15% | `diff` is empty |
| Bug identification | 25% | Three or more real latent problems found and correctly described |
| Annotation judgment | 10% | Present where useful, absent where noise |
| Correctness | 5% | Compiles strict, no `any` |

Note that **finding the bugs is worth more than the renaming.** That is deliberate: the renaming is mechanical, and noticing that the original's pass-rate denominator silently excludes `blocked` and `skipped` results is the skill that makes you useful.

**Self-check.** Give `after.ts` to someone who has not seen `before.ts` and ask them what the script reports. If they can tell you in one sentence, you have succeeded. Then ask them to spot a bug — if your refactor was good, they will find one you documented.

> **AI usage: restricted.** Same as [Chapter 2.1](01-thinking-like-a-programmer.md).
>
> **Allowed:** "what does `noUncheckedIndexedAccess` mean," "explain why an empty array infers as `never[]`," "is `hasFailedSmokeTests` a reasonable boolean name?" (asking about *your* proposal).
> **Not allowed:** pasting `before.ts` and asking for a refactor, or asking what bugs it contains.
>
> Requirement 4 is the part AI would ruin. Finding latent defects in unfamiliar code is the core professional skill this assignment builds, and it only builds by being done.

---

## I. Quiz

Eight questions. Answer key: [`answer-keys/part-2/03-variables-and-constants.answers.md`](../answer-keys/part-2/03-variables-and-constants.answers.md).

**1.** What is the difference between `let` and `const`?

- A) `const` values cannot be modified in any way
- B) `const` prevents the name from being rebound to a different value; `let` allows it
- C) `const` is for primitives and `let` is for objects
- D) `const` is faster at runtime

**2.** What does this print?

```ts
const results = [{ name: "login", status: "passed" }];
results.push({ name: "checkout", status: "failed" });
results[0].status = "failed";
console.log(results.length, results[0].status);
```

- A) A compile error on the `push`
- B) `1 passed`
- C) `2 failed`
- D) A runtime error on the property assignment

**3.** True or false: `const config = { retries: 2 }` followed by `config.retries = 3` is a compile error.

**4.** Which declaration genuinely requires `let`?

- A) The base URL of the environment under test
- B) An array of failed test names built by pushing into it
- C) A running count incremented inside a loop
- D) A user object whose `cartTotal` property gets updated

**5.** Why does this line cause trouble?

```ts
const failures = [];
failures.push("login broke");
```

- A) `const` prevents `push`
- B) There is no value to infer from, so the array's element type is `never[]` (or `any[]`), and the `push` either errors confusingly or silently disables type checking
- C) Arrays must be declared with `let`
- D) It is fine

**6.** Which is the best name for a boolean recording whether any test failed?

- A) `status`
- B) `failFlag`
- C) `hasFailures`
- D) `check`

**7.** Which annotation is redundant noise rather than useful information?

- A) `const failures: string[] = [];`
- B) `const durationMs: number = 2050;`
- C) `function passRate(passed: number, total: number): number`
- D) `const config: EnvironmentConfig = loadConfig();`

**8.** Scenario. Two tests pass when run individually and one fails intermittently when the suite runs in parallel. A `helpers.ts` file contains `export let currentUser = { email: "qa@example.com", cartTotal: 0 };` and both tests do `currentUser.cartTotal += 99`. What is the root cause, and would changing `let` to `const` fix it?

- A) The root cause is `let`; changing to `const` fixes it
- B) The root cause is shared mutable state; `const` would prevent rebinding but not the `+=` mutation, so it would not fix it — each test must build its own data
- C) The tests need to run sequentially; there is no way to fix this
- D) `+=` is not allowed on a `const`, so the code would not compile

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Variable | A name bound to a value; a label on a value, not a container |
| Declaration / initialization / assignment / reassignment | Four distinct steps; `const` forbids only the last |
| `const` by default | Fewer things to track, accidental reassignment becomes a compile error |
| `const` ≠ immutable | It fixes the binding, not the contents |
| `var` | Never; it leaks scope and permits redeclaration |
| Inference | TypeScript reads the type from the value; identical checking to annotating |
| Literal type inference | `const status = "failed"` infers `"failed"`, not `string` |
| Annotations that earn their keep | Empty collections, function boundaries, deliberately wider types, hidden types |
| Naming | camelCase; nouns for values; questions for booleans; units in names; no abbreviations |
| Scope | A name exists only in its block; declare in the smallest block that needs it |

### Mistakes recap

`let` by habit · believing `const` freezes contents · abbreviated names · annotating the obvious · not annotating empty arrays · one variable with two meanings · booleans named as nouns.

### Habits to carry forward

**`const` unless you have a reason.** And be able to say the reason out loud, because a reviewer will ask.

**Name for the reader at 2am.** The person triaging your failed test has your names and the failure output. Nothing else.

**Units in names.** `durationMs`, `timeoutMs`, `priceCents`. Third time this course has said it, and it will say it again in [Chapter 8.1](../part-8-professional-engineering/01-clean-code-for-automation.md).

**One name, one meaning, for its whole lifetime.**

### Competency check

> **Can you read your own code from last week and understand every name without opening anything else?**

Test it literally: open your [Chapter 2.2](02-data-types.md) assignment and read it cold. Any name that makes you pause is a name that would have stopped a colleague entirely.

Two secondary checks:

- Can you explain, in one sentence each, why `const results = []` allows `results.push(x)` but forbids `results = []`?
- Given a script with five `let` declarations, can you say which are legitimate accumulators and which are laziness?

**Gate for this chapter:** you can state the C.5 binding-versus-contents distinction without hedging, and your Assignment 2.3 `DEFENSE.md` found at least three latent problems. [Chapter 2.4](04-operators.md) starts combining these named values into expressions, and the `==` versus `===` decision it covers is the next place where a small choice produces a false-passing test.

---

[← 2.2 Data Types](02-data-types.md) · [Next: 2.4 Operators →](04-operators.md)
