# Project 1 — Test Result Analyzer

🟢 **Beginner** · [Table of Contents](../README.md) · **Weight:** part of the 15% programming exercises grade

| | |
|---|---|
| **After** | [Chapter 2.8 — Arrays](../part-2-programming-fundamentals/08-arrays.md) |
| **Suggested timing** | Week 8-10, reviewed in Week 10 |
| **Estimated effort** | 6 hours |
| **Deliverable** | A command-line TypeScript program plus a short README |
| **Team size** | Individual |

---

## 1. Why this project exists

You have spent six weeks learning language features one at a time. This project is the first time you must combine them without being told which one to use: types, functions, arrays, higher-order methods, and enough structure that a stranger could read the result.

It is also deliberately a *QA* program rather than a toy. Every automation framework you will ever work with produces result data and has to summarize it — that is what the reporters in [Chapter 6.5](../part-6-framework-engineering/05-configuration.md) do, and it is what the flake register in [Chapter 6.9](../part-6-framework-engineering/09-diagnosing-flaky-tests.md) reads. You are building a small version of a real tool.

---

## 2. What you will build

A command-line program that takes a collection of test results and prints a readable summary:

```text
$ npx ts-node src/index.ts data/run-2026-08-14.json

TEST RUN SUMMARY
================
Total tests:      42
Passed:           37
Failed:            3
Skipped:           2
Pass rate:      88.1%
Total duration:  4m 12s
Average:          6.0s

FAILED TESTS
------------
  ✗ Checkout with expired card            (3.18s)
  ✗ Apply invalid discount code           (1.04s)
  ✗ Update shipping address               (2.77s)

SLOWEST TESTS
-------------
  1. Complete purchase flow              (18.40s)
  2. Search across full catalogue        (12.11s)
  3. Register new account                 (9.02s)
```

The exact formatting is yours to design. The information above is the minimum.

---

## 3. Requirements

### 3.1 Functional requirements

| # | Requirement |
|---|---|
| F1 | Load test results from a JSON file whose path is supplied as a command-line argument |
| F2 | Report total count and counts per status (`passed`, `failed`, `skipped`, `blocked`) |
| F3 | Compute and display the pass rate as a percentage with one decimal place |
| F4 | Compute total and average duration, formatted for humans (`4m 12s`, not `252000`) |
| F5 | List every failed test with its name and duration |
| F6 | List the three slowest tests, ordered slowest first |
| F7 | Handle an empty result set without crashing, printing a clear "no results" message |
| F8 | Handle a missing or unreadable file with a diagnosable error message, not a stack trace |

### 3.2 Technical requirements

| # | Requirement |
|---|---|
| T1 | TypeScript with `strict` enabled; the project must compile with no errors |
| T2 | No `any` anywhere without a written justification comment |
| T3 | An `interface` or `type` describing a test result, and one describing the summary |
| T4 | All computation in **pure functions that return values** — no `console.log` inside a calculation function |
| T5 | Use `filter`, `map`, `reduce`, and `sort` where each is the natural expression of the task |
| T6 | Do not mutate the input array (sorting must operate on a copy) |
| T7 | `const` by default; every `let` must be justifiable |
| T8 | Names that need no comments to explain them |

### 3.3 Input format

You will be supplied with sample files. The shape is:

```json
{
  "runId": "run-2026-08-14-001",
  "startedAt": "2026-08-14T09:12:04.000Z",
  "results": [
    { "name": "Login with valid credentials", "status": "passed",  "durationMs": 1240 },
    { "name": "Checkout with expired card",   "status": "failed",  "durationMs": 3180,
      "error": "Expected 'Payment declined' but found 'Order confirmed'" },
    { "name": "Bulk import products",         "status": "skipped", "durationMs": 0 }
  ]
}
```

Supplied fixtures include: a normal run, a run with zero tests, a run where every test failed, a run with one test, a malformed JSON file, and a run with an unexpected status value. **All six must be handled.**

---

## 4. Suggested approach

Work in this order. Each step should end with a program that runs.

1. **Model the data first.** Write the interfaces before any logic. If the shape is wrong, everything downstream is harder.
2. **Load and parse.** Read the file, parse it, and print the raw count. Handle the missing-file and malformed-JSON cases now, not later.
3. **One statistic at a time.** Write `countByStatus`, run it, then `calculatePassRate`, run it. Do not write five functions before running any.
4. **Test every function against an empty array before moving on.** This is where most submissions lose marks.
5. **Formatting last.** Build the summary object first, then write a separate function that turns it into text. Keeping computation and presentation apart is requirement T4, and it is also what lets you add JSON output as a bonus in twenty minutes.

Reuse the helper library from [Chapter 2.7](../part-2-programming-fundamentals/07-functions.md) and the statistics module from [Chapter 2.8](../part-2-programming-fundamentals/08-arrays.md) if you built them well.

---

## 5. Acceptance criteria

Your submission is complete when all of the following are demonstrably true:

- [ ] `npx tsc --noEmit` reports zero errors with `strict` enabled
- [ ] The program runs against all six supplied fixtures without crashing
- [ ] The empty-run fixture produces a clear message, not `NaN%` or a crash
- [ ] The malformed-JSON fixture produces a readable error naming the file and problem
- [ ] The unexpected-status fixture is handled explicitly (counted, reported, or rejected — your choice, stated in the README)
- [ ] Pass rate matches hand calculation for the normal fixture
- [ ] Slowest-tests list is correct and the input array is unmutated (provable by printing it afterwards)
- [ ] No calculation function contains `console.log`
- [ ] No `any` without a justification comment
- [ ] README explains how to run it, the design decisions you made, and how you handled each edge case

---

## 6. Grading rubric

Graded against the [universal rubric dimensions](../00-course-overview/04-assessment-strategy.md#3-universal-rubric-dimensions), weighted for this project:

| Dimension | Weight | What earns full marks |
|---|---|---|
| **Correctness** | 30% | All six fixtures handled; statistics verifiably correct; no crashes |
| **Edge case handling** | 20% | Empty, single-item, all-failed, malformed, and unknown-status cases all handled deliberately and documented |
| **Code quality** | 20% | Pure functions returning values; array methods used where natural; no mutation; names that explain themselves |
| **Type safety** | 15% | Strict mode clean; meaningful interfaces; no unjustified `any`; typed function signatures throughout |
| **Documentation** | 15% | README a stranger could follow; design decisions stated; edge-case behavior explained |

**Passing threshold:** 70%. Below that, resubmission is expected — see [Assessment Strategy §1](../00-course-overview/04-assessment-strategy.md#passing-thresholds).

### Automatic deductions

| Issue | Deduction |
|---|---|
| Program crashes on any supplied fixture | −15% each |
| Calculation functions that print instead of returning | −10% |
| `any` used without justification | −5% each |
| Input array mutated | −5% |
| No README | −10% |

---

## 7. Bonus challenges

Optional, capped at +5% per [Assessment Strategy §9](../00-course-overview/04-assessment-strategy.md#9-bonus-challenges). Attempt these only after the core requirements are fully met.

| Bonus | Description |
|---|---|
| **Multi-run comparison** | Accept two files and report which tests changed status between runs, and how the pass rate moved |
| **JSON output mode** | A `--json` flag that emits the summary as machine-readable JSON — trivial if you separated computation from presentation |
| **Grouping** | Group results by suite or tag (if present in the data) and report per-group statistics |
| **Flake detection** | Given several runs, identify tests whose status is inconsistent — a preview of the register in [Chapter 6.9](../part-6-framework-engineering/09-diagnosing-flaky-tests.md) |
| **Duration outliers** | Flag tests whose duration is more than two standard deviations above the mean |
| **Exit codes** | Exit non-zero when the pass rate falls below a threshold supplied as an argument, so the tool could gate a CI build |

The exit-code bonus is the most professionally relevant of these: it turns a report into something a pipeline can act on.

---

## 8. What graders will ask you

Be ready to answer these about your own code:

- "What happens if the results array is empty? Show me the line that handles it."
- "Why is this a function rather than inline code?"
- "This function both computes and prints. What would that cost you if I asked for JSON output?"
- "Which of these functions could you reuse in Project 2 unchanged?"
- "You used `reduce` here. What is the accumulator, and what is its initial value?"
- "Show me that the input array is not modified after sorting."

---

## 9. AI policy for this project

This project falls in the **restricted** stage of the [AI policy](../00-course-overview/05-ai-policy.md#5-guidance-by-course-stage).

**Allowed:** asking for concept explanations, error message translation, and reviewing code you wrote yourself.
**Not allowed:** asking for a solution, a function implementation, or the structure of the program.

If you use AI at all, include the log described in the [AI usage log format](../00-course-overview/05-ai-policy.md#ai-usage-log-format). Graders will ask you to re-derive any part of your submission on request — the fastest way to fail this project is to submit code you cannot explain.

---

## 10. Where this leads

| This project's artifact | Reused in |
|---|---|
| Result and summary interfaces | [Project 2](project-2-test-case-management.md), then as API response models in [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md) |
| Statistics functions | [Project 2](project-2-test-case-management.md) reporting features |
| Separation of computation and presentation | Reporter configuration in [Chapter 6.5](../part-6-framework-engineering/05-configuration.md) |
| Flake-detection bonus | The flake register in [Chapter 6.9](../part-6-framework-engineering/09-diagnosing-flaky-tests.md) |

---

[← Table of Contents](../README.md) · [Next: Project 2 — Mini Test Case Management App →](project-2-test-case-management.md)
