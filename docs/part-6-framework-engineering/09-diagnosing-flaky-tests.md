# Chapter 6.9 — Diagnosing Flaky Tests

🔴 **Advanced** · [Part VI Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VI — Framework Engineering |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [5.5](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md), [6.4](04-test-data-management.md), [6.7](07-parallel-execution-and-sharding.md), [6.8](08-debugging-playwright-tests.md) |
| **Next chapter** | [7.1 Git for Automation Engineers](../part-7-cicd/01-git-for-automation-engineers.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Apply** a structured diagnostic method: reproduce, categorize, hypothesize, change one thing, verify.
2. **Reproduce** an intermittent failure deliberately using repetition, CPU and network throttling, and parallel load.
3. **Classify** a flaky failure into one of the eight causal categories, with evidence.
4. **Distinguish** a flaky test from a genuine application race condition, and **escalate** the latter.
5. **Fix** root causes across all categories, and **prove** each fix with a documented run volume.
6. **Operate** a flake register, and **explain** why retries without tracking are harmful.
7. **Write** a flake investigation report a colleague could act on.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Synchronization primitives and hard-wait replacement | [Chapter 5.5](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md) |
| Data ownership and uniqueness | [Chapter 6.4](04-test-data-management.md) |
| Parallel execution and shared-resource failures | [Chapter 6.7](07-parallel-execution-and-sharding.md) |
| Traces and artifact-based diagnosis | [Chapter 6.8](08-debugging-playwright-tests.md) |
| Determinism and isolation | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |

---

## C. Concept Explanation

[Chapter 5.5](../part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md) taught you not to sleep. This chapter turns that instinct into a repeatable investigation you can run on any intermittent failure, including ones you did not write, in a suite you did not build. It is the most senior skill in the course, and it is what teams will actually pay you for — because a suite nobody trusts is worse than no suite, and someone has to be the person who fixes that.

The method has five steps and the discipline is in not skipping any. **Reproduce** deliberately: `--repeat-each=30`, CPU throttling, network throttling, running under full parallel load, running on the CI agent. A failure you cannot reproduce is a failure you cannot verify a fix for. **Categorize** with evidence, into one of eight causes: timing and synchronization, locator ambiguity, test data collision, environment differences, network variability, concurrency and shared state, a genuine application race condition, or an ordinary bug in the test code. **Hypothesize** a specific mechanism, not a vague feeling. **Change one thing** — changing three means learning nothing from the outcome. **Verify** with volume: twenty to thirty consecutive clean runs under the conditions that reproduced the failure, because a single pass proves nothing about a failure that occurred one run in fifteen.

The category that matters most is the one learners are quickest to dismiss: sometimes the test is right and the *application* has a race condition. A double-submitted order, a stale cache, a UI that renders before its data arrives — these are real defects that a "flaky test" label buries. Deciding correctly between "my test is wrong" and "I have found a real bug" is the judgment this chapter exists to build. Retries interact directly with that: they are a defensible concession to genuinely unreliable infrastructure, and they are also a mechanism for silently discarding evidence of application race conditions. Hence the **flake register**: every retried or quarantined test recorded, with its category, hypothesis, and owner. A team with retries and no register has stopped noticing.

> **Full section coming in a follow-up pass.** Planned coverage:
> - What flakiness costs, revisited with the trust dynamic
> - The five-step method, with a worked end-to-end example
> - Reproduction techniques: `--repeat-each`, `--workers`, CPU/network throttling, headless-versus-headed, CI agents
> - The eight categories: symptoms, evidence to gather, and typical fixes for each
> - Using traces across multiple runs to compare a pass with a failure
> - Application race conditions: how to recognize one and how to write the bug report
> - Order dependence and state leakage, found by shuffling and isolating
> - Time, timezone, locale, and date-boundary flakiness
> - Third-party dependencies and network variability; mocking as a deliberate choice
> - Verification volume: how many runs constitute proof, and why
> - Retries: legitimate use, configuration, and the harm of untracked retries
> - Quarantine: tagging, excluding from the gate, and the expiry rule
> - The flake register: fields, ownership, and review cadence
> - Measuring suite health: flake rate, mean time to diagnose, quarantine count
> - Writing the investigation report

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: why flake rate is the metric that determines whether a team blocks merges on the suite; how to run a weekly flake triage as a team ritual; how CI retry data becomes the input to the register ([Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md)); how to push back professionally when asked to "just add retries so the build is green"; and why the investigation report you produce here is one of the strongest artifacts you can bring to a senior QA interview.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** reproducing a 1-in-10 failure with `--repeat-each=30`
> 2. **Practical:** the same failing test diagnosed under CPU throttling, categorized, and fixed
> 3. **QA-oriented:** one example per category — timing, locator, data, concurrency — each with its evidence and fix
> 4. **Automation-oriented:** a genuine application race condition identified, escalated as a bug report, with the test left intact rather than "fixed"

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Adding a retry before diagnosing
> - Declaring a fix proven after one green run
> - Changing several things at once
> - Assuming timing when the cause is ambiguity or data
> - Labeling an application race condition as a flaky test
> - Quarantining a test and never revisiting it
> - Increasing timeouts as a general remedy
> - Fixing one occurrence while the same cause remains in twenty tests
> - No register, so the same flake is rediagnosed every month
> - Blaming CI without opening a single artifact

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Reproduce a supplied intermittent failure and record its failure rate over 30 runs.
> - **Medium:** Diagnose five flaky tests, one per category, writing the evidence and hypothesis for each before fixing.
> - **Challenge:** In a supplied suite with a 15% failure rate, achieve zero failures over 30 consecutive parallel runs; one of the causes is a genuine application race condition that you must identify and report rather than paper over.

---

## H. Coding Assignment

> **Planned: Flake investigation report and stabilization.** Deliver a full investigation for at least three intermittent failures: reproduction method and measured failure rate, category with evidence, hypothesis, the single change made, and verification over 30 runs — plus a flake register for your suite, a retry policy with justification, and a bug report for any application race condition found. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: categorize-the-flake scenarios, choose-the-reproduction-technique, "is this fix proven?" judgment, test-bug-versus-application-bug discrimination, and two retry-policy items. Answer key at [`answer-keys/part-6/09-diagnosing-flaky-tests.answers.md`](../answer-keys/part-6/09-diagnosing-flaky-tests.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *can you take an intermittent failure you have never seen, and produce a categorized root cause with evidence and a verified fix?*
>
> This closes Part VI's chapters. Confirm the module gate before Part VII: no locators outside page objects, no UI login except in login tests, per-test data with reliable cleanup, nothing hardcoded, `--workers=4 --repeat-each=3` green three times running, every serialized test justified, and failures diagnosable from artifacts alone.

---

[← 6.8 Debugging Playwright Tests](08-debugging-playwright-tests.md) · [Next: Part VII — 7.1 Git for Automation Engineers →](../part-7-cicd/01-git-for-automation-engineers.md)
