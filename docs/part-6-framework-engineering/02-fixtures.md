# Chapter 6.2 — Fixtures

🔴 **Advanced** · [Part VI Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VI — Framework Engineering |
| **Estimated time** | 1 session (90 min) + 6 hours independent work |
| **Prerequisite chapters** | [6.1 Page Object Model](01-page-object-model.md) |
| **Next chapter** | [6.3 Authentication Strategies](03-authentication-strategies.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** what a fixture is and how it differs from `beforeEach`, in terms of composition, laziness, and typing.
2. **Write** custom fixtures that provide page objects, API clients, and prepared data.
3. **Implement** teardown in a fixture, and **explain** why it runs even when a test fails.
4. **Compose** fixtures that depend on other fixtures, and **describe** the resulting dependency graph.
5. **Choose** the correct fixture scope — per test or per worker — and **justify** it.
6. **Type** a fixture set so tests get autocompletion and compile-time safety.
7. **Refactor** duplicated setup out of a suite and into fixtures with no behavior change.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Page and component objects | [Chapter 6.1](01-page-object-model.md) |
| Fixture destructuring (`{ page }`, `{ request }`) | [Chapters 4.4](../part-4-api-testing-and-automation/04-playwright-api-testing-basics.md), [5.1](../part-5-web-automation-playwright/01-playwright-fundamentals.md) |
| API clients and services | [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md) |
| Cleanup that survives failure | [Chapter 4.5](../part-4-api-testing-and-automation/05-playwright-api-write-operations.md) |
| Generics, interfaces, `Partial` | [Chapter 2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md) |
| Setup/teardown trade-offs | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |

---

## C. Concept Explanation

You have been using fixtures since [Chapter 4.4](../part-4-api-testing-and-automation/04-playwright-api-testing-basics.md) without building one. Every time you wrote `async ({ page }) => {}`, you *declared a dependency* and Playwright supplied it, freshly constructed, and cleaned it up afterwards. This chapter teaches you to define your own, which is the mechanism that turns a collection of page objects into a framework.

The critical distinction is against `beforeEach`, because on the surface they look interchangeable. A hook runs for every test in its scope whether the test needs it or not; a fixture is **lazy**, constructed only when a test actually asks for it, so a test that does not request `seededProduct` pays nothing for it. A hook communicates through shared variables that are typed loosely and can be mutated by anyone; a fixture *returns* a typed value that appears in the test's parameter list, so the test's requirements are visible in its signature and its editor autocompletes them. And fixtures **compose**: `loggedInPage` can depend on `authToken`, which depends on `apiClient`, which depends on `config`, and Playwright resolves that graph for you. Hooks cannot express that.

Teardown is the other half. Everything after the `await use(value)` line in a fixture runs when the test finishes — passing, failing, or timing out — which is exactly the guarantee that inline cleanup at the end of a test body does not give you. This is where the data ownership discipline from [Chapter 4.5](../part-4-api-testing-and-automation/05-playwright-api-write-operations.md) finally becomes structural rather than a thing you must remember. The judgment marked 🔴 here is scope and granularity: per-test fixtures are the safe default, worker-scoped fixtures avoid repeating genuinely expensive setup, and a single mega-fixture that supplies everything couples every test to every dependency and slows the fast ones. Splitting by concern is a design decision you will need to defend.

> **Full section coming in a follow-up pass.** Planned coverage:
> - Built-in fixtures recap: `page`, `context`, `browser`, `request`
> - `test.extend()`: defining a fixture, the `use` function, and the setup/teardown split
> - Laziness: proving that an unrequested fixture never runs
> - Typing a fixture set, and the autocompletion payoff
> - Composing fixtures; drawing and reasoning about the dependency graph
> - Scope: per test versus per worker, with cost and safety trade-offs
> - `auto` fixtures, and using them sparingly
> - Overriding built-in fixtures (for example, `page` with default navigation)
> - Fixtures that provide page objects
> - Fixtures that provide API clients and services
> - Fixtures that provide created data, with teardown that deletes it
> - Teardown ordering, and what happens when teardown itself throws
> - Fixtures versus hooks: a decision table, and the legitimate remaining uses of hooks
> - Splitting fixtures by concern; avoiding the mega-fixture
> - Project structure for `fixtures/`, and re-exporting a custom `test`

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: how fixtures deliver authentication ([Chapter 6.3](03-authentication-strategies.md)) and data ([Chapter 6.4](04-test-data-management.md)) as first-class framework services; why typed fixtures are the single biggest factor in whether a new team member can write a test in their first week; how the two-user setup that was painful in [Chapter 4.6](../part-4-api-testing-and-automation/06-api-authentication-and-authorization.md) collapses into two fixture requests; and why worker-scoped fixtures interact directly with parallel-safety decisions in [Chapter 6.7](07-parallel-execution-and-sharding.md).

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** a fixture providing a `LoginPage`, used in a test
> 2. **Practical:** the same setup as a `beforeEach` and as a fixture, with the laziness difference demonstrated
> 3. **QA-oriented:** a `seededProduct` fixture that creates data via an API client and deletes it in teardown, proven to clean up after a failing test
> 4. **Automation-oriented:** a composed set — `config` → `apiClient` → `authToken` → `loggedInPage` → `seededCart` — with the dependency graph annotated

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - One mega-fixture supplying everything
> - No teardown, so created data accumulates
> - Teardown that throws and fails an otherwise passing test
> - Worker-scoped fixtures holding mutable state shared across tests
> - Fixtures that assert
> - Fixtures duplicating each other instead of composing
> - Untyped fixtures, losing autocompletion and compile-time checks
> - Keeping `beforeEach` alongside fixtures for the same concern
> - Fixtures with side effects on global state
> - Overriding `page` in ways that surprise the next reader

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Write a fixture that supplies a page object, and use it in two tests.
> - **Medium:** Write a `seededProduct` fixture with teardown; prove the teardown runs after a deliberately failing test.
> - **Challenge:** Build a composed fixture set (config, API client, token, logged-in page, seeded cart) with correct scopes, then convert eight tests to it and show that a test requesting only `config` triggers none of the rest.

---

## H. Coding Assignment

> **Planned: Fixture module for your framework.** Deliver a typed `fixtures/` module providing at least `loggedInPage`, `apiClient`, and `seededProduct`, composed rather than duplicated, with teardown proven to run on failure; convert your Chapter 6.1 suite to use it with no `beforeEach` remaining for those concerns; and include the dependency graph plus a written justification of each fixture's scope. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: fixture-versus-hook judgment, predict-what-runs (laziness), teardown-on-failure reasoning, scope selection scenarios, and two dependency-composition items. Answer key at [`answer-keys/part-6/02-fixtures.answers.md`](../answer-keys/part-6/02-fixtures.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *can a test declare everything it needs in its parameter list, and does the environment end up clean even when that test fails?*

---

[← 6.1 Page Object Model](01-page-object-model.md) · [Next: 6.3 Authentication Strategies →](03-authentication-strategies.md)
