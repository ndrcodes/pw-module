# Chapter 1.2 — Manual Testing vs Test Automation

🟢 **Beginner** · [Part I Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | I — Software Testing Fundamentals |
| **Estimated time** | 1 session (90 min) + 3 hours independent work |
| **Prerequisite chapters** | [1.1 What Is Software Testing?](01-what-is-software-testing.md) |
| **Next chapter** | [1.3 Test Strategy and the Test Pyramid](03-test-strategy-and-the-test-pyramid.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Compare** manual and automated testing on speed, cost, coverage type, repeatability, and reliability.
2. **Identify** what automation genuinely replaces, and what it can never replace.
3. **Calculate** the break-even point for automating a given set of test cases.
4. **Explain** the ongoing maintenance cost of an automated suite and **estimate** it for a real feature.
5. **Decide** whether a specific test case should be automated now, automated later, or kept manual, and **defend** the decision.
6. **Justify** the claim that automation code is production code subject to software engineering discipline.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| What testing is for, and what it can prove | [Chapter 1.1](01-what-is-software-testing.md) |
| Defect, failure, verification, validation | [Chapter 1.1](01-what-is-software-testing.md) |

No programming required.

---

## C. Concept Explanation

### C.1 The asymmetry that explains everything

A manual test is cheap to create and expensive to repeat. An automated test is expensive to create, cheap to repeat, and — this is the part beginners consistently miss — **expensive to keep working.**

That third property is where most automation programs fail. An automated test is a small piece of software that depends on the application's interfaces, its data, and its timing. When any of those change, the test must change too. Not once: forever, for as long as the test exists. You are not buying a test. You are adopting one.

Hold that framing while reading the rest of this chapter. Almost every bad automation decision you will encounter in your career comes from treating automation as a one-time purchase rather than a subscription.

### C.2 What manual testing actually is

"Manual testing" bundles together two activities that have almost nothing in common, and conflating them is why so many teams automate the wrong things.

**Scripted manual execution** means following predetermined steps and comparing results to documented expectations. A human performs a procedure that a machine could perform. It is repetitive, objective, and — importantly — the human contributes almost nothing that a machine could not.

**Exploratory testing** means simultaneously learning the system, designing tests, and executing them, using each result to decide what to try next. It is not "clicking around without a plan"; done well it is a rigorous discipline with charters, note-taking, and reproducible findings, and it is where a large share of serious defects are actually found.

The difference matters enormously:

| | Scripted manual execution | Exploratory testing |
|---|---|---|
| **Steps** | Predetermined | Decided in the moment |
| **Human contribution** | Following and comparing | Designing, hypothesizing, noticing |
| **Finds** | Regressions in known behavior | Unknown unknowns, usability problems, requirement gaps |
| **Repeatable** | Yes, that's the point | No, and that is also the point |
| **Automatable** | Almost always | Never |

This is the single most useful distinction in the chapter. **Automation replaces scripted manual execution. It does not touch exploratory testing.** When someone says "automation will replace manual testing," they are describing the first column and forgetting the second exists.

A tester who spends 80% of their week on scripted execution is doing work a machine should do, and automating it frees them for work only a human can do. That is the actual promise of automation, and it is a promise about *reallocation*, not reduction.

### C.3 What automation genuinely provides

Five things, and it is worth being precise because the value is often mis-stated.

**Repeatability.** The same steps, the same data, the same order, every time, with no fatigue effect. A human executing a 40-step procedure for the ninth time that day will skip step 23. This is not a character flaw; it is how attention works.

**Speed at scale.** A suite that would take a person two days runs in eleven minutes. The value is not the labor saved — it is that eleven minutes fits inside a developer's attention span, which changes what the feedback can be used for.

**Consistency of judgment.** Automation compares exactly what it was told to compare. This is a strength (no drift, no "that looks close enough") and a weakness (it will not notice the enormous unrelated problem next to what it checked).

**Scale across combinations.** Forty tax scenarios across five countries and three customer tiers is 600 combinations. No one is doing that by hand. A data-driven test does it in seconds, and this is one of the most under-used forms of automation in the industry.

**Evidence.** Traces, screenshots, videos, timestamped logs. A manual tester's finding is a report; an automated failure comes with an artifact bundle that lets someone else reconstruct exactly what happened. You will build this in [Chapter 6.8](../part-6-framework-engineering/08-debugging-playwright-tests.md), and it is worth more than most people expect.

Notice that **speed of feedback is the real product** here. The other four matter, but the reason automation is transformative is that it collapses the distance between introducing a defect and learning about it — the one variable in the cost-of-defect curve from [Chapter 1.1](01-what-is-software-testing.md) that you can actually control.

### C.4 What automation cannot do

**It cannot judge.** "Is this error message helpful?" "Does this layout look broken?" "Would a customer understand this?" A machine can assert that text equals an expected string. It cannot assert that the string is any good.

**It cannot be curious.** Exploratory testing works because a human notices something slightly odd and follows it. Automation does exactly what it was told, and finds only what it was told to look for. Every automated test is an answer to a question you already thought to ask.

**It cannot validate.** This point from [Chapter 1.1](01-what-is-software-testing.md) is worth restating because it is so easily forgotten: automated tests encode *your* expectations. If the requirement is wrong, the test enforces the wrong behavior — and once written, it actively defends it. Fix the feature and the suite turns red.

**It cannot feel friction.** A checkout flow that technically works but requires seven clicks, two page reloads, and re-entering an address will pass every assertion you write. A human doing it once will say "this is awful," and that finding may be worth more than any regression test.

**It cannot notice what is absent.** A missing "forgot password" link, an absent confirmation email, a legally required disclaimer that nobody implemented — none of these fail a test that was never written, and nobody writes tests for features they have forgotten about.

The practical conclusion: exploratory testing remains valuable for your entire career, including after you become a specialist automation engineer. The best automation engineers explore a feature manually first, precisely because that is how they learn what is worth automating.

### C.5 The full cost model

Beginners estimate automation cost as "how long to write the test." That number is typically 30-40% of the real total. The full model has five components.

**1. Authoring.** Designing, writing, debugging, and stabilizing the test until it passes reliably. "Passes once" is not done — the stabilization tail is often longer than the writing.

**2. Maintenance.** Updating the test when the application changes. This is a recurring annual cost and it never ends while the test exists. It is the dominant term in most real suites.

**3. Infrastructure.** CI compute, browser images, test environments, test data provisioning, seats in reporting tools. Usually invisible until someone asks why the cloud bill grew.

**4. Triage.** Investigating failures. Real failures are the good case — the work is useful. **False failures are pure loss**, and they are frequent enough to deserve their own line in any honest estimate.

**5. The cost of lost trust.** Not measurable in hours, and larger than all of the above. A suite that cries wolf gets ignored, and an ignored suite provides zero detection while consuming every one of the four costs above. This is why [Chapter 5.5](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md) and [Chapter 6.9](../part-6-framework-engineering/09-diagnosing-flaky-tests.md) treat flakiness as a first-order engineering concern rather than an annoyance.

A serviceable rule of thumb for planning, until you have your own team's data: **annual maintenance runs 15-30% of the original authoring cost per year for API tests, and 30-50% for UI tests.** These are not laws, they are starting estimates. The gap between the two ranges is one of the strongest arguments for the test pyramid in [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md).

### C.6 Break-even arithmetic, worked end to end

Here is the calculation you will be asked for in real planning meetings. Do it explicitly and your recommendations become credible immediately, because almost nobody does.

**Scenario.** A 30-case regression suite for the demo shop's checkout, currently executed manually before each release.

| Input | Value | Source |
|---|---|---|
| Manual execution time, full suite | 6 hours | Measured over three releases |
| Release frequency | Every 2 weeks (26/year) | Team's cadence |
| Automation authoring, per case | 2.5 hours | Includes stabilization |
| Automated execution time | 12 minutes | Estimate |
| Triage per run (false failures) | 20 minutes | Estimate; the honest line most people omit |
| Annual maintenance | 40% of authoring | UI tests, churning application |
| Loaded hourly cost | $60 | For arithmetic only |

**Manual cost per year**

```text
6 hours × 26 releases            = 156 hours/year
156 × $60                        = $9,360/year
```

**Automation cost, year one**

```text
Authoring:     30 cases × 2.5 h  =  75.0 hours
Maintenance:   75 × 40%          =  30.0 hours
Execution:     0.2 h × 26        =   5.2 hours
Triage:        0.33 h × 26       =   8.6 hours
                                   -----------
Year 1 total                     = 118.8 hours  = $7,128
```

**Automation cost, each subsequent year**

```text
Maintenance                      =  30.0 hours
Execution                        =   5.2 hours
Triage                           =   8.6 hours
                                   -----------
Ongoing annual                   =  43.8 hours  = $2,628
```

**Break-even**

```text
Year 1:  automation 118.8 h  vs  manual 156 h   -> automation already cheaper
Cumulative saving, year 1                        =  37.2 hours
Cumulative saving, year 2                        = 149.4 hours
Cumulative saving, year 3                        = 261.6 hours
```

Break-even arrives inside the first year, and the case is overwhelming by year two. Automate it.

**Now change one assumption.** Suppose releases are quarterly rather than fortnightly — 4 per year:

```text
Manual:      6 × 4              =  24.0 hours/year
Automation year 1: 75 + 30 + 0.8 + 1.3 = 107.1 hours
Ongoing:     30 + 0.8 + 1.3    =  32.1 hours/year
```

Manual costs 24 hours a year. Automation costs 32 hours a year *forever*, after a 107-hour investment that never pays back. **Automating this suite would be a permanent loss**, and no amount of enthusiasm changes the arithmetic.

Same tests. Same application. Same team. Opposite correct decision, determined entirely by execution frequency. This is the single most important number in any automation business case, and it is the one people forget to ask about.

Two more assumptions worth stress-testing before you trust any such model:

- **If the UI is being redesigned next quarter**, maintenance is not 40% — it is closer to 100%, because most locators and flows will be rewritten. This is C.7.
- **If the suite is flaky**, triage is not 20 minutes but two hours, and the trust cost eventually dominates everything else.

### C.7 The maintenance multiplier

Three factors inflate maintenance cost, and recognizing them lets you predict a doomed automation effort before it starts.

**Interface churn.** Tests coupled to a changing UI break constantly. A feature under active redesign can invalidate an entire suite in one sprint. This is why "the UI is still changing" is a legitimate, professional reason to defer automation — and why locator strategy ([Chapter 5.2](../part-5-web-automation-playwright/02-locator-strategy.md)) and Page Objects ([Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md)) exist: both are techniques for confining churn damage to one file instead of forty.

**Data coupling.** A test that depends on "customer 4471 exists with three past orders" breaks whenever someone refreshes the database. Tests that create their own data survive; tests that rely on ambient state require perpetual repair. Hence [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md).

**Flakiness.** A test that fails 5% of the time is worse than useless. In a 200-test suite where each test independently has a 5% chance of a false failure, the probability that a full run is clean is `0.95²⁰⁰`, or about **0.0035%** — the suite essentially never passes. Every run demands triage, and within weeks the team stops reading the results. This calculation is why hard waits are banned outright in this course rather than merely discouraged.

The through-line: **most of Parts V and VI exist to reduce the maintenance multiplier.** When you are asked in Part VI to justify a Page Object or a fixture, the honest answer is always some version of "it lowers the cost of change" — and now you know why that is the answer that matters.

### C.8 The automate / defer / keep-manual decision

A test case belongs in one of three buckets. Being able to place cases confidently, and defend the placement, is the gate for this part of the course.

**Automate now** when the check is:

- Run frequently — every release or every commit
- Objective, with a machine-checkable expected result
- Stable, on an interface that is not about to be redesigned
- Tedious or error-prone for a human, or involves many data combinations
- Guarding something whose failure is expensive
- Fast at a low layer, or genuinely requires the UI

**Defer** when the check is valuable but:

- The interface is actively changing — revisit after it settles
- The feature is behind a flag and may be cut
- Prerequisites are missing: no test environment, no test data strategy, no CI
- Higher-priority automation exists — deferral is a prioritization decision, not a judgment on the test

**Keep manual** when the check:

- Requires human judgment: visual design, message tone, usability
- Is exploratory by nature
- Runs once, or a few times ever
- Depends on a system you cannot control or simulate
- Would cost more to automate and maintain than to run by hand for the foreseeable life of the feature

The bucket that gets misused is "defer," which learners often treat as a polite way of saying no. It is not. A deferred case has a **trigger** — "revisit when the checkout redesign ships" — and without a trigger it is just a wish. Write the trigger down, or the deferral becomes a permanent gap nobody remembers agreeing to.

### C.9 Why an untrusted suite has negative value

This deserves its own section because it is counterintuitive and consequential.

A suite with no tests provides no detection and costs nothing. A suite of 300 flaky tests provides *almost* no detection — engineers rerun until green, treat red as noise, and stop reading reports — while costing authoring, maintenance, infrastructure, and triage every single week.

It is worse than that. An untrusted suite is **actively harmful**, because a real failure now hides inside the noise. The team has paid for detection and simultaneously destroyed their ability to act on it. Meanwhile everyone believes they are covered, which suppresses the manual testing that would have caught the defect.

Hence a principle that shapes every rubric in this course: **10 trustworthy tests beat 300 unreliable ones.** When you are choosing between adding coverage and fixing flakiness, fix the flakiness. Always. There is no coverage number that compensates for a signal nobody believes.

### C.10 Automation is software engineering

The last idea in this chapter, and the one that determines your ceiling as an engineer.

Test automation code is **production code**. It is not a script, not a throwaway, not "just tests." It is software that runs on every commit, that your team depends on, and that will outlive the person who wrote it. Therefore all of it applies:

| Practice | Where you'll learn it here |
|---|---|
| Version control, branches, meaningful commits | [Chapter 7.1](../part-7-cicd/01-git-for-automation-engineers.md) |
| Code review | [Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) |
| Design and layering | [Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md), [Part VI](../part-6-framework-engineering/00-module-overview.md) |
| Naming, duplication, clean code | [Chapter 8.1](../part-8-professional-engineering/01-clean-code-for-automation.md) |
| Type safety and error handling | [Chapters 2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md), [2.11](../part-2-programming-fundamentals/11-error-handling.md) |
| CI, containers, reproducibility | [Part VII](../part-7-cicd/00-module-overview.md) |
| Configuration and secrets | [Chapter 6.5](../part-6-framework-engineering/05-configuration.md) |

This is also the honest answer to a question you may be asking: **why does this course spend thirteen chapters on programming before touching Playwright?** Because Playwright is a library, and libraries take days to learn. Engineering a system that stays trustworthy for years takes months, and it is the part that makes you employable. Someone who knows Playwright but not programming can write tests; they cannot own a framework, and the difference in career trajectory is enormous.

It follows that "manual tester learns a tool" does not produce an automation engineer. It produces someone who can record and modify scripts, which is a real skill and a very low ceiling. The transition requires learning to program — which is precisely what Part II is for, and why it is the longest part of this course.

---

## D. QA Context

### D.1 Answering "why haven't you automated that yet?"

You will be asked this, often by someone who believes automation is free. Defensiveness loses; arithmetic wins.

**Weak answer:** "It's really hard to automate, the page is complicated."

**Strong answer:** "I can, and here's the trade. It's about 12 hours to write and stabilize, and the checkout redesign lands in six weeks, which would invalidate most of it — call it another 10 hours of rework. Running it manually costs 20 minutes per release, so 4 hours over that period. I'd rather spend those 12 hours automating the payment API checks, which run on every commit and aren't affected by the redesign. I've put the checkout suite in the backlog with a trigger for when the redesign ships."

The second answer works because it does four things: it accepts that automation is possible, it prices both options, it proposes a better use of the same hours, and it leaves a written trigger so the deferral is not forgotten. Nobody argues with that. And note the second answer is not a refusal — it is a prioritization, which is a conversation a manager can participate in.

### D.2 Presenting an automation proposal

Managers approve automation expecting to see a cost line disappear. That expectation is wrong, and if you do not correct it up front, you will be judged against a benchmark you never agreed to.

What to state explicitly in any proposal:

**1. The benefit is feedback speed, not headcount.** Automation moves defect detection from days to minutes. Say this in cost-curve terms and it lands: "a defect found by CI costs us a rework in the same afternoon; the same defect found in production costs an incident, a hotfix, support load, and possibly a refund program."

**2. Maintenance is a permanent line item.** Put a number on it — "roughly 30% of build cost annually" — before anyone discovers it themselves. A cost you disclosed is a cost that was planned for. A cost that surfaces in month four is a credibility event.

**3. What manual testing you will still be doing, and why.** Exploratory work is where a large share of serious defects come from. If your proposal implies manual testing ends, you have promised something untrue and set yourself up for the D.3 pattern.

**4. The break-even, with assumptions visible.** Show the arithmetic from C.6. Name your assumptions so they can be challenged — challenged assumptions become shared assumptions, which is exactly what you want when the estimate turns out slightly wrong.

### D.3 The anti-pattern: counting tests

Watch for the organization where automation success is measured by test count. It appears in status reports as "we now have 1,400 automated tests," and it is a metric with three fatal properties: it is easy to game, it rewards duplication, and it says nothing about risk.

Teams optimizing for count reliably end up with hundreds of tests on the easy, low-risk surface (a settings page has many fields, and each field yields a test) and near-zero coverage of the hard, high-risk paths. They also never delete anything, because deletion moves the metric backwards, so the suite accumulates redundant and obsolete tests that must be maintained forever.

Metrics worth proposing instead:

| Metric | What it tells you |
|---|---|
| Time from commit to feedback | Where you sit on the cost curve |
| Escaped defect rate | Whether the suite catches what matters |
| Suite pass rate stability | Whether the signal is trusted |
| Flaky test count, trending down | Whether reliability is being managed |
| Critical user journeys automated | Risk-weighted coverage, not raw coverage |
| Mean time to diagnose a failure | Whether failures are actionable |

If you can shift a conversation from the first metric to any of these six, you have done more for the team's testing than a month of writing tests would.

### D.4 Exploratory testing remains your differentiator

There is a temptation, once you can automate, to consider manual testing beneath you. Resist it, for two entirely self-interested reasons.

**It makes your automation better.** Exploring a feature by hand is how you learn where the risk is, which flows are awkward, which states are hard to reach, and what the application does when something goes wrong. Engineers who automate from a requirements document produce suites that cover the specification; engineers who explore first produce suites that cover the *system*.

**It is the part that cannot be commoditized.** Tooling improves constantly, and AI now generates plausible test code quickly. What remains scarce is the judgment to know what is worth testing, to notice that something is subtly wrong, and to ask the question nobody thought of. Those are exploratory skills.

A practical habit for the rest of the course: **before automating any feature, spend twenty minutes using it as a hostile customer would.** Write down what you notice. You will find things no requirement mentioned, and your automation will be aimed better for it. This is exactly the sequence recommended in [Project 4](../projects/project-4-web-automation.md), where locator quality is 20% of the grade and is decided during that manual walkthrough — not while debugging.

---

## E. Code Examples

No code in this chapter. The worked examples are the break-even model in Section C.6 and the decision matrix below, both of which are the artifacts you will actually produce in planning discussions.

### E.1 A decision matrix for ten real cases

The demo shop's regression suite, partially reproduced. Read the reasoning column, not just the verdict.

| # | Test case | Verdict | Reasoning |
|---|---|---|---|
| 1 | Free shipping applies at exactly $100.00 subtotal | **Automate now** | Objective, boundary-critical, money, runs every release; ideal API-layer test |
| 2 | Tax is correct for 12 regions × 3 customer tiers | **Automate now** | 36 combinations; nobody does this by hand reliably; pure data-driven |
| 3 | Checkout page layout looks correct on a 1440px viewport | **Keep manual** | "Looks correct" is a human judgment; screenshot comparison is possible but fragile and low-value here |
| 4 | Declined card preserves the cart | **Automate now** | Objective, high business value, stable behavior |
| 5 | New "gift wrap" feature, UI redesign in 3 weeks | **Defer** | Trigger: after the redesign ships. Automating now means rewriting most of it |
| 6 | The error message for an expired code is clear and polite | **Keep manual** | Assertable as a string; "clear and polite" is not assertable at all |
| 7 | One-off data migration verification before Tuesday's release | **Keep manual** | Runs exactly once; authoring cost can never amortize |
| 8 | Order history is not visible to a different customer | **Automate now** | Security-critical, objective, cheap at the API layer, catastrophic if it regresses |
| 9 | Full purchase flow, happy path, Chrome and Safari | **Automate now** | The definition of a smoke test; runs on every deploy |
| 10 | Third-party fraud service correctly blocks a flagged card | **Defer** | No sandbox available. Trigger: when the sandbox is provisioned. Not a "no" |

Three things to notice about this table, because they generalize:

**The verdicts are driven by frequency and objectivity, not by difficulty.** Case 2 is harder to automate than case 3, and is a much better candidate.

**"Defer" always carries a trigger.** Cases 5 and 10 name the condition that changes the answer. Without it, deferral silently becomes never.

**Several of these belong below the UI.** Cases 1, 2, 4, and 8 are all far cheaper and more stable as API tests than as browser tests — which is the entire subject of [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md).

### E.2 The same 30-case suite under three different realities

To make the point that context decides, here is the C.6 model with only the situational assumptions changed.

| Situation | Release cadence | Maintenance rate | Verdict |
|---|---|---|---|
| Mature product, fortnightly releases, stable UI | 26/year | 40% | **Automate.** Pays back inside year one |
| Same tests, quarterly releases, stable UI | 4/year | 40% | **Keep manual.** Permanent net loss |
| Same tests, fortnightly releases, redesign next quarter | 26/year | ~100% for one year | **Defer most, automate the API-layer subset.** The UI tests would be rewritten; the API checks survive the redesign |

The third row is the realistic one, and it is also the answer to the Section G.3 challenge. Notice that the correct response is not "yes" or "no" but a split — and being able to propose the split is what makes an engineer useful in a planning meeting.

---

## F. Common Mistakes

### F.1 Selling automation as headcount reduction

**The mistake:** "Automating this suite means we won't need the two contract testers."

**Why it happens:** it is the easiest benefit to express in a budget, and managers respond to it.

**What it costs:** you have promised a saving that will not materialize, because the manual work being displaced is scripted execution while the exploratory work remains. When the headcount does not fall, the automation program is judged a failure regardless of the defects it caught.

**Instead:** sell feedback speed and reallocation. "The same two people move from re-running the regression suite to exploratory testing on new features, where they find the defects the suite cannot."

### F.2 Automating a UI that is still being redesigned

**The mistake:** building 40 UI tests for a feature whose design is in active flux.

**Why it happens:** the feature is important, and automating important things feels correct. Nobody wants to say "not yet."

**What it costs:** most of the suite is rewritten within a sprint or two, and the team concludes that automation is inherently unreliable — a conclusion that then blocks the automation that *would* have paid off.

**Instead:** automate the layer that is not churning. Business rules usually live in an API that is far more stable than the interface on top of it. Defer the UI tests with an explicit trigger.

### F.3 Reporting test count as a success metric

**The mistake:** "We wrote 220 automated tests this quarter."

**Why it happens:** it is countable, it goes up, and it looks like productivity.

**What it costs:** it optimizes for the easy surface, rewards duplication, and makes deleting obsolete tests feel like regression. See Section D.3 — the failure mode is systematic, not occasional.

**Instead:** report risk coverage and feedback speed. "The five critical journeys are covered end to end, and a broken purchase flow now surfaces within nine minutes of the commit."

### F.4 Omitting maintenance from the business case

**The mistake:** proposing automation with authoring cost only.

**Why it happens:** it is the only cost you can see at proposal time, and including maintenance weakens the pitch.

**What it costs:** in month four, when half your week goes to fixing tests, it looks like either an unexpected problem or incompetence. Both damage the case for future investment.

**Instead:** state a maintenance percentage up front and revise it with real data after two quarters. A disclosed cost is a planned cost.

### F.5 Automating the exploratory finding instead of the risk it revealed

**The mistake:** exploratory testing uncovers a defect where applying a discount twice doubles the reduction; you automate exactly that click sequence and move on.

**Why it happens:** the reproduction steps are right there, and turning them into a test feels like the obvious follow-up.

**What it costs:** you have covered one instance of a class. The underlying risk — that the discount engine has no idempotency protection — has other instances: replaying the request, two browser tabs, a network retry. Those remain wide open.

**Instead:** ask what class of defect this belongs to, then automate the class where it is cheapest to check. Usually that is a handful of API tests, not a UI reproduction. Confirm the specific case too, but do not stop there.

### F.6 Assuming a tool makes you an automation engineer

**The mistake:** learning Playwright's API and considering the transition complete.

**Why it happens:** tool tutorials produce a working test within an hour, which feels like competence.

**What it costs:** a ceiling. You can write and modify tests but cannot design a framework, diagnose a race condition, or explain why the suite takes forty minutes. When the suite grows past a hundred tests, it becomes unmaintainable and you cannot say why.

**Instead:** learn to program properly, which is what Part II is for. The tool is the easy part and always will be.

### F.7 Treating "defer" as a soft no

**The mistake:** putting cases in the defer bucket with no trigger and no revisit date.

**Why it happens:** deferral resolves the immediate conversation without conflict.

**What it costs:** a permanent coverage gap that nobody remembers choosing. Six months later a defect escapes in that area and the honest answer is "we meant to automate that."

**Instead:** every deferral names a condition — "when the redesign ships," "when the sandbox exists," "after the Q3 suite lands" — and goes in the backlog where someone will see it again.

---

## G. Exercise

Suggested total time: 100 minutes. Do them in order.

### G.1 Easy — Sort ten cases (20 min)

For each case below, mark **automate now**, **defer**, or **keep manual**, and give a one-line reason. For any deferral, state the trigger.

| # | Test case |
|---|---|
| 1 | Verify the cart subtotal updates when quantity changes from 1 to 3 |
| 2 | Verify the product image is not stretched or distorted on the detail page |
| 3 | Verify that an order placed by customer A is not visible to customer B |
| 4 | Verify the checkout button is disabled while payment is processing |
| 5 | Verify the new wishlist feature, which is behind a flag and may be cancelled |
| 6 | Verify that the "your order is confirmed" email arrives and contains the order number |
| 7 | Verify password reset works end to end, including the emailed link |
| 8 | Verify the site is usable with a screen reader |
| 9 | Verify shipping cost for 15 combinations of weight, destination, and speed |
| 10 | Verify that a data migration ran correctly before Thursday's one-time cutover |

Then answer two questions in writing:

**A.** Which of your "automate now" cases would be cheaper and more stable at the API layer than through the browser? (There are at least four.)

**B.** Case 8 is marked keep-manual by most learners, and case 2 likewise. Is there a defensible partial-automation position for either? What exactly would you automate, and what would remain human?

### G.2 Medium — Build the break-even model (35 min)

A 40-case regression suite for the demo shop's catalogue and search.

| Input | Value |
|---|---|
| Manual execution, full suite | 5 hours |
| Release cadence | Monthly (12/year) |
| Authoring estimate | 2 hours per case |
| Automated execution | 8 minutes |
| Triage per run | 15 minutes |
| Annual maintenance | 25% of authoring (API-heavy suite, stable UI) |
| Loaded hourly cost | $60 |

**Task A.** Compute manual annual cost, automation year-one cost, ongoing annual cost, and the cumulative position at years one, two, and three. Show your working as in Section C.6.

**Task B.** State the break-even point in months, and make your rounding assumption explicit.

**Task C.** Sensitivity analysis. Recompute the recommendation if:

1. Releases become weekly (52/year)
2. Releases become quarterly (4/year)
3. Maintenance is 50% rather than 25%
4. Authoring takes 4 hours per case rather than 2

Which single variable changes the recommendation most? Why does that make sense?

**Task D.** List three assumptions in this model that you consider unreliable, and say what evidence would firm each one up. This is the most important task in the exercise — the arithmetic is easy, and knowing which inputs are soft is what makes the model honest.

### G.3 Challenge — The recommendation memo (45 min)

**Situation.** You are the sole automation engineer on a team of six. The demo shop's checkout flow is the highest-revenue path in the product and currently has zero automation. It is regression-tested manually before every release: 6 hours, fortnightly.

Three constraints:

1. The checkout **UI redesign** is scheduled to land in **10 weeks**. The design is not final.
2. The checkout **API contract is stable** and is not part of the redesign.
3. You have roughly **30 hours** of automation capacity available in the next 10 weeks, total.

**Task.** Write the memo you would send your engineering manager. Maximum 400 words plus one table.

It must contain:

- A recommendation that is neither "automate everything" nor "automate nothing"
- What you will automate in the next 10 weeks, and at which layer
- What you will defer, with an explicit trigger for each item
- What will remain manual after the redesign, permanently, and why
- The cost argument, with numbers and visible assumptions
- The risk you are accepting by not automating the UI now, stated plainly rather than buried
- What you need from others (test data, environments, a stable design, `data-testid` attributes in the new UI)

That last bullet is the one experienced engineers include and beginners omit. If the redesign is happening anyway, **asking developers to add stable test attributes while they build it** costs them almost nothing and saves you weeks later. Getting that request in before the design is final is worth more than any test you could write in those 10 weeks.

<details>
<summary>A hint on the shape of a strong answer</summary>

The strong answer splits by layer rather than by feature. The API contract is stable and the business rules — pricing, discounts, shipping thresholds, tax, order creation, authorization — all live below the UI. Automating those consumes most of your 30 hours, survives the redesign untouched, and covers the majority of the actual financial risk. What genuinely requires the browser is a small number of end-to-end journeys, and those are precisely what the redesign will break, so they wait for the trigger. Meanwhile you spend two of your thirty hours writing the test-attribute request and reviewing the new design for testability, which is the highest-leverage work available to you in this period.

</details>

---

## H. Coding Assignment

No code. The applied deliverable:

### Assignment 1.2 — Automation cost-benefit analysis

**Objective.** Produce a recommendation a manager could approve or reject on its merits, demonstrating that you can price automation honestly, prioritize by risk and frequency, and defend a decision not to automate.

**The suite.** Twenty regression cases for the demo shop.

| # | Case | Manual time |
|---|---|---|
| 1 | Login with valid credentials | 2 min |
| 2 | Login with invalid password shows the correct error | 2 min |
| 3 | Login is blocked after 5 failed attempts | 4 min |
| 4 | Product search returns matching results | 3 min |
| 5 | Product search with no matches shows the empty state | 2 min |
| 6 | Search result images are not distorted | 5 min |
| 7 | Add to cart updates the cart badge count | 2 min |
| 8 | Change quantity recalculates line and cart totals | 4 min |
| 9 | Remove last item shows the empty-cart state | 3 min |
| 10 | Free shipping at exactly $100.00 subtotal (REQ-114) | 4 min |
| 11 | Shipping cost across 15 weight/destination combinations | 25 min |
| 12 | Valid percentage discount code reduces the subtotal | 3 min |
| 13 | Expired discount code is rejected with a clear reason | 3 min |
| 14 | Discount is applied before the free-shipping evaluation | 4 min |
| 15 | Tax is computed on the post-discount subtotal | 4 min |
| 16 | Checkout field validation for 8 invalid address inputs | 12 min |
| 17 | Declined card preserves the cart and shows the decline | 5 min |
| 18 | Successful order produces a confirmation number | 3 min |
| 19 | Confirmation email arrives with the correct order number | 6 min |
| 20 | Customer A cannot view customer B's order history | 5 min |

**Context you must use.**

- Releases are **fortnightly** (26/year)
- The **UI is stable**; no redesign planned
- A **staging API** is available and documented
- No automation exists yet; **no CI pipeline exists yet**
- You have **60 hours** of one-time capacity, plus **4 hours per week** ongoing
- Loaded cost: **$60/hour**

**Deliverable.** `automation-analysis.md`, maximum 3 pages including tables.

**Requirements.**

| # | Requirement |
|---|---|
| 1 | Every one of the 20 cases classified **automate-now**, **automate-later**, or **keep-manual** |
| 2 | Each classification carries a one-line reason; each deferral carries a trigger |
| 3 | For each automate-now case, the **layer** you would use — API or UI — and why |
| 4 | Total manual cost per year for the full suite, computed |
| 5 | Authoring estimate for your automate-now set, per case, with your estimating basis stated |
| 6 | Annual maintenance estimate, with the percentage you chose and a justification for choosing it |
| 7 | Triage and infrastructure costs included as line items — including the CI pipeline you do not yet have |
| 8 | Break-even point in months, and cumulative position at years 1, 2, and 3 |
| 9 | A recommendation that fits inside 60 hours. If your plan does not fit, prioritize and say what was cut |
| 10 | At least 3 cases classified keep-manual, each with a reason that is not "too hard" |
| 11 | A stated list of assumptions, and what evidence would confirm or refute each |
| 12 | One paragraph on **what you would measure** in six months to know whether this was the right call |

**Constraints.**

- You may not classify all 20 as automate-now. Doing so ignores requirement 9 and misreads several cases.
- Do not exceed 60 hours of authoring. Capacity is the constraint that makes this an engineering decision.
- Case 11 (15 combinations) and case 16 (8 inputs) deserve specific thought about how they are automated, not just whether.
- Case 19 involves email. Say how you would handle it; if the honest answer is that you need infrastructure you do not have, say that and defer with a trigger.

**Acceptance criteria.**

- [ ] All 20 cases classified with reasons
- [ ] Every deferral has a trigger
- [ ] Layer stated for every automate-now case, with at least 8 at the API layer
- [ ] Complete cost model: authoring, maintenance, execution, triage, infrastructure
- [ ] Break-even computed and stated in months
- [ ] The plan fits in 60 hours, with cuts named if needed
- [ ] At least 3 keep-manual cases with substantive reasons
- [ ] Assumptions listed with the evidence that would test them
- [ ] Six-month success metrics stated, and none of them is "number of tests"
- [ ] Under 3 pages

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Classification judgment | 30% | Verdicts reflect frequency, objectivity, and risk; deferrals have real triggers; keep-manual choices are principled |
| Cost model completeness and honesty | 25% | All five cost components present; maintenance justified; no cost hidden to strengthen the pitch |
| Layer selection | 15% | Business rules pushed to the API; UI reserved for cases that genuinely need a browser |
| Prioritization under constraint | 15% | Fits 60 hours; cuts explicit and defensible; highest-risk cases covered first |
| Assumptions and measurement | 15% | Soft inputs identified; six-month metrics measure risk and feedback speed, not volume |

**Self-check before submitting.** Give it to a peer and ask two questions: "Which of my recommendations would you argue with?" and "What did I not tell you that you would need to approve this?" A memo that survives both is ready.

> **AI usage:** permitted, not required. If you use it, note where. Be aware of a specific weakness: AI will readily produce a cost model, but it tends to classify nearly everything as automate-now and to omit the infrastructure and triage lines. The judgment calls — which three cases stay manual, and what you cut to fit 60 hours — are what is being assessed here, and they are exactly what generated answers get wrong.

---

## I. Quiz

Eight questions. Answer key: [`answer-keys/part-1/02-manual-vs-automation-testing.answers.md`](../answer-keys/part-1/02-manual-vs-automation-testing.answers.md).

**1.** Which of these does automation genuinely replace?

- A) Manual testing
- B) Scripted manual execution
- C) Exploratory testing
- D) Test design

**2.** True or false: if a test case can be automated, it should be automated.

**3.** A 30-case suite takes 6 hours to run manually. Authoring is 2.5 hours per case, annual maintenance is 40% of authoring, and the team releases **twice a year**. Which is the sound recommendation?

- A) Automate — automation is always cheaper over time
- B) Automate — manual execution does not scale
- C) Keep manual — 12 hours per year of manual execution is less than the ongoing annual automation cost, and the 75-hour investment never pays back
- D) Automate the UI tests only

**4.** In a 200-test suite where each test independently has a 5% chance of a false failure, roughly how often does a full run pass cleanly?

- A) About 95% of runs
- B) About 36% of runs
- C) About 5% of runs
- D) Essentially never — about 0.0035% of runs

**5.** Which of these is the strongest argument for automation when presenting to a manager?

- A) It will reduce the number of testers needed
- B) It moves defect detection from days to minutes, which reduces the cost of each defect
- C) It will let us claim a higher test count
- D) It eliminates human error from testing

**6.** A feature's UI is being redesigned next month, but its API contract is stable. Its business rules are revenue-critical and untested. What is the best plan?

- A) Automate the UI tests now so coverage exists before the redesign
- B) Automate nothing until the redesign ships
- C) Automate the business rules at the API layer now; defer the UI tests with the redesign as the trigger
- D) Keep everything manual permanently, since redesigns will recur

**7.** Which statement about an untrusted suite is correct?

- A) It has less value than a reliable suite, but more than no suite
- B) It has roughly the same value as no suite, since it is ignored
- C) It has negative value: it consumes cost, hides real failures in noise, and suppresses the manual testing that would have caught them
- D) Its value depends entirely on how many tests it contains

**8.** Scenario judgment. Your manager says: "The new reporting module is our priority. Can you have it fully automated by the end of the sprint?" You know the module's UI is still changing daily, no test data strategy exists for it, and one sprint would cover perhaps a third of the cases even under ideal conditions. Which response is most professional?

- A) "Yes, I'll do my best."
- B) "No, that's not realistic."
- C) "Not fully, and I'd advise against trying. The UI is changing daily, so anything I write this sprint gets rewritten. What I can do this sprint: automate the report-calculation logic at the API layer, which is stable and is where the actual risk is, plus a manual charter for the UI so we have coverage now. I'd revisit UI automation once the design settles — I'll add it to the backlog with that trigger. To make that faster, I'd like to ask the developers to add test IDs while they're still building it."
- D) "Automation isn't ready for that module yet, so it'll have to stay manual."

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| The asymmetry | Manual is cheap to create and expensive to repeat; automated is expensive to create, cheap to repeat, and expensive to keep working |
| Two kinds of manual testing | Automation replaces scripted execution; it does not touch exploratory testing |
| What automation provides | Repeatability, speed, consistency, scale, evidence — and above all, fast feedback |
| What automation cannot do | Judge, be curious, validate, feel friction, or notice what is absent |
| The five costs | Authoring, maintenance, infrastructure, triage, and lost trust |
| Break-even | Determined mostly by execution frequency; the same suite can be right or wrong to automate |
| Maintenance multiplier | Interface churn, data coupling, and flakiness inflate the recurring cost |
| Three buckets | Automate now, defer with a trigger, keep manual |
| Untrusted suites | Have negative value, not merely low value |
| Automation is engineering | Test code is production code, which is why Part II exists |

### Mistakes recap

Selling automation as headcount reduction · automating a churning UI · counting tests as a metric · omitting maintenance from the business case · automating an exploratory finding instead of the risk class it revealed · assuming a tool makes you an engineer · treating "defer" as a soft no.

### Numbers worth remembering

Not as facts to recite, but as starting estimates until you have your own team's data:

- Annual maintenance: **15-30%** of authoring for API tests, **30-50%** for UI tests
- Authoring is roughly **30-40%** of an automated test's lifetime cost
- A 5% per-test false-failure rate makes a 200-test suite **essentially never** pass cleanly
- Execution **frequency** is the variable that most often decides the automation question

### Competency check

> **Can you say "we should not automate this yet" and support it with a cost argument your manager would accept?**

Test yourself on the G.3 scenario. If your answer is a flat yes or no, try again — the professional answer is almost always a split by layer, with triggers on what is deferred and a request for what you need from others.

Two secondary checks:

- Given a suite, a cadence, and an authoring estimate, can you compute break-even and name your softest assumption?
- Can you explain, without notes, why 300 flaky tests are worse than none?

**Gate for this chapter:** you are ready for [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md) when you can look at a test case and instinctively ask *how often does this run, is the expected result objective, and how stable is the interface it touches?* Chapter 1.3 adds the fourth question — which layer should it live at — and that question turns out to matter as much as all three of these combined.

---

[← 1.1 What Is Software Testing?](01-what-is-software-testing.md) · [Next: 1.3 Test Strategy and the Test Pyramid →](03-test-strategy-and-the-test-pyramid.md)
