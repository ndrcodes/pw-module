# Answer Key — Chapter 4.2: REST APIs and CRUD

[← Answer Keys](../README.md) · [Chapter 4.2](../../part-4-api-testing-and-automation/02-rest-api-and-crud.md)

> **Instructor note:** Question 4 is the PUT-erasure item — demo it if the room splits. Question 5 is the "REST = JSON" misconception from the instructor notes.

---

## Question 1 — REST organizes around

**Correct answer: B** — Resources (nouns); methods express the action (Section C.1).

**Why the others are wrong:**

- **A** is RPC-in-the-path, the smell in C.11.
- **C** / **D** — wrong protocol / incomplete.

---

## Question 2 — POST create status

**Correct answer: B** — 201, often with `Location` (Section C.3).

**Why the others are wrong:**

- **A** — 200 happens, but it is not the typical *create* convention this chapter teaches.
- **C** — 204 is empty success, common on DELETE.
- **D** — redirect, not create.

---

## Question 3 — Destructive GET

**Correct answer: B** — GET is safe; caches, prefetch, and retries may destroy data (Section C.11).

**Why the others are wrong:**

- **A** / **C** / **D** — invented rules.

---

## Question 4 — Partial PUT

**Correct answer: B** — Omitted fields may be erased or reset (Section C.6).

**Why the others are wrong:**

- **A** is PATCH semantics.
- **C** / **D** — PUT is a standard write; 415 is Content-Type, not replace semantics.

---

## Question 5 — JSON-over-HTTP is REST

**Correct answer: False.**

**Why:** REST is resources, uniform interface, statelessness. `POST /getUserById` is JSON and not RESTful (Section C.1).

---

## Question 6 — Page-1-only assertion

**Correct answer: B** — Pagination and totals (Section C.4).

**Why the others are wrong:**

- **A** — the classic miss.
- **C** / **D** — unrelated to the assertion described.

---

## Question 7 — Repeat DELETE

**Correct answer: B** — 204 then 204 or 404; test the documented contract (Section C.7).

**Why the others are wrong:**

- **A** / **C** / **D** — wrong methods or classes.

---

## Question 8 — Nested user orders

**Correct answer: B** — Authorization / leak across users (Section C.5).

**Why the others are wrong:**

- **A** / **C** / **D** — not API-resource concerns.

---

## Question 9 — OpenAPI minimum

**Correct answer: B** — Send 0, 1, and a wrong type; report drift (Section C.10).

**Why the others are wrong:**

- **A** — spec is a plan, not a proof.
- **C** — one extreme is not a boundary set.
- **D** — GET does not create.

---

## Exercise notes

### G.1

Cart may not have a collection POST in the usual sense (`POST /cart/items`). Reviews may be nested under products. N/A with a reason is full marks. Inventing `POST /getReview` is not.

### G.2

Each item needs a **risk** (retry, prefetch delete, field explosion, cache). A rewrite without a risk is half marks.

### G.3 / Assignment 4.2

Copied E.3 with no DevTools check fails observation (25%). A critique that says "not RESTful" without a client/tester risk fails critique (30%). Login-as-POST kept *with a reason* is a strong critique, not a miss.
