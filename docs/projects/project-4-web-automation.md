# Project 4 — E-Commerce Web Automation

🟡 **Intermediate** · [Table of Contents](../README.md) · **Weight:** 20% of the final grade

| | |
|---|---|
| **After** | [Chapter 5.5 — Synchronization and Flaky Tests](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md) and [Chapter 6.1 — Page Object Model](../part-6-framework-engineering/01-page-object-model.md) |
| **Suggested timing** | Weeks 23-24, defended in Week 24 |
| **Estimated effort** | 16 hours |
| **Deliverable** | A Playwright UI suite with Page Objects, traces on failure, and a README |
| **Team size** | Individual |

---

## 1. Why this project exists

This is the project where reliability stops being advice and becomes the grade. It is the largest single-weight assignment before the capstone, and the top rubric line is not correctness — it is whether the suite passes three consecutive times without a single hard wait.

That ordering reflects the industry reality from [Chapter 5.5](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md): teams abandon UI automation because of flakiness far more often than because of missing coverage. A suite of eight rock-solid tests is worth more than thirty that fail one run in four, because the second suite trains everyone to ignore red.

You are also automating a real browser flow for the first time with the discipline to do it properly: locators that survive a redesign, assertions that wait, and Page Objects that hide structure without hiding intent.

---

## 2. What you will build

An automated UI suite covering the core purchase journey of an e-commerce web application: browse, search, product detail, cart, checkout, and order confirmation.

```text
$ npx playwright test --project=chromium

Running 24 tests using 4 workers

  ✓ search      › searching for a known product shows matching results (1.4s)
  ✓ search      › searching for a nonsense term shows the empty state (0.9s)
  ✓ cart        › adding a product from the listing updates the cart badge (1.8s)
  ✓ cart        › increasing quantity recalculates the line and cart totals (2.1s)
  ✓ cart        › removing the last item shows the empty cart state (1.5s)
  ✓ checkout    › a valid order completes and shows a confirmation number (4.2s)
  ✓ checkout    › submitting an incomplete address shows field-level errors (1.6s)
  ✓ checkout    › a declined card keeps the cart intact and shows the decline (2.4s)
  ...

  24 passed (31.7s)
```

The target application is supplied by your instructor.

---

## 3. Requirements

### 3.1 Coverage requirements

| # | Requirement |
|---|---|
| C1 | **End-to-end purchase flow**: login → browse → add to cart → checkout → confirmation, asserted at every meaningful step |
| C2 | **Authentication**: valid login succeeds; invalid credentials show the expected error and do not log in |
| C3 | **Search**: a match, a no-match empty state, and a case- or whitespace-variant |
| C4 | **Cart mutation**: add, change quantity, remove, and empty-cart state, with totals verified after each |
| C5 | **Form validation**: at least 4 tests on checkout field validation, each asserting the specific message and that submission was blocked |
| C6 | **Negative payment path**: a declined or rejected payment, asserting the user is told and the cart is preserved |
| C7 | **Cross-browser**: the suite runs on Chromium and one other browser engine ([Chapter 6.6](../part-6-framework-engineering/06-cross-browser-and-mobile.md)) |
| C8 | At least **20 tests** total, every one of which you can justify |
| C9 | A written **test design document** listing each case, the user risk it covers, and the layer it belongs in |
| C10 | A **layer justification**: for at least 3 of your UI tests, state why they are not API tests instead |

Requirement C10 exists because the most common failure in UI suites is testing at the wrong layer. Validating twelve field-validation rules through a browser when the API rejects them all in 40ms is a design error, not thoroughness — see the [test pyramid](../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md).

### 3.2 Technical requirements

| # | Requirement |
|---|---|
| T1 | **No `waitForTimeout`**, `sleep`, or arbitrary delay anywhere. Zero tolerance. |
| T2 | **No manual retry loops** or polling you wrote yourself; use web-first assertions |
| T3 | **Locator preference order** respected: role/label/text → test id → CSS. No XPath, no CSS chains through layout containers ([Chapter 5.2](../part-5-web-automation-playwright/02-locator-strategy.md)) |
| T4 | **Web-first assertions** (`await expect(locator)...`) as the synchronization mechanism ([Chapter 5.4](../part-5-web-automation-playwright/04-web-assertions.md)) |
| T5 | **Page Objects** for every page in scope; each exposes intent, not structure ([Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md)) |
| T6 | **No locators in test files**; no assertions inside Page Objects |
| T7 | **Login via API or storage state**, not through the UI, for tests whose subject is not login ([Chapter 6.3](../part-6-framework-engineering/03-authentication-strategies.md)) |
| T8 | **Test data created via the Project 3 API clients** where the application allows it |
| T9 | **Test independence**: each test sets up its own state; passes alone and in any order |
| T10 | Suite passes with `--fully-parallel` and `--workers=4` |
| T11 | **Trace, screenshot, and video on failure** configured; artifacts retained ([Chapter 6.8](../part-6-framework-engineering/08-debugging-playwright-tests.md)) |
| T12 | Base URL and credentials from configuration; no secrets in the repository |
| T13 | TypeScript `strict`; zero compile errors; no unjustified `any` |

Requirement T7 is worth internalizing beyond this project: logging in through the UI 24 times costs minutes per run and makes every test depend on the login page. One test should exercise the login form. The rest should already be logged in.

### 3.3 Structure

```text
web-suite/
├── src/
│   ├── pages/            LoginPage, ProductListPage, ProductDetailPage, CartPage, CheckoutPage, ConfirmationPage
│   ├── components/       Header, CartBadge, ProductCard — shared UI regions
│   ├── clients/          reused from Project 3, for data setup
│   ├── config/           environments, credentials
│   ├── data/             builders for users, addresses, cards
│   └── fixtures/         authenticated page fixture, seeded-data fixture
├── tests/
│   ├── auth/
│   ├── search/
│   ├── cart/
│   ├── checkout/
│   └── flows/
├── docs/
│   ├── test-design.md
│   └── layer-decisions.md
├── playwright.config.ts
└── README.md
```

---

## 4. Suggested approach

1. **Walk the application manually and take notes.** Record what each page needs, what loads asynchronously, and where the accessible roles and labels are. Locator quality is decided here, not while debugging.
2. **Write the design document and layer decisions first.** Deciding what belongs in the UI suite is 20% of the grade before a line of code exists.
3. **Automate the happy path end to end, ugly, in one file.** Locators inline, no abstraction. Get it green.
4. **Now extract Page Objects** from what you actually needed. This is the earned-abstraction habit again; Page Objects designed before you have used the page are always wrong in the same way — they mirror the DOM instead of the user's intent.
5. **Add the authenticated fixture next**, and delete UI login from every test whose subject is not login. Notice how much time the suite recovers.
6. **Then add negative and validation tests**, which are fast once the Page Objects exist.
7. **Hunt your own flakiness deliberately**: run the suite 5 times, run with `--repeat-each=3`, run on a throttled network. Every failure is a synchronization defect in your test, not bad luck. Fix the cause, never add a wait.
8. **Read a trace for a test that passed.** Understanding traces before you need them is much cheaper than learning during a CI failure.
9. **Record your three consecutive clean runs** in the README, with timings.

---

## 5. Acceptance criteria

- [ ] `docs/test-design.md` and `docs/layer-decisions.md` exist and predate the code
- [ ] Coverage requirements C1-C8 met; counts stated in the README
- [ ] `grep -r "waitForTimeout" .` returns nothing outside documentation
- [ ] No XPath and no CSS selector that traverses layout containers
- [ ] No locator strings in any file under `tests/`
- [ ] No `expect` inside any Page Object
- [ ] Only login-focused tests authenticate through the UI
- [ ] Suite runs green three consecutive times, unchanged, recorded in the README
- [ ] Suite runs green with `--workers=4` and `--fully-parallel`
- [ ] Suite runs green with `--repeat-each=3`
- [ ] Every spec passes when run alone
- [ ] Suite runs green on a second browser engine
- [ ] Trace, screenshot, and video produced on failure — demonstrate with a deliberate failure
- [ ] Deliberately breaking one assertion yields a failure message that identifies what was expected and what appeared
- [ ] No credentials in the repository; `.env.example` documents required variables
- [ ] `npx tsc --noEmit` clean under `strict`
- [ ] README documents setup, run commands, coverage, the three-run evidence, and known limitations

---

## 6. Grading rubric

Graded against the [universal rubric dimensions](../00-course-overview/04-assessment-strategy.md#3-universal-rubric-dimensions), weighted for this project:

| Dimension | Weight | What earns full marks |
|---|---|---|
| **Reliability** | 25% | Zero hard waits; three clean consecutive runs; clean under `--repeat-each=3` and 4 workers; order-independent; isolated setup and cleanup |
| **Correctness** | 20% | The purchase flow is genuinely automated end to end; assertions verify user-visible outcomes; a broken application would turn the suite red |
| **Locator quality** | 20% | Role, label, and text locators preferred; test ids where justified; no brittle CSS chains; locators would survive a restyle |
| **Architecture** | 15% | Page Objects expose intent; components shared; fixtures for auth and data; API used for setup; clear separation between test and page layers |
| **Diagnosability** | 10% | Traces, screenshots, and video on failure; failure messages readable by someone who did not write the test |
| **Code quality** | 10% | Specs read as behavior descriptions; no duplication; consistent naming; strict types |

**Passing threshold:** 70%. Below that, resubmission is expected — see [Assessment Strategy §1](../00-course-overview/04-assessment-strategy.md#passing-thresholds).

### Automatic deductions

| Issue | Deduction |
|---|---|
| Any `waitForTimeout` or arbitrary sleep | −25%, no exceptions |
| Suite fails on a second consecutive run | −20% |
| Tests depend on execution order | −20% |
| Any credential committed to the repository | −20% |
| Manual retry loop instead of a web-first assertion | −15% |
| XPath or CSS chains through layout containers | −15% |
| Locators in test files | −15% |
| Assertions inside Page Objects | −10% |
| UI login in tests whose subject is not login | −10% |
| No trace or screenshot on failure | −10% |
| Design document missing or written after the code | −10% |
| A test that cannot fail | −10% each |

The `waitForTimeout` penalty is deliberately severe and cannot be argued down. Every use is a synchronization defect hidden rather than fixed, and a suite full of them is the exact artifact this course exists to prevent you producing.

---

## 7. Bonus challenges

Capped at +5% total.

| Bonus | Description |
|---|---|
| **Visual regression** | Screenshot comparison on two stable pages, with a written note on what makes this fragile and how you mitigated it |
| **Accessibility scan** | Integrate an a11y check on three pages and report genuine findings |
| **Mobile viewport** | Run the flow on a mobile device profile and handle the layout differences honestly ([Chapter 6.6](../part-6-framework-engineering/06-cross-browser-and-mobile.md)) |
| **Network interception** | Force an API error response and assert the UI degrades as designed — a case unreachable through the UI alone |
| **Custom fixture library** | Fixtures composing seeded data, authenticated session, and a populated cart, each independently usable |
| **Flake register** | Instrument the suite to log retries and produce a report of the least stable tests ([Chapter 6.9](../part-6-framework-engineering/09-diagnosing-flaky-tests.md)) |
| **Custom expect matcher** | A domain matcher such as `expect(cartPage).toHaveTotal(...)` with a genuinely better failure message |

Network interception is the highest-value one: simulating a backend failure tests error handling that is otherwise almost impossible to reach, and it is a technique most working engineers never learn.

---

## 8. What graders will ask you

- "Show me the slowest test. Why is it slow, and is the slowness necessary?"
- "This locator — what redesign would break it, and what would that redesign have to change?"
- "You have no `waitForTimeout`. Which assertion is doing the waiting on this line, and how long will it wait?"
- "Run this spec alone. Now run the whole suite in reverse. Explain any difference."
- "Break the application's cart total by one cent. Which tests fail, and would the failure message tell an on-call engineer what happened?"
- "Three of these are UI tests. Convince me they should not be API tests."
- "Open the trace for this failure and diagnose it in front of me."
- "Your `CheckoutPage` has 14 methods. Which of them exist because the page needs them, and which because a test needed them?"

The trace-reading question is where preparation shows. Learners who have used the trace viewer during development narrate it fluently; learners who configured it because the rubric asked flounder, and the difference is visible within seconds.

---

## 9. AI policy for this project

The **guided** stage of the [AI policy](../00-course-overview/05-ai-policy.md#5-guidance-by-course-stage).

**Allowed:** explanation, error interpretation, review of code you wrote, refactoring suggestions, help reading traces.
**Not allowed:** generated locators, generated Page Objects, generated test cases, generated design documents.

Generated locators are singled out because they are the most common and most damaging shortcut: AI reliably produces plausible CSS chains that pass today and break on the next release, and accepting them skips the exact judgment [Chapter 5.2](../part-5-web-automation-playwright/02-locator-strategy.md) teaches.

An [AI usage log](../00-course-overview/05-ai-policy.md#ai-usage-log-format) is **required**. This project is defended verbally, with the trace viewer open.

---

## 10. Where this leads

| This project's artifact | Reused in |
|---|---|
| Page Objects and components | The web half of the [capstone](../capstone/00-capstone-overview.md) |
| Authenticated fixture | Extended in [Chapter 6.2](../part-6-framework-engineering/02-fixtures.md) and [6.3](../part-6-framework-engineering/03-authentication-strategies.md) |
| API-backed data setup | [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md) |
| Cross-browser configuration | [Chapter 6.6](../part-6-framework-engineering/06-cross-browser-and-mobile.md) and the CI matrix in [Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md) |
| The suite | Containerized in [Chapter 7.3](../part-7-cicd/03-docker-for-test-automation.md); reviewed in [Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) |

**Gate:** this is the checkpoint for Parts V and VI. Flakiness carried past this point compounds: it becomes intermittent CI failures in Part VII and an unpassable capstone. Fix it here.

---

[← Project 3 — E-Commerce API Automation Suite](project-3-api-automation.md) · [Next: Capstone Overview →](../capstone/00-capstone-overview.md)
