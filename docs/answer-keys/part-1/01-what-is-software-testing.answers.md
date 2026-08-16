# Answer Key — Chapter 1.1: What Is Software Testing?

[← Answer Keys](../overview.md) · [Chapter 1.1](../../part-1-testing-fundamentals/01-what-is-software-testing.md)

> **Instructor note:** Questions 1, 5, and 8 are the ones that predict later success in this course. A learner who gets 8 right has already internalized the professional stance the whole curriculum is built on; a learner who picks 8A or 8B needs a conversation, not a re-read.

---

## Question 1 — What "everything passed" means

**Correct answer: B** — Passing means the covered behaviors worked under the conditions tested; it says nothing about uncovered behaviors.

**Why:** This is Dijkstra's principle applied to a suite (Section C.4). A green result is a statement about the tests, not the software. The suite sampled some behaviors under some conditions; everything outside that sample is unknown, not verified.

**Why the others are wrong:**

- **A** — Rerunning tells you whether the suite is *stable*, which is a real and separate concern (it is how flakiness is detected, see [Chapter 6.9](../../part-6-framework-engineering/09-diagnosing-flaky-tests.md)). But a second green run does not expand coverage, so it does not address the flawed inference.
- **C** — Simply false. Regression suites detect functional defects; that is their purpose.
- **D** — Tempting, because it correctly narrows the claim to tested browsers. But it accepts the core error by still concluding "the release is safe." The browser limitation is one gap among many; the deeper problem is treating coverage as correctness.

**Reread if missed:** Section C.4, and Section D.1 for what this means when your CI pipeline posts a green check.

---

## Question 2 — Exhaustive testing of a small feature

**Correct answer: False.**

**Why:** The intuition behind "true" is that a checkbox has two states, so two tests exhaust it. That reasoning silently reduces the feature to its widget. Exhaustive testing means every combination of input, state, sequence, environment, and timing — and even for a checkbox that includes: initial state on load, state after a failed form submission, state after browser back-navigation, state when restored from a password manager or autofill, interaction with each other field on the form, keyboard versus mouse versus screen-reader activation, rapid double-toggling, state persistence across sessions, behavior when JavaScript is slow to load, and every browser and assistive technology combination.

The input space of a "trivial" feature is not small; it only looks small when you consider the widget in isolation rather than the system it lives in.

**Common wrong reasoning to address in discussion:** learners often argue that in practice two tests are *sufficient*. That is frequently correct and is a completely different claim. Sufficient sampling is the job (Section C.4); exhaustiveness is unavailable. Conflating "enough" with "all" is exactly the error that produces overclaiming later.

**Reread if missed:** Section C.4.

---

## Question 3 — Error, defect, failure

**Correct answers:**

| Item | Classification | Reasoning |
|---|---|---|
| i — A developer types `>` intending `>=` | **Error** | A human mistake — the action, not its consequence |
| ii — A customer with a $100.00 cart is charged $4.99 | **Failure** | The observable deviation experienced when the defect executes |
| iii — The comparison in `calculateShipping()` uses the wrong operator | **Defect** | The flaw resting in the artifact, whether or not anyone hits it |

**Why the order matters:** the chain runs error → defect → failure, and it is lossy at each step. An error may be caught before producing a defect. A defect produces a failure only when executed under the right conditions — this one requires a subtotal of exactly $100.00, which is why it survived to production.

**The practical point:** you observe (ii). You must then locate (iii). You can rarely know (i) without asking. This is why defect reports describe failures precisely and label hypotheses as hypotheses (Sections C.5 and E.2).

**Reread if missed:** Section C.5, then compare examples E.1 and E.2.

---

## Question 4 — Identifying the QA activity

**Correct answer: C** — Adding "error cases have acceptance criteria" to the definition of ready.

**Why:** It changes the *process* so that a class of defect becomes less likely in every future story. That is prevention, applied to the system that produces the product — the definition of QA (Section C.6).

**Why the others are QC:**

- **A** — Verifying a fix inspects a specific product artifact after the fact.
- **B** — Executing regression cases inspects tonight's build.
- **D** — Exploratory testing is skilled, valuable, and still detective: it examines an existing product.

**Discussion point worth raising:** all three QC options are valuable, and none is inferior. The distinction is not a ranking. But notice that C affects every story from now on, while A, B, and D each affect one build — which is why the QA/QC balance shifts as engineers become senior.

**Reread if missed:** Section C.6, including the paired sprint example.

---

## Question 5 — REQ-208

**Correct answer: B** — Verification succeeded; validation failed.

**Why:** The implementation matches the specification exactly, which is what verification asks (Section C.7). The specification itself fails to serve the customer — in-store purchasers get nagged, sold-out items get linked — which is a validation failure. Everything downstream of the wrong requirement was built correctly.

**Why the others are wrong:**

- **A** — Reversed. If you picked this, check the mnemonic: verification is "building the product **right**"; validation is "building the **right** product."
- **C** — Verification genuinely succeeded. Saying both failed erases the useful information that the code is faithful to its instructions, which is exactly what tells you the defect is in the requirement rather than the implementation.
- **D** — Nothing here concerns speed or load.

**The important follow-up:** ask why 23 passing automated tests could not have caught this. Because automated tests encode *your* expectations, they can only verify (Section D.2). Worse, once written they actively defend the wrong behavior — fixing the feature turns the suite red.

**Reread if missed:** Section C.7, then Sections D.2 and D.3.

---

## Question 6 — The cost curve applied to a requirements defect

**Correct answer: B** — Roughly 100× the requirements-stage cost, because artifacts, data, integrations, and customer expectations have accumulated on top of it.

**Why:** The multiplier comes from accumulation, not from the difficulty of the edit itself (Section C.8). By production, the wrong requirement has produced code, tests that enforce it, documentation, support training, data already stored in the wrong shape, integrations other teams built against it, and customers who have learned the current behavior.

**Why the others are wrong:**

- **A** — This is the most instructive wrong answer, because the premise is often true: the code change may be a single character. The cost is everything *around* the change — incident response, regression risk, data repair, coordination, communication. Learners who pick A are thinking about the fix; the curve is about the blast radius.
- **C** — Real usage does sometimes clarify the correct behavior, which is a genuine benefit. It does not make the total cost lower.
- **D** — Backwards. Requirements defects are the most expensive kind precisely because they are the earliest, so they have the longest time to accumulate dependents.

**Reread if missed:** Section C.8, then Section D.4 for how each practice in this course targets the curve.

---

## Question 7 — Why an unchanged suite loses value

**Correct answer: C** — Tests wear out (the pesticide paradox).

**Why:** Tests that have passed unchanged for eighteen months have demonstrated that this particular set of checks no longer finds anything. The code they cover has stabilized against them, exactly as insects develop resistance to a repeatedly-applied pesticide. The suite still has *regression* value — it will catch a reintroduction — but it has stopped discovering new defects (Section C.10, principle 5).

**Why the others are wrong:**

- **A** — Context-dependence concerns how much rigor a domain warrants, not decay over time.
- **B** — Clustering tells you *where* to look, not why unchanged tests stop yielding.
- **D** — The absence-of-errors fallacy is about building something correct that nobody wants.

**Nuance worth teaching:** the correct response is not to delete the suite. It is to keep it for regression protection while adding new cases, varying data, and rotating in new techniques — which is the practical argument for data-driven tests and factories in [Chapter 6.4](../../part-6-framework-engineering/04-test-data-management.md).

**Reread if missed:** Section C.10, principle 5.

---

## Question 8 — "Are we good to go?"

**Correct answer: C.**

**Why:** It does four things simultaneously, and each maps to something specific in the chapter:

1. **States coverage precisely** — purchase flow, both payment methods, all target browsers (Section C.3).
2. **States the gap and its cause without hedging** — refunds untested, sandbox down since Monday (Section C.11's out-of-scope discipline).
3. **Says "I don't know" where that is the truth**, instead of guessing in either direction.
4. **Returns the decision to the person who owns it**, with a concrete option attached (Section C.3, and Section C.9 on not being the gate).

**Why the others fail:**

- **A** — Technically true and functionally misleading. "Everything I tested passed" invites the listener to hear "everything passed." When refunds break in production, this sentence will be remembered as approval, and the credibility loss described in Section F.1 is permanent.
- **B** — Honest but takes on a decision that is not yours, and offers nothing actionable. It also frames a testing gap as a veto, which is the gate anti-pattern from Section C.9. Note that a manager hearing this may simply overrule it, and now the risk is undocumented as well as unmitigated.
- **D** — Boundary-defending. Even where organizationally accurate, it converts a known risk into someone else's problem without ensuring anyone is holding it. The refund flow is still shipping untested.

**Worth discussing with the cohort:** answer C is longer than the others, and beginners often assume brevity reads as confidence. In practice the specificity is what generates trust — a manager who receives C knows exactly what they are deciding. Have learners write their own version of C for a scenario from their own experience; the wording is a skill and it improves quickly with a single round of feedback.

**Reread if missed:** Sections C.3, C.9, C.11, and F.1.

---

## Exercise notes for instructors

### G.1 — Twenty things that could go wrong

There is no answer list; the exercise is diagnostic. What to look for:

- **Fewer than 15 items** — the learner is thinking about the widget, not the system. Prompt with the hints, then with "what if two people do this at once?"
- **All functional** — the most common outcome, and the point of Task C. Security and compatibility are the usual blind spots.
- **Task D mismatch** — nearly every learner finds that their first-thought items are not their highest-cost items. Make this explicit in discussion; it is the seed of risk-based prioritization in [Chapter 1.3](../../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md).

Strong answers usually include at least one of: the error message revealing whether an account exists (enumeration), session not invalidated on logout, and behavior on double-submit.

### G.2 — Twelve sprint activities

| # | Activity | Classification | Notes |
|---|---|---|---|
| 1 | Executing 40 regression cases | **QC** | Inspecting a specific build |
| 2 | Adding to the definition of ready | **QA** | Changes the process for all future stories |
| 3 | Reviewing a PR for null handling | **Both** | Detects a defect in this PR (QC) *and* is a standing process control (QA) |
| 4 | Verifying a bug fix | **QC** | Product inspection |
| 5 | Retrospective on escaped defects | **QA** | Improves the process, not the product |
| 6 | Writing an automated test | **Both** | Building it is a process investment (QA); each run is detection (QC) |
| 7 | CI blocking merges on failure | **QA** | A preventive control — defects cannot reach main |
| 8 | Asking in refinement about stacking | **QA** | Prevention at the cheapest point on the curve |
| 9 | Exploratory testing | **QC** | Skilled detection, still detection |
| 10 | Naming convention for test files | **QA** | Process standard |
| 11 | Triaging 60 open defects | **Both** | Product decisions (QC) driven by process/risk policy (QA); accept either with good reasoning |
| 12 | Investigating a local-pass/CI-fail | **Both** | Diagnosing this test (QC) while usually exposing an environment or isolation defect worth fixing systemically (QA) |

The four intentionally ambiguous ones are 3, 6, 11, and 12. **Accept any label with sound reasoning** — the objective is that learners can articulate the preventive-versus-detective axis, not that they memorize a table.

**Highest value-to-effort:** items 8 and 2 are the expected answers, both operating at the 1× column of the cost curve for essentially zero cost. Item 7 is a strong third and some learners will argue for it convincingly (a one-time configuration that prevents an entire class of escape forever); accept it with a cost-curve justification.

### G.3 — REQ-301

**Task A — contradictions and gaps.** At least five exist; three are required.

1. **Clause 2 versus clauses 1 and 3.** Codes cannot combine with any other discount; Gold customers automatically have a discount; all customers may apply a code. A Gold customer applying a code simultaneously satisfies clause 3 and violates clause 2, with no precedence rule. *Scenario:* Gold customer, $200 cart, applies `SAVE10`. Nothing in the document says what should happen.
2. **Clause 4's ordering ambiguity.** "After discounts" — which discounts, and in what order? A $110 cart with 15% Gold falls to $93.50, losing free shipping. Is that intended? A customer whose loyalty benefit costs them free shipping will contact support, and the document does not say whether that is correct.
3. **Clause 5 versus clause 2.** Showing the Gold discount as a separate line implies it *is* a discount, which strengthens the clause 2 conflict. If it were a price adjustment rather than a discount, clause 2 might not bite — the document never defines the term "discount."
4. **Gap: rounding.** 15% of $10.01 is $1.5015. No rounding rule is specified anywhere.
5. **Gap: tier changes mid-order.** If a customer becomes Gold between adding to cart and paying, which applies? Common in practice, absent from the spec.

**Task B — the trap.** Most learners write "verification failed." Push back: **you cannot verify against a self-contradictory requirement.** The implementation satisfies clauses 1, 3, 4, and 5 and violates clause 2 — and clause 2 cannot be satisfied while clauses 1 and 3 both hold. The correct verification result is *undeterminable for this scenario, because the specification is inconsistent.* Learners who reach this on their own have understood Section C.7 at a level most working testers have not.

The validation finding is separate and unambiguous: stacked discounts on every Gold order is uncapped margin loss, exploitable and quantifiable.

**Task C — the message.** Assess on: does it name the specific scenario (Gold + code) rather than "a contradiction"; does it quantify or say what quantification needs (how many Gold customers, average order value, code redemption rate); does it offer two or more options (precedence rule making Gold exclusive of codes / permit stacking with a cap / treat Gold as a price adjustment outside clause 2); is it blame-free. Under 200 words is part of the grade — verbosity here reads as uncertainty.

**Task D — cost.** Found at the testing stage, roughly 25×. Findable in refinement at 1× by one person reading five clauses side by side and asking "what happens if a Gold customer applies a code?" That question costs about ninety seconds. This is the entire argument of Section C.8 in one exercise, and it is worth stating plainly in the debrief.

---

## Assignment 1.1 — grading notes

The charter deliverable is graded on the rubric in the chapter. Three observations from running this assignment:

**The out-of-scope section separates the cohort immediately.** Weak submissions list things they simply did not get to. Strong submissions distinguish *cannot* (sandbox unavailable, behavior unspecified) from *chose not to* (mobile deferred to next sprint), and give a reason for each. Only the strong version converts a gap into a decision someone else can make.

**Requirement 7 — the requirements gap — is the single best predictor of a learner's later performance.** REQ-410 to REQ-415 omit several things: rounding direction on percentage discounts, whether a code can be applied then replaced, what happens when a discount drops the subtotal below a code's own minimum spend, case sensitivity, whitespace handling, and whether expiry is evaluated at application time or at payment time. Learners who find the minimum-spend circularity have shown genuine analytical instinct and should be told so.

**Watch for uncheckable in-scope items.** "Verify discounts work correctly" and "verify the UI is user-friendly" are the usual offenders. The test to apply: could a colleague perform this item and produce a pass or fail without asking you what you meant? If not, it fails requirement 2.

Common deductions: in-scope items that restate the requirements verbatim without adding boundary or interaction cases; three risks that are really three restatements of one risk; a page and a half.
