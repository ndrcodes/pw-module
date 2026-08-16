# Chapter 4.3 — Designing API Test Cases

🟡 **Intermediate** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | IV — API Testing and Automation |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [4.1](01-http-fundamentals.md), [4.2](02-rest-api-and-crud.md) |
| **Next chapter** | [4.4 Playwright API Testing Basics](04-playwright-api-testing-basics.md) |

---

> **This is the most important chapter in Part IV, and it contains no automation code.** Writing a request is mechanical. Deciding *what to verify* is the skill that separates a tester from a script author.
>
> Most beginner API tests check a status code and stop. They would pass against an API that returns 200 with an empty body, wrong data, missing fields, or another user's records.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Design** a test set for an endpoint covering status codes, response bodies, headers, schema, authentication, authorization, negative cases, boundaries, data integrity, and response time.
2. **Write** assertions that would fail if the behavior under test broke, and **reject** assertions that cannot fail.
3. **Design** negative tests that assert a specific documented failure *and* the absence of side effects.
4. **Apply** boundary and equivalence-class analysis to API inputs.
5. **Distinguish** schema validation from field spot-checking, and **explain** when each is appropriate.
6. **Prioritize** a large candidate test set down to what fits a stated time budget, and **defend** the cuts.
7. **Specify** data integrity checks that verify the system's state, not just its response.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| HTTP methods, headers, status codes | [Chapter 4.1](01-http-fundamentals.md) |
| Resources, CRUD, endpoint conventions | [Chapter 4.2](02-rest-api-and-crud.md) |
| Falsifiability, independence, determinism | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |
| Test case quality criteria | [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) |

---

## C. Concept Explanation

### C.1 Ten dimensions

A thorough set for **one** endpoint has ten columns. You will not implement every cell. You will **fill the matrix**, then cut by risk. That is Demo 4 and the professional skill.

| # | Dimension | Question the test answers |
|---|---|---|
| 1 | **Status** | The specific success code, and the specific code for each documented failure |
| 2 | **Body** | The fields *this test is about*, with correct values |
| 3 | **Headers** | `Content-Type`; `Location` after create; auth-related `WWW-Authenticate` if present |
| 4 | **Schema** | Required fields present, types correct, no unexpected nulls on requireds |
| 5 | **Authentication** | No token, expired, malformed, wrong scheme |
| 6 | **Authorization** | *Valid* token, **wrong user** — the highest-value column |
| 7 | **Negative** | One rule broken at a time: missing field, wrong type, malformed JSON, wrong method |
| 8 | **Boundary** | Min, max, one below, one above, empty, oversized |
| 9 | **Integrity** | Follow-up **GET** (or list) proves state changed — or did *not*, on a reject |
| 10 | **Time** | Generous ceiling (e.g. 2s) as a smoke alarm, not a benchmark |

Status-only is dimension 1 alone. That is why it is the [assessment](../00-course-overview/04-assessment-strategy.md#8-common-failure-modes-across-all-submissions) failure mode.

### C.2 Strong assertions

From [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md): *this test fails if ___.*

| Weak | Strong |
|---|---|
| `expect(response.ok()).toBeTruthy()` | `expect(response.status()).toBe(201)` |
| `expect(body).toBeTruthy()` | `expect(body.id).toMatch(/^ORD-\d{6}$/)` |
| `expect(body).toEqual(entireFixture)` | `expect(body).toMatchObject({ sku, qty })` plus a schema check |
| `expect(status).not.toBe(500)` | The documented 400/401/403/409 |
| `expect(items.length).toBeGreaterThan(0)` | `expect(items.map(i => i.id)).toContain(seededId)` |

**Heuristic:** a reviewer should tell what the test is *for* from its assertions alone.

Asserting the **entire** body verbatim breaks when the API adds `taxRate`. That is not a useful fail. Assert the fields you are about, plus schema-level requireds. Middle path — instructor notes §3.

### C.3 Negative tests have three parts

1. **Specific status** (400, 409, 422 — not "not 200").
2. **Error contract** (code, field, message shape).
3. **No side effect** — GET the collection / the would-be id; nothing new.

An API that returns 400 **and** writes a partial order is a serious defect. Only part 3 finds it. "Negative testing is sending garbage" is the misconception. Garbage with no expected shape is a shrug.

One rule broken per test. A body that is both malformed JSON *and* missing `Authorization` does not tell you which rule produced the 401.

### C.4 Boundaries and equivalence classes

For `qty` on `POST /api/cart/items` (documented 1–99):

| Class | Values | Expect |
|---|---|---|
| Valid typical | 1, 2, 50 | 200/201, line created |
| Valid boundary | 1, 99 | Accept |
| Invalid just outside | 0, 100 | 400, no line |
| Invalid type | `"1"`, `1.5`, `null` | 400/422, no line |
| Missing | omit `qty` | 400, no line |

You do not need 2 through 98. Equivalence says they are the same class. You **do** need both edges and both outsides. "Boundary tests that only cover the maximum" miss `0` and empty string — F.8.

Same idea for string length (`title` 5–120), money (`$100.00` free-shipping threshold — REQ-114), and `limit` on pagination.

### C.5 Schema versus spot-check

| | Spot-check | Schema / contract |
|---|---|---|
| Asks | Is `id` the one I created? | Is every required field present and typed? |
| Catches | Wrong id, wrong qty | `durationMs` as string, missing `status`, null `id` |
| Breaks when | Those fields change meaning | Required contract changes |
| Cost | Cheap | Higher — hand-rolled or Zod |

Spot-check is the test's *point*. Schema is the *contract alarm*. [Chapter 2.13](../part-2-programming-fundamentals/13-json.md): `as Order` is not schema. Runtime validation is. Hand-rolled field checks get tedious; a validator (Zod, bonus path) matches effort to value. Project 3 T3 requires runtime validation, not a cast.

### C.6 Authn vs authz in the matrix

| Test | Token | Expect |
|---|---|---|
| Unauthenticated | none | **401** |
| Malformed / wrong scheme | `Bearer` typo, `Basic` when Bearer required | **401** |
| Expired / revoked | once-valid token | **401** |
| Authenticated, other user's order | A's valid token, B's `orderId` | **403 or 404** — never **200** |

The last row is the single highest-value API test most teams skip. Authentication succeeding does not imply authorization. [Chapter 4.6](06-api-authentication-and-authorization.md) implements this; you **specify** it here.

### C.7 Integrity — believe the GET, not the POST

```text
POST /api/orders  →  201 { id: "ORD-1", status: "confirmed" }
GET  /api/orders/ORD-1  →  must exist, same sku/qty/status
```

A lying API: 201, nothing persisted. Or persisted `qty: 1` when you sent 3. Or a reject 400 that still inserted a row.

Integrity is a **second request**, not a second look at the same body.

### C.8 Response time as a smoke alarm

`expect(durationMs).toBeLessThan(2000)` on a create that is usually 80ms. Tight thresholds (50ms) flake on CI. Multi-minute thresholds prove nothing. You are not writing a load test. You are catching "the endpoint now hangs for 30 seconds."

### C.9 Idempotency and retries

If the API documents `Idempotency-Key`, two POSTs with the same key must yield one order. If it does not, two POSTs yield two orders — and your test must not treat that as a bug. Specify which world you are in.

### C.10 Prioritization — the real lesson

Ten dimensions × a dozen endpoints is hundreds of candidates. You will not write them all.

**Cut by:**

1. **Risk** — money, authz, data loss, integrity first.
2. **Change frequency** — checkout changes more than the footer.
3. **Cost** — a 200ms API case beats an 8s UI duplicate of the same rule.
4. **Budget** — smoke vs regression ([Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md)); CI minutes in [Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md).

A 10-test matrix with reasons beats a 40-test list with none. Graders score **cuts**, not volume.

### C.11 From matrix to files

```text
POST /api/orders
  orders.create.returns-201-and-ord-id.spec.ts     (or one file, many tests)
  orders.create.rejects-qty-zero.spec.ts
  orders.get.forbidden-for-other-user.spec.ts
```

Names state expected behavior ([Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) C.8). The CI report should read like a specification.

---

## D. QA Context

### D.1 This document is the implementation plan

Chapters 4.4–4.6 write the cells you keep. [Project 3](../projects/project-3-api-automation.md) C10 requires the design **before** the code. Assignment 4.3 is that document for two endpoints.

### D.2 Cross-user is the reputation test

Insecure direct object reference: `/orders/{id}` with another user's id. If you find 200, you have found a vulnerability. Project 3 C6 is this column. Under-delivering it is the common miss.

### D.3 Break-it-on-purpose

[Assessment §7](../00-course-overview/04-assessment-strategy.md#7-verification-procedure-used-by-graders) step 7: change a label or a handler; the relevant tests go red. A matrix row that cannot be broken is not a test. From 4.4 onward, red output is a submission artifact.

---

## E. Code Examples

### E.1 Very simple — weak vs strong

```ts
expect(response.ok()).toBeTruthy();
// proves: some 2xx

expect(response.status(), "order should be created").toBe(201);
expect(body.id, "created order should have an ORD- id").toMatch(/^ORD-\d{6}$/);
// fails if: not created, or created without a proper id
```

### E.2 Practical — five dimensions on one response

```ts
expect(response.status()).toBe(201);                          // status
expect(body.sku).toBe(seeded.sku);                            // body
expect(response.headers()["content-type"]).toMatch(/json/);   // headers
expect(typeof body.id).toBe("string");                        // schema (one field)
expect(Date.now() - started).toBeLessThan(2000);              // time
// integrity is a second GET — not this response
```

### E.3 QA-oriented — matrix excerpt for `POST /api/orders`

| ID | Dimension | Case | Expect |
|---|---|---|---|
| O1 | Status/body | Valid cart, valid card | 201, `id` ~ `ORD-`, `status: confirmed` |
| O2 | Headers | Same | `Location` contains `id` |
| O3 | Schema | Same | required fields typed; `id` not null |
| O4 | Authn | No token | 401, no order |
| O5 | Authn | Bad token | 401, no order |
| O6 | Authz | Token A, cart/body for B | 403/404, B's orders unchanged |
| O7 | Negative | `qty: 0` | 400, no order |
| O8 | Negative | Malformed JSON | 400, no order |
| O9 | Boundary | Subtotal $99.99 vs $100.00 shipping (REQ-114) | shipping field differs |
| O10 | Integrity | After O1 | GET by `id` matches; GET list contains `id` |
| O11 | Integrity | After O7 | GET list does not contain a new id |
| O12 | Time | O1 | < 2s |
| … | … | stock = 0, expired card, duplicate idempotency key | … |

Fill 25+, then cut.

### E.4 Automation-oriented — cut to eight

Keep O1, O4, O6, O7, O9, O10, O11, plus expired-card. Cut O2 if `Location` is undocumented; cut O12 if CI is noisy and you have a smoke health check; cut extra authn variants after one representative 401. **Write the reason next to each cut.** A reviewer will disagree with one — that conversation is the lesson.

---

## F. Common Mistakes

### F.1 Status-only
### F.2 `ok()` as the primary assertion
### F.3 Entire body verbatim
### F.4 Negative = "not 200"
### F.5 No side-effect check on rejects
### F.6 Authn covered, authz skipped
### F.7 Two fields called "schema"
### F.8 Only the maximum boundary
### F.9 Time threshold 50ms or 50 minutes
### F.10 Sixty rows, no priority, time runs out

---

## G. Exercise

Suggested total time: 110 minutes.

### G.1 Easy — Ten assertions (20 min)

For each, what it proves; rewrite the six weakest.

```ts
expect(response.ok()).toBeTruthy();
expect(response.status()).toBe(201);
expect(body).toBeTruthy();
expect(body.id).toMatch(/^ORD-\d{6}$/);
expect(body).toEqual(savedSnapshot);
expect(status).not.toBe(500);
expect(items.length).toBeGreaterThan(0);
expect(items.map(i => i.sku)).toContain("LAMP");
expect(body.error.field).toBe("qty");
expect(true).toBe(true);
```

### G.2 Medium — Full matrix for `POST /api/cart/items` (45 min)

All ten dimensions. At least 20 candidate rows. Include qty boundaries, missing SKU, other user's cart, and integrity on both accept and reject.

### G.3 Challenge — Cut 30 to 8 (45 min)

Use a supplied 30-row matrix or your G.2 expanded. Keep eight. One paragraph per cut. Then write three sentences defending the cut a skeptical reviewer would challenge (usually: dropping a second 401 variant, or dropping `Location`).

---

## H. Coding Assignment

### Assignment 4.3 — Endpoint test design specification

**Objective.** For **two** demo-shop endpoints — one read (`GET /api/products` or item GET) and one write (`POST /api/orders` or `POST /api/cart/items`) — produce the specification you will implement in 4.4–4.6.

**Deliverable.** `assignment-4-3/DESIGN.md`.

For each endpoint:

1. Ten-dimension matrix (candidates numbered).
2. Prioritized implementation order (what you will code first, with budget: assume 8 + 8 tests).
3. For each kept test: name (behavior), assertion list, data created/cleaned, falsifiability sentence.
4. For each kept negative: expected status, error shape, **side-effect check**.
5. Explicit cuts with reasons.

No Playwright. A matrix without cuts fails the prioritization dimension.

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Coverage of ten dimensions | 25% | Both endpoints touch all ten as *candidates* |
| Prioritization | 30% | Cuts have reasons; authz and integrity survive |
| Assertion quality | 25% | Strong, falsifiable, not verbatim-body |
| Data/cleanup specified | 20% | Unique data; reject paths include "nothing created" |

> **AI usage: restricted.** A 40-row dump with no cuts scores near zero on the 30%.

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-4/03-designing-api-test-cases.answers.md`](../answer-keys/part-4/03-designing-api-test-cases.answers.md).

**1.** `expect(response.ok()).toBeTruthy()` as the only assertion proves:

- A) The resource was created correctly
- B) Some 2xx occurred
- C) The schema is valid
- D) Authorization held

**2.** A negative test for `qty: 0` should assert:

- A) Status is not 200
- B) Documented 4xx, error shape, and no new cart line / order
- C) 500
- D) Only the request duration

**3.** The highest-value authorization case is usually:

- A) Missing token → 401
- B) Valid token for user A on user B's resource → not 200
- C) Wrong `Content-Type`
- D) `limit=20`

**4.** Schema validation means:

- A) Checking two fields you care about
- B) Required fields present, types correct, requireds not unexpectedly null
- C) `as Order` after `json()`
- D) Matching the entire body to a snapshot

**5.** `qty` allowed 1–99. A minimal boundary set includes:

- A) 50 only
- B) 1, 99, 0, 100
- C) 2 through 98
- D) 99 only

**6.** Integrity after a successful POST is checked by:

- A) Reading the POST body a second time
- B) A follow-up GET (or list) of the created id
- C) Asserting `ok()`
- D) Waiting 5 seconds

**7.** True or false: A 40-row matrix with no prioritization is better than a 10-row matrix with reasons.

**8.** Asserting `toEqual(entireResponseFixture)` is risky because:

- A) Playwright forbids it
- B) Harmless additive fields break the test; the fail is not about *your* behavior
- C) It is too fast
- D) It skips the status code

**9.** A 50ms response-time assertion on CI typically:

- A) Is a good load test
- B) Flakes; use a generous smoke-alarm ceiling
- C) Replaces integrity
- D) Proves pagination

**10.** You have one hour. Which do you keep?

- A) Five extra 401 header-typo variants
- B) Cross-user GET, qty=0 with no-side-effect, create+GET integrity, REQ-114 boundary
- C) Verbatim body snapshots for every endpoint
- D) Only `ok()` on happy paths

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Ten dimensions | Status, body, headers, schema, authn, authz, negative, boundary, integrity, time |
| Strong assert | Fails if *this* behavior breaks |
| Negative | Right failure + no side effect |
| Schema | Contract, not two fields, not a cast |
| Authz | Valid token, wrong object |
| Integrity | Second request |
| Prioritize | Risk, then budget |

### Competency check

> **For any endpoint, can you produce eight tests you would write first and say what risk each one covers?**

If the eight are all happy-path field checks, redo E.4.

---

[← 4.2 REST APIs and CRUD](02-rest-api-and-crud.md) · [Next: 4.4 Playwright API Testing Basics →](04-playwright-api-testing-basics.md)
