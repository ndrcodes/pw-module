# Chapter 5.2 — Locator Strategy

🟡 **Intermediate** · [Part V Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | V — Web Automation with Playwright |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [5.1 Playwright Fundamentals](01-playwright-fundamentals.md) |
| **Next chapter** | [5.3 Browser Actions](03-browser-actions.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Apply** the locator preference order: role → label → text → placeholder → test ID → CSS → XPath.
2. **Explain** why each step down that order increases coupling, and **justify** any deviation in writing.
3. **Rewrite** a brittle CSS or XPath locator into a resilient, intent-revealing one.
4. **Resolve** strict-mode violations by scoping to a container rather than using `.first()`.
5. **Chain** and **filter** locators to identify an element within a row, card, or list item.
6. **Identify** elements that cannot be reached by role or label, and **report** them as accessibility findings.
7. **Predict** which locators survive a redesign, a copy change, or a DOM restructure.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Locators as lazy descriptions; auto-waiting | [Chapter 5.1](01-playwright-fundamentals.md) |
| Basic HTML structure and attributes | [Chapter 5.1](01-playwright-fundamentals.md) |
| DevTools element inspection | [Chapter 4.1](../part-4-api-testing-and-automation/01-http-fundamentals.md) |

No CSS or XPath experience required — this chapter teaches enough to read them and explains why you should rarely write them.

---

## C. Concept Explanation

A locator is a promise about how to find something, and the quality of that promise determines how often your suite breaks for reasons that have nothing to do with defects. `page.locator("div.col-md-4 > div:nth-child(3) > span")` works perfectly until a developer adds a wrapper div, changes a grid class, or reorders a card — none of which are bugs, all of which turn your suite red. `page.getByRole("button", { name: "Add to cart" })` survives all three, because it describes the element the way a *user* perceives it: a button whose accessible name is "Add to cart".

That is the whole argument for the preference order. Roles and accessible names come from semantics that change slowly, because changing them changes what the application *means*. Labels are similarly semantic and are how users identify form fields. Visible text is a good locator whose only fragility is copy changes — and a copy change is often something you *want* to know about. Placeholders come next, useful when a field has no label (which is itself worth reporting). Test IDs sit fifth: immune to copy and styling changes, an explicit contract with developers, but invisible to users, so a passing test-ID-based test tells you nothing about whether a human could find the element. CSS and XPath are last because they couple your tests to styling and document structure, the two things that change most often and most freely.

The practical skill on top of the ordering is **scoping**. Real pages have twelve "Delete" buttons, one per row. The wrong fix is `.first()`, which silently picks whichever element happens to come first and is a coin flip disguised as a locator. The right fix is to narrow the context — find the row for "Blue Shirt", then find the Delete button inside it — which is both stable and self-documenting. When Playwright raises a strict-mode error because your locator matched two elements, it has prevented a test that would have quietly acted on the wrong thing; treat it as a bug report about your locator, not an obstacle.

> **Full section coming in a follow-up pass.** Planned coverage:
> - Why locator choice is the highest-leverage decision in UI automation
> - The preference order, with the reasoning behind each position
> - `getByRole` and accessible names: how roles are computed, and the common roles in practice
> - `getByLabel`, `getByPlaceholder`, `getByText`, `getByAltText`, `getByTitle`
> - `getByTestId`: the developer contract, configuring the attribute name, and its blind spot
> - CSS selectors: enough to read them, and the specific patterns that always break
> - XPath: why it is last, and the rare legitimate case
> - Strict mode: what it protects you from, and why `.first()` is usually a defect
> - Scoping and chaining: locating within a row, card, or dialog
> - `filter({ hasText })`, `filter({ has })`, and `nth` when the position is genuinely the identity
> - Dynamic content: lists, tables, and elements identified by their data
> - Locators inside iframes and shadow DOM, briefly
> - Debugging locators: the Inspector's pick-locator tool, and `--ui` mode
> - Accessibility findings as a QA deliverable: elements with no accessible name
> - Writing a justification comment for a low-tier locator

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: how locator quality is graded in [Project 4](../projects/project-4-web-automation.md) and in [Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) reviews; how the "no accessible name" findings you produce here are genuine bug reports that raise your standing with developers; how to negotiate test IDs into the application when semantics are missing; why ambiguous locators masquerade as flaky timing problems in [Chapter 5.5](05-synchronization-and-flaky-tests.md); and why locators live only inside page objects from [Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md) onward.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** the same button located by role, text, test ID, and CSS, side by side
> 2. **Practical:** a class rename breaking the CSS locator while the role locator survives
> 3. **QA-oriented:** resolving a strict-mode error on twelve "Delete" buttons by scoping to the correct row
> 4. **Automation-oriented:** a product card component located by its data, with a chained locator and a justified test-ID deviation

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Copying XPath from DevTools
> - `nth-child` and positional selectors
> - Using `.first()` to silence strict mode
> - Reaching for test IDs before trying role, label, and text
> - Locating by CSS class because it is familiar from front-end work
> - Over-long chains that encode structure rather than meaning
> - Text locators with hidden whitespace or partial-match assumptions
> - Storing a resolved handle instead of a locator
> - Treating a locator failure as a timing problem and adding a wait
> - Not reporting an unreachable element as an accessibility defect

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Write role-, label-, or text-based locators for ten elements on the demo shop.
> - **Medium:** Rewrite fifteen supplied brittle locators, naming the tier of each replacement and what change would break it.
> - **Challenge:** On a page with a twelve-row table, write locators that act on the row identified by its data — never by position — and produce an accessibility findings list for every element you could not reach by role or label.

---

## H. Coding Assignment

> **Planned: Locator audit and rewrite.** Given a supplied suite full of CSS and XPath locators, deliver: a rated audit of every locator with its tier and its breaking condition; a rewritten suite using the highest viable tier throughout, with a one-line justification comment for each deviation below tier 5; proof the suite still passes; and an accessibility findings report for elements lacking accessible names. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: rank-the-locators, predict-which-survives-a-redesign, strict-mode diagnosis, scoping-versus-`.first()` judgment, and one accessibility-finding scenario. Answer key at [`answer-keys/part-5/02-locator-strategy.answers.md`](../answer-keys/part-5/02-locator-strategy.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *for every locator you have written, can you name the change that would break it — and would that change be a bug?*

---

[← 5.1 Playwright Fundamentals](01-playwright-fundamentals.md) · [Next: 5.3 Browser Actions →](03-browser-actions.md)
