# Answer Key — Chapter 2.13: JSON

[← Answer Keys](../overview.md) · [Chapter 2.13](../../part-2-programming-fundamentals/13-json.md)

> **Instructor note:** Question 4 is the course thesis for every later API chapter. If a learner answers A, run Demo 8 plus `as TestResult` on `{ durationMs: "1240" }` and add the string to a number in front of them.

---

## Question 1 — Valid JSON

**Correct answer: C** — `{ "name": "login" }` (Section C.2).

**Why the others are wrong:**

- **A** — unquoted key. Legal TypeScript object literal; illegal JSON.
- **B** — trailing comma. Same split.
- **D** — single-quoted key. JSON strings use double quotes only.

---

## Question 2 — Round trip

**Correct answer: B** — `ranAt` is a string and `retries` is missing (Section C.3, Demo 8).

**Why the others are wrong:**

- **A** is what learners wish were true. `Date` has no JSON kind; `undefined` is omitted.
- **C** — `Infinity`/`NaN` become `null`; `Date` becomes a string; `undefined` vanishes rather than becoming `null`.
- **D** — ordinary objects stringify; circular refs throw, this object is not circular.

---

## Question 3 — Text vs object

**Correct answer: False.**

**Why:** One is a string of characters; one is a runtime object (Section C.1). `typeof` differs; `===` is false.

---

## Question 4 — `as` after parse

**Correct answer: B** — The compiler is told to trust you; nothing was checked (Section C.6).

**Why the others are wrong:**

- **A** is what a validator does. `as` is not a validator.
- **C** — invalid JSON throws at `parse`, before the cast.
- **D** — extra fields are not rejected by a cast. Excess-property checks apply to object *literals* you type, not to `any`/`unknown` you assert.

---

## Question 5 — HTML 500 body

**Correct answer: B** — Throws (malformed JSON) (Sections C.4, F.6).

**Why the others are wrong:**

- **A** / **C** / **D** invent a successful parse. HTML is not JSON. The diagnosable path is `try`/`catch` at the boundary.

---

## Question 6 — Why `any`

**Correct answer: A** — JSON is untyped at runtime; the compiler cannot know the shape (Section C.4).

**Why the others are wrong:**

- **B** — it does not return your interface.
- **C** — numbers are a JSON kind.
- **D** — `await` is unrelated.

---

## Question 7 — Key order

**Correct answer: B** — May compare unequal because key order is preserved in the string (Section C.9).

**Why the others are wrong:**

- **A** is the flake. Insertion order is kept.
- **C** / **D** — stringify of a plain object succeeds and returns a string.

---

## Question 8 — `createdAt: string`

**Correct answer: B** — JSON has no date type; ISO strings round-trip (Sections C.3, D.2, Project 2 model).

**Why the others are wrong:**

- **A** — TypeScript has `Date`; persistence does not.
- **C** is not the reason.
- **D** — Playwright does not require this field type.

---

## Question 9 — Unvalidated nested access

**Correct answer: B** — `payload.discount?.amount` (Section C.7).

**Why the others are wrong:**

- **A** throws if `discount` is missing or `null`.
- **C** silences the compiler and still throws.
- **D** assumes the path exists and then stringifies a number.

After a validator has proven the shape, direct access is fine. The question says *not* validated.

---

## Exercise notes

### G.1

| # | Defect | Fix |
|---|---|---|
| 1 | Unquoted key | `"id"`, `"total"` |
| 2 | Trailing comma | Remove it |
| 3 | Single quotes | Double quotes |
| 4 | `undefined` | `null` or omit `note` |
| 5 | Missing comma | Comma between properties |

The sentence: `null` means "present, empty"; omit means "absent." Full marks require that distinction, not just a working parse.

### G.2

The table must include `Date` → string, `undefined` dropped, method dropped, `NaN` → `null`. Nested array contents that are JSON-safe should survive.

Project 2 answer: persist ISO strings (`createdAt`); do not persist methods; do not persist `undefined` fields you care about — use `null` or omit with a documented meaning.

### G.3

Two-bad-records case must list **both**. Stopping at the first is the defect. A remaining `as TestCase[]` on the parse result fails the exercise even if the happy path works.

---

## Assignment 2.13

**Cast-only:** `return JSON.parse(text) as TestCase[]` is a zero on the 30% validation dimension, regardless of NOTES.md eloquence.

**Batch issues:** `invalid-shape.json` should contain at least two bad records. Graders check that both appear in `issues`.

**`unknown`:** `const parsed: unknown = JSON.parse(text)` (or equivalent). Leaving the result as `any` and poking fields fails types (20%).

**NOTES.md:** must cite a fixture field that a cast would accept and a validator rejects (e.g. `"priority": "HIGH"` or `"durationMs"`-style string — here, a numeric `title` or missing `steps`). A slogan without a counterexample is half marks on that 15%.

**Missing file:** this assignment throws; Project 2 may start empty. If they start empty here, they skipped the requirement — flag it, but a comment pointing at Project 2 policy is acceptable *in addition to* throwing.

**Common defects:** validating only the first record; `field: "data"` for every issue; swallowing `SyntaxError` into "invalid input"; committing a token in a fixture; using `enum` instead of the Project 2 unions.
