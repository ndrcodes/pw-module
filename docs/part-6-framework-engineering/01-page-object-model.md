# Chapter 6.1 — Page Object Model

🟡 **Intermediate** · [Part VI Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VI — Framework Engineering |
| **Estimated time** | 1 session (90 min) + 6 hours independent work |
| **Prerequisite chapters** | [Part V](../part-5-web-automation-playwright/00-module-overview.md) complete |
| **Next chapter** | [6.2 Fixtures](02-fixtures.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** the Page Object Model as a response to duplication and coupling, and **quantify** the cost it removes.
2. **Design** page classes that expose user intent rather than element plumbing.
3. **Extract** component objects for repeated UI regions such as headers, cards, and dialogs.
4. **Enforce** the rule that locators live in page objects and assertions live in tests.
5. **Choose** between composition and inheritance for shared page behavior, and **justify** it.
6. **Recognize** over-abstraction, and **delete** a layer that does not earn its place.
7. **Refactor** an existing script-style suite onto page objects with no behavior change.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Locators, actions, web-first assertions, synchronization | [Part V](../part-5-web-automation-playwright/00-module-overview.md) |
| Classes, constructors, typed methods | [Chapters 2.9-2.10](../part-2-programming-fundamentals/00-module-overview.md) |
| Layered architecture and the dependency rule | [Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) |
| The same refactor applied to API clients | [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md) |
| **Your own duplicated Part V scripts** | Required input |

---

## C. Concept Explanation

You have now written the login steps four or five times. When the login page gains a "remember me" checkbox or the username field's label changes, you will edit every one of those files. A **page object** is a class that owns the knowledge of how to operate one page, so that knowledge exists in exactly one place. This is the same refactor you performed on API clients in [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md), applied to the UI, and the measurement is the same argument: rename an element, count the files you touch, before and after.

The part beginners get wrong is the *shape* of the class. A page object is not a container for locators. Compare `loginPage.getUsernameField().fill(user.email)` with `loginPage.loginAs(user)`. The first has moved the plumbing somewhere else and left the test knowing all about it; the second has given the test a sentence it can read, and left the page object free to change how login works. The methods on a page object should be the things a *user* does — `searchFor(term)`, `addToCart(productName)`, `proceedToCheckout()` — because those intentions change far less often than the markup that implements them.

The second rule is equally firm: **assertions belong in tests, not page objects.** A page object may wait for the page to be ready; it must not decide whether the application is correct. The moment `cartPage.verifyTotal(42)` exists, the test can no longer state what it is verifying, and the page object becomes unusable for a negative test where the total is *supposed* to be wrong. Finally, resist depth. Component objects composed into pages beat a `BasePage` hierarchy nearly every time, and a base class with eleven protected methods of which two are used is not architecture — it is something the next engineer has to read before writing their first test.

> **Full section coming in a follow-up pass.** Planned coverage:
> - The problem POM solves, measured by the rename-and-count exercise
> - Anatomy of a page object: constructor, private locators, public intent methods
> - Naming methods from user intent; the "read it out loud" test
> - What belongs in a page object and what never does
> - Assertions stay in tests: the argument, and the grey area of readiness waits
> - Returning values from methods; returning other page objects for flow chaining
> - Component objects: header, product card, cart badge, modal dialog
> - Composition versus inheritance, with the `BasePage` failure mode
> - Handling dynamic lists and tables through component objects
> - Where page objects get configuration and data
> - Refactoring safely: one page at a time, run the suite, commit
> - Over-abstraction smells and the delete-until-it-breaks exercise
> - How page objects combine with fixtures in [Chapter 6.2](02-fixtures.md)
> - Project structure for `pages/` and `pages/components/`

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: how POM makes a suite survivable across a UI redesign, which is the most common cause of suites being abandoned; how a test written against page objects can be reviewed by someone who does not know Playwright; how locator quality from [Chapter 5.2](../part-5-web-automation-playwright/02-locator-strategy.md) is now enforceable because locators live in one place; and why "no locators outside page objects" is a mechanical check in [Project 4](../projects/project-4-web-automation.md) and the [capstone](../capstone/00-capstone-overview.md) rubrics.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** one duplicated login sequence extracted into a `LoginPage` with a `loginAs` method
> 2. **Practical:** a plumbing-style page object next to an intent-style one, with the same test written against both
> 3. **QA-oriented:** `ProductsPage`, `CartPage`, and a `Header` component composed together
> 4. **Automation-oriented:** a product-card component object that operates the row identified by its data, plus an over-abstracted `BasePage` deleted with the suite still green

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Page objects that only expose locator getters
> - Assertions inside page objects
> - Method names mirroring Playwright calls (`clickLoginButton`) instead of intent (`loginAs`)
> - A `BasePage` created before any duplication existed
> - Deep inheritance for three pages
> - One giant page object for the entire application
> - Page objects that know about test data or configuration
> - Locators still appearing in test files after the refactor
> - Methods that do three things (`loginAndSearchAndAddToCart`)
> - Refactoring the whole suite at once and losing the ability to bisect a break

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Extract a `LoginPage` from your Part V scripts and rewrite two tests against it.
> - **Medium:** Build `ProductsPage`, `CartPage`, and a `Header` component; rewrite four tests so no test file contains a locator.
> - **Challenge:** Given a supplied framework with a 4-level page hierarchy and eleven-method base class, delete two layers with behavior preserved, then write a paragraph on what was actually lost.

---

## H. Coding Assignment

> **Planned: Page object refactor of your Part V suite.** Refactor your own browser tests onto page and component objects: intent-revealing methods, no locators in test files, no assertions in page objects, composition over inheritance, and no behavior change. Deliverables include a before/after count of files touched by an element rename, and a written justification for each class you created. This is the foundation of [Project 4](../projects/project-4-web-automation.md). Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: identify-the-layer-violation, method naming critique, composition-versus-inheritance judgment, over-abstraction diagnosis, and two "where does this code belong?" items. Answer key at [`answer-keys/part-6/01-page-object-model.answers.md`](../answer-keys/part-6/01-page-object-model.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *can someone who has never used Playwright read one of your tests and describe what the user is doing?*

---

[← Part VI Overview](00-module-overview.md) · [Next: 6.2 Fixtures →](02-fixtures.md)
