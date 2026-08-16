# Answer Key — Chapter 3.1: Principles of Good Automated Tests

[← Answer Keys](../overview.md) · [Chapter 3.1](../../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md)

> **Instructor note:** Grade reasoning over labels (instructor notes §9). Question 4 is the determinism inversion — if the room says True, rerun Demo 3. Question 9 is the artifact habit; do not accept "rerun" as professionalism.

---

## Question 1 — `toBeTruthy()` on a response

**Correct answer: B** — A response object is always truthy, so no application defect can fail the test (Section C.1, Demo 1).

**Why the others are wrong:**

- **A** — POST is the usual create verb.
- **C** — Playwright allows `toBeTruthy`; the problem is semantic, not API.
- **D** — The assertion is cheap and worthless, not slow.

---

## Question 2 — Shared `let` product id

**Correct answer: B** — Independence (it cannot run alone) (Section C.3).

**Why the others are wrong:**

- **A** — Isolation is the blast-radius property. B *also* may not be isolated, but the primary, observable defect is "B fails `--grep`."
- **C** — Architecture is Chapter 3.2; this is a reliability property.
- **D** — A retry would hide the red, not create the product.

---

## Question 3 — Shared admin cart

**Correct answer: B** — Isolation (shared mutable data) (Section C.4).

**Why the others are wrong:**

- **A** — Each test can run alone (the prompt says so). Order is not the requirement; collision is.
- **C** / **D** — Structure and names are not what flakes when two workers share a cart.

---

## Question 4 — Determinism forbids random values

**Correct answer: False.**

**Why:** Determinism is a stable *verdict*. Unique random data often *produces* that stability under parallelism (Section C.5). Hardcoded `user1@test.com` is the collision.

---

## Question 5 — Five behaviors in one test

**Correct answer: B** — A failure does not name which behavior broke; the test has many reasons to fail (Section C.6).

**Why the others are wrong:**

- **A** — Mega-tests are usually slower, not faster.
- **C** — `await` is required, not a defect.
- **D** — `beforeAll` would make the coupling worse.

---

## Question 6 — Cleanup at the end of the body

**Correct answer: B** — Those lines are skipped if an earlier assertion throws (Section C.7).

**Why the others are wrong:**

- **A** — Playwright runs what you write, until a throw.
- **C** — Cleanup is required; the *placement* is the defect.
- **D** — Leftovers *destroy* independence/isolation for the next run.

---

## Question 7 — When `beforeAll` is appropriate

**Correct answer: B** — Immutable reference data this file will not edit (Section C.7).

**Why the others are wrong:**

- **A** / **C** — Shared mutable state is the Demo 2/3 trap.
- **D** — Immutable catalog fixtures are a legitimate use.

---

## Question 8 — Deterministic under two workers

**Correct answer: B** — Unique email per run (Section C.5).

**Why the others are wrong:**

- **A** / **D** — Shared or peeked identities collide or vanish on a fresh environment.
- **C** — Leftover session is order dependence.

---

## Question 9 — First move on a CI flake

**Correct answer: B** — Read the artifacts from the failing run (Section D.3; Chapter 3.2 C.6).

**Why the others are wrong:**

- **A** — Rerun destroys the only evidence of that failure.
- **C** — Retries hide races (Section C.10).
- **D** — Deletion requires a reason ([Chapter 1.4](../../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md)), not a single flake.

---

## Exercise notes

### G.1

Weakest five (typical): `toBeTruthy` on response, `toBeDefined` on status, `page` defined, `true === true`, hardcoded `stock === 41` / `user1@test.com`. `ok() === true` is still weak (any 2xx). `items.length > 0` is weak without a seeded id. `body.id` regex and visible title are already strong.

### G.2

Score the **mechanism and symptom**. A learner who says "determinism" for a shared-cart collision but describes two workers colliding has understood isolation in all but name — partial credit, then teach the table in C.4.

### G.3

Full marks: three named resources (e.g. shared `let`, shared user, leftover cart), plus evidence of alone / reversed / workers. "It was flaky" with no resource named fails the paragraph.

---

## Assignment 3.1

**Audit 30%:** four violation types. "Test 2 is bad" without a symptom prediction is half marks.

**Repair 30%:** graders run `--grep` on each test, reverse file order if possible, and `--workers=4`. A remaining shared `let` is a zero on this dimension.

**PROOF.md 25%:** one break per test. "I broke the app and everything failed" is not per-test evidence. "I changed the expected status to 200 and this test stayed green" is a failed test, not a proof.

**Common defects:** repaired suite still uses `user1@test.com`; cleanup still at the bottom of the body; AAA comments over interleaved code; retries added in config to pass workers.
