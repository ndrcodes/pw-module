# Instructor Notes — Part V: Web Automation with Playwright

[← Module Overview](00-module-overview.md) · [Table of Contents](../README.md)

**Expect the highest engagement of the course and the strongest pull toward bad habits.** Watching a browser drive itself is genuinely thrilling, and that excitement produces copy-pasted scripts full of sleeps. Your main job in these three weeks is to convert enthusiasm into discipline before Part VI asks them to build a framework on top of it.

---

## 1. Teaching goals for the module

1. **Locator discipline becomes automatic.** Learners should feel discomfort when they type `page.locator("div.card > span")`.
2. **Assertions are understood as synchronization.** This single idea prevents most future flakiness.
3. **`waitForTimeout` becomes unthinkable.** Not forbidden by rule — understood as an admission of not knowing what you are waiting for.
4. **Learners feel duplication.** Do not rescue them with page objects early. The mess is the setup for Chapter 6.1.

---

## 2. Common beginner misconceptions

| Chapter | Misconception | Correction |
|---|---|---|
| 5.1 | "Browser, context, and page are the same thing" | Draw it: one browser process, many contexts (like separate incognito profiles), each with pages. Then show two contexts logged in as different users simultaneously. |
| 5.1 | "Tests share cookies, so I must log out" | Each test gets a fresh context. Demo it: set a cookie in one test, show it absent in the next. |
| 5.1 | "Codegen writes my tests" | Codegen is a *discovery* tool. Show its output, then rewrite it together to course standards. Recording is fine; shipping recordings is not. |
| 5.2 | "Any locator that works is fine" | "Works today" versus "works after a redesign." Change a class name in DevTools and rerun. |
| 5.2 | "Test IDs are the best practice" | They are fifth, not first. Roles verify the app is usable; test IDs only verify it is scriptable. |
| 5.2 | "`getByText` is fragile because copy changes" | Copy changes are usually *worth* failing on. Distinguish content assertions from structural coupling. |
| 5.2 | "Strict mode errors are Playwright being annoying" | Two matches means the test is ambiguous. The error prevented a coin flip. Show a test that would have passed on the wrong element. |
| 5.3 | "`click()` needs a wait before it" | Actionability checks are built in. Show the auto-wait in the trace timeline. |
| 5.3 | "`type()` and `fill()` are interchangeable" | `fill()` sets the value; `type()`/`pressSequentially()` sends keystrokes. Needed for autocomplete and input masks; slower and less stable otherwise. |
| 5.3 | "Uploads need a real file dialog" | `setInputFiles` bypasses the OS dialog. Demo it, then show `waitForEvent("filechooser")` for the harder case. |
| 5.4 | "`expect(await locator.isVisible()).toBe(true)` is the same as `toBeVisible()`" | The first snapshots a boolean once. The second retries. This is the highest-value five minutes in the module. |
| 5.4 | "More assertions is more rigorous" | Five unrelated assertions in one test produce a poor failure message and hide which behavior broke. |
| 5.4 | "`toHaveText` and `toContainText` are interchangeable" | Exact versus partial. Show a whitespace-driven false failure and let them choose deliberately. |
| 5.5 | "Flaky means the app is slow" | Six categories: timing, locator, data, environment, network, concurrency — plus genuine app bugs. Force a category name before any fix. |
| 5.5 | "`networkidle` is the reliable wait" | Discouraged by Playwright's own docs; breaks on polling and analytics. Show a page that never goes idle. |
| 5.5 | "Retries fix flakiness" | Retries hide it. Establish the norm: diagnose first, mitigate second, and never both silently. |

---

## 3. Concepts learners find genuinely difficult

**Assertions as synchronization.** This is abstract until they see the retry loop. Use the trace viewer: run a test where an element appears after 2 seconds, and show the assertion polling. Once learners see the retries, hard waits lose all appeal.

**Locator ambiguity versus timing.** The two failure modes look identical from the console. Teach the discrimination method explicitly: if the failure changes with `--repeat-each`, suspect timing; if it changes with page state or data, suspect the locator; if strict mode complains, it was never about timing at all.

**Why the role-first order.** Learners with CSS experience resist this hardest, because CSS feels precise. Reframe: precision about *structure* is exactly the coupling you do not want. Roles describe purpose, which changes far less often than markup.

**Context isolation as a design tool.** Beginners see fresh contexts as a chore ("I have to log in again"). Flip it: isolation is what makes parallelism possible, and Chapter 6.3 will give them login-once-reuse-everywhere. Preview, do not implement.

**When a genuine wait is legitimate.** Absolutism creates its own problem — learners eventually meet a case where nothing observable changes. Teach `waitForResponse` and `waitForFunction` honestly, and give the rule: it is acceptable to wait on a *named condition*, never on a *duration*.

---

## 4. Suggested demonstrations

### Demo 1 — Two users, one browser (10 min, Chapter 5.1)

Two contexts side by side, logged in as different users, interacting with the same product. Explains isolation, previews multi-user testing, and looks impressive enough to earn attention for the theory that follows.

### Demo 2 — Break the CSS, survive with roles (15 min, Chapter 5.2)

Same button, two locators: `.btn-primary-lg` and `getByRole("button", { name: "Add to cart" })`. Rename the class in DevTools. One test dies. Then change the button's visible text and show the *other* one failing — and discuss why that failure is arguably correct.

### Demo 3 — Strict mode saves a test (10 min, Chapter 5.2)

A page with two "Delete" buttons. Show the strict-mode error, then resolve it properly by scoping to a row (`getByRole("row", { name: "Blue Shirt" }).getByRole("button", { name: "Delete" })`). Emphasize that `.first()` is usually a bug in disguise.

### Demo 4 — The race condition in `isVisible()` (15 min, Chapter 5.4)

```ts
// Passes or fails depending on machine load
if (await page.locator("#toast").isVisible()) {
  await expect(page.locator("#toast")).toHaveText("Saved");
}

// Deterministic
await expect(page.getByRole("status")).toHaveText("Saved");
```

Run the first version ten times with a throttled CPU. Watching it flip is more persuasive than any explanation.

### Demo 5 — Trace viewer as a time machine (20 min, Chapter 5.5)

Take one real failure and open its trace. Walk the timeline: the action, the DOM snapshot before and after, the network panel, the console. Then ask what they would have concluded from a screenshot alone. This demo sells Chapter 6.8 three weeks early and pays for itself immediately.

### Demo 6 — De-flaking live (25 min, Chapter 5.5)

A prepared test with three hard waits, failing about one run in four. Diagnose each in turn, naming the category, replacing with the correct primitive, and proving stability with `--repeat-each=20`. Narrate the reasoning, not just the edits: "what am I actually waiting for here?"

### Demo 7 — The suite that got faster by removing waits (10 min, Chapter 5.5)

Before: 6 tests, 68 seconds, one flaky. After: 6 tests, 19 seconds, stable. Learners assume correctness costs speed; this reverses the assumption permanently.

---

## 5. Suggested live activities

| Activity | Chapter | Format | Time |
|---|---|---|---|
| First browser test race: navigate, assert title, assert one element | 5.1 | Individual | 20 min |
| Predict which of 10 locators survives a redesign | 5.2 | Pairs, then verify live | 25 min |
| Locator rewrite gauntlet: 15 bad locators → good ones | 5.2 | Individual, peer review | 30 min |
| Accessibility findings hunt: elements unreachable by role or label | 5.2 | Pairs, exploratory | 20 min |
| Form marathon: text, select, checkbox, radio, upload, keyboard | 5.3 | Individual | 30 min |
| Assertion matching: 12 scenarios → the right assertion | 5.4 | Rapid fire, whole class | 15 min |
| Flake triage: 8 failing tests, name the category before fixing | 5.5 | Groups of 3 | 30 min |
| De-flake a supplied suite, prove 20 clean runs | 5.5 | Individual | 45 min |

The **flake triage** activity is the one to protect. Requiring a named category before any code change is the habit that separates engineers from sleep-adders, and it is much easier to install here than to correct in Chapter 6.9.

---

## 6. Questions to ask learners

- "Which locator did you use, and what would have to change in the app to break it?"
- "Could this locator match two elements on any page state? What happens if it does?"
- "You used a CSS selector. What was wrong with role, label, and text?"
- "This element has no accessible name. Is that your problem or a bug you should file?"
- "What is this assertion waiting for? How long will it wait, and what happens then?"
- "Why is `isVisible()` inside an `if` a race condition?"
- "This test failed once in twenty runs. Which of the six categories is it, and how will you confirm?"
- "You added a five-second wait and it passed. What specifically were you waiting for?"
- "Your test asserts the URL changed. Does that prove the order was created?"
- "How much of this test needs a browser at all? What could be done through the API instead?"
- "You have written the login steps in four files. What happens when the login page changes?" (Plant Chapter 6.1.)

---

## 7. Signs a learner is struggling

| Signal | Likely cause | Response |
|---|---|---|
| `waitForTimeout` reappearing after being removed | Has a symptom-fix reflex, not a diagnostic method | Sit with them and diagnose one failure end to end using the trace |
| Heavy use of `.first()`, `.nth()`, `.last()` | Working around strict mode instead of scoping | Teach container scoping; treat `.first()` as needing a written justification |
| Long XPath expressions copied from DevTools | Discovered "Copy XPath" and it works | Show the same element after a DOM change; then do the role-based rewrite together |
| Tests pass locally, fail in CI | Timing assumptions that hold only on a fast machine | Have them run with CPU throttling locally to reproduce before touching CI |
| One giant test covering the entire journey | Believes end-to-end means one test | Split it and show the improvement in failure diagnosis |
| Cannot find why a test fails, keeps rerunning | Not using traces | Make trace-first debugging a hard requirement, then verify in office hours |
| Copy-pastes login into every file and is content | Has not felt maintenance cost yet | Ask them to change the login flow and time the edit; then preview Chapter 6.1 |
| Asserting on things they just did (`fill` then `toHaveValue`) | Unclear on assertion purpose | "What is the *outcome* a user would care about? Assert that." |
| Frustrated and losing confidence | Usually a locator problem misread as personal failure | Normalize it: show that experienced engineers debug locators constantly, and give them the triage checklist |

---

## 8. Remediation exercises

**Cannot choose locators.**
Twenty elements on the demo shop. For each: write the best available locator, name its tier in the preference order, and state what change would break it. Repeat weekly until tier 1-3 is the default.

**Overuses hard waits.**
Ban them entirely for one week, including in scratch code. Provide the replacement menu (assertion, action-level wait, `waitForResponse`, `waitForFunction`) and require them to name which they used and why for each case.

**Cannot diagnose flakiness.**
Provide five failing tests, one per category, and require a written diagnosis before any fix. Grade only the diagnosis on the first pass; grade the fix on resubmission.

**Writes weak assertions.**
Take three of their passing tests and require them to break the application so each goes red. Any test they cannot make fail must be rewritten.

**Struggles with actions.**
Single-page form drill: every control type, one script, no assertions. Removing the verification burden lets them focus purely on interaction APIs.

**Cannot read traces.**
Supply three trace files from failures they did not write. For each: state the last successful action, the failing action, what the DOM showed, and the most likely cause. Reading unfamiliar traces is a distinct skill from reading your own.

**Learners who are ahead.**
Have them write an accessibility findings report from their locator work (elements with no accessible name, missing labels, ambiguous button text) and file it as bug reports. It is real, valuable QA output, and it deepens the role-first argument rather than racing ahead.

---

## 9. Assessment guidance for this part

- **Grep first.** `waitForTimeout`, `\.first\(\)`, `xpath`, `nth-child`, `page.locator("\."`. This takes 30 seconds and predicts most of the grade.
- **Require a locator justification comment** for anything below tier 5. One line. The point is that the choice becomes conscious.
- **Run `--repeat-each=10` on every submission.** Stability is the primary criterion in this module, ahead of coverage.
- **Require the break-it proof** carried forward from Part IV: change the app, show the red run.
- **Do not penalize duplication in this part.** It is scaffolding for Chapter 6.1. Penalizing it here teaches learners to abstract before they understand the problem, which is worse.
- **Ask the pyramid question in every review:** "which of these UI tests should be an API test?" Learners who can answer well are ready for Part VI.

---

## 10. Pacing guidance

| Week | Sessions | Risk to watch |
|---|---|---|
| 17 | 5.1, 5.2 | High excitement; codegen output creeping into submissions. Address it explicitly in session 1. |
| 18 | 5.3, 5.4 | Assertion-versus-boolean confusion is the make-or-break concept; spend surplus time on Demo 4. |
| 19 | 5.5 (two sessions) | Do not compress. Session 1: causes and diagnosis. Session 2: the de-flaking lab with proof of stability. |

If the cohort is behind, borrow from 5.3 — action APIs are the most self-teachable material in the course. Never borrow from 5.5.

---

## 11. Transition into Part VI

Make the duplication they are living with the explicit bridge:

> "Count the number of times you have written the login steps this week. Count how many files contain the same product-search code. Now imagine the login page changes next sprint. Part VI is about that problem, and every chapter in it exists to remove a specific pain you felt in the last three weeks — starting with page objects, which are just the idea that a page should know how to operate itself."

Then set expectations for the shift in difficulty: Part VI is marked 🔴 not because the code is harder but because there is no single right answer, and their Part III framework constitution is about to be tested against reality.
