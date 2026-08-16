# Answer Key — Chapter 2.1: Thinking Like a Programmer

[← Answer Keys](../overview.md) · [Chapter 2.1](../../part-2-programming-fundamentals/01-thinking-like-a-programmer.md)

> **Instructor note:** Questions 3 and 7 are the ones that predict who will struggle in Part II. A learner who cannot recognize a properly specified output (Q3) will produce vague designs for thirteen chapters. Q7 is worth discussing as a group rather than marking — most of the cohort will have lived it during Assignment 2.1.

---

## Question 1 — The universal frame

**Correct answer: B** — Input, process, output.

**Why:** Every program, function, and test takes something, transforms it, and produces something (Section C.2).

**Why the others are wrong:**

- **A** — Language features, not a way of thinking about problems. Knowing these does not tell you what to build.
- **C** — Arrange-Act-Assert is the *testing* expression of the same idea, and a learner picking C has noticed something real. It is the answer to "what are the phases of a test," not "what frame does every program fit." Give credit for the observation, then draw the mapping from Section D.1 explicitly.
- **D** — A workflow, not a structural frame.

**Reread if missed:** Sections C.2 and D.1.

---

## Question 2 — Should pseudocode look like real syntax?

**Correct answer: False.**

**Why:** Pseudocode exists to let you reason at the level of *meaning*, where mistakes are cheap and visible to anyone. Making it syntax-like reintroduces exactly the problem it was meant to remove: you end up debugging syntax while still deciding logic (Section C.4, and F.2).

**The reasoning to correct:** learners argue that closeness to syntax makes translation easier. Translation was never the hard part. `FOR EACH result IN results` translates to `for (const result of results)` in a few seconds, and the English version can be reviewed by a product owner who will spot a wrong business rule that no amount of syntax precision would have caught.

**A useful diagnostic to give the cohort:** if your pseudocode contains `i++`, braces, or semicolons, you are typing rather than deciding.

**Reread if missed:** Section C.4, including the ❌ example.

---

## Question 3 — Which output is properly specified

**Correct answer: C** — An object with total, passed, failed, pass rate as a percentage to one decimal place, and an array of failed test names.

**Why:** It names every field, its type, and the format of the one value where format is ambiguous. You could implement it, and two implementers would produce the same thing (Section C.2).

**Why the others fail:** A, B, and D are all *topics* rather than outputs. "A summary," "how the tests did," and "formatted nicely" each leave every decision open — how many fields, what precision, what happens to skipped results.

**The connection worth making explicit:** this is the [Chapter 1.4](../../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) verifiability criterion applied to program output instead of test expectations. "Works as expected" and "formatted nicely" fail for the same reason: two people would disagree about whether the result was right.

**Reread if missed:** Section C.2, then example E.2 — where writing the output *first* is presented as a legitimate first step.

---

## Question 4 — Which algorithm property was violated

**Correct answer: C** — Defined inputs.

**Why:** The algorithm was written assuming a non-empty list, so its behavior over the full range of possible inputs was never decided. An empty list is a valid input to "count the failures"; the answer is 0. Failing to decide that is an incomplete specification of the input domain, not a coding slip (Section C.3).

**Why the others are wrong:**

- **A** — Finiteness concerns termination. The algorithm ends.
- **B** — Ambiguity concerns steps having more than one interpretation. The steps are clear; they just do not cover this case.
- **D** — "That's just a bug" is the answer worth spending time on, because it is how most people think about it and it is the wrong frame. Treating the empty case as a bug means discovering it at runtime; treating it as part of the input specification means deciding it during design, for free. The whole point of the C.3 property table is that each missing property produces a predictable class of runtime failure.

**Worth telling the cohort:** this is the most common defect in Part II assignments and carries a named deduction in [Project 1](../../projects/project-1-test-result-analyzer.md). It is also the reason step 1 of the C.3 algorithm exists.

**Reread if missed:** Section C.3's property table, then F.7.

---

## Question 5 — Trace the pseudocode

**Correct answer: B** — 7.

**The trace:**

| Step | `n` | `n > best`? | `best` after |
|---|---|---|---|
| Initialize | — | — | 3 (first item) |
| Iteration 1 | 3 | No (3 > 3 is false) | 3 |
| Iteration 2 | 7 | Yes | 7 |
| Iteration 3 | 2 | No | 7 |
| Iteration 4 | 7 | No (7 > 7 is false) | 7 |
| Return | — | — | **7** |

**Why the others are wrong:**

- **A** — 3 is the initial value; a learner picking this has probably not traced the loop at all.
- **C** — 19 is the sum. This is the most instructive wrong answer: it means the reader saw a loop over numbers and pattern-matched to "adding things up" instead of reading the condition. Worth naming, because assuming what code does rather than reading it is the habit F.3 warns about.
- **D** — -1 is the empty-input result, and the input is not empty.

**Two follow-ups worth asking:** what does it return for `[]`? (-1, by the first line.) And what does it return for `[-5, -2]`? (-2 — worth checking, because learners who assume the function initializes `best` to 0 rather than to the first item will get this wrong, and that is a real bug pattern.)

**Reread if missed:** Section C.7.

---

## Question 6 — The debugging approach

**Correct answer: B** — One hypothesis, predict, change one thing, observe.

**Why:** Changing one thing at a time is what makes the result informative. If the behavior changes, you know what caused it; if it does not, you have eliminated something (Section C.10).

**Why the others are wrong:**

- **A** — Change three things and you learn nothing either way: if it works you do not know which change mattered, and if it does not you cannot rule any of them out. It also frequently introduces a second defect on top of the first.
- **C** — Rewriting sometimes works and teaches you nothing about what was wrong, so the same defect returns. It also discards code that was probably 90% correct.
- **D** — Print statements are a legitimate *tool* inside step 4, and scattering them everywhere without a hypothesis is just A with extra output. Accept D with partial credit if a learner frames it as "add one print to test a specific hypothesis."

**The connection to make:** this is the scientific method, and it is exactly the procedure for diagnosing a flaky test in [Chapter 6.9](../../part-6-framework-engineering/09-diagnosing-flaky-tests.md) — where "add a wait and see if it goes away" is the equivalent of answer A.

**Reread if missed:** Section C.10.

---

## Question 7 — Stuck after 25 minutes

**Correct answer: B** — You never decided precisely what the output was, so there is no definition of correct to debug against.

**Why:** Without a specified output, "my numbers are wrong" is not even a well-formed statement — wrong compared to what? The learner cannot debug because they have nothing to debug *toward* (Sections C.1 and C.2).

**Why the others are wrong:**

- **A** — Plausible and usually false. The syntax needed for a pass-rate calculation is a handful of constructs, and a syntax error announces itself with a message pointing at a line. Being *stuck* with running code that produces wrong numbers is a design problem.
- **C** — Possible, and it is a hypothesis to test rather than a likely root cause. Note that the learner could not even check this without knowing what the correct answer should be.
- **D** — A debugger shows you what the program is doing. It cannot tell you what the program *should* do.

**Discussion, not marking.** Most of the cohort will have experienced exactly this during Assignment 2.1. Ask who started typing before finishing the design files, and what happened. The answer is more persuasive coming from a peer than from the chapter.

**Reread if missed:** Sections C.1 and C.2, then example E.2.

---

## Exercise notes for instructors

### G.1 — Input, process, output

No single answer key; assess specificity. The pattern to look for is whether the **output** column contains a type and a format. "A boolean" is acceptable for problem 1; "whether it meets the target" is not, because it does not say what form the answer takes.

Model answer for problem 1:

```text
Input:   a list of test results, each with a status; and a target rate (0.95)
Process: count results with status "passed"; divide by the total number of
         results; compare to the target
Output:  a boolean — true if the computed rate >= 0.95
```

**Task A — the amber rules.** Any defensible rule set. What matters is that learners notice the problem statement was *incomplete*: "green, amber, or red" gives three labels and no thresholds. The lesson to name explicitly is that a problem statement is not a specification, and the gap is filled by asking — which is the [Chapter 1.1](../../part-1-testing-fundamentals/01-what-is-software-testing.md) requirements-gap instinct arriving in programming form.

**Task B — the new test in problem 5.** Both answers are defensible: report it as `new` (a fourth category alongside changed statuses) or exclude it since it has no previous status to change from. What is not defensible is not deciding, because the code will do *something* either way. This is the same point as Q4.

### G.2 — Retry logic

**Task A — model pseudocode:**

```text
FUNCTION shouldRetry(result)
    IF result.status IS NOT "failed" THEN
        RETURN false
    END IF

    IF result.tags CONTAINS "no-retry" THEN
        RETURN false
    END IF

    IF result.attempts >= 3 THEN
        RETURN false
    END IF

    IF result.tags CONTAINS "known-flaky" THEN
        RETURN true
    END IF

    IF result.failureMessage CONTAINS "timeout"
       OR result.failureMessage CONTAINS "ECONNRESET"
       OR result.failureMessage CONTAINS "502" THEN
        RETURN true
    END IF

    RETURN false
END FUNCTION
```

**Task C — precedence, the real content of the exercise.** The rules as stated are ambiguous in two ways, and any consistent resolution is acceptable if justified:

- **`known-flaky` + `no-retry`:** the model answer puts `no-retry` first, on the grounds that it is an explicit human instruction and should override a heuristic. A learner arguing the reverse must explain why an automatic classification should beat an explicit tag — hard to defend.
- **`known-flaky` on attempt 4:** the model answer stops, because the attempt limit is a resource guard that applies to everything. A learner who lets `known-flaky` bypass the limit has designed an unbounded retry loop, which is worth pointing out as a termination problem (the C.3 finiteness property).

The transferable lesson: **the order of guard clauses encodes precedence.** Two people can implement the same five rules and produce different programs, and the flowchart is where that becomes visible.

**Task D — the trace:**

| # | Deciding rule | Retry? |
|---|---|---|
| 1 | Rule 3, timeout in message | **Yes** |
| 2 | Rule 1, `no-retry` (precedence decision) | **No** |
| 3 | Rule 2, 4 attempts ≥ 3 (precedence decision) | **No** |
| 4 | Rule 5, no matching condition | **No** |
| 5 | Rule 3, `ECONNRESET` in message | **Yes** |

Cases 2 and 3 are the ones that expose the Task C decisions. A learner whose answers differ but whose trace is consistent with their own flowchart has done the exercise correctly.

**Task E — arguing against rule 4.** Strong answers connect to [Chapter 1.2](../../part-1-testing-fundamentals/02-manual-vs-automation-testing.md)'s trust argument: a `known-flaky` tag that triggers automatic retries converts an unfixed defect into a permanent green light. The flakiness is never diagnosed, the tag becomes load-bearing, and the count of tagged tests only ever grows. It is the "known flaky exclusion list" from [Chapter 1.4](../../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) C.8 with automation attached. Also creditable: it masks genuine intermittent *application* defects, which are the ones most worth finding.

### G.3 — Decompose and trace a report

**Task A — expected decomposition** (5-8 pieces): count by status; compute pass rate; collect failed names; sort by duration; take the top three; format each report section; assemble the output. Look for one-thing-each and stated inputs/outputs.

**Task B — independent verification** is the task most often skipped and the most valuable. Model answer for "compute pass rate": *hand it (6, 8) and check it returns 75.0; hand it (0, 0) and check it does not crash.* Learners who can articulate this are ready for the unit-testing mindset in [Chapter 3.1](../../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md).

**Task D — the trace.** Counts: passed 5, failed 2, skipped 1, total 8.

**Task E — the pass rate.** Three defensible answers:

| Denominator | Rate | Argument |
|---|---|---|
| All 8 results | 62.5% | A skipped test is coverage you did not get; hiding it flatters the number |
| Executed only (7) | 71.4% | The rate measures the tests that actually ran |
| Passed + failed (7) | 71.4% | Same here, but diverges once `blocked` or `flaky` statuses exist |

Accept any, require justification. The point is that an unstated denominator makes the number meaningless — press learners with "your report says 71.4%; what exactly does that claim?"

**Task F — the slowest three:** checkout valid card (12400), search returns results (3180), cart quantity change (2050). The two follow-ups are the real content: ties are resolved by whichever comparison operator you used (`>` keeps the first, `>=` keeps the last, and most learners have not noticed they made this choice), and a two-result input should return two results rather than crashing or padding with `undefined` — which is F.7 again in a new costume.

---

## Assignment 2.1 — grading notes

**Requirement 8 is the integrity check.** The trace must predict the expected output. If a learner reverse-engineered the design from working code, the trace tends to be suspiciously clean — no intermediate values, just final answers that happen to be right. Ask them to trace a modified input on the spot; the ones who genuinely traced can do it in two minutes.

**Requirement 4 catches the F.2 mistake.** Expect roughly a third of a first cohort to submit pseudocode containing `let`, `===`, or `i++`. It is worth returning these for revision rather than deducting, because the habit forms now or not at all.

**Requirement 12 and the pass rate.** The expected output shows 75.0% from 6 passed out of... 8? 10? This is deliberate: 6/8 executed = 75.0%, while 6/10 total = 60.0%. **The expected output only matches if the learner excludes `skipped` and `blocked` from the denominator.** Learners who compute 60.0% and cannot see why their output disagrees have discovered requirement 10's importance the hard way, which is the intent. Make sure the debrief names this explicitly — several learners will have "fixed" it by hardcoding 75.0.

**Requirement 11, design-to-code correspondence.** At this stage learners have no functions, so correspondence means commented sections in a recognizable order matching the decomposition. Do not penalize the absence of functions; that is [Chapter 2.7](../../part-2-programming-fundamentals/07-functions.md).

**What a strong submission looks like:** the design file states the verdict thresholds as `>= 100`, `>= 90`, `< 90` with the boundary at exactly 90 explicitly resolved; the empty-input note decides on `0.0%` with `GREEN`/`RED` deliberately chosen and defended (there is no obviously right answer, and noticing that is the point); and the trace includes at least one input not supplied in the assignment.
