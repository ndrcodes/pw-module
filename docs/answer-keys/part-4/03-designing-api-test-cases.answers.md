# Answer Key — Chapter 4.3: Designing API Test Cases

[← Answer Keys](../README.md) · [Chapter 4.3](../../part-4-api-testing-and-automation/03-designing-api-test-cases.md)

> **Instructor note:** Grade G.3 and Assignment 4.3 on the quality of cuts, not row count. Question 7 is that policy as a true/false.

---

## Question 1 — `ok()` only

**Correct answer: B** — Some 2xx occurred (Section C.2).

**Why the others are wrong:** A/C/D require body, schema, or a second user.

---

## Question 2 — Negative `qty: 0`

**Correct answer: B** — Documented 4xx, error shape, and no side effect (Section C.3).

**Why the others are wrong:**

- **A** — "not 200" accepts 500.
- **C** — 500 is a server defect, not the expected validation.
- **D** — time is dimension 10, not the negative case.

---

## Question 3 — Highest-value authz

**Correct answer: B** — Valid token, other user's resource (Section C.6).

**Why the others are wrong:** A is authn. C/D are other dimensions.

---

## Question 4 — Schema

**Correct answer: B** — Required fields, types, no unexpected nulls (Section C.5).

**Why the others are wrong:**

- **A** is a spot-check.
- **C** is a cast, not a check ([Chapter 2.13](../../part-2-programming-fundamentals/13-json.md)).
- **D** is the verbatim-body trap (C.2).

---

## Question 5 — Boundary set

**Correct answer: B** — 1, 99, 0, 100 (Section C.4).

**Why the others are wrong:** A/C/D skip an edge or an outside.

---

## Question 6 — Integrity

**Correct answer: B** — Follow-up GET/list (Section C.7).

**Why the others are wrong:** A is the same body twice. C/D do not prove persistence.

---

## Question 7 — Volume vs reasons

**Correct answer: False.**

**Why:** A 10-row matrix with reasons beats a 40-row list without (Section C.10).

---

## Question 8 — `toEqual` entire fixture

**Correct answer: B** — Additive fields break the test for the wrong reason (Section C.2).

---

## Question 9 — 50ms threshold

**Correct answer: B** — Flakes; use a generous smoke-alarm ceiling (Section C.8).

---

## Question 10 — One hour

**Correct answer: B** — Authz, negative+integrity, create+GET, money boundary (Section C.10).

**Why the others are wrong:** A is diminishing 401s. C/D are the weak-assertion extremes.

---

## Exercise / assignment notes

**G.1 weakest:** `ok()`, `body` truthy, `toEqual` snapshot, `not.toBe(500)`, `length > 0`, `true === true`.

**G.2:** Missing authz or missing reject-integrity fails the medium.

**Assignment 4.3:** Authz or integrity cut "to save time" without a replacement risk argument fails the 30% prioritization block. Copied E.3 as the only write-endpoint matrix without cart/orders specifics fails coverage.
