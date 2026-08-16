# Answer Key — Chapter 4.1: HTTP Fundamentals

[← Answer Keys](../overview.md) · [Chapter 4.1](../../part-4-api-testing-and-automation/01-http-fundamentals.md)

> **Instructor note:** Questions 5–7 are the testing judgment items. If learners miss 5, they will file bugs on their own negative tests. If they miss 7, they will submit status-only suites.

---

## Question 1 — Stateless

**Correct answer: B** — Each request must carry what the server needs; the previous request is not implied (Section C.1).

**Why the others are wrong:**

- **A** — Servers store resources. Statelessness is about *the protocol*, not the database.
- **C** — Cookies are how clients *re-send* state.
- **D** — Tests create data constantly; they must send credentials each time.

---

## Question 2 — `ORD-9`

**Correct answer: B** — Path parameter (Section C.3).

**Why the others are wrong:**

- **A** — `status=open` is the query parameter.
- **C** — No `#...` in the URL.
- **D** — Headers are not in the URL.

---

## Question 3 — Safe and idempotent

**Correct answer: B** — `GET` (Section C.4).

**Why the others are wrong:**

- **A** — POST is neither.
- **C** — PATCH is not safe; idempotency is "should be."
- **D** — PUT is idempotent but not safe (it writes).

---

## Question 4 — Retrying POST

**Correct answer: B** — POST is usually not idempotent; a retry may create a second order (Section C.4).

**Why the others are wrong:**

- **A** / **C** / **D** — False constraints. The risk is a duplicate resource.

---

## Question 5 — 400 on invalid JSON

**Correct answer: B** — The expected pass if the API correctly refused the input (Section C.7).

**Why the others are wrong:**

- **A** — 4xx on a negative test is the *desired* refusal.
- **C** — 400 is 4xx.
- **D** — Unrelated to order.

---

## Question 6 — 500 on invalid JSON

**Correct answer: B** — A server defect — it crashed instead of validating (Section C.7).

**Why the others are wrong:**

- **A** — 500 is not an acceptable negative-test expectation.
- **C** / **D** — Wrong class / unrelated.

---

## Question 7 — Status-only 200

**Correct answer: B** — Proves only that the status was 200; an error body still passes (Section C.7, D.5).

**Why the others are wrong:**

- **A** — The module misconception.
- **C** / **D** — HTTP allows 200; the assertion does not read `Content-Type`.

---

## Question 8 — Missing `Content-Type`

**Correct answer: B** — 415 (Section C.5, Demo 2).

**Why the others are wrong:**

- **A** / **D** — Success codes; you did not complete a create.
- **C** — Redirect, not a media-type refusal.

---

## Question 9 — 401 vs 403

**Correct answer: B** — 401 = not authenticated; 403 = authenticated but not allowed (Section C.7).

**Why the others are wrong:**

- **A** / **C** — The swap is the defect [Chapter 4.6](../../part-4-api-testing-and-automation/06-api-authentication-and-authorization.md) exists to prevent.
- **D** — That is 404 (or a dishonest 404).

---

## Question 10 — HTTPS makes an open admin endpoint safe

**Correct answer: False.**

**Why:** HTTPS encrypts the channel. It does not add authorization (Section C.8). An open `GET /api/admin/users` over TLS is still open.

---

## Exercise notes

### G.1

Starred (data-carrying) pieces: path params (`LAMP`, `ORD-8842`, encoded email, `items/2`), query (`q`, `limit`, `status`). Fragments (`#payment`, `#results`) are **not** sent to the server — do not star them as request data. Default ports: 443 for https, 80 for http; `3000` and `8443` are explicit.

### G.2

Sample judgments (exact success codes may follow the live API):

| Operation | Method | Success | Bug status (example) |
|---|---|---|---|
| List products | GET | 200 | 500 |
| Get missing SKU | GET | 404 | 200 with another product / 500 |
| Create order | POST | 201 | 200 with no id / 500 |
| Unauthenticated create | POST | 401 | 201 (created anyway) |
| Empty body create | POST | 400/415/422 | 201 |
| Delete cart | DELETE | 204 | 500 |
| Replace profile | PUT | 200 | 500; or 200 that wiped fields |
| Change email only | PATCH | 200 | PUT-shaped wipe |
| Wrong password | POST | 401 | 200 + session |
| Another user's order | GET | 403 or 404 | 200 with their body |
| Search `q=` | GET | 200 | 500 |
| Cancel already-cancelled | POST | 409 or 400 | 500; or 200 that double-refunds |

A learner who marks 404 on "get missing SKU" as a *bug* has F.2. Correct them before 4.3.

### G.3 / Assignment 4.1

Copied E.3 as a "capture" is a hygiene fail. Redacted tokens required. "Proves: it worked" is not specific. "Does not prove: inventory" (or email, or UI) is the expected shape.

**Common defects:** query params listed as path; `Authorization` omitted on authenticated calls; 200 treated as proof of checkout; passwords in the repo.
