# Instructor Notes — Part I: Software Testing Fundamentals

[← Module Overview](00-module-overview.md) · [Table of Contents](../README.md)

**Audience mix to expect:** a bimodal cohort. Experienced manual testers will find the content familiar and may disengage; career changers and fresh graduates will need every word. Plan for differentiated activities from day one.

---

## 1. Teaching goals for the module

Your job in Part I is not to transfer definitions. Learners can look up "verification vs validation" in ten seconds. Your job is to install three habits that survive into the coding parts:

1. **Ask what a test proves before writing it.** Most beginner tests assert something incidental.
2. **Treat maintenance cost as real.** Automation feels free at authoring time and expensive forever after.
3. **Prefer the cheapest layer that can answer the question.** This habit is what makes Parts IV-VI make sense.

If learners leave Part I with those three reflexes and hazy definitions, you have succeeded. The reverse is a failure.

---

## 2. Common beginner misconceptions

| Misconception | How it surfaces | How to correct it |
|---|---|---|
| "Testing proves the software works" | Learners write objectives like "verify the app has no bugs" | Dijkstra's line, then a live demo: a passing suite on an app with an obvious visual defect you introduced |
| "QA owns quality" | Learners say the team "hands over to QA" | Ask who owns quality when a developer writes a bug and QA finds it in production. Push toward shared ownership. |
| "Automation is faster" | Learners assume automating 100 cases saves 100 manual runs immediately | Do the arithmetic live: authoring hours + maintenance hours per sprint vs manual minutes per run. Show the break-even point. |
| "Automate everything" | Assignment answers with 20/20 "automate now" | Introduce a feature that changes weekly and ask for the annual maintenance estimate |
| "The pyramid is a rule about counts" | Learners recite "70/20/10" without meaning | Reframe as a rule about *feedback speed and stability per layer*. Counts are a symptom, not the goal. |
| "Flaky tests are just a fact of life" | Learners plan for retries before writing a single test | Establish the course norm early: a flaky test is a defect in the test. Reinforced in 5.5 and 6.9. |
| "Smoke and sanity are the same" | Used interchangeably | Anchor each to a trigger: smoke = after every deploy, broad and shallow; sanity = after a targeted fix, narrow and deep |
| "Automation is not real development" | Reluctance to learn Git, review, or clean code | Show a real 3,000-line test repository with duplicated locators and ask who would want to own it |

---

## 3. Concepts learners find genuinely difficult

**Verification vs validation.** The textbook phrasing ("are we building it right / are we building the right thing") is memorable but not understood. Use a concrete failure: a login form that correctly implements a spec requiring an 8-character maximum password. Verification passes. Validation fails, because the requirement itself is wrong. Ask: whose job was it to catch that, and at which stage?

**The pyramid as an economic argument.** Beginners hear "put fewer tests in the UI" as a stylistic preference. Make it economic: put the same check at three layers, time each, then change a CSS class and see which layers break. The pyramid then becomes obvious rather than doctrinal.

**Maintenance cost.** This is the hardest idea for anyone who has never maintained a suite. It is abstract until they feel it. The strongest available proxy is to hand them a small suite with 12 duplicated locators, ask them to rename one button in the app, and time how long the fix takes.

**"What should not be automated."** Learners want a checklist. Resist giving one. Give them criteria instead — change frequency, execution frequency, determinism, business risk, cost to automate — and make them weigh conflicts.

---

## 4. Suggested demonstrations

### Demo 1 — The passing suite on a broken app (10 min, Chapter 1.1)

Prepare an app where the "Add to cart" button is invisible (white on white) but functional. Run a small suite that passes. Ask: "Is this software working?" Then ask what the suite proved and what it did not. Establishes that assertions encode assumptions, and that green is not truth.

### Demo 2 — Break-even arithmetic (15 min, Chapter 1.2)

Live spreadsheet, learners supplying the numbers:

```text
Manual: 40 cases × 3 min = 120 min per regression run, 2 runs per sprint
Automated: 40 cases × 45 min to author = 30 hours one-time
           + 2 hours maintenance per sprint
Question: after how many sprints does automation pay back?
Second question: what happens to the answer if the UI is redesigned in sprint 4?
```

Do not smooth the numbers. Letting automation look expensive is the point; it earns credibility for the cases where it genuinely wins.

### Demo 3 — Same check, three layers (20 min, Chapter 1.3)

Take one rule — "an order over $100 gets free shipping" — and show it verified as a unit test, an API test, and a UI test. Time all three. Then change a button label and rerun. Only the UI test breaks. Then change the business rule to $150 and show all three break, which is correct.

### Demo 4 — Test case autopsy (15 min, Chapter 1.4)

Project a genuinely bad test case (vague title, six unrelated steps, expected result "works as expected", depends on data from a previous case). Have the room rewrite it collectively. Keep the rewrite visible for the rest of the course; it becomes the standard you hold assignments to.

---

## 5. Suggested live activities

| Activity | Chapter | Format | Time |
|---|---|---|---|
| "What could go wrong with this login form?" rapid-fire | 1.1 | Whole class, whiteboard | 10 min |
| Sort 12 supplied statements into QA / QC | 1.1 | Pairs | 10 min |
| Automate-or-not card sort with 20 real test cases | 1.2, 1.3 | Groups of 3, then defend to the room | 25 min |
| Pyramid placement of 15 checks for a checkout feature | 1.3 | Groups, sticky notes on a drawn pyramid | 25 min |
| Design a 5-minute smoke suite for the demo shop | 1.4 | Individual, then compare | 20 min |
| Rewrite five bad test cases | 1.4 | Pairs, swap and critique | 25 min |

The card sort in 1.2/1.3 is the highest-value activity in this part. Deliberately include cases with no clean answer — a feature that is business-critical *and* redesigned every sprint — so learners must argue trade-offs rather than apply a rule.

---

## 6. Questions to ask learners

Use these to check understanding rather than recall. Good answers are arguments, not definitions.

- "Our suite is green. What are three things that could still be broken in production?"
- "This test has been passing for eight months without ever failing. What is it worth? Would you delete it?"
- "You have 40 hours. Automate 100 test cases at the UI level, or 30 at the API level? Why?"
- "The developer says this check is already covered by a unit test. How do you decide whether to also cover it at the API layer?"
- "This test fails once every twenty runs. What do you do first, and what do you refuse to do?"
- "How would you explain to a product manager why you are not automating the new feature this sprint?"
- "Who owns quality here?" (Follow up on any answer that names one role.)
- "What is the maintenance cost of this suite per sprint, and how would you measure it?"

---

## 7. Signs a learner is struggling

| Signal | Likely cause | Response |
|---|---|---|
| Assignment answers are all "automate now" | Has not internalized cost | One-on-one break-even calculation using their own numbers |
| Recites definitions verbatim but cannot apply them to the demo app | Memorizing, not modeling | Move to concrete-first: give the scenario before the term |
| Says "it depends" without naming criteria | Absorbed the hedge, not the reasoning | Force ranked criteria: "list the three factors that would change your answer" |
| Places everything in the UI layer | Does not yet believe other layers exist | Show a real API request/response pair in DevTools; preview Chapter 4.1 |
| Experienced manual tester disengaged and dismissive | Content feels beneath them | Give the hard version: hand them the ambiguous card-sort cases and ask them to mentor a peer |
| Anxious about the coding parts ahead | Impostor feelings, very common in this cohort | Name it explicitly. Show the Part II ordering and that it starts before variables. |

---

## 8. Remediation exercises

**For learners who cannot distinguish QA from QC:**
Give ten activities from a real sprint (writing acceptance criteria, running a regression pass, reviewing a design doc, triaging a bug, improving the definition of done). Classify each and explain. Repeat with a second set until the classification is fast.

**For learners who automate everything:**
Give them a feature that will be redesigned in three months, with 30 test cases. Require a written recommendation with an annual cost estimate. Then reveal the redesign happened early and ask what it cost them.

**For learners who cannot place tests on the pyramid:**
Provide 20 checks and only two allowed answers per check ("API or UI", "unit or API"). Removing the third option lowers the cognitive load and makes the reasoning visible. Add the third layer back once they are consistent.

**For learners who write vague test cases:**
Constrained rewriting: every test case must have a title stating the expected outcome, at most five steps, exactly one assertion sentence, and no dependency on another case. Ten cases, no exceptions.

**For learners who are ahead:**
Have them write the "anti-strategy": design a test suite deliberately as badly as possible (order-dependent, shared data, all UI, unclear names), then write the diagnosis of each flaw. Inverting the problem builds sharper judgment than another correct exercise, and the artifact is reusable in Chapter 8.2's code review work.

---

## 9. Assessment guidance for this part

- **Grade arguments, not conclusions.** In the automate-or-not assignment, a well-reasoned "keep manual" and a well-reasoned "automate" can both earn full marks. An unreasoned answer earns few marks either way.
- **Require numbers.** Any claim that automation saves time must include an estimate. The estimate can be wrong; it cannot be absent.
- **Reject "works as expected"** anywhere in a submitted test case, without further comment. Learners fix it once and never do it again.
- **Quizzes here are cheap points.** That is fine. The purpose is to establish vocabulary. Save the discrimination for the assignments.

---

## 10. Transition into Part II

End the final session of Part I by connecting the two parts explicitly, because the change of subject is jarring:

> "Everything you decided in Part I — what to automate, at which layer, in which suite — is now a programming problem. For the next eight weeks you are not going to write tests. You are going to learn to write code, using QA data the whole time. The first thing we do is not variables. It is learning to break a problem into input, process, and output, because that is the skill that makes every automation problem tractable."

Set expectations honestly: Part II is where learners historically fall behind, and falling behind is recoverable only if they say so early. Establish now how they will signal it.
