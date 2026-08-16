# Answer Key — Chapter 2.8: Arrays

[← Answer Keys](../README.md) · [Chapter 2.8](../../part-2-programming-fundamentals/08-arrays.md)

> **Instructor note:** Questions 1, 2, 4, and 5 are the live-demo set. Do `[1, 10, 2].sort()` and `[].reduce((a,b)=>a+b)` on screen. G.3 is the "reach for the named method" check; if a learner answers with `for` loops they are not done.

---

## Question 1 — Default `sort`

**Correct answer: B** — `[1, 10, 2]`

**Why:** Default sort compares `"1"`, `"10"`, `"2"` as strings. `"10" < "2"` because `"1" < "2"` (Section C.8).

Wait — `"10"` vs `"2"`: first characters `"1"` < `"2"`, so `"10"` comes first. Order: `"1"`, `"10"`, `"2"` → `[1, 10, 2]`. The array looks unchanged, which is why learners think it "worked."

**A** is what people wanted. The comparator `(a, b) => a - b` produces A.

---

## Question 2 — Does `sort` copy?

**Correct answer: False.**

**Why:** `sort` mutates and returns the same array (Section C.8). Copy first: `[...arr].sort(...)`.

---

## Question 3 — `map` vs `forEach`

**Correct answer: B**

**Why:** Section C.6. `map` returns a new array. `forEach` returns `undefined`.

---

## Question 4 — `every` on `[]`

**Correct answer: A** — `true`

**Why:** Vacuous truth. Nothing failed the predicate (Section C.7, C.11). Project 1 must still treat empty as `NO DATA` by checking length.

---

## Question 5 — `reduce` without init on `[]`

**Correct answer: C** — Throws

**Why:** No first item to use as the accumulator (Section C.9). Pass `0`.

---

## Question 6 — First failure

**Correct answer: B** — `find`

**Why:** First match or `undefined` (Section C.4). `filter` returns all of them.

---

## Question 7 — `filter` + `map`

**Correct answer: B** — Failed names, source order

**Why:** Section C.10. Does not mutate. Not a count. Not only the first.

---

## Question 8 — Copy before `sort`

**Correct answer: B** — Mutation of a shared fixture breaks other tests (Section D.4).

---

## Question 9 — Any over 2000 ms

**Correct answer: B** — `some`

**Why:** Section C.7. `every` would ask whether *all* exceeded 2000.

---

## Question 10 — `push` on a shared array

**Correct answer: B** — Leftover users leak into later tests / other workers (Section D.4).

---

## Exercise notes

### G.1

All three produce `["checkout", "search"]`. Commit `filter` + `map`. The loop is how you explain it. `reduce` is how you see they are the same idea.

### G.2

Empty run: executed 0, pass rate `n/a` or `null`, failed names `[]`, `some` false, `every` true (vacuous) — they must *say* they noticed, and not call that GREEN. Slowest three: `[]`.

### G.3 — expected methods

| # | Method | Sketch |
|---|---|---|
| 1 | `.length` | `results.length` |
| 2 | `map` | `results.map(r => r.name)` |
| 3 | `filter` | `results.filter(r => r.status === "failed")` |
| 4 | `some` | `results.some(r => r.status === "failed")` |
| 5 | `every` (on executed) | `results.filter(r => r.status !== "skipped").every(r => r.status === "passed")` |
| 6 | `reduce` | `executed.reduce((a, r) => a + r.durationMs, 0)` |
| 7 | `find` | `results.find(r => r.durationMs > 2000)` |
| 8 | `filter` + copy `sort` + `map` | `[...failed].sort((a, b) => a.name.localeCompare(b.name)).map(r => r.name)` |

`failedNamesSorted([])` is `[]`.

---

## Assignment 2.8

**Eight-row expected:** failed names `["login invalid", "checkout card"]`; executed 7; pass rate `5/7 * 100`; `countByStatus` `{ passed: 5, failed: 2, skipped: 1 }`; slowest three card / wallet / search lamp.

**Empty:** `passRate` `null`; `totalDuration` `0`; `anyFailed` `false`; `allExecutedPassed` `true`; `countByStatus` all zeros; `slowest` `[]`.

**Mutation proof:** `demo.ts` must print the same first name before and after `slowest`. If it changes, they sorted in place.

**Common defects:** `reduce` without init; `sort` on `results` itself; `passRate([])` as `0` or `NaN`; `allExecutedPassed([])` as `false` (they "fixed" vacuous truth and broke the spec); `countByStatus` missing keys on empty.
