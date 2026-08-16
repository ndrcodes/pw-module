# Answer Key — Chapter 2.12: Asynchronous Programming

[← Answer Keys](../README.md) · [Chapter 2.12](../../part-2-programming-fundamentals/12-asynchronous-programming.md)

> **Instructor note:** Question 2 is the live demo. If learners still say "false," run `Boolean(Promise.resolve(false))` in the REPL before continuing. Question 4 is the Playwright false-green — do not let anyone leave this chapter treating it as theoretical.

---

## Question 1 — Promise states

**Correct answer: B** — pending, fulfilled, rejected (Section C.2).

**Why the others are wrong:**

- **A** is informal sequencing, not the spec.
- **C** names keywords, not states.
- **D** is boolean/`unknown` — a type-system answer to a runtime question.

---

## Question 2 — `Boolean(f())`

**Correct answer: B** — `true` (a Promise object is truthy) (Section C.5, symptom 2).

**Why the others are wrong:**

- **A** is what people *want* `f()` to be. It is what `await f()` is.
- **C** would be a missing `return`, not an `async` function.
- **D** — `f()` is legal; it returns `Promise<boolean>`.

---

## Question 3 — `await` pauses the program

**Correct answer: False.**

**Why:** `await` pauses *this function*. Other work can run (Section C.4). Treating it as a global freeze is how learners invent `waitForTimeout` later.

---

## Question 4 — Unawaited `expect`

**Correct answer: B** — May let the test pass without checking visibility (Sections C.5, D.2).

**Why the others are wrong:**

- **A** is the hoped-for behavior. Runners are not reliable here.
- **C** confuses `await` with blocking the browser process.
- **D** is unrelated.

---

## Question 5 — `forEach` + `await`

**Correct answer: B** — Before the creates finish (Section C.10).

**Why the others are wrong:**

- **A** is what `for...of` + `await` does.
- **C** — `console.log` is synchronous; it always runs.
- **D** — empty `users` also prints `"done"` immediately, but that is not the interesting case.

---

## Question 6 — When `Promise.all` is wrong

**Correct answer: B** — When the second operation needs the first operation's result (Section C.8).

**Why the others are wrong:**

- **A** — independent GETs are the *right* use.
- **C** is the correct use, not the wrong one.
- **D** — count is irrelevant; dependency is.

---

## Question 7 — `await` on rejected Promise

**Correct answer: B** — Throws, so `try`/`catch` can handle it (Section C.9).

**Why the others are wrong:**

- **A** / **D** hide the failure — the 2.11 anti-pattern.
- **C** — retry is a policy you write, not a language feature.

---

## Question 8 — `Promise.all` order

**Correct answer: B** — Argument order (Section C.7).

**Why the others are wrong:**

- **A** is how people imagine concurrency works. Results are re-aligned to input order.
- **C** / **D** would make destructuring `[a, b, c]` unsafe.

---

## Question 9 — Unhandled rejection

**Correct answer: B** — A Promise that rejected with no `await` or `.catch` (Section C.9).

**Why the others are wrong:**

- **A** is compile-time.
- **C** is a thrown assertion *if someone awaited it*.
- **D** is an HTTP status — it becomes a rejection only if your client treats it that way *and* nobody handles it.

---

## Question 10 — Removing `await` for speed

**Correct answer: B** — Made it incorrect; the work may not finish before the next line (Section F.9).

**Why the others are wrong:**

- **A** / **C** — concurrency is `Promise.all`, not deleted `await`s.
- **D** — the next line now races the unfinished Promise. That is observable.

---

## Exercise notes

### G.1 — Print order

Expected order: **1, 3, 4, 6, 2, 5** (or **1, 3, 4, 6, 5, 2** depending on microtask interleaving of the IIFE's `await delay(0)` vs the standalone `.then` — both `delay(0)` callbacks are macrotasks after the same timeout).

**Reliable prefix:** `1`, `3`, `4`, `6` are synchronous. `2` and `5` come after.

Full marks: they wrote an order *before* running, then explained the miss. An exact `2`/`5` swap after seeing the run is acceptable if they name "same-tick timeout / microtask vs macrotask" rather than "random."

If they predicted `1, 2, 3, 4, 5, 6`, they still think `delay(0)` is synchronous. Reteach C.12.

### G.2

Sequential elapsed ≈ `6 × 200ms`. Concurrent ≈ `200ms` plus overhead.

The "incorrect concurrent" paragraph must name a **dependency**, **rate limit**, or **shared mutation**. "If the server is down" is explicitly disallowed — that is not a concurrency mistake.

### G.3

Eight snippets. Each needs a **pre-fix symptom** (not just "missing await"). Examples of acceptable symptoms:

| Shape | Symptom |
|---|---|
| `if (isReady())` | Branch always taken |
| Unawaited assertion | Test / function continues; failure is unhandled rejection |
| `forEach` + `await` | `"done"` / return happens early |
| Dependent `Promise.all` | Second call starts with `undefined` id |

A remaining `forEach` + `await` fails the exercise even if they "fixed" the others.

---

## Assignment 2.12

**Order:** `demo.ts` must throw if results are not in `ids` order. Graders: shuffle finish times in `fakeFetch` (longer delay for earlier ids) so a finish-order implementation fails.

**Batch errors:** two `failIds` must produce two `LoadErr` and six `LoadOk`. If the loader throws, they used `Promise.all` without per-item handling.

**Speed:** concurrent must be clearly faster (not 8×, but not equal). If timings match, they still ran sequentially inside `loadConcurrent`.

**AI-USAGE.md:** must include a real introduced bug, the prompt, and a verdict. "AI said it was fine" with no bug is a zero on that 20%.

**Common defects:** `forEach` in `loadSequential`; `Promise.all` that aborts on first reject; `LoadItem` as a loose object without the discriminant; swallowing in `catch` and omitting the id from `LoadErr`.
