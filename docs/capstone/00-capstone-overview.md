# Final Capstone Project — Full-Stack Automation Framework

🔴 **Advanced** · [Table of Contents](../README.md) · **Weight:** 20% of the final grade

| | |
|---|---|
| **After** | All 47 chapters, Parts I-VIII |
| **Suggested timing** | Weeks 29-32 (build in 29-31, defend in 32) |
| **Estimated effort** | 40-50 hours |
| **Deliverable** | A production-quality automation framework, a running CI pipeline, documentation, and a 30-minute defense |
| **Team size** | Individual |

---

## 1. What this is

Everything before this point was scaffolded. Chapters told you what to learn, projects told you what to build, and rubrics told you what "done" meant. The capstone removes most of that. You are given an application and a mandate — **build the automation a real team could adopt and maintain** — and the decisions are yours to make and defend.

That shift is the assessment. A junior automation engineer can follow a specification. The engineer this course aims to produce can look at an application, decide what to automate and at which layer, design a framework that will survive a year of change, run it in CI so it produces value on every commit, and explain every choice to a skeptical colleague. The capstone measures that, not your ability to make Playwright work.

Practically, this is also your portfolio piece. It is the artifact you show in interviews, and the questions in §8 are close to the questions you will be asked there.

---

## 2. Deliverables

| # | Deliverable | Notes |
|---|---|---|
| D1 | **The framework** | Layered TypeScript + Playwright project, in Git, with meaningful commit history |
| D2 | **API test suite** | Covering the application's core resources |
| D3 | **Web test suite** | Covering the application's critical user journeys |
| D4 | **CI pipeline** | Jenkins, running the containerized suite and publishing artifacts |
| D5 | **`docs/test-strategy.md`** | What is automated, at which layer, and what is deliberately *not* automated, with reasons |
| D6 | **`docs/architecture.md`** | The layers, their responsibilities, dependency direction, and the trade-offs you accepted |
| D7 | **`docs/decisions.md`** | A decision log: each significant choice, the alternatives, and why you chose as you did |
| D8 | **`README.md`** | Setup, run instructions per environment, project layout, troubleshooting |
| D9 | **Reliability evidence** | Results of 3 consecutive full CI runs, with timings and any retries |
| D10 | **Handover note** | One page: what a new engineer must know in their first week, and what you would do next with more time |
| D11 | **Defense** | A 30-minute session: 10-minute walkthrough, 20 minutes of questions |

D5 and D7 carry unusual weight for documents. A framework whose author cannot say what they chose *not* to automate has not made a strategy; it has accumulated tests.

---

## 3. Requirements

### 3.1 Framework architecture

| # | Requirement |
|---|---|
| A1 | Clear layers: tests → page objects / API clients → support (config, data, fixtures) → external system. Dependencies point one direction only. |
| A2 | No locators, no HTTP calls, and no raw credentials in any file under `tests/` |
| A3 | No assertions inside Page Objects or API clients |
| A4 | Shared UI regions modeled as components, not duplicated across Page Objects |
| A5 | **Custom fixtures** for authenticated sessions, seeded data, and API clients ([Chapter 6.2](../part-6-framework-engineering/02-fixtures.md)) |
| A6 | **Authentication via storage state or API**, established once per worker, not per test ([Chapter 6.3](../part-6-framework-engineering/03-authentication-strategies.md)) |
| A7 | **Data factories/builders** producing unique, valid data per run, with cleanup ([Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md)) |
| A8 | **Environment configuration** for at least two environments, validated at startup, switchable without code changes ([Chapter 6.5](../part-6-framework-engineering/05-configuration.md)) |
| A9 | No secrets in the repository; `.env` git-ignored; `.env.example` complete; CI secrets injected |
| A10 | TypeScript `strict`; zero compile errors; no unjustified `any`; lint clean |
| A11 | Every abstraction in the framework is used by at least two callers, or its existence is justified in `docs/decisions.md` |

A11 is there to stop the most common capstone failure: a framework with eleven layers of helpers wrapping a suite of fifteen tests. Abstraction is a cost paid for reuse; unpaid, it is just indirection.

### 3.2 Test coverage

| # | Requirement |
|---|---|
| C1 | **API suite**: full CRUD on at least two resources; positive, negative, boundary, authentication, and authorization cases |
| C2 | **Web suite**: at least 3 complete critical user journeys, asserted at every meaningful step |
| C3 | **Layer discipline**: every test sits at the cheapest layer that can catch its defect, and `docs/test-strategy.md` says why |
| C4 | **Smoke subset**: a tagged smoke suite completing in under 3 minutes, suitable for gating a deploy ([Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md)) |
| C5 | **Full regression suite** runnable on demand |
| C6 | **Cross-browser**: web suite green on Chromium plus one other engine |
| C7 | At least **60 tests** total, every one justifiable — and no test present only to raise the count |
| C8 | At least one test using **network interception** to reach a state the UI cannot produce naturally |
| C9 | Every test verified to be capable of failing for the reason it claims |

### 3.3 Reliability

| # | Requirement |
|---|---|
| R1 | Full suite green on **3 consecutive CI runs** with no code changes and no manual reruns |
| R2 | Green with `--fully-parallel` and at least 4 workers |
| R3 | Green with `--repeat-each=2` on the web suite |
| R4 | Green in reversed and randomized order |
| R5 | Every spec file green when run in isolation |
| R6 | **Zero** `waitForTimeout`, `sleep`, or arbitrary delays |
| R7 | **Zero** self-written retry or polling loops |
| R8 | Retries configured at **most 1** in CI, with any retried test recorded and explained in D9 |
| R9 | No test leaves data behind that affects the next run |

R8 deserves explanation. Retries are legitimate protection against genuine infrastructure noise, but they are also the standard way flakiness gets buried. Configuring `retries: 3` and reporting green is not passing this capstone; it is hiding the thing being assessed. Any test that needed a retry must be named and diagnosed.

### 3.4 CI/CD

| # | Requirement |
|---|---|
| P1 | A **Jenkins pipeline** defined as code in the repository ([Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md)) |
| P2 | Pipeline stages at minimum: checkout → install → lint/typecheck → API tests → web tests → publish |
| P3 | Suite runs inside **Docker**, reproducibly, with pinned browser versions ([Chapter 7.3](../part-7-cicd/03-docker-for-test-automation.md)) |
| P4 | **HTML report published** and reachable from the build |
| P5 | **Screenshots, videos, and traces archived** on failure |
| P6 | Pipeline **fails the build** on test failure and on typecheck/lint failure |
| P7 | **Secrets injected by Jenkins credentials**, never committed, never printed in logs |
| P8 | Smoke and full-regression runs invocable separately |
| P9 | A demonstrable failing build: introduce a real defect, show the pipeline going red, and show that the artifacts diagnose it without a local rerun |
| P10 | Meaningful Git history: focused commits, readable messages, at least one PR ([Chapter 7.1](../part-7-cicd/01-git-for-automation-engineers.md)) |

P9 is the requirement that proves the pipeline is real. A green pipeline demonstrates that nothing is wrong; a red one that explains itself demonstrates that the pipeline is worth having.

### 3.5 Professional quality

| # | Requirement |
|---|---|
| Q1 | Test names describe behavior and expected outcome, readable by a non-programmer |
| Q2 | No commented-out tests, no skipped tests without a linked reason, no dead code |
| Q3 | No duplication that a reviewer would flag; no premature abstraction either |
| Q4 | Comments explain *why*, never *what* ([Chapter 8.1](../part-8-professional-engineering/01-clean-code-for-automation.md)) |
| Q5 | The framework passes the [Part VIII review checklist](../part-8-professional-engineering/00-module-overview.md) applied to itself |
| Q6 | Failure messages diagnosable by someone who did not write the test |

---

## 4. Suggested schedule

Four weeks, and the ordering matters more than the hours.

### Week 29 — Strategy and skeleton

Explore the application manually and thoroughly. Write `docs/test-strategy.md` and get it reviewed *before building anything* — a wrong strategy costs you the whole capstone, and it is cheap to correct on paper. Then stand up the skeleton: config, one API client, one Page Object, one fixture, one test of each kind, running locally. End the week with a thin but complete vertical slice.

### Week 30 — Breadth

Build out the API suite fully, then the web journeys. Extract abstractions as duplication appears, never before. Keep the suite green at all times; do not accumulate a backlog of broken tests. Start `docs/decisions.md` now, while you still remember why you chose things — reconstructing it later produces rationalizations, not reasons.

### Week 31 — Reliability and CI

Containerize. Build the pipeline stage by stage, verifying each before adding the next. Then attack reliability seriously: parallel, repeated, reversed, randomized, throttled. Fix causes. This is the week where hidden flakiness surfaces, and leaving it for Week 32 is how learners fail.

### Week 32 — Hardening, docs, defense

Finish documentation. Run the three clean consecutive CI runs and record them. Do the deliberate-failure demonstration (P9). Review your own code against the Part VIII checklist and fix what you find. Rehearse the walkthrough out loud, with the trace viewer open, and have someone else attempt setup from your README alone.

**The most common way this project goes wrong:** building tests for three weeks and leaving CI and reliability for the last one. Both are worth 30% of the grade combined, both surface problems that take days to fix, and neither can be rushed. Have a pipeline running something trivial by the end of Week 29 if you can.

---

## 5. Acceptance criteria

Checked before grading. Anything unchecked is a finding.

**Framework**
- [ ] `npx tsc --noEmit` clean under `strict`; lint clean
- [ ] No locator strings, HTTP calls, or credentials under `tests/`
- [ ] No assertions in Page Objects or API clients
- [ ] Dependency direction is one-way and stated in `docs/architecture.md`
- [ ] Two environments switchable by configuration alone
- [ ] `.env` git-ignored; `.env.example` complete; no secret anywhere in history

**Coverage**
- [ ] ≥60 tests; API and web suites both meet C1 and C2
- [ ] Smoke subset tagged and completes under 3 minutes
- [ ] Cross-browser run green
- [ ] Network interception test present
- [ ] `docs/test-strategy.md` states what is *not* automated and why

**Reliability**
- [ ] 3 consecutive clean CI runs recorded with timings
- [ ] Green under 4 workers, `--repeat-each=2`, reversed, randomized, and per-spec isolation
- [ ] `grep -r "waitForTimeout"` returns nothing outside docs
- [ ] Retries ≤1; every retried test named and diagnosed in D9

**CI/CD**
- [ ] Pipeline defined in the repository and running
- [ ] Suite runs in Docker with pinned versions
- [ ] HTML report reachable from the build; traces/screenshots/videos archived on failure
- [ ] Build goes red on test, typecheck, and lint failure
- [ ] Deliberate-failure demonstration prepared
- [ ] Git history focused and readable; at least one PR

**Documentation**
- [ ] All of D5-D10 present and current
- [ ] A peer completed setup using only the README

---

## 6. Grading rubric

| Dimension | Weight | What earns full marks |
|---|---|---|
| **Framework architecture and layering** | 20% | Clean layers with one-way dependencies; fixtures, factories, and config doing real work; every abstraction earned; a new engineer could add a test without reading the whole codebase |
| **API automation suite** | 15% | Deliberate coverage across positive, negative, boundary, authentication, and authorization; contracts validated; tests catch defects for the right reasons |
| **Web automation suite** | 15% | Critical journeys genuinely automated; locators that survive redesign; web-first assertions; Page Objects expressing intent |
| **Reliability under parallel execution** | 15% | Three clean consecutive CI runs; parallel-, order-, and repetition-safe; zero hard waits; isolation and cleanup complete; retries not used as cover |
| **CI/CD** | 15% | Pipeline as code; containerized and reproducible; artifacts published; build fails correctly; secrets handled properly; failing build diagnosable from artifacts alone |
| **Code quality and clean code** | 10% | Behavior-describing names; no duplication and no premature abstraction; no dead or skipped code; diagnosable failures; passes the Part VIII checklist |
| **Documentation, decisions, and defense** | 10% | Strategy explains scope *and* exclusions; architecture explains trade-offs; decision log shows alternatives considered; defense answers questions with reasons rather than recollection |

**Passing threshold:** 70%. See [Assessment Strategy §1](../00-course-overview/04-assessment-strategy.md#passing-thresholds).

### Automatic deductions

| Issue | Deduction |
|---|---|
| Any `waitForTimeout` or arbitrary sleep | −25% |
| Any secret committed, at any point in Git history | −25% |
| Suite not green on 3 consecutive CI runs | −20% |
| Flakiness masked by retries >1 or by unexplained retried tests | −20% |
| No working CI pipeline | −20% |
| Tests dependent on execution order | −20% |
| No `docs/test-strategy.md`, or one that does not address exclusions | −15% |
| Suite not runnable in Docker | −15% |
| Assertions in Page Objects, or locators in test files | −15% |
| Artifacts not published on failure | −10% |
| Tests that cannot fail | −10% each |
| Cannot explain a design decision during the defense | −10% per instance |

### What distinguishes an excellent capstone

A passing capstone works. An excellent one shows judgment:

- The test strategy explains what was left out, and the reasoning holds up under challenge.
- Several tests were moved *down* the pyramid during development, and the decision log says why.
- At least one abstraction was deliberately **not** built, with the reasoning recorded.
- Flakiness was diagnosed and fixed at the cause, with the investigation documented.
- The failure output is good enough that an on-call engineer who has never seen the repository could act on it.
- The handover note is honest about limitations and specific about what comes next.

That last property is the strongest signal of all. Engineers who write "known limitations: the checkout suite depends on a shared test account, which will break under higher parallelism — my next step would be per-worker account provisioning" are describing systems accurately. That is the job.

---

## 7. Defense format

30 minutes, with your framework and Jenkins open.

| Minutes | Content |
|---|---|
| 0-10 | **Your walkthrough.** Strategy, architecture, a representative test at each layer, the pipeline, and one thing you are proud of. Rehearse this; ten minutes is short. |
| 10-25 | **Questions.** From §8 and from your specific code. Expect follow-ups, and expect to be challenged on at least one decision. |
| 25-30 | **Live task.** A small change made in front of the panel — add a test, adjust a locator, explain a trace. |

"I don't know" followed by how you would find out is a good answer. Confident invention is not; panels can tell, and it costs more than the admission would have.

---

## 8. Questions you will be asked

**Strategy**
- What did you decide not to automate, and what convinced you?
- Which of your UI tests should be API tests, if you are honest?
- If you had one more week, what would you do, and why that before anything else?
- How would this suite need to change if the team shipped ten times a day?

**Architecture**
- Walk me through what happens between `npm test` and the first assertion.
- Which abstraction would you delete today?
- Where does a new engineer add a test for a new page? Show me.
- What breaks if the login flow changes? How many files?

**Reliability**
- Which test was hardest to stabilize, what was the actual cause, and how did you find it?
- Show me a test failing. Diagnose it from the artifacts alone.
- What is the longest your suite ever waits, and what controls it?
- How do you know your tests can fail?

**CI/CD**
- Show me a red build and diagnose it without running anything locally.
- Where do the credentials come from, and prove they are not in the logs.
- Why Docker? What would break without it?
- Which stage would you add next?

**Judgment**
- What would a reviewer criticize first?
- What is the weakest part of this framework?
- Which decision would you reverse now?
- What did you learn in this course that changed how you write tests?

---

## 9. AI policy for the capstone

The **professional** stage of the [AI policy](../00-course-overview/05-ai-policy.md#5-guidance-by-course-stage): AI use is permitted broadly, as it would be at work, under two conditions.

1. **You must be able to explain and defend every line.** The defense enforces this. Code you cannot account for is treated as code you did not write, regardless of who typed it.
2. **The [AI usage log](../00-course-overview/05-ai-policy.md#ai-usage-log-format) is mandatory**, and must be specific: what you asked for, what you accepted, what you rejected and why.

The rejections are the interesting part. An engineer who declined a suggested locator because it coupled the test to layout has demonstrated the judgment this course exists to build — far more convincingly than one who accepted everything and happened to end up green.

Two things must be yours regardless: the **test strategy** and the **architecture decisions**. Those are the judgment being assessed. Generate the boilerplate if you like; the thinking is the deliverable.

---

## 10. After the capstone

You will have a portfolio-grade framework, a running pipeline, and — more valuable — documented evidence that you can make and defend engineering decisions. When an interviewer asks for an example of a technical trade-off you made, `docs/decisions.md` is the answer, and few junior candidates have one.

Before you move on, do two things. Write down the three things you would build differently next time, while the reasons are fresh. Then put the repository somewhere you can point at, with a README that makes sense to someone who has never met your instructor.

---

[← Project 4 — E-Commerce Web Automation](../projects/project-4-web-automation.md) · [Table of Contents](../README.md)
