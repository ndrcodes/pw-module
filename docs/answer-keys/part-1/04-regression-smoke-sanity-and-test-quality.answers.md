# Answer Key — Chapter 1.4: Regression, Smoke, Sanity, and Test Case Quality

[← Answer Keys](../overview.md) · [Chapter 1.4](../../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md)

> **Instructor note:** Questions 3, 4, and 7 are the ones that matter most. Question 7 is the chapter's most important idea — silent coverage loss when an ambiguous case is automated — and it is the one learners are least likely to have encountered anywhere else. Exercise G.3 is the highest-value activity in Part I; protect time for it.

---

## Question 1 — The defining property of a smoke suite

**Correct answer: B** — It runs fast enough to execute after every deploy, and answers whether the build is worth testing further.

**Why:** The budget is what makes a smoke suite a smoke suite. Its purpose is to prevent waste — if the build is fundamentally broken, nobody should spend an afternoon or four hundred test-executions discovering that (Section C.2).

**Why the others are wrong:**

- **A** — "The most important test cases" is the intuitive criterion and the wrong one. The correct filter is the rollback test, not importance. A wrong tax calculation is extremely important and does not belong in smoke.
- **C** — "Thoroughly" is the opposite of what smoke does. Smoke is broad and shallow; thorough coverage of critical features is regression.
- **D** — Smoke suites often *do* run against production after a deploy, but that is a place they run, not what defines them.

**The failure mode to name explicitly:** a smoke suite that grows past its budget does not become a slow smoke suite. It becomes a partial regression suite with the wrong name, and the practical consequence is that it stops running after every deploy — see Section F.2.

**Reread if missed:** Sections C.2 and C.3.

---

## Question 2 — Is sanity a smaller regression?

**Correct answer: False.**

**Why:** They differ in shape, not just size. Regression is **broad and deep** — everything of value, thoroughly. Sanity is **narrow and deep** — one feature area, thoroughly, and deliberately silent about everything else (Section C.2).

A sanity run on the discount area may execute 14 checks and tell you a great deal about discounts and nothing at all about authentication. A "smaller regression" would sample thinly across everything, which answers neither question well.

**The distinction that makes it click:** shrinking a regression suite by dropping tests gives you a worse regression suite. A sanity suite is a *selection by change impact*, which is a different operation entirely.

**Reread if missed:** Section C.2's table, then E.1's sanity example.

---

## Question 3 — Free shipping at exactly $100 in smoke?

**Correct answer: C** — No; a failure would prompt a ticket, not a rollback, and the regression suite catches it minutes later.

**Why:** The rollback test is the filter (Section C.3). A miscalculated shipping threshold overcharges some customers $4.99 — genuinely bad, genuinely worth fixing quickly, and not a reason to abort a deployment. It is caught by the regression suite within minutes, which is soon enough.

**Why the others are wrong:**

- **A** — "It involves money, so it is critical" is the most common wrong reasoning, and it is how a 6-check smoke suite becomes a 25-check one. Importance is not the criterion.
- **B** — Boundary cases *are* high-value, which is exactly why they live at the unit layer where they cost a millisecond each. High value does not imply smoke membership.
- **D** — Simply false; boundary cases are among the most reliably automatable things that exist.

**Worth pressing in discussion:** ask what *would* justify smoke membership for a money calculation. A reasonable answer: if the failure mode were charging customers the wrong *total* — i.e. a defect that makes the checkout actively harmful rather than slightly wrong — a team could defend including one representative total check. That is a rollback-worthy failure. Learners who can draw that line have understood the criterion rather than memorized the example.

**Reread if missed:** Section C.3.

---

## Question 4 — Which expected result is verifiable

**Correct answer: C** — The shipping line displays exactly `FREE` and the order total displays `$100.00`.

**Why:** Two engineers executing this would reach the same verdict. Specific values, specific locations, no interpretation (Section C.7, criterion 4).

**Why the others fail:** A, B, and D all require interpretation. "Correctly," "without errors," and "properly" mean whatever the reader assumes, so two engineers can legitimately disagree — and when automated, someone silently picks one meaning (Question 7).

**Note on B specifically,** because it is the sneakiest: "loads without errors" sounds objective. It is not. Errors where — a 500 response, a console warning, a validation message, a broken image, an error logged server-side? Each is a different check. A learner who argues B is verifiable "if you define errors as console errors" has made exactly the right observation: the definition is doing the work, and the case did not supply it.

**Reread if missed:** Section C.7 criterion 4, then example E.1.

---

## Question 5 — "Using the order created in TC-101"

**Correct answer: B** — Independence, and determinism if "the order" is ambiguous under parallel runs.

**Why:** The case cannot run alone, cannot run first, and cannot run if TC-101 failed. That is an independence violation. And where the case identifies its subject as "the most recent order" (as in example E.2), the determinism violation is real too: under parallel execution, another test's order may be more recent (Section C.7, criteria 2 and 3).

**Why the others are wrong:**

- **A** — Atomicity is about how many behaviors are verified; this case verifies one.
- **C** — Traceability concerns requirement links; unrelated.
- **D** — The efficiency claim is true for a human executing cases in order, which is precisely why these cases exist in inherited manual suites. It stops being true the moment you want to parallelize, run one case in isolation to reproduce a defect, or tolerate an earlier failure.

**Follow-up worth asking:** what does the fix cost? In example E.2 it is one sentence — "this test creates its own confirmed order via the API." Learners often expect independence to be expensive; at the API layer it usually is not, which is a preview of [Chapter 6.4](../../part-6-framework-engineering/04-test-data-management.md).

**Reread if missed:** Section C.7 criterion 3, then example E.2.

---

## Question 6 — Highest leverage on a 50-minute suite

**Correct answer: B** — Move checks down a layer and delete the displaced tests.

**Why:** It attacks the cause. The suite is slow because behaviors are verified far from the code implementing them; twenty UI tests becoming twenty unit tests plus one UI test converts two minutes into milliseconds (Section C.4, technique 1).

**Why the others are weaker:**

- **A** and **D** — Parallelism and bigger machines divide wall-clock time without reducing cost, and they cap out. They are legitimate techniques *after* placement has been fixed, and they are what teams reach for first because they require no negotiation and no deletions. Accept partial credit if a learner proposes them explicitly as a stopgap.
- **C** — Splitting across alternate nights halves the runtime and halves the coverage per night, which doubles worst-case detection latency. It is a way of hiding the problem in a schedule.

**The organizational point worth making:** the correct answer reduces the test count, and on a team that reports test count it looks like destroying value. Section D.4's reframing — "same rules covered, in 15 milliseconds instead of 90 seconds, with better boundary coverage" — is what makes it sayable.

**Reread if missed:** Section C.4, then [Chapter 1.3](../../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md) example E.3.

---

## Question 7 — Automating "the cart updates correctly"

**Correct answer: C** — Coverage has silently narrowed: a human checked several values and noticed anomalies, and the automated version checks one.

**Why:** This is the most important idea in the chapter. A human executing an ambiguous case applies judgment — glancing at the line total, subtotal, shipping, tax, and badge, and noticing anything that looks wrong, including things the case never mentioned. Automating it forces a choice, and whatever you choose is narrower than what the human did (Section D.2).

The damage compounds: the manual case is retired because "it's automated now," so the broad check is gone. The suite is green, the tracker says automated, and the subtotal defect ships.

**Why the others are wrong:**

- **A** — "Coverage unchanged" is what the status report will say, and it is the belief this question exists to break.
- **B** — Precision increased; coverage decreased. Learners who pick B have noticed something real — the assertion *is* more precise — and missed the trade.
- **D** — "Nothing, provided the test passes" describes exactly the situation in which the defect escapes.

**The two habits to state explicitly:** clarify before automating (an unverifiable expected result is a finding, and chasing it frequently uncovers a requirement gap), and automate the *behaviors* rather than the case — TC-341 becomes four atomic tests with explicit values.

**Reread if missed:** Section D.2, then example E.2's first rewrite. Note that the rewrite surfaced TC-341c, a threshold-interaction case nobody had written.

---

## Question 8 — Strongest deletion candidate

**Correct answer: A** — Failed 4 times in 18 months, every time due to an intentional design change, never found a defect.

**Why:** Every failure was a false positive. The test has cost triage time repeatedly and returned nothing. It is asserting a design decision rather than a behavior, so it will keep failing whenever the design legitimately changes (Section C.8, and example E.5).

**Why the others should be kept:**

- **B** — A test failing once a month due to a *genuine intermittent application defect* is doing its job. This is the strongest distractor, because "fails regularly" pattern-matches to flaky. The distinction is whether the failure reflects a real defect or test noise; here it is real, and deleting it would hide a production bug. Worth dwelling on: it is the difference between a flaky test and a test detecting flaky behavior.
- **C** — Rarely-used features still break, and their failures have low detectability, which per [Chapter 1.3](../../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md) C.8 is an argument *for* automation. Consider moving it out of the per-commit suite, not deleting it.
- **D** — On the revenue path. Slow is a reason to move it to a cheaper layer, never a reason to stop checking.

**Reread if missed:** Section C.8, then example E.5's rationale structure.

---

## Question 9 — Why independence caps CI options

**Correct answer: B** — Order-dependent tests cannot be parallelized, so runtime cannot be reduced by adding capacity.

**Why:** Parallel execution requires that tests be safe to run in any order and simultaneously. If test B depends on test A having run, the suite must run serially, and no amount of CI capacity changes that. The ceiling is architectural (Section D.3).

**Why the others are wrong:**

- **A** — Independence is not a style preference; it is what determines whether your suite can ever get faster. Every project rubric in this course deducts 20% for order dependence for this reason.
- **C** — Independent tests are sometimes marginally more work to write, and at the API layer usually not (see Q5). Either way, irrelevant to the question.
- **D** — Fabricated.

**Worth adding:** this is why independence appears as a requirement in Parts IV, V, and VI rather than as advice. A suite that is not order-independent when it reaches [Chapter 6.7](../../part-6-framework-engineering/07-parallel-execution-and-sharding.md) cannot be fixed by configuration — it has to be rewritten, which is why the capstone tests it explicitly.

**Reread if missed:** Section D.3's table, particularly the last row.

---

## Question 10 — "Automate the existing 800 test cases"

**Correct answer: C.**

**Why:** It declines one-to-one translation without refusing the goal, gives a specific and credible breakdown of what an audit would find, proposes visible value within a month, and reframes the work as an audit rather than a transcription job (Section D.1).

The detail that makes it professional is the numbers. "Roughly a third duplicates or obsolete, about half better at the API layer, some unverifiable as written" is a testable claim that sets expectations before you start deleting things — which is far easier to say now than after you have removed 200 cases.

**Why the others fail:**

- **A** — Agreeing produces 800 UI tests, roughly 80 minutes of runtime, nightly-only feedback, and an ice cream cone. It also guarantees that unverifiable cases get automated by guessing (Question 7).
- **B** — "Start over" is both alarming and wrong. Many of those cases encode real institutional knowledge about what matters and what has broken before; that knowledge is worth mining, not discarding.
- **D** — Accepting a year-long transcription with no interim value. Note it is *honest*, which makes it tempting; it is still the wrong plan.

**Have learners rehearse this one aloud.** It is the highest-stakes conversation in the chapter and they will have it early in their careers. The structure — decline the method, accept the goal, quantify what an audit will find, propose a fast first slice — is the same shape as the strong answers in [Chapters 1.2](../../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) and [1.3](../../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md).

---

## Exercise notes for instructors

### G.1 — Classify twelve scenarios

| # | Scenario | Answer | Notes |
|---|---|---|---|
| 1 | Staging deploy, need to know in minutes | **Smoke** | Textbook trigger |
| 2 | Discount rounding fix | **Sanity** | Narrow and deep on the changed area |
| 3 | 2 a.m. scheduled job | **Regression** (nightly) | Time available, no one waiting |
| 4 | Release candidate for tomorrow | **Regression** | Full confidence before release |
| 5 | Commit touched only footer CSS | **Smoke** (defensible: full regression) | See task C |
| 6 | Payment gateway SDK upgraded | **Sanity** on payments, then **regression** | Dependency change with broad blast radius; both, in that order |
| 7 | Developer wants feedback before coffee cools | **Smoke** + fast layers | The per-commit stage |
| 8 | Hotfix ships in 20 minutes | **Smoke** + **sanity** on the fixed area | See task B |
| 9 | Migration changed the orders schema | **Regression** | Schema changes can break anything touching orders; sanity is not enough |
| 10 | About to spend 4 hours on exploratory | **Smoke** first | The purpose of smoke: do not waste the afternoon |
| 11 | Dependency bump, 40 transitive packages | **Regression** | Unknown blast radius; no area to target |
| 12 | Did last sprint break two-year-old behavior? | **Regression** | This is the definition of regression |

**Task A — the ambiguous ones:** 5 and 6 (also defensibly 8 and 9). What decides it is **blast radius** — how much of the system the change could plausibly affect. A CSS-only change has a narrow radius; an SDK upgrade or a schema migration has a wide one. Learners who articulate blast radius as the deciding variable have found the general principle behind all twelve.

**Task B — the 20-minute hotfix:** run smoke, then sanity on the specific fixed area. Explicitly accept not knowing whether the fix broke anything outside its area, and say so to whoever authorizes the release. The professional move is to *state the accepted risk*, not to pretend 20 minutes bought full confidence — the [Chapter 1.1](../../part-1-testing-fundamentals/01-what-is-software-testing.md) habit applied under time pressure.

**Task C — footer CSS, both sides.** For running only smoke: the change cannot plausibly affect behavior outside the footer, and spending 50 minutes on it delays everything for no information. For running full regression: CSS changes have surprised people before — a global selector, a shared component, a stylesheet ordering change — and if the suite is fast enough, the cost of running it is near zero. **The resolution is the suite's runtime.** If regression takes 5 minutes, run it always and stop thinking about it. If it takes 50, selection becomes necessary, which is itself an argument for the C.4 techniques. This is a good moment to point out that a fast suite eliminates an entire category of judgment calls.

### G.2 — Design a five-minute smoke suite

A strong answer, at 200 ms per API check and 6 s per UI check:

```text
API   health endpoint 200                          0.2 s
API   login returns a token                        0.2 s
API   search returns ≥1 result                     0.2 s
API   add to cart, cart reflects it                0.4 s
API   create order returns an order number         0.4 s
API   order retrievable by its owner               0.2 s
UI    happy-path purchase, login → confirmation   12.0 s
UI    order appears in order history               6.0 s
                                                  ------
                                                  19.6 s
```

Eight checks, under 20 seconds against a 5-minute budget. **Learners who use most of the budget have misunderstood the task** — headroom is the goal, not efficient use of the allowance.

**Task C — defensible exclusions and their defenses:** password reset ("a failure means affected users contact support; it does not make the build worthless"), product reviews ("no revenue impact; a ticket, not a rollback"), the admin product editor ("internal users, small population, and they can report it directly"), wishlist, profile editing, address book, filtering. Any three with rollback-based reasoning.

**Task D — the growth policy.** Something like: *"This suite has a hard 3-minute budget. Any addition that would exceed it must displace an existing check, and the displacement must be recorded in this file with a reason."* The essential element is that additions must *displace*, not merely be justified — Section F.2's failure comes from every addition being individually defensible.

**Task E — the 90-second constraint.** All six API checks survive (1.6 s) plus one UI journey (12 s), totalling under 14 seconds. What is lost is the order-history UI check. Is it still worth having? **Yes, emphatically** — this is the key insight. The 90-second version catches essentially every catastrophic failure the 5-minute version would, because catastrophic failures are not subtle. Learners who conclude that a tight budget makes smoke useless have inverted the lesson; a tight budget is what makes smoke *runnable*, and runnable is the entire point.

### G.3 — Rewrite five cases, delete one

**TC-E is the deletion.** Border-radius is a design decision, not a behavior; no customer-visible failure corresponds to it; it breaks on any restyle. Rationale should follow the E.5 shape: what it asserts, what it has caught, its risk score, and what replaces it if the concern is real (visual regression tooling, not a functional assertion).

**TC-A (login)** → 3-4 cases minimum. "Enter credentials" is unspecified and "logged in successfully" is unverifiable. Splits: valid credentials → redirected to the account page with the username displayed in the header; invalid password → specific error message shown and no session established; unregistered email → same message as invalid password (a security requirement worth stating, since differing messages enable account enumeration); locked account → the lockout message.

**TC-B (yesterday's promotion)** → 2-3 cases. "Yesterday's" is non-deterministic; "the code from yesterday's email campaign" is unspecifiable. Rewrite with a seeded code, an explicit percentage, an absolute expiry date, and a stated expected total. The best submissions notice that "still works" hints at an expiry-boundary concern and add cases for the day before, the day of, and the day after expiry.

**TC-C (search performance)** → see task G below.

**TC-D (checkout using TC-C's account)** → **the largest expansion, typically 6-8 cases.** It violates every criterion: dependent on TC-C, "the last product you viewed" is non-deterministic and session-dependent, six behaviors bundled, and "everything is updated" is unverifiable. It becomes one journey case plus focused cases for email dispatch, order history, and inventory decrement — most of which belong below the UI.

**Task F:** TC-D expands most, and what that tells you is that **the original was hiding the most coverage**. A single case claiming to verify six behaviors was in practice verifying whichever ones the executing human happened to look at — the Question 7 problem in its original manual form.

**Task G — TC-C, performance.** A verifiable version: *"Searching for 'lamp' against the seeded 500-product catalogue returns the results page within 2.0 s at the 95th percentile over 20 runs, on a 4G network profile, measured to first contentful paint."*

Then the honest part: **this probably does not belong in a functional automated suite.** Three reasons worth drawing out. It is environment-sensitive, so it fails on a loaded CI machine while the application is fine — a false failure, which is the [Chapter 1.2](../../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) trust problem. A single-run threshold is statistically meaningless, and doing it properly needs percentiles over many runs, which is a different kind of test. And the threshold is usually arbitrary, so it fails at 2.1 s without anyone knowing whether that matters. Performance belongs in dedicated performance testing or production monitoring. Learners who reach this conclusion themselves have understood something most working suites get wrong — and it is why [Project 3](../../projects/project-3-api-automation.md) lists performance guardrails as a bonus that explicitly requires acknowledging the fragility.

**Task H — the revealed case.** Most learners find it in TC-B: rewriting the expiry properly raises the question of what happens *at* the boundary — is a code expiring "2026-03-15" valid on the 15th, and is expiry evaluated when the code is applied or when payment is taken? Nobody wrote that case, and the requirement probably does not specify it. Also creditable, from TC-A: whether the error message for an unregistered email differs from that for a wrong password. That is a security finding discovered through a test-case rewrite, which is a good note to end Part I on.

---

## Assignment 1.4 — grading notes

**Part 1, the smoke suite, is where judgment shows.** Look for ≤10 checks, ≤3 minutes, and — most tellingly — **substantial headroom**. A submission using 2:50 of a 3:00 budget has optimized the wrong variable. Also check that most checks are at the API layer; a smoke suite of eight UI checks cannot fit the budget and reveals that [Chapter 1.3](../../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md) has not transferred.

**Requirement 3, per-check rollback justification, catches padding.** Any check whose justification is "this feature is important" rather than "we would roll back" fails it. This is the single fastest way to grade the smoke suite.

**Requirement 14 (≥2 splits) is where the ten supplied cases pay off.** Cases 2, 5, and 7 should each produce four or more atomic cases; case 7 ("discount codes work correctly") should produce the most, typically 8-12. A submission that rewrites all ten as ten cases has improved the wording without addressing atomicity, which is worth a conversation.

**Requirement 15, the deletion.** Case 10 (header logo width) is the intended one, and constraint 3 in the assignment says so plainly. Watch for rationales that assert rather than evidence — full marks require the E.5 shape, including a proposed replacement if the underlying concern is real.

**Case 9 is the determinism trap.** "Last week's orders" must become absolute dates with seeded boundary orders just outside the window, as in example E.4. Submissions that keep relative dates have missed the criterion even if everything else is strong.

**Requirement 20, the revealed case, is the 5% insight mark.** Genuine answers usually come from case 5 (does the threshold interact with discounts, per REQ-414?) or case 7 (what happens when a discount drops the subtotal below the code's own minimum spend — a circularity nobody specified). Reward specificity; reject generic "we should also test error cases."

**Cross-check against Assignment 1.3.** The smoke suite here should be consistent with the ≤6-check smoke subset from the Chapter 1.3 plan. Inconsistency between the two is worth flagging: these documents are meant to compose into the capstone's `docs/test-strategy.md`, and noticing the drift now is cheaper than noticing it in week 31.
