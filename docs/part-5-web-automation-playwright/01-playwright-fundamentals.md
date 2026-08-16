# Chapter 5.1 — Playwright Fundamentals

🟡 **Intermediate** · [Part V Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | V — Web Automation with Playwright |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [Part IV](../part-4-api-testing-and-automation/00-module-overview.md) complete |
| **Next chapter** | [5.2 Locator Strategy](02-locator-strategy.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** the relationship between Browser, BrowserContext, and Page, and **describe** what each provides.
2. **Justify** context isolation as the mechanism that makes tests independent and parallelizable.
3. **Write** a browser test that navigates, locates an element, acts on it, and asserts an outcome.
4. **Distinguish** a Locator from an element handle, and **explain** why locators are lazy and re-resolved.
5. **Run** tests headed, headless, and against a chosen project, and **read** the resulting report.
6. **Use** codegen as a discovery tool and **explain** why its output is not shippable.
7. **Describe** how enough HTML and DOM structure works to reason about what you are automating.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| **`async`/`await`, missing-`await` symptoms** | [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) |
| Playwright project setup, `expect`, running tests | [Chapter 4.4](../part-4-api-testing-and-automation/04-playwright-api-testing-basics.md) |
| Fixture destructuring (`{ request }`, now `{ page }`) | [Chapter 4.4](../part-4-api-testing-and-automation/04-playwright-api-testing-basics.md) |
| API-based data creation and authentication | [Chapters 4.5-4.6](../part-4-api-testing-and-automation/00-module-overview.md) |
| Independence, isolation, determinism, AAA | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |

No HTML, CSS, or DOM knowledge is assumed. This chapter teaches what you need.

---

## C. Concept Explanation

Playwright gives you three objects, arranged in a hierarchy, and understanding them explains most of its behavior. A **Browser** is a running browser process — expensive to start, so Playwright starts one and reuses it. A **BrowserContext** is an isolated profile inside that browser: its own cookies, its own storage, its own session, roughly equivalent to a fresh incognito window. A **Page** is a single tab within a context. Playwright's test runner gives each test a brand-new context, which is why the `page` fixture arrives with no cookies, no login, and no leftover state from any other test. That is not a convenience — it is the mechanism that makes the independence and isolation properties from [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) true by default, and it is what makes parallel execution safe on the browser side. It is also how you will test two users simultaneously later: two contexts, two logged-in sessions, one browser.

The second foundational idea is the **Locator**. A locator is not an element; it is a *description* of how to find one, evaluated at the moment you use it. `page.getByRole("button", { name: "Add to cart" })` creates nothing and touches nothing until you act on it, and when you do, Playwright re-resolves it against the current DOM and waits until it is actually actionable — attached, visible, stable, enabled. This laziness is why Playwright code needs so few explicit waits, and why a locator stored in a page object stays valid even after the page re-renders. It also explains a failure mode you will meet in the next chapter: if your description matches two elements, Playwright refuses to guess and raises a strict-mode error, which is a feature protecting you from a test that would otherwise pass against the wrong element.

> **Full section coming in a follow-up pass.** Planned coverage:
> - Installing browsers; what `npx playwright install` actually downloads
> - Browser, BrowserContext, Page: the hierarchy with a diagram
> - Context isolation, and what a fresh context guarantees
> - Two contexts, two users, one browser
> - The `page` fixture, and what the runner does before and after each test
> - Navigation: `goto`, `baseURL`, back and forward, reload, and what `goto` waits for
> - Locators: lazy description, re-resolution, and auto-waiting on action
> - Locator versus element handle, and why this book uses locators exclusively
> - Just enough HTML and DOM: elements, attributes, text content, nesting, accessible names
> - A first complete test: navigate, act, assert
> - Headed versus headless; `--ui` mode; `--debug`
> - Running a subset: `--grep`, file paths, and the VS Code extension
> - Codegen: what it is good for, and why recordings are not production tests
> - Screenshots, video, and trace settings, introduced at a config level

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: why the pyramid from [Chapter 1.3](../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md) means this suite should stay deliberately small; how context isolation lets you inject authentication state instead of logging in ([Chapter 6.3](../part-6-framework-engineering/03-authentication-strategies.md)); how API clients from [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md) seed the state a UI test needs so the test can start where the interesting behavior begins; and why the first browser test is slower to write and much slower to run than any API test you have written.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** navigate to a page and assert its title
> 2. **Practical:** locate a field, fill it, click a button, assert the resulting text
> 3. **QA-oriented:** a login test that asserts a user-visible outcome rather than a URL change
> 4. **Automation-oriented:** two contexts acting as two users against the same product, demonstrating isolation

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Missing `await` on an action or assertion
> - Logging out at the end of a test, as if state carried over
> - Storing an element handle and reusing it after a re-render
> - Asserting only that the URL changed
> - Shipping codegen output unchanged
> - Hardcoding a full URL instead of using `baseURL`
> - Adding a wait before every action out of habit
> - Trying to reuse one `page` across tests to "save time"
> - Treating a browser test as the default place to verify a business rule

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Navigate to the demo shop, assert the title and one visible element.
> - **Medium:** Automate login and assert a user-visible post-login outcome; then prove the next test starts logged out.
> - **Challenge:** Using two contexts, have user A add a product to their cart and prove user B's cart is unaffected — then explain what would break if both tests shared a context.

---

## H. Coding Assignment

> **Planned: First browser test suite.** Build four browser tests against the demo shop — home page loads, login succeeds, login fails with a specific message, and a logged-in user sees their own empty cart — using the `page` fixture, `baseURL`, no hard waits, and assertions on user-visible outcomes. Include a written note on what context isolation gave you for free. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 9 questions planned: Browser/Context/Page classification, locator laziness reasoning, predict-the-output on a missing `await`, isolation scenarios, and one codegen judgment item. Answer key at [`answer-keys/part-5/01-playwright-fundamentals.answers.md`](../answer-keys/part-5/01-playwright-fundamentals.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *can you explain why your second test starts logged out, without using the word "magic"?*

---

[← Part V Overview](00-module-overview.md) · [Next: 5.2 Locator Strategy →](02-locator-strategy.md)
