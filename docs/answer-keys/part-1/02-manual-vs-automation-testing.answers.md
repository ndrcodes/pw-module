# Answer Key — Chapter 1.2: Manual Testing vs Test Automation

[← Answer Keys](../overview.md) · [Chapter 1.2](../../part-1-testing-fundamentals/02-manual-vs-automation-testing.md)

> **Instructor note:** Questions 3, 6, and 8 are the ones that matter. A learner who answers all three correctly can already reason about automation as an investment decision, which is unusual at this stage and worth naming out loud. Question 4 is the one that produces audible surprise; do the arithmetic on the board.

---

## Question 1 — What automation replaces

**Correct answer: B** — Scripted manual execution.

**Why:** Automation performs predetermined steps and compares results to documented expectations. That is exactly what scripted manual execution is, and it is the only one of these four activities a machine can take over (Section C.2).

**Why the others are wrong:**

- **A** — "Manual testing" bundles two different activities. Automation replaces one of them. Answering A is the everyday error that leads teams to expect headcount savings that never arrive.
- **C** — Exploratory testing requires deciding what to try next based on what just happened. Automation cannot do this; it executes decisions already made.
- **D** — Test design is the human work of choosing what to check. Automation executes designs; it does not produce them. (AI tools now generate plausible test code, which is not the same as designing the right tests — see the AI notes in [Chapter 4.3](../../part-4-api-testing-and-automation/03-designing-api-test-cases.md).)

**Reread if missed:** Section C.2, particularly the comparison table.

---

## Question 2 — "If it can be automated, it should be"

**Correct answer: False.**

**Why:** Automation carries a permanent maintenance cost. Whether it is worthwhile depends on execution frequency, interface stability, and how objective the expected result is (Sections C.5-C.8). Section C.6 shows the same 30 tests being correct to automate at fortnightly releases and a permanent net loss at quarterly releases — identical technical feasibility, opposite correct decisions.

**The reasoning to correct in discussion:** learners often defend "true" on the grounds that automation eventually pays off. It does not eventually pay off; it pays off if the run frequency is high enough to amortize authoring plus recurring maintenance. When ongoing annual cost exceeds annual manual cost, there is no payback horizon at all — the lines never cross.

**Reread if missed:** Section C.6, especially the quarterly-release recalculation.

---

## Question 3 — The twice-yearly release suite

**Correct answer: C** — Keep manual; 12 hours per year of manual execution is less than the ongoing annual automation cost, and the 75-hour investment never pays back.

**The arithmetic:**

```text
Manual:      6 h × 2 releases/year          = 12 h/year

Automation:  authoring 30 × 2.5 h           = 75 h  (one-time)
             maintenance 75 × 40%           = 30 h/year
             execution + triage (2 runs)    ≈  1 h/year
             ongoing                        ≈ 31 h/year
```

Automation costs about 31 hours a year forever to replace 12 hours a year of manual work, after a 75-hour investment. The cumulative gap widens every year; there is no break-even point.

**Why the others are wrong:**

- **A** — "Automation is always cheaper over time" is the belief this question exists to break. It is only cheaper when run frequency amortizes the recurring cost.
- **B** — True as a general statement about scale and irrelevant here. Twelve hours a year does not need to scale.
- **D** — Automating the UI tests specifically is the *worst* subset: UI tests carry the highest maintenance rate (30-50%), so this maximizes recurring cost.

**Worth adding in discussion:** the correct answer can change without any of these numbers changing. If this suite guards revenue-critical behavior and a defect escaping would cost $50,000, the risk-reduction value may justify automating even at a labor loss. Learners who raise this have understood the model well enough to see past it — accept the argument, but require them to state the risk value they are trading against, because "it's important" without a number is how the 60-hour budget in Assignment 1.2 gets blown.

**Reread if missed:** Section C.6.

---

## Question 4 — Flakiness compounding

**Correct answer: D** — Essentially never, about 0.0035% of runs.

**The arithmetic:** each test independently passes with probability 0.95, so a clean run of 200 tests has probability `0.95²⁰⁰ ≈ 0.0000350`, or 0.0035%. Roughly 1 run in 28,000.

**Why the others are wrong:**

- **A** — 95% is the per-test rate, applied to the suite. This is the intuitive answer and it is wrong by four orders of magnitude.
- **B** — About 36% is `0.95²⁰`, a 20-test suite. Useful to show on the board: even 20 tests at 5% flake pass cleanly only a third of the time.
- **C** — 5% is the per-test failure rate, not a suite probability.

**Why this is the most important number in the chapter:** it is the mathematical reason flakiness is treated as a first-order defect throughout this course rather than an annoyance to be worked around. A 5% flake rate sounds tolerable per test and is fatal at suite scale. It is also why [Project 4](../../projects/project-4-web-automation.md) applies a flat 25% deduction for a single `waitForTimeout` — hard waits are the most common source of exactly this failure mode.

Worth working through the inverse in class: for a 200-test suite to pass cleanly 95% of the time, each test needs a false-failure rate below about **0.026%** — roughly 1 run in 3,900. That is the standard a trustworthy suite is actually held to.

**Reread if missed:** Section C.7 on the maintenance multiplier, then Section C.9.

---

## Question 5 — The strongest argument to a manager

**Correct answer: B** — It moves defect detection from days to minutes, which reduces the cost of each defect.

**Why:** It is the benefit that is real, defensible, and directly connected to the cost-of-defect curve from [Chapter 1.1](../../part-1-testing-fundamentals/01-what-is-software-testing.md). It also survives contact with reality — you can demonstrate it within weeks (Section D.2).

**Why the others fail:**

- **A** — The most common pitch and the most damaging. It promises a saving that will not materialize because exploratory work remains, and it sets a benchmark you will be judged against. See Section F.1.
- **C** — Test count is a gameable metric that rewards duplication and low-risk coverage. Proposing it invites the anti-pattern in Section D.3.
- **D** — Partially true and misleading in a specific way. Automation removes *execution* inconsistency but introduces new error classes: wrong assertions, flaky synchronization, tests that cannot fail. The human error moves rather than disappearing.

**Reread if missed:** Sections D.2 and D.3.

---

## Question 6 — Redesign coming, API stable

**Correct answer: C** — Automate the business rules at the API layer now; defer the UI tests with the redesign as the trigger.

**Why:** It gets coverage where the actual financial risk lives, at the layer that the redesign will not touch, while avoiding work that would be discarded. It also produces a deferral with a real trigger rather than an indefinite gap (Sections C.7, C.8, E.2).

**Why the others are wrong:**

- **A** — Automating a churning UI is Section F.2. Most of the suite would be rewritten within a sprint or two, and the usual organizational consequence is worse than the wasted hours: the team concludes automation is unreliable and blocks the investment that would have paid off.
- **B** — Waiting leaves revenue-critical business rules untested for a month or more when a stable interface for testing them is sitting right there. Deferral should be targeted, not total.
- **D** — Redesigns recurring is an argument for testing below the UI, not for abandoning automation. This answer generalizes a real observation into the wrong conclusion.

**The generalizable lesson:** when asked whether to automate, the useful question is rarely "yes or no" but "at which layer, and what do I defer." This is the bridge into [Chapter 1.3](../../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md).

**Reread if missed:** Sections C.7, C.8, and example E.2's third row.

---

## Question 7 — The value of an untrusted suite

**Correct answer: C** — Negative value: it consumes cost, hides real failures in noise, and suppresses the manual testing that would have caught them.

**Why:** All four cost components continue to be paid, detection approaches zero because red is treated as noise, and — the part that makes it actively harmful — the team believes it is covered, so the exploratory and manual testing that would have found the defect does not happen (Section C.9).

**Why the others are wrong:**

- **A** — The intuitive answer: some tests must be better than none. It misses that a false signal is worse than no signal, because decisions get made on it.
- **B** — Closer, and still too generous. "Same as no suite" ignores both the ongoing cost and the false assurance.
- **D** — Test count is irrelevant to trust. More flaky tests is strictly worse, which is the inverse of what this answer implies.

**Discussion prompt that lands well:** ask the cohort what happens on a team where the suite fails 40% of the time for unrelated reasons, and a genuine defect appears in one of those failures. Someone always says "you'd rerun it." That is the answer — and the defect ships. This is the concrete mechanism behind "10 trustworthy tests beat 300 unreliable ones."

**Reread if missed:** Section C.9, then Question 4's arithmetic for how a suite gets into this state.

---

## Question 8 — "Can you have it fully automated by the end of the sprint?"

**Correct answer: C.**

**Why:** It declines the impossible commitment, explains the reason in terms of cost rather than difficulty, offers a concrete alternative that covers the real risk this sprint, provides interim coverage through a manual charter, records a triggered deferral, and — the detail that distinguishes an experienced engineer — asks for something from the developers while asking is still cheap (Sections D.1, C.8, and the G.3 hint).

**Why the others fail:**

- **A** — Agreeing to something you know is unachievable. The sprint ends with a third of the cases covered by tests that are already breaking, and your estimates are not trusted again for a long time.
- **B** — Accurate and useless. It gives the manager no path forward and reads as obstruction. Beginners often think brevity signals confidence; here it signals unwillingness.
- **D** — Frames automation as a capability the team lacks rather than a decision with alternatives, and offers nothing for this sprint. It also quietly accepts an untested revenue-relevant module.

**Worth drilling:** have each learner write their own version of C for a request from their own experience, then read two aloud. The structure — decline, explain in cost terms, offer a scoped alternative, defer with a trigger, ask for what you need — is a reusable template, and it transfers to almost every awkward conversation in this job.

**Reread if missed:** Sections D.1, C.8, and F.7.

---

## Exercise notes for instructors

### G.1 — Sort ten cases

Defensible verdicts. Reasoning matters more than the label; several cases have more than one acceptable answer.

| # | Case | Verdict | Notes |
|---|---|---|---|
| 1 | Subtotal updates on quantity change | **Automate now** | Objective, frequent, high value. Cheapest at the API layer |
| 2 | Product image not stretched or distorted | **Keep manual** | Human judgment. Visual regression tooling is *possible*; see task B |
| 3 | Order A not visible to customer B | **Automate now** | Security-critical, objective, trivial at the API layer, catastrophic if it regresses |
| 4 | Checkout button disabled during processing | **Automate now** | Objective, genuinely requires the UI. Accept "defer" if a learner argues it is timing-sensitive and prone to flake — that is a sophisticated concern, and the answer in [Chapter 5.4](../../part-5-web-automation-playwright/04-web-assertions.md) is that web-first assertions handle it |
| 5 | Wishlist behind a flag, may be cancelled | **Defer** | Trigger: when the feature is confirmed and the flag removed |
| 6 | Confirmation email arrives with order number | **Automate now** *(if infrastructure exists)* | Objective and valuable; requires a mail-catching service. **Defer** with trigger "when a test mailbox is available" is equally correct and often more honest |
| 7 | Password reset end to end, including the emailed link | **Automate now** or **Defer** | Same infrastructure dependency as case 6. Either verdict is fine with the dependency named |
| 8 | Usable with a screen reader | **Keep manual** | Automated a11y scanners catch a subset of rule violations; "usable" is a human judgment. See task B |
| 9 | Shipping across 15 weight/destination/speed combinations | **Automate now** | The strongest candidate on the list. Data-driven, tedious, error-prone by hand, pure API |
| 10 | One-time migration verification before Thursday | **Keep manual** | Runs once. Authoring can never amortize |

**Task A — cases that belong at the API layer:** 1, 3, 9, and typically 6 and 7 (the trigger and verification are API/mail-level; only the reset form itself needs a browser). At least four, as stated. Learners who also spot that case 1's *badge display* needs the UI while its *calculation* does not have understood the layering idea before Chapter 1.3 introduces it — call that out.

**Task B — the partial-automation question.** This is the most valuable discussion in the exercise, and the answer is genuinely nuanced:

- **Case 8:** an automated accessibility scan reliably catches missing alt text, insufficient contrast, absent form labels, and invalid ARIA. It cannot tell you whether the flow is *navigable* by someone using a screen reader. Correct position: automate the rule checks as a fast guard, keep manual assistive-technology testing for usability. Both, not either.
- **Case 2:** screenshot comparison can detect that an image's rendered aspect ratio changed. It is also a well-known source of false failures — font rendering, antialiasing, animation timing, platform differences. Defensible position: automate an aspect-ratio assertion (objective, stable) rather than a pixel comparison (subjective, fragile). Learners who reach this distinction have found the actual principle: **automate the objective sub-check, not the subjective whole.**

### G.2 — The break-even model

**Task A:**

```text
Manual:        5 h × 12 releases              =  60.0 h/year  = $3,600

Automation, year 1:
  Authoring    40 cases × 2 h                 =  80.0 h
  Maintenance  80 × 25%                       =  20.0 h
  Execution    (8/60) h × 12                  =   1.6 h
  Triage       (15/60) h × 12                 =   3.0 h
                                                 --------
                                                 104.6 h     = $6,276

Ongoing annual: 20.0 + 1.6 + 3.0             =  24.6 h/year  = $1,476

Cumulative position:
  Year 1:  104.6 vs 60.0    -> automation behind by 44.6 h
  Year 2:  129.2 vs 120.0   -> behind by 9.2 h
  Year 3:  153.8 vs 180.0   -> ahead by 26.2 h
```

**Task B:** Annual saving after year one is `60.0 − 24.6 = 35.4 h`, about 2.95 h/month. The year-one deficit of 44.6 h clears in roughly 15 months of ongoing operation, so break-even is at about **27 months** from the start. Accept 26-28 months. The rounding assumption to be explicit about is whether maintenance is treated as accruing evenly through the year or in bursts around releases — it moves the answer by a month or two, and the point is that learners state which they assumed.

**Task C — sensitivity:**

| Change | Ongoing annual | Manual annual | Effect |
|---|---|---|---|
| Weekly (52 releases) | ~34 h | 260 h | Break-even inside year one. **Automate, clearly** |
| Quarterly (4 releases) | ~22 h | 20 h | Never pays back. **Keep manual** |
| Maintenance 50% | 44.6 h | 60 h | Saves 15.4 h/year against an 80 h investment; break-even ≈ year 7. **Marginal at best** |
| Authoring 4 h/case | 40 h ongoing, 160 h year-one investment | 60 h | Saves 20 h/year against 160 h. **Roughly 9 years. No** |

**Release frequency changes the recommendation most**, and it does so in both directions. The mechanism is worth stating explicitly: frequency multiplies the *benefit* while barely touching the cost, whereas the other three variables scale the cost against a fixed benefit. This is why "how often does this run?" is the first question to ask about any automation candidate.

**Task D — the point of the exercise.** The three genuinely unreliable inputs, and the evidence that firms each up:

1. **Authoring at 2 h/case.** Almost always optimistic, because it omits stabilization. Evidence: automate five representative cases and measure, then extrapolate. This is the single best use of a spike.
2. **Maintenance at 25%.** A guess until you have history. Evidence: track hours spent fixing tests for two quarters. Until then, state it as a range and show the recommendation at both ends.
3. **Triage at 15 min/run.** Depends entirely on flakiness, which does not exist yet. Evidence: measure after the suite has run for a month. Note that this figure is the one most likely to be understated by an order of magnitude.

Also creditable: manual execution time of 5 h is probably measured on a good day with no defects found; the 40 cases may not all be independently valuable; and the model ignores the CI infrastructure that does not yet exist.

Learners who produce a tidy answer to A and B but nothing substantive for D have done arithmetic rather than analysis. Grade accordingly, and say why — this is the task that transfers to real work.

### G.3 — The recommendation memo

Assess on whether the memo splits by layer and includes the ask. A strong submission contains, in some form:

- **Automate now (~24 of 30 hours):** checkout business rules at the API layer — pricing, discount application order, the REQ-114 shipping threshold with boundary cases, tax on post-discount subtotal, order creation, and the authorization check that one customer cannot see another's order. These are where the revenue risk lives and the redesign does not touch them.
- **Defer (trigger: redesign ships and stabilizes):** UI end-to-end journeys, checkout form validation through the browser, visual checks.
- **Permanently manual:** exploratory passes on the new design, message tone and clarity, layout judgment, and the first pass over any newly introduced flow.
- **The ask (~2-4 hours of the budget):** `data-testid` attributes added during the redesign, a stable staging environment, a test-data strategy for checkout accounts, and a review slot on the new design for testability. Getting this in *before* the design is final is the highest-leverage thing available in the ten weeks.
- **Accepted risk, stated plainly:** the UI itself is unautomated for the next quarter; a break in the browser flow would be caught by manual regression at release time, not by CI. Say the words.

**Common failure modes:** recommending full UI automation now (misses F.2); recommending nothing (leaves revenue rules untested when a stable interface exists); omitting the ask (the tell that separates learners who have absorbed D.1 from those who have read it); deferrals without triggers; and burying the accepted risk in a subordinate clause rather than stating it.

---

## Assignment 1.2 — grading notes

**The three classifications to watch.** Case 6 (image distortion) should be keep-manual; case 11 (15 shipping combinations) is the strongest automate-now candidate on the list and should be recognized as data-driven at the API layer; case 19 (confirmation email) requires infrastructure that does not exist, so the honest answer is defer-with-trigger. Learners who classify all three well have understood the chapter.

**The 60-hour constraint is the assessment.** A submission that classifies 17 cases as automate-now and quietly exceeds capacity has failed requirement 9, regardless of how good the reasoning is per case. Prioritization under constraint is the skill; look for explicit cuts with stated reasons.

**Requirement 7 catches the most people.** There is no CI pipeline, which means the plan must either include the hours to build one or explicitly note that the suite runs locally until Part VII delivers a pipeline. Learners who cost automation as though CI is free have made the classic Section F.4 omission at a smaller scale.

**Requirement 12, six-month metrics.** Anything resembling "number of automated tests" fails this outright — Section D.3 is explicit. Strong answers name escaped defects in the checkout path, time from commit to feedback, suite pass-rate stability, and hours per month spent on maintenance versus the 25-30% estimate.

**Expected layer distribution.** Of the 20 cases, at least 8 should be at the API layer; 10-12 is a better answer. Cases 1, 2, 3, 4, 5, 8, 10, 11, 12, 13, 14, 15, 18, and 20 all have API-layer paths. Genuinely UI-dependent: 7 (badge display), 9 (empty-cart state), 16 (form validation display), 17 (decline message display). Learners who put everything through the browser have not yet internalized cost, and they will find [Chapter 1.3](../../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md) corrective.
