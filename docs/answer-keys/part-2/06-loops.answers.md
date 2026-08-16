# Answer Key — Chapter 2.6: Loops

[← Answer Keys](../README.md) · [Chapter 2.6](../../part-2-programming-fundamentals/06-loops.md)

> **Instructor note:** Question 4 is the Playwright-predictor. A learner who picks A will write the flake in Chapter 5.1. G.3 is the judgment exercise; if time is short, drop G.1 and keep G.3.

---

## Question 1 — How many iterations

**Correct answer: B** — 4

**Why:** `i` takes 0, 1, 2, 3. When `i` becomes 4, `4 < 4` is false (Section C.3).

**Why the others are wrong:** A is the "count from 1" instinct. C is the off-by-one in the other direction (`<=`). D would require a missing update.

---

## Question 2 — `<= length`

**Correct answer: B** — `a` `b` `c` `undefined`

**Why:** Valid indexes are 0, 1, 2. `i <= 3` also visits `i = 3`; `items[3]` is `undefined`. It does not throw (Section C.4).

**Why D is tempting:** other languages throw. JavaScript returns `undefined`. That is why the bug is quiet.

---

## Question 3 — `return` in `forEach`

**Correct answer: False.**

**Why:** `return` leaves the callback, not the loop. It is `continue` (Section C.8).

---

## Question 4 — Sequential creates

**Correct answer: B** — `for...of` (later with `await`)

**Why:** `for...of` waits. `forEach` does not (Sections C.5, C.9).

**Why the others are wrong:**

- **A** — The exact flake this chapter exists to prevent.
- **C** — `do...while` is the wrong shape; you know the count.
- **D** — An index-`for` *can* wait if you `await` in the body; the option as written says it does not wait.

---

## Question 5 — Default loop

**Correct answer: B** — `for...of`

**Why:** Section C.13. Index-`for` when you need the index; `while (true)` is polling; `do...while` is "at least once."

---

## Question 6 — Unbounded poll

**Correct answer: B** — No maximum; a down server loops forever.

**Why:** Section C.6. Every poll needs a termination condition that does not depend on success.

---

## Question 7 — `break`

**Correct answer: B** — Leaves the loop entirely.

**Why:** Section C.10. `continue` skips one item.

---

## Question 8 — Assertions in a loop

**Correct answer: B** — First failure hides the rest; one test pretending to be twelve.

**Why:** Section D.2. Same family as the branch-inside-a-test smell from Chapter 2.5.

**Why D is wrong:** The construct does not fix the design. `for...of` is the right loop for the *wrong* job.

---

## Question 9 — `forEach` and async

**Correct answer: C** — It does not wait; later code can run first.

**Why:** Section C.9. A, B, and D are all false.

---

## Exercise notes

### G.1

All three print the same three lines. Keep `for...of`. `forEach` becomes wrong the moment the body waits.

### G.2

Empty run: duration 0, failed 0, failed names empty, slowest absent or a documented `(none)` — not `"undefined"`.

One pass is better when the walk is expensive or the accumulators are cheap to keep together. Three loops are clearer when each loop is a named idea you want to read separately *and* the collection is small. In this course, one pass is the habit until Chapter 2.8 names the ideas (`filter`, `map`).

### G.3 — expected choices

| # | Use | Refuse (example) |
|---|---|---|
| 1 | `for...of` | index-`for` (no need for `i`) |
| 2 | `while` with a deadline | unbounded `while (!ready)`; `forEach` |
| 3 | `for...of` + `break` | `forEach` (cannot stop) |
| 4 | `for...of` + later `await` | **`forEach`** — this is the required "why `forEach` is wrong" |
| 5 | `do...while` or `while` after seeding | `for` with a guessed count |
| 6 | index-`for` (need `i - 1`) | `forEach` |
| 7 | "wait for 2.8" (`filter`/`map`) or `for...of` + `push` | `forEach` if they will later `await` |
| 8 | Not a loop inside one test — `test.each` later | any loop around assertions |

Scenarios 2 and 5 are the two `while`s. Scenario 4 is the `forEach` refusal.

---

## Assignment 2.6

**Totals for the fixture:** executed 7, passed 5, failed 2, skipped 1, duration 820+640+1100+900+3400+2100+700 = 9660, pass rate 5/7 ≈ 71.4%.

**Slowest three:** checkout card 3400, checkout wallet 2100, search lamp 1100. `search empty` at 0ms is skipped and must not appear even if someone forgets the status check on a 0.

**Common defects:** using `.sort` despite the constraint; including skipped in duration or slowest; `forEach` on the per-test print; empty run printing `NaN%`; slowest list crashing when the run has 0–2 executed tests.

**Tie rule:** if two tests share a duration, the one that appeared first stays ahead. Test this with a ninth executed test at 1100ms after `search lamp` — `search lamp` should remain #3.
