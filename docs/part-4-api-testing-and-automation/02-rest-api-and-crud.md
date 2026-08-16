# Chapter 4.2 — REST APIs and CRUD

🟢 **Beginner** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | IV — API Testing and Automation |
| **Estimated time** | 1 session (90 min) + 3.5 hours independent work |
| **Prerequisite chapters** | [4.1 HTTP Fundamentals](01-http-fundamentals.md) |
| **Next chapter** | [4.3 Designing API Test Cases](03-designing-api-test-cases.md) |

---

> REST organizes an API around **resources** — the nouns of the system — rather than around actions. Once you know the resources, you can guess the endpoints. Once you know the method conventions, you can predict statuses and failure cases before you open the docs.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** REST's core principles: resources, a uniform interface, statelessness, and representations.
2. **Identify** the resources in an application and **map** CRUD operations onto endpoints and methods.
3. **Predict** an API's likely endpoints from a description of its domain.
4. **Critique** an endpoint design and **propose** a RESTful alternative.
5. **Explain** collection versus item endpoints, and the conventions for nesting related resources.
6. **Read** API documentation (or an OpenAPI/Swagger definition) well enough to plan tests from it.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| HTTP methods, URLs, status codes, headers | [Chapter 4.1](01-http-fundamentals.md) |
| JSON structure | [Chapter 2.13](../part-2-programming-fundamentals/13-json.md) |
| Objects and arrays of objects | [Chapters 2.8–2.9](../part-2-programming-fundamentals/00-module-overview.md) |

---

## C. Concept Explanation

### C.1 What "REST" actually claims

**REST** (Representational State Transfer) is a set of conventions, not a protocol and not "JSON over HTTP." Plenty of JSON-over-HTTP APIs are RPC in a REST costume.

The claims that matter to a tester:

| Principle | Meaning | Why you care |
|---|---|---|
| **Resources** | Nouns (`/orders`, `/products/LAMP`), not verbs in the path | You can predict URLs from the domain |
| **Uniform interface** | Same URL shape; the **method** is the verb | Five methods × two shapes cover CRUD |
| **Statelessness** | Each request carries its own context | Auth belongs on every call ([Chapter 4.1](01-http-fundamentals.md) C.1) |
| **Representations** | The JSON you send/receive is a *view* of stored state, not the database row | A 201 body can omit fields that exist on disk; a GET can include computed ones |

"RESTful" in practice means: *mostly* resource-shaped, with a few RPC leftovers (`POST /orders/8842/cancel`). You will test both. Knowing the convention tells you which risks to look for.

### C.2 Resources, collections, items

A **collection** is the set: `/api/products`. An **item** is one member: `/api/products/LAMP` (or `/api/products/8842` if the id is numeric).

```text
Collection                         Item
GET    /api/products               GET    /api/products/{id}
POST   /api/products               PUT    /api/products/{id}
                                   PATCH  /api/products/{id}
                                   DELETE /api/products/{id}
```

That is the whole CRUD map for one noun. You do not need `POST /api/createProduct` or `GET /api/getProductById`.

A **representation** is the JSON of that resource *right now*. Two GETs can differ (stock changed). Your test should not assume the catalogue is a constant unless *you* created the product.

### C.3 CRUD mapped to methods and statuses

| Operation | Method | Typical success | Typical body |
|---|---|---|---|
| **C**reate | `POST` collection | **201** | Created resource; `Location` header |
| **R**ead one | `GET` item | **200** | The item |
| **R**ead many | `GET` collection | **200** | Array or `{ items, page, total }` |
| **U**pdate replace | `PUT` item | **200** or **204** | Full resource, or empty |
| **U**pdate partial | `PATCH` item | **200** | Merged resource |
| **D**elete | `DELETE` item | **204** (or 200) | Empty, or a receipt |

Expecting 200 on every success is a beginner defect. A create that returns 200 with no `Location` and no id is a contract you must still test — and often a worse design than 201.

**404 vs 403 on an item GET.** 404: no such id, *or* the server will not admit it exists (authorization-as-404). 403: you are authenticated and we are telling you this resource exists but you may not see it. [Chapter 4.6](06-api-authentication-and-authorization.md) treats that as an information-disclosure design choice. Note what *your* API does; do not assume.

### C.4 Collection endpoints: filter, sort, page

```text
GET /api/products?q=lamp&sort=-price&page=2&limit=20
```

| Concern | Typical query | Defect if you only test page 1 |
|---|---|---|
| Filter | `status=shipped`, `q=lamp` | Filter ignored; always returns everything |
| Sort | `sort=price` or `sort=-createdAt` | Order is whatever the DB felt like |
| Pagination | `page`, `limit`, `cursor` | Page 2 is empty, or page 1 silently truncates |

**Pagination defaults are a classic missed defect.** An endpoint that returns 50 of 10,000 products with no `total` and no link to page 2 looks "fine" if you only assert `items.length > 0`. Your matrix in [Chapter 4.3](03-designing-api-test-cases.md) must include "what happens at the last page" and "what happens when `limit` is 0, 1, max, and max+1."

### C.5 Nested resources

```text
GET  /api/users/5/orders
POST /api/users/5/orders
GET  /api/users/5/orders/ORD-8842
```

Nesting is useful when the child **does not make sense** without the parent (order lines under an order). It stops being helpful when everything is nested three deep (`/users/5/orders/9/items/2/tax-lines/1`) or when the same order is also addressed as `/api/orders/ORD-8842` with different auth rules.

Nested routes create **authorization boundaries**: user 5's orders must not appear on `GET /api/users/7/orders`. That is Demo 7 in [Chapter 4.6](06-api-authentication-and-authorization.md). Map the nest now so you know where to probe later.

### C.6 PUT versus PATCH — the field-erasure bug

```text
Stored product:  { "sku": "LAMP", "title": "Aeron Lamp", "price": 49.5, "active": true }

PUT  /api/products/LAMP
{ "title": "Aeron Desk Lamp" }

If the server implements PUT as replace:
Stored now:      { "sku": "LAMP", "title": "Aeron Desk Lamp" }
                 price gone, active gone — or reset to defaults
```

```text
PATCH /api/products/LAMP
{ "title": "Aeron Desk Lamp" }

Stored now:      { "sku": "LAMP", "title": "Aeron Desk Lamp", "price": 49.5, "active": true }
```

This is a genuine, findable defect class. Clients (including mobile apps) often send partial bodies to whichever "update" endpoint the docs mentioned. If that endpoint is PUT, fields vanish. [Chapter 4.5](05-playwright-api-write-operations.md) implements this as a required test. Do not treat the verbs as interchangeable.

### C.7 Idempotency in practice

| Call | First time | Immediate retry |
|---|---|---|
| `DELETE /api/products/LAMP` | 204, gone | **204 or 404** — both can be correct; pick the contract and test it |
| `PUT` same full body | 200, replaced | 200, same state |
| `POST /api/orders` | 201, `ORD-1` | **201, `ORD-2`** unless an `Idempotency-Key` is honored |

A test that retries a POST without noticing a second order will flake on "exactly one order exists" and look like an isolation bug. It is HTTP semantics ([Chapter 4.1](01-http-fundamentals.md) C.4).

### C.8 Error response shapes

A testable API uses **one** error shape:

```json
{ "error": { "code": "VALIDATION", "field": "qty", "message": "qty must be >= 1" } }
```

Forty ad-hoc strings (`"bad qty"`, `"Qty invalid"`, `"quantity_error"`) make negative tests brittle. When you critique an API, a consistent error contract is a feature: you write one reusable assertion instead of forty. [Chapter 4.7](07-reusable-api-clients-and-models.md) will type that shape.

### C.9 Versioning

`/api/v1/products` vs `/api/products` with an `Accept-Version` header. A version bump is a **new contract**. Your suite either:

- keeps v1 tests until v1 is retired, or
- moves in lockstep and accepts that old clients are someone else's problem.

Do not silently point the same tests at v2 and call mismatches "flakes."

### C.10 Reading OpenAPI / Swagger

An OpenAPI document lists paths, methods, parameters, request bodies, and response schemas. Use it to **plan**, not to trust.

| What the spec says | What you still do |
|---|---|
| `POST /orders` → 201 | Send it; confirm 201 *and* the body |
| `qty: integer, minimum: 1` | Send 0, 1, and a string `"1"` |
| Security: bearer | Call with no token, bad token, other user's token |

Docs drift. DevTools and the running API win. **Report the mismatch** — that is a finding, not a reason to shrug and follow the UI.

### C.11 Five design smells

| Smell | Example | Risk | RESTful alternative |
|---|---|---|---|
| Verb in the path | `POST /api/getUserById` | Read buried in a non-idempotent POST; caches and retries misbehave | `GET /api/users/{id}` |
| Destructive GET | `GET /api/deleteProduct/5` | Prefetch, crawlers, retries delete data | `DELETE /api/products/5` |
| RPC update | `POST /api/v1/users/5/update-email-address` | One endpoint per field; explosion | `PATCH /api/users/5` `{ "email": "..." }` |
| Action as GET with body | `GET /api/search` + JSON body | Bodies on GET are not portable | `GET /api/products?q=` |
| Collection as verb | `POST /api/doCheckout` | Cannot talk about *an* order | `POST /api/orders` |

Demo 3 in the [instructor notes](instructor-notes.md) is this table on a slide. You will still test the smelly versions when they exist. Name the risk in the test plan.

---

## D. QA Context

### D.1 Resource map → test plan → folder structure

```text
src/api/products-client.ts     # one resource
tests/api/products.spec.ts     # that resource's tests
tests/api/orders.spec.ts
```

[Project 3](../projects/project-3-api-automation.md) is this map implemented. Assignment 4.2 *is* the map.

### D.2 CRUD conventions become the lifecycle test

[Chapter 4.5](05-playwright-api-write-operations.md) writes create → read → update → delete on data **this test** owns. The statuses in C.3 are that test's expected values.

### D.3 Nesting is an authorization map

`/users/{id}/orders` is where cross-user bugs live. [Chapter 4.6](06-api-authentication-and-authorization.md) is the probe.

### D.4 Error contract reuse

One `expectError(body, { code, field })` beats forty `toContain("invalid")`. Inconsistent errors are a product finding *and* a maintenance cost.

---

## E. Code Examples

### E.1 Very simple — five CRUD requests

```text
POST   /api/products          { "sku": "LAMP-a1", "title": "Aeron Lamp", "price": 49.5 }
GET    /api/products/LAMP-a1
PUT    /api/products/LAMP-a1  { "sku": "LAMP-a1", "title": "Aeron Desk Lamp", "price": 49.5, "active": true }
PATCH  /api/products/LAMP-a1  { "price": 45 }
DELETE /api/products/LAMP-a1
```

Write the expected success status next to each line before you send them.

### E.2 Practical — collection with query

```text
GET /api/products?q=lamp&sort=price&limit=2&page=1
```

Assert: every item matches the filter; order is non-decreasing price; `items.length <= 2`; if `total > 2`, page 2 is non-empty or `next` is present.

### E.3 QA-oriented — demo shop resource map

| Resource | Collection | Item | Nested |
|---|---|---|---|
| Users | `/api/users` | `/api/users/{id}` | — |
| Products | `/api/products` | `/api/products/{sku}` | — |
| Cart | `/api/cart` | `/api/cart/items/{sku}` | items under cart |
| Orders | `/api/orders` | `/api/orders/{id}` | `/api/orders/{id}/items` |
| Auth | `/api/auth/login` (RPC — acceptable) | — | — |

Login is allowed to look like an action. "Session" is the resource if you want to be precious (`POST /api/sessions`). Critique the real paths from DevTools, not this table, if they differ.

### E.4 Automation-oriented — PUT erasure

```text
# Arrange: create full product
POST /api/products
{ "sku": "LAMP-e1", "title": "Lamp", "price": 49.5, "active": true }

# Act: PUT partial
PUT /api/products/LAMP-e1
{ "title": "Renamed" }

# Assert via GET
# Defect: price missing or null, active missing
# Correct PUT: 400 "incomplete representation"
# Correct PATCH path: use PATCH; price and active unchanged
```

---

## F. Common Mistakes

### F.1 Assuming every API is RESTful

`POST /getUserById` exists in the wild. Test what is there; name the risk.

### F.2 PUT = PATCH

Field erasure. See C.6.

### F.3 Expecting 200 for create or delete

201 and 204 are success. Your assertion must match the contract.

### F.4 Ignoring `Location` after create

The header is part of the create contract. Follow it (or assert it matches `body.id`).

### F.5 Testing page one only

Pagination bugs hide on page 2 and at `limit` boundaries.

### F.6 Assuming DELETE is safe to spray

Idempotent *effect*, not always the same status. Do not DELETE a shared catalogue item.

### F.7 Planning from the UI instead of the API

The UI may never call `DELETE /products`. The API still has it. Test the contract.

### F.8 Trusting docs over the wire

Report the drift. Do not silently follow the wrong one.

---

## G. Exercise

Suggested total time: 85 minutes.

### G.1 Easy — CRUD tables (20 min)

For each resource — `User`, `Product`, `CartItem`, `Order`, `Review`, `DiscountCode` — write the five CRUD endpoints (or mark N/A) and the expected success status.

### G.2 Medium — Eight critiques (30 min)

For each smell, propose a RESTful replacement and name the **risk** of the original (retry, cache, authz, field explosion, prefetch delete).

```text
1. POST /api/getUserById
2. GET  /api/deleteProduct/5
3. POST /api/v1/users/5/update-email-address
4. GET  /api/search          (JSON body)
5. POST /api/doCheckout
6. PUT  /api/products        (no id — "update whatever")
7. GET  /api/orders/latest   (no user context in URL or token)
8. POST /api/products/LAMP/setActiveTrue
```

### G.3 Challenge — Infer, then verify (35 min)

From the demo shop **UI only**, list resources and guessed endpoints. Then open DevTools and document every difference. Differences are the assignment's gold — not a failure.

---

## H. Coding Assignment

### Assignment 4.2 — Resource map and endpoint critique

**Objective.** Produce the resource-to-endpoint map that [Project 3](../projects/project-3-api-automation.md) will implement, plus a critique of at least three design decisions.

**Deliverable.** `assignment-4-2/RESOURCE-MAP.md`.

For **each** resource you will automate (minimum: products, cart, orders, auth/users):

| Column | Required |
|---|---|
| Collection and item paths | |
| Methods supported | Observed or documented |
| Path and query parameters | |
| Success statuses | Per method |
| Request / response shape | Field list, not a novel |
| Nesting | Parent/child and authz implication |

Then **three critiques**: what the API does, the risk for a client or tester, a RESTful alternative *or* a reason to keep the exception (login-as-POST is a valid exception).

If OpenAPI exists, add a "spec vs wire" row for two endpoints.

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Completeness | 30% | Four resources, methods, statuses, shapes |
| Observation | 25% | Paths match DevTools or a noted spec/wire gap |
| Critique | 30% | Risk named, not "I don't like it" |
| Authz awareness | 15% | At least one nested or cross-user boundary called out |

> **AI usage: restricted.** Invented endpoints that do not exist on the demo API fail observation.

---

## I. Quiz

Nine questions. Answer key: [`answer-keys/part-4/02-rest-api-and-crud.answers.md`](../answer-keys/part-4/02-rest-api-and-crud.answers.md).

**1.** REST organizes an API around:

- A) A new URL per action (`/create`, `/update`)
- B) Resources (nouns); methods express the action
- C) SOAP envelopes
- D) Only GET

**2.** Typical success status for `POST /api/orders` that creates a record:

- A) 200 only
- B) 201 (often with `Location`)
- C) 204
- D) 301

**3.** `GET /api/deleteProduct/5` is a smell because:

- A) GET cannot have a path parameter
- B) GET is safe — caches, prefetch, and retries may destroy data
- C) Delete must use PATCH
- D) The number 5 is illegal

**4.** A client sends `{ "title": "New" }` to `PUT /products/LAMP` which implements replace. Likely result:

- A) Only title changes; other fields remain
- B) Omitted fields may be erased or reset
- C) The server ignores PUT
- D) Always 415

**5.** True or false: Every JSON-over-HTTP API is RESTful.

**6.** You only assert `GET /products?limit=20` returns `length > 0`. What risk did you miss?

- A) None
- B) Pagination and totals — page 2, last page, `limit` boundaries
- C) HTTPS
- D) Cookies

**7.** `DELETE` the same item twice. A correct contract is often:

- A) 201 then 201
- B) 204 then 204 or 404 — both can be valid; test the documented one
- C) 500 then 200
- D) GET then POST

**8.** `GET /api/users/5/orders` primarily adds which testing concern?

- A) CSS
- B) Authorization — user 5's orders must not leak to user 7
- C) File upload
- D) WebSockets

**9.** OpenAPI says `qty` minimum is 1. You should still:

- A) Trust the spec and skip 0
- B) Send 0, 1, and a wrong type, and report spec/wire drift
- C) Only test `qty=999999`
- D) Use GET to create the order

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Resource | A noun you can name in a URL |
| Collection / item | The set vs one member |
| Uniform interface | Method is the verb |
| PUT vs PATCH | Replace vs merge — erasure is a real bug |
| Pagination | Page 1 is not the collection |
| Nesting | Parent/child *and* an authz boundary |
| Error shape | One contract, many tests |
| Spec vs wire | Plan from docs; believe the running API |

### Competency check

> **Given a domain description, can you predict the endpoints and name the two most likely design defects to test for?**

Typical pair: PUT erasure, and a nested/cross-user leak. If those two do not come to mind, reread C.5–C.6.

---

[← 4.1 HTTP Fundamentals](01-http-fundamentals.md) · [Next: 4.3 Designing API Test Cases →](03-designing-api-test-cases.md)
