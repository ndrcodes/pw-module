# Chapter 6.6 — Cross-Browser and Mobile Emulation

🟡 **Intermediate** · [Part VI Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VI — Framework Engineering |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [6.5 Configuration and Environments](05-configuration.md) |
| **Next chapter** | [6.7 Parallel Execution and Sharding](07-parallel-execution-and-sharding.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Configure** Playwright projects for Chromium, Firefox, WebKit, branded Chrome or Edge, and mobile emulation.
2. **Explain** what each engine actually tests, and what branded-channel testing adds.
3. **Decide** which subset of tests runs on which engines, using a cost-benefit argument.
4. **Emulate** mobile devices — viewport, touch, user agent, geolocation, locale, timezone — and **state** the limits of emulation.
5. **Classify** an engine-only failure as a genuine browser difference or as your own timing or locator assumption.
6. **Compute** the runtime and infrastructure cost of a cross-browser strategy and **recommend** one.
7. **Handle** legitimate engine differences without duplicating tests.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Projects, config, and environment selection | [Chapter 6.5](05-configuration.md) |
| Fixtures and page objects | [Chapters 6.1](01-page-object-model.md), [6.2](02-fixtures.md) |
| Synchronization and flake categories | [Chapter 5.5](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md) |
| Locator resilience | [Chapter 5.2](../part-5-web-automation-playwright/02-locator-strategy.md) |
| Test pyramid economics | [Chapter 1.3](../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md) |

---

## C. Concept Explanation

Playwright bundles three rendering engines — Chromium, Firefox, and WebKit — and can drive branded Chrome and Edge as well. Running your suite on all of them is a single configuration change, which makes it tempting to simply switch everything on. That temptation is worth resisting, because cross-browser coverage is a cost decision like every other testing decision: three engines means roughly three times the runtime, three times the CI minutes, and three times the triage when something goes red.

The professional pattern mirrors the pyramid argument from [Chapter 1.3](../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md): run the **full suite** on one engine, and the **critical paths** on the others. That gives you early warning of genuine engine differences without paying for redundant coverage of behavior that is engine-independent. Business logic does not render differently in WebKit; layout, date and number formatting, focus behavior, and CSS support sometimes do.

The most valuable skill in this chapter is diagnostic rather than configurational. When a test fails only on WebKit, the overwhelmingly likely cause is *your* test — a timing assumption that happened to hold on Chromium, or a locator that depended on how one engine reports an accessible name. Genuine engine bugs exist and are rarer than learners assume. The discipline is to fix the synchronization first, re-evaluate, and only then classify it as a browser difference with evidence. Learners who skip that step spend a week convinced WebKit is broken.

Mobile emulation deserves an honest framing. Playwright can emulate viewport, device pixel ratio, touch events, user agent, geolocation, locale, and timezone, and that catches a real class of responsive-layout and touch-interaction defects cheaply. It is not a real device: it does not reproduce actual mobile browser engines on iOS, real network conditions, real hardware performance, or native app behavior. Knowing exactly where that line sits — and saying so when someone claims the suite "covers mobile" — is part of being trusted.

> **Full section coming in a follow-up pass.** Planned coverage:
> - The three engines: what each is, and which real browsers they correspond to
> - Branded channels: Chrome and Edge, and what they add over Chromium
> - Configuring projects per browser, with shared and per-project settings
> - Choosing the subset: full suite on one engine, critical paths elsewhere
> - Cost arithmetic: engine-minutes per run, per week, per year
> - Device descriptors and mobile emulation: viewport, touch, user agent, scale factor
> - Emulating locale, timezone, geolocation, permissions, color scheme, and reduced motion
> - What emulation does not cover, stated plainly
> - Responsive testing: breakpoints worth covering and how to pick them
> - Engine-only failures: the diagnostic method, with a worked example
> - Legitimate engine differences and how to handle them without duplicating tests
> - Conditional skips (`test.skip` on a project) and when they are honest versus lazy
> - Tagging tests for cross-browser inclusion
> - Reporting engine coverage so stakeholders know what was actually verified

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: how to answer "does it work on Safari?" precisely, including what your suite does and does not prove; how cross-browser projects multiply CI cost and therefore interact with pipeline design in [Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md); why mobile emulation findings are still valuable despite their limits; how engine-only failures often reveal genuine accessibility or standards issues worth filing; and why overclaiming mobile coverage damages a QA team's credibility faster than almost anything else.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** projects for Chromium, Firefox, and WebKit, run from the CLI
> 2. **Practical:** a mobile project using a device descriptor, with a touch interaction
> 3. **QA-oriented:** a tagged critical-path subset configured to run on all engines while the full suite runs on one
> 4. **Automation-oriented:** a WebKit-only failure diagnosed as a synchronization assumption, fixed, and re-verified — next to a genuine engine difference handled without duplicating the test

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Running the entire suite on every engine by default
> - Assuming every WebKit failure is a WebKit bug
> - Duplicating tests per browser instead of using projects
> - Skipping tests on an engine to get green, without a stated reason
> - Claiming mobile coverage from emulation alone
> - Emulating a device but not its touch behavior or locale
> - Hardcoding date or number formats that differ by locale
> - Ignoring branded-channel-only defects because Chromium passed
> - Locators that depend on engine-specific accessible-name computation
> - No record of which tests ran on which engine

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Configure three engine projects and run one test on each.
> - **Medium:** Add a mobile project and adapt one flow for touch and a narrow viewport, without duplicating the test.
> - **Challenge:** Given five WebKit-only failures — four caused by your own assumptions and one genuine engine difference — classify all five with evidence, fix appropriately, and write the coverage statement you would give a stakeholder.

---

## H. Coding Assignment

> **Planned: Cross-browser strategy and implementation.** Deliver projects for Chromium, Firefox, WebKit, one branded channel, and one mobile device; a tagged critical-path subset that runs everywhere while the full suite runs on one engine; a cost calculation supporting your choice; a classification report for every engine-specific failure you encountered; and an honest one-paragraph coverage statement including what your suite does not prove. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: engine-to-browser matching, choose-the-subset scenarios, emulation-limits identification, classify-the-failure items, and two cost-reasoning questions. Answer key at [`answer-keys/part-6/06-cross-browser-and-mobile.answers.md`](../answer-keys/part-6/06-cross-browser-and-mobile.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *if asked "does the checkout work on iPhone?", can you state exactly what your suite proves and what it does not?*

---

[← 6.5 Configuration and Environments](05-configuration.md) · [Next: 6.7 Parallel Execution and Sharding →](07-parallel-execution-and-sharding.md)
