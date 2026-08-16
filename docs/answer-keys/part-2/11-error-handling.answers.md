# Answer Key — Chapter 2.11: Error Handling

[← Answer Keys](../overview.md) · [Chapter 2.11](../../part-2-programming-fundamentals/11-error-handling.md)

> **Instructor note:** Question 1 is the false-pass demo — run it live if you can. Question 2's "true" answer is the tutorial instinct this chapter exists to break.

---

## Question 1 — Catch around expect

**Correct answer: B** — Passed; the assertion throw was swallowed (Section C.9).

---

## Question 2 — Default is to catch

**Correct answer: False.**

**Why:** Test code should fail loudly (Section C.1). Catching is for recovery you can actually do.

---

## Question 3 — Diagnosable message

**Correct answer: C** (Section C.7).

---

## Question 4 — `finally`

**Correct answer: C** (Section C.5).

---

## Question 5 — Narrow `unknown`

**Correct answer: B** (Section C.6).

---

## Question 6 — Custom class

**Correct answer: B** — When callers distinguish causes (Section C.8).

---

## Question 7 — Throw string

**Correct answer: B** — No stack (Section C.3).

---

## Question 8 — Missing id

**Correct answer: B** — Fail fast (Section C.11).

---

## Question 9 — 422 vs network

**Correct answer: B** (Section C.10, D.3).

---

## Exercise notes

### G.1

Either normalize `"HIGH"` or reject it. Inconsistent handling between calls is the defect.

### G.2

Full marks: every rewrite has operation + input + expectation. The "worse real log" paragraph is the insight mark.

### G.3

Success-path returns unchanged. Each hidden bug named. A remaining `catch {}` fails the exercise.

---

## Assignment 2.11

**Batch + rethrow:** a stub that throws `Error("disk")` must abort the batch, not appear in `errors[]`.

**Messages:** `field` and `rule` visible without reading the class name.

**NOTES.md:** network/IO vs validation — if they say "catch everything in the loader," they missed D.3.

**Common defects:** one class for all errors; batch catches `Error`; title-length using `InvalidStatusError`; empty `catch` left in demo.
