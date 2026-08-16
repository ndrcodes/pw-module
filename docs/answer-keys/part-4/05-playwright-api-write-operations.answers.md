# Answer Key — Chapter 4.5: Write Operations

[← Answer Keys](../overview.md) · [Chapter 4.5](../../part-4-api-testing-and-automation/05-playwright-api-write-operations.md)

> **Instructor note:** Question 8 is the `beforeAll` trap. Demo 6 if they miss Q2.

---

## Question 1 — 201 without GET

**Correct answer: B** — Lying create (Section C.2).

---

## Question 2 — Cleanup at bottom

**Correct answer: B** — Earlier expect throws (Section C.7).

---

## Question 3 — Shared title

**Correct answer: B** — Collision (Section C.6).

---

## Question 4 — Partial PUT

**Correct answer: B** — May erase omitted fields (Section C.3).

---

## Question 5 — After 400

**Correct answer: B** — Prove no new resource (Section C.5).

---

## Question 6 — Cleanup 404

**Correct answer: B** — Treat as success / ignore (Section C.7).

---

## Question 7 — Promise.all user+order

**Correct answer: B** — Order depends on user id (Section C.9).

---

## Question 8 — beforeAll shared product

**Correct answer: False.**

**Why:** Shared mutable record = order dependence and isolation failure (Section C.8, F.10).

---

## Question 9 — Location

**Correct answer: B** — Create contract; GET that URL (Section C.2).

---

## Question 10 — Repeat DELETE

**Correct answer: B** — Documented second status (Section C.4).

---

## Assignment 4.5

Workers + unique skus are 25%. Cleanup that only lives at the bottom of the body fails the 20% even if happy path is green. PUT/PATCH "I didn't have time" fails semantics. A 400 without a list/GET check fails integrity.
