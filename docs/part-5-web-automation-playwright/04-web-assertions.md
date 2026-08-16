# Chapter 5.4 — Web Assertions

🟡 **Intermediate** · [Part V Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | V — Web Automation with Playwright |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [5.2](02-locator-strategy.md), [5.3](03-browser-actions.md) |
| **Next chapter** | [5.5 Synchronization and Flaky Tests](05-synchronization-and-flaky-tests.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Assert** visibility, text, value, attribute, URL, title, element count, and element state using web-first assertions.
2. **Explain** why a web-first assertion retries, and **describe** what that makes it besides a check.
3. **Distinguish** `expect(locator).toBeVisible()` from `expect(await locator.isVisible()).toBe(true)`, and **explain** the race condition in the second.
4. **Choose** between exact and partial text matching, and **handle** whitespace and case deliberately.
5. **Write** assertions that verify user-visible outcomes rather than the action just performed.
6. **Produce** failure messages that identify the problem without a rerun.
7. **Decide** how many assertions belong in one test, and **justify** the decision.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Locators and scoping | [Chapter 5.2](02-locator-strategy.md) |
| Actions and actionability | [Chapter 5.3](03-browser-actions.md) |
| Falsifiability: "this test fails if ___" | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |
| Assertion design across ten dimensions | [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md) |
| Promises and missing-`await` symptoms | [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) |

---

## C. Concept Explanation

Playwright's **web-first assertions** do something that ordinary assertions do not: they retry. `await expect(page.getByRole("status")).toHaveText("Order confirmed")` does not sample the DOM once and fail; it polls until the text matches or the timeout expires. That single behavior is the most important idea in this chapter, because it means **an assertion is also a synchronization primitive.** You do not wait for the confirmation to appear and then check it — asserting it *is* waiting for it. Learners who internalize this stop writing hard waits, permanently, and the rest of Part V becomes much easier.

The corollary is a trap worth memorizing. `expect(await locator.isVisible()).toBe(true)` looks equivalent and is not. `isVisible()` returns a boolean about *this instant*, with no retry, so on a slow or loaded machine it samples too early and returns false. The assertion then fails with the useless message "expected true, received false", and the test looks flaky. Any time you find yourself putting `await locator.isVisible()` inside an `if`, you have almost certainly written a race condition; the fix is nearly always to assert directly instead of branching.

The second half of the chapter is about assertion *choice*. `toHaveText` matches the full normalized text; `toContainText` matches a substring — picking the wrong one produces either brittle whitespace failures or assertions so loose they cannot fail. And underneath the mechanics sits the design question from [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md): assert the *outcome a user would care about*, not the action you just performed. Filling a field and then asserting the field contains what you typed verifies Playwright, not the application. Asserting that the order now appears in the user's order history verifies the system.

> **Full section coming in a follow-up pass.** Planned coverage:
> - Web-first assertions: retry, timeout, and why they are synchronization
> - The full assertion catalogue: `toBeVisible`, `toBeHidden`, `toHaveText`, `toContainText`, `toHaveValue`, `toHaveAttribute`, `toHaveClass`, `toHaveCount`, `toBeEnabled`, `toBeDisabled`, `toBeChecked`, `toBeEditable`, `toBeFocused`, `toBeEmpty`
> - Page-level assertions: `toHaveURL`, `toHaveTitle`
> - Negative assertions with `.not`, and the trap of asserting absence too early
> - `expect(locator)` versus `expect(value)`: which retries and which does not
> - The `isVisible()`-in-an-`if` race condition, demonstrated under load
> - Exact versus partial text; whitespace normalization; `useInnerText`; regex matchers
> - Custom timeouts per assertion, and when overriding the default is legitimate
> - Soft assertions: what they are for and why they are rarely right in this course
> - Custom failure messages, and why they pay for themselves in CI
> - `expect.poll` for values that are not locators
> - How many assertions per test; verifying an outcome versus restating an action
> - Screenshot and visual comparison assertions, introduced briefly with their maintenance cost

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: how assertion choice determines whether a failure message is diagnosable in a Jenkins email ([Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md)); why the assertion-as-synchronization insight eliminates most of the flakiness categories in [Chapter 6.9](../part-6-framework-engineering/09-diagnosing-flaky-tests.md); why assertions stay in tests and never move into page objects ([Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md)); and how the "break it and prove red" requirement continues to apply to every UI assertion you write.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** assert an element is visible and has expected text
> 2. **Practical:** the `isVisible()`-in-an-`if` race condition, run repeatedly under load, then the correct version
> 3. **QA-oriented:** eight assertions on one confirmation page — text, value, attribute, count, state, URL, title
> 4. **Automation-oriented:** an assertion set that verifies the outcome (order visible in history with correct total) rather than the action

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - `expect(await locator.isVisible()).toBe(true)`
> - Boolean checks inside `if` statements instead of assertions
> - Missing `await` on an assertion, producing a test that cannot fail
> - Asserting only that the URL changed
> - Asserting the value you just typed
> - `toContainText` where exactness matters, or `toHaveText` where whitespace varies
> - Twelve unrelated assertions in one test, so failures identify nothing
> - `.not.toBeVisible()` immediately after an action, passing because the element has not rendered yet
> - Raising a timeout to make a failing assertion pass
> - Soft assertions used to keep a broken test green

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Write six assertion types against one page: visibility, text, value, attribute, count, and state.
> - **Medium:** Convert ten boolean-check-plus-`if` patterns into web-first assertions and explain what each fixed.
> - **Challenge:** For a supplied passing suite, identify the three assertions that cannot fail, prove it by breaking the application, and rewrite them with custom failure messages that name the expected behavior.

---

## H. Coding Assignment

> **Planned: Assertion suite for the purchase flow.** Write a suite that verifies the demo shop's search, product detail, cart, and confirmation pages using web-first assertions only — covering visibility, text, value, attribute, count, state, URL, and title — where every assertion verifies a user-visible outcome and each test has one clear reason to fail. Deliverables include a red run for each test, produced by breaking the application deliberately. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: choose-the-assertion scenarios, identify-the-race-condition, predict-the-output on a missing `await`, exact-versus-partial text judgment, and two "what does this assertion actually prove?" items. Answer key at [`answer-keys/part-5/04-web-assertions.answers.md`](../answer-keys/part-5/04-web-assertions.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *for each assertion you wrote, can you say what it retries on and what breakage would turn it red?*

---

[← 5.3 Browser Actions](03-browser-actions.md) · [Next: 5.5 Synchronization and Flaky Tests →](05-synchronization-and-flaky-tests.md)
