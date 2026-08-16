# Chapter 5.3 — Browser Actions

🟡 **Intermediate** · [Part V Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | V — Web Automation with Playwright |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [5.1](01-playwright-fundamentals.md), [5.2](02-locator-strategy.md) |
| **Next chapter** | [5.4 Web Assertions](04-web-assertions.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Perform** clicks, double clicks, and right clicks, and **explain** the actionability checks that precede them.
2. **Fill** text inputs, and **choose** correctly between `fill()` and sequential key presses.
3. **Operate** select dropdowns, checkboxes, and radio buttons, including custom non-native components.
4. **Upload** files, and **handle** a file chooser dialog.
5. **Use** keyboard and mouse APIs for interactions no simple action covers.
6. **Handle** navigation, new tabs, dialogs, and alerts.
7. **Explain** why Playwright rarely needs an explicit wait before an action.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Locators and the preference order | [Chapter 5.2](02-locator-strategy.md) |
| Locator laziness and auto-waiting | [Chapter 5.1](01-playwright-fundamentals.md) |
| `async`/`await` on every call | [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) |

---

## C. Concept Explanation

Actions are the simplest material in Part V, and the reason they feel easy is worth understanding rather than taking for granted. Before Playwright clicks anything, it runs a set of **actionability checks**: is the element attached to the DOM, visible, stable (not animating), enabled, and able to receive events (not covered by an overlay)? It retries those checks until they pass or the timeout expires. That is why `await page.getByRole("button", { name: "Checkout" }).click()` usually just works, with no wait in front of it, on a page that is still settling. The auto-waiting is built into the action, not bolted on by you.

Most of the API is a direct translation of what a user does. `fill()` sets an input's value in one step. `check()` and `uncheck()` operate checkboxes and radios and assert the resulting state as part of the action. `selectOption()` drives native `<select>` elements. `setInputFiles()` attaches files without ever opening an operating system dialog. Where the API becomes interesting is at the edges: components that *look* like dropdowns but are custom-built from divs need to be clicked and chosen like the menus they imitate; inputs with masks, autocomplete, or keystroke-driven search need real key events rather than a value assignment, which is what `pressSequentially()` provides; and drag-and-drop, hover-revealed menus, and canvas interactions need explicit mouse control.

The judgment to develop here is knowing which tool the situation calls for, and resisting the temptation to reach for the lowest-level option by default. Coordinate-based mouse clicks work and couple your test to pixel positions; a role-based click on the same element is stable. Prefer the highest-level action that expresses what the user is doing.

> **Full section coming in a follow-up pass.** Planned coverage:
> - Actionability checks: the full list, and how they replace explicit waits
> - `click()` and its options: `force`, `position`, `modifiers`, `button`, `clickCount`
> - When `force: true` is legitimate, and why it usually hides a real defect
> - `fill()` versus `pressSequentially()`; `clear()`; masked and autocomplete inputs
> - `selectOption()` for native selects; driving custom dropdown components
> - `check()`, `uncheck()`, and radio groups; verifying state as part of the action
> - `setInputFiles()`, multiple files, clearing a selection, and `waitForEvent("filechooser")`
> - Keyboard API: `press()`, key combinations, `Tab` order, and form submission via Enter
> - Mouse API: hover, drag and drop, and coordinate clicks as a last resort
> - Navigation actions: `goto`, `goBack`, `reload`, and clicking links that navigate
> - New tabs and popups: `context.waitForEvent("page")`
> - Dialogs: `alert`, `confirm`, `prompt`, and the `dialog` event
> - Scrolling, and why it is rarely needed explicitly
> - Reading state for setup purposes: `inputValue()`, `textContent()`, and why assertions belong in [Chapter 5.4](04-web-assertions.md)

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: how these actions become the intent-revealing methods on page objects in [Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md) (`login(user)` rather than three fills and a click); why file upload appears in nearly every real application and is skipped in nearly every tutorial; how custom components dominate modern applications and are where tutorial knowledge stops being enough; and why `force: true` in a submission usually indicates a covered element that a real user could not click either.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** fill a field and click a button
> 2. **Practical:** a complete form — text, select, checkbox, radio, file upload — filled end to end
> 3. **QA-oriented:** driving a custom dropdown and an autocomplete search field that requires real keystrokes
> 4. **Automation-oriented:** a checkout flow with a confirmation dialog and a new tab for the receipt

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Adding a wait before every action
> - `force: true` to get past an element that is covered, hiding a real defect
> - Using `pressSequentially()` everywhere because it looks more realistic
> - Using `fill()` on a field whose behavior depends on keystrokes
> - Treating a custom dropdown as a native `<select>`
> - Coordinate-based clicks where a role-based click would work
> - Forgetting that `check()` is a no-op if the box is already checked, and asserting nothing
> - Not registering a dialog handler before triggering the dialog
> - Assuming a click that navigates has finished before asserting
> - Mixing setup reads and assertions, blurring Arrange and Assert

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Fill and submit a login form using role- and label-based locators only.
> - **Medium:** Complete a multi-control form including a native select, checkboxes, a radio group, and a file upload.
> - **Challenge:** Automate a flow with a custom dropdown, an autocomplete field, a confirmation dialog, and a link that opens a new tab — with no hard waits and no `force: true`.

---

## H. Coding Assignment

> **Planned: Full form interaction script.** Automate the demo shop's account-details and checkout forms end to end: every control type, a file upload for a profile image, keyboard-driven submission on one form, a confirmation dialog, and correct handling of the resulting navigation. Constraints: tier 1-3 locators wherever possible, no `waitForTimeout`, no `force: true` without a written justification. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 9 questions planned: choose-the-right-action scenarios, `fill()` versus keystrokes judgment, actionability-check reasoning, dialog handling order, and one `force: true` diagnosis item. Answer key at [`answer-keys/part-5/03-browser-actions.answers.md`](../answer-keys/part-5/03-browser-actions.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *can you drive every control on an unfamiliar form without adding a single wait?*

---

[← 5.2 Locator Strategy](02-locator-strategy.md) · [Next: 5.4 Web Assertions →](04-web-assertions.md)
