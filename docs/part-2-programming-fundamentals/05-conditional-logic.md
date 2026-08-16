# Chapter 2.5 — Conditional Logic

🟢 **Beginner** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [2.3](03-variables-and-constants.md), [2.4](04-operators.md) |
| **Next chapter** | [2.6 Loops](06-loops.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Implement** branching with `if`, `else if`, and `else`, and **trace** which branch executes for given input.
2. **Refactor** nested conditions into guard clauses, and **explain** the readability benefit.
3. **Use** the ternary operator appropriately, and **identify** cases where it harms readability.
4. **Implement** a `switch` statement correctly, and **explain** fall-through and the role of `break`.
5. **Choose** between `if/else if`, ternary, and `switch` for a given problem, and **justify** the choice.
6. **Detect** logic errors caused by incorrect condition ordering or missing branches.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Comparison and logical operators, truthiness | [Chapter 2.4](04-operators.md) |
| Variables, constants, and naming | [Chapter 2.3](03-variables-and-constants.md) |
| Flowcharts for decisions | [Chapter 2.1](01-thinking-like-a-programmer.md) |

---

## C. Concept Explanation

### C.1 A condition is a verdict

A conditional is how a program makes a decision. In testing, decisions *are* the work: pass or fail, retry or report, skip on this environment or run everywhere. Every verdict your automation produces is a condition evaluated against evidence.

This chapter comes before loops for a specific reason. A loop without a decision is mere repetition. A loop containing a decision is logic. You need the decision first.

The mechanics are quickly learned. The judgment takes longer: **order is behavior**, nesting is a maintenance cost, and a missing branch is a silent pass.

### C.2 `if`, `else`, and `else if`

The smallest useful program that decides:

```ts
const status = "failed";

if (status === "failed") {
  console.log("Investigate this result");
}
```

The condition in parentheses is evaluated as a boolean. If it is `true`, the block runs. If it is `false`, the block is skipped and the program continues.

`else` covers the other case:

```ts
if (status === "failed") {
  console.log("Investigate this result");
} else {
  console.log("No action required");
}
```

Exactly one of those two blocks runs. Never both. Never neither.

`else if` adds more named cases, still evaluated **in order**, still taking the **first match**:

```ts
if (status === "failed") {
  console.log("Investigate");
} else if (status === "skipped") {
  console.log("Review skip reason");
} else if (status === "blocked") {
  console.log("Unblock the environment");
} else {
  console.log("No action required");
}
```

The `else` at the end is the unknown case. Leaving it off means an unexpected status produces silence — which in a classifier is a false green. [Chapter 1.1](../part-1-testing-fundamentals/01-what-is-software-testing.md) already established that silence is not evidence.

### C.3 Order is behavior

This is the most common beginner logic bug, and it is invisible at compile time.

```ts
const passRate = 95;

if (passRate >= 90) {
  console.log("AMBER");
} else if (passRate >= 100) {
  console.log("GREEN");
} else {
  console.log("RED");
}
```

A pass rate of 100 is also `>= 90`, so the first branch matches and `"GREEN"` is unreachable. The program compiles. It runs. It reports the wrong verdict for every clean run.

**The rule:** put the **narrower** condition first. `>= 100` is a subset of `>= 90`, so it must come first.

```ts
if (passRate >= 100) {
  console.log("GREEN");
} else if (passRate >= 90) {
  console.log("AMBER");
} else {
  console.log("RED");
}
```

A reliable way to find this class of bug: for every `else if`, invent an input that should reach it, then trace from the top. If an earlier condition also matches that input, the later branch is dead.

### C.4 Truthiness in conditions, and why explicit is safer

JavaScript treats some values as `false` in a condition even though they are not the boolean `false`. Those values are: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`. Everything else is truthy — including `"0"`, `"false"`, `[]`, and `{}`.

```ts
const failedCount = 0;

if (failedCount) {
  console.log("There were failures");
} else {
  console.log("Clean run");     // this runs — 0 is falsy
}
```

That happens to be correct for a count. It is a landmine for values where `0` or `""` is legitimate:

```ts
const durationMs = 0;           // a test that finished instantly

if (durationMs) {
  console.log(`Duration: ${durationMs}ms`);
} else {
  console.log("Duration missing");   // WRONG — 0 is a real measurement
}
```

**In test code, compare explicitly.**

```ts
if (durationMs !== undefined && durationMs !== null) {
  console.log(`Duration: ${durationMs}ms`);
}
```

Or, if you have already decided that `null` and `undefined` mean the same absence:

```ts
if (durationMs != null) {
  console.log(`Duration: ${durationMs}ms`);
}
```

That `!= null` is the one idiomatic use of loose equality remaining after [Chapter 2.4](04-operators.md). It matches both `null` and `undefined` and nothing else — including `0`.

### C.5 Nesting is a cost

Technically legal, practically unreadable:

```ts
function canPublish(run: {
  completed: boolean;
  failed: number;
  blocked: number;
  environment: string;
}): string {
  if (run.completed) {
    if (run.failed === 0) {
      if (run.blocked === 0) {
        if (run.environment !== "production") {
          return "publish";
        } else {
          return "hold: production requires a manual gate";
        }
      } else {
        return "hold: blocked tests";
      }
    } else {
      return "hold: failures";
    }
  } else {
    return "hold: run incomplete";
  }
}
```

Four levels. To find out why a production run is held, you have to walk in and then walk back out. At 2 a.m. this is how people introduce a second bug while fixing the first.

### C.6 Guard clauses: handle the exceptions first

The same function, inverted. Each exceptional case returns immediately. The happy path is the last line, unindented.

```ts
function canPublish(run: {
  completed: boolean;
  failed: number;
  blocked: number;
  environment: string;
}): string {
  if (!run.completed) {
    return "hold: run incomplete";
  }
  if (run.failed > 0) {
    return "hold: failures";
  }
  if (run.blocked > 0) {
    return "hold: blocked tests";
  }
  if (run.environment === "production") {
    return "hold: production requires a manual gate";
  }
  return "publish";
}
```

Same behavior. One screen of reading instead of a tree. Each reason for holding is a named, testable sentence.

**A guard clause is an early return that handles a case you do not want to think about any further.** After it, that case is gone. The rest of the function is simpler because of it.

This is the refactor you will perform more than any other in this course. Page object methods, API clients, and data validators all get clearer when the impossible cases leave first.

### C.7 The ternary operator

A ternary is an **expression** — it produces a value — whereas `if` is a **statement**. That is why ternaries belong on the right-hand side of an assignment and not as a substitute for every branch.

```ts
const label = failedCount === 0 ? "GREEN" : "RED";
```

Good uses are short, obvious either/or values:

```ts
const suffix = count === 1 ? "test" : "tests";
const displayName = result.errorMessage ?? "none";
const retryLabel = attempt < maxAttempts ? "retry" : "give up";
```

Bad uses nest, hide side effects, or require the reader to hold three questions at once:

```ts
// Do not do this.
const verdict =
  failed === 0
    ? blocked === 0
      ? skipped <= 2
        ? "GREEN"
        : "AMBER"
      : "RED"
    : "RED";
```

If you need more than one `?`, you need `if`/`else if` or named booleans. A nested ternary is not clever. It is a flowchart turned sideways.

### C.8 `switch`: one value, many named cases

`switch` reads well when you are comparing **one value** against a **fixed set of cases**. That is exactly the shape of "what should I do with this test status?"

```ts
function actionFor(status: string): string {
  switch (status) {
    case "passed":
      return "none";
    case "failed":
      return "investigate";
    case "skipped":
      return "review skip reason";
    case "blocked":
      return "unblock the environment";
    default:
      return "unknown status — do not ignore";
  }
}
```

Three rules, all load-bearing:

**1. `break` (or `return`) ends the case.** Without it, execution **falls through** into the next case. This is almost never what you meant.

```ts
switch (status) {
  case "failed":
    console.log("investigate");
    // missing break
  case "skipped":
    console.log("review skip reason");
    break;
  default:
    console.log("none");
}
```

If `status` is `"failed"`, both `"investigate"` *and* `"review skip reason"` print. The program did not crash. It did the wrong extra thing.

When a function `return`s from each case, `break` is unnecessary — the return already leaves. That is why the first example is safe.

**2. `default` is the unknown case.** Omit it and an unexpected value produces silence. In a classifier, silence is a false green. Always write `default`, even if it only throws or logs.

**3. Deliberate fall-through is allowed and must be commented.** Two statuses that share behavior:

```ts
switch (status) {
  case "failed":
  case "blocked":
    return "do not promote";
  case "passed":
  case "skipped":
    return "promotion depends on policy";
  default:
    return "do not promote";
}
```

Adjacent `case` labels with no code between them are the one readable form of fall-through. If there is any code above the next `case`, put a `// falls through` comment or, better, extract a helper and call it from both.

### C.9 Choosing the construct

| Situation | Construct | Why |
|---|---|---|
| One condition, maybe an alternative | `if` / `if`/`else` | Smallest thing that works |
| Several conditions that are not the same variable | `if` / `else if` / `else` | Each condition can be a different expression |
| Several conditions on **one** variable against a closed set | `switch` | The cases line up; the unknown case is visible |
| A single either/or **value** | ternary | It is an expression; it belongs in an assignment |
| Exceptional cases that should leave early | guard clauses | The happy path stays flat |
| More than one `?` in a ternary | stop; use `if` | Nested ternaries are unreadable |

`switch` is not "the tidy version of `if`." It is the right tool when the question is "which of these named values is this?" It is the wrong tool when the questions are different (`failed === 0`, `durationMs > budget`, `environment === "production"`).

### C.10 Exhaustiveness as a preview

In [Chapter 2.10](10-typescript-fundamentals.md) you will replace `status: string` with a **union**:

```ts
type TestStatus = "passed" | "failed" | "skipped" | "blocked";
```

A `switch` over that union, with a `default` that TypeScript can prove is unreachable, becomes a compile-time check: add a fifth status and every `switch` that forgot it fails to compile. [Project 2](../projects/project-2-test-case-management.md) requires this pattern, and graders will ask you to add a status and watch the compiler find the gaps.

You cannot do that yet — you do not have union types. What you *can* do now is write the `default`. That habit is the whole of exhaustiveness, minus the compiler's help.

### C.11 Combining conditions versus nesting them

Two ways to say "failed and critical":

```ts
// Combined — one decision, two facts
if (status === "failed" && severity === "critical") {
  return "page immediately";
}

// Nested — two decisions, the second only asked if the first is true
if (status === "failed") {
  if (severity === "critical") {
    return "page immediately";
  }
}
```

Prefer combining when both facts are part of **one** question. Prefer nesting (or, better, a guard) when the inner question only makes sense after the outer one — for example, you should not read `result.error.message` until you know `result.status === "failed"`.

A useful test: if you can name the combined condition in one phrase (`isCriticalFailure`), combine it and name it.

```ts
const isCriticalFailure = status === "failed" && severity === "critical";
if (isCriticalFailure) {
  return "page immediately";
}
```

Named booleans from [Chapter 2.4](04-operators.md) plus the branches in this chapter is how readable decision logic is actually written.

### C.12 Debugging conditionals with a value table

When a branch misbehaves, do not add `console.log` at random. Build a table of inputs and expected branches **before** you look at the code.

| passRate | failed | blocked | Expected verdict |
|---|---|---|---|
| 100 | 0 | 0 | GREEN |
| 90 | 4 | 0 | AMBER |
| 89.9 | 5 | 0 | RED |
| 100 | 0 | 1 | RED (blocked overrides) |
| 0 | 0 | 0 | NO DATA |

Then trace each row from the top of the function, writing down which condition is true. The first row that lands in the wrong branch *is* the bug, and the table tells you which condition is in the wrong order or missing.

This is the same tracing habit as [Chapter 2.1](01-thinking-like-a-programmer.md), applied to decisions. You will use it on every classifier you write, including the assignment at the end of this chapter.

---

## D. QA Context

### D.1 Classifying a result is the job

A raw test record arrives with several fields. Your job is to turn it into one of a small set of statuses. That is a precedence problem, not a data problem:

```ts
// Precedence, highest first:
// 1. missing name or status           -> needs-review
// 2. status is not a known value      -> needs-review
// 3. skipped                          -> skipped
// 4. blocked                          -> blocked
// 5. failed                           -> failed
// 6. passed                           -> passed
```

Order is the specification. Swap 3 and 5 and a skipped test that also has an error field (some reporters do this) becomes a failure. The function is not wrong in the abstract; it implements a different policy than the one you were given.

Write the precedence down *before* the `if` chain. The chain is a transcription of the policy. If you invent the order while typing, you will not notice when a later requirement contradicts it.

### D.2 Conditionals inside a test body are usually two tests

This is the design smell that will follow you into Playwright:

```ts
// Two tests hiding in one
if (environment === "staging") {
  expect(order.tax).toBe(8.25);
} else {
  expect(order.tax).toBe(0);
}
```

If the staging assertion fails, the production assertion never runs. If someone reads a green result, they do not know which branch executed. And the test's name can no longer describe one behavior.

The replacement, which [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) will make a formal rule: **two tests, or data-driven rows, not a branch.**

```ts
// Later, with Playwright's test.each — the idea is what matters now
// staging  -> expected tax 8.25
// sandbox  -> expected tax 0
```

Legitimate branches in test *support* code — choosing a base URL, deciding whether to retry, skipping on an unsupported browser — are fine. The smell is a branch that changes **what is being asserted**.

### D.3 Environment and retry decisions belong in named functions

```ts
function shouldRetry(attempt: number, maxAttempts: number, statusCode: number): boolean {
  if (attempt >= maxAttempts) {
    return false;
  }
  if (statusCode >= 500) {
    return true;
  }
  if (statusCode === 429) {
    return true;
  }
  return false;
}
```

This is support logic, not a test. It is also a complete specification: you can write a truth table for it (and you will, in the challenge exercise). Putting it in a named function means the test body stays linear, and the policy can be tested itself — a preview of [Chapter 2.7](07-functions.md).

### D.4 The unknown case is how classifiers stay honest

A reporter you have never seen sends `"timedOut"`. Your `switch` has cases for `passed`, `failed`, `skipped`, `blocked`. Without `default`, the timed-out test is treated as "no action" — a false green of the most expensive kind, because a timeout is usually a failure.

With `default`, you get `needs-review` or a thrown error, and a human looks. That is the [Chapter 1.1](../part-1-testing-fundamentals/01-what-is-software-testing.md) habit — state what you do not know — encoded as a branch.

---

## E. Code Examples

### E.1 Very simple — a boolean fork

```ts
const passed = true;

if (passed) {
  console.log("No defect to report");
} else {
  console.log("Open a defect");
}
```

Trace both values of `passed` before moving on. If you cannot say which line runs for `false`, do not continue.

### E.2 Practical — pass rate to a health label

```ts
const GREEN_MIN = 100;
const AMBER_MIN = 90;

function healthLabel(passRate: number | null): string {
  if (passRate === null) {
    return "NO DATA";
  }
  if (passRate >= GREEN_MIN) {
    return "GREEN";
  }
  if (passRate >= AMBER_MIN) {
    return "AMBER";
  }
  return "RED";
}

console.log(healthLabel(100));   // GREEN
console.log(healthLabel(90));    // AMBER
console.log(healthLabel(89.9));  // RED
console.log(healthLabel(null));  // NO DATA
```

Guard first (`null`), then narrowest threshold (`100`), then the next (`90`), then the remainder. The `else` is implicit in the final `return`.

### E.3 QA-oriented — classify a test status with `switch`

```ts
function classify(raw: string | undefined): string {
  if (raw === undefined || raw.trim() === "") {
    return "needs-review";
  }

  switch (raw.toLowerCase()) {
    case "passed":
    case "pass":
      return "passed";
    case "failed":
    case "fail":
    case "error":
      return "failed";
    case "skipped":
    case "skip":
      return "skipped";
    case "blocked":
      return "blocked";
    default:
      return "needs-review";
  }
}

console.log(classify("PASS"));      // passed
console.log(classify("timedOut"));  // needs-review
console.log(classify(undefined));   // needs-review
console.log(classify(""));          // needs-review
```

The guard handles missing input before the `switch` ever sees it. The `default` handles values the reporter invented. Deliberate fall-through maps aliases onto one status. This is the skeleton of the chapter assignment.

### E.4 Automation-oriented — nested validation refactored to guards

**Before** (the 2 a.m. version):

```ts
function publishDecision(run: {
  completed: boolean;
  passed: number;
  failed: number;
  blocked: number;
  environment: string;
}): string {
  if (run.completed) {
    if (run.passed + run.failed > 0) {
      if (run.failed === 0) {
        if (run.blocked === 0) {
          if (run.environment !== "production") {
            return "publish";
          }
          return "hold: production gate";
        }
        return "hold: blocked tests";
      }
      return "hold: failures";
    }
    return "hold: no tests executed";
  }
  return "hold: incomplete";
}
```

**After:**

```ts
function publishDecision(run: {
  completed: boolean;
  passed: number;
  failed: number;
  blocked: number;
  environment: string;
}): string {
  if (!run.completed) {
    return "hold: incomplete";
  }

  const executed = run.passed + run.failed;
  if (executed === 0) {
    return "hold: no tests executed";
  }
  if (run.failed > 0) {
    return "hold: failures";
  }
  if (run.blocked > 0) {
    return "hold: blocked tests";
  }
  if (run.environment === "production") {
    return "hold: production gate";
  }
  return "publish";
}
```

Behavior is identical. You can now write one test per `return` and know exactly which input reaches it. That is the competency check for this chapter.

---

## F. Common Mistakes

### F.1 Ordering conditions so a later branch can never run

```ts
if (n >= 0) { /* ... */ }
else if (n > 10) { /* unreachable */ }
```

Anything `> 10` is already `>= 0`. Trace a value that should hit the second branch; if it never can, swap or narrow the first condition.

### F.2 Four levels of nesting instead of guard clauses

If you are more than two `if`s deep, invert: handle the failing case and `return`. The [instructor notes](instructor-notes.md) for this part treat this as a live refactor specifically because learners believe nesting looks thorough.

### F.3 Assignment where comparison was intended

```ts
if (status = "failed") {   // assigns, then the string "failed" is truthy
  // this ALWAYS runs
}
```

`strict` TypeScript rejects this in a condition. If you ever see it, it is a defect, not a style issue. You meant `===`.

### F.4 Nested ternaries

One `?` is a value. Two is a puzzle. Use `if`/`else if` or named booleans.

### F.5 Missing `break` in `switch`

Accidental fall-through runs extra cases. Either `return` from each case, or `break`. If you intend fall-through, make the labels adjacent and comment it.

### F.6 No `default`, so unexpected values pass silently

`"timedOut"` is not `"failed"`. Without `default`, your classifier nods and moves on. That is a false green.

### F.7 Relying on truthiness where `0` or `""` is valid

`if (durationMs)` treats a genuine zero as missing. Compare explicitly.

### F.8 A branch inside a test that changes the assertion

If the expected value depends on data, you have two tests. Split them. A green result that might have asserted either of two things is not evidence.

---

## G. Exercise

Suggested total time: 100 minutes. Do them in order.

### G.1 Easy — Health label classifier (20 min)

Write `healthLabel(passRate: number | null): string` using the thresholds from E.2 (`GREEN` at 100, `AMBER` at 90, `RED` below, `NO DATA` for `null`).

Verify against these eight inputs. Write the expected output *before* you run the function.

| Input | Expected |
|---|---|
| `100` | `GREEN` |
| `90` | `AMBER` |
| `89.999` | `RED` |
| `0` | `RED` |
| `null` | `NO DATA` |
| `110` | decide and document — is over-100 a data error or GREEN? |
| `-1` | decide and document |
| `NaN` | decide and document |

Then answer: which of those last three would you send to `needs-review` instead, and why?

### G.2 Medium — Unguard the nest (35 min)

Refactor this function into guard clauses. **Do not change behavior.** Prove it by listing six inputs and the output before and after.

```ts
function reviewGate(result: {
  hasName: boolean;
  status: string;
  durationMs: number | null;
  retries: number;
}): string {
  if (result.hasName) {
    if (result.status === "passed" || result.status === "failed" || result.status === "skipped") {
      if (result.durationMs !== null) {
        if (result.durationMs >= 0) {
          if (result.retries <= 1) {
            return "accept";
          } else {
            return "reject: too many retries";
          }
        } else {
          return "reject: negative duration";
        }
      } else {
        return "reject: missing duration";
      }
    } else {
      return "reject: unknown status";
    }
  } else {
    return "reject: missing name";
  }
}
```

After the refactor, add one more thing the original cannot do cheaply: a comment above each guard stating the rule in one sentence.

### G.3 Challenge — Retry policy against a truth table (45 min)

Implement `shouldRetry` from the following policy. Then fill every row of the table by tracing, not by running.

**Policy, in precedence order:**

1. If `attempt >= maxAttempts`, do not retry.
2. If `statusCode` is `401` or `403`, do not retry (auth will not improve).
3. If `statusCode` is `429` or `>= 500`, retry.
4. If `statusCode` is `408`, retry.
5. Otherwise do not retry.

**Constraints:** `maxAttempts` is at least 1. `attempt` is 0-based (the first try is attempt `0`). Guard invalid inputs (`maxAttempts < 1`, `attempt < 0`, `statusCode` outside 100–599) by returning `false` and not throwing.

| # | attempt | maxAttempts | statusCode | Expected |
|---|---|---|---|---|
| 1 | 0 | 3 | 500 | |
| 2 | 2 | 3 | 500 | |
| 3 | 3 | 3 | 500 | |
| 4 | 0 | 3 | 429 | |
| 5 | 0 | 3 | 408 | |
| 6 | 0 | 3 | 404 | |
| 7 | 0 | 3 | 401 | |
| 8 | 0 | 3 | 403 | |
| 9 | 1 | 1 | 500 | |
| 10 | 0 | 3 | 200 | |
| 11 | 0 | 0 | 500 | |
| 12 | -1 | 3 | 500 | |
| 13 | 0 | 3 | 99 | |
| 14 | 0 | 3 | 503 | |

Then answer in writing:

**A.** Which two rules interact, and which one wins? Show the row that proves it.

**B.** Is any branch unreachable? If you think none is, name the input that reaches the "otherwise" path.

**C.** Why does this function return `false` on invalid input rather than throw? (There is a real answer; "it's easier" is not it.)

---

## H. Coding Assignment

### Assignment 2.5 — Test result classifier

**Objective.** Build a function that turns a raw result record into exactly one of `passed`, `failed`, `skipped`, `blocked`, or `needs-review`, applying documented precedence, using guard clauses, and treating unknown input as `needs-review` rather than as a pass.

**Deliverable.** `assignment-2-5/classify.ts` exporting `classify(raw: RawResult): ClassifiedResult`.

```ts
interface RawResult {
  name?: string;
  status?: string;
  durationMs?: number | null;
  errorMessage?: string | null;
  skipReason?: string | null;
  blockedReason?: string | null;
}

type Verdict = "passed" | "failed" | "skipped" | "blocked" | "needs-review";

interface ClassifiedResult {
  name: string;
  verdict: Verdict;
  reason: string;
}
```

**Precedence** (highest first — this *is* the specification):

| Priority | Condition | Verdict | `reason` |
|---|---|---|---|
| 1 | `name` missing, empty, or whitespace | `needs-review` | `missing name` |
| 2 | `status` missing, empty, or whitespace | `needs-review` | `missing status` |
| 3 | `status` (trimmed, lowercased) is not one of `passed`, `pass`, `failed`, `fail`, `error`, `skipped`, `skip`, `blocked` | `needs-review` | `unknown status: <original>` |
| 4 | status aliases to skipped | `skipped` | `skipReason` if present and non-empty, else `skipped` |
| 5 | status aliases to blocked | `blocked` | `blockedReason` if present and non-empty, else `blocked` |
| 6 | status aliases to failed, **or** `errorMessage` is a non-empty string | `failed` | `errorMessage` if present and non-empty, else `failed` |
| 7 | status aliases to passed | `passed` | `passed` |
| 8 | anything else | `needs-review` | `unclassified` |

Priority 6 is the interesting one: a record with `status: "passed"` and a non-empty `errorMessage` is `failed`. Reporters lie. The error field is evidence.

**Required fixtures.** Hardcode these twelve and print one line each: `name | verdict | reason`.

| # | name | status | durationMs | errorMessage | skipReason | blockedReason |
|---|---|---|---|---|---|---|
| 1 | Login valid | passed | 1200 | | | |
| 2 | Login invalid | failed | 800 | Expected 401, got 200 | | |
| 3 | Checkout (ignored) | skipped | 0 | | feature flagged off | |
| 4 | Refund flow | blocked | 0 | | | sandbox down |
| 5 | *(missing)* | passed | 100 | | | |
| 6 | Empty status | *(empty string)* | 100 | | | |
| 7 | Flaky search | timedOut | 30000 | | | |
| 8 | Alias pass | PASS | 400 | | | |
| 9 | Alias error | error | 900 | boom | | |
| 10 | Liar | passed | 500 | assertion failed | | |
| 11 | Skip, no reason | skip | 0 | | | |
| 12 | Whitespace name | `"   "` | passed | 100 | | | |

**Requirements.**

| # | Requirement |
|---|---|
| 1 | Precedence implemented as **guard clauses** in the documented order; no `else` pyramid |
| 2 | Status comparison is case-insensitive and trims whitespace |
| 3 | Fixture 10 (`passed` + error message) is `failed` |
| 4 | Fixture 7 (`timedOut`) is `needs-review` with `unknown status: timedOut` |
| 5 | Fixture 5 and 12 are `needs-review` / `missing name` |
| 6 | `reason` is never empty |
| 7 | `name` on the output is the trimmed input name, or `"(unnamed)"` when missing |
| 8 | No `==` except the idiomatic `== null` |
| 9 | No nested ternary |
| 10 | `switch` used for alias mapping (or an equivalent lookup you can defend); `default` present |
| 11 | `npx tsc --noEmit` clean under `strict`; no `any` |

**Constraints.**

- Functions, `if`/`else`, `switch`, ternaries (single), operators, and string methods only. No arrays of rules, no `Map`. The point is to write the precedence by hand so you feel when a later rule is shadowed.
- Do not throw. Unclassifiable input is `needs-review`.

**Suggested approach.**

1. Write the twelve expected lines on paper. Fixture 10 is the one people get wrong.
2. Implement the missing-name and missing-status guards first. Run fixtures 5, 6, and 12.
3. Implement the alias `switch` so it returns a normalized status, then apply precedence 4–7 on the normalized value.
4. Apply the `errorMessage` override *after* normalization and *before* returning `passed`.
5. Only then format the output.

**Acceptance criteria.**

- [ ] All twelve fixtures print the specified verdict
- [ ] Fixture 10 is `failed`, not `passed`
- [ ] Fixture 7 includes the original status in `reason`
- [ ] Guards, not a nested pyramid
- [ ] `switch` (or defended equivalent) has a `default`
- [ ] `tsc --noEmit` clean, no `any`

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Precedence correctness | 30% | All twelve fixtures; fixture 10 and 7 especially |
| Guard-clause structure | 25% | Early returns in documented order; no `else` pyramid |
| Unknown-case honesty | 20% | Missing and unknown input become `needs-review`, never `passed` |
| Alias handling | 15% | Case/whitespace normalized; `default` present |
| Output quality | 10% | `reason` always useful; unnamed records labelled |

**Self-check.** Add a thirteenth fixture yourself: `status: "failed"`, empty `errorMessage`, non-empty `skipReason`. What should it be, according to the table? If your function returns `skipped`, priority 4 is running too late or too early — failed is priority 6, but skipped is 4, and the status is `failed`, so it must be `failed`. Write the row down before you run it.

> **AI usage: restricted.** Same as [Chapter 2.1](01-thinking-like-a-programmer.md).
>
> **Allowed:** "what does `trim` return for a string of spaces," "does `switch` compare with `===`."
> **Not allowed:** pasting the precedence table and asking for the function.
>
> Fixture 10 exists so you discover that reporters lie. An AI will encode the rule without you feeling why it is there.

---

## I. Quiz

Nine questions. Answer key: [`answer-keys/part-2/05-conditional-logic.answers.md`](../answer-keys/part-2/05-conditional-logic.answers.md).

**1.** Given `passRate = 100`, what does this print?

```ts
if (passRate >= 90) {
  console.log("AMBER");
} else if (passRate >= 100) {
  console.log("GREEN");
} else {
  console.log("RED");
}
```

- A) `GREEN`
- B) `AMBER`
- C) `RED`
- D) `AMBER` then `GREEN`

**2.** True or false: an `if`/`else` always executes exactly one of the two blocks.

**3.** What does this print when `durationMs` is `0`?

```ts
if (durationMs) {
  console.log("has duration");
} else {
  console.log("missing");
}
```

- A) `has duration`
- B) `missing`
- C) nothing
- D) a TypeScript compile error

**4.** A `switch` case for `"failed"` logs `"investigate"` and does not `break`. The next case is `"skipped"`, which logs `"review"`. What happens when `status` is `"failed"`?

- A) Only `"investigate"`
- B) Only `"review"`
- C) `"investigate"` then `"review"`
- D) A runtime error

**5.** Which construct is the best fit for mapping one status string onto an action, including an unknown case?

- A) A nested ternary
- B) A `switch` with `default`
- C) A `while` loop
- D) Five independent `if` statements with no `else`

**6.** Why are guard clauses preferred over a four-level `if` pyramid?

- A) They run faster
- B) They make exceptional cases leave early so the happy path stays flat and each reason is a named return
- C) TypeScript requires them
- D) They avoid using `return`

**7.** A Playwright test contains `if (env === "staging") { expect(tax).toBe(8.25); } else { expect(tax).toBe(0); }`. What is the design problem?

- A) `if` is not allowed in TypeScript
- B) Two behaviors are hiding in one test, so a failure in one branch hides the other and a green result is ambiguous
- C) The assertions should use `==`
- D) There is no problem if both environments are tested over time

**8.** What should a classifier do with a status value it does not recognize?

- A) Treat it as `passed`, since it did not fail
- B) Ignore it
- C) Return an explicit unknown / `needs-review` result (or throw), never a silent pass
- D) Retry the test

**9.** Scenario. You read this function and must name one input that reaches each `return`, plus one input that reaches none of them if such an input exists.

```ts
function band(n: number): string {
  if (n < 0) return "invalid";
  if (n < 10) return "low";
  if (n < 20) return "mid";
  if (n >= 20) return "high";
  return "unreachable?";
}
```

Which statement is correct?

- A) `"unreachable?"` is reached by `n = 20`
- B) `"unreachable?"` is reached by `n = NaN`
- C) Every finite number reaches one of the first four returns; `"unreachable?"` is dead for ordinary numbers
- D) `"low"` is unreachable

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| `if` / `else if` / `else` | Evaluate in order; take the first match |
| Order is behavior | A broad condition before a narrow one makes the narrow one dead |
| Truthiness | `0` and `""` are falsy; compare explicitly when they are valid values |
| Guard clause | Handle the exceptional case and return, so the happy path stays flat |
| Ternary | An expression for a short either/or value; never nest |
| `switch` | One value, many named cases; `break` or `return`; always write `default` |
| Fall-through | Missing `break` runs the next case; only adjacent labels are a readable form |
| Unknown case | Silence is a false green; `else` / `default` / `needs-review` is honesty |
| Named booleans | Combine facts into a phrase, then branch on the phrase |

### Mistakes recap

Unreachable `else if` · nesting instead of guards · `=` in a condition · nested ternaries · missing `break` · no `default` · truthiness on `0` · a branch that changes what a test asserts.

### Competency check

> **Can you read a branching function and name an input that reaches each branch, plus one that reaches none?**

Do it on `band` from quiz question 9, then on your Assignment 2.5 classifier. If you cannot name an input for `needs-review`, the unknown case is not actually reachable — which means you have not handled unknown input, you have only written the word.

Two secondary checks:

- Can you look at a four-level nest and rewrite it as guards without changing behavior?
- Can you explain, without notes, why a conditional inside a Playwright test is usually two tests?

**Gate for this chapter:** you are ready for [Chapter 2.6](06-loops.md) when you can take a precedence table and implement it as ordered guards, and when you treat a missing `default` as a defect. Loops will put a condition in motion; if the condition is already wrong, the loop will be wrong 200 times.

---

[← 2.4 Operators](04-operators.md) · [Next: 2.6 Loops →](06-loops.md)
