# Chapter 4.1 — HTTP Fundamentals

🟢 **Beginner** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | IV — API Testing and Automation |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [Part III](../part-3-automation-fundamentals/00-module-overview.md) complete |
| **Next chapter** | [4.2 REST APIs and CRUD](02-rest-api-and-crud.md) |

---

> Every web application you will ever test is a conversation. A client sends a **request**; a server sends a **response**. Once you can read both halves fluently, API testing stops being mysterious — you are checking that the server said the right thing.
>
> Do not rush this chapter. Everything in Part IV depends on it.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** the client/server request-response model.
2. **Decompose** a URL into scheme, host, port, path, path parameters, query parameters, and fragment.
3. **Choose** the correct HTTP method for an operation and **explain** safety and idempotency.
4. **Identify** the purpose of common request and response headers, including `Content-Type` and `Authorization`.
5. **Interpret** status codes by class, and **distinguish** a client error from a server error.
6. **Explain** how cookies maintain session state, and **compare** cookie-based sessions with token-based auth.
7. **Capture** and **annotate** a real request/response pair using browser DevTools.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| JSON structure and parsing | [Chapter 2.13](../part-2-programming-fundamentals/13-json.md) |
| Objects and nested data | [Chapter 2.9](../part-2-programming-fundamentals/09-objects.md) |
| Test design vocabulary and reliability properties | [Part III](../part-3-automation-fundamentals/00-module-overview.md) |

No networking background assumed.

---

## C. Concept Explanation

### C.1 A conversation, one request at a time

A **client** (browser, mobile app, Playwright `request`, `curl`) wants something. A **server** decides and replies. HTTP is **stateless**: each request is self-contained. The server does not remember the previous request unless the client sends a reminder — a cookie, a token, a session id — in *this* request's headers.

That is why "I logged in on the last test" is not a fact the server knows. The next call must carry credentials again. [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) independence and [Chapter 4.6](06-api-authentication-and-authorization.md) are the same idea at two scales.

The UI you click is itself a client of the same API. Open DevTools → Network, filter to Fetch/XHR, and use the shop: every button is a request you can later write as a test. That is Demo 1 in the [instructor notes](instructor-notes.md).

### C.2 Anatomy of a request

Four parts matter:

| Part | Job | Example |
|---|---|---|
| **Method** | Intent | `POST` |
| **URL** | Which resource, plus filters | `https://shop.test/api/orders?status=shipped` |
| **Headers** | Metadata about the message | `Content-Type: application/json` |
| **Body** | Payload (create/modify) | `{"sku":"LAMP","qty":1}` |

A **response** mirrors this: **status code**, **headers**, **body**.

```text
POST /api/orders HTTP/1.1
Host: shop.test
Content-Type: application/json
Authorization: Bearer eyJhbG...
Accept: application/json

{"sku":"LAMP","qty":1}
```

```text
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/orders/ORD-000884

{"id":"ORD-000884","status":"confirmed","sku":"LAMP","qty":1}
```

You will spend the rest of Part IV asserting on those lines.

### C.3 URL anatomy — which parts are data

```text
https://shop.test:443/api/orders/ORD-8842?status=shipped&limit=20#receipt
│      │         │    │            │         │                    │
│      │         │    │            │         query string         fragment
│      │         │    │            path parameter (which order)
│      │         │    path
│      │         port (443 is default for https; often omitted)
│      host
scheme
```

| Piece | What it is | Carries data? |
|---|---|---|
| scheme | `http` or `https` | How to talk, not *which* record |
| host | `shop.test` | Which server |
| port | `443`, `3000` | Which process on that host |
| path | `/api/orders/ORD-8842` | Yes — the resource |
| path parameter | `ORD-8842` | Yes — *which* one |
| query parameters | `status=shipped`, `limit=20` | Yes — *how* to filter or page |
| fragment | `#receipt` | Client-only; **not sent to the server** |

Beginners conflate path and query. A rule of thumb: **path identifies the resource; query shapes the result.** `/api/orders/ORD-8842` is one order. `/api/orders?status=shipped` is a list. Putting a filter in the path (`/api/orders/status/shipped`) or an id in the query (`/api/orders?id=ORD-8842`) is a design choice you will critique in [Chapter 4.2](02-rest-api-and-crud.md). For now, *see* which is which when you read a URL.

### C.4 Methods, safety, and idempotency

| Method | Typical intent | Safe? | Idempotent? |
|---|---|---|---|
| `GET` | Read | Yes | Yes |
| `HEAD` | Headers only, no body | Yes | Yes |
| `OPTIONS` | What methods/headers are allowed | Yes | Yes |
| `POST` | Create, or trigger a process | No | **No** (usually) |
| `PUT` | Replace the whole resource | No | Yes |
| `PATCH` | Modify part of the resource | No | Should be, often is |
| `DELETE` | Remove | No | Yes (deleting twice → still gone) |

**Safe** means "does not change server state." A test runner, a crawler, or a retry may `GET` freely. A `GET` that deletes a record is a contract violation and a testing nightmare.

**Idempotent** means "doing it N times has the same effect as doing it once." `PUT` the same body twice: same resource. `DELETE` twice: 404 the second time, resource still gone. `POST` twice: two orders — unless the API has an idempotency key.

This matters because Playwright and CI **retry**. Retrying a `GET` is boring. Retrying a `POST /orders` without an idempotency story **creates a second order**. [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) said retries are not a reliability strategy. HTTP semantics are why.

`PUT` vs `PATCH` is not style. `PUT` with a partial body can **wipe fields the client omitted**. That is a real defect class. [Chapter 4.2](02-rest-api-and-crud.md) and [Chapter 4.5](05-playwright-api-write-operations.md) will test it. Do not treat the verbs as interchangeable.

`GET` bodies are not part of the useful contract. Some stacks ignore them; some reject them. Never put the filter in a GET body and expect every client to honor it. Use the query string.

### C.5 Headers are part of the contract

Headers are not optional decoration. Demo 2: the same `POST` three times — correct `Content-Type`, missing, wrong — and collect statuses. A missing `Content-Type: application/json` often yields **415 Unsupported Media Type**. Learners diagnose that as "the API is broken." The API refused a message it could not parse. That is a client error.

**Request headers worth knowing**

| Header | Job |
|---|---|
| `Content-Type` | What the **body** is (`application/json`, `application/x-www-form-urlencoded`, `multipart/form-data`) |
| `Accept` | What the client is willing to receive |
| `Authorization` | Who is asking (`Bearer <token>`, `Basic ...`) |
| `User-Agent` | Which client; sometimes used for logging or blocking |
| `Cookie` | Session cookies the browser stores and resends |
| Custom (`X-Request-Id`, `Idempotency-Key`) | Correlation and safe retries |

**Response headers worth knowing**

| Header | Job |
|---|---|
| `Content-Type` | What the **response** body is — parse JSON only if this says JSON (or you have validated) |
| `Location` | Where the created resource lives (often with 201) |
| `Set-Cookie` | Server asking the client to store a cookie |
| `Cache-Control` / `ETag` | Caching — stale GET results are a test-design trap |
| `Retry-After` / rate-limit headers | Why your parallel suite just got 429 |

Header **names** are case-insensitive (`Content-Type` = `content-type`). Header **values** are not. `Bearer` vs `bearer` is usually tolerated; the token string is not something you case-fold.

### C.6 Bodies

| Kind | When | Note |
|---|---|---|
| JSON | Almost every API in this course | `Content-Type: application/json` |
| Form-encoded | Traditional HTML forms, some login endpoints | `application/x-www-form-urlencoded` |
| Multipart | File uploads | Boundaries; not JSON |
| Empty | `GET`, `DELETE`, some `POST` actions | No `Content-Type` required if there is no body |

[Chapter 2.13](../part-2-programming-fundamentals/13-json.md): the body is **text** on the wire. `response.json()` parses it. A 500 HTML page is not JSON. A 200 with `{"error":"insufficient stock"}` is success-shaped HTTP and a failed business operation.

### C.7 Status codes by class

Learn **classes** first, then fifteen codes by heart.

| Class | Meaning | Testing implication |
|---|---|---|
| **2xx** | Success | Still read the body |
| **3xx** | Redirect | Follow or assert `Location`; do not ignore |
| **4xx** | **Client** error — *you* sent something unacceptable | In a **negative** test, the expected pass |
| **5xx** | **Server** error | Almost always a defect (or an overloaded environment) |

**Fifteen worth knowing**

| Code | Name | Typical meaning in this course |
|---|---|---|
| 200 | OK | Read or successful action with a body |
| 201 | Created | `POST` created a resource; look for `Location` and an id |
| 204 | No Content | Success, empty body — common on `DELETE` |
| 301 / 302 | Redirect | URL moved; tests may or may not follow |
| 400 | Bad Request | Malformed or failed validation |
| 401 | Unauthorized | **Not authenticated** — missing/bad credentials |
| 403 | Forbidden | Authenticated, **not allowed** |
| 404 | Not Found | No such resource (or "we will not admit it exists") |
| 409 | Conflict | Duplicate email, stale version, state conflict |
| 415 | Unsupported Media Type | Wrong or missing `Content-Type` |
| 422 | Unprocessable Entity | Well-formed JSON, semantically invalid (used by some APIs instead of 400) |
| 429 | Too Many Requests | Rate limit — your `--workers=4` just said hello |
| 500 | Internal Server Error | Unhandled crash — not a valid negative-test expectation |
| 502 / 503 | Bad gateway / unavailable | Environment, not your assertion logic |

**A 400 in a negative test is a pass** if you sent invalid input and the API refused it cleanly. **A 500 in that same test is a defect** — the server crashed instead of validating.

**A 200 is not automatically success.** `{"ok":false,"error":"insufficient stock"}` with status 200 is a contract you must still fail. Status-only assertions miss it. This is the module misconception and [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) C.2 in HTTP form.

**401 vs 403** is the auth/authz split. 401: the server does not know who you are. 403: it knows, and you may not. [Chapter 4.6](06-api-authentication-and-authorization.md) lives in that distinction. Mixing them up produces tests that "pass" while proving the wrong boundary.

### C.8 Cookies, sessions, and Bearer tokens

HTTP is stateless. Sessions are a reminder stuffed into the next request.

**Cookie session:** login response `Set-Cookie: sid=abc; HttpOnly; Secure`. The browser stores it and sends `Cookie: sid=abc` on later calls. Playwright's browser context does this automatically; `request` fixtures do **not** unless you copy the cookie or use storage state ([Chapter 6.3](../part-6-framework-engineering/03-authentication-strategies.md)).

**Bearer token:** login body returns `{ "token": "eyJ..." }`. Every later request sends `Authorization: Bearer eyJ...`. Nothing is stored unless *you* store it.

Both are just headers. Neither is "more HTTP" than the other. HTTPS encrypts the channel so the token or cookie is not visible on the wire to a network observer. **HTTPS does not make an unauthenticated endpoint safe.** It makes eavesdropping harder. An open `GET /api/admin/users` over HTTPS is still an open endpoint.

### C.9 HTTPS in one paragraph

`https` is HTTP over TLS. For a tester: mixed-content warnings, certificate errors in local Docker, and "it works in the browser but `curl` fails" because of a corporate proxy or a self-signed cert. You may need to trust a cert or point at `http://localhost`. You do not need to implement TLS. You do need to know that **scheme and port are part of the URL** you must not hardcode incorrectly ([Chapter 4.8](08-api-test-data-and-environments.md)).

### C.10 Reading DevTools Network

1. Open DevTools → **Network**.
2. Filter **Fetch/XHR** (hide images and CSS).
3. Perform one action (login, add to cart).
4. Click the row. Read, in order: **method**, **status**, **request URL**, **request headers**, **request payload**, **response headers**, **response**, **timing**.

Write those eight down. That is an annotated pair. Timing is not a performance test; it is a smoke alarm you will use in [Chapter 4.3](03-designing-api-test-cases.md).

Preserve the request as **cURL** (right-click → Copy as cURL) for the assignment. You will replay it in a REST client.

### C.11 REST clients are for exploration

Postman, Insomnia, and `curl` are how you **learn** an endpoint. They are not a regression suite: hard to review, hard to version, hard to run in CI. Everything that must run repeatedly becomes TypeScript in [Chapter 4.4](04-playwright-api-testing-basics.md).

```bash
curl -sS -D - \
  -X POST "https://shop.test/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sku":"LAMP","qty":1}'
```

| Flag | Meaning |
|---|---|
| `-X POST` | Method |
| URL | Scheme, host, path |
| `-H` | Header |
| `-d` | Body |
| `-D -` | Write response headers to stdout |
| `-sS` | Silent progress, still show errors |

Label every part of this command in G.1's spirit. If you cannot, you cannot yet read a Playwright `request.post` call either.

---

## D. QA Context

### D.1 The UI is a client

The shop's checkout button fires `POST /api/orders`. Testing that endpoint tests the same contract the UI depends on — cheaper, faster, no rendering. [Chapter 1.3](../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md) is this observation made into a strategy.

### D.2 First assertions are method and status — then the body

[Chapter 4.4](04-playwright-api-testing-basics.md) will write `expect(response.status()).toBe(201)`. That is necessary and not sufficient. The body must contain the id. The `Location` header should match. Status-only is the [assessment](../00-course-overview/04-assessment-strategy.md#8-common-failure-modes-across-all-submissions) failure mode.

### D.3 415 looks like a product bug

A missing `Content-Type` is a **test** defect until you have proved the API mishandles a *correct* client. Check headers before you file a ticket.

### D.4 Headers carry auth

`Authorization` and `Cookie` are how [Chapter 4.6](06-api-authentication-and-authorization.md) happens. If you cannot find them in DevTools, you cannot automate login.

### D.5 "The API returned 200" is the start

Investigation: body shape, error field, `Content-Type`, whether the resource actually changed (`GET` after `POST`). 200 is a class, not a verdict.

---

## E. Code Examples

### E.1 Very simple — labeled `curl`

```bash
curl -sS -D - \
  -X GET "https://shop.test/api/products/LAMP" \
  -H "Accept: application/json"
# method GET | path /api/products/LAMP (path param LAMP) | header Accept
```

Expected: `200` and a JSON object with `sku`. A `404` means that SKU is not in this environment — data, not "HTTP is broken."

### E.2 Practical — `Content-Type` on and off

```bash
# A — contract honored
curl -sS -o /tmp/a.json -w "%{http_code}" \
  -X POST "https://shop.test/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sku":"LAMP","qty":1}'

# B — missing Content-Type (often 415)
curl -sS -o /tmp/b.json -w "%{http_code}" \
  -X POST "https://shop.test/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sku":"LAMP","qty":1}'
```

Record both statuses and the first line of each body. That pair is Demo 2.

### E.3 QA-oriented — annotated create-order pair

```text
Intent:  buyer places an order for 1 × LAMP
Method:  POST                    (create; not idempotent)
URL:     https://shop.test/api/orders
         scheme https | host shop.test | path /api/orders
         no path param (the id does not exist yet)
         no query
Headers: Content-Type: application/json   (body is JSON)
         Authorization: Bearer …          (who)
         Accept: application/json
Body:    { "sku": "LAMP", "qty": 1 }

Status:  201 Created
Headers: Content-Type: application/json
         Location: /api/orders/ORD-000884
Body:    { "id": "ORD-000884", "status": "confirmed", "sku": "LAMP", "qty": 1 }

Proves:     a confirmed order was created with that sku/qty and an ORD- id
Does not:   payment capture, email, inventory decrement, UI confirmation
Could go wrong: 409 if stock is gone — body should name the reason; stock must not go negative
```

### E.4 Automation-oriented — demo-shop operations map

| Operation | Method | Path | Success | Required headers |
|---|---|---|---|---|
| List products | `GET` | `/api/products` | 200 | `Accept` |
| Get product | `GET` | `/api/products/{sku}` | 200 / 404 | `Accept` |
| Search | `GET` | `/api/products?q=` | 200 | `Accept` |
| Register | `POST` | `/api/users` | 201 | `Content-Type` |
| Login | `POST` | `/api/auth/login` | 200 | `Content-Type` |
| Add to cart | `POST` | `/api/cart/items` | 200 or 201 | `Content-Type`, `Authorization` |
| Create order | `POST` | `/api/orders` | 201 | `Content-Type`, `Authorization` |
| Get order | `GET` | `/api/orders/{id}` | 200 / 403 / 404 | `Authorization` |
| Cancel order | `POST` or `POST .../cancel` | `/api/orders/{id}/cancel` | 200 | `Authorization` |
| Delete draft | `DELETE` | `/api/cart` | 204 | `Authorization` |

Exact paths follow the demo API you actually run. If DevTools disagrees with this table, **DevTools wins.** Update the table. That is the reading skill.

---

## F. Common Mistakes

### F.1 Path vs query

`/orders/ORD-1` vs `/orders?id=ORD-1`. They are not interchangeable when you write assertions on the URL or when you design the client.

### F.2 Treating every 4xx as a product bug

Negative tests *want* 4xx. 5xx is the surprise.

### F.3 Assuming 200 means the operation succeeded

Read the body. See C.7.

### F.4 Omitting `Content-Type` on POST

415 misdiagnosed as an application defect. See C.5.

### F.5 Sending a body with GET

Do not. Query string exists.

### F.6 Believing header names are case-sensitive

Names are not. Values (tokens, cookies) are.

### F.7 Reading only the status

Ten assertable facts live in headers and body. Status is one.

### F.8 HTTPS as a security complete

Encryption ≠ authorization. See C.8.

### F.9 Treating PUT and PATCH as the same

Partial PUT can erase fields.

### F.10 Using Postman as the suite

Exploration, not CI. See C.11.

---

## G. Exercise

Suggested total time: 100 minutes.

### G.1 Easy — Decompose ten URLs (20 min)

For each, list scheme, host, port (or default), path, path params, query params, fragment. Star every piece that carries **data**.

```text
1. https://shop.test/api/products
2. https://shop.test/api/products/LAMP
3. https://shop.test/api/products?q=lamp&limit=10
4. http://localhost:3000/api/orders/ORD-8842
5. https://shop.test/api/orders?status=shipped&limit=20
6. https://shop.test/checkout#payment
7. https://shop.test/api/users/ada%40shop.test
8. https://staging.shop.test:8443/api/cart/items
9. https://shop.test/api/orders/ORD-8842/items/2
10. https://shop.test/api/products?q=lamp#results
```

### G.2 Medium — Method and status (30 min)

For twelve operations, state: method, expected **success** status, and **one status that would be a bug** (not "any 4xx").

Include: list products; get missing SKU; create order; create order unauthenticated; create order with empty body; delete cart; replace user profile; change email only; login wrong password; get another user's order; search with `q=`; cancel already-cancelled order.

### G.3 Challenge — Five annotated captures (50 min)

Using the demo shop (or any shop-like app if Docker is down), capture in DevTools:

1. Login
2. Product search or product GET
3. Add to cart
4. Checkout / create order
5. One request that failed or returned 4xx (provoke it)

For each: the eight Network fields from C.10, the client's intent, what the response **proves**, what it **does not prove**, and one thing that could go wrong with how the response would show it.

---

## H. Coding Assignment

### Assignment 4.1 — HTTP conversation report

**Objective.** Document the demo shop's login, product search, add-to-cart, and checkout conversations. No automation code. This is the reading skill [Chapter 4.4](04-playwright-api-testing-basics.md) builds on.

**Deliverable.** `assignment-4-1/REPORT.md` plus saved raw captures (`*.http.txt` or copied cURL + response) for each of the four flows.

For **each** flow, a table:

| Field | Required |
|---|---|
| Intent | One sentence |
| Method | |
| URL, decomposed | Scheme, host, port, path, path params, query |
| Request headers that matter | At least `Content-Type` / `Authorization` / `Cookie` / `Accept` as applicable, and *why* |
| Request body | Or "empty" |
| Status | |
| Response headers that matter | `Content-Type`, `Set-Cookie` / `Location` if present |
| Response shape | Fields, not a dump of secrets — **redact tokens** |
| What it proves | |
| What it does not prove | |
| One failure mode | How the response would look |

Then a short section: **401 vs 403** — one sentence each, in your own words. And: **one 200 that would still be a product bug** (invent it from a body you saw, or from C.7).

**Requirements.**

| # | Requirement |
|---|---|
| 1 | Four flows, from **your** captures, not this chapter's examples copied |
| 2 | Tokens and passwords redacted |
| 3 | Path vs query labeled wherever data appears |
| 4 | No Playwright / no test files |
| 5 | If the live API differs from E.4, you document reality |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Completeness | 25% | All four flows, all table fields |
| Decomposition | 25% | Path/query/headers correctly identified |
| Judgment | 30% | Proves / does not prove / failure mode are specific |
| Hygiene | 20% | Redaction; no pasted chapter examples as "captures" |

> **AI usage: restricted.** AI may explain a header you captured. It may not invent captures you did not make.

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-4/01-http-fundamentals.answers.md`](../answer-keys/part-4/01-http-fundamentals.answers.md).

**1.** HTTP is stateless. That means:

- A) Servers never store data
- B) Each request must carry what the server needs (including auth); the previous request is not implied
- C) Cookies are illegal
- D) Tests cannot create data

**2.** In `https://shop.test/api/orders/ORD-9?status=open`, `ORD-9` is a:

- A) Query parameter
- B) Path parameter
- C) Fragment
- D) Header

**3.** Which method is safe and idempotent?

- A) `POST`
- B) `GET`
- C) `PATCH`
- D) `PUT`

**4.** Why does retrying `POST /api/orders` worry testers?

- A) POST cannot use JSON
- B) POST is usually not idempotent — a retry may create a second order
- C) POST always returns 500
- D) Playwright forbids POST

**5.** A negative test sends invalid JSON and the API returns 400. That result is:

- A) A product bug
- B) The expected pass if the API correctly refused the input
- C) A 2xx in disguise
- D) Proof the test is order-dependent

**6.** The same invalid JSON returns 500. That result is:

- A) Also a pass
- B) A server defect — it crashed instead of validating
- C) A redirect
- D) Proof HTTPS is off

**7.** `expect(response.status()).toBe(200)` as the only assertion:

- A) Proves the business operation succeeded
- B) Proves only that the status was 200; a body like `{"error":"..."}` still passes
- C) Is forbidden by HTTP
- D) Checks the `Content-Type`

**8.** Missing `Content-Type` on a JSON POST often yields:

- A) 201
- B) 415
- C) 301
- D) 204

**9.** 401 vs 403:

- A) They are interchangeable
- B) 401 = not authenticated; 403 = authenticated but not allowed
- C) 403 = not authenticated; 401 = not allowed
- D) Both mean the resource is missing

**10.** True or false: HTTPS on an unauthenticated admin endpoint makes the endpoint safe.

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Request / response | Method + URL + headers + body → status + headers + body |
| Stateless | Carry auth and context every time |
| Path vs query | Which resource vs how to shape the list |
| Safe / idempotent | No state change / N times = once |
| Headers | Contract, not decoration |
| 4xx vs 5xx | Your mistake vs the server's |
| 200 | A class, not a verdict |
| 401 vs 403 | Who vs what you may do |
| Cookie vs Bearer | Two header styles for the same job |
| DevTools | The UI is a client; read its traffic |

### Mistakes recap

Path/query mix-up · 4xx as always-bug · 200 as success · missing `Content-Type` · GET body · header case myths · status-only · HTTPS-as-authz · PUT=PATCH · Postman-as-suite.

### Competency check

> **Given any request/response pair, can you name every part and say what the response proves and does not prove?**

If not, repeat G.3 on two more captures before [Chapter 4.2](02-rest-api-and-crud.md).

---

[← Part IV Overview](00-module-overview.md) · [Next: 4.2 REST APIs and CRUD →](02-rest-api-and-crud.md)
