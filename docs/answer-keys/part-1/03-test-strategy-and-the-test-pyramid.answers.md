# Answer Key — Chapter 1.3: Test Strategy and the Test Pyramid

[← Answer Keys](../overview.md) · [Chapter 1.3](../../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md)

> **Instructor note:** Questions 3, 4, 6, and 9 are the ones that reveal whether placement has actually landed. Question 4 in particular separates learners who understand *what each layer proves* from those who have memorized a hierarchy. Exercise G.2 is the single most transferable activity in Part I — if session time is short, cut G.1 and keep G.2.

---

## Question 1 — What the pyramid argues

**Correct answer: B** — The cost, speed, stability, and diagnostic precision of tests at different distances from the code.

**Why:** The shape is a consequence, not the claim. The claim is that distance from the code degrades four properties simultaneously, so cheap precise tests are worth buying in bulk and expensive imprecise ones are not (Section C.1).

**Why the others are wrong:**

- **A** — The most common answer and the reason the pyramid is so often misapplied. Ratios are a symptom of good placement, never a target. See Section F.1.
- **C** — Writing order is a separate question (and one where reasonable people disagree, e.g. outside-in versus inside-out).
- **D** — Ownership correlates with layers in most organizations and is not what the pyramid is about. It is, however, the source of the practical difficulty in Section D.1.

**Reread if missed:** Section C.1, then C.4 for the argument in numbers.

---

## Question 2 — Is 70/20/10 by definition well designed?

**Correct answer: False.**

**Why:** The ratio describes the distribution of tests, not their placement. A suite can hit 70/20/10 perfectly and still be badly designed in at least three ways: the unit tests cover trivial getters and framework glue rather than the risky logic; the UI tests each verify twelve things at once; or the whole allocation ignores the highest-risk behaviors entirely.

The inverse is also true and worth stating in discussion: a suite at 50/35/15 where every check sits at the cheapest layer that can genuinely verify it is *correctly designed*, and the ratio is simply not interesting.

**The diagnostic question** to substitute for counting: pick ten tests at random and ask, for each, "could a cheaper layer have verified this?" The answers tell you more than any ratio.

**Reread if missed:** Sections C.1 and F.1.

---

## Question 3 — Five unit tests plus one UI test

**Correct answer: B** — Defense in depth: the unit tests verify the arithmetic, the UI test verifies that the correct value reaches the customer.

**Why:** The two layers make different claims. The unit tests establish that the threshold logic is right at every boundary. The UI test establishes that the computed value survives serialization, transport, caching, and rendering to appear in front of a human. Neither can catch the other's failure (Section C.7).

**Why the others are wrong:**

- **A** — Applies the anti-duplication rule mechanically. The test for waste is whether you can name a failure each check catches that the others would not. Here you can: a rounding error at $99.995 (unit only) and a page rendering a cached total (UI only).
- **C** — This is the expensive mistake, and it is the one learners are most likely to make in practice. Covering every boundary again through the browser costs roughly 500× more per case and adds no new information, because the arithmetic is already established.
- **D** — Threshold arithmetic is pure logic with no dependencies; it is a textbook unit test. API coverage of the rule is reasonable *in addition*, but it is not where the boundary cases belong.

**The formulation worth having learners memorize:** boundaries go low, one representative case goes high.

**Reread if missed:** Section C.7, then example E.1.

---

## Question 4 — What an API test catches that a unit test cannot

**Correct answer: B** — An endpoint that computes the total correctly but returns it in a field named `ammount`.

**Why:** This is a contract failure. The logic is right; the interface is wrong. A unit test calls the function directly and never observes the serialized response, so it passes happily while every client of the API breaks (Section C.3).

**Why the others are wrong:**

- **A** — A rounding error in a calculation is precisely what a unit test catches, faster and with better precision.
- **C** — A stale cached total in the *page* is above the API layer. An API test reads the response body, not the rendered DOM, so it cannot see this. This is the strongest distractor and the one worth discussing: it is the failure that justifies keeping one UI test, exactly as in Question 3.
- **D** — State machine transitions are internal logic; unit tests cover them well.

**Teaching note:** ask the cohort to name, for each of the four options, which layer *would* catch it. The full mapping — A unit, B API, C UI, D unit — makes the layer-by-failure-mode idea concrete in a way that no diagram does.

**Reread if missed:** Sections C.2 and C.3, then C.7's three-row table.

---

## Question 5 — Flakiness at 200 UI tests

**Correct answer: D** — About 1.8%.

**The arithmetic:** `0.98²⁰⁰ ≈ 0.0176`, so a full run passes cleanly about 1.8% of the time — roughly one run in 57.

**Why the others are wrong:**

- **A** — 98% is the per-test rate mistaken for the suite rate.
- **B** — About 67% is `0.98²⁰`, a 20-test suite. Worth showing: even 20 tests at a 2% flake rate fail a third of the time.
- **C** — 18% is a factor-of-ten slip; no reasonable derivation produces it.

**The point:** 2% per test sounds excellent. Most engineers would call a test that fails one run in fifty "basically stable." At 200 tests it makes the suite unusable. This is the arithmetic behind the E.3 example and behind the flat 25% deduction for hard waits in [Project 4](../../projects/project-4-web-automation.md).

Compare with the 5%/200 case from [Chapter 1.2](../../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) Q4 (0.0035%). Halving the flake rate from 5% to 2% improves clean-run probability by a factor of about 500. Reliability work has enormous leverage, and this pair of numbers is the best way to show it.

**Reread if missed:** Section C.4's Option A analysis.

---

## Question 6 — First action on an ice cream cone

**Correct answer: C** — Identify what business rule each slow, flaky UI test verifies, re-verify those rules at the API or unit layer, and delete the UI versions.

**Why:** It attacks the cause. The suite is unreliable because it has hundreds of independent chances for environmental and timing noise, and it has that because behaviors are verified far from the code that implements them. Moving them down removes the noise sources rather than suppressing their symptoms (Sections C.5, E.3).

**Why the others are wrong:**

- **A** — Retries hide flakiness and are how teams arrive at "known flaky" exclusion lists. The suite gets greener and less informative. This is why the [capstone](../../capstone/00-capstone-overview.md) caps retries at 1 and requires every retried test to be named and diagnosed.
- **B** — Adding UI tests to a suite that is unreliable *because* it is UI-heavy makes every symptom worse.
- **D** — Parallelism is genuinely useful and addresses runtime, not reliability. It often makes flakiness worse by introducing shared-state contention ([Chapter 6.7](../../part-6-framework-engineering/07-parallel-execution-and-sharding.md)). Accept partial credit if a learner proposes it *after* C.

**The organizational difficulty is the real lesson.** The correct action reduces the test count, and on a team that reports test count as a success metric this looks like destroying work. Have learners rehearse the 100-word defense from exercise G.2 Task D; the technical judgment is easy and the conversation is not.

**Reread if missed:** Sections C.5 and E.3.

---

## Question 7 — The strongest argument for automation

**Correct answer: C** — A failure would go unnoticed for a long time without a test.

**Why:** Low detectability is where automation provides information nobody else will. A crashed homepage is reported by everyone within minutes; a silent 2% error in interest accrual can run for a year. Automation's unique value is catching what humans will not notice (Section C.8).

**Why the others are weaker:**

- **A** — Ease is the worst possible reason and the most commonly acted upon. It is how suites end up dense on settings pages and empty on money calculations.
- **B** — Genuinely strong, and it is the impact factor. But critical journeys are usually the *most* detectable things in the system — if checkout is down, you will hear about it immediately. High impact justifies smoke coverage; it is not the sharpest argument on its own.
- **D** — Also genuinely strong: churn predicts breakage. Still one factor among three.

**Nuance to raise:** the three factors multiply, so the best candidates score high on all of them — tax calculation is high impact, moderately churning, and nearly undetectable, which is why it appears at the top of the C.8 table. Accept a well-argued B or D if the learner explicitly frames it as one factor of three; reject A always.

**Reread if missed:** Section C.8, particularly the detectability column.

---

## Question 8 — "Cover the pricing rules through the UI"

**Correct answer: C** — Offer to cover the pricing rules at the API layer instead, keeping the UI for journeys that require a browser, and state the runtime difference.

**Why:** It accepts the underlying concern (the pricing risk is real and currently uncovered), redirects to a layer that addresses it faster and more reliably, and quantifies the alternative in terms the developer cares about — how long they will wait for feedback (Section D.2).

**Why the others are wrong:**

- **A** — Agreeing produces the ice cream cone one reasonable decision at a time (Section F.2).
- **B** — Correct in principle and useless in practice: it refuses without offering a path, and it asks for something you have just been told is unavailable.
- **D** — Escalating a technical disagreement you have not yet tried to solve damages the relationship you need for the next two years, and a manager cannot make unit tests appear either.

**The transferable structure:** accept the concern → offer a cheaper layer → quantify the difference in their terms → say what you will still cover at the expensive layer. Have learners write this response for their own context; it is the same shape as [Chapter 1.2](../../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) Q8.

**Reread if missed:** Sections D.1 and D.2.

---

## Question 9 — Diagnose the suite

**Correct answer: C** — The suite is concentrated at a layer too far from the code: it cannot run per-commit, cannot cover calculation edge cases economically, and cannot be trusted.

**Why:** Every reported symptom is explained by one cause. 52 minutes for 310 tests means roughly 10 seconds per test, which is browser-level. Nightly-only follows from the runtime. An 11-test "known flaky" list is the signature of environmental noise being managed rather than fixed. And discount-calculation escapes are exactly what a UI-heavy suite misses, because exhaustive boundary coverage is unaffordable at 10 seconds per case (Sections C.5, E.3).

**Why the others are wrong:**

- **A** — More tests at the same layer makes runtime and flakiness worse while still failing to cover boundaries economically. The escapes are a placement problem, not a volume problem.
- **B** — Hardware is a comfortable diagnosis because it blames no design decision. Faster machines might reach 40 minutes; the suite still cannot run per-commit and still cannot cover rounding edge cases.
- **D** — Fixing the 11 flaky tests is worth doing and leaves the other three symptoms untouched. Note that "known flaky list" implies they were excluded rather than fixed, which is itself the diagnostic tell.

**Follow-up worth asking:** what would you predict about this team's unit test coverage without being told? Learners should infer near-zero, from the calculation escapes alone. Reasoning backwards from symptoms to suite shape is exactly the skill the second competency check asks for.

**Reread if missed:** Sections C.5, D.3, and E.3.

---

## Exercise notes for instructors

### G.1 — Place fifteen checks

| # | Check | Cheapest layer | Notes |
|---|---|---|---|
| 1 | 15% discount on $10.01 rounds correctly | **Unit** | Pure arithmetic; boundary case belongs where it costs a millisecond |
| 2 | Cart displays discounted total without reload | **UI** | Only the UI can prove the DOM updates; this is a rendering claim |
| 3 | Order decrements inventory in the same transaction | **Integration** | Transactional behavior across code and database |
| 4 | `POST /orders` returns 400 naming the missing postcode | **API** | Contract and status code — an API test by definition |
| 5 | Button not clickable while payment processes | **UI** | Interaction state; only a browser can assert click-ability |
| 6 | Tax on post-discount subtotal, 12 regions | **Unit** for the 12 cases, **API** for one representative | See task B |
| 7 | Customer A gets 403 for B's order | **API** | Authorization at the contract boundary; cheap and security-critical |
| 8 | Confirmation email contains the correct order number | **Integration** or **API** | Integration if asserting the enqueued message; API/mail-service if asserting delivery. Accept either with the dependency named |
| 9 | Error message is polite and tells the user what to do | **Manual** | "Polite" and "helpful" are human judgments |
| 10 | Expired code rejected with reason "expired" | **API** | Contract behavior. A learner arguing unit for the expiry *logic* plus API for the response is more correct still |
| 11 | State machine rejects `shipped` → `pending` | **Unit** | Pure logic, no dependencies |
| 12 | Customer can complete a purchase in Safari | **UI** | Browser-specific behavior; nothing below the UI can establish it |
| 13 | Payment adapter handles a gateway timeout | **Integration** | Adapter plus a simulated external boundary |
| 14 | Luhn-invalid card rejected before submission | **Unit** for the algorithm, **UI** for "before submission" | Two claims; strong answers split them |
| 15 | Checkout usable with a screen reader | **Manual** | Automated a11y scans catch a rule subset; "usable" does not reduce to rules |

**Task A — how many below the UI:** 11 of 15 (checks 1, 3, 4, 6, 7, 8, 10, 11, 13, plus the algorithmic halves of 14). Only 2, 5, 12 and part of 14 genuinely need a browser; 9 and 15 need a human. The count reliably surprises learners who arrived thinking of automation as a browser activity, and it is worth saying the number out loud.

**Task B — the 12 regions:** all 12 cases as unit tests, plus **one** API test proving the endpoint applies tax to the post-discount subtotal, plus **zero** UI tests. Learners who propose 12 UI tests have reproduced example E.3 unprompted, which is a useful thing to point out gently.

**Task C — what only the UI proves:** for check 2, that the DOM actually updates without a page load — the API can return a correct total while the page shows a stale one. For check 5, that the element is genuinely non-interactive; a `disabled` attribute in the response markup is not the same claim as "a user cannot click it," since an overlay, a CSS pointer-events rule, or a race between render and enablement can each break it.

### G.2 — Migrate an ice cream cone

| # | Existing UI test | Decision | Reason |
|---|---|---|---|
| 1-3 | `SAVE10`/`SAVE20`/`SAVE30` totals | **Move to unit** (all three), keep **one** at API | Arithmetic. Three identical click paths verifying three multiplications |
| 4 | Expired code shows "This code has expired" | **Move to API** | Rejection reason is contract behavior. Keeping one UI test for message *display* is defensible |
| 5 | Empty postcode shows a field error | **Keep at UI** (one representative) | Field-level error display is a rendering claim |
| 6 | 200-character street address rejected | **Move to unit** | Validation rule, no rendering involved |
| 7 | Invalid card number rejected | **Move to unit** | Same |
| 8 | Full purchase happy path | **Keep at UI** | The canonical journey test; this is what the layer is for |
| 9 | Cart badge shows "3" | **Keep at UI** | Display of derived state; only the UI shows a badge |
| 10-12 | Shipping at $99.99 / $100.00 / $150.00 | **Move to unit** (all three), keep **one** at UI | Boundaries low, one representative high. Exactly Question 3 |
| 13 | Product image is 400px wide | **Delete** | Asserts an implementation detail, not a behavior. Breaks on any restyle, protects nothing |
| 14 | Logout clears session, cart persists | **Keep at UI** | Session and browser-storage behavior |
| 15-16 | Tax for California / Oregon | **Move to unit** | Calculation per region |
| 17 | Place Order disabled during processing | **Keep at UI** | Interaction state |
| 18 | A's order not in B's history page | **Move to API** *(primary)* | Authorization belongs at the contract. A single UI check is defensible defense in depth if argued |
| 19 | Footer contains a privacy policy link | **Delete** or move to a fast link-check | Lowest score on every C.8 factor. If it must exist, not as a browser test |
| 20 | Declined card: message shown, cart preserved | **Keep at UI** | Two user-visible claims; REQ-502 is about what the customer sees |

**Task B — the new suite:** roughly 8-9 UI tests remain (5, 8, 9, 11-as-representative, 14, 17, 20, plus optionally 4 and 18 as display checks). At 6 s each that is **under a minute**, from 38 minutes. Extrapolated across the full 240-test suite, expect 25-35 UI tests and 3-4 minutes.

**Task C — the contentious three.** Most cohorts land on 13, 19, and 18.

- **13 (image width):** "This asserts a CSS value, not a behavior. It will fail on the next restyle and it has never caught a defect a customer would notice. If image sizing matters, that is a visual regression concern, not a functional test."
- **19 (footer link):** "Lowest impact, lowest churn, highest detectability of anything in the suite. If we want it, a link checker covers the whole site in two seconds without a browser."
- **18 (authorization):** "This is security-critical, so I am not reducing coverage — I am moving it to the layer where it runs in 300 ms instead of 6 s and where I can cheaply add the other five authorization cases we currently do not test at all."

That third framing is the one to teach: moving a test down is often an opportunity to *increase* coverage of the same risk, and saying so converts "you're deleting my tests" into "I'm covering more."

**Task D — the manager answer.** A good version, around 90 words:

> "I'm not removing coverage, I'm moving it. Those 15 discount tests each spent 6 seconds clicking through the site to check one multiplication; the same 15 checks run in 15 milliseconds against the calculation directly, and they cover boundaries we currently skip. What I delete are the browser versions, which were slow, broke whenever the page changed, and told us only that *something* in a chain of fifteen steps failed. The suite gets faster, more precise, and runs on every commit instead of nightly — which is where the reliability comes from."

Look for three moves: reframing deletion as relocation, quantifying, and naming the benefit the manager actually wants (per-commit feedback).

### G.3 — The developer who won't write unit tests

**Task A — what is legitimate in each claim.**

1. **"Unit tests broke every time we refactored."** Legitimate: tests coupled to implementation details rather than behavior do break on every refactor, and this is a real and common failure. Where it fails: the conclusion should be "we wrote them coupled to internals" not "unit tests don't work." Worth noting that this diagnosis requires knowing what a badly-written unit test looks like, which the learner will after [Chapter 3.1](../../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md).
2. **"Nobody maintained them."** Legitimate: unmaintained tests genuinely do become worse than none — this is [Chapter 1.2](../../part-1-testing-fundamentals/02-manual-vs-automation-testing.md)'s negative-value argument, and the developer has independently discovered it. Where it fails: it is an ownership and process problem, and the same argument applies with equal force to the UI suite they are proposing.
3. **"Testing is QA's job."** Legitimate: QA owns testing *expertise*, and there is a real division of labor. Where it fails: it puts detection at the most expensive point on the cost curve and removes the incentive for developers to think about testability ([Chapter 1.1](../../part-1-testing-fundamentals/01-what-is-software-testing.md), C.9).
4. **"UI tests test what the customer sees."** Legitimate: entirely true, and it is the one thing lower layers cannot do. Where it fails: it argues for *some* UI tests, not for all testing at the UI. Breadth is not depth (Section F.6).

Learners who can find the truth in all four have the disposition that makes this negotiation survivable. Learners who dismiss all four will lose the argument in real life, regardless of being right.

**Task B — the strategy actually implementable.** Expect: heavy investment at the API layer, since it is the only substantial layer available without permission; a deliberately small UI suite of critical journeys; explicit acknowledgment that calculation boundary coverage will be thinner and more expensive than it should be; a stated runtime budget to prevent drift; and a written gap statement about the missing unit layer so the risk is visible and accepted rather than silent.

**Task C — the six-month case.** Assess against the four constraints. The strongest submissions collect diagnosis-time data (see the chapter hint), present it as local evidence rather than industry practice, propose one high-churn module as a time-boxed experiment with a review date, and explicitly acknowledge the cost — unit tests are real work, they do need maintenance, and the developer's past experience was real. The "no admission of being wrong" constraint usually resolves to framing the past attempt as having produced useful information about *how* to write them.

**Task D — after six months of nothing.** Both halves matter. Professionally: keep the gap documented, keep the API layer strong, keep collecting evidence, and accept that some organizations will not change on your timeline — being right is not the same as being effective. Personally: it is legitimate to weigh whether a team that structurally prevents good engineering is where you want to spend your next two years, and it is worth saying so plainly to learners rather than pretending every situation is fixable. Discourage two failure modes: martyrdom (silently absorbing the cost forever) and contempt (deciding the developers are fools, which guarantees no influence).

---

## Assignment 1.3 — grading notes

This is the highest-leverage document in Part I, and learners should be told that: it becomes the blueprint for Projects 3 and 4 and feeds directly into the capstone's `docs/test-strategy.md`.

**Requirement 6 is where the grade is decided.** No more than 12 UI checks, each justified against "why not the API?" Weak submissions produce 25 UI checks with justifications that amount to "the user sees this" — which is true of everything. Strong submissions produce 8-10, each defended by a specific capability of the browser: rendering, interaction state, session and storage behavior, browser-specific engines, or a display value that could plausibly diverge from the API response.

**Watch the boundary cases (requirement 12).** REQ-114's threshold and REQ-501's tax regions should appear as numeric values at the unit layer. If either appears as a set of UI checks, the central lesson has not landed and it is worth a conversation rather than just a deduction.

**Requirement 10's 5-minute budget is a forcing function.** Any plan with 25 UI checks fails it arithmetically at 6 s per test plus API time. Learners discover the constraint themselves, which is the intent. Reward explicit cuts with stated reasons over plans that quietly ignore the budget.

**Requirement 7, deliberate duplication, is the strongest signal of understanding.** The expected examples are REQ-114 (unit arithmetic / API response field / UI display) and REQ-504 authorization (API 403 / UI order-history page). Full marks require naming the *distinct failure per layer*, not merely listing the layers. A submission that says "verified at unit, API, and UI for extra safety" has missed Section C.7 entirely.

**Requirement 11, the smoke subset.** Six checks maximum. The self-check question — "if you ran only my smoke subset, what catastrophic breakage would still get through?" — is worth asking every learner in review. Common miss: a smoke subset covering discount edge cases while omitting "can a customer complete a purchase at all," which inverts the purpose. This sets up [Chapter 1.4](../../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) directly.
