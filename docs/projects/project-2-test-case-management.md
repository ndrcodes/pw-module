# Project 2 — Mini Test Case Management App

🟡 **Intermediate** · [Table of Contents](../README.md) · **Weight:** part of the 15% programming exercises grade

| | |
|---|---|
| **After** | [Chapter 2.13 — JSON](../part-2-programming-fundamentals/13-json.md) (all of Part II) |
| **Suggested timing** | Week 10, built and reviewed in the project lab |
| **Estimated effort** | 8 hours |
| **Deliverable** | A command-line TypeScript application with persistent JSON storage, plus a README |
| **Team size** | Individual |

---

## 1. Why this project exists

Project 1 read data and reported on it. This project **owns** data: it creates, modifies, and deletes records, and it must still be correct after the program exits and restarts. That single change introduces almost every remaining Part II concept — objects, interfaces, unions, error handling, JSON persistence — and it introduces the responsibility that dominates the rest of the course: if you create data, you are accountable for its validity and its cleanup.

It also builds the data model you will meet twice more. The test-case entity you design here reappears as an API resource in [Part IV](../part-4-api-testing-and-automation/00-module-overview.md) and as a factory output in [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md). Designing it well now pays off for twenty weeks.

---

## 2. What you will build

A command-line application that manages a library of test cases stored in a JSON file.

```text
$ npm start -- add --title "Checkout rejects expired card" --suite checkout --priority high
Created TC-0043: Checkout rejects expired card

$ npm start -- list --suite checkout --status active
TC-0011  high    active   Checkout applies free shipping over $100
TC-0043  high    active   Checkout rejects expired card
2 test cases

$ npm start -- search "expired"
TC-0043  high    active   Checkout rejects expired card
1 match

$ npm start -- update TC-0043 --priority critical
Updated TC-0043: priority high → critical

$ npm start -- report
TEST CASE LIBRARY REPORT
========================
Total cases:        43
By suite:           checkout 12, catalogue 15, account 9, admin 7
By priority:        critical 6, high 14, medium 18, low 5
By status:          active 38, draft 3, deprecated 2
Automated:          21 (48.8%)
Missing automation: 17 active cases of high or critical priority
```

Command names and output format are yours to design; the capabilities below are required.

---

## 3. Requirements

### 3.1 Functional requirements

| # | Requirement |
|---|---|
| F1 | **Create** a test case with a generated unique ID, validating all required fields |
| F2 | **List** all test cases, with optional filters by suite, status, priority, and automation state |
| F3 | **Search** test cases by a term matching the title or description, case-insensitively |
| F4 | **Read** one test case by ID, showing all its fields including nested data |
| F5 | **Update** a test case's fields, reporting what changed from what to what |
| F6 | **Delete** a test case by ID, with a clear message if it does not exist |
| F7 | **Report** aggregate statistics: totals, breakdowns by suite/priority/status, automation coverage |
| F8 | **Persist** all changes to a JSON file so the data survives restarts |
| F9 | Reject invalid input with a diagnosable error naming the field and the rule violated |
| F10 | Handle a missing, empty, or malformed data file gracefully on startup |

### 3.2 Technical requirements

| # | Requirement |
|---|---|
| T1 | TypeScript `strict` mode; zero compile errors; no unjustified `any` |
| T2 | Interfaces for the test case entity and any nested structures |
| T3 | **Union literal types** for `status`, `priority`, and any other closed set — not `string` |
| T4 | At least one exhaustive `switch` over a union, so adding a value produces a compile error |
| T5 | **Custom error classes** for validation and not-found conditions ([Chapter 2.11](../part-2-programming-fundamentals/11-error-handling.md)) |
| T6 | **Runtime validation** of loaded JSON — a cast is not a check ([Chapter 2.13](../part-2-programming-fundamentals/13-json.md)) |
| T7 | Separation of concerns: storage, business logic, and presentation in different modules |
| T8 | Pure functions for all computation; no printing inside logic |
| T9 | No mutation of loaded data structures; produce new values |
| T10 | Consistent, self-explanatory naming throughout |

### 3.3 Data model

Minimum fields. You may add more if you justify them in the README.

```ts
interface TestCase {
  id: string;                      // generated, unique, e.g. "TC-0043"
  title: string;                   // required, non-empty, states expected behavior
  description?: string;            // optional
  suite: string;                   // required
  priority: "critical" | "high" | "medium" | "low";
  status: "draft" | "active" | "deprecated";
  automated: boolean;
  tags: string[];
  steps: TestStep[];               // nested structure — at least one required
  expectedResult: string;          // required, non-empty
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}

interface TestStep {
  order: number;
  action: string;
  data?: string;
}
```

The `expectedResult` field is required and non-empty on purpose. It enforces the quality criterion from [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md): a test case without a verifiable expected result is not a test case.

### 3.4 Validation rules

| Field | Rule |
|---|---|
| `title` | Required, 5-120 characters, non-whitespace |
| `suite` | Required, non-empty |
| `priority` | Must be one of the four allowed values |
| `status` | Must be one of the three allowed values |
| `steps` | At least one step; `order` values must be sequential from 1 |
| `expectedResult` | Required, non-empty, and must not be "works as expected" or similar (reject vague results — see the [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) standard) |
| `id` | Generated, never supplied by the user, never reused after deletion |

Every rejection must name the field and the rule. `Error: invalid input` fails requirement F9.

---

## 4. Suggested approach

1. **Model and validate first.** Interfaces, union types, then the validator. Everything else depends on a trustworthy entity.
2. **Build the storage layer next**, in isolation: load, validate, save. Prove it round-trips before adding features.
3. **One command at a time**, each fully working before the next: create → list → read → update → delete → search → report.
4. **Keep the three layers separate from the start.** Storage does not print. Logic does not read files. Presentation does not validate. Retrofitting this separation is much harder than starting with it.
5. **Break your own data file deliberately** — remove a required field, corrupt the JSON, add an unknown status — and make sure startup handles all three.
6. **Reuse Project 1's statistics functions** for the report command. If you cannot reuse them, that tells you something about how you wrote them.

---

## 5. Acceptance criteria

- [ ] `npx tsc --noEmit` clean with `strict` enabled
- [ ] All seven operations work from the command line
- [ ] Data survives a restart; a second run sees the first run's changes
- [ ] Creating an invalid case is rejected with a message naming the field and rule, for each validation rule
- [ ] A vague `expectedResult` is rejected
- [ ] Deleting a non-existent ID produces a clear message and a non-zero exit code
- [ ] A missing data file starts an empty library rather than crashing
- [ ] A malformed data file reports the problem and does not silently discard data
- [ ] A data file containing an unknown `status` value is handled deliberately (documented behavior)
- [ ] Adding a fourth `priority` value causes a compile error somewhere (proving T4)
- [ ] IDs are never reused after deletion
- [ ] Storage, logic, and presentation are in separate modules with no upward dependencies
- [ ] README covers usage, data model, validation rules, edge-case behavior, and design decisions

---

## 6. Grading rubric

Graded against the [universal rubric dimensions](../00-course-overview/04-assessment-strategy.md#3-universal-rubric-dimensions), weighted for this project:

| Dimension | Weight | What earns full marks |
|---|---|---|
| **Correctness** | 30% | All seven operations work; persistence reliable; validation rules all enforced; statistics accurate |
| **Code quality** | 25% | Pure logic functions; no mutation of loaded data; custom error classes; self-explanatory names; reuse from Project 1 where sensible |
| **Architecture** | 25% | Meaningful interfaces; union literals for closed sets; exhaustive switch; runtime validation of parsed JSON; clean separation of storage, logic, and presentation |
| **Communication** | 20% | README a stranger can follow; data model and validation rules documented; edge-case behavior and design decisions explained |

**Passing threshold:** 70%. Below that, resubmission is expected — see [Assessment Strategy §1](../00-course-overview/04-assessment-strategy.md#passing-thresholds).

### Automatic deductions

| Issue | Deduction |
|---|---|
| Data loss on any supported operation | −20% |
| Crash on a malformed or missing data file | −15% |
| `status` or `priority` typed as `string` | −10% |
| Validation messages that do not name the field | −10% |
| `JSON.parse` result cast without runtime validation | −10% |
| Storage, logic, and presentation mixed in one module | −10% |
| No README | −10% |

---

## 7. Bonus challenges

Capped at +5% total. Core requirements first.

| Bonus | Description |
|---|---|
| **Import and export** | Import cases from CSV, export to CSV, with validation on import |
| **Bulk operations** | Update or delete many cases matching a filter, with a confirmation step |
| **Coverage gap report** | Identify high and critical active cases that are not automated, sorted by priority — genuinely useful output |
| **Change history** | Record an audit trail of updates per case, and a command to view it |
| **Interactive mode** | A prompt-driven session as an alternative to one-shot commands |
| **Duplicate detection** | Flag cases whose titles are suspiciously similar |
| **Suite health score** | A composite metric per suite combining automation coverage, priority mix, and deprecated ratio, with the formula documented and defended |

The coverage gap report is the one worth doing: it is the exact artifact a QA lead asks for, and it forces you to think about what the data is *for*.

---

## 8. What graders will ask you

- "Show me the line that stops `priority` being any arbitrary string."
- "Add a `blocked` status to the union. Which files now fail to compile, and is that the right set?"
- "What happens if I hand-edit the data file and delete a required field?"
- "Your validator rejected this. Show me the message a user sees."
- "Which functions did you reuse from Project 1? Which did you have to rewrite, and why?"
- "Where is the boundary between your storage layer and your logic layer? What would break if I swapped JSON for a database?"
- "You cast the parsed JSON. Where is the runtime check that the cast is honest?"

That second question is the sharpest one. A learner whose exhaustive `switch` catches the new status has understood [Chapter 2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md); one whose program compiles happily has not.

---

## 9. AI policy for this project

Still the **restricted** stage of the [AI policy](../00-course-overview/05-ai-policy.md#5-guidance-by-course-stage).

**Allowed:** concept explanations, error translation, review of code you wrote.
**Not allowed:** generated implementations, generated validators, generated architecture.

Include an [AI usage log](../00-course-overview/05-ai-policy.md#ai-usage-log-format) if you used AI at all. This project is defended verbally; unexplainable code will be identified.

---

## 10. Where this leads

| This project's artifact | Reused in |
|---|---|
| The `TestCase` entity and nested `TestStep` | API resource models in [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md) |
| Validation with custom errors | Test data validation in [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md) |
| Runtime JSON validation | Response contract checking in [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md) |
| Layer separation | The framework architecture of [Part VI](../part-6-framework-engineering/00-module-overview.md) |
| Unique ID generation | Unique test data generation in [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md) |

**Gate:** completing this project is the checkpoint for Part II. If it was a struggle for reasons of language fundamentals rather than scope, revisit [Chapters 2.7-2.10](../part-2-programming-fundamentals/00-module-overview.md) before starting Part III.

---

[← Project 1 — Test Result Analyzer](project-1-test-result-analyzer.md) · [Next: Project 3 — E-Commerce API Automation →](project-3-api-automation.md)
