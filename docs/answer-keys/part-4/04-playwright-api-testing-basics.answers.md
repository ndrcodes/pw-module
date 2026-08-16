# Answer Key — Chapter 4.4: Playwright API Testing Basics

[← Answer Keys](../overview.md) · [Chapter 4.4](../../part-4-api-testing-and-automation/04-playwright-api-testing-basics.md)

> **Instructor note:** Question 2 is Demo 5. Run it live if anyone picks A.

---

## Question 1 — `{ request }`

**Correct answer: B** — Fixture destructuring (Section C.1).

---

## Question 2 — Missing await + toBeTruthy

**Correct answer: B** — Promise is truthy (Section C.9).

---

## Question 3 — `ok()`

**Correct answer: B** — Any 2xx (Section C.6).

---

## Question 4 — Relative URL

**Correct answer: B** — `baseURL` (Section C.3).

---

## Question 5 — `json()` type

**Correct answer: B** — `any`; treat as `unknown` (Section C.6).

---

## Question 6 — `--grep`

**Correct answer: B** — Title match (Section C.8).

---

## Question 7 — try/catch around get

**Correct answer: False.**

**Why:** A swallowed 500 is a green test (Section C.11).

---

## Question 8 — `let lastSku`

**Correct answer: B** — Independence (Section C.10).

---

## Question 9 — After first green

**Correct answer: B** — Break it; confirm red (Section C.11).

---

## Question 10 — `expect(response).toEqual({sku})`

**Correct answer: B** — `response` is not the parsed body (Section F.3).

---

## Assignment 4.4

Per-test red in `PROOF.md` is 30%. A single "I changed baseURL and everything failed" is not per-test. Hardcoded hosts fail craft. Remaining `ok()`-only tests fail assertions.
