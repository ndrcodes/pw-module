# Chapter 6.3 — Authentication Strategies

🔴 **Advanced** · [Part VI Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VI — Framework Engineering |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [6.2 Fixtures](02-fixtures.md) |
| **Next chapter** | [6.4 Test Data Management](04-test-data-management.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** why logging in through the UI in every test is both slow and unnecessary.
2. **Capture** and **reuse** authentication state with `storageState`, and **explain** what it contains.
3. **Authenticate** by obtaining a token through the API and injecting it into a browser context.
4. **Implement** authentication as a fixture so tests declare the identity they need.
5. **Support** multiple roles simultaneously — customer, seller, admin — without cross-contamination.
6. **Choose** between one shared authenticated state, per-worker state, and per-test users, and **justify** it.
7. **Measure** the runtime improvement from authentication reuse and **report** it.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Fixtures, composition, teardown | [Chapter 6.2](02-fixtures.md) |
| BrowserContext isolation | [Chapter 5.1](../part-5-web-automation-playwright/01-playwright-fundamentals.md) |
| API login and token handling | [Chapter 4.6](../part-4-api-testing-and-automation/06-api-authentication-and-authorization.md) |
| Configuration and secrets discipline | [Chapter 4.8](../part-4-api-testing-and-automation/08-api-test-data-and-environments.md) |
| Cookies, localStorage, `Authorization` headers | [Chapter 4.1](../part-4-api-testing-and-automation/01-http-fundamentals.md) |

---

## C. Concept Explanation

Logging in through the user interface takes six to ten seconds: navigate, fill two fields, submit, wait for redirect, wait for the dashboard to render. Multiply by four hundred tests and you have spent close to an hour of every run proving four hundred times that login works — a thing you already proved once. Every one of those logins is also a chance to fail for reasons unrelated to the test's actual subject, which makes it a flakiness source as well as a cost.

The professional pattern is simple to state: **test the login flow once, through the UI, in a test whose subject is login. Everywhere else, arrive already authenticated.** Two mechanisms achieve that. `storageState` captures the cookies and localStorage of an authenticated session to a JSON file, and a new browser context created with that file starts logged in — no navigation, no form, effectively instant. Alternatively, obtain a token through the API (which you already know how to do from [Chapter 4.6](../part-4-api-testing-and-automation/06-api-authentication-and-authorization.md)) and inject it into the context, which is faster still and avoids driving the UI at all. Either way, the delivery mechanism is a fixture, so a test simply asks for `customerPage` or `adminPage` and gets an authenticated page.

The advanced judgment here — and the reason this chapter is marked 🔴 — is deciding *how much* state to share. One `storageState` file for the whole run is fastest and safe only if no test mutates that user; the moment two tests modify the same user's cart or profile, you have reintroduced shared mutable state, and failures will appear under parallel execution. Per-worker state is a good middle ground: each worker has its own user, so tests within a worker are serialized anyway. Per-test users are the safest and slowest. There is no universally correct answer; there is a decision you must be able to defend, which is exactly what the capstone architecture defense will ask you to do.

> **Full section coming in a follow-up pass.** Planned coverage:
> - The cost of UI login, measured across a realistic suite
> - What `storageState` contains, and how to inspect the JSON safely
> - Capturing state in a global setup project, and consuming it via config or fixture
> - API-token authentication injected into a context via `extraHTTPHeaders` or storage
> - Cookie-based sessions versus token-based auth, and what changes for each
> - Authentication as a fixture; multiple roles as multiple fixtures
> - Per-run, per-worker, and per-test state: cost, safety, and a decision rule
> - Handling token expiry within a long run
> - Multi-user tests in one spec, using two contexts
> - Keeping `storageState` files out of version control, and why they are credentials
> - Still testing the login flow properly: success, failure, lockout, and logout
> - Measuring and reporting the runtime improvement
> - How this composes with data management in [Chapter 6.4](04-test-data-management.md)

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: why "reduced suite runtime from 14 minutes to 3" is a career-relevant sentence and this chapter is where most of that reduction comes from; how role fixtures make authorization testing at the UI layer tractable; why a committed `storageState` file is a credential leak of the same severity as a committed password; how per-worker authentication interacts with worker count in [Chapter 6.7](07-parallel-execution-and-sharding.md); and how CI must regenerate state rather than reuse a stale file ([Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md)).

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** a UI login test, timed
> 2. **Practical:** capturing `storageState` once and reusing it, with the timing comparison
> 3. **QA-oriented:** an API-token fixture injecting authentication into a fresh context, plus separate `customerPage` and `adminPage` fixtures
> 4. **Automation-oriented:** a per-worker authenticated user, with a note on which tests would break under a shared-per-run strategy

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Logging in through the UI in every test
> - Committing a `storageState` file or a token
> - One shared authenticated user mutated by multiple tests
> - Reusing a stale state file after the environment was reset
> - Deleting the login tests once state reuse is in place
> - Token expiry mid-run producing failures that look random
> - Hardcoded credentials in a global setup file
> - Role fixtures that share the same underlying user
> - Injecting a token but forgetting the UI also needs a cookie (or vice versa)
> - Assuming reuse is unsafe and paying the UI login cost forever

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Capture `storageState` from a UI login and use it in one test; assert the test starts authenticated.
> - **Medium:** Replace UI login across your suite with a state-based fixture and report before/after runtimes.
> - **Challenge:** Implement `customerPage`, `sellerPage`, and `adminPage` fixtures backed by distinct users, prove a test using two roles simultaneously works, and write a one-page justification of your sharing strategy including what would break under the alternatives.

---

## H. Coding Assignment

> **Planned: Authentication reuse with measured impact.** Convert your suite to state- or token-based authentication delivered through role fixtures; keep dedicated UI tests for the login flow itself; ensure no credential or state file is committed; support at least two roles; and deliver measured before/after runtimes plus a written justification of your per-run, per-worker, or per-test decision. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: `storageState` content reasoning, choose-the-sharing-strategy scenarios, identify-the-shared-state-risk, secrets-handling judgment, and two questions on what must still be tested through the UI. Answer key at [`answer-keys/part-6/03-authentication-strategies.answers.md`](../answer-keys/part-6/03-authentication-strategies.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *how many seconds does your suite spend logging in, and can you defend that number?*

---

[← 6.2 Fixtures](02-fixtures.md) · [Next: 6.4 Test Data Management →](04-test-data-management.md)
