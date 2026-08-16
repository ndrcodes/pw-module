# 04 — Assessment Strategy

[← Back to Table of Contents](../README.md)

---

## 1. Grading structure

| Component | Weight | Count | What it measures |
|---|---|---|---|
| Quizzes | 10% | 47 chapter quizzes | Conceptual recall and code reading |
| Programming exercises | 15% | Chapter exercises + Projects 1 and 2 | Fluency with TypeScript fundamentals |
| API project | 15% | Project 3 | API test design and automation |
| Web automation project | 20% | Project 4 | Locators, assertions, synchronization, Page Objects |
| CI/CD project | 10% | Pipeline assignment (Part VII) | Git workflow, Jenkins, Docker |
| Code review / architecture assignment | 10% | Part VIII assignments | Engineering judgment and communication |
| Final capstone project | 20% | Capstone | Integration of everything |
| **Total** | **100%** | | |

### Passing thresholds

| Requirement | Threshold |
|---|---|
| Overall grade | ≥ 70% |
| Final capstone | ≥ 70% (cannot be compensated by other components) |
| Web automation project | ≥ 60% |
| Quiz average | ≥ 60% |
| Competency checklist | 100% of "Programming" and "Web automation" sections self-certified and spot-verified |

The capstone gate exists because this course certifies a capability, not an accumulation of points. A learner who aces every quiz but cannot ship a working framework has not met the objective.

---

## 2. Grading philosophy

Three principles govern every rubric in this course.

**1. A passing test suite is the floor, not the grade.**
Any learner can make tests pass by asserting `expect(true).toBe(true)`. Rubrics weight *whether the test would fail for the right reason* at least as heavily as whether it passes.

**2. Reliability outranks coverage.**
Ten tests that pass 100 consecutive runs beat forty tests that pass 80% of the time. Every project rubric contains a stability criterion, verified by running the suite three times.

**3. Reasoning is assessable.**
Advanced work is graded on defensibility. A learner who chooses a simpler design and can explain why scores higher than one who copies a complex design they cannot justify. Every project requires a short `DECISIONS.md`.

---

## 3. Universal rubric dimensions

Every project is graded on the same seven dimensions, weighted differently per project.

| Dimension | What earns full marks |
|---|---|
| **Correctness** | Requirements implemented; tests verify real behavior; assertions would catch a genuine regression |
| **Reliability** | Suite passes 3 consecutive runs in any order; no hard waits; no order dependencies; no shared mutable state |
| **Code quality** | Clear names, small functions, no meaningful duplication, no `any` without justification, consistent structure |
| **Test design** | Positive, negative, and boundary coverage; one clear reason for each test to exist; Arrange-Act-Assert visible |
| **Architecture** | Correct layering; abstractions justified; no business logic in tests; no locators outside page objects |
| **Diagnosability** | Failure output identifies the problem without rerunning; artifacts (report, screenshots, traces) available |
| **Communication** | `README.md` runnable by a stranger; `DECISIONS.md` explains trade-offs; commit history legible; AI usage log where required |

### Level descriptors

| Score | Descriptor |
|---|---|
| **90-100 — Exemplary** | Would be accepted in a professional code review with minor comments. Design choices are deliberate and explained. |
| **80-89 — Proficient** | Meets all requirements. Some rough edges in structure or naming. No reliability defects. |
| **70-79 — Developing** | Requirements substantially met. Notable duplication, weak assertions, or one reliability defect. |
| **60-69 — Beginning** | Works but fragile. Multiple reliability defects, missing negative cases, or unjustified copy-paste. |
| **< 60 — Insufficient** | Does not run from a clean clone, or tests pass without verifying behavior. |

---

## 4. Quizzes (10%)

**Format.** 5-10 questions per chapter, mixing multiple choice, true/false, code reading, predict-the-output, identify-the-bug, and scenario questions.

**Rules.** Closed-book on syntax recall; open-documentation on scenario questions. No AI assistance during quizzes (see [AI policy](05-ai-policy.md)). 15 minutes per quiz. Answer keys live in [`answer-keys/`](../answer-keys/) and must not be consulted before submitting.

**Scoring.** Best 40 of 47 quiz scores count, so a single bad week does not distort the grade.

**Retakes.** One retake allowed per quiz, capped at 80%, and only after the learner submits a short written explanation of what they misunderstood.

---

## 5. Programming exercises (15%)

Covers all chapter exercises (Section G), chapter coding assignments (Section H) for Part II, and Projects 1 and 2.

| Sub-component | Share |
|---|---|
| Chapter exercises completed and correct | 5% |
| Chapter coding assignments (Part II) | 4% |
| Project 1 — Test Result Analyzer | 2% |
| Project 2 — Test Case Management App | 4% |

**Assessment method.** Exercises are checked for completion and correctness, spot-graded by sampling three per chapter. Assignments are graded against their published acceptance criteria.

**Common failure modes.** Solutions that work for the sample input but crash on an empty array; use of `any` to bypass a type error rather than model it; functions that print instead of returning values, making them untestable.

---

## 6. Project rubrics

Each project brief in [`projects/`](../projects/) contains its own full rubric, deliverables, acceptance criteria, failure modes, and bonus challenges. The weightings below summarize how the seven universal dimensions are applied.

### Project 1 — Test Result Analyzer (part of the 15%)

| Dimension | Weight |
|---|---|
| Correctness | 40% |
| Code quality | 25% |
| Test design (edge cases handled) | 20% |
| Communication (README) | 15% |

### Project 2 — Test Case Management App (part of the 15%)

| Dimension | Weight |
|---|---|
| Correctness | 30% |
| Code quality | 25% |
| Architecture (types, interfaces, separation of data and logic) | 25% |
| Communication | 20% |

### Project 3 — API Automation (15%)

| Dimension | Weight |
|---|---|
| Test design (positive, negative, boundary, authorization) | 25% |
| Correctness | 20% |
| Architecture (API clients, models, config) | 20% |
| Reliability (3 clean consecutive runs, independent tests) | 15% |
| Code quality | 10% |
| Diagnosability (report, failure messages) | 10% |

### Project 4 — Web Automation (20%)

| Dimension | Weight |
|---|---|
| Reliability (zero hard waits, 3 clean consecutive runs) | 25% |
| Correctness (full flow automated, assertions meaningful) | 20% |
| Locator quality | 20% |
| Architecture (Page Objects with clear responsibilities) | 15% |
| Diagnosability (traces, screenshots, readable failures) | 10% |
| Code quality | 10% |

### CI/CD project (10%)

| Dimension | Weight |
|---|---|
| Working Jenkins pipeline through report publication | 35% |
| Docker image runs the suite reproducibly | 25% |
| Git workflow (branches, meaningful commits, PR) | 20% |
| Secrets and configuration handled correctly | 20% |

### Code review / architecture assignment (10%)

| Dimension | Weight |
|---|---|
| Defects correctly identified in the supplied PR (locators, waits, isolation, data, naming, error handling) | 40% |
| Quality of written review comments (specific, actionable, respectful) | 25% |
| Architecture proposal for a stated product and team | 25% |
| Trade-offs acknowledged rather than hidden | 10% |

### Capstone (20%)

Full rubric in [capstone/00-capstone-overview.md](../capstone/00-capstone-overview.md). Summary:

| Dimension | Weight |
|---|---|
| Framework architecture and layering | 20% |
| API automation suite | 15% |
| Web automation suite | 15% |
| Reliability under parallel execution | 15% |
| CI/CD (Jenkins + Docker + artifacts) | 15% |
| Code quality and clean code | 10% |
| Documentation, decisions, and architecture defense | 10% |

---

## 7. Verification procedure used by graders

Every project is graded with the same mechanical procedure, so learners can pre-run it themselves.

```text
1. Clone the submitted repository into an empty directory.
2. Follow the README exactly. If setup requires an undocumented step, deduct under Communication.
3. Run the suite. Record pass/fail and duration.
4. Run the suite twice more. Any test that changes result is a reliability defect.
5. Run with a shuffled or reversed order (or --workers=1 vs --workers=4). Order dependence is a reliability defect.
6. Grep the repository for: waitForTimeout, sleep, hardcoded URLs, hardcoded credentials, ": any".
7. Deliberately break the application or data (e.g. change an expected label) and confirm the relevant test FAILS.
   A test that still passes is scored zero for correctness on that scenario.
8. Open one failure's trace/report and judge whether the cause is identifiable without rerunning.
9. Read DECISIONS.md and, for capstone, conduct a 15-minute architecture defense.
```

Step 7 is the step learners most often lose points on and least often anticipate. A test that cannot fail is not a test.

---

## 8. Common failure modes across all submissions

Graders see the same defects every cohort. They are listed here so learners can self-check before submitting.

| Failure mode | Why it costs marks |
|---|---|
| `expect(response.ok()).toBeTruthy()` as the only assertion | Passes for any 2xx; verifies almost nothing |
| Hard waits sprinkled to "fix" flakiness | Hides a race condition and slows the suite; automatic reliability deduction |
| Tests that must run in a fixed order | Breaks under parallel execution and makes failures non-reproducible |
| Shared login user mutated by multiple tests | Classic cross-test contamination; fails step 5 of verification |
| Hardcoded record IDs from a manual database peek | Suite breaks on a fresh environment; fails step 2 |
| Locators like `div > div:nth-child(3) > span` | Breaks on any layout change; fails locator quality |
| Page objects that expose `getLoginButton()` instead of `login(user)` | Leaks plumbing into tests; no abstraction benefit |
| Assertions inside page objects for business outcomes | Blurs layer responsibilities; tests can no longer state intent |
| Committed `.env` with real credentials | Security defect; capped grade regardless of other quality |
| Copy-pasted AI output the learner cannot explain | Fails the AI policy and the architecture defense |
| `README` that says "run npm test" and nothing else | Grader cannot reproduce; Communication near zero |

---

## 9. Bonus challenges

Bonus work can add up to 5 percentage points to the final grade, capped at 100. Bonus credit is only awarded when the base requirements score ≥ 80%.

| Bonus | Points | Attached to |
|---|---|---|
| Schema validation with a runtime validator (e.g. Zod) across all API responses | +1 | Project 3 |
| Visual regression check on one critical page | +1 | Project 4 |
| Sharded CI execution with merged HTML report | +1 | CI/CD project |
| Custom reporter posting a summary to a chat webhook | +1 | Capstone |
| Flake detector: rerun the suite N times in CI and report unstable tests | +1 | Capstone |
| Accessibility smoke check on checkout flow | +1 | Capstone |
| Full API mocking layer allowing UI tests to run without a backend | +2 | Capstone |

---

## 10. Academic integrity

Collaboration is encouraged for *understanding* and prohibited for *production*. You may discuss approaches, debug together, and review each other's code. You may not submit code you cannot explain line by line, whether it came from a peer, a blog, or an AI assistant.

Every project defense includes the question: **"Walk me through this file and tell me what happens if I delete line N."** Inability to answer is treated as non-submission for that component, regardless of source.

See [05 — Generative AI Policy](05-ai-policy.md) for the specific rules on AI assistance and the required usage log.
