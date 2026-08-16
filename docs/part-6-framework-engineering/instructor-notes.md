# Instructor Notes — Part VI: Framework Engineering

[← Module Overview](00-module-overview.md) · [Table of Contents](../README.md)

**This part has no single right answer, and that is the pedagogical challenge.** Learners arriving from Parts II-V have been rewarded for producing correct output. Here, two different designs can both be correct, and the assessable skill is justification. Expect discomfort, and expect learners to ask you to just tell them the right structure. Resist — but give them decision criteria, not vibes.

---

## 1. Teaching goals for the module

1. **Abstractions must be earned.** Every page object, fixture, and layer should be traceable to a duplication or coupling it removes.
2. **Learners can defend a design.** The capstone defense is graded on reasoning; this module is where reasoning is built.
3. **Parallelism becomes the default assumption.** Once a learner internalizes "another copy of this test is running right now," data and state design fix themselves.
4. **Diagnosis before mitigation.** By the end of 6.9, adding a retry without a documented root cause should feel like professional negligence.

---

## 2. Common beginner misconceptions

| Chapter | Misconception | Correction |
|---|---|---|
| 6.1 | "A page object is where I keep locators" | Compare two APIs on screen: `getLoginButton()` versus `login(user)`. Ask which one a test reads better with. |
| 6.1 | "Page objects should assert the page loaded" | Assertions belong in tests. A page object may *wait*; it should not *judge*. Discuss the grey area honestly. |
| 6.1 | "Every page needs a class, even a 404 page" | One class per page the tests actually interact with. Unused classes are inventory, not architecture. |
| 6.1 | "Inheritance is how you share page behavior" | Prefer composition: a `Header` component object used by many pages beats a `BasePage` god class. Show both. |
| 6.2 | "Fixtures are `beforeEach` with more typing" | Show on-demand instantiation: a test that does not request `seededProduct` never pays for it. Hooks cannot do that. |
| 6.2 | "One mega-fixture for everything is convenient" | It couples every test to every dependency and slows the fast ones. Split by concern. |
| 6.2 | "Teardown is optional if data is unique" | Unique data still accumulates. Show a table with 40,000 orphaned orders slowing queries. |
| 6.3 | "Reusing login state is cheating" | The login *flow* gets one dedicated UI test. Everything else tests something different and should not pay 8 seconds to get there. |
| 6.3 | "One shared storageState file for all tests is fine" | Fine for read-only tests, dangerous when tests mutate the user's cart or profile. Discuss per-worker state. |
| 6.3 | "Tokens and cookies need different frameworks" | Both are just state. Show `storageState` capturing cookies and localStorage, and API-issued tokens injected as headers. |
| 6.4 | "A seed script at the start of the run is enough" | It creates shared mutable state. Show two workers fighting over the same seeded product. |
| 6.4 | "Random data makes failures unreproducible" | Log the generated data and support a seed. Uniqueness and reproducibility are compatible. |
| 6.4 | "Cleanup in the test body is sufficient" | A mid-test failure skips it. Cleanup belongs in fixture teardown, which always runs. |
| 6.5 | "Config means an if-statement on environment name" | Tests must not know the environment. One config module, resolved once. |
| 6.5 | "`.env` in the repo is fine for non-production" | Never. `.env.example` documents names; real values live in the CI credential store. |
| 6.6 | "Cross-browser means everything, everywhere" | Cost-benefit: full suite on Chromium, critical paths on Firefox and WebKit. Make them do the arithmetic. |
| 6.6 | "Mobile emulation tests the mobile app" | It emulates viewport, touch, and user agent. It is not a real device and not a native app. Be explicit about the limits. |
| 6.7 | "Set workers to 16 and it will be four times faster" | Measure. Show throughput degrading past core count, plus stability loss. |
| 6.7 | "`test.describe.serial` is the fix for order-dependent tests" | It is an admission of coupling. Acceptable rarely, with a comment explaining why; usually the data design is the real fix. |
| 6.7 | "Sharding is the same as workers" | Workers split within a machine; shards split across machines. Both, in the right order. |
| 6.8 | "Screenshots are enough" | Traces have DOM snapshots, network, console, and a timeline. Show the same failure both ways. |
| 6.8 | "Debug mode means adding console.log" | Inspector, `--debug`, `page.pause()`, trace viewer. Console logging is the fallback, not the tool. |
| 6.9 | "Retries make it reliable" | Retries make it green. Require a root cause for every retried test, tracked in a register. |
| 6.9 | "It's flaky because the environment is slow" | Slowness exposes bad synchronization; it rarely *is* the bug. Force a category and evidence. |

---

## 3. Concepts learners find genuinely difficult

**How much to abstract.** This is the hardest judgment in the course. Give three concrete heuristics they can apply without you: (1) abstract on the third occurrence, not the first; (2) a page object method should read like a sentence a product owner would say; (3) if you cannot name the abstraction without using the word "helper" or "manager", you have not found the concept yet.

**Fixtures composing other fixtures.** The mental model of dependency injection is new. Teach it as a dependency graph, drawn on the board: `loggedInPage` depends on `storageState` depends on `apiClient` depends on `config`. Once learners see the graph, the syntax follows.

**Why parallelism breaks their tests.** Learners experience this as Playwright being unreliable. Reframe immediately: parallelism did not break the tests, it *revealed* that they were sharing state. Run the same suite with `--workers=1` and `--workers=4` and let the difference make the argument.

**Cleanup on failure.** The idea that a failing test still has responsibilities is unintuitive. Use fixture teardown and show it running after a deliberate assertion failure.

**Flake diagnosis as a discipline.** Learners want a checklist that outputs a fix. Give them a *method* instead: reproduce (with `--repeat-each`, throttling, or parallel load), categorize, form a hypothesis, change one thing, verify with 20-30 runs. The verification volume is the part they skip.

**Distinguishing genuine engine bugs from their own bugs in 6.6.** Most cross-browser failures are the learner's timing assumptions, not WebKit. Teach them to prove it: fix the synchronization first, then re-evaluate.

---

## 4. Suggested demonstrations

### Demo 1 — Rename a button, count the edits (15 min, Chapter 6.1)

Their Part V scripts: change the "Add to cart" label in the app and count files touched. Then the same change with page objects: one file. Do the counting on the board.

### Demo 2 — Two page object APIs (10 min, Chapter 6.1)

```ts
// Version A — plumbing exposed
await loginPage.getUsernameField().fill("standard_user");
await loginPage.getPasswordField().fill("secret_sauce");
await loginPage.getLoginButton().click();

// Version B — intent exposed
await loginPage.loginAs(users.standard);
```

Ask which version survives the login page gaining a "remember me" checkbox.

### Demo 3 — Over-abstraction autopsy (15 min, Chapter 6.1)

Show a real `BasePage` with 11 protected methods, 2 in use, and a 4-level hierarchy for 3 pages. Ask what a new hire must read to write their first test. Then delete it live and show the tests still passing.

### Demo 4 — Fixtures versus hooks (20 min, Chapter 6.2)

Same setup implemented as `beforeEach` and as a fixture. Then add a test that needs *none* of the setup. The hook version pays anyway; the fixture version does not. Then show typed autocompletion on the fixture, which is the second selling point.

### Demo 5 — The 8-second tax (15 min, Chapter 6.3)

Run 12 tests logging in through the UI. Time it. Switch to API login plus `storageState`. Time it again. Put both numbers on the board and extrapolate to 400 tests: the difference is the argument for the whole chapter.

### Demo 6 — Two workers, one seeded product (15 min, Chapter 6.4)

Two tests that both edit the same seeded product, run with `--workers=2`. Watch them interfere. Then switch to per-test factory creation and rerun. This demo is the emotional core of the module.

### Demo 7 — Cleanup that survives failure (10 min, Chapter 6.4)

A test with inline cleanup, failing before it. Show the orphan. Move cleanup into fixture teardown, fail again, show it cleaned. Short, decisive.

### Demo 8 — Worker scaling curve (20 min, Chapter 6.7)

Run the suite with 1, 2, 4, 8, and 16 workers on the same machine and plot wall-clock time. The curve flattens and then degrades. Learners stop treating worker count as a magic number.

### Demo 9 — Trace viewer forensics (25 min, Chapter 6.8)

One CI failure that does not reproduce locally. Diagnose it entirely from the trace: last successful action, DOM state, the network call that returned 500, the console error. Narrate the reasoning as an investigation, not a tour of the UI.

### Demo 10 — Flake hunt end to end (30 min, Chapter 6.9)

Take a test failing roughly 1 in 15. Reproduce with `--repeat-each=30` under CPU throttling, categorize, hypothesize, fix one thing, verify with 30 clean runs. Show the register entry you would write. This is the capstone-level skill, demonstrated.

---

## 5. Suggested live activities

| Activity | Chapter | Format | Time |
|---|---|---|---|
| Convert one Part V script to page objects | 6.1 | Individual | 35 min |
| API design review: critique each other's page object method names | 6.1 | Pairs, swap | 20 min |
| Find the over-abstraction in a supplied framework | 6.1 | Groups of 3 | 20 min |
| Write a `loggedInPage` fixture from scratch | 6.2 | Individual | 30 min |
| Draw the fixture dependency graph for the target architecture | 6.2 | Whole class, board | 15 min |
| Measure and report the auth-reuse speedup | 6.3 | Individual | 25 min |
| Build `userFactory` with unique, overridable output | 6.4 | Individual | 30 min |
| Break your own suite with `--workers=4`, then fix the data | 6.4, 6.7 | Individual | 35 min |
| Config drill: switch environments with one variable, prove no test changed | 6.5 | Individual | 20 min |
| Run critical path on WebKit; classify each failure as ours or theirs | 6.6 | Pairs | 30 min |
| Worker scaling measurement and recommendation | 6.7 | Groups, share numbers | 25 min |
| Diagnose three unfamiliar traces | 6.8 | Individual | 30 min |
| Flake triage clinic on real cohort failures | 6.9 | Whole class | 40 min |

The **flake triage clinic** using the cohort's own failures is the highest-value session in the module. Collect failures during the week, anonymize them, and work them publicly.

---

## 6. Questions to ask learners

- "What duplication does this page object remove? Show me the before."
- "Read this test out loud. Does it sound like a description of user behavior?"
- "Why is this method on the page object rather than in the test?"
- "This page object asserts. What can the test no longer say for itself?"
- "Your `BasePage` has nine methods. How many are used? Delete the rest — what breaks?"
- "Which fixture does this test not need? What is it paying for?"
- "When does this fixture tear down, and what happens if the test failed?"
- "Where does this test's user come from? Is any other test using it right now?"
- "Two copies of this test are running simultaneously. What collides?"
- "How many places define the base URL? Show me all of them."
- "This failed on WebKit only. Is that a browser difference or your timing assumption? Prove it."
- "What worker count did you choose, and what measurement supports it?"
- "This test is in a serial block. What is the actual coupling, and could data design remove it?"
- "You added a retry. What is the root cause, and where is it recorded?"
- "Diagnose this failure without rerunning it. What does the trace tell you?"

---

## 7. Signs a learner is struggling

| Signal | Likely cause | Response |
|---|---|---|
| Page objects that are just locator dictionaries | Copied the pattern without the purpose | Have them rewrite one test using only page object methods; the gaps become obvious |
| A `BasePage` with many unused methods | Speculative generality | Delete-until-it-breaks exercise, together |
| Fixtures that duplicate one another | No dependency thinking | Draw the graph with them; compose instead of copy |
| Still logging in through the UI everywhere | Has not done the measurement | Make them time it and report the number |
| Passes with 1 worker, fails with 4, and blames Playwright | Shared state not yet believed | Demo 6, one-on-one, with their own code |
| Cleanup written inline at the end of tests | Has not connected failure paths to teardown | Demo 7, then require teardown for all created data |
| Hardcoded credentials reappearing | Convenience under time pressure | Non-negotiable rule; add a pre-commit grep to the project |
| Runs everything on all browsers, suite takes 40 minutes | No cost model | Have them compute engine-minutes per run per week |
| Adds retries to reach green before deadline | Deadline pressure, plus flake diagnosis feeling open-ended | Give the structured method and a time box: 45 minutes of diagnosis, then a *documented* retry with a follow-up ticket |
| Cannot read their own trace | Never practiced on unfamiliar failures | Trace drills with someone else's failures |
| Paralyzed by design choices | Wants the one right answer | Give the three heuristics and permission to be wrong: "choose, ship, and note what you would change" |

---

## 8. Remediation exercises

**Page objects as locator dumps.**
Constraint drill: rewrite three tests where the test file may contain *no* Playwright API calls at all, only page object methods and `expect`. Forces intent-level methods.

**Over-abstraction.**
Hand them their own hierarchy and require two layers deleted with behavior preserved. Then a written paragraph on what was lost — usually nothing.

**Cannot write fixtures.**
Provide the fixture type signatures and have them fill in bodies. Then have them add one fixture that depends on another.

**Still UI-logging-in.**
Timed challenge: reduce suite runtime by 50% without deleting tests. Auth reuse is the obvious lever and they will find it themselves.

**Data collisions.**
Force `--workers=4` as the only allowed run command for a week. Every failure becomes a data-design lesson.

**Hardcoded configuration.**
Provide a second environment and require the suite to pass on both with only an env-var change, verified by `git diff`.

**Cross-browser confusion.**
Give five WebKit-only failures, four caused by bad synchronization and one genuine engine difference. They must classify all five with evidence.

**Parallelism fear.**
Have them find the *maximum* worker count that is still stable, with measurements, and write a one-paragraph recommendation. Turns anxiety into an engineering exercise.

**Cannot debug.**
Trace-reading drills on unfamiliar failures, three per session, with a fixed report template: last action, DOM state, network anomaly, hypothesis.

**Cannot diagnose flakes.**
Five flaky tests, one per category. Require a written report per test: reproduction method, category, evidence, root cause, fix, verification run count. Grade the report, not the fix, on first submission.

**Learners who are ahead.**
Have them build the framework's *ergonomics*: a custom fixture that auto-attaches API request logs to the HTML report on failure; a flake register script that parses JSON results across runs and reports unstable tests; a `test.step`-based structure that makes traces self-documenting. All three are genuinely valuable and none of them races ahead of the syllabus.

---

## 9. Assessment guidance for this part

- **Grade justification as heavily as structure.** Require a short `DECISIONS.md` per assignment. A simpler design with clear reasoning outscores a complex one without.
- **Mechanical checks first:** locators outside page objects, `waitForTimeout`, hardcoded URLs and credentials, `.env` committed, UI login outside the login spec, `describe.serial` without an explanatory comment.
- **Always run `--workers=4 --repeat-each=3`.** Then run it again. Stability under parallelism is the headline criterion of this module.
- **Verify cleanup by inspecting the system after a failing run.** Orphaned records mean teardown is wrong regardless of what the code looks like.
- **For 6.6, grade the classification, not the pass rate.** Correctly identifying their own timing bug as their own is the objective.
- **For 6.9, require the verification run count.** A fix claimed on one passing run is not a fix.
- **Project 4 defense questions:** "Show me every place a locator appears." · "Which tests could not run in parallel, and why?" · "Walk me through diagnosing this failure using only the artifacts."

---

## 10. Pacing guidance

| Week | Sessions | Risk to watch |
|---|---|---|
| 20 | 6.1, 6.2 | Over-abstraction appears immediately; run Demo 3 early rather than late |
| 21 | 6.3, 6.4 | The highest-value week for suite quality; protect the data-collision demo |
| 22 | 6.5, 6.6 | Cross-browser failures cause discouragement; frame them as diagnosis practice |
| 23 | 6.7, 6.8 | Parallelism exposes every earlier shortcut; budget office hours |
| 24 | 6.9 + Project 4 kickoff | Flake work is open-ended; impose the time box explicitly |
| 25 | Project 4 lab and review | Run everyone's suite in parallel publicly; it is the most instructive review of the course |

If behind, compress 6.6 (cross-browser) — it is the most self-teachable. Never compress 6.4 or 6.9.

---

## 11. Transition into Part VII

Frame CI as the point where the framework stops being personal:

> "Everything you built works on your machine, with your Node version, your browsers, and your `.env` file. Part VII is about making it work on a machine that has none of those things, for a team that will not read your instructions. That means Git, a Jenkins pipeline, and a Docker image — and it means your configuration and secrets handling from 6.5 is about to be tested for real."

Also preview the Part VIII framing so the arc is visible: after CI, the course turns back to their own code and asks whether another engineer could maintain it — which is the last competency before the capstone.
