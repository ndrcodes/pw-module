# Chapter 1.3 — Test Strategy and the Test Pyramid

🟢 **Beginner** · [Part I Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | I — Software Testing Fundamentals |
| **Estimated time** | 1 session (90 min) + 3.5 hours independent work |
| **Prerequisite chapters** | [1.1](01-what-is-software-testing.md), [1.2](02-manual-vs-automation-testing.md) |
| **Next chapter** | [1.4 Regression, Smoke, Sanity, and Test Case Quality](04-regression-smoke-sanity-and-test-quality.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Describe** the layers of the test pyramid and the cost, speed, and stability characteristics of each.
2. **Explain** why the pyramid is an economic argument rather than a rule about test counts.
3. **Place** a given check at the unit, integration/API, or UI layer, and **justify** the placement.
4. **Identify** the ice-cream-cone anti-pattern in a real suite and **describe** its consequences.
5. **Analyze** a feature and produce a layered test plan covering its risks without duplicating coverage.
6. **Decide** what should not be automated at all, using explicit criteria.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| What testing proves; risk-based selection | [Chapter 1.1](01-what-is-software-testing.md) |
| Automation cost model and maintenance burden | [Chapter 1.2](02-manual-vs-automation-testing.md) |

No programming required. You do not need to know what a unit test looks like in code — only what it verifies and what it costs.

---

## C. Concept Explanation

### C.1 The pyramid is an argument, not a shape

Most people learn the test pyramid as a picture with a ratio attached — 70% unit, 20% integration, 10% UI — and then argue about the percentages. That is the least useful version of the idea.

The actual content is a single economic claim:

> **The further a test sits from the code it verifies, the slower it runs, the more it costs to maintain, the more ways it can fail for reasons unrelated to the behavior under test, and the less precisely it tells you what broke.**

Everything else follows. The shape is not a target you aim at; it is what your suite ends up looking like when you consistently place each check at the cheapest layer that can genuinely verify it. If you get the placement discipline right, the shape happens. If you chase the shape without the discipline, you get a suite with the right proportions and the wrong tests in them.

### C.2 The same rule at three layers

Take one behavior — REQ-114, free shipping at a subtotal of $100 or more — and consider what it takes to verify at each layer.

**As a unit test.** Call the shipping calculation with a subtotal of 100 and assert the result is zero. No browser, no server, no database, no network. Runs in under a millisecond. Fails only if the shipping rule changes.

**As an API test.** Create a cart via HTTP, add items summing to $100, request the cart totals, assert the shipping field is zero. Needs a running application and a database. Runs in perhaps 200 milliseconds. Can fail because the rule broke — or because authentication changed, the environment is down, the cart endpoint was renamed, or the test data was not cleaned up.

**As a UI test.** Launch a browser, log in, navigate to the catalogue, add products totalling $100 to the cart, open the cart page, read the shipping line, assert it says "FREE." Needs a browser, a rendered page, a logged-in session, a network, and correct timing. Runs in perhaps 4 seconds. Can fail because the rule broke — or because a locator changed, an animation was still running, a promotional banner covered the button, the session expired, a third-party script was slow, or the CI machine was under load.

All three verify the same business rule. The costs differ by three orders of magnitude, and — this is the part that matters more than the runtime — so does the number of unrelated things that can make them fail.

That last property has a name worth learning now: **diagnostic precision.** When the unit test fails, you know the shipping rule is wrong. When the UI test fails, you know *something in a chain of fifteen things* is wrong, and finding out which is your afternoon.

### C.3 The layers

Five layers, from cheapest to most expensive. The middle three are automated; the top is human; the boundaries between them are fuzzier in practice than any diagram suggests.

**Unit tests** verify one function, class, or module in isolation, with its dependencies replaced by stand-ins. They answer: *is this piece of logic correct?* Milliseconds to run, thousands in a suite, and they pinpoint failures exactly. They cannot tell you whether the pieces work together. In most organizations these are written by developers, which has consequences discussed in Section D.1.

**Integration tests** verify that two or more real components work together — code plus a real database, or a service plus a real message queue. They answer: *do these parts actually connect correctly?* Tens to hundreds of milliseconds. They catch the large class of defects where each unit is correct and the wiring is wrong: a misspelled column name, a mismatched serialization format, a transaction that does not commit.

**API / service tests** verify behavior through the application's HTTP interface, exercising the full server-side stack. They answer: *does the system behave correctly for a client?* Hundreds of milliseconds. They are the most under-used layer in the industry, and they are where this course starts automating ([Part IV](../part-4-api-testing-and-automation/00-module-overview.md)) — because they hit a genuine sweet spot: nearly all business logic is reachable, the interface is far more stable than a UI, there is no rendering or timing to synchronize, and failures are diagnosable from a response body.

**UI / end-to-end tests** drive a real browser as a user would. They answer: *can a person actually accomplish this?* Seconds each. They are the only layer that can verify the thing the customer experiences — that the button exists, is clickable, is not covered by a cookie banner, and leads where it should. They are also the slowest, the most fragile, and the least precise, so they are spent deliberately on a small number of journeys that matter.

**Manual exploratory testing** sits above the automated layers, not inside them. It answers questions no automated layer can: *is this confusing? does it feel broken? what happens if I do something nobody planned for?* Unrepeatable by design, and irreplaceable — see [Chapter 1.2](02-manual-vs-automation-testing.md).

Here is the whole picture in one table. The numbers are realistic orders of magnitude for a web application, not measurements of anything specific.

| | Unit | Integration | API | UI | Exploratory |
|---|---|---|---|---|---|
| **Runtime per test** | <1 ms | 10-100 ms | 100-500 ms | 2-10 s | Minutes-hours |
| **Full suite runtime** | Seconds | ~1 min | 2-10 min | 15-60 min | A session |
| **Authoring cost** | Low | Medium | Medium | High | N/A |
| **Annual maintenance** | ~10% | ~20% | 15-30% | 30-50% | N/A |
| **Failure modes unrelated to the behavior** | Almost none | Few | Some | Many | N/A |
| **Diagnostic precision** | Exact line | Narrow | Narrow-ish | Broad | Human report |
| **Verifies the user's reality** | No | No | Partly | Yes | Yes, and beyond |
| **Typically owned by** | Developers | Developers | Devs + QA | QA | QA |

Read the last two rows together and the pyramid's tension becomes obvious: the layer that best reflects what customers actually experience is also the layer with the worst cost and precision. That tension is not resolvable. It is managed by placement.

### C.4 Why the shape follows from the economics

Suppose your team can afford 30 minutes of automated feedback per commit — beyond that, developers context-switch and the value collapses. What can you buy?

```text
Option A — UI-heavy
  200 UI tests × 6 s      = 20 min   (plus flakiness, plus triage)
  Total behaviors covered: 200

Option B — pyramid-shaped
  2,000 unit tests × 1 ms =  2 s
  300 API tests × 300 ms  = 90 s
  25 UI tests × 6 s       = 2.5 min
  Total                   ≈  4 min
  Total behaviors covered: 2,325
```

Option B covers eleven times as many behaviors in a fifth of the time, and most of its failures point at a specific function rather than a screen. Option A is not a slightly worse choice; it is a categorically worse use of the same budget.

Now add the compounding effect from [Chapter 1.2](02-manual-vs-automation-testing.md). Option A's 200 UI tests at a realistic 2% false-failure rate produce a clean run about `0.98²⁰⁰ ≈ 1.8%` of the time. Option A does not merely cover less; it cannot be trusted to tell you anything, which means it will eventually be ignored, which means it covers nothing at all.

**This is why the shape is a pyramid.** Not because someone decided on 70/20/10, but because cheap, fast, precise tests are worth buying in bulk and expensive, slow, imprecise ones are not.

### C.5 The ice cream cone

The inverted pyramid — a fat layer of UI tests, thin integration coverage, almost no unit tests, and often a large manual regression pass on top — is common enough to have a name.

```text
        Manual regression        <- large, slow, every release
       ████████████████
        UI / E2E tests           <- hundreds of them
       ██████████████
        API tests                <- a handful
         ████
        Unit tests               <- almost none
          █
```

Teams do not choose this. They arrive at it, by a path so consistent it is worth recognizing:

1. The application exists before anyone thinks about automated testing, so there are no unit tests and the code is not structured to make them easy.
2. A QA engineer is hired to "automate the regression suite." The regression suite is written as manual UI steps.
3. The most direct translation of a manual UI step is a UI test, and it works. Coverage grows quickly and visibly.
4. Developers do not write unit tests because QA is handling testing. QA cannot write unit tests because they do not own the code — and often are not permitted to change it.
5. The suite reaches 400 tests, takes ninety minutes, and fails intermittently for reasons nobody can reproduce.
6. Someone adds retries. Then more retries. Then a "known flaky" list. Then people stop reading the report.

Every step is locally reasonable. The outcome is the failure mode [Chapter 1.2](02-manual-vs-automation-testing.md) called negative value: a suite that costs a full-time engineer to maintain and provides feedback nobody acts on.

The consequences, precisely:

| Symptom | Cause |
|---|---|
| Suite takes 90 minutes | UI tests cost seconds each and there are hundreds |
| Runs only nightly | Too slow for per-commit, so detection is delayed by a day |
| Fails intermittently | Hundreds of independent chances for timing and environment noise |
| Failures take hours to diagnose | Broad diagnostic precision: any of fifteen things could be at fault |
| Defects still escape | Coverage is broad but shallow; edge cases are impractical at this layer |
| Nobody trusts it | Consequence of the four rows above |

**If you take one practical thing from this chapter, take this:** when you join a team with an ice cream cone, the instinct is to add tests. The correct first move is to *move* tests — pick the twenty slowest, flakiest UI tests, identify what business rule each actually verifies, and re-verify those rules at the API layer. You will be deleting UI tests and the suite will get better. That is a hard argument to make in a culture that counts tests, which is why [Chapter 1.2](02-manual-vs-automation-testing.md) spent a section on metrics.

### C.6 Placement heuristics

Four questions, in order. They resolve most placement decisions in under a minute.

**1. What is the cheapest layer that can genuinely verify this behavior?**
Start at the bottom and move up only when forced. "Genuinely" is doing work here — a unit test cannot verify that a button is visible, and pretending otherwise is how teams end up with high coverage numbers and broken software.

**2. What would I lose by testing it one layer lower?**
If the answer is "nothing," move it down. If the answer is "I would no longer know whether the user can see the result," you have found the reason to stay high — and that reason should be written in the test plan.

**3. What can *only* this layer prove?**
This is the question that justifies UI tests. Rendering, layout, click-ability, browser behavior, and the integration of everything into a usable whole. Reserve the expensive layer for exactly these.

**4. How stable is the interface I am coupling to?**
A test coupled to a function signature breaks when that signature changes. A test coupled to an HTTP contract breaks when the contract changes — usually rarer. A test coupled to a DOM structure breaks when anyone restyles the page. Prefer stable coupling, which is the [Chapter 1.2](02-manual-vs-automation-testing.md) maintenance multiplier applied to placement.

A rough mapping, useful as a default rather than a rule:

| Kind of behavior | Default layer |
|---|---|
| Calculations, formatting, validation rules, state machines | Unit |
| Persistence, transactions, queries, external service adapters | Integration |
| Endpoint contracts, status codes, authorization, business workflows | API |
| Critical user journeys, rendering, interaction, browser-specific behavior | UI |
| Usability, visual judgment, tone, discoverability, "does this feel right" | Manual |

### C.7 Duplicate coverage: waste or defense?

Beginners are told not to duplicate coverage, then observe that good suites verify some things at more than one layer, and conclude the rule is fake. The rule is real; it just needs a sharper statement.

**Wasteful duplication** re-verifies the *same logic* at a more expensive layer. Fifteen discount-calculation cases as unit tests, then the same fifteen as UI tests. The UI versions cost 100× more, are far more fragile, and prove nothing new. When the rule changes you now edit thirty tests.

**Defense in depth** verifies *different things that happen to involve the same rule*. Consider free shipping:

| Layer | What it actually verifies |
|---|---|
| Unit | The threshold arithmetic is correct, including the boundary at exactly 100 |
| API | The cart endpoint applies the rule and returns the right shipping value in its response |
| UI | The customer *sees* "FREE" on the cart page rather than a stale or unformatted value |

These are three different claims. The unit test cannot catch an endpoint that computes correctly and serializes the wrong field. The API test cannot catch a page that receives the right value and displays the old one from cache. Each layer covers a distinct failure mode, and none is redundant.

The test that distinguishes the two cases: **name the failure each test would catch that the others would not.** If you cannot, you have duplication. If you can, you have defense in depth — and you should write those sentences into your test plan, because that is what a reviewer will ask.

One more distinction worth keeping: the *boundary cases* stay low. Verify the threshold at 99.99, 100.00, and 100.01 in unit tests where each costs a millisecond. At the UI, verify one representative case — that the free-shipping state renders correctly — and stop. Exhaustive boundary testing through a browser is the single most common way suites become slow for no gain.

### C.8 Risk-based strategy: what to test, not just where

Placement decides *where* a check goes. Risk decides *whether it exists at all* and how much attention it gets. Three factors, multiplied:

**Business impact.** What does failure cost? A wrong tax calculation is a regulatory and refund problem. A misaligned footer is a ticket. These do not deserve equal effort, and treating all requirements as equally important is how teams end up thoroughly testing settings pages.

**Change frequency.** Code that changes often breaks often. A payment integration modified every sprint needs more protection than a shipping-address form untouched for two years — and the untouched form's tests are also the ones that have stopped finding anything, per the pesticide paradox.

**Detectability.** How likely is a failure to be noticed without a test? A crashed homepage is reported within minutes by everyone. A silent 2% error in monthly interest accrual might run for a year. **Low detectability is the strongest argument for automation**, and it is the factor beginners consistently ignore, because invisible problems do not feel urgent.

A workable prioritization, scoring each factor 1-3 and multiplying:

| Behavior | Impact | Change freq. | Detectability risk | Score | Priority |
|---|---|---|---|---|---|
| Payment authorization | 3 | 3 | 2 | 18 | Highest |
| Tax calculation | 3 | 2 | 3 | 18 | Highest |
| Discount stacking | 3 | 3 | 2 | 18 | Highest |
| Order authorization (A can't see B's) | 3 | 1 | 3 | 9 | High |
| Search relevance ordering | 1 | 2 | 2 | 4 | Low |
| Footer link correctness | 1 | 1 | 1 | 1 | Lowest |

The numbers are a thinking aid, not a science — do not defend them to three decimal places. What they are genuinely good for is arguing. When someone asks why you have not automated the footer links, a table like this is a better answer than an opinion, and it makes the conversation about priorities rather than about you.

### C.9 What stays out of automation entirely

Being explicit about this protects you. Four categories:

**Human judgment.** Visual design, message tone, discoverability, whether an error is *helpful*. You can assert that a string equals expected text; you cannot assert the text is any good.

**Exploratory work.** Unrepeatable by definition. Automating an exploratory session is a category error — though automating the *risk class* a session revealed is exactly right (see [Chapter 1.2](02-manual-vs-automation-testing.md), F.5).

**One-off verification.** A data migration checked once before a cutover. Authoring cost can never amortize across a single run.

**Uncontrollable dependencies.** A third-party service with no sandbox, no test mode, and no way to force a specific response. Sometimes network interception can simulate it — you will do this in [Project 4](../projects/project-4-web-automation.md) — and sometimes the honest answer is that this cannot be automated reliably and should be verified manually with a documented procedure.

Say these out loud in your test plan. An unstated gap is a gap someone will assume you covered.

### C.10 The test strategy document

A test strategy is a short document that says what will be tested, at which layers, why, and what will not be tested. It exists to prevent three specific and recurring problems: coverage arguments after an escape ("I assumed that was covered"), redundant work by two people at two layers, and the slow drift toward an ice cream cone that nobody notices until the suite takes ninety minutes.

A workable structure:

1. **Scope** — the feature or system, and its boundaries
2. **Risks** — ranked, with impact/frequency/detectability reasoning
3. **Layer allocation** — what is verified at each layer, and what each layer proves that the others cannot
4. **Deliberate duplication** — where the same rule is checked twice and the distinct failure each check catches
5. **Not automated** — with categories and reasons
6. **Ownership** — who writes and maintains each layer
7. **Budget** — target runtime per layer, because runtime is a design constraint and not an outcome

Item 7 is the one experienced engineers insist on. "The API suite must finish in under 5 minutes" is a constraint that shapes every subsequent decision, and it is far easier to honor from the start than to retrofit onto a suite that has already reached forty minutes.

Who reads it: developers (to know what QA is covering so they can cover the rest), managers (to understand what the automation investment buys), and your future replacement (to understand why the suite looks the way it does). Write for those three audiences and keep it to two pages.

---

## D. QA Context

### D.1 Negotiating placement with developers

Here is the structural problem you will hit within your first month. The pyramid says most checks belong at the unit and integration layers. Those layers are usually owned by developers. You are being asked to improve coverage of layers you do not control.

You have four options, and it is worth knowing all of them.

**Ask, with specifics.** Not "we need more unit tests" — that is a complaint. Instead: "The discount-stacking rule has three interacting conditions and it changed twice this sprint. I can cover it in about 40 seconds of API tests, or you can cover it in about 2 milliseconds of unit tests with better precision on which condition broke. Would you take the unit tests? I'll cover the endpoint contract and the cart display."

That works because it is specific, it prices both options, and it offers to do the other half. Developers generally are not hostile to unit tests; they are busy, and vague requests lose to concrete tickets.

**Cover it at the API layer meanwhile.** If the answer is no, or slow, the risk does not go away. API tests are your leverage: cheap enough to be practical, stable enough to maintain, and entirely within your control. This is why [Part IV](../part-4-api-testing-and-automation/00-module-overview.md) comes before web automation in this course — it is the layer where you can act unilaterally.

**Make the cost visible without blaming anyone.** "We caught the tax defect at the UI layer. It took 40 minutes to diagnose because the failure could have been any of six things. The same defect at the unit layer would have named the function." Repeated a few times with real examples, this changes behavior far more reliably than advocacy.

**Never let the gap be silent.** If unit coverage will not happen, write it in the strategy document under an explicit heading. Then it is a known, accepted organizational risk rather than an invisible one that becomes your fault after an escape.

### D.2 "We don't have unit tests, so automate it in the UI"

You will hear this. It is not entirely wrong — the risk is real and the UI is available — but accepting it wholesale produces the ice cream cone.

The productive response separates the request into parts:

> "I can get most of that risk at the API layer instead, faster and more reliably. The pricing rules, the discount interactions, the tax calculation, and the authorization checks are all reachable through the API and I can have them running in CI in a week. What I'd keep in the UI is the three journeys where I need to know a customer can actually complete the purchase in a browser. If I did all of it through the UI it'd be about 45 minutes of runtime and I'd be maintaining it full-time."

This works because it does not refuse, does not lecture about pyramids, and offers a faster path to the same risk reduction. Notice the runtime figure at the end — a concrete number about *their* feedback loop is more persuasive than any argument about test theory.

### D.3 The pyramid is a CI design constraint

The shape of your suite determines what your pipeline can do, which determines where you sit on the cost-of-defect curve. This connection becomes concrete in [Part VII](../part-7-cicd/00-module-overview.md), and it is worth seeing now.

| Suite shape | Feasible CI design | Detection latency |
|---|---|---|
| Pyramid: fast unit + API, few UI | Everything on every commit | Minutes |
| Middle-heavy: large API suite, few UI | Unit + API per commit, UI on merge | Minutes to an hour |
| Ice cream cone: hundreds of UI tests | Nightly only; per-commit is impossible | Up to a day |

An ice cream cone does not merely cost more. It **structurally prevents** fast feedback, because you cannot run a 90-minute flaky suite on every commit no matter how much you want to. The suite shape you build in Parts IV-VI decides what pipeline you are able to build in Part VII, and that decision is very expensive to reverse later.

This is also why the [capstone](../capstone/00-capstone-overview.md) requires a smoke subset under three minutes. That constraint is unsatisfiable with a UI-heavy suite, which is the point: it forces the layering decision to be made correctly from the start.

### D.4 This chapter's plan is your project split

The layered test plan you write in Section H is not an exercise. It is the blueprint for the rest of the course.

| Your plan's layer | Becomes |
|---|---|
| API-layer checks | [Project 3](../projects/project-3-api-automation.md), then the API suite of the [capstone](../capstone/00-capstone-overview.md) |
| UI-layer journeys | [Project 4](../projects/project-4-web-automation.md), then the web suite of the capstone |
| Deliberate duplication | The `docs/test-strategy.md` deliverable of the capstone |
| Not-automated list | The exclusions section that capstone grading specifically looks for |
| Runtime budgets | The smoke-suite constraint in [Chapter 1.4](04-regression-smoke-sanity-and-test-quality.md) and the CI stages in [Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md) |

[Project 4](../projects/project-4-web-automation.md) requires a `docs/layer-decisions.md` justifying why at least three of its UI tests are not API tests. That requirement exists because of this chapter, and learners who write a thoughtful plan now find that deliverable nearly free.

---

## E. Code Examples

No implementation code — that begins in [Part IV](../part-4-api-testing-and-automation/00-module-overview.md). What follows are the same behaviors expressed as test descriptions at different layers, which is the artifact you produce when planning.

### E.1 One rule, three layers, described precisely

REQ-114, free shipping at $100.

```text
UNIT   given a subtotal of 100.00, calculateShipping() returns 0.00
       given a subtotal of  99.99, calculateShipping() returns 4.99
       given a subtotal of 100.01, calculateShipping() returns 0.00
       given a subtotal of   0.00, calculateShipping() returns 0.00 (empty cart)
       given a negative subtotal, calculateShipping() throws
       ~5 tests, <5 ms total, fails only if the shipping rule changes

API    POST /cart/items with products summing to 100.00,
       GET  /cart returns { shipping: 0.00, total: 100.00 }
       ~1-2 tests, ~400 ms, fails if the rule, the endpoint contract,
       serialization, auth, or the environment breaks

UI     with a cart worth exactly 100.00 (created via the API),
       the cart page shipping line reads "FREE"
       1 test, ~4 s, fails if the rule, the page, the locator, the session,
       the network, or the rendering breaks
```

Note two things about the UI test. There is **one** of them, not five — the boundary cases are already covered where they cost a millisecond each. And its setup goes **through the API**, not by clicking through the catalogue, because clicking through the catalogue tests the catalogue as a side effect and makes a shipping failure indistinguishable from a search failure. Both of these are techniques you will apply directly in [Project 4](../projects/project-4-web-automation.md).

### E.2 A checkout feature, allocated across layers

The demo shop's checkout, planned properly. This is roughly the shape your Section H deliverable should take.

```text
UNIT (developers own; ~180 tests, ~2 s)
  - Subtotal arithmetic, including rounding on fractional cents
  - Percentage discount calculation, all rounding boundaries
  - Fixed-amount discount, including amount > subtotal
  - Discount minimum-spend evaluation at the boundary
  - Free-shipping threshold, all boundaries
  - Tax calculation per region, on post-discount subtotal
  - Order of operations: discount -> shipping -> tax
  - Address field validation rules, each independently
  - Card number format validation (Luhn), expiry parsing
  - Order state machine transitions, including invalid ones

INTEGRATION (developers own; ~30 tests, ~15 s)
  - Order persists with all line items and totals intact
  - Inventory decrements on order creation, in one transaction
  - Failed payment rolls back the order record entirely
  - Payment gateway adapter handles approve / decline / timeout
  - Confirmation email is enqueued exactly once

API (QA owns -> Project 3; ~70 tests, ~90 s)
  - Full CRUD on cart: add, update quantity, remove, clear
  - Checkout endpoint: valid order returns 201 with an order number
  - Every invalid-input case returns 400 naming the offending field
  - Declined payment returns the documented status; cart is preserved
  - Discount codes: valid, expired, already-used, below minimum spend
  - Discount applied before shipping evaluation (REQ-114 interaction)
  - Tax computed on the post-discount subtotal (REQ-415)
  - Auth: no token / expired token / malformed token all rejected
  - Authorization: customer A cannot read or modify B's cart or order
  - Response contract: schema and required fields on every endpoint
  - Idempotency: submitting the same order twice

UI (QA owns -> Project 4; ~12 tests, ~60 s)
  - Happy path: browse -> cart -> checkout -> confirmation number shown
  - Declined card: user sees the decline, cart is still populated
  - Field validation: invalid address shows field-level messages and blocks submit
  - Free-shipping state renders as "FREE" on the cart page (one case only)
  - Discount application updates the displayed totals without a reload
  - Checkout button is disabled while payment is processing
  - Session expiry mid-checkout returns the user to login without losing the cart
  - The above on Chromium + one other engine

MANUAL / EXPLORATORY (QA owns; ~2 h per release)
  - Exploratory charter on checkout, focused on newly changed areas
  - Visual review at three viewports
  - Error message clarity and tone
  - Accessibility: keyboard-only completion, screen-reader pass
  - Anything the release notes touched

NOT AUTOMATED, DELIBERATELY
  - Fraud service behavior: no sandbox available.
    Manual procedure documented in docs/manual-fraud-check.md
  - Real payment settlement: verified in production with a canary order
  - "Does the checkout feel trustworthy": human judgment, exploratory only

RUNTIME BUDGET
  unit + integration : < 30 s   (every commit)
  API                : < 2 min  (every commit)
  UI                 : < 3 min  (every commit; smoke subset < 60 s)
  full regression    : < 8 min  (every merge to main)
```

Four things to notice, because they are the marks of a real plan rather than a wish list:

**The counts are inverted from an ice cream cone.** 180 unit, 70 API, 12 UI. Nobody wrote down "70/20/10" — this is what placement discipline produces.

**Boundary cases live exactly once, at the bottom.** Rounding appears in unit tests and nowhere else.

**The UI list is short and each item is there for a reason only the UI can serve.** Rendering, interaction, browser behavior, session handling.

**The not-automated section is explicit and has a documented alternative.** "No sandbox" is paired with a manual procedure and a file path, not left as a gap.

### E.3 The same feature, done badly

For contrast, a real-world shape produced by good intentions and no placement discipline:

```text
UI (QA owns; 240 tests, 38 minutes, ~6% flaky)
  - 15 tests for discount percentage calculations, each clicking through
    catalogue -> product -> cart -> apply code -> read total
  - 12 tests for tax by region, same click path
  - 18 tests for address field validation, one per invalid input
  - 9 tests for free shipping at various subtotals
  - 40 tests covering every combination of card type and expiry format
  - ... 146 more

UNIT: none
API: 4 tests, added by a developer once and not maintained
```

Everything here is testing something real. The problems:

- **38 minutes** means it cannot run per-commit, so detection is delayed by a day
- **6% flakiness across 240 tests** means a clean run is essentially unobtainable
- **The 15 discount tests re-verify arithmetic** that 15 unit tests would cover in 15 milliseconds
- **The 18 validation tests** exercise the same form submission 18 times to check 18 independent rules
- When the cart page layout changes, **most of the suite needs editing at once**
- A discount failure and a catalogue failure look identical from the report

The fix is not to add tests. It is to move roughly 190 of these down a layer and delete the UI versions, arriving at something close to E.2 with a fraction of the runtime. That migration is the Section G.2 exercise, and it is genuinely the most valuable thing a new automation engineer can do on a team that has been at this for a couple of years.

---

## F. Common Mistakes

### F.1 Treating 70/20/10 as a target

**The mistake:** counting your tests, finding you have 45% UI tests, and adding unit tests until the ratio looks right.

**Why it happens:** the ratio is memorable and measurable, and the picture is usually taught before the argument.

**What it costs:** you write unit tests for whatever is easiest to unit-test — getters, trivial mappings, framework glue — which improves the ratio and covers nothing that was at risk. Meanwhile the 45% UI tests are still slow and still flaky, because the ratio was a symptom and you treated it as the disease.

**Instead:** apply the four placement questions from Section C.6 to each check. If your resulting shape is 50/35/15 and every check is at the cheapest layer that can verify it, your suite is correct and the ratio is irrelevant.

### F.2 Automating everything through the UI because that's the layer you know

**The mistake:** you have learned Playwright's browser API, so every new check becomes a browser test.

**Why it happens:** it works, it is visible, it is satisfying to watch, and it does not require negotiating with anyone.

**What it costs:** the E.3 suite. Slow, flaky, imprecise, and expensive to maintain — arrived at one entirely reasonable test at a time.

**Instead:** before writing any browser test, ask what the check actually verifies and whether an HTTP request could verify it. This is precisely why [Part IV](../part-4-api-testing-and-automation/00-module-overview.md) precedes [Part V](../part-5-web-automation-playwright/00-module-overview.md) in this course: by the time you can drive a browser, reaching for the API first is already a habit.

### F.3 Assuming one layer makes another unnecessary

**The mistake, version one:** "The API tests cover the discount rules, so we don't need any UI coverage of discounts."

**The mistake, version two:** "The UI test goes through the whole flow, so the API tests are redundant."

**Why it happens:** both sound like eliminating waste, which the previous section encouraged.

**What it costs:** version one misses display failures — a correct value computed and then rendered from stale cache, or formatted as `10` instead of `$10.00`. Version two loses all boundary coverage, all diagnostic precision, and all speed.

**Instead:** apply the Section C.7 test. Name the failure each test catches that the others would not. One UI test verifying that the discounted total *displays* correctly is defense in depth; fifteen UI tests re-verifying the arithmetic is waste.

### F.4 The mega-test that verifies twelve things

**The mistake:** one 200-line UI test that logs in, searches, filters, adds three products, applies a discount, changes quantities, checks out, verifies the email, and inspects order history.

**Why it happens:** the setup is expensive, so reusing it for more assertions feels efficient. It also produces impressive coverage per test.

**What it costs:** when it fails at step 7, steps 8-12 never run, so you learn about one failure and nothing about the rest. Diagnosis requires reconstructing which step broke. Any of twelve unrelated changes can break it, so it fails constantly. And it cannot be run in parallel with itself or reordered.

**Instead:** one journey test that walks the critical path with meaningful assertions at each step, plus separate focused tests for individual behaviors — set up through the API, not through the UI. [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) makes this a formal principle; here it is enough to notice that "end-to-end" and "thorough" are different words.

### F.5 Ignoring the layers you don't own

**The mistake:** concluding that unit tests are the developers' problem, so the pyramid's base is not your concern.

**Why it happens:** it is organizationally accurate and avoids an awkward conversation.

**What it costs:** you end up compensating for a missing base with expensive tests at the top, and you own the resulting slow, flaky suite. The organizational boundary did not protect you; it just determined who gets blamed.

**Instead:** advocate specifically and price the alternative, as in Section D.1. If it does not happen, cover what you can at the API layer and write the gap into the strategy document. Advocacy plus documentation is the whole of your available influence — but it is not nothing, and it works more often than people expect.

### F.6 Confusing "end-to-end" with "thorough"

**The mistake:** believing an end-to-end test is inherently more valuable because it covers more of the system.

**Why it happens:** it does cover more of the system, and "end-to-end" sounds comprehensive.

**What it costs:** end-to-end tests cover a *wide but shallow* path. One journey through checkout touches many components and verifies almost nothing about any of them — it certainly does not check what happens at a discount boundary or with a malformed address. Teams that equate the two end up believing they have thorough coverage when they have one happy path.

**Instead:** think of it as breadth versus depth. End-to-end tests provide breadth: the pieces connect and a user can get through. Lower layers provide depth: each rule is correct in every case. You need both, and they are not substitutes.

### F.7 Writing a strategy with no runtime budget

**The mistake:** a strategy document that allocates checks to layers but never states how long each layer may take.

**Why it happens:** runtime feels like an outcome rather than a decision. At the start, everything is fast.

**What it costs:** suites grow monotonically. Without a stated budget there is never a moment when adding one more test is wrong, so the suite reaches forty minutes by a sequence of individually harmless additions — and by then, fixing it means deleting work people are attached to.

**Instead:** state the budget up front, as E.2 does, and treat exceeding it as a defect requiring action — move tests down, parallelize, or delete. A budget you enforce early costs almost nothing; retrofitting one is a project.

---

## G. Exercise

Suggested total time: 120 minutes.

### G.1 Easy — Place fifteen checks (30 min)

For each check, name the **cheapest layer that could genuinely verify it** — unit, integration, API, UI, or manual — and give a one-line reason.

| # | Check |
|---|---|
| 1 | A 15% discount on a $10.01 subtotal rounds to the correct cent |
| 2 | The cart page displays the discounted total without requiring a reload |
| 3 | Placing an order decrements inventory and does so in the same transaction |
| 4 | `POST /orders` returns 400 with the field name when the postcode is missing |
| 5 | The "Place Order" button is not clickable while payment is processing |
| 6 | Tax is calculated on the post-discount subtotal, for 12 regions |
| 7 | Customer A receives 403 when requesting customer B's order |
| 8 | The confirmation email contains the correct order number |
| 9 | The checkout error message is polite and tells the user what to do next |
| 10 | An expired discount code is rejected with the reason "expired" |
| 11 | The order state machine rejects a transition from `shipped` back to `pending` |
| 12 | A customer can complete a purchase in Safari |
| 13 | The payment adapter handles a gateway timeout without losing the order |
| 14 | A card number failing the Luhn check is rejected before submission |
| 15 | The checkout page is usable with a screen reader |

Then answer:

**A.** How many of the fifteen belong below the UI layer? (Count them. The number usually surprises people.)

**B.** Check 6 involves 12 regions. Where do the 12 cases go, and how many UI tests does this behavior justify?

**C.** Checks 2 and 5 are both UI. What can *only* the UI layer prove in each case?

### G.2 Medium — Migrate an ice cream cone (45 min)

You inherit the suite from example E.3: 240 UI tests, 38 minutes, roughly 6% flaky, no unit tests, 4 unmaintained API tests. Your manager has given you two weeks and asked you to "make the suite reliable."

**Task A.** Take these 20 representative tests from the suite and decide, for each: **keep at UI**, **move to API**, **move to unit** (i.e. request it from developers), or **delete**. Give a one-line reason.

| # | Existing UI test |
|---|---|
| 1 | Clicks through to cart, applies `SAVE10`, asserts total is $90.00 on a $100 cart |
| 2 | Same as 1 but with `SAVE20`, asserting $80.00 |
| 3 | Same as 1 but with `SAVE30`, asserting $70.00 |
| 4 | Applies an expired code, asserts the page shows "This code has expired" |
| 5 | Submits checkout with an empty postcode, asserts the field shows an error |
| 6 | Submits checkout with a 200-character street address, asserts an error |
| 7 | Submits checkout with an invalid card number, asserts an error |
| 8 | Full purchase flow, happy path, asserts the confirmation number appears |
| 9 | Asserts the cart badge shows "3" after adding three items |
| 10 | Asserts shipping is $4.99 at a $99.99 subtotal |
| 11 | Asserts shipping is FREE at a $100.00 subtotal |
| 12 | Asserts shipping is FREE at a $150.00 subtotal |
| 13 | Asserts the product image is 400px wide on the detail page |
| 14 | Logs in, logs out, asserts the session is cleared and the cart persists |
| 15 | Asserts tax is $8.25 for a California address on a $100 order |
| 16 | Asserts tax is $0.00 for an Oregon address on a $100 order |
| 17 | Asserts the "Place Order" button is disabled during payment processing |
| 18 | Asserts an order placed by A is not listed in B's order history page |
| 19 | Asserts the footer contains a link to the privacy policy |
| 20 | Asserts a declined card shows the decline message and the cart is preserved |

**Task B.** Estimate the new suite: how many UI tests remain, and roughly what runtime? Assume 6 s per UI test, 300 ms per API test, 1 ms per unit test.

**Task C.** Three of your decisions will be contentious. Identify which, and write one sentence you would say to defend each in a review.

**Task D.** Your manager asks: "You're deleting tests. How is that making it more reliable?" Write your answer in under 100 words.

### G.3 Challenge — No unit tests, and a developer who won't write them (45 min)

**Situation.** You join a team of five developers and one other tester. There are no unit tests. The codebase is four years old. When you raise unit tests in a retrospective, the lead developer says, verbatim:

> "We tried unit tests. They broke every time we refactored and nobody maintained them. Testing is QA's job — that's why we hired you. Just automate through the UI, it tests what the customer actually sees."

Each clause contains something true. The conclusion is still going to produce an ice cream cone.

**Task A.** For each of the four claims, write what is legitimate in it and where the reasoning fails.

1. "Unit tests broke every time we refactored."
2. "Nobody maintained them."
3. "Testing is QA's job."
4. "UI tests test what the customer actually sees."

**Task B.** Design the strategy you will actually implement in the next quarter, given that unit tests are not available to you. Constraints: you cannot modify application code, you have one other tester, and you have your own time. Be specific about layers and what you will *not* cover.

**Task C.** Write the case you would make for changing this over six months. Requirements:

- It must not require the lead developer to admit being wrong
- It must be built on evidence you can gather without permission
- It must propose a first step small enough to be accepted this month
- It must acknowledge the real cost of the thing you are asking for

**Task D.** One paragraph: what would you do if, after six months of this, nothing had changed? Consider both the professional response and the personal one.

<details>
<summary>A hint on Task C</summary>

The strongest available evidence is diagnosis time, and you can collect it without anyone's permission. Every time a UI test fails, record how long it took to determine the cause and how many components were candidates. After two months you have a table of real incidents from your own team — not an argument about pyramids, but a measured local cost. Then propose the smallest possible first step: unit tests for one high-churn module, written by whoever changes it next, as an experiment with a review date. The ask is small, the evidence is theirs, and nobody has to have been wrong.

</details>

---

## H. Coding Assignment

No code. The applied deliverable — and this one you will reuse for the rest of the course.

### Assignment 1.3 — Layered test plan for checkout

**Objective.** Produce the test plan that becomes your working blueprint for [Project 3](../projects/project-3-api-automation.md), [Project 4](../projects/project-4-web-automation.md), and the [capstone](../capstone/00-capstone-overview.md). This is the highest-leverage document you will write in Part I.

**The feature.** The demo shop's checkout, from cart through order confirmation. Requirements: REQ-114 (free shipping at $100), REQ-410 to REQ-415 (discount codes, from [Chapter 1.1](01-what-is-software-testing.md)), plus these:

> **REQ-501** — Tax is calculated per destination region on the post-discount subtotal.
> **REQ-502** — A declined payment must preserve the cart and inform the customer.
> **REQ-503** — Inventory decrements only on successful order creation.
> **REQ-504** — A customer may view only their own orders.
> **REQ-505** — Submitting the same order twice must not create two orders.

**Deliverable.** `test-plan-checkout.md`, maximum 3 pages, containing all seven sections from Section C.10.

**Requirements.**

| # | Requirement |
|---|---|
| 1 | **Scope** with explicit boundaries — what is and is not part of "checkout" for this plan |
| 2 | **Risks** ranked, using impact × change frequency × detectability as in Section C.8. At least 8 risks, scored |
| 3 | **Layer allocation** for every check, across unit, integration, API, UI, and manual |
| 4 | For each layer, a sentence stating **what that layer proves that no other layer can** |
| 5 | At least **20 API-layer checks** named specifically enough to implement |
| 6 | **No more than 12 UI checks**, each with a justification for why it cannot be an API test |
| 7 | **Deliberate duplication** section: at least 2 behaviors verified at more than one layer, each with the distinct failure per layer named |
| 8 | **Not automated** section: at least 3 items, categorized per Section C.9, each with an alternative verification method |
| 9 | **Ownership** per layer, including which layers you do not own and what you will do about that |
| 10 | **Runtime budget** per layer, with a total for the per-commit suite |
| 11 | A named **smoke subset** of no more than 6 checks that must run before any deploy |
| 12 | Boundary cases assigned to the cheapest layer that can verify them, and stated as values not descriptions |

**Constraints.**

- The per-commit budget is **5 minutes total** across all automated layers. If your plan does not fit, cut and say what you cut.
- Assume unit and integration layers are owned by developers who are cooperative but busy. You may request specific coverage; you must say what you will do if it does not arrive.
- Every UI check must survive the Section C.6 question 3: what can only this layer prove?

**Acceptance criteria.**

- [ ] All seven strategy sections present
- [ ] At least 8 risks, scored and ranked, with the scoring reasoning visible
- [ ] Every check assigned to exactly one primary layer
- [ ] ≥20 API checks, ≤12 UI checks
- [ ] Every UI check justified against "why not the API?"
- [ ] ≥2 deliberate duplications, each with distinct failures named per layer
- [ ] ≥3 not-automated items with alternatives
- [ ] Runtime budget per layer, totalling ≤5 minutes for the per-commit suite
- [ ] Smoke subset of ≤6 checks identified
- [ ] Boundary values stated numerically
- [ ] Under 3 pages
- [ ] A peer can read it and start implementing the API suite without asking you a question

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Placement judgment | 30% | Every check at the cheapest layer that genuinely verifies it; boundaries pushed low; UI reserved for what only it can prove |
| Risk analysis | 20% | Risks reflect impact, churn, and detectability; ranking defensible; the plan's effort follows the ranking |
| Duplication reasoning | 15% | Distinguishes defense in depth from waste, with the specific failure per layer named |
| Exclusions and honesty | 15% | Not-automated items categorized with alternatives; gaps in unowned layers stated rather than hidden |
| Budget discipline | 10% | Fits 5 minutes; cuts explicit; smoke subset genuinely minimal and genuinely critical |
| Implementability | 10% | Checks specific enough to implement directly; a peer could start work from it |

**Self-check.** Two questions. Hand the plan to a peer and ask, "Which UI test would you argue should be an API test?" — if they find one you cannot defend, fix it. Then ask, "If you implemented only my smoke subset, what catastrophic breakage would still get through?" If the answer is anything serious, your smoke subset is wrong.

> **AI usage:** permitted. Note that generated plans have a recognizable weakness relevant to this assignment: they allocate plausibly but rarely enforce a budget, and they almost never produce a *short* UI list — the tendency is to add UI coverage for everything, which is exactly the failure this chapter is about. Requirements 6 and 10 are where your own judgment shows.

---

## I. Quiz

Nine questions. Answer key: [`answer-keys/part-1/03-test-strategy-and-the-test-pyramid.answers.md`](../answer-keys/part-1/03-test-strategy-and-the-test-pyramid.answers.md).

**1.** What is the test pyramid fundamentally an argument about?

- A) The correct ratio of test types, ideally 70/20/10
- B) The cost, speed, stability, and diagnostic precision of tests at different distances from the code
- C) The order in which tests should be written
- D) Which team owns which tests

**2.** True or false: a suite with 70% unit tests, 20% API tests, and 10% UI tests is by definition well designed.

**3.** A team verifies the free-shipping threshold with 5 unit tests covering every boundary, and 1 UI test asserting that the cart page displays "FREE" for a qualifying cart. Which best describes this?

- A) Wasteful duplication — the rule is verified twice
- B) Defense in depth — the unit tests verify the arithmetic, the UI test verifies that the correct value reaches the customer
- C) Insufficient — the UI should also cover every boundary
- D) Incorrect placement — threshold logic belongs at the API layer

**4.** Which failure would an API test catch that a unit test could not?

- A) A rounding error in the discount calculation
- B) An endpoint that computes the total correctly but returns it in a field named `ammount`
- C) A cart page displaying a stale total from cache
- D) An invalid state machine transition

**5.** A suite has 200 UI tests, takes 38 minutes, and each test independently has a 2% chance of a false failure. Roughly how often does a full run pass cleanly?

- A) About 98%
- B) About 67%
- C) About 18%
- D) About 1.8%

**6.** Your team has an ice cream cone and asks you to improve reliability. What is the most effective first action?

- A) Add retries to the flaky tests
- B) Add more UI tests to cover the gaps
- C) Identify what business rule each slow, flaky UI test verifies, re-verify those rules at the API or unit layer, and delete the UI versions
- D) Split the suite across more parallel workers

**7.** Which of these is the strongest argument that a check needs automation, per Section C.8?

- A) It is easy to automate
- B) It is part of a critical user journey
- C) A failure would go unnoticed for a long time without a test
- D) The code changes frequently

**8.** A developer says: "We don't have unit tests, so cover the pricing rules through the UI." What is the best response?

- A) Agree — the risk is real and the UI is available
- B) Refuse — pricing rules belong in unit tests
- C) Offer to cover the pricing rules at the API layer instead, keeping the UI for the journeys that require a browser, and state the runtime difference
- D) Escalate to a manager

**9.** Diagnose this suite. A team reports: 310 automated tests, 52 minutes runtime, runs nightly only, 11 tests on a "known flaky" exclusion list, three production escapes last quarter in discount calculation. Which single statement best identifies the root problem?

- A) The suite needs more tests, since defects escaped
- B) The suite is too slow because CI hardware is underpowered
- C) The suite is concentrated at a layer too far from the code: it cannot run per-commit, cannot cover calculation edge cases economically, and cannot be trusted
- D) The flaky tests should be fixed and everything else is fine

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| The pyramid | An economic argument about distance from code, not a ratio to hit |
| Diagnostic precision | The further from the code, the less a failure tells you about what broke |
| The five layers | Unit, integration, API, UI, and exploratory on top |
| Placement discipline | Verify each behavior at the cheapest layer that can genuinely verify it |
| The ice cream cone | UI-heavy suites are slow, flaky, imprecise, and eventually ignored |
| Defense in depth vs waste | Duplication is justified only when each layer catches a failure the others cannot |
| Boundaries go low | Exhaustive edge cases belong where they cost a millisecond |
| Risk-based selection | Impact × change frequency × detectability decides what gets attention |
| Runtime budget | A design constraint stated up front, not an outcome discovered later |
| Suite shape decides CI | An ice cream cone structurally prevents fast feedback |

### Mistakes recap

Treating 70/20/10 as a target · automating everything through the UI · assuming one layer replaces another · the mega-test that verifies twelve things · ignoring layers you do not own · confusing end-to-end with thorough · omitting a runtime budget.

### The four placement questions

Worth memorizing, because you will use them for the rest of your career:

1. What is the cheapest layer that can **genuinely** verify this?
2. What would I lose by testing it one layer lower?
3. What can **only** this layer prove?
4. How stable is the interface I am coupling to?

### Competency check

> **Given any proposed test, can you name the cheapest layer that would genuinely verify it, and say what you would lose by moving it there?**

Try it on ten checks from a system you know. If you find yourself answering "UI" more than twice, you are probably reaching for the layer you are most comfortable with rather than the cheapest one that works.

Two secondary checks:

- Can you explain to a manager why deleting 190 UI tests would make a suite more reliable, in under a minute?
- Can you look at a suite's runtime and flake rate and predict what its shape must be?

**Gate for this chapter:** you are ready for [Chapter 1.4](04-regression-smoke-sanity-and-test-quality.md) when your Section H plan has more API checks than UI checks and you can defend every UI check against the question "why isn't this an API test?" That question is asked, in exactly those words, in the [Project 4](../projects/project-4-web-automation.md) defense.

---

[← 1.2 Manual Testing vs Test Automation](02-manual-vs-automation-testing.md) · [Next: 1.4 Regression, Smoke, Sanity, and Test Case Quality →](04-regression-smoke-sanity-and-test-quality.md)
