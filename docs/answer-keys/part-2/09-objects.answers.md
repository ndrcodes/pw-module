# Answer Key — Chapter 2.9: Objects

[← Answer Keys](../overview.md) · [Chapter 2.9](../../part-2-programming-fundamentals/09-objects.md)

> **Instructor note:** Questions 1, 3, 7, and 9 are the ones that predict factory and fixture bugs later. Demo `{ ...obj }` + nested `push` live. G.3 is the contract-reading exercise; protect it.

---

## Question 1 — Unguarded nest

**Correct answer: C** — `TypeError`

**Why:** `r.error` is `undefined`; reading `.message` of that throws (Section C.4).

---

## Question 2 — Optional chain + `??`

**Correct answer: B** — `none`

**Why:** `?.` yields `undefined`; `??` supplies `"none"` (Section C.5).

---

## Question 3 — Shallow copy

**Correct answer: False.**

**Why:** Spread copies the top level. Nested arrays are still shared (Section C.10).

---

## Question 4 — Alias mutation

**Correct answer: B** — `2`

**Why:** `a` and `b` are the same object (Section C.10).

---

## Question 5 — Bracket access

**Correct answer: B** — Variable key or invalid identifier (Section C.2).

---

## Question 6 — Object `===`

**Correct answer: B** — `false`

**Why:** Reference equality. Two literals are two objects (Section F.8).

---

## Question 7 — Absent vs `null`

**Correct answer: B**

**Why:** `=== null` is true only for `null`. `"discount" in product` is false only when absent. A and D treat both as empty (Section C.9).

---

## Question 8 — `?.` on a required field

**Correct answer: B** — The defect is hidden (Section C.5, F.2).

---

## Question 9 — Shallow factory override

**Correct answer: B** — Whole `customer` replaced; `name` dropped (Section D.3).

---

## Question 10 — Shared fixture

**Correct answer: B** — Shared mutation; worse under parallel workers (Section D.4).

**Why A is incomplete:** sequential order can hide it today and fail tomorrow.

---

## Exercise notes

### G.1

Watch for `const b = a; b.priority = ...` presented as two cases. Require a spread or rebuild.

### G.2

`reduce` to `Record<string, number>`. Largest order via `reduce` comparing `total`, not `Math.max` on a mapped list that throws away the object. Prove non-mutation.

### G.3

Four fixtures, `missing` only lists **absent** keys, not null ones. Hidden contract bug: if the API used to send `discount: null` for "no discount" and now omits the key, treating them the same means you cannot detect the contract change.

---

## Assignment 2.9

**`productsWithDiscount`:** only the object case. Null and absent excluded.

**`applyDiscount`:** new object; if you `structuredClone` or spread and overwrite `price`, input `price` must still log the original in `demo.ts`.

**`usersMissingAddress`:** both no-key and `{ city missing }` (and `address: null` if they included it).

**Common defects:** `?.` on `order.id`; `productsWithDiscount` using `== null` inverted; mutating `product.price` in place; suite prefix logic that splits on the wrong character.
