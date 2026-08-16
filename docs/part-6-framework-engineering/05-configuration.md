# Chapter 6.5 — Configuration and Environments

🟡 **Intermediate** · [Part VI Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VI — Framework Engineering |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [6.2](02-fixtures.md), [6.4](04-test-data-management.md) |
| **Next chapter** | [6.6 Cross-Browser and Mobile Emulation](06-cross-browser-and-mobile.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Configure** `playwright.config.ts`: `baseURL`, timeouts, retries, reporters, projects, and output paths.
2. **Explain** each timeout Playwright applies and **choose** where to change one.
3. **Drive** environment selection from a single variable, with tests unaware of which environment they run against.
4. **Validate** required configuration at startup and **fail fast** with a diagnosable message.
5. **Keep** secrets out of the repository while documenting required variables.
6. **Configure** retries and reporters differently for local development and CI.
7. **Explain** the trade-offs of retries, and **implement** them as a tracked concession rather than a default.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| First configuration module and `.env` discipline | [Chapter 4.8](../part-4-api-testing-and-automation/08-api-test-data-and-environments.md) |
| Fixtures consuming configuration | [Chapter 6.2](02-fixtures.md) |
| Factories and data strategy | [Chapter 6.4](04-test-data-management.md) |
| Timeouts and synchronization | [Chapter 5.5](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md) |
| Types and validation | [Chapter 2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md) |

---

## C. Concept Explanation

Configuration is what makes a suite portable, and portability is what makes it a team asset rather than a personal script. The test of a well-configured framework is blunt: a colleague clones the repository, sets two environment variables, runs one command, and gets a green run against their own environment — with no edits to any test file.

`playwright.config.ts` is the center of this. It holds the `baseURL` (so tests navigate to `/cart` rather than a full URL), the timeout hierarchy, retry policy, reporters, output locations, and **projects** — named configurations that can differ in browser, viewport, or setup, which becomes the mechanism for cross-browser runs in [Chapter 6.6](06-cross-browser-and-mobile.md). Around it sits your own configuration module, resolving environment variables into a typed object, applying defaults, and validating that required values are present. Validation matters more than it sounds: a missing `API_TOKEN` should fail immediately with "API_TOKEN is required but not set", not thirty seconds later as a 401 inside an unrelated test.

The rule that keeps this clean is that **tests must not know which environment they are on.** As soon as `if (env === "staging")` appears inside a test, you have two divergent suites sharing a folder, and the staging path will rot because nobody runs it locally. Differences belong in configuration — different base URLs, different feature-flag values supplied as data, different projects.

Timeouts and retries deserve deliberate treatment because both are commonly used as flakiness anaesthetics. Raising a timeout to make an assertion pass hides the fact that the application got slower, which may be the actual bug. Retries in CI are a defensible concession — infrastructure genuinely is less reliable than your laptop — but only when every retried test is recorded and investigated. A suite with retries and no register is a suite that has stopped reporting real race conditions.

> **Full section coming in a follow-up pass.** Planned coverage:
> - `playwright.config.ts` tour: every option that matters for this course
> - `baseURL` and relative navigation
> - The timeout hierarchy: global, test, action, navigation, assertion — and which to change when
> - Projects: what they are, and their uses beyond browsers (setup projects, tagged suites)
> - `testDir`, `testMatch`, `outputDir`, and organizing spec discovery
> - Reporters: `list`, `html`, `json`, `junit`, `blob`, and choosing per environment
> - `forbidOnly`, `fullyParallel`, `workers`, and CI-specific defaults
> - A typed configuration module: resolution order, defaults, fail-fast validation
> - `.env`, `.env.example`, and `process.env` boundaries
> - Secrets: never committed; CI credential stores; rotating a leaked value
> - Feature flags and environment differences supplied as data, not branches
> - Retries: the honest argument for and against, plus the flake register
> - `webServer` for starting the app under test locally
> - Global setup and teardown, and their legitimate uses

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: why configuration quality is the difference between a suite one person runs and a suite a team owns; how this configuration is consumed by the Jenkins pipeline in [Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md) and by the Docker image in [Chapter 7.3](../part-7-cicd/03-docker-for-test-automation.md); why `.env` in a repository is treated as an incident in professional settings; how reporter choice determines what CI can publish; and how the retry register connects to the flake diagnosis discipline in [Chapter 6.9](09-diagnosing-flaky-tests.md).

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** setting `baseURL` and using relative navigation
> 2. **Practical:** a typed config module with defaults and fail-fast validation, plus its error message
> 3. **QA-oriented:** running the same suite against local and staging with one variable changed, proven by `git diff`
> 4. **Automation-oriented:** a config with CI-specific retries and reporters, projects for setup and tests, and a `webServer` block

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Hardcoded URLs and credentials in tests or page objects
> - `if (environment === "staging")` inside tests
> - Reading `process.env` in dozens of files
> - No validation, so a missing variable surfaces as a confusing test failure
> - Committing `.env`
> - Raising timeouts to mask slowness or bad synchronization
> - Retries enabled locally, hiding flakiness during development
> - Retries with no tracking, so real race conditions go unreported
> - One reporter configuration for both local and CI
> - `.only` committed, silently reducing the suite to one test

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Move all URLs to `baseURL` and confirm every test still passes.
> - **Medium:** Write a typed config module with validation; prove the failure message is clear when a required variable is absent.
> - **Challenge:** Make your suite run against three environments with one variable, with CI-specific retries and reporters, no committed secrets, and a documented `.env.example` — then justify every timeout you changed from its default.

---

## H. Coding Assignment

> **Planned: Portable framework configuration.** Deliver a `playwright.config.ts` and typed config module supporting at least two environments driven by one variable, fail-fast validation of required values, CI-versus-local reporters and retries, a committed `.env.example` with no secrets, and a README section a colleague can follow to a green run. Include a written justification of your retry policy and any non-default timeout. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: which-timeout-applies scenarios, config-versus-test-branching judgment, secrets-handling items, reporter selection, and two questions on when a retry is defensible. Answer key at [`answer-keys/part-6/05-configuration.answers.md`](../answer-keys/part-6/05-configuration.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *how many files must change to point your suite at a new environment? The answer should be zero.*

---

[← 6.4 Test Data Management](04-test-data-management.md) · [Next: 6.6 Cross-Browser and Mobile Emulation →](06-cross-browser-and-mobile.md)
