# Answer Key — Chapter 2.3: Variables and Constants

[← Answer Keys](../overview.md) · [Chapter 2.3](../../part-2-programming-fundamentals/03-variables-and-constants.md)

> **Instructor note:** Questions 2, 3, and 8 all test the same idea — that `const` fixes the binding and not the contents — from three angles. If a learner gets 1 right and 2/3/8 wrong, they have memorized the definition without understanding it, which is the most common outcome in this chapter and worth a whiteboard demonstration rather than a re-read.

---

## Question 1 — `let` versus `const`

**Correct answer: B** — `const` prevents rebinding the name; `let` allows it.

**Why:** That is the entire difference (Section C.3).

**Why the others are wrong:**

- **A** — The chapter's central misconception. `const` says nothing about whether the *value* can be modified. See Q2 and Q3.
- **C** — There is no such rule. `const` works with any type.
- **D** — Types and declaration keywords are compile-time concepts with no runtime performance difference. A learner who believes `const` is faster has a wrong model of what the compiler does.

**Reread if missed:** Sections C.3 and C.5.

---

## Question 2 — Mutating a `const` array

**Correct answer: C** — `2 failed`.

**Why:** Both `push` and the property assignment change the array's contents, which `const` permits. Only rebinding (`results = [...]`) is forbidden (Section C.5).

**Why the others are wrong:**

- **A** — The expected answer for anyone who thinks `const` means immutable. Worth demonstrating live: run example E.2 in front of the cohort, because reading it is less convincing than watching it.
- **B** — Would require the `push` to silently fail, which is not a thing JavaScript does. Operations either work or throw.
- **D** — No error is thrown. `Object.freeze` would make this throw under strict mode, and `const` alone does nothing.

**The model to reinforce:** `const` nails a label to a value. Whether that value is modifiable is a property of the value, not of the label.

**Reread if missed:** Section C.5, then run E.2.

---

## Question 3 — `config.retries = 3` on a `const` object

**Correct answer: False.** It compiles and runs fine.

**Why:** Changing a property mutates the object; it does not rebind `config` (Section C.5).

**How to make it an error, if a learner asks:**

```ts
const config: { readonly retries: number } = { retries: 2 };
config.retries = 3;   // now a compile error
```

Or `Object.freeze`, with the caveat that it is shallow and only throws under strict mode.

**The point to land:** this course does not teach you to lock objects down. It teaches you to avoid sharing mutable ones, which is [Chapter 6.4](../../part-6-framework-engineering/04-test-data-management.md). Locking is a workaround for a design you should not have.

**Reread if missed:** Section C.5.

---

## Question 4 — Which needs `let`

**Correct answer: C** — A running count incremented inside a loop.

**Why:** An accumulator is rebound on each iteration (`count = count + 1`), which requires `let`. This is one of the two legitimate uses in Section C.3.

**Why the others are wrong, and this is the instructive part:**

- **A** — A base URL is set once and never changes. `const`.
- **B** — An array built by pushing is **mutated, not rebound**. `const failures: string[] = []` followed by `failures.push(...)` works perfectly. This is the distractor that catches learners who have not internalized C.5.
- **D** — Same shape as B. `user.cartTotal = 99` mutates a property; the name still points at the same object. `const`.

**Worth saying explicitly:** B and D describe values that *change*, and both should be `const`. The question is never "does this value change" but "does this *name* ever point at a different value."

**Reread if missed:** Sections C.3 and C.5.

---

## Question 5 — `const failures = []`

**Correct answer: B** — There is no value to infer from, so the element type is `never[]` (or `any[]`), and the `push` either errors confusingly or silently disables checking.

**Why:** Inference reads the type from the value. An empty array supplies nothing to read, so TypeScript falls back — to `never[]` under strict inference, meaning "an array that can hold nothing," so `push("...")` fails with a message about `never` that reads as gibberish until you know why (Section C.7).

**Why the others are wrong:**

- **A** — `const` permits `push`, as Q2 established.
- **C** — No such rule.
- **D** — Something does go wrong, though the exact symptom depends on configuration, which is part of what makes it confusing.

**The fix, and why it matters here specifically:**

```ts
const failures: string[] = [];
```

This is the most common legitimate annotation in QA code, because "start with an empty list and fill it while scanning results" is a pattern you will write dozens of times before Part IV.

**Reread if missed:** Sections C.6 and C.7, and F.5.

---

## Question 6 — Best boolean name

**Correct answer: C** — `hasFailures`.

**Why:** It reads as a yes/no question, so `if (hasFailures)` is a sentence and the meaning of `true` is unambiguous (Section C.8).

**Why the others are wrong:**

- **A** — `status` is a noun and, worse, is the name commonly used for a *string* status elsewhere in the same domain. A reader seeing `status` reasonably expects `"passed"`, and [Chapter 2.2](../../part-2-programming-fundamentals/02-data-types.md) D.2 showed what happens when a truthiness check meets the string `"false"`.
- **B** — `failFlag` is closer, and "flag" adds nothing: every boolean is a flag. It also does not resolve whether `true` means failures exist or failures are suppressed.
- **D** — `check` describes an action, not a value, and says nothing about what was checked.

**The test to give learners:** read the name inside `if (...)` and see whether it forms a question with an obvious answer.

**Reread if missed:** Section C.8, and F.7.

---

## Question 7 — Which annotation is noise

**Correct answer: B** — `const durationMs: number = 2050;`

**Why:** The value is visibly a number. The annotation restates what the reader and the compiler already know (Section C.7, F.4).

**Why the others earn their keep:**

- **A** — Empty array: inference has nothing to work from. Required.
- **C** — Function parameters cannot be inferred, and the return annotation catches a branch that returns the wrong thing.
- **D** — The type is not visible on the page; the annotation tells the reader what they are holding without opening `loadConfig`.

**The principle:** an annotation should add information. If a reader learns nothing from it, it is noise, and noise trains people to skim — which means the annotations that matter get skimmed too. Several rubrics in this course treat over-annotation as a readability defect, and learners are often surprised by that.

**Reread if missed:** Section C.7, F.4.

---

## Question 8 — Parallel flakiness from shared state

**Correct answer: B** — The root cause is shared mutable state; `const` would prevent rebinding but not the `+=`, so it would not fix it. Each test must build its own data.

**Why:** This is the payoff question for the whole chapter (Section D.3). `currentUser.cartTotal += 99` mutates a property of a shared object. Changing `let` to `const` forbids `currentUser = {...}` and permits `currentUser.cartTotal += 99` exactly as before, so the flakiness survives the change untouched.

**Why the others are wrong:**

- **A** — The tempting answer, because `let` is genuinely a smell here and the question is about `let`. But it confuses the *signal* with the *cause*. A learner who picks A will "fix" real flakiness by changing keywords and be baffled when nothing improves.
- **C** — Defeatist and wrong. The fix is straightforward: build data per test. Running sequentially would hide the symptom while leaving an order-dependent suite, which [Chapter 3.1](../../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) treats as a defect in its own right.
- **D** — `+=` on a property of a `const` object is perfectly legal, which is precisely the point of the question.

**The two-part lesson worth stating on the board:**

1. `const` is necessary but not sufficient. It makes shared mutable state *visible* and deliberate; it does not remove it.
2. The real fix is architectural — fresh data per test ([Chapter 6.4](../../part-6-framework-engineering/04-test-data-management.md)).

**The diagnostic to give them:** a test that passes alone and fails in a suite means shared state, until proven otherwise. That heuristic is worth more than most of [Chapter 6.9](../../part-6-framework-engineering/09-diagnosing-flaky-tests.md)'s content, and they can have it now.

**Reread if missed:** Sections C.5 and D.3.

---

## Exercise notes for instructors

### G.1 — `let` or `const`

| # | Answer | Note |
|---|---|---|
| 1 | `const` | Set once |
| 2 | `let` | Accumulator — genuine |
| 3 | `const` | Loaded once; contents may be read freely |
| 4 | `let` | Accumulator — genuine |
| 5 | `const` | |
| 6 | `const` | Property mutation, not rebinding |
| 7 | `const` | `push` mutates |
| 8 | `let` | Accumulator — genuine |
| 9 | `const` | |
| 10 | `const` | Read once, used once |
| 11 | `const` with a ternary, or `let` with `if`/`else` |
| 12 | `const` | |

**Task A — why 6 and 7 are not contradictions.** Both values change; neither *name* is ever rebound. This is the C.5 distinction, and a learner who answers this correctly has the chapter.

**Task B — item 11 both ways:**

```ts
// let version
let message;
if (allPassed) message = "All tests passed";
else message = "Some tests failed";

// const version
const message = allPassed ? "All tests passed" : "Some tests failed";
```

The `const` version is preferable: one line, no window in which `message` is `undefined`, and the two outcomes sit side by side where a reader can compare them. Accept the `let` version as legitimate — it *is* one of C.3's honest uses — but note that the ternary removes the need.

**Task C — the three that need `let`:** 2, 4, and 8. What they share is that each is an accumulator updated across loop iterations. Worth previewing that [Chapter 2.8](../../part-2-programming-fundamentals/08-arrays.md) removes even these, via `filter().length` and `reduce()`, at which point a suite can plausibly contain zero `let` declarations.

### G.2 — Rename fifteen variables

**Model rewrite:**

```ts
const BASE_URL = "https://staging.demoshop.example";
const DEFAULT_TIMEOUT_MS = 30_000;
const HTTP_OK = 200;

const apiResults = [
  { endpoint: "GET /products", statusCode: 200, durationMs: 340, errorMessage: null },
  { endpoint: "POST /cart", statusCode: 201, durationMs: 890, errorMessage: null },
  { endpoint: "POST /checkout", statusCode: 500, durationMs: 4200, errorMessage: "internal error" },
  { endpoint: "GET /orders", statusCode: 200, durationMs: 410, errorMessage: null },
];

let successCount = 0;
let errorCount = 0;
const failedEndpoints: string[] = [];
let slowestResult = apiResults[0];

for (const result of apiResults) {
  if (result.statusCode >= 200 && result.statusCode < 300) {
    successCount = successCount + 1;
  } else {
    errorCount = errorCount + 1;
    failedEndpoints.push(result.endpoint);
  }
  if (result.durationMs > slowestResult.durationMs) {
    slowestResult = result;
  }
}

const successRatePercent = (successCount / apiResults.length) * 100;
const meetsTarget = successRatePercent >= 95;

console.log(`Successful:   ${successCount}`);
console.log(`Errors:       ${errorCount}`);
console.log(`Success rate: ${successRatePercent.toFixed(1)}%`);
console.log(`Meets 95% target: ${meetsTarget ? "yes" : "no"}`);
console.log(`Slowest:      ${slowestResult.endpoint} (${slowestResult.durationMs} ms)`);
console.log(`Failed:       ${failedEndpoints.join(", ")}`);
```

**Task C — the misleading name.** `s` for `statusCode`. In QA vocabulary `s`/`status` overwhelmingly suggests `"passed"`/`"failed"`, and here it holds an HTTP status code. That is worse than vague: it primes a reader toward the wrong type. Also creditable: `t` reads as "time" or "type" with no unit, and `e` could be "error," "expected," or "environment."

**Task D — `let x = []`.** Two problems. The name says nothing, and the empty literal with no annotation gives `never[]` or `any[]` (Q5). The rewrite makes it `const failedEndpoints: string[] = []` — annotated, renamed, and `const`, since pushing is mutation.

**Task E — the latent bug.** `successRatePercent` divides by `apiResults.length` with no empty-array guard. On an empty input it is `0 / 0`, which is `NaN`, and `NaN >= 95` is `false` — so `meetsTarget` reports a legitimate-looking "no" for a run that never happened. Also creditable: `slowestResult = apiResults[0]` crashes or yields `undefined` on an empty array, which under `noUncheckedIndexedAccess` is a compile error and is the setting doing its job.

### G.3 — Eliminate the `let`s

**Model refactor:**

```ts
const ENVIRONMENT_URLS = {
  staging: "https://staging.demoshop.example",
  production: "https://demoshop.example",
} as const;

const environment: keyof typeof ENVIRONMENT_URLS = "staging";
const baseUrl = ENVIRONMENT_URLS[environment];

const results = [ /* unchanged */ ];

const totalDurationMs = results.reduce((sum, r) => sum + r.durationMs, 0);
const retriedTestNames = results.filter((r) => r.retries > 0).map((r) => r.name);
const passedCount = results.filter((r) => r.status === "passed").length;
const passRate = passedCount / results.length;

const verdict =
  passedCount === results.length ? "GREEN" : passRate >= 0.9 ? "AMBER" : "RED";
```

Zero `let` remain. Accept solutions that keep one — the exercise says "at most one" — and accept `for` loops with accumulators for `totalDurationMs`, since `reduce` is [Chapter 2.8](../../part-2-programming-fundamentals/08-arrays.md) and learners meeting it here are reading ahead.

**Techniques per `let`:**

| Original | Technique |
|---|---|
| `environment` | Never reassigned; was `let` by habit |
| `baseUrl` | Lookup object, or a ternary |
| `totalDuration` | `reduce`, or a `const` holding the loop's result |
| `retriedTests` | `const` + `push` (mutation), or `filter().map()` |
| `passCount` | `filter().length` |
| `verdict` | Nested ternary |

**Task C — the technique.** A value computed inside a block and used outside it wants to be **extracted into a function that returns it**. `function computeVerdict(results): Verdict` makes the value a return rather than an out-parameter. It improves testability because a function with inputs and a return can be checked in isolation — the independent-verification property from [Chapter 2.1](../../part-2-programming-fundamentals/01-thinking-like-a-programmer.md) C.6 — whereas logic embedded in a block can only be exercised by running everything around it.

**Task D — one loop or three?** This is a real disagreement and the reasoning is what is assessed.

*For combining:* one pass over the data instead of three, which matters at scale; all the per-result logic sits in one place.

*For separating:* each pass has one purpose and a name, so a reader can find "how is total duration computed" instantly; each can be extracted into a function independently; a change to one cannot break another. Three passes over a few thousand results is microseconds, and QA data sets are small.

The defensible position for this course: **separate, until profiling says otherwise.** Readability is the binding constraint in test code, not throughput. A learner arguing the other way with a concrete scale argument (millions of rows, a streaming source) has answered well.

**Task E — remaining problems.** Expect: `passRate` divides by `results.length` with no empty guard; `verdict` calls a run with zero results `RED` rather than reporting "no data"; `status` is still a free string so `"Passed"` would silently miscount; and the nested ternary is at the edge of readable and would be clearer as a function.

---

## Assignment 2.3 — grading notes

**Check the `diff` first.** If it is not empty, the learner changed behavior while refactoring, which is the specific professional failure the constraint exists to teach. Common cause: "fixing" the pass-rate denominator while renaming. Return it and make them separate the two changes.

**Requirement 4 of `DEFENSE.md` carries 25% and is where the assignment's value is.** The four latent problems in `before.ts`:

1. **`p = (x / (x + y)) * 100`** excludes `blocked` and `skipped` from the denominator entirely. With 5 passed, 2 failed, 1 skipped, 1 blocked, it reports 71.4% — which is a defensible number and is *undocumented*, so no reader can tell whether it was intended. This is [Chapter 2.1](../../part-2-programming-fundamentals/01-thinking-like-a-programmer.md) G.3 Task E arriving as real code.
2. **No empty-input guard.** `q` empty means `m = q[0]` is `undefined` and `p` is `NaN`, and `NaN === 100` is false while `NaN >= 90` is also false, so the verdict is `RED` — a plausible-looking answer for a run that did not happen.
3. **`s` is a free string.** `"Passed"` would fall through every branch into `w`, silently counted as "other."
4. **The `SMOKE BROKE` log fires inside the counting loop**, mixing reporting with computation, so the output order depends on data order and the loop cannot be reused.

Also creditable: `e` (the retry threshold) is compared with `>=` while named as if it were a maximum, so a test with exactly 3 retries is flagged — an off-by-one ambiguity that a good name (`RETRY_ALERT_THRESHOLD`) resolves. Learners who find that one have read carefully.

**A submission finding only the renaming.** If `DEFENSE.md` lists zero or one latent problem, the learner did the mechanical part and skipped the thinking. Worth a conversation rather than a grade: ask them to run `after.ts` with an empty results array in front of you.

**What a strong submission looks like:** the renaming table explains *what a reader could get wrong*, not just what the new name is; `status` is a union type and the defense notes that this alone would have prevented latent problem 3; the pass-rate discussion states which denominator the learner would advocate and why; and the "most improved readability" paragraph picks a property rename (`t` → `durationMs`) rather than a variable rename, on the grounds that the property name is repeated at every use site.
