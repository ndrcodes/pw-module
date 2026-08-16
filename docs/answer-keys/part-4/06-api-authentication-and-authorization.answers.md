# Answer Key — Chapter 4.6: API Authentication and Authorization

[← Answer Keys](../README.md) · [Chapter 4.6](../../part-4-api-testing-and-automation/06-api-authentication-and-authorization.md)

> **Instructor note:** Question 1 is Demo 7. If anyone says A, stop and discuss IDOR.

---

## Question 1 — A reads B's order 200

**Correct answer: B** — Authorization defect / IDOR (Section C.1).

---

## Question 2 — 401 vs 403

**Correct answer: B** (Section C.1).

---

## Question 3 — Only no-token 401

**Correct answer: B** — Authn one case, not cross-user (Section C.1, F.2).

---

## Question 4 — 404 vs 403

**Correct answer: B** — 403 leaks existence (Section C.1).

---

## Question 5 — Shared token + cart writes

**Correct answer: B** — Shared mutable state (Section C.8).

---

## Question 6 — Commit staging `.env`

**Correct answer: False.**

**Why:** Never. Staging credentials are still secrets (Section D.3).

---

## Question 7 — Bearer with no token

**Correct answer: B** — 401 (Section C.5).

---

## Question 8 — Header typo

**Correct answer: B** — Client/test defect first (Section C.2).

---

## Question 9 — Customer on admin list

**Correct answer: B** — 403 (or 401 if rejected earlier) (Section C.7).

---

## Question 10 — Token fails Monday

**Correct answer: B** — Expiry / obtain at runtime (Section C.9).

---

## Assignment 4.6

Authz 35%: two resources, three verbs. 401-only suite fails this block. Grep for tokens/passwords. `NOTES.md` that says "we share admin for speed" without naming the collision fails isolation + notes.
