# Chapter 1.4 — Regression, Smoke, Sanity, and Test Case Quality

🟢 **Beginner** · [Part I Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | I — Software Testing Fundamentals |
| **Estimated time** | 1 session (90 min) + 3.5 hours independent work |
| **Prerequisite chapters** | [1.1](01-what-is-software-testing.md), [1.2](02-manual-vs-automation-testing.md), [1.3](03-test-strategy-and-the-test-pyramid.md) |
| **Next chapter** | [2.1 Thinking Like a Programmer](../part-2-programming-fundamentals/01-thinking-like-a-programmer.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Differentiate** smoke, sanity, and regression suites by purpose, scope, trigger, and runtime budget.
2. **Design** a smoke suite for a given application that runs within a stated time budget, and **defend** its contents.
3. **Explain** why regression suites grow unsustainably and **describe** techniques for keeping them viable.
4. **Evaluate** a written test case against clarity, atomicity, determinism, independence, and verifiability.
5. **Rewrite** a poorly written test case so that its expected result is objectively checkable.
6. **Identify** test cases that should be deleted, and **justify** deletion as a maintenance activity.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Purpose of testing; evidence under constraints | [Chapter 1.1](01-what-is-software-testing.md) |
| Automation cost and maintenance model | [Chapter 1.2](02-manual-vs-automation-testing.md) |
| Layer placement and risk-based selection | [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md) |

No programming required.

---

## C. Concept Explanation

### C.1 Nobody runs all the tests

Teams do not run "the tests." They run a **specific selection for a specific trigger**, because each trigger asks a different question and has a different time budget.

The three standard selections answer three different questions:

- **Smoke:** *Is this build worth testing further?*
- **Sanity:** *Did this specific change work, and did it break its neighbourhood?*
- **Regression:** *Does everything that used to work still work?*

Same application, same library of tests, three different selections. Learners who treat these as three separate suites to be written miss the point: they are three *views* into one library, distinguished by what question is being asked at that moment.

Getting the vocabulary right is not pedantry. When a colleague says "smoke passed," you need to know whether that means four minutes of critical-path coverage or a forty-minute half-regression, because your next decision depends on it.

### C.2 The three suites compared

| | Smoke | Sanity | Regression |
|---|---|---|---|
| **Question** | Is the build fundamentally functional? | Did this change work, and what did it touch? | Does everything still work? |
| **Shape** | Broad and shallow | Narrow and deep | Broad and deep |
| **Scope** | Critical paths only, one case each | One feature area, thoroughly | Everything of value |
| **Size** | 5-20 checks | 10-50 checks | Hundreds to thousands |
| **Runtime budget** | **Under 5 minutes**, ideally under 3 | Under 10 minutes | 10-60 minutes |
| **Trigger** | Every deploy, every commit | After a fix or a focused change | Nightly, or before a release |
| **On failure** | Stop; the build is not worth testing | The fix is not done | Triage and decide |
| **Selection basis** | "Would we roll back for this?" | Change impact | Accumulated value |

Two entries deserve emphasis.

**Smoke's runtime budget is the defining property**, not its contents. A smoke suite that takes 25 minutes is not a slow smoke suite; it is a partial regression suite wearing the wrong name, and its practical fate is that people stop running it after every deploy. If you can only remember one thing about smoke suites, remember the budget.

**"On failure: stop"** is what makes a smoke suite worth having. Its purpose is to prevent waste. If the login endpoint is returning 500, there is no value in running four hundred more tests or in a manual tester spending an afternoon — everything will fail, and the report will contain four hundred failures that all mean one thing.

### C.3 Choosing what goes in the smoke suite

This is the most commonly botched design task in test automation, because the instinct is to include the most important *features*, and that is subtly the wrong criterion.

The right criterion is a question:

> **If this check failed, would we roll back the deployment immediately?**

If yes, it belongs in the smoke suite. If the answer is "we'd file a ticket," it does not — however important the feature is.

Applied to the demo shop:

| Check | Roll back? | In smoke? |
|---|---|---|
| Homepage loads | Yes | ✅ |
| A user can log in | Yes | ✅ |
| Product search returns results | Yes | ✅ |
| A product can be added to the cart | Yes | ✅ |
| Checkout completes and returns an order number | Yes | ✅ |
| Order appears in order history | Yes | ✅ |
| Free shipping applies at exactly $100.00 | No — file a ticket | ❌ |
| Expired discount code shows the right message | No | ❌ |
| Tax is correct for Oregon | No | ❌ |
| Footer privacy link works | No | ❌ |

Six checks. Under three minutes. Notice that the excluded items include things that genuinely matter — a broken shipping threshold overcharges customers — but their failure does not make the build worthless. They are caught minutes later by the regression suite, and that is soon enough.

Three principles fall out of this:

**One case per path, not every case.** The smoke suite proves checkout *can* complete, with one representative order. It does not check declined cards, discount interactions, or address validation.

**Prefer breadth over depth.** Six shallow checks across six areas beat twenty deep checks in one, because a smoke suite is looking for catastrophic breakage, which is rarely subtle.

**Put it at the cheapest layer that answers the question.** Most of the demo shop's smoke checks can be API calls taking milliseconds. Keep one or two genuine browser journeys — the customer's actual experience is the point — and get everything else from the API. This is [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md) applied to suite design, and it is how a smoke suite fits in three minutes.

### C.4 Why regression suites become unsustainable

Regression suites grow monotonically, and the growth is driven by three forces that are each individually reasonable.

**Features accumulate.** Every sprint adds behavior, and behavior needs protecting. The suite grows because the product grows, and there is nothing wrong with this.

**Defects add tests.** Good practice says every fixed bug gets a test so it cannot return. Also correct — and it means the suite grows even when the product does not.

**Nothing is ever removed.** Deletion feels like losing coverage. It shows up badly in a metric. Nobody is thanked for it. So obsolete tests, redundant tests, and tests nobody understands stay forever.

The result is predictable: a suite that took eight minutes in year one takes fifty in year three, runs nightly instead of per-commit, and pushes the team back up the cost-of-defect curve from [Chapter 1.1](01-what-is-software-testing.md). Nobody decided this. It accumulated.

Four techniques keep a regression suite viable, in rough order of leverage:

**1. Move tests down a layer.** The highest-leverage action available, and the whole point of [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md). Twenty UI tests becoming twenty unit tests plus one UI test converts two minutes into milliseconds.

**2. Delete deliberately.** See Section C.8. This requires a policy, because it will not happen by individual initiative.

**3. Parallelize and shard.** Real and limited. Parallelism divides wall-clock time; it does not reduce cost, and it introduces isolation requirements ([Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md)). Reach for it after 1 and 2, not before.

**4. Select by risk and change impact.** Run the tests affected by what changed, plus a fixed high-risk core. Powerful, and it requires knowing which tests cover which code — which is more infrastructure than most teams have. Treat it as an aspiration, and be suspicious of any team that claims to do it well without tooling to support it.

Notice what is *not* on the list: adding retries, marking tests as skipped, or maintaining a "known flaky" exclusion file. Those manage the appearance of the problem.

### C.5 Where the suites live in a pipeline

This is the preview of [Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md), and it is the reason suite design is an engineering decision rather than a documentation exercise.

```text
Developer pushes a commit
        |
        v
  [ lint + typecheck ]         ~30 s    fail fast, cheapest possible signal
        |
        v
  [ unit + integration ]       ~45 s    developers' layers
        |
        v
  [ API tests ]                ~2 min   your Project 3 suite
        |
        v
  [ UI smoke ]                 ~1 min   the 6 checks from C.3
        |
        v
     merge to main
        |
        v
  [ full UI regression ]       ~8 min   your Project 4 suite
        |
        v
     deploy to staging
        |
        v
  [ smoke against staging ]    ~2 min   does the deployed thing work?
        |
        v
     nightly: full regression, all browsers, ~25 min
```

Read this diagram as a set of budgets, because that is what it is. Each stage has a time allowance, and the allowance determines what can go in it. When someone asks whether a new test should go in the per-commit stage, the answer is arithmetic: does it fit in the remaining budget, and is it worth more than what it would displace?

The ordering rule is **fail fast and cheap**. Typecheck before unit tests, unit before API, API before UI. There is no reason to spend four minutes on browser tests when a typo would have been caught in thirty seconds.

### C.6 Anatomy of a test case

Now the chapter narrows from suites to individual cases, because a suite is only as good as its members.

A complete test case has seven parts. In practice teams compress or omit some, and the omissions are where problems come from.

| Part | Purpose | Common failure |
|---|---|---|
| **ID** | Stable reference for traceability | Renumbering, so links to it rot |
| **Title** | What behavior is verified, readable in a list | "Test checkout" — describes an area, not a behavior |
| **Preconditions** | The state required before step 1 | Left implicit, so the case only works for its author |
| **Test data** | The specific values used | "A valid product" — unspecifiable, unrepeatable |
| **Steps** | The actions, in order | Mixed with assertions; too coarse or absurdly fine |
| **Expected result** | The objectively checkable outcome | "Works as expected" — the single most common defect |
| **Postconditions** | Cleanup required | Omitted, so the case pollutes state for the next one |

A useful title convention, which transfers directly to automated test names in [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md):

> **[condition] → [expected outcome]**
>
> "Cart subtotal of exactly $100.00 → shipping shows FREE"
> "Discount code past its expiry date → rejected with 'expired', cart unchanged"

You can read those in a failure report and know what broke without opening anything. Compare with "Test shipping" and "Discount test 3."

### C.7 The five quality criteria

These are the criteria you will be graded against for the rest of the course. They apply identically to manual cases and automated tests — which is exactly why they are introduced here, before you can write code.

**1. Atomic — one reason to exist.**
A case verifies one behavior. When it fails, the failure names the behavior.

> ❌ "Verify checkout: add items, apply discount, validate address, pay, check email, view order history"
> ✅ Six separate cases, each with one expected result

A case with six expected results has six reasons to fail, and its failure tells you almost nothing. Worse, when step 3 fails, steps 4-6 never run, so one defect hides three more.

**2. Deterministic — the same result every time.**
Given the same starting state, the case produces the same outcome on every run. Cases that depend on today's date, on a record someone else created, on execution order, or on "whatever is in the cart" are not deterministic.

> ❌ "Verify that orders from last month appear in the report"
> ✅ "Given an order dated 2026-03-15 and a report for March 2026, the order appears in the report"

This criterion becomes the entire subject of [Chapter 5.5](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md), and the arithmetic in [Chapter 1.2](02-manual-vs-automation-testing.md) explains why it is treated so severely.

**3. Independent — no dependence on other cases.**
A case sets up its own state and can run alone, first, last, or concurrently.

> ❌ "TC-102: using the order created in TC-101, verify cancellation"
> ✅ "TC-102: given a confirmed order created by this test, verify cancellation"

Dependent cases produce cascading failures, cannot be parallelized, and cannot be run individually to reproduce a defect. Every project rubric in this course carries a 20% deduction for order dependence, and this is where the requirement starts.

**4. Verifiable — two people would agree on pass or fail.**
The expected result is objectively checkable. This is the criterion violated most often and most damagingly.

> ❌ "Expected: the page loads quickly and looks correct"
> ✅ "Expected: the cart page reaches interactive state within 2 seconds on a 4G profile, and the shipping line reads exactly 'FREE'"

The test to apply: **could two engineers who both ran this case disagree about whether it passed?** If yes, it is not verifiable, and it cannot be automated faithfully — an automated version is just one engineer's guess made permanent.

**5. Traceable — connected to a requirement or a risk.**
Each case links to the requirement it verifies or the defect it prevents recurring.

> ❌ "Verify shipping is free over $100"
> ✅ "Verify shipping is free at a subtotal ≥ $100 (REQ-114)"

Traceability answers a question you will face constantly: the requirement changed — which tests must change with it? Without it, you find out when the suite goes red and you cannot tell whether the test or the application is wrong.

Two secondary properties worth having: **readable** (a non-programmer can understand what is being verified) and **maintainable** (the case does not restate implementation details that will change for reasons unrelated to behavior).

### C.8 Deletion is maintenance, not loss

Every automated test is a liability as well as an asset. It costs maintenance, runtime, and attention. When its value drops below that cost, keeping it is a net negative — and yet deletion is rare, because it feels like losing something and looks bad in a metric.

Four categories that should be deleted, or at least reviewed with a bias toward deletion:

**Tests that have never failed in two years.** Either the behavior is genuinely immutable, or the test cannot fail. Check which. A test that cannot fail is worse than no test, because it produces a green result that means nothing.

**Tests that fail so often they are ignored.** Either fix the cause or delete it. A test in a "known flaky" exclusion list is already deleted in practice; leaving it in the codebase preserves only the illusion of coverage.

**Tests nobody understands.** A test whose purpose cannot be determined cannot be maintained. When it fails, nobody knows whether the failure matters. Archaeology has a cost, and sometimes deletion is the honest choice.

**Tests made redundant by better coverage.** When fifteen discount cases move to unit tests, the fifteen UI versions should be deleted, not kept "just in case." This is the [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md) migration, and leaving both is how teams end up maintaining coverage twice.

A workable policy, worth proposing on any team you join:

> Quarterly, review any test that (a) has not failed in 12 months, (b) has failed more than 5% of runs, or (c) has no traceable requirement. For each, decide: keep with a stated reason, fix, or delete. Record the decision.

The value of the policy is that it makes deletion a scheduled, blameless activity rather than an individual act of destruction requiring courage.

---

## D. QA Context

### D.1 "Automate the existing 800 test cases"

You will be asked this, probably in your first automation role. It is the most consequential moment in the project, and the wrong answer costs a year.

Why it is the wrong request:

- Many of those 800 are not verifiable, so they cannot be automated faithfully — only guessed at.
- Many are not independent; they were written for a human executing them in order.
- Many belong at a lower layer, and translating them one-to-one produces the ice cream cone from [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md).
- Many are redundant, obsolete, or cover behavior nobody has used in years.
- 800 UI tests at 6 seconds each is 80 minutes, and nightly-only feedback.

What to say instead:

> "I don't think one-to-one translation is the best value. Let me audit them first — I'd expect roughly a third to be duplicates or obsolete, about half to be better verified at the API layer where they'll run in milliseconds instead of seconds, and some to be unverifiable as written, so I'd need to clarify the expected result with whoever owns the requirement. My proposal: start with the 30 cases covering the revenue path, automate those at the right layers in three weeks so we have something running in CI, and audit the rest as we go. That gets us feedback on the critical path this month rather than a complete suite in a year."

This works because it does not refuse, offers a faster path to visible value, and reframes 800 cases as an audit rather than a transcription job. It also sets the expectation early that the count will go *down*, which is much easier to say now than after you have deleted 200 of them.

### D.2 An ambiguous manual case becomes an unfaithful automated test

Here is the mechanism, and it is worth understanding precisely because it is invisible until it costs you.

A manual case reads:

> **TC-341** — Verify the cart updates correctly when quantity changes.
> Expected: The cart updates correctly.

A human executing this uses judgment. They change a quantity, glance at the line total, the subtotal, the shipping, the tax, and the badge, and they notice if anything looks wrong — including things the case never mentioned.

Now automate it. You must choose what "correctly" means, and whatever you choose, you have narrowed it. Suppose you assert the line total. Your automated test now passes while the subtotal is wrong, because you did not check the subtotal — and the manual case that a human would have caught this with has been retired, because "it's automated now."

**Automation converted a broad, judgment-based check into a narrow, specific one, and the coverage loss is invisible.** The suite is green, the case is marked automated, and the defect ships.

Two habits prevent this:

**Clarify before automating.** If the expected result is not verifiable, go and find out what it should be. This is not bureaucracy; it is the only way the automated version means anything. Frequently the answer reveals a requirement gap, which is a [Chapter 1.1](01-what-is-software-testing.md) validation finding worth more than the test.

**Automate the behaviors, not the case.** TC-341 becomes four atomic tests — line total, subtotal, shipping recalculation, badge count — each with an explicit expected value. Four faithful tests replacing one unfaithful one, and now a failure names which of the four broke.

### D.3 Suite design is CI design

The suites you design determine what your pipeline can do, which determines your detection latency, which determines your position on the cost curve. The chain is short and rigid.

| Design decision | Pipeline consequence |
|---|---|
| Smoke under 3 minutes | Can run on every commit and after every deploy |
| Smoke at 25 minutes | Runs "when someone remembers," which is rarely |
| API suite under 5 minutes | Per-commit gate; developers get feedback before they context-switch |
| Regression at 50 minutes | Nightly only; detection latency of up to a day |
| Tests order-dependent | Cannot parallelize, so runtime cannot be reduced by hardware |

The last row is the one that traps teams. Order-dependent tests put a ceiling on your options: no matter how much CI capacity you buy, the suite must run serially. This is why independence is a first-class requirement in every project in this course rather than a style preference.

### D.4 Deletion is a political problem more than a technical one

You will be technically correct that a test should be deleted and still find it hard, for reasons worth anticipating.

Someone wrote it, and deletion can read as criticism. Test count may be a reported metric, so removal looks like regression. And there is always a defensible-sounding objection: "what if that defect comes back?"

Three things that make it easier:

**Make it a policy, not an act.** A quarterly review applied uniformly is impersonal. Deleting Ahmad's test on a Tuesday is not.

**Frame it as reallocation.** "I'm deleting fifteen UI tests and adding fifteen unit tests plus one UI test. The same rules are covered, in 15 milliseconds instead of 90 seconds, with better boundary coverage." Now the conversation is about improvement, and this is the same reframing that worked in [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md)'s migration exercise.

**Answer the "what if it comes back" objection with the record.** "This test has not failed in two years. If the behavior is that stable, we are paying maintenance for insurance against something that has not happened. And if it *cannot* fail, we have been getting a false green — let me check which it is before deleting." That last offer is genuine, cheap, and usually settles it: mutate the expected value and see whether the test notices.

---

## E. Code Examples

No code. The worked examples are test case rewrites and a suite composition table — the artifacts you produce in Section H.

### E.1 Suite composition for the demo shop, with budgets

```text
SMOKE  —  6 checks  —  budget 3 min  —  trigger: every commit + every deploy
  S1  API   GET /health returns 200                                    ~50 ms
  S2  API   POST /auth/login with valid credentials returns a token   ~200 ms
  S3  API   GET /products?q=lamp returns at least one result          ~150 ms
  S4  API   POST /cart/items adds a product; GET /cart shows it       ~400 ms
  S5  UI    happy-path purchase: login -> add -> checkout -> order #   ~12 s
  S6  UI    the order appears in order history                         ~6 s
  Actual runtime: ~19 s. Budget exists for growth.

SANITY (discount area)  —  14 checks  —  budget 10 min  —  trigger: a discount fix
  API   valid percentage code reduces the subtotal
  API   valid fixed-amount code reduces the subtotal
  API   expired code rejected with reason "expired"
  API   already-used code rejected
  API   code below minimum spend rejected; at minimum accepted (2 cases)
  API   discount applied before free-shipping evaluation (REQ-414)
  API   tax computed on post-discount subtotal (REQ-415)
  API   removing a code restores subtotal, shipping, and tax
  UNIT  percentage rounding at $10.01, $0.03, $99.99 (3 cases)
  UI    applying a code updates displayed totals without a reload
  Actual runtime: ~4 s. Deep in one area, silent about everything else.

REGRESSION  —  ~330 checks  —  budget 10 min  —  trigger: merge to main
  All unit tests                       ~180 checks     ~2 s
  All integration tests                 ~30 checks    ~15 s
  All API tests                          ~70 checks    ~90 s
  All UI tests, Chromium                 ~35 checks   ~3.5 min
  Actual runtime: ~5.5 min with 4 workers. Fits.

NIGHTLY  —  budget 30 min  —  trigger: schedule
  Full regression on Chromium + Firefox + WebKit
  Mobile viewport pass
  Accessibility rule scan
  Actual runtime: ~18 min.
```

Three things to notice. **The smoke suite is mostly API calls**, which is why it fits in seconds rather than minutes — only S5 and S6 need a browser, and they need it because "can a customer actually buy something" is the question. **Sanity is a selection, not a separate suite**: every check in it also lives in regression. And **every suite states a budget and its actual runtime**, so drift is visible before it becomes a crisis.

### E.2 Five test case rewrites

The before/after pairs are the core of this chapter. Read the "problems" line before the rewrite.

---

**Example 1 — the unverifiable expected result**

```text
BEFORE
  TC-341  Verify cart updates
  Steps:    1. Add a product to the cart
            2. Change the quantity
  Expected: The cart updates correctly
```

*Problems:* not verifiable ("correctly" is undefined), not atomic (four behaviors are implied), no test data, no preconditions, no traceability.

```text
AFTER — four atomic cases

  TC-341a  Increasing quantity from 1 to 3 → line total triples (REQ-108)
    Preconditions: logged in as a customer with an empty cart
    Data:          "Aeron Desk Lamp", unit price $49.50
    Steps:         1. Add 1 × Aeron Desk Lamp
                   2. Change the line quantity to 3
    Expected:      Line total displays $148.50
    Postconditions: cart emptied

  TC-341b  Increasing quantity from 1 to 3 → subtotal recalculates (REQ-108)
    ... Expected: Subtotal displays $148.50

  TC-341c  Quantity change crossing $100 → shipping becomes FREE (REQ-114)
    Data:     "Aeron Desk Lamp" $49.50, quantity 1 → 3
    Expected: Shipping line changes from $4.99 to FREE
              (subtotal $49.50 → $148.50 crosses the threshold)

  TC-341d  Quantity change → cart badge shows the total item count (REQ-109)
    Expected: Cart badge displays "3"
```

Note that TC-341c would very likely never have been executed under the original case, because nothing prompted the tester to think about the threshold interaction. **Making a case verifiable frequently reveals a missing case** — which is the single best argument for doing this work.

---

**Example 2 — the dependent case**

```text
BEFORE
  TC-102  Verify order cancellation
  Preconditions: the order created in TC-101
  Steps:    1. Open order history
            2. Click Cancel on the most recent order
  Expected: The order is cancelled
```

*Problems:* not independent (requires TC-101 to have run first, successfully, in the same session); "most recent order" is not deterministic under parallel execution; expected result does not state what "cancelled" looks like.

```text
AFTER
  TC-102  Cancelling a confirmed order → status becomes Cancelled and
          inventory is restored (REQ-512)
    Preconditions: a customer account exists; this test creates its own
                   confirmed order via the API before step 1
    Data:          order for 2 × "Cable Clip Pack" ($1.00), order ID captured
                   from the creation response
    Steps:         1. Open order history
                   2. Click Cancel on the order with the captured ID
                   3. Confirm the cancellation dialog
    Expected:      a) The order's status displays "Cancelled"
                   b) GET /orders/{id} returns status "cancelled"
                   c) Product stock for "Cable Clip Pack" increased by 2
    Postconditions: none required; the order is terminal
```

The important change is "this test creates its own confirmed order via the API." That single sentence is what makes the case independent, parallel-safe, and reproducible in isolation — and it is the pattern you will implement in [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md) and rely on in both automation projects.

---

**Example 3 — the mega-case**

```text
BEFORE
  TC-500  End-to-end checkout regression
  Steps:    1-47 (login, search, filter, add three products, apply discount,
            change quantities, remove an item, enter address, enter card,
            place order, check confirmation, check email, check order history,
            check inventory decremented)
  Expected: All steps pass
```

*Problems:* thirteen behaviors in one case; a failure at step 12 hides steps 13-47; "all steps pass" is not an expected result; takes ten minutes to execute; unmaintainable.

```text
AFTER — one journey plus focused cases

  TC-500  Critical purchase journey (smoke)
    Steps:    login → add one known product → checkout with a valid card
    Expected: a) confirmation page displays an order number matching ^ORD-\d{6}$
              b) the order appears in order history with status "Confirmed"
    Note:     one representative path only; ~30 s. Everything else moved out.

  Moved to focused cases at the cheapest layer:
    discount application ......... 8 API cases  (TC-511 to TC-518)
    quantity changes ............. 4 API cases  (TC-521 to TC-524)
    item removal ................. 3 API cases  (TC-531 to TC-533)
    address validation .......... 11 unit cases (developer-owned)
    card validation .............. 6 unit cases (developer-owned)
    email dispatch ............... 2 integration cases
    inventory decrement .......... 2 integration cases
    search and filtering ......... 9 API cases  (TC-541 to TC-549)
```

The 47-step case becomes one 30-second journey plus 45 focused checks that collectively run in about two seconds and each name their own failure. This is Section F.4 of [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md) applied to a real case, and it is the most common refactor you will perform on an inherited suite.

---

**Example 4 — the non-deterministic case**

```text
BEFORE
  TC-208  Verify the monthly sales report
  Steps:    1. Open Reports → Monthly Sales
            2. Select last month
  Expected: The report shows all orders from last month with correct totals
```

*Problems:* "last month" changes meaning every month; "all orders" depends on whatever data happens to exist; "correct totals" is unverifiable; the case behaves differently on the 1st of the month; it cannot be run twice with the same result.

```text
AFTER
  TC-208  Monthly sales report → includes only orders within the selected
          month, with a total equal to the sum of their values (REQ-620)
    Preconditions: this test seeds, via the API, exactly four orders:
                   O1  2026-02-28 23:59  $100.00   (day before the window)
                   O2  2026-03-01 00:00  $ 50.00   (first instant in window)
                   O3  2026-03-15 12:00  $ 25.00   (mid-window)
                   O4  2026-04-01 00:00  $ 75.00   (first instant after)
    Steps:         1. Open Reports → Monthly Sales
                   2. Select March 2026 explicitly (not "last month")
    Expected:      a) The report lists exactly O2 and O3
                   b) O1 and O4 are absent
                   c) The reported total is $75.00
    Postconditions: seeded orders removed
```

Two techniques here that recur throughout the course. **Absolute dates instead of relative ones**, which removes the dependence on when the test runs. And **seeding known data including deliberate boundary cases just outside the window** — O1 and O4 exist precisely so that an off-by-one in the range filter fails the test. Without them, a report that included the whole of February would still pass.

---

**Example 5 — the case that should be deleted**

```text
BEFORE
  TC-733  Verify the product image displays at 400px width on the detail page
  Steps:    1. Open any product detail page
            2. Inspect the main image element
  Expected: width attribute is 400px
```

*Problems:* asserts an implementation detail rather than a behavior; breaks on any restyle regardless of whether anything is wrong; "any product" is non-deterministic; and no customer-visible failure corresponds to it.

```text
AFTER
  Delete.

  Rationale: this asserts a CSS value, not a behavior. It has failed four
  times in 18 months, every time due to an intentional design change, and it
  has never identified a defect. Scored on the C.8 criteria of Chapter 1.3:
  impact 1, change frequency 3, detectability risk 1 — a distorted or missing
  product image is immediately obvious to anyone who looks at the page.

  If image presentation genuinely matters, the replacement is a visual
  regression check on the product detail page (see Project 4 bonus), not a
  functional assertion on a CSS property. That is a different tool for a
  different question.
```

Being able to argue for deletion, with evidence, is the sixth learning objective of this chapter — and the reasoning above is exactly the shape it should take: what it asserts, what it has actually caught, its risk score, and what should replace it if the underlying concern is real.

---

## F. Common Mistakes

### F.1 Using "smoke" and "sanity" interchangeably

**The mistake:** the team says "smoke passed" and different people understand different things.

**Why it happens:** the terms are used loosely across the industry, and nobody wrote down the local definition.

**What it costs:** someone deploys on the strength of a four-minute critical-path run believing a forty-minute regression passed, or the reverse — someone waits forty minutes for information they already had.

**Instead:** define both in your team's documentation with a trigger and a budget, and name the CI jobs accordingly. `smoke` and `sanity-discounts` are unambiguous; `tests-2` is not.

### F.2 The 25-minute smoke suite

**The mistake:** a smoke suite that has grown until it no longer fits its purpose.

**Why it happens:** every addition is individually justified — "this is critical too" — and there is no stated budget to violate.

**What it costs:** it stops running after every deploy, because 25 minutes does not fit into a deploy. You now have a partial regression suite and no smoke suite, and the gap is invisible because the job still exists and still passes.

**Instead:** state the budget in the suite's own documentation, as E.1 does, and treat exceeding it as a defect. Every addition must displace something or be rejected. The "would we roll back?" test from C.3 is the filter.

### F.3 "Works as expected" as an expected result

**The mistake:** an expected result that requires interpretation — "works correctly," "no errors," "behaves as expected," "displays properly."

**Why it happens:** the author knows what they mean, and writing it out is slower.

**What it costs:** two engineers can disagree about whether it passed, so the case proves nothing reproducible. When automated, someone guesses a specific meaning, and the coverage silently narrows (Section D.2).

**Instead:** state the observable outcome with values. "The shipping line reads exactly `FREE`." "The response is `400` with `errors[0].field === "postcode"`." Apply the test: could two people disagree?

### F.4 Cases that depend on other cases

**The mistake:** "using the order from TC-101…"

**Why it happens:** it is genuinely efficient for a human executing cases in order, and setup is tedious.

**What it costs:** one failure cascades into many; cases cannot run individually to reproduce a defect; the suite cannot be parallelized, which puts a hard ceiling on runtime forever.

**Instead:** each case creates its own state, preferably through the API where it is fast. Every project rubric here deducts 20% for order dependence, and [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) is where the ceiling becomes concrete.

### F.5 One case covering six behaviors

**The mistake:** the 47-step case from example E.3.

**Why it happens:** setup is expensive, so reusing it for more assertions feels efficient — and it produces impressive coverage per case.

**What it costs:** a failure at step 12 hides everything after it, diagnosis requires reconstruction, and any of a dozen unrelated changes breaks it.

**Instead:** one journey case for the critical path, plus focused atomic cases at the cheapest layer. Note that the total number of *checks* goes up while runtime goes down.

### F.6 Automating an ambiguous case by guessing

**The mistake:** TC-341 says "the cart updates correctly," so you assert the line total and mark it automated.

**Why it happens:** the case is in the backlog, clarification takes a day, and asserting something feels better than asserting nothing.

**What it costs:** the automated version covers a fraction of what a human covered, the manual case is retired, and the coverage loss is invisible. This is the most dangerous mistake in the chapter precisely because everything looks fine.

**Instead:** clarify before automating. If the expected result is not verifiable, that is a finding — go and establish what it should be, and expect to uncover a requirement gap in the process.

### F.7 Keeping every test forever

**The mistake:** never deleting, because deletion feels like losing coverage.

**Why it happens:** it does feel that way; the metric goes down; and "what if the defect comes back?" is always available as an objection.

**What it costs:** the C.4 accumulation. Eight minutes becomes fifty, per-commit becomes nightly, and the team's detection latency degrades by a factor of a hundred without any single decision causing it.

**Instead:** a quarterly review policy applied uniformly, with the framing from Section D.4. Also check whether the never-failing test *can* fail — mutate its expected value and see. Sometimes the answer changes the conversation entirely.

---

## G. Exercise

Suggested total time: 120 minutes.

### G.1 Easy — Classify twelve scenarios (25 min)

For each, say whether it calls for **smoke**, **sanity**, or **regression**, and give a one-line reason.

| # | Scenario |
|---|---|
| 1 | A deployment to staging just completed; you need to know within minutes whether it is usable |
| 2 | A developer fixed the discount rounding bug and wants to know if the fix works |
| 3 | It is 2 a.m. and the scheduled job is deciding what to run against `main` |
| 4 | A release candidate is being prepared for production tomorrow |
| 5 | A commit touched only the CSS of the footer |
| 6 | The payment gateway integration was upgraded to a new SDK version |
| 7 | A developer wants feedback before their coffee goes cold |
| 8 | A hotfix must ship in 20 minutes and something must be run first |
| 9 | A database migration changed the orders table schema |
| 10 | You are about to spend four hours on manual exploratory testing of a new build |
| 11 | A dependency bump changed 40 transitive packages |
| 12 | The team wants to know whether last sprint's work broke anything from two years ago |

Then answer:

**A.** Which two scenarios could reasonably be answered by more than one suite? What decides it?

**B.** Scenario 8 gives you 20 minutes. What do you run, and what do you explicitly accept not knowing?

**C.** Scenario 5 touched only footer CSS. Is running the full regression suite the right call? Argue both sides in two sentences each.

### G.2 Medium — Design a five-minute smoke suite (35 min)

The demo shop, with these features: registration, login, password reset, catalogue browse, search, filter, product detail, cart operations, discount codes, checkout, payment, order confirmation, order history, profile editing, address book, wishlist, product reviews, and an admin product editor.

**Task A.** Design a smoke suite with a **hard 5-minute budget**. For each check, state the layer (API or UI) and an estimated runtime. Use 200 ms for API checks and 6 s for UI checks.

**Task B.** For every check you include, answer the C.3 question explicitly: *would we roll back the deployment if this failed?*

**Task C.** Name **three features you deliberately excluded** that a colleague might argue should be included, and defend each exclusion in one sentence.

**Task D.** Your suite runs in the pipeline after every deploy. A month later, someone has added four checks and it now takes 6 minutes. Write the two-sentence policy you would put in the suite's README to prevent this.

**Task E.** Now a harder constraint: the budget is cut to **90 seconds**. What survives? What do you lose, and is the 90-second suite still worth having?

### G.3 Challenge — Rewrite five cases and delete one (60 min)

Below are five real-shaped test cases. For each: identify every quality criterion it violates, then rewrite it to be atomic, deterministic, independent, verifiable, and traceable. **Exactly one of the five should be deleted rather than rewritten** — decide which, and write the deletion rationale in the shape of example E.5.

```text
TC-A  Verify login
  Steps:    1. Go to the login page
            2. Enter credentials
            3. Click Sign In
  Expected: User is logged in successfully

TC-B  Verify the discount code from yesterday's promotion still works
  Steps:    1. Add items to the cart
            2. Apply the code from yesterday's email campaign
  Expected: Discount is applied

TC-C  Verify search performance
  Steps:    1. Search for "lamp"
  Expected: Results appear quickly

TC-D  Verify checkout with the account created in TC-C
  Steps:    1. Log in as the new account
            2. Add the last product you viewed to the cart
            3. Complete checkout
            4. Verify the email
            5. Verify order history
            6. Verify inventory decreased
  Expected: Order is placed and everything is updated

TC-E  Verify the "Add to Cart" button has a border-radius of 4px
  Steps:    1. Open a product detail page
            2. Inspect the Add to Cart button
  Expected: computed border-radius is 4px
```

Requirements for each rewrite:

- A title in the `[condition] → [expected outcome]` form
- Explicit preconditions, stating how the case establishes its own state
- Specific test data with actual values
- Expected results that two engineers would evaluate identically
- A requirement reference (invent plausible IDs where needed)
- Postconditions where cleanup is required
- Split into multiple cases where the original is not atomic — say how many and why

Then answer:

**F.** Which rewrite grew into the most cases, and what does that tell you about the original?

**G.** For TC-C, the concept ("search should be fast") is legitimate but the case is unverifiable. Write a verifiable version, and then say honestly whether it belongs in an automated suite at all — what makes performance assertions in functional suites problematic?

**H.** One of your rewrites, done properly, will reveal a case nobody thought to write. Which one, and what is the new case?

---

## H. Coding Assignment

No code. Two deliverables, and both feed forward: the suite design becomes your [Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md) pipeline stages and the capstone's smoke-subset requirement.

### Assignment 1.4 — Suite design and test case rewrite

**Objective.** Demonstrate that you can design suites to a budget and write test cases that survive automation faithfully.

---

**Part 1 — Suite design.** Deliver `suite-design.md` for the demo shop.

| # | Requirement |
|---|---|
| 1 | Definitions of smoke, sanity, and regression **as your team will use them**, each with purpose, trigger, and budget |
| 2 | A **smoke suite** of ≤10 checks, ≤3 minutes, with the layer and estimated runtime per check |
| 3 | For each smoke check, the "would we roll back?" justification |
| 4 | **Two sanity suites** for different change areas — one for discounts, one for authentication — each ≤10 min, listing contents |
| 5 | A **regression suite** composition by layer with counts and estimated runtime, ≤10 minutes at 4 workers |
| 6 | A **nightly suite** stating what it adds beyond regression and why that cannot run per-commit |
| 7 | A **pipeline diagram** in the style of Section C.5, showing which suite runs at which trigger |
| 8 | A **growth policy**: what happens when a suite exceeds its budget, in two sentences |
| 9 | A **deletion policy**: the criteria and cadence for reviewing tests for removal |
| 10 | Three features **excluded from smoke** that someone might argue for, each with a defense |

---

**Part 2 — Test case rewrite.** Deliver `test-cases-rewritten.md` from these ten supplied cases.

```text
 1  Verify user registration works
 2  Verify the cart total is correct after adding products
 3  Verify search returns relevant results
 4  Verify the order placed in case 2 can be cancelled
 5  Verify the free shipping threshold
 6  Verify the checkout page loads without errors
 7  Verify discount codes work correctly
 8  Verify the product listing page shows 20 products per page
 9  Verify last week's orders appear in the report
10  Verify the header logo is 120px wide
```

| # | Requirement |
|---|---|
| 11 | All ten addressed: rewritten, split, or deleted |
| 12 | Each rewrite has ID, title in `[condition] → [expected outcome]` form, preconditions, data with concrete values, steps, expected results, postconditions, and a requirement reference |
| 13 | For each original, a line naming **which quality criteria it violated** |
| 14 | At least **two** originals split into multiple atomic cases, with the count justified |
| 15 | At least **one** justified deletion, with evidence-shaped rationale as in E.5 |
| 16 | Every expected result passes the two-engineers test |
| 17 | Every case is independent — no case references another's data or state |
| 18 | Every case that touches a threshold states **numeric boundary values** |
| 19 | For each rewritten case, the **layer** you would automate it at, per [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md) |
| 20 | One paragraph: which rewrite revealed a **case nobody had written**, and what it is |

**Constraints.**

- Budgets are hard. A smoke suite over 3 minutes fails requirement 2 regardless of quality.
- You may not rewrite case 10 into something keepable — examine it honestly.
- Case 9's phrasing is the [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md) determinism trap; absolute dates are required.
- At least one of cases 2, 5, and 7 must produce four or more atomic cases.

**Acceptance criteria.**

- [ ] Both files delivered
- [ ] Smoke ≤10 checks and ≤3 min, with per-check rollback justification
- [ ] Two sanity suites, regression composition, and nightly suite all specified with budgets
- [ ] Pipeline diagram present and consistent with the budgets
- [ ] Growth and deletion policies stated
- [ ] All ten cases addressed; ≥2 split; ≥1 deleted with rationale
- [ ] Every expected result objectively checkable
- [ ] Every case independent and self-provisioning
- [ ] Boundary values numeric
- [ ] Layer stated per case
- [ ] The revealed-case paragraph present

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Smoke suite judgment | 25% | Contents pass the rollback test; fits the budget; breadth over depth; mostly at cheap layers |
| Test case verifiability | 25% | Every expected result objectively checkable with concrete values |
| Atomicity and independence | 20% | Splits justified; no cross-case dependencies; self-provisioning state |
| Suite architecture and budgets | 15% | Coherent triggers and budgets; pipeline consistent; policies enforceable |
| Deletion reasoning | 10% | Evidence-based, with a replacement proposed if the concern is real |
| Insight | 5% | The revealed case is genuine and non-obvious |

**Self-check.** Hand `test-cases-rewritten.md` to a peer and ask them to execute three cases without asking you anything. If they need to ask what a value should be, requirement 16 has failed. Then ask them which case they would argue should not be deleted — if they win the argument, your rationale needs the evidence, not more assertion.

> **AI usage:** permitted. Two known weaknesses relevant here: generated smoke suites are almost always too large, because "important" is easier to model than "would we roll back"; and generated rewrites tend to preserve the original's granularity rather than splitting it, so requirement 14 stays unmet. Requirements 14, 15, and 20 are where your judgment is visible.

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-1/04-regression-smoke-sanity-and-test-quality.answers.md`](../answer-keys/part-1/04-regression-smoke-sanity-and-test-quality.answers.md).

**1.** What is the defining property of a smoke suite?

- A) It contains the most important test cases
- B) It runs fast enough to execute after every deploy, and answers whether the build is worth testing further
- C) It covers every critical feature thoroughly
- D) It runs only in production

**2.** True or false: sanity testing is a smaller version of regression testing.

**3.** A check verifies that free shipping applies at exactly $100.00. Should it be in the smoke suite?

- A) Yes — it involves money, so it is critical
- B) Yes — boundary cases are the highest-value tests
- C) No — a failure would prompt a ticket, not a rollback; the regression suite catches it minutes later
- D) No — boundary cases cannot be automated reliably

**4.** Which expected result is verifiable?

- A) The cart updates correctly
- B) The page loads without errors
- C) The shipping line displays exactly `FREE` and the order total displays `$100.00`
- D) The discount is applied properly

**5.** A test case reads: "Using the order created in TC-101, verify cancellation." Which criteria does it violate?

- A) Atomicity only
- B) Independence, and determinism if "the order" is ambiguous under parallel runs
- C) Traceability only
- D) None — reusing setup is efficient

**6.** Your regression suite has grown from 8 to 50 minutes over three years. Which action has the highest leverage?

- A) Add more parallel workers
- B) Move checks down a layer — re-verify at unit or API what is currently verified through the UI — and delete the displaced tests
- C) Split the suite into two jobs that run on alternate nights
- D) Increase the CI machine size

**7.** A manual case says "verify the cart updates correctly." You automate it by asserting the line total. What has happened?

- A) The case is now automated and coverage is unchanged
- B) Coverage has increased, since the assertion is now precise
- C) Coverage has silently narrowed: a human checked several values and noticed anomalies, and the automated version checks one
- D) Nothing, provided the test passes

**8.** Which test is the strongest candidate for deletion?

- A) A test that has failed 4 times in 18 months, every time due to an intentional design change, and has never found a defect
- B) A test that fails once a month due to a genuine intermittent application defect
- C) A test covering a rarely-used feature that still works
- D) A slow test covering the revenue path

**9.** Why does test independence put a ceiling on your CI options?

- A) It does not; independence is a style preference
- B) Order-dependent tests cannot be parallelized, so runtime cannot be reduced by adding capacity
- C) Independent tests are slower to write
- D) Because CI systems require alphabetical ordering

**10.** Scenario judgment. You join a team with 800 manual test cases and are asked to "automate them all." Which response is most professional?

- A) "Sure — I'll start at TC-001 and work through them."
- B) "Most of those aren't automatable, so we should start over."
- C) "One-to-one translation isn't the best value. I'd expect roughly a third to be duplicates or obsolete, about half to be better verified at the API layer, and some to be unverifiable as written. My proposal is to automate the 30 cases on the revenue path at the right layers in three weeks so we have CI feedback this month, and audit the rest as we go."
- D) "That'll take about a year, but I can do it."

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Three suites, one library | Smoke, sanity, and regression are selections answering different questions |
| Smoke's defining property | The time budget, not the contents |
| The rollback test | A check belongs in smoke if its failure would cause an immediate rollback |
| Sanity | Narrow and deep, triggered by a specific change |
| Regression growth | Monotonic and unplanned; the fix is moving tests down and deleting |
| Atomic | One behavior, one reason to fail |
| Deterministic | Same result every run; absolute dates, seeded data |
| Independent | Creates its own state; runs alone, first, last, or concurrently |
| Verifiable | Two engineers would agree on pass or fail |
| Traceable | Linked to a requirement, so you know what to change when it changes |
| Deletion | A maintenance activity requiring a policy, not courage |

### Mistakes recap

Smoke and sanity used interchangeably · a 25-minute smoke suite · "works as expected" · cases depending on other cases · one case covering six behaviors · automating an ambiguous case by guessing · keeping every test forever.

### The two tests worth memorizing

**For a smoke suite:** *would we roll back the deployment if this failed?*

**For a test case:** *could two engineers who both ran this disagree about whether it passed?*

Between them, these resolve most of the design questions in this chapter, and both take five seconds to apply.

### Competency check

> **Given any test case, can you tell whether two engineers would agree on whether it passed?**

Apply it to the five cases in G.3 without notes. Then apply it to something from your own workplace or a public test repository, which is a less forgiving exercise.

Secondary checks:

- Can you design a 3-minute smoke suite for an application you know, and defend three exclusions?
- Can you explain why a 50-minute regression suite is a design problem rather than a hardware problem?
- Can you argue for deleting a test in a way that does not sound like criticism of its author?

---

## Part I gate

This chapter closes Part I. Before starting [Part II](../part-2-programming-fundamentals/00-module-overview.md), confirm the module gate from the [Part I overview](00-module-overview.md):

> **Given 20 manual test cases, you can classify each as automate-now, automate-later, or keep-manual, and defend every classification.**

Use the 20 cases from [Assignment 1.2](02-manual-vs-automation-testing.md). If your classifications rest on frequency, objectivity, interface stability, and risk — rather than on how hard each looks to automate — you are ready.

**What Part I gave you.** Four chapters, no code, and the judgment that determines whether the next thirty weeks produce an engineer or a script writer: what testing can prove ([1.1](01-what-is-software-testing.md)), what automation costs ([1.2](02-manual-vs-automation-testing.md)), where each check belongs ([1.3](03-test-strategy-and-the-test-pyramid.md)), and what makes an individual test worth having (1.4).

**What Part II asks of you.** It is the longest, hardest part of this course, and it is where most people who quit, quit. Thirteen chapters of programming with almost no testing content, which will feel like a detour and is not: everything in [Part VI](../part-6-framework-engineering/00-module-overview.md) is impossible without it. The four criteria you just learned — atomic, deterministic, independent, verifiable — are the same criteria [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) will apply to code, and the same ones your project graders will apply to you.

---

[← 1.3 Test Strategy and the Test Pyramid](03-test-strategy-and-the-test-pyramid.md) · [Next: Part II — 2.1 Thinking Like a Programmer →](../part-2-programming-fundamentals/01-thinking-like-a-programmer.md)
