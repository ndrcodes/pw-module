# Chapter 4.5 — Write Operations: POST, PUT, PATCH, DELETE

🟡 **Intermediate** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | IV — API Testing and Automation |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [4.4 Playwright API Testing Basics](04-playwright-api-testing-basics.md) |
| **Next chapter** | [4.6 API Authentication and Authorization](06-api-authentication-and-authorization.md) |

---

> Reading is safe. Writing changes the world. This chapter is where [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) stops being a slogan: unique data, cleanup that runs on failure, integrity via a follow-up read.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Send** POST, PUT, PATCH, and DELETE requests with JSON bodies and headers using `APIRequestContext`.
2. **Assert** creation outcomes: status, response body, `Location` header, and the resulting resource state.
3. **Verify** data integrity with a follow-up read after every write.
4. **Test** PUT versus PATCH semantics, including the partial-body field-erasure case.
5. **Implement** negative write tests that assert both the documented failure and the absence of side effects.
6. **Create** unique data per test and **clean up** reliably, including when the test fails.
7. **Write** a full CRUD lifecycle test that owns all of its data.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| The `request` fixture, assertions, running tests | [Chapter 4.4](04-playwright-api-testing-basics.md) |
| PUT versus PATCH semantics; expected statuses | [Chapter 4.2](02-rest-api-and-crud.md) |
| Negative and integrity test design | [Chapter 4.3](03-designing-api-test-cases.md) |
| Independence, isolation, cleanup on failure | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |
| `async`/`await`, `Promise.all` | [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) |

---

## C. Concept Explanation

### C.1 The write methods

```ts
await request.post("/api/products", { data: body, headers });
await request.put(`/api/products/${sku}`, { data: full });
await request.patch(`/api/products/${sku}`, { data: partial });
await request.delete(`/api/products/${sku}`);
```

`data` is serialized as JSON and Playwright sets `Content-Type: application/json`. Use `form` or `multipart` only for form/upload endpoints ([Chapter 4.1](01-http-fundamentals.md) C.6). Do not send `data` on GET.

If you set `Content-Type` yourself and it disagrees with `data`, you can recreate Demo 2's 415. Prefer `data` and let Playwright set the header unless you are *testing* 415.

### C.2 Create is four checks, not one

```ts
const sku = `LAMP-${crypto.randomUUID()}`;
const create = await request.post("/api/products", {
  data: { sku, title: "Aeron Lamp", price: 49.5, active: true },
});
expect(create.status(), "product should be created").toBe(201);

const created: unknown = await create.json();
const body = created as { id?: string; sku?: string };
expect(body.sku).toBe(sku);

const location = create.headers()["location"];
if (location) {
  expect(location).toContain(sku);
}

const read = await request.get(`/api/products/${sku}`);
expect(read.status(), "created product should be readable").toBe(200);
const stored = (await read.json()) as { title: string; price: number };
expect(stored.title).toBe("Aeron Lamp");
expect(stored.price).toBe(49.5);
```

A 201 that persists nothing, or persists a different price, is a lying API. Only the GET finds it ([Chapter 4.3](03-designing-api-test-cases.md) C.7).

### C.3 PUT vs PATCH in a test

```ts
// Arrange: full product exists (you created it)
await request.put(`/api/products/${sku}`, { data: { title: "Renamed" } });
const afterPut = await request.get(`/api/products/${sku}`);
const putBody = (await afterPut.json()) as Record<string, unknown>;
// If price is missing/null — field-erasure defect (Chapter 4.2 C.6)

await request.patch(`/api/products/${sku}`, { data: { title: "Renamed again" } });
const afterPatch = (await (await request.get(`/api/products/${sku}`)).json()) as {
  title: string;
  price: number;
};
expect(afterPatch.title).toBe("Renamed again");
expect(afterPatch.price).toBe(49.5);
```

If PUT *correctly* rejects a partial body with 400, that is a pass — assert 400 and unchanged GET. The test's job is to **prove the semantics**, not to demand PATCH behavior from PUT.

### C.4 Delete

```ts
const del = await request.delete(`/api/products/${sku}`);
expect([200, 204]).toContain(del.status()); // match *your* contract; prefer exact
const gone = await request.get(`/api/products/${sku}`);
expect(gone.status()).toBe(404);

const delAgain = await request.delete(`/api/products/${sku}`);
expect([204, 404]).toContain(delAgain.status()); // documented one
```

Prefer `expect(del.status()).toBe(204)` once you know the contract. The array form is a temporary hedge that hides drift — tighten it.

### C.5 Negative write + no side effect

```ts
const before = await listSkus(request);
const reject = await request.post("/api/products", {
  data: { sku: `BAD-${id()}`, title: "x", price: -1 },
});
expect(reject.status()).toBe(400);
const after = await listSkus(request);
expect(after).toEqual(before);
```

Or GET the would-be sku and expect 404. An API that 400s and still inserts is the defect beginners miss.

Malformed JSON: send `text` / raw body if you need to, or a string that is not an object. One rule broken per test.

### C.6 Uniqueness

| Strategy | Example | Note |
|---|---|---|
| UUID | `LAMP-${crypto.randomUUID()}` | Best default; collision ~0 |
| Timestamp | `user-${Date.now()}@shop.test` | Collides if two workers share a ms |
| Counter | `++n` | Collides across workers (separate processes) |
| Hardcoded | `"Test Product"` | **Will** collide — Demo 3 from 3.1 |

Log the generated id on failure (`console.log` or attach to the expect message) so a flake is reproducible. Factories in [Chapter 4.8](08-api-test-data-and-environments.md) formalize this.

### C.7 Cleanup that always runs

```ts
test("create then …", async ({ request }) => {
  const sku = `LAMP-${crypto.randomUUID()}`;
  const created: string[] = [];

  try {
    await request.post("/api/products", { data: { sku, title: "T", price: 1, active: true } });
    created.push(sku);
    expect(true, "forced mid-test failure demo").toBe(false);
  } finally {
    await Promise.all(
      created.map((id) => request.delete(`/api/products/${id}`).catch(() => {})),
    );
  }
});
```

Better: track ids in `test.afterEach` via a small helper. Rules:

1. Teardown runs on failure (`finally` / `afterEach` / later, fixtures).
2. Delete of an already-gone record **must not fail the test** (204/404 both fine; swallow network errors in cleanup only).
3. Cleanup is idempotent — safe to run twice.

Cleanup at the **bottom of the test body** is skipped when `expect` throws. That is Demo 6.

Do not DELETE a product you did not create. Do not share one record across create/update/delete tests — that is order dependence.

### C.8 CRUD lifecycle in one test vs many

A **lifecycle** test (create → read → put/patch → delete → gone) proves the verbs work together. It has several reasons to fail — use it as a smoke, and keep **focused** tests for PUT erasure, negative qty, etc. ([Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) C.6).

Each focused test still creates **its own** product. Reusing the lifecycle leftover is coupling.

### C.9 `Promise.all` on writes

Independent creates: `Promise.all([createA, createB])`. Dependent: create user, then create order with `user.id` — **sequential** ([Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) C.8). Parallel writes to the **same** cart are a race, not a speedup.

---

## D. QA Context

### D.1 Parallelism is the exam

`--workers=4` plus a colleague's suite: hardcoded `"Test Product"` dies. Unique skus + teardown are how [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) stays boring.

### D.2 Today's helpers are tomorrow's factories

`createProduct(request, overrides)` becomes [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md). Write it as a function that **returns** the created entity (not `console.log`).

### D.3 UI tests will call this

Part V should seed a cart via API, not click through catalogue. Orphaned records in shared staging are a professional problem: they slow the env and collide with humans.

---

## E. Code Examples

### E.1 Very simple — POST + status

```ts
const sku = `LAMP-${crypto.randomUUID()}`;
const res = await request.post("/api/products", {
  data: { sku, title: "Lamp", price: 10, active: true },
});
expect(res.status()).toBe(201);
```

Incomplete — add GET and teardown before you call it done.

### E.2 Practical — Location + read-back

See C.2. Include `finally` delete.

### E.3 QA-oriented — erasure + negative

One test: PUT partial, GET, document observed semantics.
One test: POST invalid price, GET list unchanged.

### E.4 Automation-oriented — lifecycle + teardown

```ts
test("product CRUD lifecycle owns its sku", async ({ request }) => {
  const sku = `LAMP-${crypto.randomUUID()}`;
  try {
    expect((await request.post("/api/products", { data: { sku, title: "A", price: 10, active: true } })).status()).toBe(201);
    expect((await request.get(`/api/products/${sku}`)).status()).toBe(200);
    expect((await request.patch(`/api/products/${sku}`, { data: { title: "B" } })).status()).toBe(200);
    expect(((await (await request.get(`/api/products/${sku}`)).json()) as { title: string }).title).toBe("B");
    expect((await request.delete(`/api/products/${sku}`)).status()).toBe(204);
    expect((await request.get(`/api/products/${sku}`)).status()).toBe(404);
  } finally {
    await request.delete(`/api/products/${sku}`).catch(() => {});
  }
});
```

Force a fail after POST (wrong title expect) and prove the `finally` still deletes (GET 404 afterwards from a scratch script or afterEach log).

---

## F. Common Mistakes

### F.1 Create = 201 only
### F.2 No follow-up GET
### F.3 `"Test Product"` / `user1@test.com`
### F.4 Cleanup at the bottom of the body
### F.5 Cleanup throws on 404 and fails a green test
### F.6 Test 2 updates what test 1 created
### F.7 Negative without list/GET unchanged
### F.8 Partial PUT unnoticed
### F.9 `Promise.all` on user-then-order
### F.10 One shared record for the whole CRUD file

---

## G. Exercise

Suggested total time: 110 minutes.

### G.1 Easy — Create + GET (20 min)

Unique sku, 201, body, read-back, `finally` delete.

### G.2 Medium — PUT, PATCH, DELETE (40 min)

Prove semantic difference. Delete + absence. Repeat-delete per contract.

### G.3 Challenge — Six negatives + mid-fail cleanup (50 min)

Six rejects, each with side-effect check. Then force a failure after create; prove leftover is gone (second run or explicit GET).

---

## H. Coding Assignment

### Assignment 4.5 — CRUD lifecycle suite

**Objective.** Write half of your 4.3 write specification for **one** resource (products or cart items).

| # | Requirement |
|---|---|
| 1 | Create, read-back, PUT, PATCH, delete, verify absence |
| 2 | At least five negatives with side-effect checks |
| 3 | Unique data every test |
| 4 | Teardown always runs; cleanup 404-safe |
| 5 | Passes `--workers=4` and reversed / `--grep` alone |
| 6 | `PROOF.md`: mid-test failure still cleans; one PUT/PATCH observation |
| 7 | No hardcoded ids from a DB peek |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Integrity | 25% | GET after every write; reject paths clean |
| Isolation | 25% | Workers + unique data |
| Semantics | 20% | PUT vs PATCH proven |
| Cleanup | 20% | Failure path evidenced |
| Negatives | 10% | Five, specific statuses |

> **AI usage: restricted.**

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-4/05-playwright-api-write-operations.answers.md`](../answer-keys/part-4/05-playwright-api-write-operations.answers.md).

**1.** A 201 without a follow-up GET fails to catch:

- A) Wrong `Content-Type` on the request
- B) An API that claims create but persists nothing (or the wrong fields)
- C) Missing `await`
- D) Pagination

**2.** Cleanup as the last lines of the test body is skipped when:

- A) The test passes
- B) An earlier `expect` throws
- C) Workers equal 1
- D) You use `data`

**3.** Two tests POST `{ title: "Test Product" }` under `--workers=4`. Likely result:

- A) Always fine
- B) Collision (409 or overwritten row) — not isolated
- C) Playwright refuses POST
- D) 415

**4.** Partial body to PUT that implements replace typically:

- A) Merges
- B) May erase omitted fields
- C) Becomes GET
- D) Always 201

**5.** After a 400 create, you must also:

- A) Retry until 201
- B) Prove no new resource exists
- C) Assert `ok()`
- D) Sleep 5s

**6.** Cleanup `delete` returns 404 because the test already deleted. Cleanup should:

- A) Fail the test
- B) Treat 404 as success / ignore
- C) Recreate the resource
- D) Call `waitForTimeout`

**7.** `Promise.all([createUser(), createOrder(userId)])` when `userId` comes from the user create is:

- A) Correct concurrency
- B) Wrong — order depends on user id
- C) Required by REST
- D) A DELETE

**8.** True or false: One product created in `beforeAll` and reused for create, update, and delete tests is a good speed optimization.

**9.** `Location` after POST is useful because:

- A) It replaces the body
- B) It is part of the create contract — you can GET that URL
- C) It is the token
- D) It is required for GET lists

**10.** Repeat `DELETE` on the same id. You should:

- A) Assume 500
- B) Assert the documented second-call status (often 204 or 404)
- C) Skip the second call
- D) Use GET to delete

---

## J. Review

### Competency check

> **After your suite runs and fails halfway, is the environment as clean as it was before?**

If not, teardown is not done.

---

[← 4.4 Playwright API Testing Basics](04-playwright-api-testing-basics.md) · [Next: 4.6 API Authentication and Authorization →](06-api-authentication-and-authorization.md)
