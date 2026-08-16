# Answer Key — Chapter 2.10: TypeScript Fundamentals

[← Answer Keys](../overview.md) · [Chapter 2.10](../../part-2-programming-fundamentals/10-typescript-fundamentals.md)

> **Instructor note:** Questions 2, 6, and 10 are the JSON-boundary predictors. Demo adding a union member and watching `never` fail. G.2 is the conversion moment for skeptics.

---

## Question 1 — House rule

**Correct answer: B** — Interfaces for object shapes; `type` for unions and aliases (Section C.3).

---

## Question 2 — Runtime checking

**Correct answer: False.**

**Why:** Types compile away. They do not inspect API responses (Section C.1).

---

## Question 3 — `any`

**Correct answer: B** — Turns off checking (Section C.12).

---

## Question 4 — `never[]`

**Correct answer: B**

**Why:** Untyped `[]` is inferred as `never[]` (Section C.2).

---

## Question 5 — Exhaustive `never`

**Correct answer: C** — Compile error at the `never` assignment (Section C.6).

---

## Question 6 — `as` after parse

**Correct answer: B** — A claim, not a check (Section C.12).

---

## Question 7 — Status type

**Correct answer: C** — Union literals (Section C.4, C.8).

---

## Question 8 — `Partial`

**Correct answer: B** — Factory overrides (Section C.11).

---

## Question 9 — Discriminated union

**Correct answer: B** — After narrowing on `status`, `error` is known if it lives on that variant (Section C.5).

---

## Question 10 — String duration after cast

**Correct answer: B** — Silent at compile time; runtime concatenation / wrong math (Section D.4).

---

## Exercise notes

### G.1

Deduct for annotating `const x = 5`. Empty array and parameters must be annotated.

### G.2

The pasted error should mention `timedOut` and `never` (or an unhandled case). A learner who "fixes" by widening to `string` has failed the exercise.

### G.3

The paragraph must name a *specific* hidden bug, not "types are good." `durationMs: any` allowing `"1240" + 10` is the expected story.

---

## Assignment 2.10

**Self-check is the grade.** If adding `"timedOut"` does not break `tsc`, `describeResult` is not exhaustive and/or `emptyCounts` is not `Record<ResultStatus, number>`.

**`first` call sites:** `TestCase | undefined` and `number | undefined` — if both show as `any` or `unknown`, the generic is unused.

**Common defects:** `status: string` sneaking back; `as` on `emptyCounts`; enum instead of union; `any` on `JSON` demo they added themselves.
