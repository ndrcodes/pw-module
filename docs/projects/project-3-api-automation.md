# Project 3 — E-Commerce API Automation Suite

🟡 **Intermediate** · [Table of Contents](../README.md) · **Weight:** 15% of the final grade

| | |
|---|---|
| **After** | [Chapter 4.8 — API Test Data and Environments](../part-4-api-testing-and-automation/08-api-test-data-and-environments.md) (all of Part IV) |
| **Suggested timing** | Weeks 18-19, defended in Week 19 |
| **Estimated effort** | 14 hours |
| **Deliverable** | A Playwright API test suite with clients, models, config, and a README |
| **Team size** | Individual |

---

## 1. Why this project exists

This is the first project where you are a test automation engineer rather than a programmer. Everything before it produced a program; this produces a **suite** — something that runs unattended, repeatedly, in multiple environments, and is trusted to say whether an API works.

That distinction is the whole point. A program is judged on whether it works. A suite is judged on whether you can believe it. So this project's rubric weights test *design* above correctness and reliability above code quality — a suite that passes for the wrong reason is worse than no suite, because it produces false confidence.

It is also the first project you will still be running twelve weeks later: it becomes the API half of the [capstone](../capstone/00-capstone-overview.md), it runs in your [Jenkins pipeline](../part-7-cicd/02-jenkins-pipelines.md), and its clients supply data setup for [Project 4](project-4-web-automation.md).

---

## 2. What you will build

An automated API test suite for an e-commerce API covering products, cart, orders, and authentication.

```text
$ npm run test:api -- --project=staging

Running 68 tests using 4 workers

  ✓ products › GET /products returns a paginated list (241ms)
  ✓ products › GET /products/:id returns the requested product (98ms)
  ✓ products › GET /products/:id returns 404 for an unknown id (87ms)
  ✓ cart     › POST /cart/items adds a product to an empty cart (312ms)
  ✓ cart     › POST /cart/items rejects a quantity of zero (104ms)
  ✓ orders   › POST /orders creates an order from a populated cart (498ms)
  ✓ orders   › GET /orders/:id is forbidden for a different user (121ms)
  ...

  68 passed (14.2s)
```

The target API is supplied by your instructor. If your cohort uses a public practice API instead, the requirements are unchanged — only the endpoint names differ.

---

## 3. Requirements

### 3.1 Coverage requirements

| # | Requirement |
|---|---|
| C1 | **Full CRUD** coverage of at least one resource — create, read, update, delete |
| C2 | **Positive cases**: every documented happy path for the resources in scope |
| C3 | **Negative cases**: at least 15, covering missing fields, wrong types, invalid values, and unknown IDs |
| C4 | **Boundary cases**: at least 6, on quantities, string lengths, prices, and pagination limits |
| C5 | **Authentication**: valid credentials succeed; invalid, missing, expired, and malformed tokens all fail correctly |
| C6 | **Authorization**: at least 4 tests proving one user cannot read or modify another user's data |
| C7 | **Status code correctness**: every test asserts the specific expected status, never "not 500" |
| C8 | **Response contract**: schema, required fields, and types validated, not just the fields you happen to care about |
| C9 | **End-to-end flow**: at least one test chaining several calls (authenticate → add to cart → order → verify) |
| C10 | A written **test design document** listing every case and why it exists, produced *before* the code |

Requirement C6 is the one most learners under-deliver. An API that returns another customer's order is a more serious defect than one that returns the wrong price, and it is invisible to tests that only ever use one account.

### 3.2 Technical requirements

| # | Requirement |
|---|---|
| T1 | Playwright's `request` fixture / `APIRequestContext` — no third-party HTTP client |
| T2 | **API client classes** per resource; no raw `request.post()` calls in test files ([Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md)) |
| T3 | **Typed request and response models**; responses validated at runtime, not merely cast |
| T4 | **Configuration by environment** — base URL and credentials from config/env, never hardcoded ([Chapter 4.8](../part-4-api-testing-and-automation/08-api-test-data-and-environments.md)) |
| T5 | **No secrets in the repository**; `.env` git-ignored; an `.env.example` documents required variables |
| T6 | **Test independence** — every test creates the data it needs and cleans up after itself |
| T7 | Suite passes with `--fully-parallel` and with `--workers=4` |
| T8 | Suite passes when run in a **random order** and when any single test is run alone |
| T9 | **Unique test data** per run; no test depends on a record another test created |
| T10 | Failure messages identify the resource, the field, and the difference — diagnosable without a rerun |
| T11 | Authentication token obtained once per worker where possible, not per test |
| T12 | TypeScript `strict`; zero compile errors; no unjustified `any` |

### 3.3 Structure

Something close to this. Deviations are fine if the README defends them.

```text
api-suite/
├── src/
│   ├── clients/          ProductClient, CartClient, OrderClient, AuthClient
│   ├── models/           request/response interfaces + runtime validators
│   ├── config/           environment configuration, loaded and validated once
│   ├── data/             builders/factories for unique test data
│   └── support/          shared helpers, custom expect messages
├── tests/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── auth/
│   └── flows/            multi-step end-to-end flows
├── docs/
│   └── test-design.md    the C10 design document
├── .env.example
├── playwright.config.ts
└── README.md
```

The rule that keeps this honest: **a test file contains intent, a client contains HTTP.** If a reader of `tests/cart/add-item.spec.ts` sees a header being assembled, the layering has leaked.

---

## 4. Suggested approach

1. **Explore the API by hand first.** Read the docs, make calls, record real responses. You cannot design tests for behavior you have not observed.
2. **Write `docs/test-design.md` before any code.** List each case, its category (positive/negative/boundary/authorization), and the defect it would catch. Get it reviewed.
3. **Build the config layer first**, and make it fail loudly at startup if a required variable is missing. A suite that runs with an undefined base URL wastes an afternoon.
4. **Write one test end to end with raw calls**, then extract the client. Feel the duplication before you remove it — this is the "earned abstraction" habit from [Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md).
5. **Add resources one at a time**, each with positive, negative, and boundary cases before moving on. Breadth-first coverage produces a suite with no depth anywhere.
6. **Prove independence early and often.** Run the suite in reverse order, then run each spec alone. Fix ordering dependencies the day they appear, not the week before submission.
7. **Verify every test can fail.** Break the expected value; confirm the failure message tells you what went wrong. A test never seen red is unverified.
8. **Run it three times consecutively** and record the results in the README. That is the reliability evidence graders look for first.

---

## 5. Acceptance criteria

- [ ] `docs/test-design.md` exists, predates the code, and covers every implemented case
- [ ] All coverage requirements C1-C9 met, with counts stated in the README
- [ ] Suite runs green three consecutive times with no code changes between runs
- [ ] Suite runs green with `--workers=4` and `--fully-parallel`
- [ ] Suite runs green in reversed order
- [ ] Every spec file passes when run in isolation
- [ ] Every created record is cleaned up; a second run does not accumulate data
- [ ] No raw `request.<method>` call in any file under `tests/`
- [ ] No hardcoded base URL, username, password, or token anywhere in the repository
- [ ] `.env` is git-ignored; `.env.example` lists every required variable
- [ ] Switching environments requires only a config/env change, not a code change
- [ ] Every test asserts a specific status code
- [ ] At least one test validates the full response contract, not selected fields
- [ ] Deliberately breaking any assertion produces a message that names the resource and field
- [ ] `npx tsc --noEmit` clean under `strict`
- [ ] README documents setup, how to run per environment, coverage summary, and the three-run evidence

---

## 6. Grading rubric

Graded against the [universal rubric dimensions](../00-course-overview/04-assessment-strategy.md#3-universal-rubric-dimensions), weighted for this project:

| Dimension | Weight | What earns full marks |
|---|---|---|
| **Test design** | 25% | Design document precedes code; positive, negative, boundary, and authorization coverage is deliberate and justified; each case names the defect it catches |
| **Correctness** | 20% | Tests assert the right things; specific status codes; contract validated; a broken API would actually turn the suite red |
| **Architecture** | 20% | Clients per resource; typed and validated models; environment config; data builders; no HTTP in test files |
| **Reliability** | 15% | Three clean consecutive runs; parallel-safe; order-independent; isolated; unique data; cleanup complete |
| **Code quality** | 10% | Readable specs stating intent; no duplication; consistent naming; strict types |
| **Diagnosability** | 10% | Failure messages usable without rerunning; report readable by someone who did not write the suite |

**Passing threshold:** 70%. Below that, resubmission is expected — see [Assessment Strategy §1](../00-course-overview/04-assessment-strategy.md#passing-thresholds).

### Automatic deductions

| Issue | Deduction |
|---|---|
| Any credential or token committed to the repository | −25% |
| Suite fails on a second consecutive run (data not cleaned up) | −20% |
| Tests depend on execution order | −20% |
| Hardcoded base URL | −15% |
| Raw HTTP calls in test files | −15% |
| No test design document, or written after the code | −15% |
| Assertions like `expect(status).not.toBe(500)` | −10% per occurrence, capped at −20% |
| No authorization tests | −10% |
| `waitForTimeout` or arbitrary sleeps anywhere | −10% |
| A test that cannot fail (verified by mutating the expectation) | −10% each |

The first line is not negotiable and is not curved. Committed secrets are a professional incident, not a style issue.

---

## 7. Bonus challenges

Capped at +5% total.

| Bonus | Description |
|---|---|
| **Contract test from a spec** | Validate responses against the API's OpenAPI/Swagger schema rather than handwritten validators |
| **Data-driven negative cases** | Drive the negative-input matrix from a table so adding a case is a data change, not a code change |
| **Performance guardrail** | Assert response times against a documented threshold, with a defensible choice of threshold and a note on why this is fragile |
| **Idempotency checks** | Prove that repeating a create or delete behaves as the API documents |
| **Concurrency test** | Two simultaneous operations on the same cart; assert the API's documented behavior |
| **Pagination exhaustion** | Walk every page and verify no duplicates or omissions across the boundary |
| **Bug report** | Find a genuine defect in the API and file a reproducible report: request, response, expected, severity |

The bug report is the one to aim for. Finding a real defect is the clearest evidence that your suite tests behavior rather than restating the implementation.

---

## 8. What graders will ask you

- "Pick a test. What defect would it catch, and would it catch it for the right reason?"
- "Show me this test failing. Now read me the failure message — could you diagnose it from CI alone?"
- "How do I point this suite at production? Show me every file I would touch."
- "Two of these tests create a cart. If they run at the same instant on the same account, what happens?"
- "Delete your cleanup logic and run the suite twice. What breaks, and why is that a design problem rather than a bug?"
- "Which of your abstractions did you write before you needed it?"
- "Where do you validate the response contract, and what happens if the API adds a field? Should that fail?"

That last question separates learners who understand contracts from those who copied a validator: an added field usually should *not* fail the suite, and being able to say why demonstrates real understanding.

---

## 9. AI policy for this project

The **guided** stage of the [AI policy](../00-course-overview/05-ai-policy.md#5-guidance-by-course-stage).

**Allowed:** explanation, review, refactor suggestions on code you wrote, help interpreting Playwright errors and API docs.
**Not allowed:** generated test cases, generated clients, generated test design document.

The design document in particular must be yours. Deciding what to test is the skill this project assesses; outsourcing it means submitting nothing.

An [AI usage log](../00-course-overview/05-ai-policy.md#ai-usage-log-format) is **required** for this project, even if empty. You will defend this suite verbally.

---

## 10. Where this leads

| This project's artifact | Reused in |
|---|---|
| API clients | Data setup for [Project 4](project-4-web-automation.md) and the [capstone](../capstone/00-capstone-overview.md) |
| Typed models and validators | Capstone shared model layer |
| Environment configuration | Extended in [Chapter 6.5](../part-6-framework-engineering/05-configuration.md) |
| Data builders | Generalized in [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md) |
| Authentication client | The API side of [Chapter 6.3](../part-6-framework-engineering/03-authentication-strategies.md) |
| The suite itself | The first suite in your [Jenkins pipeline](../part-7-cicd/02-jenkins-pipelines.md) |

**Gate:** this project is the checkpoint for Part IV. A suite that is not order-independent and parallel-safe will collapse under the parallelism of [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md); fix it here, not there.

---

[← Project 2 — Mini Test Case Management App](project-2-test-case-management.md) · [Next: Project 4 — E-Commerce Web Automation →](project-4-web-automation.md)
