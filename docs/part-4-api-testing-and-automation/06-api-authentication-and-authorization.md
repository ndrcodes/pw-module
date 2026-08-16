# Chapter 4.6 — API Authentication and Authorization

🟡 **Intermediate** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | IV — API Testing and Automation |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [4.5 Write Operations](05-playwright-api-write-operations.md) |
| **Next chapter** | [4.7 Reusable API Clients and Models](07-reusable-api-clients-and-models.md) |

---

> Authentication asks **who are you?** Authorization asks **what may you do?**
>
> Almost every team tests the first. Almost none test the second properly. The most valuable API bug of your career is often a *valid* token for user A returning user B's order.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Distinguish** authentication from authorization, and **explain** why the second produces more valuable bugs.
2. **Authenticate** API requests using tokens, headers, and cookie-based sessions.
3. **Obtain** a token programmatically and **reuse** it across a suite without leaking it.
4. **Design** and **implement** authentication negative tests: no token, malformed token, expired token, wrong scheme.
5. **Implement** cross-user authorization tests proving user A cannot read or modify user B's data.
6. **Test** role-based access boundaries between customer, seller, and admin roles.
7. **Explain** the trade-offs of sharing one authenticated user across tests versus creating one per test.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Headers, cookies, status codes 401 and 403 | [Chapter 4.1](01-http-fundamentals.md) |
| Write operations and cleanup | [Chapter 4.5](05-playwright-api-write-operations.md) |
| Negative test design | [Chapter 4.3](03-designing-api-test-cases.md) |
| Isolation and shared-state risks | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |
| Environment variables | [Chapter 2.3](../part-2-programming-fundamentals/03-variables-and-constants.md) |

---

## C. Concept Explanation

### C.1 Two questions

| | Authentication | Authorization |
|---|---|---|
| Question | Who are you? | What may you do? |
| Failure | **401** — we do not accept your identity | **403** or **404** — we know you; this object is not yours / this role cannot |
| Typical test | No token, bad token | A's token + B's `orderId` |
| If you only test login | Green | **Hole still open** |

IDOR (insecure direct object reference) is the name of the hole: `/api/orders/ORD-8842` with another user's token. Demo 7: if you get 200, celebrate — you found a real vulnerability.

**404 vs 403:** 403 confirms the resource exists. 404 ("not found" even when it does) leaks less. Decide what the API *should* do; test that; file a finding if you disagree.

### C.2 Schemes you will meet

| Scheme | How it travels | Notes |
|---|---|---|
| Bearer token | `Authorization: Bearer <jwt-or-opaque>` | Default in this course |
| JWT | Same header; three base64 segments | You do not need to verify signatures here; treat as a string the server issued |
| API key | `X-API-Key` or query (query is leakier) | |
| Basic | `Authorization: Basic base64(user:pass)` | Rare on modern JSON APIs |
| Session cookie | `Cookie: sid=...` after `Set-Cookie` | Browser does this; `request` does **not** unless you copy it |

Wrong format (`Bearer` misspelled, missing space, `bearer` vs `Token`) is a **test** defect until a correct client still fails. Compare byte-for-byte with a working REST-client request (instructor notes §7).

### C.3 Login programmatically

```ts
async function login(request: APIRequestContext, email: string, password: string): Promise<string> {
  const response = await request.post("/api/auth/login", {
    data: { email, password },
  });
  expect(response.status(), "login should succeed").toBe(200);
  const body = (await response.json()) as { token?: string };
  if (typeof body.token !== "string" || body.token.length === 0) {
    throw new Error("login response missing token");
  }
  return body.token;
}
```

The `expect` here is a **login helper used by tests that are not about login**. Dedicated login tests (wrong password → 401, missing field → 400) belong in `auth.spec.ts` and should not live only inside helpers. Helpers that assert make negative login tests impossible — preview of [Chapter 4.7](07-reusable-api-clients-and-models.md). For now, keep a non-asserting `loginRaw` for negatives.

**Never commit the password.** `process.env.ADMIN_PASSWORD`. [Chapter 4.8](08-api-test-data-and-environments.md) makes this a module. A committed token is a firing-offense-shaped incident, not a style note.

### C.4 Attaching credentials

```ts
// Per request
await request.get("/api/orders", {
  headers: { Authorization: `Bearer ${token}` },
});

// Dedicated context (good for a whole test)
const asBuyer = await playwright.request.newContext({
  baseURL: process.env.BASE_URL,
  extraHTTPHeaders: { Authorization: `Bearer ${token}` },
});
await asBuyer.get("/api/orders");
await asBuyer.dispose();
```

`playwright.config.ts` `extraHTTPHeaders` with one global token is convenient and **dangerous** if tests mutate that user. Prefer per-test or per-describe contexts.

### C.5 Authn negatives

| Case | Send | Expect |
|---|---|---|
| Absent | no `Authorization` | 401 |
| Malformed | `Bearer` only, or random bytes | 401 |
| Wrong scheme | `Basic ...` when Bearer required | 401 |
| Expired | token from a helper that issues short-lived, or a captured expired fixture | 401 |
| Revoked | logout/revoke then reuse | 401 |

Do not wait an hour for expiry. Use an API that issues 1s tokens in test env, or a documented test token. If you cannot expire, write the test as pending with a reason — do not skip the *idea*.

### C.6 Cross-user (the assignment's heart)

```ts
const tokenA = await login(request, userA.email, userA.password);
const tokenB = await login(request, userB.email, userB.password);
const orderB = await createOrder(request, tokenB);

const read = await request.get(`/api/orders/${orderB.id}`, {
  headers: { Authorization: `Bearer ${tokenA}` },
});
expect(read.status(), "A must not read B's order").toBe(403); // or 404 — match contract

const patch = await request.patch(`/api/orders/${orderB.id}`, {
  headers: { Authorization: `Bearer ${tokenA}` },
  data: { status: "cancelled" },
});
expect([403, 404]).toContain(patch.status());

const del = await request.delete(`/api/orders/${orderB.id}`, {
  headers: { Authorization: `Bearer ${tokenA}` },
});
expect([403, 404]).toContain(del.status());

const still = await request.get(`/api/orders/${orderB.id}`, {
  headers: { Authorization: `Bearer ${tokenB}` },
});
expect(still.status()).toBe(200); // integrity: B's order untouched
```

Create **both** users via API. Clean both up. Accepting 200 because "the data looked right" is how you miss IDOR.

### C.7 Roles

| Actor | May | Must not |
|---|---|---|
| Customer | Own cart, own orders | Other customers' orders; admin list |
| Seller | Own catalogue products | Another seller's products; customer PII |
| Admin | Often more | Still not "no tests" — admin-only endpoints should 403 for customer tokens |

A matrix of role × endpoint is easy to under-cover. Pick the money and PII rows first ([Chapter 4.3](03-designing-api-test-cases.md) C.10).

### C.8 Shared user vs per-test user

| Strategy | When | Risk |
|---|---|---|
| Shared read-only user + token in `beforeAll` | GET-only file, user never mutated | Fine if truly read-only |
| Per-test user | Anything that writes cart, profile, orders | Slower; isolated |
| Shared user mutated by many tests | "Faster" | Cart collisions, flaky 409s — **3.1 violation** |

Instructor notes: do not just forbid shared tokens; **discuss**. The decision rule: *if two tests can change the same record, they cannot share the user.*

Login-in-every-test vs reuse a token for that test's user: reuse is fine. Reuse **one** token for the whole suite is the trap.

### C.9 Token lifetime

Hardcoded tokens expire next week and the suite "randomly" dies. Obtain at run time. Refresh if the API requires it — that is a client concern in 4.7. Do not sleep until expiry.

---

## D. QA Context

### D.1 IDOR is a reputation bug

Project 3 C6 requires four cross-user tests. Defense question: *which test catches a developer making orders visible across users?*

### D.2 This token becomes UI `storageState`

[Chapter 6.3](../part-6-framework-engineering/03-authentication-strategies.md): log in via API, inject cookies/token, skip the login screen. Same credential hygiene.

### D.3 Secrets

`.env` gitignored. `.env.example` has names only. If you already committed a secret: **rotate** it; deleting the file from git is not enough (history). Ask often: *where is that password right now?*

---

## E. Code Examples

### E.1 Very simple — env token, then login

```ts
// learning only — still not committed
const token = process.env.SMOKE_TOKEN;
test.skip(!token, "SMOKE_TOKEN not set");
await request.get("/api/orders", { headers: { Authorization: `Bearer ${token}` } });
```

Then replace with `login()` from C.3 using `process.env` password for a **factory-created** user, not a shared staging admin.

### E.2 Practical — login + use

Create user → login → GET own orders 200.

### E.3 QA-oriented — five authn negatives

Table C.5 implemented. Each: specific status, no data leak in body (optional: body must not contain another user's email).

### E.4 Automation-oriented — two users, three verbs

C.6 in a `test.describe`. Teardown both users and B's order.

---

## F. Common Mistakes

### F.1 Committed token / `.env`
### F.2 Only 401, called "authz done"
### F.3 Valid token ⇒ permitted
### F.4 Shared mutating user
### F.5 Login 40 times when one token per test user suffices
### F.6 Hardcoded token that expires
### F.7 `Bearer` typo blamed on the API
### F.8 Second user never deleted
### F.9 Cross-user 200 accepted
### F.10 Login asserts inside the only helper, so negatives cannot use it

---

## G. Exercise

Suggested total time: 110 minutes.

### G.1 Easy — Env or login + 200 (20 min)

Protected GET 200 with a token you did not paste into the spec file.

### G.2 Medium — Five authn negatives (35 min)

Absent, malformed, wrong scheme, expired (or documented skip), revoked if available.

### G.3 Challenge — Cross-user CRUD (55 min)

Two users, read/update/delete isolation on orders (or cart). Argue 403 vs 404 in three sentences. File a finding if 200.

---

## H. Coding Assignment

### Assignment 4.6 — Authenticated suite with authorization boundaries

Extend 4.5:

| # | Requirement |
|---|---|
| 1 | Tokens from login; no secrets in repo |
| 2 | Authn negatives (at least four) |
| 3 | Second user; cross-user isolation on **read, update, delete** for **two** resources |
| 4 | `NOTES.md`: shared vs per-test user decision and trade-off |
| 5 | Cleanup both users |
| 6 | `--workers=4` still green |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Authz | 35% | Two resources × three verbs; not 200 |
| Authn negatives | 20% | Specific 401s |
| Secrets | 20% | Grep-clean; `.env` ignored |
| Isolation | 15% | No shared mutating user |
| Notes | 10% | Honest trade-off |

> **AI usage: restricted.**

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-4/06-api-authentication-and-authorization.answers.md`](../answer-keys/part-4/06-api-authentication-and-authorization.answers.md).

**1.** User A, valid token, `GET /orders/{B's id}` returns 200. This is:

- A) Fine if the body looks empty
- B) An authorization defect (IDOR)
- C) An authentication defect
- D) A 415

**2.** 401 vs 403:

- A) Interchangeable
- B) 401 identity rejected; 403 identity known, permission denied
- C) 403 means not logged in
- D) Both mean 404

**3.** Testing only "no token → 401" covers:

- A) Authorization
- B) Authentication (one case), not cross-user authz
- C) Schema
- D) Pagination

**4.** A good reason to return 404 instead of 403 on another user's order:

- A) It is faster
- B) 403 confirms the id exists (information disclosure)
- C) 404 is a server crash
- D) REST forbids 403

**5.** Sharing one token in `beforeAll` for tests that each add items to the cart:

- A) Recommended
- B) Reintroduces shared mutable state — isolation risk
- C) Required by JWT
- D) Prevents 401

**6.** True or false: Committing a staging password in `.env` is acceptable.

**7.** `Authorization: Bearer` (no token) should typically yield:

- A) 201
- B) 401
- C) 200
- D) 301

**8.** Header format bugs (`Bearr`, missing space) should first be treated as:

- A) Proof the API is down
- B) A client/test defect until a known-good request works
- C) A reason to add `waitForTimeout`
- D) Authorization

**9.** Role test: customer token on `GET /api/admin/users` should be:

- A) 200
- B) 403 (or 401 if the route rejects before role)
- C) 201
- D) 204

**10.** First move if a token "randomly" fails on Monday:

- A) Add retries
- B) Check expiry / obtain a fresh token at runtime
- C) Hardcode a new token in git
- D) Delete auth tests

---

## J. Review

### Competency check

> **Can you prove, with a test, that one user cannot read another user's data — and is there any credential in your repository?**

Both must be true before 4.7.

---

[← 4.5 Write Operations](05-playwright-api-write-operations.md) · [Next: 4.7 Reusable API Clients and Models →](07-reusable-api-clients-and-models.md)
