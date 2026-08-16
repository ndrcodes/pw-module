# Answer Key — Chapter 2.2: Data Types

[← Answer Keys](../README.md) · [Chapter 2.2](../../part-2-programming-fundamentals/02-data-types.md)

> **Instructor note:** Questions 5, 7, and 8 are the ones that matter. They test whether a learner has internalized that a wrong type produces a *silently wrong answer* rather than an error — the single idea this chapter exists to install. A learner who gets 1-4 right and 5-8 wrong has memorized the vocabulary and missed the point.

---

## Question 1 — `typeof []`

**Correct answer: B** — `"object"`.

**Why:** Arrays are objects in JavaScript. `typeof` cannot distinguish them, which is why `Array.isArray()` exists (Section C.9).

**Why the others are wrong:**

- **A** — The intuitive answer, and wrong. There is no `"array"` result from `typeof`. Learners who pick this have reasoned correctly from first principles; the answer is simply a historical fact about the language.
- **C** — `undefined` is what you get from an out-of-range *index*, not from the array itself.
- **D** — `typeof` accepts any value.

**Follow-up worth asking:** what is `typeof null`? Also `"object"`, and also a historical bug preserved for compatibility. Two of the three surprising `typeof` results are in this one question.

**Reread if missed:** Section C.9.

---

## Question 2 — `"5" + 5`

**Correct answer: B** — `"55"`, a string.

**Why:** `+` is overloaded. If either operand is a string, it joins rather than adds, and the result is a string (Section C.10).

**Why the others are wrong:**

- **A** — `10` would be the result if `+` coerced to number the way `-`, `*`, and `/` do. That asymmetry is the whole trap.
- **C** — No space is inserted; joining is literal.
- **D** — `NaN` requires a failed numeric conversion. `"5"` converts fine, and no conversion happens here anyway.

**The follow-up that makes the point land:** what is `"5" - 5`? It is `0`, a number. Same operands, different operator, different result *type*. Ask the cohort to state the rule: `+` joins when either side is a string; every other arithmetic operator converts to number.

**Reread if missed:** Section C.10, then run example E.2.

---

## Question 3 — Which comparison is true

**Correct answer: B** — `"10" < "9"`.

**Why:** Two strings compare character by character in character order. `"1"` precedes `"9"`, so the comparison is decided at the first character and the remaining digits are never examined (Section C.10).

**Why the others are wrong:**

- **A** — `10 < 9` is false. Numbers compare numerically, as expected.
- **C** — `0.1 + 0.2 === 0.3` is false: the left side is `0.30000000000000004`. Learners who pick this have not run E.2.
- **D** — `NaN === NaN` is false. `NaN` is not equal to anything, including itself, which is why `Number.isNaN()` exists rather than a comparison.

**Why B is the dangerous one professionally:** it breaks version comparisons (`"10.0" < "9.0"`) and any sorted-order assertion performed on string data. The failure looks almost right, which delays discovery — and a test asserting that results are sorted by duration will happily pass on wrong order if the durations arrived as strings.

**Reread if missed:** Sections C.4 and C.10.

---

## Question 4 — `null` versus an absent field

**Correct answer: B** — `null` means present and deliberately empty; absence means never populated, which may indicate a serialization or data defect.

**Why:** The key's presence is itself information. Section D.4 works through the three hypotheses an absent field admits versus the two an explicit null admits.

**Why the others are wrong:**

- **A** — The answer most learners give, and the one that costs diagnostic power. Both mean "no message" to a *reader*; they mean different things about the *system*.
- **C** — Neither is inherently a bug. Which is correct depends on the API contract, and having a contract that says is the actual professional requirement.
- **D** — True and irrelevant. Payload size is not the significant difference.

**The question to ask the cohort:** if you file a bug saying "errorMessage is missing," what does the developer need to know that you have not told them? Answer: whether the key was absent or present-and-null, because that determines which layer they look at.

**Reread if missed:** Sections C.6 and D.4.

---

## Question 5 — Identify the bug

**Correct answer: B** — `Number("30s")` is `NaN`, and every comparison with `NaN` is false, so the guard can never fire.

**Why:** The learner did the right thing by converting with `Number()` and then omitted the essential second half: checking whether the conversion succeeded. `NaN > 60000` is false, `NaN < 60000` is also false, and the validation is dead code that looks like validation (Sections C.10 and F.7).

**Why the others are wrong:**

- **A** — Backwards, and worth correcting firmly: `process.env` values are *always* strings or `undefined`. Every environment variable arrives as text. A learner who believes otherwise will write this bug repeatedly, and it is the exact boundary [Chapter 6.5](../../part-6-framework-engineering/05-configuration.md) deals with.
- **C** — A boundary quibble that does not address the defect. `>=` is equally dead against `NaN`.
- **D** — There is a bug, and it is the kind that ships.

**The fix to show:**

```ts
const timeoutMs = Number(process.env.TIMEOUT_MS);
if (Number.isNaN(timeoutMs)) {
  throw new Error(`TIMEOUT_MS is not numeric: "${process.env.TIMEOUT_MS}"`);
}
if (timeoutMs > 60000) throw new Error("Timeout too high");
```

**Worth emphasizing:** this is a *validation* routine that fails to validate. It is the [Chapter 1.4](../../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) "test that cannot fail," wearing configuration clothing.

**Reread if missed:** Sections C.4, C.10, F.7.

---

## Question 6 — Why union types for `status`

**Correct answer: C** — A typo like `"Failed"` becomes a compile error instead of a filter that silently matches nothing.

**Why:** Section D.3's worked example. `results.filter(r => r.status === "Failed")` returns an empty array against lowercase data, and the report announces zero failures — confidently wrong, with no error anywhere.

**Why the others are wrong:**

- **A, B** — Types are erased at compile time. There is no runtime memory or speed difference whatsoever, and a learner who believes types affect performance has a wrong mental model of what TypeScript is (Section C.11).
- **D** — Playwright requires nothing of the sort. This is a design choice you make.

**The framing worth giving the cohort:** the union type *is a test*. It runs on every keystroke, costs one line, and catches a defect class that code review misses reliably. This is the most persuasive answer available to "why bother with TypeScript."

**Reread if missed:** Sections C.12 and D.3.

---

## Question 7 — Does false `x > 100` imply true `x <= 100`

**Correct answer: False.**

**Why:** If `x` is `NaN`, both comparisons are false. `NaN` is unordered with respect to every value, so no comparison involving it is ever true (Sections C.10 and F.7).

**Why learners get this wrong:** it is true for every number, and the exception is a value most people do not think of as a possible input. That is exactly what makes it dangerous — the assumption is invisible.

**Where it bites in practice:**

```ts
if (durationMs > budget) {
  console.log("over budget");
} else {
  console.log("within budget");    // NaN lands here
}
```

A `NaN` duration is reported as within budget. The `else` branch silently absorbs the bad data, and this is how a report claims everything is fine.

**Also creditable if a learner raises it:** `undefined` behaves similarly, since `undefined > 100` and `undefined <= 100` are both false (`undefined` converts to `NaN`). A learner who spots that has generalized correctly.

**Reread if missed:** Section F.7, then re-run the `NaN` lines in example E.2.

---

## Question 8 — Casting parsed JSON

**Correct answer: C** — It compiles and runs; the comparison coerces the string and happens to work here, but nothing verified the type and a value like `"2050ms"` would silently disable the check.

**Why:** This is the chapter's central point, so it is worth being precise about the two halves.

**Half one:** `as` is a claim, not a conversion and not a check. It tells the compiler to stop asking questions. Nothing happens at runtime (Section C.11).

**Half two:** the code *works today*. `"2050" > 2000` coerces and gives `true`, which is the correct answer. That is what makes it insidious — there is no failing test to alert you. The defect is latent, and it activates the day the API adds a unit suffix, a thousands separator, or returns an empty string, at which point the comparison becomes `NaN > 2000` and the check disappears without any error.

**Why the others are wrong:**

- **A** — The cast is precisely what prevents compile-time detection. The learner asked the compiler to trust them.
- **B** — TypeScript emits no runtime type checks. There is nothing to throw.
- **D** — `as` performs no conversion. This is the most common misconception about casts and worth stating explicitly: `as` changes what the compiler believes, not what the value is.

**The habit to name:** validate at the boundary. `JSON.parse` is a boundary. So are file reads, `process.env`, and CLI arguments. Inside those boundaries, annotations work; crossing them, only runtime checks work.

**Reread if missed:** Sections C.11, D.2, F.4 — then read ahead to [Chapter 2.13](../../part-2-programming-fundamentals/13-json.md) C to see the fix.

---

## Exercise notes for instructors

### G.1 — Name the type

| # | Value | Type | `typeof` |
|---|---|---|---|
| 1 | `"failed"` | string | `"string"` |
| 2 | `2050` | number | `"number"` |
| 3 | `"2050"` | string | `"string"` |
| 4 | `true` | boolean | `"boolean"` |
| 5 | `null` | null | **`"object"`** |
| 6 | `undefined` | undefined | `"undefined"` |
| 7 | `["checkout", "smoke"]` | array of string | **`"object"`** |
| 8 | `{ name, status }` | object | `"object"` |
| 9 | `0` | number | `"number"` |
| 10 | `""` | string | `"string"` |
| 11 | `0.1 + 0.2` | number (`0.30000000000000004`) | `"number"` |
| 12 | `10 / 0` | number (`Infinity`) | **`"number"`** |
| 13 | `0 / 0` | number (`NaN`) | **`"number"`** |
| 14 | `[]` | array | `"object"` |
| 15 | `1240 > 900` | boolean (`true`) | `"boolean"` |

**Task A — the surprises.** Expect learners to name 5 and 7. The third is 13: `typeof NaN` is `"number"`, which reads as a contradiction — "not a number" *is* a number. It is genuinely the IEEE-754 definition: `NaN` is a numeric value representing an undefined result. Item 12 (`Infinity` is a number) is equally creditable.

**Task B — distinguishing the empty-ish values.** The point is that `0`, `""`, `null`, and `undefined` are four different values that are all falsy, so `if (!value)` cannot tell them apart. The distinguishing checks:

```ts
value === 0            // the number zero specifically
value === ""           // the empty string specifically
value === null         // null specifically (typeof is useless here)
value === undefined    // undefined specifically
value == null          // null OR undefined — the one legitimate use of ==
```

That last line is worth flagging now: `== null` is the idiomatic "null or undefined" check and the single exception to the `==` ban established in [Chapter 2.4](../../part-2-programming-fundamentals/04-operators.md). Learners will meet it in real codebases and should not mistake it for sloppiness.

### G.2 — Predict twelve expressions

| # | Expression | Result | Type |
|---|---|---|---|
| 1 | `"3" + 4` | `"34"` | string |
| 2 | `3 + "4"` | `"34"` | string |
| 3 | `"3" * "4"` | `12` | number |
| 4 | `"3" - 4` | `-1` | number |
| 5 | `"12" > "9"` | `false` | boolean |
| 6 | `12 > 9` | `true` | boolean |
| 7 | `"12" > 9` | `true` | boolean |
| 8 | `"abc" > 9` | `false` | boolean |
| 9 | `true + 1` | `2` | number |
| 10 | `1 === "1"` | `false` | boolean |
| 11 | `0.3 - 0.1 === 0.2` | `false` | boolean |
| 12 | `[] + []` | `""` | string |

Lines 5, 7, 11, and 12 are the instructive ones. Line 12 (two arrays producing an empty string) is a curiosity rather than a lesson — mention that it happens because both arrays convert to `""` and move on; the takeaway is only that `+` on non-numbers is unpredictable enough to avoid.

**Task C.** `+` joins if either operand is a string; every other arithmetic operator converts both operands to number. Lines 1 and 4 differ only in operator and differ in result type.

**Task D.** Yes, `"abc" < 9` is also false — `Number("abc")` is `NaN`, and both comparisons with `NaN` are false. It is dangerous because an `if`/`else` written on this comparison sends `NaN` down the `else` branch silently, and the `else` branch usually represents "everything is fine." Same content as quiz Q7; if the cohort got Q7 wrong, work this task on the board.

**Task E.** `1 == "1"` is `true`, because `==` coerces before comparing. It is banned because in an assertion context it produces false passes: `"0" == false` is true, `"" == 0` is true, `null == undefined` is true. `===` compares type and value, so it never surprises you. Full treatment in [Chapter 2.4](../../part-2-programming-fundamentals/04-operators.md).

**Task F — the important task.** Under `strict`, TypeScript rejects lines 1-4 and 7-8 (operator type mismatches) and flags 10 as a comparison between unrelated types. It **accepts** 5, 6, 9, 11, and 12 — all type-consistent. The lesson: the compiler catches the mixed-type mistakes, and the ones it lets through (string-vs-string comparison, float equality) are the ones you must catch yourself. That is why the coercion rules still matter in a typed language, and where validation effort belongs: at the boundary, on data the compiler never saw.

### G.3 — Audit an API response

**Task A/B — the suspicious fields.** There are six. A learner finding five has done well.

| Path | Actual | Should be | Suggested defect |
|---|---|---|---|
| `runId` | string `"4821"` | number | Possibly intentional (large-ID safety); a contract question |
| `completed` | string `"false"` | boolean | Serialization bug; **truthy**, so it inverts every check |
| `passRate` | string `"75.0%"` | number | Presentation leaking into the data layer; unusable in arithmetic |
| `results[1].status` | `"Failed"` | `"failed"` | Inconsistent casing between records — a real data-integrity defect |
| `results[1].durationMs` | string `"3180"` | number | Type inconsistency *within the same array*, which is the strongest signal of all |
| `results[1].retries` | string `"1"` | number | Same |

The detail worth drawing out: `results[0]` has correct types and `results[1]` does not. Inconsistency between elements of one array is much stronger evidence of a defect than a uniformly odd type, which might be a deliberate contract choice. Teach learners to compare records against each other, not only against expectations.

**Task C — the false passes.** Model answers:

```ts
// 1. completed
if (run.completed) console.log("run finished");
// prints "run finished" — the string "false" is truthy

// 2. durationMs
const slow = run.results.filter((r) => r.durationMs > 3000);
// results[1] has "3180" which coerces to 3180 — works by accident today,
// and silently drops out the moment the API returns "3180ms"

// 3. status
const failures = run.results.filter((r) => r.status === "failed");
// returns [] — "Failed" does not match. The report says zero failures.
```

The third is the [Chapter 1.4](../../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) cannot-fail test in miniature, and it is the one to spend time on.

**Task D.** A missing `blocked` key is a contract question: does the API omit zero-count statuses, or does it not know about `blocked`? A key present with `0` states positively that the status exists and had no occurrences. Omission forces the consumer to guess, and consumers guess `undefined`, and `undefined + 6` is `NaN`. Same shape as D.4.

**Task E.** `finishedAt: null` with `completed: "false"` is *consistent in meaning* — an unfinished run has no finish time — which is worth acknowledging before criticizing. The bug is the type, not the logic. A model report line: *"Test run 4821 returns `completed` as the string `"false"` rather than the boolean `false`; because a non-empty string is truthy, any consumer checking `if (run.completed)` treats an in-progress run as complete."* Note it states the defect and the consequence, per [Chapter 1.1](../../part-1-testing-fundamentals/01-what-is-software-testing.md) E.2.

**Task F — the correct type, and the punchline.**

```ts
type Status = "passed" | "failed" | "skipped" | "blocked";

interface TestResult {
  name: string;
  status: Status;
  durationMs: number;
  retries: number;
  errorMessage: string | null;
  tags: string[];
}

interface TestRun {
  runId: number;
  suite: string;
  startedAt: string;
  finishedAt: string | null;
  completed: boolean;
  durationMs: number;
  totals: Record<Status, number>;
  passRate: number;
  results: TestResult[];
}
```

Casting the actual response to this type means six fields lie, and **you find out at runtime, in production, on the field you happen to use first**. That is the C.11 lesson delivered by the learner's own hands, which is why the task is worth assigning even though the type itself is straightforward. Learners who reach this conclusion unprompted are ready for [Chapter 2.13](../../part-2-programming-fundamentals/13-json.md).

---

## Assignment 2.2 — grading notes

**Requirement 3 is the whole assignment.** Check `name` and `browsers` first. If either is `string` or `string[]`, the learner has missed the chapter's most transferable idea, and it is worth returning for revision rather than deducting — this exact decision recurs in [Project 2](../../projects/project-2-test-case-management.md) and the [capstone](../../capstone/00-capstone-overview.md).

**Requirement 4, the null/undefined justifications.** Expect weak comments here; it is the hardest part. A strong answer for `notes` argues that the field always exists in the config schema and is empty when the operator had nothing to say, hence `string | null`. A strong answer for `slackWebhookUrl` argues that an unconfigured integration means the key is simply not present, hence `string | undefined`. A weak answer restates C.6's definitions without applying them. Either assignment of the two fields is acceptable if the reasoning is genuine — the point is deliberate choice, not a specific answer.

**Requirement 8, the false passes.** The most common failure is a "defect" that throws. If a learner's wrong type produces a crash, they have demonstrated the opposite of the chapter's thesis. Push back and ask for a wrong *answer*. The `"false"` truthiness case is the easiest to get right and worth suggesting to anyone stuck.

**A common shortcut to watch for.** Some learners will satisfy requirement 6 by writing `notes ?? "(none)"` without understanding that `??` triggers on both `null` and `undefined`, while `||` would also trigger on `""` and `0`. Ask one learner to explain the difference; the answer matters in [Chapter 2.4](../../part-2-programming-fundamentals/04-operators.md), where a config value of `0` retries silently becoming a default of `2` is a real defect.

**What a strong submission looks like:** the type annotations are the narrowest correct choice throughout, `defaultTimeoutMs` and any other quantity carry units in their names, the null/undefined comments show reasoning rather than definitions, and the money section demonstrates both the tolerance comparison *and* the integer-cents approach with a note on which they would use in a real price assertion.
