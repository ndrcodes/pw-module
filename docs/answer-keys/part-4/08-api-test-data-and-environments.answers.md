# Answer Key — Chapter 4.8: API Test Data and Environment Configuration

[← Answer Keys](../README.md) · [Chapter 4.8](../../part-4-api-testing-and-automation/08-api-test-data-and-environments.md)

> **Instructor note:** Question 3 is the firing-offense item. Question 10 is the `git diff` proof — require it on the assignment.

---

## Question 1 — Switching staging

**Correct answer: B** — Configuration / env only (Section C.1).

---

## Question 2 — Missing password

**Correct answer: B** — Fail fast, name the variable (Section C.2).

---

## Question 3 — Commit staging `.env`

**Correct answer: False.**

**Why:** Never commit secrets (Section C.3).

---

## Question 4 — `if (env === "staging")`

**Correct answer: B** — Forked suite (Section C.4).

---

## Question 5 — Country codes

**Correct answer: B** — Static reference (Section C.5).

---

## Question 6 — `buildUser()` twice

**Correct answer: B** — Two unique emails (Section C.6).

---

## Question 7 — Overrides

**Correct answer: A** — One field + valid defaults (Section C.6).

---

## Question 8 — Cleanup already gone

**Correct answer: B** — 404/ignore (Section C.7).

---

## Question 9 — Long seed

**Correct answer: B** — Expensive and immutable (Section C.8).

---

## Question 10 — Proof

**Correct answer: B** — Empty `git diff tests/` + green run (Section C.1, E.1).

---

## Assignment 4.8

Grep tests for `http://`, `https://`, passwords. Any hit fails config + secrets. Factory that returns `user1@test.com` fails factories. `PROOF.md` without a diff is a zero on 10%. `.env` in the commit is a cap, not a style ding.
