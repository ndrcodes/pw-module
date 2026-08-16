# Answer Key — Chapter 2.5: Conditional Logic

[← Answer Keys](../overview.md) · [Chapter 2.5](../../part-2-programming-fundamentals/05-conditional-logic.md)

> **Instructor note:** Questions 1, 7, and 8 predict later success. A learner who still thinks unrecognized status should "count as passed" has not absorbed [Chapter 1.1](../../part-1-testing-fundamentals/01-what-is-software-testing.md). Exercise G.3's truth table is the one to protect if the session runs long.

---

## Question 1 — Unreachable GREEN

**Correct answer: B** — `AMBER`

**Why:** `100 >= 90` is true, so the first branch runs. The `else if (passRate >= 100)` is never asked. Order is behavior (Section C.3).

**Why the others are wrong:**

- **A** — The intended verdict, and the one the second branch would produce if it could run.
- **C** — `100` is not below 90.
- **D** — `else if` does not run after a match; `if`/`else if` is exclusive.

**Reread if missed:** Section C.3.

---

## Question 2 — `if`/`else` executes exactly one block

**Correct answer: True.**

**Why:** `else` is the complement of the `if` condition. One is true, the other is not. Never both, never neither (Section C.2).

**The nuance to mention:** this is about a single `if`/`else` pair. An `if` *without* `else` can execute zero blocks. An `if`/`else if`/`else` chain still executes exactly one arm, provided the `else` is present. Without `else`, a value that matches nothing executes zero arms — which is the unknown-case problem.

**Reread if missed:** Section C.2.

---

## Question 3 — Truthiness of `0`

**Correct answer: B** — `missing`

**Why:** `0` is falsy, so `if (durationMs)` is false. A real measurement of zero is treated as absence (Section C.4).

**Why the others are wrong:**

- **A** — Would be correct if the check were `durationMs != null`.
- **C** — `else` runs.
- **D** — This is legal TypeScript; it is a logic error, not a type error.

**Reread if missed:** Section C.4.

---

## Question 4 — Fall-through

**Correct answer: C** — `"investigate"` then `"review"`

**Why:** Without `break` or `return`, execution continues into the next case (Section C.8).

**Why the others are wrong:**

- **A** — What the author meant.
- **B** — Would require the first case to be skipped.
- **D** — Fall-through is legal JavaScript. That is what makes it dangerous.

**Reread if missed:** Section C.8, rule 1.

---

## Question 5 — Mapping one status to an action

**Correct answer: B** — A `switch` with `default`

**Why:** One value, a closed set of cases, and a visible unknown path (Section C.9).

**Why the others are wrong:**

- **A** — Nested ternaries fail the readability rule in C.7.
- **C** — Loops repeat; they do not classify.
- **D** — Five independent `if`s can all run. You want exclusive arms and a leftover case.

**Reread if missed:** Sections C.8 and C.9.

---

## Question 6 — Why guard clauses

**Correct answer: B** — Exceptional cases leave early; the happy path stays flat; each reason is a named return.

**Why:** Section C.6. Speed and language rules are not the point. Debuggability is.

**Why the others are wrong:**

- **A** — Performance is irrelevant at this scale.
- **C** — TypeScript does not require them.
- **D** — Guard clauses *use* `return`; they do not avoid it.

**Reread if missed:** Sections C.5 and C.6, then example E.4.

---

## Question 7 — Branch inside a test

**Correct answer: B** — Two behaviors hiding in one test.

**Why:** A failure in the staging assertion skips the production assertion. A green result does not say which branch ran. The test name cannot describe one behavior (Section D.2).

**Why the others are wrong:**

- **A** — False.
- **C** — Unrelated, and `==` is banned.
- **D** — "Over time" is not a substitute for a determinate test. You need both environments asserted, as two tests or two data rows.

**Reread if missed:** Section D.2.

---

## Question 8 — Unrecognized status

**Correct answer: C** — Explicit unknown / `needs-review` (or throw); never a silent pass.

**Why:** Silence is a false green. `"timedOut"` is usually a failure (Section D.4, C.10).

**Why the others are wrong:**

- **A** — The most expensive wrong answer in the chapter. "Did not fail" is not evidence of passing.
- **B** — Ignore is silence.
- **D** — Retry is a policy for known transient failures, not for unknown labels.

**Reread if missed:** Sections C.10 and D.4.

---

## Question 9 — Reachability of `band`

**Correct answer: C** — Every finite number hits one of the first four returns; `"unreachable?"` is dead for ordinary numbers.

**Why:** `n < 0`, `n < 10`, `n < 20`, `n >= 20` partition the finite number line. The final `return` is defensive leftover.

**Why the others are wrong:**

- **A** — `20 >= 20` hits `"high"`.
- **B** — `NaN < 0`, `NaN < 10`, `NaN < 20`, and `NaN >= 20` are all `false`, so `NaN` *does* reach `"unreachable?"`. This is the strongest distractor. C is still the best answer because it says "ordinary numbers" / finite numbers. If a learner picks B, they have found a real crack — congratulate them, then ask whether a classifier should accept `NaN` at all (it should guard it, like G.1).
- **D** — `n = 5` reaches `"low"`.

**Teaching note:** learners who mention `NaN` have transferred Chapter 2.2. Worth a public call-out.

**Reread if missed:** Section C.12.

---

## Exercise notes

### G.1 — Health label

Expected for the first five: `GREEN`, `AMBER`, `RED`, `RED`, `NO DATA`.

For the last three, accept any documented decision that is not silent:

| Input | Defensible verdicts |
|---|---|
| `110` | `GREEN` (treat as at-or-above 100) or `needs-review` (impossible pass rate) |
| `-1` | `needs-review` or `RED` with a documented "negative is below amber" rule |
| `NaN` | `needs-review` — `NaN >= 100` and `NaN >= 90` are both false, so a naive function prints `RED`, which is a lie |

The interesting answer to the follow-up: **all three** are data errors and belong in `needs-review` if this function is part of a pipeline. `RED` for `NaN` is a false signal.

### G.2 — Unguard the nest

A correct refactor looks like:

```ts
function reviewGate(result: { /* ... */ }): string {
  if (!result.hasName) return "reject: missing name";
  if (
    result.status !== "passed" &&
    result.status !== "failed" &&
    result.status !== "skipped"
  ) {
    return "reject: unknown status";
  }
  if (result.durationMs === null) return "reject: missing duration";
  if (result.durationMs < 0) return "reject: negative duration";
  if (result.retries > 1) return "reject: too many retries";
  return "accept";
}
```

Six proving inputs (any equivalent set):

| Input sketch | Output |
|---|---|
| no name | `reject: missing name` |
| status `"timedOut"` | `reject: unknown status` |
| `durationMs: null` | `reject: missing duration` |
| `durationMs: -1` | `reject: negative duration` |
| `retries: 2` | `reject: too many retries` |
| valid passed / 100ms / 0 retries | `accept` |

Watch for inverted comparisons (`retries <= 1` becoming `retries < 1`) and for dropping the `null` check so `durationMs < 0` runs on `null` (it does not crash, but `null < 0` is `false` via coercion — another reason to keep the guard).

### G.3 — Retry truth table

| # | attempt | maxAttempts | statusCode | Expected |
|---|---|---|---|---|
| 1 | 0 | 3 | 500 | `true` |
| 2 | 2 | 3 | 500 | `true` |
| 3 | 3 | 3 | 500 | `false` (rule 1) |
| 4 | 0 | 3 | 429 | `true` |
| 5 | 0 | 3 | 408 | `true` |
| 6 | 0 | 3 | 404 | `false` (otherwise) |
| 7 | 0 | 3 | 401 | `false` (rule 2) |
| 8 | 0 | 3 | 403 | `false` (rule 2) |
| 9 | 1 | 1 | 500 | `false` (rule 1: `1 >= 1`) |
| 10 | 0 | 3 | 200 | `false` |
| 11 | 0 | 0 | 500 | `false` (invalid maxAttempts) |
| 12 | -1 | 3 | 500 | `false` (invalid attempt) |
| 13 | 0 | 3 | 99 | `false` (invalid status) |
| 14 | 0 | 3 | 503 | `true` |

**A.** Rules 1 and 3 interact. Row 3 (and 9): a 500 would retry, but attempts are exhausted, so rule 1 wins.

**B.** The "otherwise" path is reached by 404 and 200 (rows 6 and 10). No policy branch is unreachable if invalid-input guards exist.

**C.** This function is support logic that may run in a tight retry loop. Throwing on a bad status code would take down the whole run because of one malformed response. Returning `false` means "do not retry" — the safer default — and leaves a classifier or logger to mark `needs-review`. Throwing is appropriate in a validator that *creates* data; it is not appropriate in a function that *reacts* to the world.

---

## Assignment 2.5 — expected fixtures

| # | verdict | reason (shape) |
|---|---|---|
| 1 | `passed` | `passed` |
| 2 | `failed` | `Expected 401, got 200` |
| 3 | `skipped` | `feature flagged off` |
| 4 | `blocked` | `sandbox down` |
| 5 | `needs-review` | `missing name` |
| 6 | `needs-review` | `missing status` |
| 7 | `needs-review` | `unknown status: timedOut` |
| 8 | `passed` | `passed` |
| 9 | `failed` | `boom` |
| 10 | `failed` | `assertion failed` |
| 11 | `skipped` | `skipped` |
| 12 | `needs-review` | `missing name` |

**Self-check row:** `failed` + empty error + skip reason → `failed` (status aliases to failed; skip reason is irrelevant unless status is skipped).

Common defects: treating fixture 10 as `passed`; using the empty name string as the output name instead of `"(unnamed)"`; an `else` pyramid that buries `default`; throwing on unknown status.
