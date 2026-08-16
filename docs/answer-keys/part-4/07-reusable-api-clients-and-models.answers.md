# Answer Key — Chapter 4.7: Reusable API Clients and Models

[← Answer Keys](../README.md) · [Chapter 4.7](../../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md)

> **Instructor note:** Question 1 is the review rule. Ask "where do the assertions live?" in every 4.7 demo.

---

## Question 1 — expect in create

**Correct answer: B** — Clients must not assert (Section C.2).

---

## Question 2 — Tests call

**Correct answer: B** — `products.create` (Section C.2).

---

## Question 3 — Return type

**Correct answer: B** — `APIResponse` or raw + helper (Section C.5).

---

## Question 4 — `postProduct`

**Correct answer: A** — HTTP name, not operation (Section C.3).

---

## Question 5 — More classes always better

**Correct answer: False.**

**Why:** Rule of three; god clients and one-off wrappers are both wrong (Sections C.6–C.7).

---

## Question 6 — Register-login-seed

**Correct answer: B** — Service (Section C.7).

---

## Question 7 — One-off wrapper

**Correct answer: B** — Premature (Section C.7).

---

## Question 8 — `as Product`

**Correct answer: B** — Still a claim (Section C.4).

---

## Question 9 — Rename count

**Correct answer: B** — Quantify cost (Section C.1).

---

## Assignment 4.7

Grep `request.get` / `request.post` in `tests/` — any hit fails the 30% layer block. `expect` in `src/api` same. A brand-new suite that is not their 4.4–4.6 tests fails the lesson. `RENAME.md` with invented numbers and no before state is half of 15%.
