# Answer Key — Chapter 3.2: Test Automation Architecture

[← Answer Keys](../README.md) · [Chapter 3.2](../../part-3-automation-fundamentals/02-test-automation-architecture.md)

> **Instructor note:** Question 4 is the ceremony trap. Question 9 is how the constitution stays alive — reject-or-amend, not "guidelines."

---

## Question 1 — Locator in a test

**Correct answer: B** — A locator belongs in the page layer; the test should state intent (Sections C.4, C.5).

**Why the others are wrong:**

- **A** — Tests *use* page methods that click; they should not own the selector.
- **C** — Configuration holds hosts and timeouts, not `#submit`.
- **D** — This is Violation 1.

---

## Question 2 — `expect` in an API client

**Correct answer: B** — Business-outcome assertions belong in the test layer; the client becomes unreusable (Section C.5).

**Why the others are wrong:**

- **A** — Clients *read* statuses; they must not *verdict* the business outcome.
- **C** — 201 is the usual create status.
- **D** — Utilities are even worse homes for product assertions.

---

## Question 3 — Factory imports `LoginPage`

**Correct answer: B** — The dependency rule (Section C.3, Violation-shaped).

**Why the others are wrong:**

- **A** / **C** — AAA and determinism are Chapter 3.1 properties; this is a layer arrow.
- **D** — Rule of three is *when* to extract, not *who may import whom*.

---

## Question 4 — More layers are more professional

**Correct answer: False.**

**Why:** Each layer must earn its place by removing a named duplication (Sections C.1, C.9). Five layers for eight tests is inventory.

---

## Question 5 — Unused `BasePage` surface

**Correct answer: B** — Delete or do not introduce the unused surface; extract when duplication exists (Section C.9).

**Why the others are wrong:**

- **A** — Inventing callers is not justification.
- **C** — Configuration is the wrong layer.
- **D** — The opposite of the course.

---

## Question 6 — Console-only failure

**Correct answer: B** — Artifacts and a named assertion (Section C.6).

**Why the others are wrong:**

- **A** / **D** — Retries and hard waits hide races; they do not diagnose.
- **C** — A layer will not print a trace.

---

## Question 7 — When to extract a client

**Correct answer: B** — On the third copy, when shared parts are visible (Sections C.9, C.10).

**Why the others are wrong:**

- **A** — Copied trees before pain (F.10).
- **C** — The rule is *when*, not never.
- **D** — Line count is not a reason-to-change.

---

## Question 8 — HTML vs JSON reporter

**Correct answer: B** — HTML for humans; JSON/JUnit for CI and scripts (Section C.6).

**Why the others are wrong:**

- **A** / **C** — Different audiences, different formats.
- **D** — [Module misconception](../../part-3-automation-fundamentals/00-module-overview.md): reports are a diagnostic instrument, not a management extra.

---

## Question 9 — One-off locator in a spec

**Correct answer: B** — Reject, or amend the constitution in the same PR with a reason (Section C.11).

**Why the others are wrong:**

- **A** — A constitution that is a guideline is not enforceable in capstone defense.
- **C** — Unrelated.
- **D** — `helpers.ts` is the junk drawer (F.6); the locator still is not a test-layer citizen.

---

## Exercise notes

### G.1 — Placement key

| # | Layer | Note |
|---|---|---|
| 1 | Test | Assertion |
| 2 | Page | Locator |
| 3 | API (or test, if first copy) | Prefer API client once extracted |
| 4 | Utility | Id generation |
| 5 | Configuration | Env |
| 6 | Test | Runner API |
| 7 | API | Client |
| 8 | Page | Page object |
| 9 | Service | Workflow |
| 10 | Utility | Generic format |
| 11 | Configuration | Runner config |
| 12 | Test calling page | The *call* is test; the *method* is page |
| 13 | Test | Assertion |
| 14 | Utility or config/auth | Storage state is data/config, not a test |
| 15 | Utility | Logger |
| 16 | Page (smell) | Locator; also a quality defect |
| 17 | Test or service | Using auth service |
| 18 | Configuration | Policy |
| 19 | API / model | Travels with the client |
| 20 | Test | Assertion using a page locator accessor |

Two defensible answers are fine if the reason is written. "I don't know" is not.

### G.2

Each violation needs a **future symptom** (layout rename hunt; coupon change breaks unrelated tests; host change in twenty files). "Wrong layer" alone is half marks.

### G.3

Deleting "core" and "shared" (or service + a premature extra) is the usual right cut for an API-only 12-test suite. If they keep six layers and argue "scalability," ask for the named duplication. Full marks: something concrete was lost *or* they honestly say "folder names."

---

## Assignment 3.2

**Layer justification 30%:** a layer whose only justification is "organization" or "best practice" does not count. They need a sentence like "OrdersApiClient exists so `POST /orders` headers are not copied a third time."

**Constitution 30%:** a reviewer must be able to reject a PR. "Keep tests clean" is a zero on that rule. The table in the assignment lists the required topics.

**Judgment 20%:** missing a refused extraction (rule of three) loses this block. A six-layer diagram for a shop they have not automated yet, with no "not yet" list, also loses it.

**Common defects:** copied enterprise tree (`domain`, `infrastructure`, `core`, `shared`, `lib`); constitution pasted from a blog; file plan with 4 files; services that wrap a single click; no artifacts rule.
