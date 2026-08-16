# Chapter 4.7 — Reusable API Clients and Models

🔴 **Advanced** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | IV — API Testing and Automation |
| **Estimated time** | 1 session (90 min) + 6 hours independent work |
| **Prerequisite chapters** | [4.5](05-playwright-api-write-operations.md), [4.6](06-api-authentication-and-authorization.md) |
| **Next chapter** | [4.8 API Test Data and Environment Configuration](08-api-test-data-and-environments.md) |

---

> **This chapter is a refactor of your own code.** Bring the duplicated tests from 4.4–4.6. The lesson does not work on someone else's example.
>
> **The client knows how to call the API. The test knows what should be true.** Graders check that first.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Identify** duplication and coupling in a raw API test suite, and **quantify** their maintenance cost.
2. **Design** a typed API client whose methods express operations rather than HTTP mechanics.
3. **Define** request and response models, and **explain** how they document the system under test.
4. **Refactor** an existing suite onto clients and models with no change in what is verified.
5. **Explain** and **enforce** the rule that clients know how to call the API and tests know what should be true.
6. **Decide** what a client method should return — raw response, parsed body, or typed model — and **justify** it.
7. **Compose** clients into a service layer for multi-step workflows.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Write operations and cleanup | [Chapter 4.5](05-playwright-api-write-operations.md) |
| Authentication and token reuse | [Chapter 4.6](06-api-authentication-and-authorization.md) |
| Interfaces, generics, `Partial` | [Chapter 2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md) |
| Layered architecture | [Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) |
| Custom errors | [Chapter 2.11](../part-2-programming-fundamentals/11-error-handling.md) |
| **Your own tests from 4.4–4.6** | Required input |

---

## C. Concept Explanation

### C.1 Measure the cost first

Demo 8: rename `product.title` → `product.name` in the API (or in your fixtures). Count files. After the refactor, the same rename touches a **model** and a **client**. The number is the argument.

Duplication here is not style. It is every header, path, and field name copied fifteen times.

### C.2 Client vs test

| | Client | Test |
|---|---|---|
| Knows | Paths, methods, headers, parse | What should be true |
| Names | `products.create(input)` | `creating a product returns 201 and a sku` |
| Contains | `request.post` | `expect` |
| Must not | `expect(status).toBe(201)` | Raw `request.post("/api/...")` after this chapter |

An assertion inside `create()` makes **negative** creates impossible — the client throws or fails before the test can say "we wanted 400." [Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) C.5; [Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) flags this in review.

### C.3 Operations, not verbs

```ts
// weak names
postProduct()
getProductById()

// operations
create(input: NewProduct)
get(sku: string)
list(query?: ProductQuery)
replace(sku: string, input: Product)
update(sku: string, input: Partial<Product>)
delete(sku: string)
```

`postProduct` still thinks in HTTP. `create` is what the test wants to say.

### C.4 Models

```ts
export interface NewProduct {
  sku: string;
  title: string;
  price: number;
  active: boolean;
}

export interface Product extends NewProduct {
  id: string;
}

export interface ProductQuery {
  q?: string;
  limit?: number;
  page?: number;
}
```

Models are the compiler-checked docs of the SUT. `Partial<Product>` for PATCH. Do not type fields nobody uses just to mirror a noisy payload — type the **contract** you enforce.

`json()` is still `any`. Client may return `unknown` + a parser, or a validated `Product`. Cast-only `as Product` is the 2.13 lie; Project 3 T3 wants runtime validation. A small `parseProduct(raw: unknown): Product` in the client (throwing a typed error) is appropriate **when the caller asked for a parsed product**. Happy-path helpers can parse; raw methods must still exist.

### C.5 What to return

| Return | Happy path | Negative tests |
|---|---|---|
| Raw `APIResponse` | Test parses and asserts status | **Needed** — 400/401/403 |
| Parsed `Product` | Pleasant | Useless if the body is an error |
| Discriminated `{ ok: true, product } \| { ok: false, response }` | Both | Verbose |

Mature pattern: **two methods or an option**.

```ts
async create(input: NewProduct): Promise<APIResponse>
async createProduct(input: NewProduct): Promise<Product> // throws if not 201 + parse fail
```

Tests that expect 201 use `createProduct` or `create` + expect. Tests that expect 400 use `create` and never the throwing parser.

**Throw vs return:** throwing on any non-2xx makes negatives impossible. Distinguish "API refused" (return response) from "network down" (throw). Custom errors ([Chapter 2.11](../part-2-programming-fundamentals/11-error-handling.md)) help: `UnreachableError` vs a normal 4xx response.

### C.6 Base client

```ts
export class ApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly token?: string,
  ) {}

  protected headers(extra?: Record<string, string>): Record<string, string> {
    return {
      Accept: "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...extra,
    };
  }
}

export class ProductsApiClient extends ApiClient {
  list(params?: ProductQuery) {
    return this.request.get("/api/products", { params, headers: this.headers() });
  }
  create(data: NewProduct) {
    return this.request.post("/api/products", { data, headers: this.headers() });
  }
  // get, replace, update, delete...
}
```

`baseURL` stays in Playwright config / [Chapter 4.8](08-api-test-data-and-environments.md) — not copied into each client. One god client for every resource is the junk drawer. One class per resource.

Auth injection: pass `token` into the constructor (from login). Do not read `process.env` in every method.

### C.7 Services

```ts
export class CheckoutService {
  constructor(
    private readonly users: UsersApiClient,
    private readonly cart: CartApiClient,
    private readonly orders: OrdersApiClient,
  ) {}

  async readyToPayBuyer(): Promise<{ token: string; user: User; order?: never }> {
    const user = await this.users.register(buildUser());
    const token = await this.users.login(user.email, user.password);
    // seed cart via cart client with token...
    return { token, user };
  }
}
```

Register → login → seed cart → place order lives **once**. UI tests in Part V call this instead of clicking. Tests that *verify* registration still use `UsersApiClient` directly.

A service that wraps one `click`-equivalent used once is over-abstraction ([Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) C.9). Extract on the third workflow copy.

### C.8 Refactor safely

1. Add client; one test uses it; run; commit.
2. Move the next spec.
3. Ban raw `request.*` in `tests/` (review / grep).
4. Do not rewrite assertions "while you're here." Behavior stays.

### C.9 Same pattern as page objects

`CartPage.addLamp()` is this chapter with locators. [Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md) will say so. Learn the boundary now.

---

## D. QA Context

### D.1 Seed UI through API

The single biggest Part V speed/stability win: do not click register-login-add for a payment test. Call `CheckoutService`.

### D.2 Models as shared vocabulary

`NewProduct` in a PR is a conversation with developers. Drift becomes a compile error or a parse error, not a 2 a.m. `totl` typo.

### D.3 Review

Assertions in clients = architecture mark down, with explanation, not a silent -1.

---

## E. Code Examples

### E.1 Very simple — extract one function

```ts
function createProduct(request: APIRequestContext, input: NewProduct) {
  return request.post("/api/products", { data: input });
}
```

Then promote to a class when a second resource appears.

### E.2 Practical — `ProductsApiClient`

`list`, `get`, `create`, `replace`, `update`, `delete` — all return `APIResponse`.

### E.3 QA-oriented — before/after test

```ts
// before
const res = await request.post("/api/products", { data: { sku, title, price, active: true }, headers: { Authorization: `Bearer ${token}` } });

// after
const res = await products.create({ sku, title, price, active: true });
expect(res.status()).toBe(201);
```

Same expects. Count `title` occurrences before/after a rename.

### E.4 Automation-oriented — base + orders + service

`ApiClient` + `OrdersApiClient` + `CheckoutService.placeFromEmpty(token, sku)`. A 40-line test becomes under ten lines of arrange, same asserts.

---

## F. Common Mistakes

### F.1 Assertions in clients
### F.2 Always-throw on non-2xx
### F.3 `postProduct` names
### F.4 `any` returns
### F.5 One god client
### F.6 Class for a one-off call
### F.7 `baseURL` copied in each class
### F.8 Models that include unused volatile fields and break weekly
### F.9 Big-bang rewrite, suite red for a day
### F.10 Workflow still copy-pasted in every spec

---

## G. Exercise

Suggested total time: 120 minutes.

### G.1 Easy — Three methods (25 min)

Extract three repeated blocks.

### G.2 Medium — Models + rename count (40 min)

Add interfaces. Rename a field. Record files touched.

### G.3 Challenge — CheckoutService (55 min)

Register, auth, seed, order. Shrink one test to <10 arrange lines; **keep every assertion**.

---

## H. Coding Assignment

### Assignment 4.7 — Refactor your suite

| # | Requirement |
|---|---|
| 1 | Typed clients for **at least two** resources |
| 2 | Request/response models |
| 3 | Base client: headers + optional token |
| 4 | One service, multi-step |
| 5 | **No** raw `request.get/post/...` in `tests/` |
| 6 | **No** `expect` in clients |
| 7 | No behavior change (same tests pass) |
| 8 | `RENAME.md`: before/after file count for one field rename |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Layer rule | 30% | No asserts in clients; no raw request in tests |
| Types | 20% | Models; no `any` |
| Return design | 20% | Negatives still possible |
| Service | 15% | Real workflow, not a single wrap |
| Rename evidence | 15% | Honest counts |

> **AI usage: restricted.** Refactor *your* suite. A greenfield demo client with new tests fails the lesson.

---

## I. Quiz

Nine questions. Answer key: [`answer-keys/part-4/07-reusable-api-clients-and-models.answers.md`](../answer-keys/part-4/07-reusable-api-clients-and-models.answers.md).

**1.** `ProductsApiClient.create` contains `expect(status).toBe(201)`. The problem is:

- A) 201 is wrong
- B) Clients must not assert — negatives and reuse break
- C) expect is slow
- D) POST is forbidden

**2.** After this chapter, a test file should call:

- A) `request.post("/api/products", ...)`
- B) `products.create(input)`
- C) `fetch`
- D) `waitForTimeout`

**3.** Best default return for a method used by both happy and negative tests:

- A) Always `Product` (throw on 400)
- B) `APIResponse` (or a pair: raw + parsing helper)
- C) `void`
- D) `any`

**4.** `postProduct` as a method name is weak because:

- A) It mentions HTTP, not the operation
- B) POST is illegal
- C) It is too short
- D) Clients cannot use verbs

**5.** True or false: More client classes are always better.

**6.** Register → login → seed cart belongs in:

- A) Every spec, copied
- B) A service composing clients
- C) `playwright.config.ts`
- D) A page object's CSS

**7.** A client that wraps one call used in one test is usually:

- A) Required architecture
- B) Premature — wait for the third copy
- C) A service
- D) Configuration

**8.** `as Product` inside the client after `json()` without checks:

- A) Is runtime validation
- B) Is still a claim — prefer `unknown` + parse
- C) Makes `any` safer
- D) Replaces status asserts in the test

**9.** The rename-and-count exercise exists to:

- A) Slow you down
- B) Quantify duplication cost before/after
- C) Replace tests
- D) Prove REST

---

## J. Review

### Competency check

> **Can a stranger read one of your tests and understand the business behavior without knowing a single URL?**

If they still see `/api/products` in the spec, the refactor is not done.

---

[← 4.6 API Authentication and Authorization](06-api-authentication-and-authorization.md) · [Next: 4.8 API Test Data and Environment Configuration →](08-api-test-data-and-environments.md)
