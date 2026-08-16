# 05 — Generative AI Policy

[← Back to Table of Contents](../README.md)

---

## 1. Position

AI assistants are now part of the professional QA automation toolchain. Pretending otherwise would train you for a job that no longer exists. Letting them write your code for you would train you for no job at all.

This course's position is deliberate:

> **Use AI as an engineering assistant, not as a replacement for engineering understanding.**

The distinction is practical, not moral. An engineer who understands the code can accept AI output, reject it, or repair it. An engineer who does not understand it can only paste it and hope. The second engineer is unemployable the first time a suite goes red in production and the AI's suggestion does not work.

A useful test before you accept any AI-generated line:

> **Could I have written this myself, given enough time? Can I explain why it is correct? Can I predict what breaks if I change it?**

If the answer to any of those is no, you are not ready to accept it yet — ask the AI to explain it instead.

---

## 2. Allowed uses

These are encouraged. Use them freely, throughout the course, including on graded assignments unless a specific assignment says otherwise.

| Allowed | Example prompt |
|---|---|
| **Asking AI to explain a concept** | "Explain what a Promise is as if I have never programmed, and give a QA example." |
| **Asking for a hint, not a solution** | "I'm stuck on Exercise 2.8-3. Give me a hint about which array method to consider, but do not write the code." |
| **Asking for debugging guidance** | "My Playwright test fails with 'locator resolved to 2 elements'. What does that mean and what should I check?" |
| **Asking for alternative approaches** | "I solved this with a `for` loop. What are two other approaches, and what are the trade-offs?" |
| **Explaining an error message** | "What does `TS2532: Object is possibly 'undefined'` mean and why is TypeScript protecting me here?" |
| **Code review after your own attempt** | "Here is my page object. I already refactored it once. Critique its responsibilities and naming." |
| **Generating practice problems** | "Give me five more exercises on `reduce` using test-result data, with no solutions." |
| **Explaining unfamiliar code you must read** | "Walk me through what this fixture does, line by line." |
| **Documentation and prose help** | "Review my README for clarity." |
| **Naming and refactoring suggestions** | "Suggest three clearer names for this function and explain the trade-offs." |

The pattern in every allowed use: **you do the thinking, AI accelerates the learning.**

---

## 3. Restricted uses

These are violations of the academic integrity policy in [04 — Assessment Strategy](04-assessment-strategy.md#10-academic-integrity).

| Restricted | Why it is restricted |
|---|---|
| **Generating an entire assignment and submitting it unchanged** | You learn nothing, and the defense question in grading will expose it immediately. |
| **Copying solutions you do not understand** | Creates a false sense of progress that collapses in Part V and VI, where nothing works without understanding. |
| **Using AI during quizzes and assessments where explicitly prohibited** | Quizzes measure your retention, which is the one thing AI cannot supply during a production incident. |
| **Asking AI to complete the capstone without meaningful involvement** | The capstone is the certification artifact. An AI-authored capstone certifies the AI. |
| **Generating tests without verifying they can fail** | AI happily produces plausible-looking assertions that never fail. Submitting them violates the correctness criterion. |
| **Pasting proprietary application code, credentials, or customer data into a public AI tool** | This is a real-world firing offense, not just a course rule. Practice the habit now. |
| **Asking AI to write your AI usage log** | Self-explanatory. |

### The unchanged-output rule

You may use AI-generated code in your submission **only if you can pass all three checks**:

1. You can explain every line, including what happens if it is removed.
2. You have verified it behaves as claimed — including making the test fail on purpose.
3. You have adapted it to this project's conventions (naming, layering, types), not pasted it raw.

---

## 4. Required AI usage

Some assignments require you to use AI *and document it*. The goal is to build a professional habit: deliberate, reviewed, accountable tool use.

### Assignments requiring an AI usage log

| Assignment | Required AI task |
|---|---|
| Chapter 2.12 (Async) coding assignment | Ask AI to explain your own bug before fixing it; log the explanation and whether it was right |
| Chapter 5.5 (Synchronization) assignment | Ask AI for three ways to remove a hard wait; evaluate and reject at least one |
| Chapter 6.9 (Flaky tests) assignment | Ask AI to hypothesize causes of a supplied flaky test; verify each hypothesis empirically |
| Project 3 (API automation) | Use AI for one refactor of your API client; document what you kept and what you reverted |
| Project 4 (Web automation) | Use AI to review your locators; document accepted and rejected suggestions |
| Chapter 8.2 (Code review) assignment | Review the supplied PR yourself first, then compare your findings against AI's; document what each of you missed |
| Capstone | Full AI usage log across the project, plus a written reflection |

### AI usage log format

Submit as `AI-USAGE.md` in the repository root. One entry per meaningful interaction.

```markdown
## Entry 3 — Removing a hard wait from the checkout test

**Date:** 2026-03-14
**Context:** `tests/web/checkout.spec.ts` was passing locally and failing in CI. I had
added `await page.waitForTimeout(3000)` after clicking "Place Order" to make it pass.

**What I asked:**
> "This Playwright test only passes if I add waitForTimeout(3000) after clicking
> Place Order. What are better ways to synchronize on the order confirmation
> appearing, and what are the trade-offs of each?"

**What AI suggested:**
1. `await expect(page.getByText('Order confirmed')).toBeVisible()` — web-first assertion
2. `await page.waitForResponse(r => r.url().includes('/api/orders') && r.status() === 201)`
3. `await page.waitForLoadState('networkidle')`

**What I accepted:** Suggestion 1, as the primary synchronization point.

**What I rejected:** Suggestion 3. `networkidle` is discouraged in Playwright's own docs
and would have coupled my test to unrelated background requests (analytics polling on
this page never goes idle). I confirmed this by watching the Network tab.

**What I changed:** I combined 1 and 2 differently from the suggestion — I wait for the
POST /api/orders response to capture the generated order ID, then assert the
confirmation text is visible. AI's version discarded the order ID, but I needed it for
the follow-up API verification of the order record.

**Why:** The assertion is the real synchronization point because it retries until the
timeout. Waiting on the response additionally gives me the ID so my API-layer
verification does not have to scrape it from the DOM.

**Verification:** Removed the waitForTimeout, ran the test 10 times locally
(`--repeat-each=10`) and 3 times in CI: 13/13 passes. Then I broke the confirmation
text in the app on purpose and confirmed the test fails with a useful message.
```

### What is graded in the log

| Criterion | What earns full marks |
|---|---|
| **Specificity** | Actual prompts and actual responses, not "I asked AI about waits" |
| **Evidence of judgment** | At least one rejected suggestion with a technical reason |
| **Evidence of adaptation** | You changed something, and explain why your version is better *for this context* |
| **Verification** | You proved the accepted code works, including proving it can fail |
| **Honesty** | Entries where AI was wrong, or where you accepted something and later reverted it, score *higher*, not lower |

---

## 5. Guidance by course stage

The right way to use AI changes as your competence grows.

| Stage | Recommended posture |
|---|---|
| **Part I** (testing theory) | Use freely to explain concepts, generate practice scenarios, and quiz yourself. Low risk: there is no code to copy. |
| **Part II** (programming) | **Most restrictive stage.** Never ask for solution code to an exercise. Ask for explanations, hints, and extra practice problems. If you skip the struggle here, nothing later works. |
| **Part III** (automation principles) | Use it as a debate partner: "argue against my claim that this test is isolated." |
| **Part IV-V** (API and Web) | Use for explaining Playwright errors and comparing approaches. Do not let it author your tests; the point is learning to design them. |
| **Part VI** (framework) | Use for critique of your design. Ask it to attack your architecture, then decide which attacks are valid. |
| **Part VII** (CI/CD) | Most permissive stage for generation. Pipeline and Dockerfile boilerplate is legitimate AI territory — but you must be able to explain every stage and every layer. |
| **Part VIII + capstone** | Use as a code reviewer and rubber duck. All output requires the three-check rule and a log entry. |

---

## 6. What AI is genuinely bad at in QA automation

Knowing the failure modes is part of using the tool well. Expect and check for these.

| AI weakness | What it looks like | Your countermeasure |
|---|---|---|
| **Inventing locators** | Confident `page.getByTestId('checkout-btn')` for an element that has no such test ID | Always verify against the real DOM |
| **Producing tests that cannot fail** | Assertions on things that are always true, or a `try/catch` that swallows the failure | Break the app on purpose and confirm a red test |
| **Recommending hard waits** | `waitForTimeout` appears in a lot of training data | Apply Chapter 5.5 rules regardless of what it suggests |
| **Outdated API usage** | Deprecated Playwright methods, or Selenium idioms in Playwright code | Check [playwright.dev](https://playwright.dev) |
| **Over-abstraction** | A five-class hierarchy for two pages | Apply Chapter 6.1's over-abstraction warnings |
| **Ignoring your architecture** | Test-layer code that reaches straight into raw locators, bypassing your page objects | Give it your conventions in the prompt, and review for layer violations |
| **Missing negative cases** | Only happy-path tests unless asked | Design your test set yourself using Chapter 4.3 |
| **Plausible nonsense about flakiness** | "Add a retry" as a root-cause fix | Chapter 6.9: diagnose before mitigating |

---

## 7. Instructor guidance

- **Assume AI is present.** Design assignments whose value survives it: defenses, logs, "make this test fail" exercises, and live debugging of *unfamiliar* code.
- **Grade the explanation, not just the artifact.** The universal defense question ("what happens if I delete line N?") is the single most effective integrity control in this course.
- **Watch for the tell.** A learner whose code quality far exceeds their verbal fluency is not cheating maliciously; they are usually stuck and hiding it. Respond with remediation, not accusation — see each part's `instructor-notes.md`.
- **Run at least one AI-forbidden session per part**, in class, on paper or with the network off. It calibrates learners honestly and surfaces gaps early.
- **Model good usage live.** Show a real prompt, a wrong AI answer, and your reasoning for rejecting it. Learners copy what instructors do, not what policies say.

---

## 8. Summary

| | |
|---|---|
| **Always allowed** | Explanations, hints, debugging guidance, alternatives, error-message decoding, post-attempt review, extra practice problems |
| **Never allowed** | Submitting unexplainable code, using AI where prohibited in assessments, pasting secrets or proprietary code, AI-authored capstone |
| **Sometimes required** | Documented AI collaboration with accepted/rejected decisions and verification, in `AI-USAGE.md` |
| **The one rule that matters** | If you cannot explain it and cannot make it fail on purpose, it does not go in your submission |
