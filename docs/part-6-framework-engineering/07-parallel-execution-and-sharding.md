# Chapter 6.7 — Parallel Execution and Sharding

🔴 **Advanced** · [Part VI Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VI — Framework Engineering |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [6.4](04-test-data-management.md), [6.5](05-configuration.md), [6.6](06-cross-browser-and-mobile.md) |
| **Next chapter** | [6.8 Debugging Playwright Tests](08-debugging-playwright-tests.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** how Playwright parallelizes work across workers, and what a worker is.
2. **Configure** `workers` and `fullyParallel`, and **choose** a worker count from measurement rather than guesswork.
3. **Identify** tests that cannot safely run in parallel, and **name** the shared resource in each case.
4. **Use** `test.describe.serial` and `test.describe.configure` deliberately, with a written justification.
5. **Shard** a suite across multiple machines and **merge** the resulting reports.
6. **Diagnose** a failure that appears only under parallel execution.
7. **Measure** the runtime-versus-stability curve and **recommend** a configuration.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| **Data ownership, factories, unique data** | [Chapter 6.4](04-test-data-management.md) — hard prerequisite |
| Authentication state strategy | [Chapter 6.3](03-authentication-strategies.md) |
| Config, projects, reporters | [Chapters 6.5](05-configuration.md), [6.6](06-cross-browser-and-mobile.md) |
| Independence and isolation | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |
| Concurrency and `Promise.all` | [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) |

If your tests do not yet create their own uniquely identified data, fix that before this chapter. Parallelism will otherwise produce a week of failures you cannot explain.

---

## C. Concept Explanation

Playwright runs tests in **workers** — separate processes, each with its own browser instance and its own fixture instances. Turning parallelism on is one config value, and the effect on a real suite is dramatic: a 24-minute serial run can become 4 minutes. That speed is what makes a suite runnable on every commit instead of nightly, which is what makes it useful.

Parallelism also does something that beginners experience as Playwright being unreliable: **it exposes every shared-state shortcut you took.** Two tests that both edit the same seeded product, both log in as the same user and modify their cart, or both depend on a database row's initial value will now interleave and fail intermittently. The correct interpretation is not that parallelism broke the tests; it is that the tests were always broken and serial execution was hiding it. Everything in [Chapter 6.4](04-test-data-management.md) exists to make this chapter uneventful.

Two pieces of judgment matter here. First, **worker count is an empirical question.** More workers help until you exceed the machine's capacity, after which processes contend for CPU, timing gets erratic, and both runtime and stability degrade. You measure the curve — 1, 2, 4, 8, 16 — and choose from data, ideally derived from the CI agent's actual core count rather than your laptop's. Second, some tests genuinely cannot run in parallel: a test that changes a global feature flag, exhausts a rate-limited endpoint, or verifies a system-wide setting. `test.describe.serial` exists for those, and using it is legitimate *with a comment explaining the shared resource*. Using it because your data design is wrong is not, and reviewers should be able to tell the difference from your comment.

Sharding extends the same idea across machines: shard 1 of 4 on one CI agent, shard 2 of 4 on another, then merge the blob reports into one HTML report. Workers scale within a machine; shards scale across them, and you generally want both.

> **Full section coming in a follow-up pass.** Planned coverage:
> - Workers: what they are, what they isolate, and what they share
> - `fullyParallel` versus per-file parallelism, and the default behavior
> - Choosing a worker count: measuring the curve, CI core counts, and the degradation point
> - What breaks under parallelism: shared data, shared users, global state, rate limits, ports
> - Diagnosing parallel-only failures: reproduction, evidence, and the shared-resource hunt
> - `test.describe.serial`: correct uses, and the required justification comment
> - `test.describe.configure({ mode })` and per-file overrides
> - Worker-scoped fixtures and per-worker data, including the worker index
> - Environment capacity: does the system under test tolerate your concurrency?
> - Sharding: `--shard=1/4`, distributing across agents, and blob report merging
> - Combining projects, workers, and shards without multiplying confusion
> - Runtime versus stability: making the trade-off explicit and measured
> - Reporting: keeping results coherent across workers and shards

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: why suite runtime is the single number that determines whether a suite runs per-commit or gets relegated to nightly ([Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md)); how parallel-only failures are the most common "CI is flaky" complaint and almost always a data-design defect; why the system under test also has a concurrency limit that your suite can exceed; how sharding is what makes a 40-minute suite viable in a 10-minute pipeline; and why "I measured and chose 4 workers because the agent has 4 cores" is the answer that distinguishes an engineer from a config copier.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** the same suite with `--workers=1` and `--workers=4`, timed
> 2. **Practical:** two tests sharing a seeded product failing under parallelism, then fixed by per-test creation
> 3. **QA-oriented:** a genuinely serial test (global feature flag) with its justification comment, alongside a wrongly-serial one
> 4. **Automation-oriented:** a sharded run across four shards with merged blob reports, plus the worker-scaling measurement table

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Enabling parallelism before tests own their data
> - Setting workers to an arbitrary large number
> - Blaming Playwright for parallel-only failures
> - `test.describe.serial` used to paper over shared state
> - Serial blocks with no comment explaining the shared resource
> - Worker-scoped fixtures holding mutable state
> - Ignoring the system under test's capacity and rate limits
> - Sharding without merging reports, so results are fragmented
> - Measuring runtime once and not checking stability
> - Reducing workers to hide flakiness instead of fixing the cause

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Run your suite at 1, 2, 4, and 8 workers and record wall-clock time for each.
> - **Medium:** Find and fix every parallel-only failure in your suite, naming the shared resource in each case.
> - **Challenge:** Shard the suite across four shards, merge the reports into one, determine the maximum stable worker count with evidence, and write a one-paragraph configuration recommendation for a CI agent with four cores.

---

## H. Coding Assignment

> **Planned: Parallel-safe suite with a measured configuration.** Deliver a suite passing `--workers=4 --repeat-each=3` three consecutive times; a documented list of every test that must be serialized with the shared resource named; a worker-scaling measurement table with a recommended setting; a working sharded run with merged reports; and a written diagnosis of at least two parallel-only failures you fixed. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: predict-what-breaks-under-parallelism, worker-count reasoning, serial-block justification judgment, workers-versus-shards distinction, and two diagnosis scenarios. Answer key at [`answer-keys/part-6/07-parallel-execution-and-sharding.answers.md`](../answer-keys/part-6/07-parallel-execution-and-sharding.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *can you name every test in your suite that cannot run in parallel, and the specific resource each one shares?*

---

[← 6.6 Cross-Browser and Mobile Emulation](06-cross-browser-and-mobile.md) · [Next: 6.8 Debugging Playwright Tests →](08-debugging-playwright-tests.md)
