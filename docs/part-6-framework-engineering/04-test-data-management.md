# Chapter 6.4 — Test Data Management

🔴 **Advanced** · [Part VI Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VI — Framework Engineering |
| **Estimated time** | 1 session (90 min) + 6 hours independent work |
| **Prerequisite chapters** | [6.2](02-fixtures.md), [6.3](03-authentication-strategies.md) |
| **Next chapter** | [6.5 Configuration and Environments](05-configuration.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Choose** between static reference data, dynamically created data, and seeded shared data for a given need.
2. **Build** data factories producing valid, unique, overridable entities with typed signatures.
3. **Create** test data through API clients rather than through the user interface, and **explain** why.
4. **Implement** cleanup that always runs, tolerates already-deleted resources, and never fails a test.
5. **Guarantee** uniqueness so that concurrent runs cannot collide.
6. **Preserve** reproducibility when using generated data, by logging and seeding.
7. **Explain** the trade-offs of seeding shared data, and **defend** a chosen strategy.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Fixtures with teardown | [Chapter 6.2](02-fixtures.md) |
| API clients and services | [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md) |
| First factories and environment config | [Chapter 4.8](../part-4-api-testing-and-automation/08-api-test-data-and-environments.md) |
| Determinism and isolation | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |
| Default and optional parameters; `Partial` | [Chapters 2.7](../part-2-programming-fundamentals/07-functions.md), [2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md) |

---

## C. Concept Explanation

Test data is where suites quietly die. Not dramatically — a suite with bad data management works fine for two months, then starts failing on Tuesdays, then needs a manual database reset before every run, then gets rerun-until-green, then gets ignored. Every step of that decline traces back to tests that did not own their data.

The rule is simple to state and requires discipline to keep: **a test creates the data it needs, identifies it uniquely, and removes it afterwards.** Creation happens through your API clients, not the UI, because clicking through registration to test checkout is slow, brittle, and tests registration forty times by accident. A **factory** makes creation ergonomic: `buildUser()` returns a complete valid user with a unique email, and `buildUser({ role: "seller" })` states in one line the only thing this particular test cares about, letting the reader see the significant detail immediately. Uniqueness is what makes concurrency safe — if every test's email, product name, and order reference is distinct, two workers cannot collide, and neither can two engineers running the suite at 4 p.m.

Generated data raises a fair objection: if the values differ every run, how do you reproduce a failure? The answer is to log what was generated and support a seed, so that randomness buys independence without costing reproducibility. And the genuinely advanced judgment — the reason this chapter is 🔴 — is knowing when to break the rule. Some setup is expensive: a merchant account that takes two minutes to provision, an endpoint with a strict rate limit, a data set of ten thousand products. Seeding shared data is legitimate in those cases, provided you can state which tests may only *read* it, and can defend that boundary in review. Cleanup completes the loop, and it has three requirements at once: it must run on failure (hence fixtures), it must tolerate a resource that is already gone, and it must never turn a passing test red.

> **Full section coming in a follow-up pass.** Planned coverage:
> - How data problems kill suites: the slow decline, step by step
> - Static, dynamic, and seeded data: a decision table
> - Factories: valid defaults, unique identifiers, `Partial` overrides, nested entities
> - Making the significant field visible: `buildUser({ role: "seller" })` as documentation
> - Creating data through API clients and services, not the UI
> - Uniqueness strategies: timestamps, counters, random suffixes, worker index, and their collision characteristics
> - Reproducibility: logging generated data, seeding randomness, and attaching data to reports
> - Cleanup in fixture teardown; tracking created IDs; best-effort deletion; idempotency
> - Cleanup that must not fail the test, and how to log instead of throw
> - Orphan detection: a script that finds and reports leftover records
> - Seeded shared data: when it is justified, read-only boundaries, and how to isolate it
> - Data that cannot be deleted (immutable orders, audit logs) and how to design around it
> - Faker-style libraries: useful, and their pitfalls for determinism
> - Sensitive data: never using real customer records in tests

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: why this chapter is the single largest determinant of whether [Chapter 6.7](07-parallel-execution-and-sharding.md) goes smoothly; how factories plus API creation collapse UI test setup from twelve clicks to one line; how an environment full of orphaned records slows queries and eventually breaks unrelated tests; why "please reset the database before running the suite" is a design failure rather than an instruction; and how data ownership is verified in the [capstone rubric](../capstone/00-capstone-overview.md) by resetting the environment and running twice.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** `buildUser()` producing a unique valid user, printed twice to show uniqueness
> 2. **Practical:** the same factory with overrides, plus a nested `buildOrder({ items: [...] })`
> 3. **QA-oriented:** a fixture that creates a product via an API client and deletes it in teardown, proven on a failing test
> 4. **Automation-oriented:** two workers running the same test concurrently with no collision, and the same test with hardcoded data colliding

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Hardcoded emails, product names, or record IDs
> - Creating test data through the UI
> - A seed script whose records are mutated by multiple tests
> - Cleanup in the test body instead of teardown
> - Cleanup that throws on an already-deleted record
> - Cleanup that fails a passing test
> - Random data with no logging, making failures unreproducible
> - Factories returning invalid entities that the API rejects for unrelated reasons
> - Relying on a nightly environment reset instead of per-test cleanup
> - Using production data, or anything resembling real customer information

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Write `buildUser` and `buildProduct` factories with unique values and override support.
> - **Medium:** Convert six tests to create their own data via API clients, with fixture teardown; prove cleanup runs after a failure.
> - **Challenge:** Make your suite pass with `--workers=4 --repeat-each=3`, then write an orphan-detection script proving the environment is as clean afterwards as before, and justify any data you chose to seed instead of create.

---

## H. Coding Assignment

> **Planned: Data layer for your framework.** Deliver `data/factories/` with factories for users, products, and orders (unique, valid, overridable, typed); fixtures that create and tear down data; no hardcoded identifiers anywhere; an orphan-detection script; and a written strategy document stating what you create per test, what you seed, and why — including what would break if you chose otherwise. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: static-versus-dynamic-versus-seeded classification, uniqueness-strategy reasoning, cleanup-reliability scenarios, predict-the-collision under parallel execution, and two reproducibility items. Answer key at [`answer-keys/part-6/04-test-data-management.answers.md`](../answer-keys/part-6/04-test-data-management.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *could two people run your entire suite at the same second, against the same environment, and both get green?*

---

[← 6.3 Authentication Strategies](03-authentication-strategies.md) · [Next: 6.5 Configuration and Environments →](05-configuration.md)
