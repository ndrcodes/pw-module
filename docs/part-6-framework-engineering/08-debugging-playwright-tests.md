# Chapter 6.8 — Debugging Playwright Tests

🟡 **Intermediate** · [Part VI Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VI — Framework Engineering |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [6.5](05-configuration.md), [6.7](07-parallel-execution-and-sharding.md) |
| **Next chapter** | [6.9 Diagnosing Flaky Tests](09-diagnosing-flaky-tests.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Debug** interactively using headed mode, `--debug`, the Inspector, `page.pause()`, and UI mode.
2. **Configure** and **read** traces, screenshots, and video, and **explain** what each captures.
3. **Diagnose** a failure from artifacts alone, without rerunning the test.
4. **Use** `test.step` and custom assertion messages to make traces and reports self-documenting.
5. **Inspect** network activity, console output, and page errors captured during a run.
6. **Choose** the right debugging tool for a given symptom, and **explain** why.
7. **Debug** a failure that reproduces only in CI, using a structured checklist.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Reporters, artifacts, and config options | [Chapter 6.5](05-configuration.md) |
| Parallel execution and its failure modes | [Chapter 6.7](07-parallel-execution-and-sharding.md) |
| Locators, assertions, synchronization | [Part V](../part-5-web-automation-playwright/00-module-overview.md) |
| Artifacts' role in investigation | [Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) |

---

## C. Concept Explanation

There are two ways to respond to a failing test. One is to rerun it with a `console.log` added, then rerun it again, then again — an approach that costs minutes per iteration on a browser test and fails entirely when the failure does not reproduce locally. The other is to read what Playwright already recorded about the run that failed. This chapter is about becoming the second kind of engineer.

The **trace** is the centerpiece. A trace is a complete recording of the test: every action with its timing, a DOM snapshot before and after each one, every network request and response, console output, page errors, and the source line that triggered each step. Opening a trace lets you scrub through the failed run like video, inspect the actual DOM at the moment the assertion failed, and see that the API returned a 500 three actions earlier. Compare that with a screenshot, which tells you only what the final pixel state looked like, and the difference in diagnostic power is enormous — the trace often turns a twenty-minute investigation into a two-minute one.

Interactive tools cover the other half. Headed mode shows you the browser; `--debug` and `page.pause()` stop execution and open the Inspector, where you can step through actions and try locators against the live page; UI mode gives you a watch-mode workflow with time-travel over each test. The skill is matching tool to symptom: a locator you cannot get right calls for the Inspector's pick-locator tool, a failure you cannot reproduce locally calls for the CI trace, and an intermittent failure calls for the diagnosis discipline of [Chapter 6.9](09-diagnosing-flaky-tests.md).

One habit multiplies the value of all of it. Wrapping meaningful phases in `test.step` and attaching custom messages to assertions makes traces and reports readable to someone who has never seen your code — including you, six months from now, at 2 a.m.

> **Full section coming in a follow-up pass.** Planned coverage:
> - Reading a failure message properly before touching anything
> - Headed mode, `--debug`, and the Playwright Inspector
> - `page.pause()` as a breakpoint, and locator experimentation in the Inspector
> - UI mode: watch, time travel, and locator picking
> - The VS Code extension: breakpoints, run-at-cursor, live debugging
> - Trace configuration: `on`, `off`, `retain-on-failure`, `on-first-retry`
> - Reading a trace: timeline, actions, before/after snapshots, network, console, source
> - Screenshots and video: what they add and their cost
> - `test.step` for self-documenting traces
> - Custom assertion messages and `expect.soft` in diagnosis
> - Attachments: adding request payloads, API responses, and data to the report
> - Console and page-error capture; `page.on("console")` and `page.on("pageerror")`
> - Verbose Playwright logs (`DEBUG=pw:api`) and when they help
> - Debugging CI-only failures: the structured checklist
> - Debugging under parallelism, and isolating with `--grep` and `--workers=1`
> - Node inspector for framework code, briefly

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: why artifacts must be published from CI on failure ([Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md)) — a red build with no trace wastes the run; how trace-first debugging changes triage from an hour to minutes and changes how a team perceives the QA function; how `test.step` structure makes a report readable by a product owner; why "I cannot reproduce it locally" is the beginning of an investigation rather than a conclusion; and how these skills feed directly into the flake diagnosis method next chapter.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** running one test headed, and with `--debug`
> 2. **Practical:** trace configuration, then opening a trace and locating the failing action
> 3. **QA-oriented:** the same failure diagnosed from a screenshot versus from a trace, side by side
> 4. **Automation-oriented:** a test instrumented with `test.step`, custom assertion messages, and an attached API response, shown as it appears in the report

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Rerunning with `console.log` instead of reading the trace
> - Traces disabled in CI, so failures are undiagnosable
> - Screenshots only, with no trace
> - Debugging in headed mode when the failure only occurs headless or under load
> - Ignoring the network panel when the cause is a 500
> - Leaving `page.pause()` in committed code
> - Leaving `test.only` in committed code
> - Not reading the actual assertion message before forming a theory
> - Changing several things at once, so you learn nothing from the result
> - Concluding "CI is flaky" without opening a single artifact

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Configure traces on failure, break a test deliberately, and open its trace.
> - **Medium:** Diagnose three supplied failures from artifacts alone, without rerunning; report the failing action, the DOM state, and the cause.
> - **Challenge:** Given a CI-only failure with logs and a trace, work the checklist to a root cause, then instrument the test with `test.step` and messages so the next occurrence is diagnosable in under two minutes.

---

## H. Coding Assignment

> **Planned: Debugging walkthrough and instrumentation.** Deliver a written investigation of one real failure diagnosed entirely from artifacts — the failing action, DOM evidence, network evidence, root cause, and fix — plus your suite instrumented with `test.step`, custom assertion messages, and useful attachments, and a config that retains traces and screenshots on failure in CI. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: choose-the-debugging-tool scenarios, what-a-trace-contains items, trace-mode configuration judgment, read-the-artifact diagnosis, and two CI-only-failure checklist questions. Answer key at [`answer-keys/part-6/08-debugging-playwright-tests.answers.md`](../answer-keys/part-6/08-debugging-playwright-tests.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *given a failure you did not write, can you state the cause from the artifacts without running anything?*

---

[← 6.7 Parallel Execution and Sharding](07-parallel-execution-and-sharding.md) · [Next: 6.9 Diagnosing Flaky Tests →](09-diagnosing-flaky-tests.md)
