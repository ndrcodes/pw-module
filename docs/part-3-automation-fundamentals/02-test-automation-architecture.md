# Chapter 3.2 — Test Automation Architecture

🟡 **Intermediate** · [Part III Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | III — Automation Fundamentals |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [3.1 Principles of Good Automated Tests](01-principles-of-good-automated-tests.md) |
| **Next chapter** | [4.1 HTTP Fundamentals](../part-4-api-testing-and-automation/01-http-fundamentals.md) |

---

> A suite of ten tests needs no architecture. A suite of five hundred, maintained by four people over three years, needs almost nothing else.
>
> Architecture is not an aesthetic. It is a **maintenance-cost decision**: whether adding the eight-hundredth test is twenty minutes or two days, and whether a rename in the application costs one edit or forty.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Describe** the responsibility of each layer in a layered automation architecture.
2. **Place** a given piece of code in the correct layer, and **recognize** a layer violation.
3. **Explain** the dependency rule — layers depend downward, never upward — and **identify** violations of it.
4. **Describe** the roles of test runner, assertion library, reporter, logs, and artifacts in a failure investigation.
5. **Justify** each layer by naming a specific duplication or coupling it removes.
6. **Recognize** over-abstraction, and **argue** when duplication is preferable to a new layer.
7. **Author** a framework constitution: your own written rules for what may live where.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Independence, isolation, determinism, AAA | [Chapter 3.1](01-principles-of-good-automated-tests.md) |
| Functions, objects, interfaces, modules | [Chapters 2.7–2.10](../part-2-programming-fundamentals/00-module-overview.md) |
| Having personally duplicated code across files | Projects 1 and 2 |

When this chapter argues for a utility layer, you should recognize the argument: you already copied a pass-rate calculation into three files.

---

## C. Concept Explanation

### C.1 Architecture is who pays later

Without structure, every test file becomes a script: URLs, locators, tokens, sleeps, and assertions in one pile. The first ten tests are fast to write. Test 80 copies test 12 and changes three strings. A designer renames a button; forty files change. A new engineer cannot find "where login lives."

**Layering by responsibility** is how you keep the cost of change closer to linear than to "grep the universe."

Layers cost **indirection**. The person reading a failure at 2 a.m. pays that cost. So each layer must earn its place by removing a *named* duplication or a *named* coupling. A layer you cannot justify is inventory. Delete it.

### C.2 The five layers

```text
Test Layer            What is being verified, in business language
    ↓
Page/API Layer        How to interact with one screen or one endpoint
    ↓
Service Layer         Multi-step business workflows (register, then log in, then seed a cart)
    ↓
Utility Layer         Generic helpers: data factories, date formatting, retries, logging
    ↓
Configuration         Environments, base URLs, credentials, timeouts, browsers
```

| Layer | Says | Contains | Must not contain |
|---|---|---|---|
| **Test** | *What should be true* | AAA, business-language names, assertions | Locators, raw URLs, `fetch` plumbing, `waitForTimeout` |
| **Page / API** | *How to talk to one thing* | One screen's locators and actions; one resource's HTTP calls | Assertions about business outcomes; workflows that span three screens |
| **Service** | *How to get the world ready* | `registerAndLogin`, `seedCart`, `placeOrderViaApi` | CSS selectors; `expect` |
| **Utility** | *Generic, domain-light help* | `userFactory`, ISO dates, logger | Knowledge of `LoginPage` or `/api/orders` |
| **Configuration** | *What varies by environment* | Base URL, credentials *references*, timeouts, browser | Test logic, locators |

Dotted-legal shortcuts from the [module overview](00-module-overview.md): a test may call a service directly (API setup for a UI test). A page may use a utility (format a date). An arrow **upward** is a violation: a utility that imports `LoginPage`, a page object that imports `checkout.spec.ts`.

### C.3 The dependency rule

**Each layer may depend on the layer below it, never the one above.**

- A page object must not know which test is using it.
- A utility must not know your login page exists.
- Configuration must not import tests to "know" which URL to use.

Why: upward dependencies create cycles and make reuse impossible. If `userFactory` imports `CartPage` to "helpfully" empty a cart, you cannot use the factory in an API-only test, and a cart-page change breaks data creation.

[Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) treats upward arrows as review defects. Learn to see them now.

### C.4 Three worked violations

**Violation 1 — locator in a test**

```ts
test("lamp appears in the cart", async ({ page }) => {
  await page.locator("#cart > div:nth-child(3) span").click();
  await expect(page.locator(".line-title")).toHaveText("Aeron Desk Lamp");
});
```

Symptom: a layout change breaks the test, and the fix is copied through every file that inlined the same CSS. The test no longer reads as a specification; it reads as a script.

**Placement:** locators and `click` on *this screen* belong in `CartPage`. The test says `await cartPage.expectLine("Aeron Desk Lamp")` or asserts on a return value. (How page objects expose intent is [Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md). The *rule* is here.)

**Violation 2 — business workflow inside a page object**

```ts
class CartPage {
  async checkoutAsNewUser(): Promise<void> {
    await this.register();
    await this.login();
    await this.addDefaultLamp();
    await this.applyCoupon("SAVE10");
    await this.placeOrder();
  }
}
```

Symptom: the mobile app, the API suite, and a second web flow all need "new user with a lamp in the cart." They cannot reuse a class that knows CSS. Changing the coupon step breaks every UI test that only wanted a seeded cart.

**Placement:** `CheckoutService.seedReadyToPayCart()` uses the **API** (or a service that does). `CartPage` knows how to click *this* cart.

**Violation 3 — hardcoded URL in a utility**

```ts
export async function createUser(email: string): Promise<User> {
  const response = await fetch("https://staging.shop.test/api/users", { /* ... */ });
}
```

Symptom: staging URL in a helper; production and local need edits in twenty files; CI uses a different host and nobody remembers this one.

**Placement:** `createUser` reads `config.baseURL` (or Playwright's `request` fixture, which already knows the base). Configuration owns the host.

### C.5 What belongs in a test

A test file should be readable by someone who knows the product and does not know Playwright.

```ts
test("checkout with a valid card confirms the order and returns an ORD- id", async ({ request }) => {
  const buyer = await userFactory.buyer();
  const product = await catalog.seedLamp();
  await cart.add(buyer, product, 1);

  const order = await checkout.place(buyer, { card: "valid" });

  expect(order.status, "order should be confirmed").toBe("confirmed");
  expect(order.id).toMatch(/^ORD-\d{6}$/);
});
```

Arrange / Act / Assert are visible. Locators are absent. The base URL is absent. If this file imports `page.locator`, the layer is leaking.

Assertions about **business outcomes** live in the test (or in a custom matcher used *by* the test). Assertions inside page objects or API clients blur the layer: the test can no longer state intent, and you cannot reuse `CartPage.add` without also accepting its opinions about what "success" means. [Assessment Strategy §8](../00-course-overview/04-assessment-strategy.md#8-common-failure-modes-across-all-submissions) lists this explicitly.

### C.6 Anatomy of a failure investigation

When a test fails, you are not "running tests." You are **diagnosing**. These roles are distinct:

| Piece | Job |
|---|---|
| **Test runner** | Discovers files, runs them, applies workers, retries, timeouts (`npx playwright test`) |
| **Assertion library** | Decides pass/fail and formats the mismatch (`expect`) |
| **Reporter** | Turns the run into a human-readable story (HTML report, list, CI annotations) |
| **Logs** | Time-ordered events you chose to emit (request id, seeded email) |
| **Artifacts** | Evidence captured at failure: screenshot, trace, video, response body |

Demo 6: the same failure twice. Once you have only `Error: expect(received).toBe(expected)`. Once you have a screenshot, a trace, and `expect(order.status, "order should be confirmed").toBe("confirmed")`. Time both diagnoses. The second is why [Chapter 6.8](../part-6-framework-engineering/08-debugging-playwright-tests.md) exists, and why [Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md) publishes reports rather than a console dump.

**First move on a CI failure is read the artifacts, not rerun.** Rerunning destroys the only evidence of a flake. [Chapter 3.1](01-principles-of-good-automated-tests.md) Q9 is this sentence.

Machine-readable output (JUnit, JSON reporter) is for CI gates and flake-tracking scripts — Project 1's shape, from a pipeline. Human reports are for people. You need both. Configuring neither is how a team debugs by pressing the button again.

### C.7 Project structure this book uses

```text
tests/
  api/
    orders.spec.ts              # test layer
  web/
    checkout.spec.ts
src/
  api/
    orders-client.ts            # page/API layer (HTTP)
    catalog-client.ts
  pages/
    cart-page.ts                # page/API layer (UI)
    checkout-page.ts
  services/
    checkout-service.ts         # service layer
    auth-service.ts
  fixtures/
    user-factory.ts             # utility (data)
    ids.ts
  config/
    env.ts                      # configuration
playwright.config.ts            # configuration (runner)
```

Names vary. Responsibilities should not. A `helpers.ts` that contains `login`, `formatDate`, `parseOrder`, and `waitForSpinner` is not a layer. It is a junk drawer. Split it when you can name two different reasons it would change.

### C.8 Naming across layers

| Kind | Pattern | Example |
|---|---|---|
| Spec file | behavior area | `checkout.spec.ts` |
| Test name | outcome | `checkout with a valid card confirms the order` |
| Page class | screen + `Page` | `CartPage` |
| API client | resource + `Client` | `OrdersApiClient` |
| Service | workflow | `AuthService`, `CheckoutService` |
| Factory | entity + `Factory` | `userFactory` |
| Config | what it configures | `env.ts`, `playwright.config.ts` |

Page objects expose **intent**, not plumbing: `login(user)` not `getLoginButton()` then click in the test. That is [Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md); the naming already implies it.

### C.9 The rule of three, at architecture scale

[Chapter 3.1](01-principles-of-good-automated-tests.md) C.9: duplicate twice; abstract on the third.

Applied to layers:

- **One** test talks to `POST /orders` inline. Leave it.
- **Two** tests copy the call. Tolerate it; watch the drift.
- **Third** copy: extract `OrdersApiClient`. Now you can see which headers and which error handling are actually shared.

**Over-abstraction smells:**

- A `BasePage` with eleven protected methods, two of which are used.
- A service layer for eight tests that never share a workflow.
- A helper used once, with six optional parameters "for later."
- Five layers because a blog had five folders.

**When duplication is correct:** the two copies are about to diverge (web login vs API token login). Forcing them through one function hides the difference until it becomes a bug. Two honest functions beat one dishonest one.

### C.10 How architecture evolves

Nobody starts with five layers. Pain triggers the next extraction:

```text
Scripts (everything in the spec)
    → first rename costs too much
Page / API objects (how-to-talk-to-one-thing)
    → setup workflows copy-pasted across specs
Services (get the world ready)
    → user emails and dates invented ad hoc
Factories and config (data + environment)
    → tests need composed setup without copying
Fixtures ([Chapter 6.2](../part-6-framework-engineering/02-fixtures.md))
```

Each step is a response to a cost you have felt. Copying a folder tree from a tutorial *before* that cost is how you get five layers for eight tests.

### C.11 A framework constitution

A **constitution** is a one-page document you wrote: what may live where, what is forbidden, and how you will decide the next extraction.

It is not busywork. You will be graded against **your own** document in the [capstone](../capstone/00-capstone-overview.md) architecture defense. You may revise it — if you can explain what changed your mind. Changing your mind with reasons scores higher than defending a rule you no longer believe ([Chapter 8.3](../part-8-professional-engineering/03-scalable-automation-architecture.md)).

A constitution that says "we use best practices" is not a constitution. One that says "locators never appear in `tests/`; a third copy of an HTTP call becomes a client; utilities must not import pages" can be enforced in review.

---

## D. QA Context

### D.1 Where each layer is built later

| Layer | You implement it in |
|---|---|
| API client | [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md) |
| Page objects | [Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md) |
| Fixtures (composition) | [Chapter 6.2](../part-6-framework-engineering/02-fixtures.md) |
| Data factories | [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md) |
| Auth as a service | [Chapter 6.3](../part-6-framework-engineering/03-authentication-strategies.md) |
| Artifacts and traces | [Chapter 6.8](../part-6-framework-engineering/08-debugging-playwright-tests.md) |
| Reports in CI | [Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md) |
| Review of violations | [Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) |

Part III names the standards. Parts IV–VI implement them. Part VIII enforces them on someone else's code.

### D.2 Login in a page object versus a service

If `LoginPage.login` is the only way to become authenticated, the API suite and the mobile suite invent their own logins. Auth as a **service** (token via API) lets a web test skip the login screen when the behavior under test is checkout. That is a pyramid decision ([Chapter 1.3](../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md)) *and* a layer decision.

### D.3 The constitution returns

Capstone defense: "Show me a file. Name its layer. Name the duplication that layer removes. Show me a rule in your constitution this file obeys." Learners who copied a blog structure without a constitution cannot answer. Learners who wrote a specific page and then broke their own rule *on purpose, with a written amendment* can.

---

## E. Code Examples

### E.1 Very simple — what vs how

```ts
// What (test layer)
test("empty cart shows the empty state", async ({ page }) => {
  const cart = new CartPage(page);
  await cart.open();
  await expect(cart.emptyState).toBeVisible();
});

// How (page layer)
class CartPage {
  constructor(private readonly page: Page) {}
  readonly emptyState = this.page.getByText("Your cart is empty");
  async open(): Promise<void> {
    await this.page.goto("/cart");
  }
}
```

The test does not know the URL or the string's locator strategy beyond what the page exposes. The page does not know the test's name.

### E.2 Practical — a tree with jobs

```text
tests/web/cart.spec.ts          → empty-state test above
src/pages/cart-page.ts          → CartPage
src/api/cart-client.ts          → DELETE /cart for cleanup
src/services/auth-service.ts    → token for the API client
src/fixtures/user-factory.ts    → unique buyer
src/config/env.ts               → baseURL
```

Annotate each file with one sentence: *this exists so we do not _____.* If you cannot finish the sentence, the file is a candidate for deletion.

### E.3 QA-oriented — the three violations, corrected

```ts
// 1. Locator moved out of the spec — see E.1

// 2. Workflow is a service, not a page
export async function seedReadyToPayCart(api: ShopApi, buyer: User): Promise<Cart> {
  const product = await api.catalog.seedLamp();
  return api.cart.add(buyer, product, 1);
}

// 3. Host comes from config
export function ordersUrl(path: string): string {
  return `${env.baseURL}/api/orders${path}`;
}
```

### E.4 Automation-oriented — with and without a service

**Without:** every checkout UI test repeats register → login → seed lamp → open cart. A requirement change ("buyers must verify email") edits eight specs.

**With:** `await checkoutService.readyToPayBuyer()` changes once. UI tests that *verify registration* still go through the pages. UI tests that *verify payment* do not pay the registration tax.

The service earns its place the day the third test needed the same workflow. Before that, it is a folder for its own sake.

---

## F. Common Mistakes

### F.1 Locators in test files

The test becomes a script. A rename becomes a hunt. See C.4.

### F.2 Assertions inside page objects or API clients

The client cannot be reused without inheriting a verdict. Tests stop stating intent.

### F.3 Business logic in utilities

`calculateFreeShipping` in `utils/string.ts`. Domain rules belong next to the API/service that uses them, or in the product. Utilities stay generic.

### F.4 Upward dependency

`userFactory` imports `LoginPage`. You can no longer create users from an API test.

### F.5 Five layers for eight tests

Ceremony. Justify or delete.

### F.6 `helpers.ts` as a junk drawer

Unrelated functions that change for unrelated reasons. Split by reason-to-change.

### F.7 `BasePage` god class before duplication

Eleven methods, two used. The next engineer reads all eleven before writing a test.

### F.8 Configuration read as magic strings in tests

`goto("https://staging...")` in a spec. Environment changes become edits in every file.

### F.9 No reporter, diagnose by rerun

Destroys flake evidence. See C.6.

### F.10 Copied folder tree, unknown jobs

A `services/` directory with one file that wraps a single `click`. Name the duplication or flatten.

---

## G. Exercise

Suggested total time: 90 minutes.

### G.1 Easy — Twenty snippets (25 min)

Assign each line to a layer. If two layers are defensible, pick one and write the reason.

```text
1.  expect(order.status).toBe("confirmed")
2.  page.getByRole("button", { name: "Place order" })
3.  await request.post("/api/orders", { data })
4.  crypto.randomUUID()
5.  process.env.BASE_URL
6.  test("...", async () => { ... })
7.  class OrdersApiClient { ... }
8.  class CartPage { ... }
9.  async function registerLoginAndSeedCart() { ... }
10. formatIsoDate(date)
11. playwright.config.ts timeout
12. await cartPage.addLamp()
13. expect(page).toHaveURL(/\/orders\/ORD-/)
14. readFile("storage-state.json")
15. logger.info(`seeded ${email}`)
16. await page.locator("#cart > div:nth-child(3)").click()
17. const token = await authService.loginAs(buyer)
18. retries: 1 in config
19. interface Order { id: string; status: OrderStatus }
20. await expect(cartPage.emptyState).toBeVisible()
```

(16) is a locator — page layer, and a smell. (19) is a model; it travels with the API layer. (20) is a test-layer assertion that *uses* a page object.

### G.2 Medium — Violation hunt (30 min)

In a mini-tree (write one if none is supplied), plant or find:

1. A locator in a spec.
2. A workflow in a page object.
3. A hardcoded URL in a utility.

For each: the **symptom it would eventually cause** (not just "wrong layer"), then the corrected placement.

### G.3 Challenge — Delete two layers (35 min)

Someone proposes six layers for a 12-test API-only suite: test, API, service, utility, configuration, plus "core" and "shared."

Delete two (or flatten "core"/"shared" into existing ones). Preserve the ability to write the same tests. Write: what was actually lost? If the honest answer is "folder names," that is the lesson.

---

## H. Coding Assignment

### Assignment 3.2 — Architecture plan and framework constitution

**Objective.** Plan the automation of the demo shop before you write Part IV–VI code, and write the rules you will be graded against later.

**Deliverable.** `assignment-3-2/ARCHITECTURE.md`, `assignment-3-2/CONSTITUTION.md`.

**ARCHITECTURE.md** must include:

1. A layer diagram (mermaid or ASCII) for automating the demo shop — API *and* web, even though you will build API first.
2. A file plan: every planned file assigned to a layer. At least 12 files. Use the book's structure (C.7) or a justified variant.
3. For **each** layer you keep: one named duplication or coupling it removes. "Organization" is not a justification.
4. Three example functions/classes placed, with a one-line reason.
5. One explicit non-layer: something you refuse to extract yet, and why (rule of three).

**CONSTITUTION.md** — one page, specific enough to fail a PR against:

| Required rule | Example of sufficient specificity |
|---|---|
| What may live in tests | "No locators, no raw host URLs, no `fetch`" |
| What may live in page/API | "One screen or one resource; no `expect` on business outcomes" |
| Dependency direction | "No import from a lower layer into a higher folder" |
| When to extract | "Third copy of an HTTP call becomes a client" |
| Data | "No hardcoded shared emails; factories produce unique ids" |
| Artifacts | "HTML report + trace on failure required in CI" |
| How you amend | "Change the constitution in the same PR as the exception, with a reason" |

You will reuse this in the capstone. Vague adjectives ("clean," "DRY," "best practice") score as missing rules.

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Layer justification | 30% | Every kept layer names a duplication |
| File plan | 20% | 12+ files, consistent with the diagram |
| Constitution specificity | 30% | A reviewer could reject a PR using only this page |
| Judgment | 20% | At least one refused extraction; no six-layer ceremony for its own sake |

> **AI usage: restricted.** A generated "enterprise folder structure" with no named duplications fails the 30%.

---

## I. Quiz

Nine questions. Answer key: [`answer-keys/part-3/02-test-automation-architecture.answers.md`](../answer-keys/part-3/02-test-automation-architecture.answers.md).

**1.** A test file contains `page.locator("#submit").click()`. The layer problem is:

- A) Tests may not use `click`
- B) A locator belongs in the page layer; the test should state intent
- C) Locators belong in configuration
- D) There is no problem

**2.** `OrdersApiClient.create()` includes `expect(status).toBe(201)`. Why is that a violation?

- A) Clients must never see statuses
- B) Business-outcome assertions belong in the test layer; the client becomes unreusable
- C) 201 is deprecated
- D) Assertions belong in utilities

**3.** `userFactory` imports `LoginPage` to empty a cart. This violates:

- A) AAA
- B) The dependency rule (upward / sideways into UI)
- C) Determinism
- D) The rule of three

**4.** True or false: More layers always mean a more professional framework.

**5.** A `BasePage` has eleven protected methods; two are used. The right move is usually:

- A) Add nine more methods so they get used
- B) Delete or do not introduce the unused surface; extract when duplication exists
- C) Move `BasePage` into configuration
- D) Put locators back in tests

**6.** A test failed in CI. You have only `expect(received).toBe(expected)` in the log. What is missing?

- A) More retries
- B) Artifacts and a named assertion — the diagnosis tools
- C) A sixth layer
- D) `waitForTimeout`

**7.** When do you extract an API client?

- A) Before the first test, from a blog template
- B) On the third copy of the same HTTP call, when the shared parts are visible
- C) Never — duplication is always better
- D) When the file has 20 lines

**8.** HTML report vs JSON reporter:

- A) You need only JSON
- B) HTML is for humans diagnosing a run; JSON/JUnit is for CI machines and scripts
- C) They are the same file
- D) Reports are for managers only

**9.** Your constitution says locators never appear in `tests/`. A PR puts one in a spec "just this once." Per this course:

- A) Merge it; rules are guidelines
- B) Reject, or amend the constitution in the same PR with a reason
- C) Add a retry
- D) Move the locator into `helpers.ts`

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Layer | A responsibility, justified by a named duplication |
| Test layer | What should be true |
| Page/API layer | How to talk to one screen or resource |
| Service layer | Multi-step "get the world ready" |
| Utility layer | Generic help; no pages, no hosts |
| Configuration | What varies by environment |
| Dependency rule | Downward only |
| Artifacts | Evidence; read them before you rerun |
| Rule of three | Abstract when you can see the pattern |
| Constitution | Your rules, specific enough to fail a PR |

### Mistakes recap

Locators in specs · asserts in clients · utilities that know pages · five layers for eight tests · junk-drawer helpers · premature `BasePage` · hosts in tests · no reporter · copied trees.

### Competency check

> **For any piece of code in your framework, can you name its layer and the duplication its layer removes?**

### Part III gate

Before [Part IV](../part-4-api-testing-and-automation/00-module-overview.md), given a test file you have never seen, you can:

1. Name each test's violated reliability property, if any ([Chapter 3.1](01-principles-of-good-automated-tests.md)).
2. Locate Arrange, Act, and Assert.
3. Assign each piece of code to a layer.

Part IV is where these standards meet a real system. There is no rendering and no locator — if a test is unreliable, it is your test's fault. Bring the constitution.

---

[← 3.1 Principles of Good Automated Tests](01-principles-of-good-automated-tests.md) · [Next: Part IV — 4.1 HTTP Fundamentals →](../part-4-api-testing-and-automation/01-http-fundamentals.md)
