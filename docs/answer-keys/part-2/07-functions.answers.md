# Answer Key — Chapter 2.7: Functions

[← Answer Keys](../README.md) · [Chapter 2.7](../../part-2-programming-fundamentals/07-functions.md)

> **Instructor note:** Questions 2, 5, and 10 are the Project 1 predictors. A learner who cannot explain Q4 should not start Chapter 2.8. G.3 is the extraction muscle; protect it.

---

## Question 1 — Missing `return`

**Correct answer: B** — `undefined`

**Why:** `n * 2` is computed and discarded. Without a return type annotation this compiles; the function yields `undefined` (Section C.3, F.8).

**Why D is wrong:** a return type of `: number` *would* make it a compile error. The snippet has one, actually — look again: `function double(n: number): number`. Under `strict` this **is** a compile error ("not all code paths return"). If learners argue D, they are right about *this exact snippet*. Accept D as well if they cite the annotation, and use it to teach why the annotation exists. The intended pedagogical answer is B: *the runtime result of a function that forgets `return`*. Mention both in class.

---

## Question 2 — Return vs print

**Correct answer: B** — Reuse, compose, test.

**Why:** Section C.3. Speed and language rules are irrelevant.

---

## Question 3 — Used only once

**Correct answer: False.**

**Why:** Functions name ideas. `isCriticalFailure(result)` used once still earns its keep (Section C.1).

---

## Question 4 — Type of `matches`

**Correct answer: C** — `(item: string) => boolean`

**Why:** A function that takes a string and returns a boolean (Section C.9). `boolean` is what `matches` *returns when called*, not what `matches` *is*.

---

## Question 5 — Purity

**Correct answer: B**

**Why:** Same input → same output; no outside change (Section C.7).

**Why the others fail:** A prints; C reads the clock; D mutates its argument.

---

## Question 6 — Default argument

**Correct answer: B** — `0`

**Why:** `decimals: number = 0` (Section C.4). Optional (`?`) would be `undefined`.

---

## Question 7 — Module-level mutation

**Correct answer: B** — Hidden shared state; tests pass alone and fail together.

**Why:** Sections C.6 and C.7. This is the seed of [Chapter 6.7](../../part-6-framework-engineering/07-parallel-execution-and-sharding.md).

---

## Question 8 — `processData`

**Correct answer: B** — It says neither what is processed nor what is produced (Section C.10).

---

## Question 9 — Shadowing

**Correct answer: C** — `failed` then `passed`

**Why:** The inner `status` shadows; the outer is unchanged (Section C.6).

---

## Question 10 — Two responsibilities

**Correct answer: B** — Asserting the rate requires performing the side effect.

**Why:** Sections C.8 and D.4. Split into a pure calculator and a writer.

---

## Exercise notes

### G.1

Boundary calls worth seeing: `calculatePassRate(1, 0) === 0`; `formatDuration(0)`; `isFailed(" FAILED ")`; `truncateName("ab", 4)` (no `...` if already short); `shouldRetry(3, 3, 500) === false`.

`truncateName` with `maxLength < 4`: accept a documented guard (return the name unchanged, or return `""`) — the point is they noticed.

### G.2

`summary` should return a string. If it prints, they converted the parts and then undid the lesson at the top.

### G.3

A strong split: `summarize(rows) → Report`, `formatPassRate`, `formatReport(report) → string`, `printReport(text)` (the only printer). Counting failed names can be `failedNames(rows)`. Watch for extracted functions that still print, and for a single `process()` that is the original script with a name.

---

## Assignment 2.7

**Demo numbers:** executed = 7 (not skipped), failed = 2, rate = 5/7 = 71.428… → `"71.4%"`. `formatDuration(2400)` → `"2.4s"` under the omitted-decimals rule.

**`isExecutedStatus("error")` is true** — `error` is a failed alias. Learners who make it false will under-count executed tests in Project 1.

**Common defects:** `console.log` left in a helper; `formatPassRate` duplicating the division and disagreeing with `calculatePassRate` on `0/0`; `countWhere` written but unused; `formatDuration(1000)` off-by-one on the unit switch (1000ms is `1s` or `1000ms` — either is fine if documented; the demo uses 2400).

**Self-check:** importing `calculatePassRate` from a third file is the definition of a library. If `demo.ts` inlines the math, requirement 3/4 failed even if the printed lines match.
