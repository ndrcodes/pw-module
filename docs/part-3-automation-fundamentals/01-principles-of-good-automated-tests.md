# Chapter 3.1 — Principles of Good Automated Tests

🟡 **Intermediate** · [Part III Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | III — Automation Fundamentals |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [Part I](../part-1-testing-fundamentals/00-module-overview.md), [Part II](../part-2-programming-fundamentals/00-module-overview.md) |
| **Next chapter** | [3.2 Test Automation Architecture](02-test-automation-architecture.md) |

---

> There is a question that matters more than "does this test pass?"
>
> **What would have to break for this test to fail?**
>
> If you cannot finish that sentence, the test is not finished. Every project rubric in this course, and the [grader verification procedure](../00-course-overview/04-assessment-strategy.md#7-verification-procedure-used-by-graders), is that question made mechanical.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Define** independence, isolation, and determinism, and **distinguish** them with examples.
2. **Evaluate** an existing test against those properties and **name** which one it violates.
3. **Restructure** a test into explicit Arrange → Act → Assert phases.
4. **Assess** whether a test can actually fail, and **strengthen** assertions that cannot.
5. **Choose** between shared setup/teardown and per-test data creation, and **justify** the choice.
6. **Explain** why an untrusted suite has negative value, and **describe** how trust is lost.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Test case quality: atomic, deterministic, verifiable | [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) |
| Untrusted suites have negative value | [Chapter 1.2](../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) |
| Functions, arrays, objects, interfaces | [Chapters 2.7–2.10](../part-2-programming-fundamentals/00-module-overview.md) |
| `async`/`await` | [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) |
| Experience of your own duplicated code | Projects 1 and 2 |

Chapter 1.4 taught these properties as *written* test-case quality. This chapter teaches them as *executable* test quality. The names are the same; the failure modes are now code.

---

## C. Concept Explanation

### C.1 The falsifiability question

A test is an experiment. An experiment that cannot come out negative is not an experiment.

```ts
test("user can log in", async ({ request }) => {
  const response = await request.post("/api/login", {
    data: { email: "user@example.com", password: "wrong-password" },
  });
  expect(response).toBeTruthy();           // a response object is always truthy
  expect(response.status()).toBeDefined(); // a status is always defined
});
```

What would have to break in the application for this to go red? **Nothing.** The password is wrong, the login can 401 or 500 or return HTML, and both assertions still pass. The test runs. It reports coverage. It protects nothing.

This is the [instructor notes](instructor-notes.md) Demo 1. It is also the most common defect in beginner suites and the first thing an experienced reviewer looks for. [Assessment Strategy §8](../00-course-overview/04-assessment-strategy.md#8-common-failure-modes-across-all-submissions) lists `expect(response.ok()).toBeTruthy()` as the only assertion for the same reason: any 2xx passes; almost nothing was verified.

**The sentence every test must complete:**

> This test fails if ________.

For a login test: *this test fails if a valid user cannot obtain a session.* Then write assertions that make that sentence true — status, body shape, a token that is actually present, a follow-up request that uses it.

If you cannot write the sentence, delete the test or finish it. Do not ship a green light wired to nothing.

### C.2 Weak assertions, and the strong replacement

| Weak | What it actually proves | Strong replacement |
|---|---|---|
| `expect(response).toBeTruthy()` | An object exists | `expect(response.status()).toBe(201)` |
| `expect(response.status()).toBeDefined()` | HTTP has statuses | `expect(response.status()).toBe(201)` |
| `expect(response.ok()).toBeTruthy()` | Some 2xx happened | Status **and** a field that identifies the created resource |
| `expect(body).toBeTruthy()` | Parse returned something | `expect(body.id).toMatch(/^ORD-\d{6}$/)` |
| `expect(page).toBeDefined()` | Playwright gave you a page | A web-first assertion on a user-visible outcome |
| `expect(true).toBe(true)` | Arithmetic works | Delete it |
| `expect(items.length).toBeGreaterThan(0)` | The list is not empty | `expect(items.map(i => i.id)).toContain(seededId)` |
| `expect(message).toContain("success")` | Some string includes that substring | The exact contract message, or a code |

The pattern: weak assertions check that *something happened*. Strong assertions check that *the thing you claimed happened, happened, for the record you created.*

A test with five weak assertions is not safer than a test with one. It is five ways to stay green.

### C.3 Independence — relationships between tests

**Independence** means: this test does not require another test to have run first. You can run it alone, in any order, on a fresh environment, and it behaves the same.

```ts
test("1. create product", async () => { /* POST /products → id stored in global */ });
test("2. edit product", async () => { /* PATCH the id from test 1 */ });
test("3. delete product", async () => { /* DELETE the id from test 1 */ });
```

File run: green. `npx playwright test --grep "edit product"`: red. `--workers=2`: red, intermittently.

That is Demo 2. It is also [grader step 5](../00-course-overview/04-assessment-strategy.md#7-verification-procedure-used-by-graders): shuffled or reversed order, and `--workers=1` versus `--workers=4`. Order dependence is a reliability defect, not a style note.

**How to verify independence mechanically:**

1. Run the test **alone**.
2. Run the file **reversed** (or shuffled).
3. Run with **multiple workers**.

If any of those changes the verdict, the test is not independent. [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) does not create this problem. It *reveals* it. The problem was always there; serial execution was hiding it.

Independence is about **order, data, and state** — not about "no shared variables in the file." Two tests that never mention each other can still be coupled if both assume "the admin user has an empty cart."

### C.4 Isolation — blast radius

**Isolation** means: this test does not disturb anything another test depends on.

Independence and isolation are easy to blur. Keep them concrete:

| | Question | Failure shape |
|---|---|---|
| **Independence** | Does A require B to run first? | A fails when run alone |
| **Isolation** | Does A touch something B also touches? | A and B pass alone, fail (or flake) together |

A test can be **independent and not isolated**. It creates nothing; it does not need a previous test; it mutates the shared `admin@shop.test` cart. Run alone: green. Run next to a colleague's suite at 4 p.m.: "cart already has items."

Demo 3 is two people running the same registration test with `user@example.com`. One gets "email already exists." Hardcoded shared data is not careful. It is a collision scheduled for later.

**Isolating the test is not isolating the system.** End-to-end tests share a real app. You cannot give each test its own universe. You *can* give each test its own **data**: unique email, unique SKU prefix, unique order. Unique data is achievable everywhere. Fatalism ("isolation is impossible in E2E") usually means the suite was built on shared records.

### C.5 Determinism — stable verdict, not frozen data

**Determinism** means: the same system state produces the same result. The *verdict* is stable.

It does **not** mean "no random values."

```ts
const email = "user1@test.com";          // looks deterministic; collides under parallel
const email = `buyer-${crypto.randomUUID()}@shop.test`;  // random data, stable verdict
```

Hardcoded shared identities are the *least* deterministic choice once two workers or two engineers exist. Random **unique** data stabilizes the verdict because collisions disappear.

Other techniques, already previewed in [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md):

| Technique | Instead of | Use |
|---|---|---|
| Absolute time | "last month" | `2026-03-01` through `2026-03-31` |
| Seeded boundaries | "all orders" | Four known orders, two outside the window |
| Relative assertions | `expect(stock).toBe(41)` | `expect(stock).toBe(before - 1)` |
| Captured ids | "the most recent order" | The id *this test* created |

When the system is genuinely stateful — stock levels, sequential order numbers, rate limits — do not pretend the app is a pure function. Create your own data. Assert on **relationships**, not magic numbers. Some checks belong at a lower layer ([Chapter 1.3](../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md)): you do not need an E2E test to prove arithmetic on a line total.

Controlling time and randomness is a framework concern later ([Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md)). The principle is now: if the verdict depends on the clock, the leftover database, or whoever ran last, the test is not deterministic.

### C.6 Arrange → Act → Assert is a constraint

**Arrange** — set up the world (data, auth, navigation to the starting point).
**Act** — perform **one** meaningful action (the behavior under test).
**Assert** — verify the outcome.

AAA is not a comment convention. Comments that say `// Arrange` above tangled code do not make it AAA. The constraint is:

- No assertions during Arrange.
- No new setup during Assert.
- The Act is one behavior, not a tour.

```ts
// BEFORE — interleaved, five behaviors, failure names nothing
test("checkout", async ({ request }) => {
  const user = await createUser();
  expect(user.id).toBeTruthy();
  const product = await createProduct({ price: 49.5 });
  await addToCart(user, product);
  expect((await getCart(user)).items).toHaveLength(1);
  const order = await checkout(user, { card: "valid" });
  expect(order.status).toBe("confirmed");
  await addToCart(user, product); // leftover cart from a previous idea
  expect((await getCart(user)).items).toHaveLength(0);
});
```

```ts
// AFTER — one reason to fail
test("checkout with a valid card confirms the order and returns an ORD- id", async ({ request }) => {
  // Arrange
  const user = await createUser();
  const product = await createProduct({ price: 49.5 });
  await addToCart(user, product);

  // Act
  const order = await checkout(user, { card: "valid" });

  // Assert
  expect(order.status, "order should be confirmed").toBe("confirmed");
  expect(order.id, "confirmation should carry an order number").toMatch(/^ORD-\d{6}$/);
});
```

After the rewrite, two things become obvious: what the test is *for*, and what a failure means. That is Demo 4. The audience for a failing test is a tired person who did not write it. AAA is how you write for that person.

Cart-empty-after-checkout is a **different test**. Shipping-threshold crossing is a different test. [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) called this atomicity. One reason to fail is the executable form of that rule.

If a test asserts five unrelated things and fails, the report says the test name and the first assertion. You do not know which behavior broke without reading the body. Split it.

### C.7 Setup and teardown — speed is not free

| Strategy | What it shares | When it is justified | Typical cost |
|---|---|---|---|
| **Per-test creation** | Nothing | Default. Unique user, unique product, unique order | Slower; trustworthy |
| **`beforeEach`** | Setup *code*, not mutable *state* | Expensive identical arrange that does not leak | Fine if each test still owns its data |
| **`beforeAll`** | One object for the whole file | Truly immutable reference data (a catalog fixture you will not edit) | Dangerous the moment a test mutates it |
| **Shared environment record** | A real user / product / order everyone knows | Almost never, in this course | Collisions, order dependence, Tuesday failures |

"`beforeAll` is the fast option" is the misconception. Speed bought with shared mutable state is repaid with failures that only appear when one test is run alone — or only when it is *not*.

**Cleanup that lives at the end of the test body is skipped on failure.** The test throws; the delete never runs; the next run collides with the leftover. Teardown belongs in a mechanism that **always runs** — Playwright fixtures' teardown, `try`/`finally`, `afterEach` that does not assume success. [Chapter 6.2](../part-6-framework-engineering/02-fixtures.md) is that mechanism. The principle is now: **if the test dies halfway, what remains?**

Nightly environment reset is not cleanup. Two engineers at 4 p.m. do not wait for midnight.

### C.8 Names are specifications

```ts
test("test login", async () => { /* ... */ });
test("user can log in", async () => { /* ... */ });
test("login with valid credentials returns 200 and a session token", async () => { /* ... */ });
```

The first names a topic. The second names a hope. The third names an expected behavior — and completes the falsifiability sentence.

Name the **outcome**, not the steps. "Add lamp, go to cart, click checkout, fill card" is a script. "Checkout with a valid card confirms the order" is a specification. When it fails in CI at 2 a.m., the name is the first artifact.

### C.9 Reuse versus the rule of three

Duplication is cheaper than the wrong abstraction.

**Rule of three:** duplicate twice; abstract on the third occurrence, when you can see the pattern. A helper used once and parameterized six ways is not reuse. It is a puzzle the next reader has to solve.

This chapter names the rule. [Chapter 3.2](02-test-automation-architecture.md) applies it to layers. Do not extract a `loginAndCheckoutAndAssert` on the first test that needs login.

### C.10 The trust equation

[Chapter 1.2](../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) said an untrusted suite has **negative value**: it consumes cost, hides real failures in noise, and suppresses the manual testing that would have caught them.

Trust is lost one reasonable shortcut at a time:

1. A weak assertion to "get it green."
2. A shared user because creating users was slow.
3. A `beforeAll` login mutated by a later test.
4. Cleanup only on the happy path.
5. A retry "just for that one flake."
6. The team starts rerunning red builds before reading them.
7. Red means "probably fine." The suite is now decoration.

**40 flaky tests are worth less than 10 reliable ones.** Reliability, maintainability, and speed are design constraints, not aspirations you add later. You cannot retrofit trust. You can only stop spending it.

Retries are not a reliability strategy. They are a way to hide a race. This course caps retries (one, on the capstone, and you must justify it). If a test needs a retry to pass, the test or the app is nondeterministic. Fix that.

---

## D. QA Context

### D.1 Graders already run this chapter

[Assessment Strategy §7](../00-course-overview/04-assessment-strategy.md#7-verification-procedure-used-by-graders) is the properties above as a checklist:

| Grader step | Property |
|---|---|
| Run twice; verdict must not change | Determinism |
| Reversed order / multiple workers | Independence (and isolation, if collisions appear) |
| Deliberately break the app; the test must go red | Falsifiability |
| Trace/report identifies the cause without a rerun | AAA + named assertions + artifacts ([Chapter 3.2](02-test-automation-architecture.md)) |

Step 7 — break it on purpose — is the step learners lose most often. Part IV will require it on every scenario. Practice the sentence now.

### D.2 Parallelism is the exam

[Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) enables workers and shards. Every isolation shortcut you take in Parts IV–V becomes a flake there. Designing for independence now is cheaper than debugging collisions in Week 22.

### D.3 The organizational failure

A team that cannot trust the suite stops treating red as information. They rerun. They skip. They merge on yellow. The suite still "covers" the product. Defects ship with a green-ish pipeline. That is [Chapter 1.2](../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) C.9 in a standup, not a textbook.

Your job is not to maximize test count. It is to keep the suite in the set of things the team will act on.

---

## E. Code Examples

### E.1 Very simple — cannot fail, then can

```ts
test("create order — cannot fail", async ({ request }) => {
  const response = await request.post("/api/orders", { data: { sku: "LAMP" } });
  expect(response).toBeTruthy();
});

test("create order — fails if the order is not created", async ({ request }) => {
  const response = await request.post("/api/orders", { data: { sku: "LAMP", qty: 1 } });
  expect(response.status(), "order should be created").toBe(201);
  const body = await response.json();
  expect(body.id, "created order should have an ORD- id").toMatch(/^ORD-\d{6}$/);
});
```

Break the handler so it returns 500. Only the second test goes red. That is the whole point.

### E.2 Practical — order-dependent, then independent

```ts
// Coupled — do not write this
let productId: string;
test("create", async () => { productId = await createProduct("LAMP"); });
test("rename", async () => { await renameProduct(productId, "Aeron Lamp"); });
test("delete", async () => { await deleteProduct(productId); });

// Independent — each test owns its data
test("creating a product returns a SKU", async () => {
  const product = await createProduct(`LAMP-${id()}`);
  expect(product.sku).toMatch(/^LAMP-/);
});

test("renaming a product updates the catalogue title", async () => {
  const product = await createProduct(`LAMP-${id()}`);
  const updated = await renameProduct(product.id, "Aeron Lamp");
  expect(updated.title).toBe("Aeron Lamp");
});

test("deleting a product removes it from GET /products/:id", async () => {
  const product = await createProduct(`LAMP-${id()}`);
  await deleteProduct(product.id);
  const response = await getProduct(product.id);
  expect(response.status()).toBe(404);
});
```

Yes, you create three products instead of one. That is the price of a suite you can debug.

### E.3 QA-oriented — AAA rescue

Take any 40-line test you wrote in Project 2's neighborhood (or the tangled `checkout` in C.6). Draw three boxes. Move every line into one box. If a line does not fit, it is a second test or leftover setup.

Then write the falsifiability sentence. If you need "or" in the sentence, you have two tests.

### E.4 Automation-oriented — collision, then unique data

```ts
const SHARED = "admin@shop.test";

test("admin can add a lamp to the cart", async () => {
  await login(SHARED);
  await addToCart("LAMP");
  expect(await cartCount(SHARED)).toBe(1);  // fails if a sibling also added
});

test("admin cart — isolated", async () => {
  const admin = await createUser({ role: "admin", email: `admin-${id()}@shop.test` });
  await addToCart(admin, "LAMP");
  expect(await cartCount(admin)).toBe(1);
});
```

Run the first pair with two workers. Then the second. The difference is the chapter.

---

## F. Common Mistakes

### F.1 Assertions that cannot fail

`toBeTruthy()` on an object. `toBeDefined()` on a status. `ok()` as the only check. See C.2.

### F.2 Order dependence

Test 2 edits what test 1 created. Fails `--grep` and workers. See C.3.

### F.3 Shared login accounts

`admin@shop.test` / `user1` mutated by everyone. Independent-looking, not isolated. See C.4.

### F.4 Hardcoded IDs from a database peek

`expect(order).toBe("ORD-000041")` works on your laptop until the environment is reset. Grader step 2.

### F.5 `beforeAll` setup that later tests modify

The first test to run "wins." Alone versus together disagree.

### F.6 Cleanup at the bottom of the test body

Skipped on throw. Leftovers become tomorrow's flake.

### F.7 One test, six behaviors

Failure names the test, not the behavior. Split. See C.6.

### F.8 Names that describe steps

"Click checkout and fill the form." Name the outcome.

### F.9 Abstracting on the first duplication

A `doEverything(options)` helper after one copy-paste. Wait for the third. See C.9.

### F.10 Retries as reliability

The flake is still there. You just asked CI to roll the dice again.

---

## G. Exercise

Suggested total time: 90 minutes.

### G.1 Easy — What does this prove? (20 min)

For each assertion, write one sentence: *what this actually proves.* Then rewrite the five weakest so they can fail for a real defect.

```ts
expect(response).toBeTruthy();
expect(response.status()).toBeDefined();
expect(response.ok()).toBe(true);
expect(body.id).toMatch(/^ORD-\d{6}$/);
expect(body.items.length).toBeGreaterThan(0);
expect(page).toBeDefined();
expect(await title.textContent()).toBe("Order confirmed");
expect(true).toBe(true);
expect(stock).toBe(41);
expect(email).toBe("user1@test.com");
```

### G.2 Medium — Audit five tests (35 min)

You will be given (or you will write) five short tests that each violate **one** primary property. For each, deliver:

| Field | Required |
|---|---|
| Violated property | independence / isolation / determinism / falsifiability / AAA / cleanup |
| Symptom | what a grader or a colleague would observe |
| Fix | one concrete change, not "make it better" |

Reasoning outranks the label. A wrong name with the right mechanism scores higher than a lucky label.

### G.3 Challenge — Hidden dependencies (35 min)

A five-test file with three hidden order dependencies (shared `let`, shared user, leftover cart). Make every test pass:

1. alone,
2. with the file reversed,
3. with four workers.

Then one paragraph: which shared resource caused each dependency. Do not claim "it was flaky." Name the resource.

---

## H. Coding Assignment

### Assignment 3.1 — Suite audit and repair

**Objective.** Given a suite that passes today and violates several reliability properties, produce a written audit, a repaired suite, and proof that each repaired test still fails when its behavior is broken.

**Deliverable.** `assignment-3-1/AUDIT.md`, repaired tests under `assignment-3-1/tests/`, `PROOF.md`.

If no suite is supplied, **write the broken suite first** (at least five tests, at least four distinct violation types from C.3–C.7), commit it, then repair it. Both versions stay in git history (or in `broken/` and `repaired/`).

**AUDIT.md** — one section per test:

1. Falsifiability sentence (even if the current test cannot fulfill it).
2. Violated property and the mechanism.
3. Expected symptom (alone / reversed / workers / "still green when broken").
4. Proposed fix.

**Repaired suite**

- Every test completes a falsifiability sentence in a comment above it.
- Passes alone, reversed, and with `--workers=4` (document the commands in `PROOF.md`).
- Unique data; no shared mutable `beforeAll` records; teardown that runs on failure.
- AAA visible without relying on comments alone (blank lines / structure).
- Strong assertions (C.2).

**PROOF.md**

For **each** repaired test: what you broke on purpose, and that the test went red. A suite that only stays green has not been graded yet.

**Requirements.**

| # | Requirement |
|---|---|
| 1 | At least four violation types named in the audit |
| 2 | Repaired tests independent and isolated as defined in C.3–C.4 |
| 3 | Break-it-on-purpose evidence per test |
| 4 | No `waitForTimeout` / `sleep` |
| 5 | No retries used to "fix" a remaining flake |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Audit reasoning | 30% | Mechanism named; symptom predicted; label can be slightly off |
| Repair | 30% | Alone / reversed / workers hold |
| Falsifiability proof | 25% | Each test shown red when its behavior is broken |
| Assertions and AAA | 15% | Strong asserts; one reason to fail |

> **AI usage: restricted.** The audit is judgment. An AI-generated table of labels without mechanisms scores near zero on the 30%.

---

## I. Quiz

Nine questions. Answer key: [`answer-keys/part-3/01-principles-of-good-automated-tests.answers.md`](../answer-keys/part-3/01-principles-of-good-automated-tests.answers.md).

**1.** `expect(response).toBeTruthy()` after `request.post` is weak because:

- A) POST is deprecated
- B) A response object is always truthy, so no application defect can fail the test
- C) Playwright forbids `toBeTruthy`
- D) It is too slow

**2.** Test A creates a product. Test B edits "the product A created," using a shared `let`. B is primarily missing:

- A) Isolation only
- B) Independence (it cannot run alone)
- C) A service layer
- D) A retry

**3.** Two tests both use `admin@shop.test` and mutate the cart. Each passes alone. Together they flake. The missing property is:

- A) Independence (order)
- B) Isolation (shared mutable data)
- C) AAA
- D) Naming

**4.** True or false: Determinism means the test must not use random values.

**5.** A test asserts login, add-to-cart, discount, checkout, and order-history in one body. The main reliability/maintenance problem is:

- A) It is too fast
- B) A failure does not name which behavior broke; the test has many reasons to fail
- C) It uses `await`
- D) It needs `beforeAll`

**6.** Cleanup written as the last lines of the test body is risky because:

- A) Playwright ignores it
- B) Those lines are skipped if an earlier assertion throws
- C) Cleanup is always illegal
- D) It makes tests independent

**7.** `beforeAll` is appropriate when:

- A) You want tests to share a cart they will modify
- B) The shared data is immutable reference data this file will not edit
- C) Always — it is faster
- D) Never

**8.** Which setup is most likely to stay deterministic under two workers?

- A) `email: "user1@test.com"`
- B) `email: \`buyer-${crypto.randomUUID()}@shop.test\``
- C) Reading whatever user the previous test left logged in
- D) A hardcoded order id from last Tuesday's database

**9.** A test failed in CI last night and passed this morning. Your first move:

- A) Rerun until green
- B) Read the artifacts (report, trace, named assertion) from the failing run
- C) Add a retry
- D) Delete the test

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Falsifiability | This test fails if ___ |
| Independence | Does not need another test to have run first |
| Isolation | Does not disturb what another test depends on |
| Determinism | Same system state → same verdict (unique data often *helps*) |
| AAA | Arrange the world, one act, then assert — no mixing |
| One reason to fail | Atomicity, executable |
| Teardown | Must run when the test dies halfway |
| Rule of three | Duplicate twice; abstract on the third |
| Trust | 40 flakes < 10 reliable tests; untrusted suites have negative value |

### Mistakes recap

Cannot-fail asserts · order dependence · shared accounts · peeked IDs · mutable `beforeAll` · cleanup-on-success-only · mega-tests · step-names · early abstraction · retries as strategy.

### Competency check

> **For every test you write from now on, can you complete the sentence "this test fails if ___"?**

If not, the test is not finished. That sentence is the gate into Part IV.

---

[← Part III Overview](00-module-overview.md) · [Next: 3.2 Test Automation Architecture →](02-test-automation-architecture.md)
