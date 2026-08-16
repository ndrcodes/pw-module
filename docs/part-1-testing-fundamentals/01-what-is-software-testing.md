# Chapter 1.1 — What Is Software Testing?

🟢 **Beginner** · [Part I Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | I — Software Testing Fundamentals |
| **Estimated time** | 1 session (90 min) + 3 hours independent work |
| **Prerequisite chapters** | None — this is the first chapter |
| **Next chapter** | [1.2 Manual Testing vs Test Automation](02-manual-vs-automation-testing.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** the purpose of software testing to both a technical and a non-technical audience, without claiming testing produces defect-free software.
2. **Describe** what testing can and cannot prove, and **articulate** why exhaustive testing is impossible.
3. **Distinguish** quality assurance from quality control, with a concrete example of each from a real development cycle.
4. **Distinguish** verification from validation, and **identify** a failure that passes verification but fails validation.
5. **Identify** the cost of finding a defect at different stages of the software lifecycle.
6. **Write** a testing charter for a feature that states what will be verified and what is explicitly out of scope.

---

## B. Prerequisite Knowledge

None. This chapter assumes no testing experience, no programming, and no tooling.

You will get more out of it if you have ever used software that behaved unexpectedly — which is everyone.

---

## C. Concept Explanation

### C.1 A definition worth being careful about

Software testing is the disciplined activity of gathering evidence about whether a system behaves as intended, so that people can make informed decisions about releasing it.

Every word in that sentence is load-bearing, and it is worth slowing down on three of them.

**Evidence**, not proof. You will see shortly why proof is unavailable.

**Decisions**, not approval. Testing does not decide whether to ship. It produces the information that someone — a product owner, a release manager, a team — uses to decide. Testers who believe their job is to grant or withhold permission end up in a political role they cannot win. Testers who believe their job is to make the decision *well-informed* are valuable to everyone in the room.

**As intended**, not merely as specified. Software can match its specification precisely and still be wrong, because the specification itself can be wrong. Holding both questions at once — does it match the spec, and is the spec right? — is what separates a tester from a checker.

### C.2 Why software fails

Before asking what testing is for, it helps to understand what it is up against. Software does not fail because programmers are careless. It fails for four structural reasons that no amount of care eliminates.

**Complexity.** A modest e-commerce checkout involves a cart, inventory, pricing, discounts, tax, shipping, payment, fraud checks, email, and an order record. That is ten subsystems, each with its own states, interacting. The number of possible combined states grows multiplicatively, not additively. No human holds all of it in their head at once, which means every change is made with partial knowledge.

**Change.** Working software is modified continuously. A discount rule added in March interacts with a tax rule written in January by someone who has since left. Nobody wrote either rule incorrectly; they were simply written without knowledge of each other. Most defects in mature systems are not new mistakes, they are old assumptions that stopped being true.

**Communication.** A feature passes through a customer's need, a product owner's description, a written ticket, a developer's reading of that ticket, and finally code. Each step is a translation, and translations lose things. When a tester finds that "apply discount" behaves differently from what the business expected, the defect frequently originated three steps before any code was written.

**Assumptions.** Every piece of code embeds beliefs about the world: that the customer has a last name, that the price is positive, that the network responds, that the timezone is the server's. Each holds until it does not. A famous class of these — assuming names contain only letters, assuming addresses have postcodes, assuming a person has exactly one phone number — has broken production systems at every large company you have heard of.

Notice that none of these four is fixed by trying harder. They are properties of building systems, which is why testing is a permanent discipline rather than a phase you eventually outgrow.

### C.3 What testing is for: information, not a stamp

Here is the question a beginner asks: *did the software pass?* Here is the question a professional answers: *what do we now know, and what do we still not know?*

Consider a real exchange. A release manager asks, "Is the checkout feature ready?"

A weak answer: "Yes, all my tests passed."

A strong answer: "I verified the standard purchase flow for card and wallet payments across Chrome and Safari, including declined cards and expired sessions. Those all behave correctly. I did not test partial refunds, and I could not test the fraud-check integration because the sandbox was down all week. The highest risk I see is that discount stacking has never been tested with more than two codes, and marketing plans to launch a triple-code promotion next month."

The second answer is more useful, more honest, and — importantly — it does not say yes or no. It hands the decision to the person whose job it is to make it, equipped with the shape of the unknown. This is the single most valuable habit in the profession, and it costs nothing to start now.

### C.4 Testing can never prove correctness

In 1970, Edsger Dijkstra wrote the sentence that defines the ceiling of our discipline:

> "Program testing can be used to show the presence of bugs, but never to show their absence."

This is not pessimism, it is arithmetic. Consider the least ambitious feature imaginable — a text field that accepts a discount code and a button that applies it. How many distinct inputs exist?

Suppose codes may be up to 12 characters, using digits and uppercase letters — 36 possibilities per position. The number of possible strings is `36 + 36² + ... + 36¹²`, which is about 4.7 quintillion (4.7 × 10¹⁸).

If you could test one input per microsecond, exhausting them would take roughly 150,000 years. And that is for a single field, ignoring everything that makes real software interesting: what was already in the cart, whether the user is logged in, which browser, what happens if they click twice, whether the network stalls mid-request, what the inventory service returns, what time zone the promotion expires in.

Two consequences follow, and they shape the entire course.

**First, testing is a sampling activity.** You will never cover the input space. You choose a sample. The quality of your testing is almost entirely the quality of that choice — which is why Chapter 1.3 and Chapter 4.3 spend so much effort on how to choose, and why "we wrote 400 tests" tells you nothing on its own.

**Second, "all tests passed" is a statement about your tests, not about the software.** It means: of the specific behaviors I chose to check, none misbehaved in the specific conditions I checked them under. That is genuinely valuable. It is not a claim of correctness, and presenting it as one is how testers lose credibility permanently — the moment a production defect appears in an area you declared "fully tested," every future statement you make is discounted.

### C.5 Error, defect, and failure — and why bug reports depend on the difference

These three words are used interchangeably in casual conversation. In a defect report they mean different things, and mixing them up is the most common reason a ticket bounces back with "cannot reproduce."

| Term | Definition | Example |
|---|---|---|
| **Error** (mistake) | A human action that produces an incorrect result | A developer writes `>` where `>=` was intended |
| **Defect** (bug, fault) | The resulting flaw in the artifact — code, requirement, or design | The free-shipping rule triggers above $100 instead of at $100 |
| **Failure** | The observable deviation from expected behavior, when the defect is executed | A customer with a $100.00 cart is charged $4.99 shipping |

The relationship runs one way and is lossy at every step. An error may produce no defect (the developer notices and fixes it). A defect may produce no failure — it can sit in production for years until conditions finally execute it. And crucially, **you observe failures; you must then locate the defect.**

Why this matters for the rest of your career: what you can report reliably is the failure, precisely. What you often cannot know is the defect. A report that says "the discount calculation is broken" is a guess about the defect dressed up as a fact. A report that says "cart subtotal $100.00, expected free shipping per REQ-114, actual shipping charge $4.99, reproduced 3/3 in Chrome 121 and Safari 17" is a description of the failure — and it is actionable within minutes because the developer can reproduce it without interviewing you.

You will practice this discipline in Chapter 1.4 and rely on it every time an automated test fails in [Chapter 6.9](../part-6-framework-engineering/09-diagnosing-flaky-tests.md).

### C.6 Quality assurance versus quality control

These two terms get used as synonyms, including by people whose job titles contain them. They describe genuinely different activities, and knowing which one you are doing tells you whether you are preventing problems or finding them.

| | Quality Assurance (QA) | Quality Control (QC) |
|---|---|---|
| **Focus** | The process that builds the product | The product itself |
| **Nature** | Preventive | Detective |
| **Question** | "Are we working in a way that produces quality?" | "Does this specific thing meet its requirements?" |
| **Timing** | Continuous, throughout | After something exists to inspect |
| **Examples** | Definition of done, code review standards, requirement review, CI gates, retrospectives | Executing test cases, verifying a bug fix, reviewing this build's report |

A concrete pair from one sprint:

- **QA activity:** In refinement, the team notices that the discount story does not say what happens when two codes are applied. They add an acceptance criterion before development starts. *Cost of the fix: one sentence, five minutes.*
- **QC activity:** Two weeks later, a tester applies two codes to a cart and finds both discounts stacking to a 90% reduction. *Cost of the fix: a bug report, a code change, a re-test, a redeployment, and a conversation about whether any customer already exploited it.*

Same problem. Different discipline caught it. Roughly two orders of magnitude difference in cost.

Most people entering this field are hired to do QC and gradually earn the ability to do QA. The transition happens when you start asking questions in refinement instead of only reporting findings after the build — and it is the clearest signal that someone is becoming senior.

### C.7 Verification versus validation

Barry Boehm's formulation is the one worth memorizing, because it fits in a breath:

- **Verification:** Are we building the product right?
- **Validation:** Are we building the right product?

Verification compares the software to its specification. Validation compares the software to the actual need. A system can pass verification completely and fail validation completely, and this is not a rare edge case — it is one of the most expensive failure modes in the industry, because everything downstream of a wrong requirement is wasted work performed correctly.

**A worked example.** Requirement REQ-208 states: *"Customers who abandon a cart shall receive a reminder email 24 hours after abandonment."*

The team implements it exactly. A tester verifies it thoroughly: the email fires at 24 hours, not 23 or 25; it fires once, not twice; it contains the right products; it does not fire if the customer completed the purchase; it does not fire for empty carts; it handles carts abandoned across a daylight-saving boundary. Every check passes. Verification: complete and correct.

Then the emails go out, and support receives complaints. Customers who bought the item **in a physical store** the same afternoon are being nagged about a cart they deliberately abandoned. Others receive reminders for items that sold out in the intervening day, so the email links to an out-of-stock page. The requirement never considered either case. The feature does exactly what it was told to do, and it is damaging the brand.

That is a validation failure. No amount of additional verification would have found it, because the code matches the spec — the spec is what is wrong.

The practical takeaway, and it is available to you immediately: when you read a requirement, ask *who is this for, and what will they do when it happens?* alongside *what does this say to build?* The first question is validation, and asking it during refinement is a QA activity. You do not need permission or seniority to ask it.

### C.8 The cost-of-defect curve

The single most reliable finding in software engineering economics is that the cost of fixing a defect rises steeply with how long it survives. The exact multipliers vary between studies, contexts, and decades, and you should treat any specific figure with suspicion — but the *shape* is uncontroversial and holds across every organization.

| Stage found | Relative cost | Why it costs that much |
|---|---|---|
| Requirements | 1× | Edit a sentence |
| Design | ~5× | Rework a diagram, revisit a decision |
| Implementation | ~10× | Change code, re-review |
| Testing | ~25× | Report, fix, re-test, re-deploy, regression-check |
| Production | ~100×+ | All of the above, plus incident response, support load, possible data repair, reputational damage, and lost revenue |

The multipliers come from a simple mechanism: **later defects have more built on top of them.** A wrong requirement caught in refinement affects one sentence. The same wrong requirement caught in production affects code, tests, documentation, training material, data already written in the wrong shape, integrations other teams built against it, and customers who have already been given the wrong behavior.

This curve is the economic argument for two things you will do throughout this course. It is why automated tests are worth their maintenance cost — they move detection from "production" to "minutes after the commit." And it is why the CI pipeline in [Part VII](../part-7-cicd/00-module-overview.md) is not a nice-to-have: a suite that runs on every commit collapses the distance between introducing a defect and learning about it, which is the only variable in this table you can actually control.

### C.9 Who owns quality

There is a comfortable and expensive model in which developers write code, throw it over a wall, and QA decides whether it may pass. It is comfortable because responsibility is clear. It is expensive for four reasons:

1. **It puts detection at the most costly point on the curve** — after everything is built.
2. **It removes the incentive for developers to think about quality**, because someone else is accountable for it.
3. **It makes the tester a bottleneck**, so pressure to release becomes pressure on one person to say yes.
4. **It creates an adversarial dynamic**, where finding defects feels like an accusation rather than a service.

The functional model is that **quality is owned by the whole team, and testers own the expertise about quality.** You are not the gate. You are the person who knows how to find out, who asks the question in refinement that saves three weeks, who builds the automation that tells everyone within eight minutes whether the last commit broke the purchase flow.

This distinction matters more for automation engineers than for anyone else, because the pipeline you build in Part VII is precisely the mechanism that distributes quality ownership: when a developer's own commit turns the build red before lunch, they fix their own defect, cheaply, while the change is still in their head. That is a better outcome than any gate, and building it is your job.

### C.10 Seven principles, presented as working tools

These are standard in the testing literature, often memorized for certification exams and then never used. They are more useful than that. Each one is a heuristic you can apply to a decision this week.

**1. Testing shows the presence of defects, not their absence.**
*Use it:* never write "no defects found" as a conclusion. Write what you covered and what you did not.

**2. Exhaustive testing is impossible.**
*Use it:* stop feeling guilty about untested combinations and start choosing deliberately. Your defense is a documented rationale, not completeness.

**3. Early testing saves time and money.**
*Use it:* review requirements before code exists. The cheapest defect you will ever find is one in a sentence.

**4. Defects cluster.**
*Use it:* a small number of modules typically contain most defects. When you find two problems in the discount engine, look for a third there before moving on. Historical defect data is the best free test-prioritization tool available.

**5. Tests wear out (the pesticide paradox).**
*Use it:* a regression suite that has passed unchanged for a year is no longer finding anything — insects develop resistance to the same pesticide. Periodically add new cases, or vary data. This is a direct argument for the data-driven testing you will build in [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md).

**6. Testing is context-dependent.**
*Use it:* an e-commerce site, a pacemaker, and an internal reporting tool warrant utterly different rigor. Before designing anything, ask what failure would actually cost here. "Best practice" without context is how teams spend six weeks automating a tool used by four people.

**7. Absence-of-errors is a fallacy.**
*Use it:* software can be defect-free against its spec and still useless. If you are the only person asking whether anyone wants this, you are the most valuable person on the team.

### C.11 The testing charter

A charter is a short written statement, produced *before* testing, that says what you will investigate, what evidence you will gather, and what you will not claim. It takes fifteen minutes and prevents two recurring problems: scope arguments after the fact ("I assumed you'd covered mobile"), and the vague-status problem where nobody can tell what your testing actually established.

A workable charter has five parts:

1. **Target** — the feature and version under test
2. **In scope** — what you will verify, specifically enough to be checkable
3. **Out of scope** — what you will explicitly *not* claim, and why
4. **Risks** — the three things most likely to be wrong, in priority order
5. **Evidence** — what you will produce so someone else can trust or reproduce your findings

The "out of scope" section is the one beginners omit and the one that saves them. Stating up front that you will not be testing the fraud integration because the sandbox is unavailable converts a future accusation into a known, accepted, documented risk. You will write one in Section H.

---

## D. QA Context

Everything above sounds abstract until you notice how much of an automation engineer's daily life it silently governs.

### D.1 "The suite is green" is a coverage statement

You will spend the next thirty weeks building suites, and you will be asked constantly whether things are safe to release. Section C.4 tells you exactly what a green suite licenses you to say.

**Not:** "The application works."
**Yes:** "The 340 behaviors this suite covers all behave as expected on Chromium and Firefox, as of commit `a3f91c2`."

The difference becomes concrete in [Part VII](../part-7-cicd/00-module-overview.md), when your pipeline posts a green check mark on every pull request. That check is a claim, and engineers will make decisions based on it. Knowing precisely what it does and does not assert is what makes you trustworthy rather than merely productive.

### D.2 Automation is verification; validation stays human

Here is a fact worth absorbing early, because it prevents both overconfidence and despair: **automated tests can only verify, never validate.**

An automated test asserts that behavior matches an expectation *you encoded*. If your expectation came from a wrong requirement, the test faithfully enforces the wrong behavior — and worse, it now actively defends it. Change the code to what customers actually need, and your test goes red. The suite has become a mechanism for preserving a defect.

This is not an argument against automation. It is the reason automation does not replace human testing, which is the whole subject of [Chapter 1.2](02-manual-vs-automation-testing.md). Machines are excellent at "does this still do what we said." Only people ask "should it do that?"

### D.3 A defect that passed every automated check

A team automated the abandoned-cart feature from Section C.7 thoroughly: 23 tests covering timing, content, deduplication, and edge cases around daylight saving. All green, for eight months, running on every commit.

The feature was quietly losing money the entire time. Customers who had bought in-store were being emailed, and a fraction unsubscribed from all marketing as a result — a permanent loss of a communication channel, invisible to any test because no test could ask whether the email should have been sent at all.

It was eventually found not by testing but by a support agent who noticed a pattern in complaints and mentioned it in a retrospective. The 23 tests were not wrong. They were answering a different question than the one that mattered.

Two habits follow directly. When you automate, record *which requirement* each test enforces, so that when the requirement changes you know which tests must change with it — you will build this into your suites from [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md) onward. And keep asking the validation question in refinement, forever, no matter how good your automation gets. Your suite will never ask it for you.

### D.4 Where the cost curve shows up in your work

The cost-of-defect curve is the justification for nearly every technical decision later in this course, and it is worth seeing the connections now rather than discovering them in Part VI.

| Practice you will learn | What it does to the curve |
|---|---|
| Tests in CI on every commit ([7.2](../part-7-cicd/02-jenkins-pipelines.md)) | Moves detection from days to minutes |
| Fast API tests instead of slow UI tests ([1.3](03-test-strategy-and-the-test-pyramid.md), [4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md)) | More feedback per hour, so defects surface sooner |
| A 3-minute smoke suite ([1.4](04-regression-smoke-sanity-and-test-quality.md)) | Catches catastrophic breakage before anyone wastes time on it |
| Diagnosable failure messages ([6.8](../part-6-framework-engineering/08-debugging-playwright-tests.md)) | Cuts the time between failure and fix |
| Reliable, non-flaky tests ([5.5](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md), [6.9](../part-6-framework-engineering/09-diagnosing-flaky-tests.md)) | Keeps the signal trusted, so detection is acted on rather than ignored |

That last row is the one people underestimate. A flaky suite does not merely waste time; it re-inserts the delay you paid to remove. If engineers learn that red sometimes means nothing, they stop looking, and a real defect sits undetected until production — with all the automation running perfectly the entire time.

### D.5 What this means for how you'll be judged

Read the rubrics in [Project 3](../projects/project-3-api-automation.md) and [Project 4](../projects/project-4-web-automation.md) with Section C.4 in mind and their weighting stops looking arbitrary. Test design outranks correctness because choosing the sample is the skill. Reliability outranks coverage because an untrusted suite has negative value. And graders ask "would this test fail for the right reason?" because a test that cannot fail is a test that gathers no evidence — it is a green light wired to nothing.

---

## E. Code Examples

There is no code in this chapter. Code begins in [Chapter 2.2](../part-2-programming-fundamentals/02-data-types.md).

What this chapter has instead are worked examples of the two written artifacts you will produce for the rest of your career: defect reports and testing charters. Both are graded in this course, and both are read by people who will judge your competence by them.

Throughout Part I, examples use a single running application, so you build familiarity with one domain rather than context-switching between toy problems.

### E.0 The running example: the demo shop

A conventional e-commerce site with the following features. You will meet it again in every part of this course, and automate it in Projects 3 and 4.

| Area | Behavior |
|---|---|
| Catalogue | Browse and search products; each has a price and a stock level |
| Cart | Add, remove, change quantity; shows subtotal, shipping, tax, total |
| Discounts | Codes apply a percentage or fixed reduction; some have minimum spend |
| Shipping | Free above $100 subtotal, otherwise $4.99 |
| Checkout | Address and card details, with field validation |
| Payment | Approve or decline; declines must preserve the cart |
| Orders | Order history, visible only to the customer who placed the order |

Two requirements referenced repeatedly:

> **REQ-114** — Orders with a subtotal of $100 or more qualify for free standard shipping. Subtotal is calculated after discounts and before tax.

> **REQ-208** — Customers who abandon a cart shall receive a reminder email 24 hours after abandonment.

### E.1 Example: a defect report that will bounce

```text
Title: Shipping is broken

The shipping calculation doesn't work properly. I added stuff to my cart
and the shipping was wrong. This is a major issue, please fix ASAP.
```

Every line of this is a problem, and it is worth naming them individually because beginners write this report constantly:

- **"Shipping is broken"** describes a suspected defect, not the observed failure. The reporter does not actually know the calculation is at fault — the subtotal, the discount, or the requirement could be.
- **"I added stuff"** is unreproducible. Which products? What quantities?
- **"the shipping was wrong"** omits both halves of the only comparison that matters: what appeared, and what was expected.
- **No reference to a requirement**, so "wrong" is the reporter's opinion, which invites the reply "no, that's intended."
- **No environment**, so a browser- or build-specific failure cannot be narrowed.
- **"major issue"** is asserted, not argued. Severity claims without impact evidence get discounted.

A developer receiving this must interview the reporter before starting. That interview costs both people twenty minutes and happens hours later, by which time the reporter has forgotten what was in the cart.

### E.2 Example: the same finding, reported well

```text
Title: Free shipping not applied at exactly $100.00 subtotal (REQ-114 boundary)

Environment: staging, build 2026.04.17-a3f91c2, Chrome 121 / macOS 14
Account:     qa-buyer-04@example.test

Steps to reproduce:
1. Add "Aeron Desk Lamp" ($49.50) x 2 to an empty cart  -> subtotal $99.00
2. Add "Cable Clip Pack" ($1.00) x 1                    -> subtotal $100.00
3. Open the cart page

Expected: Shipping shows "FREE" (REQ-114: subtotal of $100 or more qualifies)
Actual:   Shipping shows "$4.99"; order total $104.99

Reproduced: 3/3 attempts, Chrome 121 and Safari 17.3
Boundary behavior observed:
  $99.99  -> $4.99  (correct)
  $100.00 -> $4.99  (INCORRECT, expected FREE)
  $100.01 -> FREE   (correct)

Severity: High. Every customer landing exactly on the threshold is
overcharged $4.99. Last month 1,842 orders had a subtotal between
$100.00 and $100.99 (source: #analytics-ops query, attached).

Artifacts: screenshot-cart-100.png, har-cart-100.har
```

Compare what the two reports accomplish. This one is reproducible without conversation, cites the requirement so "wrong" is not a matter of opinion, isolates the boundary so the developer can guess the cause before opening the code (`>` where `>=` was meant, almost certainly), and argues severity with evidence rather than adjectives.

Note carefully what it does **not** do: it never claims to know the defect. It reports the failure precisely and lets the person with access to the code locate the cause. That is the Section C.5 distinction in practice.

The boundary table is the detail that distinguishes a professional report, and it comes from a technique you will formalize in [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md): when something involves a threshold, always test just below, exactly at, and just above.

### E.3 Example: a weak testing charter

```text
Charter: Test the discount feature

I will test the discount code feature and make sure it works correctly.
I'll check that discounts apply and the totals are right.
```

Three fatal weaknesses. "Make sure it works" is unbounded, so nobody can tell when it is finished or what was covered. There is no out-of-scope section, so every gap becomes an accusation later. And no risks are identified, meaning effort will be spread uniformly instead of aimed where failure is most likely — the tester will spend equal time on the happy path and on the case that will actually cost money.

### E.4 Example: a charter that does its job

```text
CHARTER: Discount codes at checkout
Feature: discount-codes v1.4  |  Build: 2026.04.17-a3f91c2  |  Tester: A. Rahman
Timebox: 4 hours              |  Date: 2026-04-18

TARGET
  Application of discount codes on the cart and checkout pages, and their
  interaction with the free-shipping threshold (REQ-114) and tax.

IN SCOPE — I will verify that:
  1. A valid percentage code reduces the subtotal by the stated percentage.
  2. A valid fixed-amount code reduces the subtotal by the stated amount.
  3. An invalid, expired, or already-used code is rejected with a message
     naming the reason, and the cart is unchanged.
  4. A code with a minimum-spend condition is rejected below that spend and
     accepted at and above it (boundary: -$0.01 / exact / +$0.01).
  5. Free shipping is evaluated on the POST-discount subtotal (REQ-114),
     including the case where a discount drops the subtotal below $100.
  6. Tax is calculated on the discounted subtotal, not the original.
  7. Removing a code restores the original subtotal, shipping, and tax.
  Browsers: Chrome 121, Safari 17.3. Desktop viewport only.

OUT OF SCOPE — I will NOT be claiming anything about:
  - Stacking multiple codes. The requirements do not define the behavior;
    I raised this in refinement (ticket SHOP-3312) and it is unspecified.
    ** This is the largest known gap and it is deliberate. **
  - Mobile viewports — deferred to the responsive test pass next sprint.
  - Fraud-check interaction — sandbox has been unavailable since 04-14.
  - Load or performance characteristics of code validation.
  - Admin-side code creation; this charter covers customer-facing use only.

RISKS, HIGHEST FIRST
  1. Ordering of discount / shipping / tax. Three interacting rules written
     by three people at different times. Most likely place for a defect and
     the most expensive if wrong, since it is a money calculation.
  2. Rounding on percentage discounts. A 33% discount on $10.01 has no exact
     cent representation; rounding direction is unspecified.
  3. Stacking. Unspecified behavior often means "whatever the code happens
     to do," which historically means uncapped stacking.

EVIDENCE I WILL PRODUCE
  - A results table: case, input, expected, actual, pass/fail.
  - Screenshots of every failure, plus a HAR file where the discrepancy is
    between the displayed value and the API response.
  - A written note on any behavior that is unspecified rather than wrong,
    for refinement rather than the bug tracker.
```

This charter takes about fifteen minutes to write and does four things the weak version cannot.

It is **checkable** — anyone can read item 5 and know whether it was done. It is **honest about limits**, converting a future argument into an accepted risk that a manager can act on today (someone reading this may well pause the release until stacking is specified). It is **prioritized by risk** rather than by feature list, so the money calculation gets attention before the cosmetic message wording. And it **separates unspecified from wrong**, which is the Section C.7 validation instinct made operational: item 3's stacking behavior is not a bug to file, it is a requirement gap to raise.

The three risks are also a small demonstration of principle 4 from Section C.10. They are not chosen at random; they are the places where multiple authors, multiple rules, or unspecified behavior intersect — which is where defects cluster in every system you will ever test.

---

## F. Common Mistakes

### F.1 Promising defect-free software

**The mistake:** telling a stakeholder "it's fully tested" or "there are no bugs."

**Why it happens:** it is what people want to hear, and refusing to say it feels obstructive.

**What it costs:** the first production defect in an area you declared clean permanently devalues every future statement you make. You cannot get that credibility back cheaply.

**Instead:** state coverage and gaps. "The purchase flow is verified for card and wallet payments on Chrome and Safari. Discount stacking is untested and unspecified." Nobody has ever been fired for that sentence.

### F.2 Reporting a suspected defect as an observed failure

**The mistake:** "the discount calculation is broken."

**Why it happens:** you have formed a hypothesis while investigating, and the hypothesis feels like knowledge.

**What it costs:** a developer investigates the discount code, finds it correct, and closes the ticket as "cannot reproduce" — when the actual defect was in the shipping threshold, and it is still in production.

**Instead:** report inputs, expected, actual, as in E.2. Put your hypothesis in a clearly-labelled separate line if you have one: *"Possibly a `>` vs `>=` issue at the threshold — untested guess."*

### F.3 Treating QA as a phase after development

**The mistake:** waiting for a build before engaging with a feature.

**Why it happens:** the ticket board is organized that way, and reviewing requirements does not feel like testing.

**What it costs:** you operate permanently at the 25× column of the cost curve, and you spend your career reporting problems that could have been sentences.

**Instead:** attend refinement and ask two questions — "what should happen when…?" and "how will we know this worked?" The abandoned-cart disaster in D.3 was one question away from never existing.

### F.4 Reporting opinions instead of evidence

**The mistake:** "the checkout page feels slow." "The error message is confusing."

**Why it happens:** the perception is real and you want to raise it.

**What it costs:** the ticket is dismissed as subjective, and a genuine problem stays unfixed.

**Instead:** convert perception into measurement or comparison. "Checkout takes 6.2s to interactive on a throttled 4G profile; the catalogue page takes 1.1s under identical conditions." Now it is a fact with a baseline, and it is hard to dismiss.

### F.5 Testing what is easy instead of what is risky

**The mistake:** thorough coverage of the login form, nothing on the money calculations.

**Why it happens:** the login form is easy to reason about, easy to automate, and produces a satisfying number of test cases.

**What it costs:** effort concentrated where failure is cheap. A wrong login error message is an annoyance; a wrong tax calculation is a refund program and possibly a regulatory problem.

**Instead:** write your three highest risks before designing anything, as the E.4 charter does. If your test list does not attack them first, redo the list. This instinct becomes structural in [Chapter 1.3](03-test-strategy-and-the-test-pyramid.md).

### F.6 Assuming a written requirement is correct

**The mistake:** treating the ticket as ground truth and testing only conformance to it.

**Why it happens:** it is defensible — you did what the spec said — and questioning requirements feels above your pay grade.

**What it costs:** REQ-208. Twenty-three passing tests and eight months of quiet damage.

**Instead:** for each requirement ask who benefits, what they will do when it happens, and what happens in the situation the author probably did not imagine. You are not overruling anyone; you are asking a question, in public, cheaply, before it costs 100×.

### F.7 Confusing "the test passed" with "the behavior is correct"

**The mistake:** trusting a green result without ever having seen the test fail.

**Why it happens:** green is the goal, and a passing test feels like completed work.

**What it costs:** tests that assert nothing. This is not hypothetical — it is common enough that every project rubric in this course carries a specific deduction for it, and graders check by mutating your expected values.

**Instead:** adopt the habit now, before you write a line of code: **a test you have never seen fail is a test you have not written.** Break the expectation, watch it go red, confirm the message is informative, then restore it. You will formalize this in [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md).

---

## G. Exercise

Work through these in order; each builds on the previous. Suggested total time: 90 minutes.

### G.1 Easy — Twenty things that could go wrong (25 min)

The demo shop's login page has an email field, a password field, a "remember me" checkbox, a "Sign in" button, and a "Forgot password?" link.

**Task A.** List twenty distinct things that could go wrong. Aim for genuinely different failures, not twenty variations of a bad password.

**Task B.** Group your twenty into these categories and count each:

| Category | What belongs here |
|---|---|
| Functional | The feature does the wrong thing |
| Data | Specific inputs cause problems (empty, huge, unusual characters, unicode) |
| Usability | It works but people will misuse or misunderstand it |
| Security | It leaks information or allows unauthorized access |
| Performance | It works but too slowly, or fails under load |
| Compatibility | It fails on a specific browser, device, or viewport |

**Task C.** Which category has the fewest items on your list? That is your current blind spot — most beginners produce fifteen functional cases and one security case. Write two more items in your weakest category.

**Task D.** Now mark the three whose failure would be **most expensive**. Are they the same three you thought of first? Usually not, and noticing that gap is the point of the exercise.

<details>
<summary>Hints if you are stuck below fifteen</summary>

Consider: what if the email has no `@`? Leading or trailing spaces? 500 characters? Emoji? What if the password is correct but for a different account? What if the account is locked, or unverified, or deleted? What if you submit twice quickly? What if you press Enter instead of clicking? What does the error message reveal about whether the email exists? What if "remember me" is checked on a shared computer? What if the session cookie never expires? What if you navigate back after logging out? What if the password manager autofills a stale value? What about screen readers, or keyboard-only navigation?

</details>

### G.2 Medium — Classify twelve sprint activities (25 min)

Classify each as **QA** (preventive, process-focused), **QC** (detective, product-focused), or **both**, and write one sentence of justification. Four are genuinely ambiguous; the justification matters more than the label.

| # | Activity |
|---|---|
| 1 | Executing 40 regression test cases against build 2026.04.17 |
| 2 | Adding "has acceptance criteria for error cases" to the definition of ready |
| 3 | Reviewing a pull request for missing null handling |
| 4 | Verifying that yesterday's bug fix actually resolved the reported failure |
| 5 | Running a retrospective on why three defects escaped to production |
| 6 | Writing an automated test for the free-shipping threshold |
| 7 | Configuring CI to block merges when the test suite fails |
| 8 | Asking in refinement what should happen when two discount codes are applied |
| 9 | Exploratory testing of the checkout flow for 45 minutes |
| 10 | Establishing a naming convention for test files |
| 11 | Triaging which of 60 open defects will be fixed this sprint |
| 12 | Investigating why a test passes locally but fails in CI |

Then answer: **which two of these activities have the highest ratio of value to effort, and why?** Defend it using the cost-of-defect curve from Section C.8.

### G.3 Challenge — A contradictory requirement (40 min)

You are handed this requirement for the demo shop:

> **REQ-301 — Loyalty discount**
>
> 1. Customers in the Gold loyalty tier receive 15% off every order.
> 2. Discount codes may not be combined with any other discount.
> 3. All customers may apply one discount code per order.
> 4. Orders with a subtotal of $100 or more after discounts qualify for free shipping (REQ-114).
> 5. The Gold tier discount shall be shown as a separate line in the order summary.

**Task A.** Identify every contradiction and every gap. There are at least three. For each, write the specific scenario that exposes it.

**Task B.** A build arrives. You test it and find that a Gold customer applying a discount code receives both reductions. Write two separate things:

1. The **verification result** — does the implementation match REQ-301? State which numbered clause(s) it matches and which it violates. Notice that this is harder than it looks.
2. The **validation finding** — independent of the spec, what is the business problem here?

**Task C.** Write the actual message you would send the product owner. Requirements:

- Under 200 words
- States the specific scenario, not "there's a contradiction"
- Quantifies the impact if possible, or says what you would need in order to quantify it
- Proposes at least two resolution options rather than only asking what to do
- Does not blame the author

**Task D.** Reflect in writing: at which point in the cost curve was this caught, and at which point *could* it have been caught? What would it have cost to find in refinement?

<details>
<summary>One contradiction, to check you are on the right track</summary>

Clause 2 says codes cannot combine with any other discount. Clause 1 gives Gold customers an automatic 15% discount. Clause 3 says *all* customers may apply a code. So a Gold customer applying a code satisfies clause 3 and violates clause 2 simultaneously — the spec both permits and forbids the same action, and gives no precedence rule. Whatever the code does is neither correct nor incorrect against this document, which is precisely why a tester cannot verify it. Two more remain: look at clause 4's interaction with clause 1, and at what clause 5 implies about clause 2.

</details>

---

## H. Coding Assignment

No code in this chapter. The equivalent applied deliverable:

### Assignment 1.1 — Testing charter for a real feature

**Objective.** Produce a charter that a colleague could act on, demonstrating that you can bound your own work, state what you will not claim, and prioritize by risk rather than by feature list.

**The feature.** The demo shop's **"apply discount code at checkout."** Requirements as given:

> **REQ-410** — Customers may enter one discount code on the cart page.
> **REQ-411** — Codes are either percentage-based (1-50%) or fixed-amount ($1-$50).
> **REQ-412** — Codes may carry a minimum-spend condition and an expiry date.
> **REQ-413** — A rejected code must display the reason and leave the cart unmodified.
> **REQ-414** — Free shipping (REQ-114) is evaluated on the post-discount subtotal.
> **REQ-415** — Tax is calculated on the post-discount subtotal.

**Deliverable.** One page — genuinely one page — as `charter-discount-codes.md`, containing all five charter sections from Section C.11.

**Requirements.**

| # | Requirement |
|---|---|
| 1 | **Target** identifies the feature and the build or version |
| 2 | **In scope**: 6-10 numbered, checkable statements. "Verify totals are correct" is not checkable; "verify tax is computed on the post-discount subtotal" is |
| 3 | **Out of scope**: at least 4 items, each with a reason. At least one must be something you cannot test rather than merely chose not to |
| 4 | **Risks**: exactly 3, ranked, each with a justification referencing something structural — interacting rules, unspecified behavior, multiple authors, or money |
| 5 | **Evidence**: what artifacts you will produce, specific enough that a colleague could reproduce your findings from them |
| 6 | Includes at least one **boundary case** in scope, with the specific values named |
| 7 | Identifies at least one **gap in the requirements** — something REQ-410 to REQ-415 do not specify — and states it as a requirements question rather than a defect |
| 8 | Timeboxed: state how long this charter's work should take |
| 9 | Fits on one page. Concision is part of the assessment |

**Constraints.** No application to explore — work from the requirements alone, which is the realistic situation when you are asked to plan testing before a build exists. Do not invent behavior; where the requirements are silent, that silence is your requirement 7 finding.

**Acceptance criteria.**

- [ ] All five sections present
- [ ] Every in-scope item is objectively checkable by someone else
- [ ] Every out-of-scope item has a stated reason
- [ ] Exactly three risks, ranked, each justified structurally rather than by vague suspicion
- [ ] At least one boundary case with explicit values
- [ ] At least one requirements gap raised as a question
- [ ] One page
- [ ] A peer can read it and tell you exactly what you will and will not have established

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Checkability of in-scope items | 30% | Every item verifiable without interpretation |
| Quality of out-of-scope reasoning | 25% | Gaps stated as accepted, justified risks, not omissions |
| Risk prioritization | 25% | Risks reflect where defects actually cluster; ranking defensible |
| Requirements gap identified | 10% | A real gap, framed as a question rather than a bug |
| Concision and clarity | 10% | One page; a stranger understands it immediately |

**Self-check before submitting.** Hand the charter to someone who has not read the requirements and ask: "After I finish this work, what will you still not know about this feature?" If they cannot answer from your document, your out-of-scope section is not doing its job.

> **AI usage:** not required for this assignment, and not restricted. If you use it, an [AI usage log](../00-course-overview/05-ai-policy.md#ai-usage-log-format) is optional here but good practice. Be aware that AI-generated charters are recognizably generic — they list plausible test items and almost never identify the one real requirements gap, because doing so requires noticing what is *absent* rather than elaborating what is present.

---

## I. Quiz

Eight questions. Answers and full explanations: [`answer-keys/part-1/01-what-is-software-testing.answers.md`](../answer-keys/part-1/01-what-is-software-testing.answers.md).

**1.** A colleague reports: "I ran the full regression suite and everything passed, so the release is safe." What is the most accurate correction?

- A) The suite should be run again to confirm
- B) Passing means the covered behaviors worked under the conditions tested; it says nothing about uncovered behaviors
- C) Regression suites cannot detect defects, only performance issues
- D) The release is safe, but only for the tested browsers

**2.** True or false: exhaustive testing is achievable for a sufficiently small feature, such as a single checkbox.

**3.** Match each item to error, defect, or failure.

| Item | |
|---|---|
| i | A developer types `>` intending `>=` |
| ii | A customer with a $100.00 cart is charged $4.99 shipping |
| iii | The free-shipping comparison in `calculateShipping()` uses the wrong operator |

**4.** Which of these is a QA activity rather than QC?

- A) Verifying that a bug fix resolved the reported failure
- B) Executing 40 regression cases against tonight's build
- C) Adding "error cases have acceptance criteria" to the definition of ready
- D) Exploratory testing of the checkout flow

**5.** A feature implements REQ-208 exactly. Every automated test passes. Customers complain that the behavior is unhelpful and some unsubscribe. Which statement is correct?

- A) Verification failed; validation succeeded
- B) Verification succeeded; validation failed
- C) Both failed
- D) This is a performance defect, not a verification or validation issue

**6.** Your team finds a defect in production that was introduced during requirements definition. Using the cost curve, which statement best describes the situation?

- A) The cost is the same as if it had been found during implementation, since the fix is identical
- B) The cost is roughly 100× the requirements-stage cost, because artifacts, data, integrations, and customer expectations have accumulated on top of it
- C) The cost is lower in production because real usage makes the fix clearer
- D) The curve applies only to code defects, not requirements defects

**7.** Which principle best explains why a regression suite that has passed unchanged for eighteen months may have lost most of its value?

- A) Testing is context-dependent
- B) Defects cluster
- C) Tests wear out (the pesticide paradox)
- D) Absence-of-errors is a fallacy

**8.** Scenario judgment. You are two days from release. You have verified the purchase flow thoroughly but could not test the refund flow because the payment sandbox was unavailable all week. Your manager asks, "Are we good to go?" Which response is most professional?

- A) "Yes, everything I tested passed."
- B) "No, I can't sign off — the refund flow is untested."
- C) "The purchase flow is verified across both payment methods and all target browsers. The refund flow is entirely untested because the sandbox has been down since Monday; I don't know whether it works. If refunds are in this release, that's an unquantified risk, and I'd want either a sandbox or a manual check in production behind a flag."
- D) "Refunds are the payment team's responsibility, so it's not in my scope."

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Purpose of testing | Gather evidence so others can decide, not grant approval |
| Dijkstra's principle | Testing reveals the presence of defects, never their absence |
| Exhaustive testing | Impossible even for trivial features; all testing is sampling |
| Error / defect / failure | A mistake creates a flaw which, when executed, produces an observable deviation |
| QA vs QC | Preventing problems in the process versus detecting them in the product |
| Verification vs validation | Building it right versus building the right thing |
| Cost curve | The same defect costs roughly 100× more in production than in requirements |
| Ownership of quality | The team owns quality; testers own the expertise |
| Charter | A pre-written statement of scope, non-scope, risks, and evidence |

### Mistakes recap

Promising defect-free software · reporting suspected defects as observed failures · treating QA as a phase · reporting opinions instead of evidence · testing what is easy rather than what is risky · assuming written requirements are correct · trusting a test you have never seen fail.

### Things worth carrying forward

Three specific habits from this chapter will be assessed repeatedly for the next thirty weeks, so it is worth being deliberate about them now:

**Report failures, not diagnoses.** Inputs, expected, actual, environment. Your hypothesis is welcome but must be labelled as one.

**State what you did not cover.** Every status update, every charter, every project README. This is what makes the rest of your claims believable.

**Never trust a test you haven't seen fail.** Starting in Part IV this becomes mechanical — break the expectation, watch it go red, read the message, restore it.

### Competency check

You should be able to do this without notes:

> **A product manager asks what your testing established about the discount feature. Explain what you verified, what you did not, and what you cannot claim — without overclaiming and without hiding behind jargon.**

If your explanation contains the words "fully tested," "no bugs," or "it works," try again. If it contains a specific list of what was covered, a specific list of what was not, and a named risk, you have the core skill of this chapter.

Two secondary checks:

- Can you give an example, in your own domain, of something that would pass verification and fail validation?
- Can you explain to a developer *why* you are asking a question in refinement, in a way that does not sound like criticism?

---

[← Part I Overview](00-module-overview.md) · [Next: 1.2 Manual Testing vs Test Automation →](02-manual-vs-automation-testing.md)
