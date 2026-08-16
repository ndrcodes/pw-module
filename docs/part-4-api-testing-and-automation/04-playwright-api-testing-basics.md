# Chapter 4.4 — Playwright API Testing Basics

🟡 **Intermediate** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | IV — API Testing and Automation |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [4.3 Designing API Test Cases](03-designing-api-test-cases.md), [2.12 Async](../part-2-programming-fundamentals/12-asynchronous-programming.md) |
| **Next chapter** | [4.5 Write Operations](05-playwright-api-write-operations.md) |

---

> **First automation chapter of the course.** You will install Playwright and write tests that talk to a real API.
>
> If [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md)'s bug hunt was not comfortable, redo it before you write a line here. Every call returns a Promise.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Set up** a Playwright Test project and **explain** what each generated file is for.
2. **Write** an API test using the `request` fixture, and **explain** what `APIRequestContext` provides.
3. **Send** GET requests with query parameters and headers, and **read** status, headers, and parsed body.
4. **Assert** on status code, body fields, headers, and array contents using `expect`.
5. **Run** tests selectively, in parallel, and with reporters, from the CLI and from VS Code.
6. **Diagnose** the symptoms of a missing `await` in an API test.
7. **Structure** a spec file with `test.describe`, hooks, and names that state expected behavior.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| **`async`/`await` and Promises** | [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) |
| Objects, nested access, optional chaining | [Chapter 2.9](../part-2-programming-fundamentals/09-objects.md) |
| Types and interfaces | [Chapter 2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md) |
| JSON parsing and its `any` boundary | [Chapter 2.13](../part-2-programming-fundamentals/13-json.md) |
| HTTP methods, headers, status codes | [Chapter 4.1](01-http-fundamentals.md) |
| Your test matrix for a real endpoint | [Chapter 4.3](03-designing-api-test-cases.md) |

---

## C. Concept Explanation

### C.1 What Playwright Test gives you

Playwright Test is a runner with batteries: it discovers `*.spec.ts` files, runs them in **workers**, provides `expect`, writes an **HTML report**, and — here — gives every test an `APIRequestContext` via the built-in **`request` fixture**. You do not install Axios. API tests live in the same project, language, and CI job as the browser tests in Part V.

```ts
import { test, expect } from "@playwright/test";

test("GET /api/products returns a JSON array", async ({ request }) => {
  const response = await request.get("/api/products");

  expect(response.status(), "catalogue should be readable").toBe(200);
  const products: unknown = await response.json();
  expect(Array.isArray(products)).toBe(true);
});
```

Three things in that snippet:

1. **`{ request }`** is fixture destructuring. You declare what the test needs; Playwright supplies it. You will add your own fixtures in [Chapter 6.2](../part-6-framework-engineering/02-fixtures.md).
2. **Every call is awaited.** Omit `await` on `get` and `response` is a Promise — truthy — and the test can pass while verifying nothing (Demo 5).
3. **Assertions come from your 4.3 matrix.** Status alone is weak; the body check follows.

### C.2 `npm init playwright@latest`

The generator asks about TypeScript, test folder, GitHub Actions, and browsers. For this chapter you need TypeScript and a test folder. You can skip extra browsers for API-only work; `request` does not need Chromium. You may still keep one browser project for later.

| File | Job |
|---|---|
| `playwright.config.ts` | `baseURL`, timeouts, reporters, workers, projects |
| `tests/example.spec.ts` | Delete it; do not learn from the sample UI test as if it were an API test |
| `package.json` | `npx playwright test` scripts |
| `.gitignore` | Must ignore `test-results/`, `playwright-report/`, `.env` |

### C.3 Config essentials for API work

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // prefer 0 while learning; never hide races
  workers: 4,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    extraHTTPHeaders: {
      Accept: "application/json",
    },
    trace: "on-first-retry",
  },
});
```

**`baseURL`** means `request.get("/api/products")` — not a hardcoded host. Hardcoded URLs fail [Chapter 4.8](08-api-test-data-and-environments.md) and Project 3 T4.

Timeouts: API tests should finish in seconds. A 30s default is fine; do not raise it to hide hangs.

### C.4 Specs, `describe`, names

```ts
test.describe("GET /api/products", () => {
  test("returns a JSON array of products with sku and title", async ({ request }) => {
    // ...
  });

  test("returns 404 for an unknown sku", async ({ request }) => {
    // ...
  });
});
```

Names state **expected behavior**, not `"test GET products"`. The HTML report is a specification.

### C.5 `request.get` — query and headers

```ts
const response = await request.get("/api/products", {
  params: { q: "lamp", limit: 10 },
  headers: { "X-Request-Id": "t-0044" },
});
```

`params` become the query string. Per-request `headers` merge with `extraHTTPHeaders`.

### C.6 The response object

| Method | Returns | Use |
|---|---|---|
| `status()` | `number` | **Always** assert the specific code |
| `ok()` | `boolean` (2xx) | Weak as the only check |
| `headers()` | `Record<string, string>` | `content-type`, `location` |
| `json()` | `Promise<any>` | Parse; assign through `unknown` |
| `text()` | `Promise<string>` | Non-JSON, or debug |
| `body()` | `Promise<Buffer>` | Binary |

```ts
const raw: unknown = await response.json();
```

`as Product[]` is a claim ([Chapter 2.13](../part-2-programming-fundamentals/13-json.md)). Spot-check fields you care about now; runtime schema lands in Project 3 / 4.7.

### C.7 `expect` matchers you will live in

```ts
expect(response.status()).toBe(200);
expect(response.headers()["content-type"]).toMatch(/application\/json/);
expect(body).toMatchObject({ sku: "LAMP", price: 49.5 });
expect(skus).toContain("LAMP");
expect(items).toHaveLength(10);
expect(body.id).toMatch(/^ORD-\d{6}$/);
```

Named messages: `expect(response.status(), "catalogue should be readable").toBe(200)`. The failure is diagnosable without opening the spec ([Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) C.6).

### C.8 Running tests

```bash
npx playwright test
npx playwright test tests/api/products.spec.ts
npx playwright test --grep "unknown sku"
npx playwright test --workers=4
npx playwright test --reporter=html
npx playwright show-report
```

VS Code Playwright extension: run one test, debug, see the error inline. Learn the loop: write → run → read failure → fix. Fluency here matters more than any single matcher.

### C.9 Missing `await` — three API symptoms

```ts
test("get products — cannot fail", async ({ request }) => {
  const response = request.get("/api/products"); // no await
  expect(response).toBeTruthy();                 // Promise is truthy
});
```

| Miss | Symptom |
|---|---|
| `await` on `get` | You have a Promise; `.status` is not the HTTP status |
| `await` on `json()` | You assert on a Promise; field checks are nonsense or skipped |
| `await` on a later async expect (UI) | Preview of Part V; same false-green |

This is [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) C.5 in production form.

### C.10 Hooks — still the 3.1 trade-off

```ts
test.beforeEach(async ({ request }) => {
  // cheap, no shared mutable record
});

test.beforeAll(async ({ request }) => {
  // only immutable reference data you will not edit
});
```

Do not stash `let productId` in the file for test 2 to use. [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) C.3–C.7 still apply. Module-level variables are shared state.

### C.11 Break it on purpose

Change the expected status to `201` on a GET, or point `baseURL` at a path that 404s. Watch **red**. Then restore. A test you have never seen fail is a test you do not understand. Required on the assignment.

Do not wrap `request.get` in `try/catch` to "be safe." A swallowed 500 is a green test ([Chapter 2.11](../part-2-programming-fundamentals/11-error-handling.md)).

---

## D. QA Context

### D.1 Matrix → spec files

Your 4.3 read-endpoint rows become `products.spec.ts` tests. Names should match the matrix IDs so a reviewer can trace.

### D.2 One runner for API and UI

Same `expect`, same report, same CI job. [Chapter 6.2](../part-6-framework-engineering/02-fixtures.md) will share fixtures across both. You are not building a second framework.

### D.3 Speed changes the rhythm

200ms per call vs 8s per browser flow. You will run these hundreds of times. That is why Part IV comes first ([module overview](00-module-overview.md)).

### D.4 Red proof from here on

Every assignment: include output of a run where you broke the behavior and the test failed. Graders check this first.

---

## E. Code Examples

### E.1 Very simple — CLI green

```ts
test("catalogue is reachable", async ({ request }) => {
  const response = await request.get("/api/products");
  expect(response.status()).toBe(200);
});
```

```bash
npx playwright test tests/api/products.spec.ts
```

### E.2 Practical — query, headers, body

```ts
test("search q=lamp returns only matching skus or titles", async ({ request }) => {
  const response = await request.get("/api/products", {
    params: { q: "lamp", limit: 20 },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/json/);

  const products = (await response.json()) as unknown;
  expect(Array.isArray(products)).toBe(true);
  const list = products as { sku: string; title: string }[];
  for (const p of list) {
    const hay = `${p.sku} ${p.title}`.toLowerCase();
    expect(hay, `unexpected product ${p.sku}`).toContain("lamp");
  }
});
```

If the API returns `{ items: [] }`, assert on `items` — **the wire wins**.

### E.3 QA-oriented — four matrix rows

1. 200 + array (or `items`)
2. `content-type` JSON
3. Filter/query
4. Unknown sku → 404

Each test independent. No `let` shared across tests.

### E.4 Automation-oriented — false green

```ts
// broken
const response = request.get("/api/products");
expect(response).toBeTruthy();

// fixed
const response = await request.get("/api/products");
expect(response.status()).toBe(200);
```

Run both. Screenshot the green lie and the real assertion.

---

## F. Common Mistakes

### F.1 Missing `await` on get, json, or expect
### F.2 `ok()` only
### F.3 Asserting on the Response object as if it were the body (`expect(response).toEqual({...})`)
### F.4 Hardcoded `http://localhost:3000/api/...`
### F.5 Names like `"test GET"`
### F.6 Module-level `let id`
### F.7 `try/catch` around the request
### F.8 Never seeing the test red
### F.9 `as Product[]` with no field checks
### F.10 Committing `playwright-report/` or `.env`

---

## G. Exercise

Suggested total time: 100 minutes.

### G.1 Easy — Setup + one GET (25 min)

Init Playwright. One test, **three** meaningful assertions (status, content-type, body shape). Delete the example spec.

### G.2 Medium — Six read tests (40 min)

Status, body fields, headers, array contents, query filter, not-found. From your 4.3 read matrix.

### G.3 Challenge — Two cannot-fail (35 min)

Five tests that all pass; two cannot fail (missing await and/or `ok()` only). Prove by breaking the API (wrong path, or a mock if you have one). Rewrite. Attach red output.

---

## H. Coding Assignment

### Assignment 4.4 — First API test suite

**Objective.** Implement the **read** half of your 4.3 specification: at least **eight** tests.

**Deliverable.** `tests/api/` specs, `playwright.config.ts` with `baseURL`, `PROOF.md` with red runs.

| # | Requirement |
|---|---|
| 1 | Eight tests: status, body, headers, filter, pagination or list shape, not-found |
| 2 | Behavior names; `test.describe` |
| 3 | No shared mutable state |
| 4 | No hardcoded host |
| 5 | `unknown` (or validated fields) after `json()` — no bare `any` |
| 6 | `PROOF.md`: for each test, what you broke and the red snippet |
| 7 | Passes `--workers=4` |
| 8 | No `waitForTimeout`, no `try/catch` swallow |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Assertions | 30% | Strong; match the matrix |
| Independence | 20% | Workers + `--grep` one test |
| Break-it proof | 30% | Per-test red evidence |
| Craft | 20% | Config, names, no `any` |

> **AI usage: restricted.** AI may explain a Playwright error. It may not write the eight tests.

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-4/04-playwright-api-testing-basics.answers.md`](../answer-keys/part-4/04-playwright-api-testing-basics.answers.md).

**1.** `{ request }` in the test callback is:

- A) A global
- B) Fixture destructuring — Playwright injects `APIRequestContext`
- C) The Node `http` module
- D) A page object

**2.** `const response = request.get("/api/products"); expect(response).toBeTruthy();` typically:

- A) Asserts HTTP 200
- B) Passes because a Promise is truthy — may verify nothing
- C) Fails always
- D) Sends POST

**3.** `response.ok()` is true for:

- A) 200 only
- B) Any 2xx
- C) 401
- D) Network failures

**4.** Relative `request.get("/api/products")` requires:

- A) A browser
- B) `use.baseURL` in config (or a full URL, which this course forbids in tests)
- C) `waitForTimeout`
- D) `beforeAll` login

**5.** `await response.json()` is typed by Playwright as:

- A) Your interface automatically
- B) `any` — treat as `unknown` and check
- C) `string`
- D) `never`

**6.** `--grep "unknown sku"` :

- A) Deletes tests
- B) Runs tests whose title matches
- C) Sets `baseURL`
- D) Enables retries

**7.** True or false: Wrapping `request.get` in `try/catch` and returning is a good way to handle 500s.

**8.** A module-level `let lastSku` written by test 1 and read by test 2 violates:

- A) `baseURL`
- B) Independence
- C) JSON
- D) HTML reporting

**9.** The first thing to do after a green write is:

- A) Add retries
- B) Break the behavior and confirm this test goes red
- C) Commit `.env`
- D) Copy the test ten times

**10.** `expect(response).toEqual({ sku: "LAMP" })` is wrong because:

- A) LAMP is not a SKU
- B) `response` is the HTTP response object, not the parsed body
- C) `toEqual` is forbidden
- D) GET cannot return JSON

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| `request` fixture | Injected `APIRequestContext` |
| `baseURL` | Host lives in config |
| `await` | Every get/json |
| `status()` | Specific code, not only `ok()` |
| `json()` as `unknown` | Cast ≠ check |
| Break-it | Required evidence |
| Names | Expected behavior |

### Competency check

> **Can you write a test, break the API, watch it go red for the right reason, and fix the API to see it go green again?**

That loop is the rest of the course.

---

[← 4.3 Designing API Test Cases](03-designing-api-test-cases.md) · [Next: 4.5 Write Operations →](05-playwright-api-write-operations.md)
