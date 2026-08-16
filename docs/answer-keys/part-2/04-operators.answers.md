# Answer Key — Chapter 2.4: Operators

[← Answer Keys](../overview.md) · [Chapter 2.4](../../part-2-programming-fundamentals/04-operators.md)

> **Instructor note:** Questions 4 and 9 are the two that matter professionally. Both describe defects that have shipped in real automation frameworks, and both are two characters wide. If the cohort gets everything else and misses these, spend the debrief there rather than on truthiness trivia.

---

## Question 1 — `"6" + 2`

**Correct answer: B** — `"62"`, a string.

**Why:** `+` joins when either operand is a string (Section C.3).

**Why the others are wrong:**

- **A** — `8` would require `+` to convert like the other arithmetic operators do. It is the one that does not.
- **C** — `4` is `"6" - 2`. Worth putting on the board next to this: same operands, different operator, different result *type*. That asymmetry is the whole trap.
- **D** — `NaN` requires a failed conversion, and no conversion is attempted.

**Reread if missed:** Section C.3.

---

## Question 2 — Which is true

**Correct answer: B** — `"100" < "99"`.

**Why:** Two strings compare character by character. `"1"` precedes `"9"`, the comparison is decided at the first character, and the remaining digits are never examined (Section C.6).

**Why the others are false:**

- **A** — `===` compares type as well as value; number and string differ.
- **C** — `null === undefined` is false. Note that `null == undefined` is *true*, which is exactly why `== null` is the one sanctioned use of loose equality.
- **D** — `NaN === NaN` is false. `NaN` equals nothing, including itself, hence `Number.isNaN()`.

**The professional consequence of B:** any version gate or sorted-order assertion done on string data. `"10.0" < "9.0"` is true, so a check for "at least version 9" passes for version 10 in the wrong direction.

**Reread if missed:** Sections C.6 and C.7.

---

## Question 3 — `||` versus `??` with `0`

**Correct answer: C** — `"fallback"` and `0`.

**Why:** `0` is falsy, so `||` discards it and returns the right operand. `??` falls back only for `null` and `undefined`, so `0` survives (Section C.10).

**Why the others are wrong:**

- **A** — Would mean `??` also rejects falsy values, which is precisely the difference between the two operators.
- **B** — Would mean `||` returns falsy left operands, which is what `??` does.
- **D** — Reversed.

**The follow-up worth asking:** what about `"" || "x"` versus `"" ?? "x"`? Same pattern: `"fallback"` and `""`. And `false || true` versus `false ?? true`: `true` and `false`. That third pair is Q4.

**Reread if missed:** Section C.10.

---

## Question 4 — `config.headless || true`

**Correct answer: B** — An explicit `false` is falsy, so `||` returns `true`; the expression can never produce `false` and the setting is unreachable.

**Why:** Work through the possible inputs, which is the reasoning to teach:

| `config.headless` | Result |
|---|---|
| `true` | `true` |
| `false` | `true` ← the bug |
| `undefined` | `true` |

The expression is a constant. It can only ever be `true`, so the line is equivalent to `const headless = true` with extra characters that make it look configurable (Sections C.10 and D.4).

**Why the others are wrong:**

- **A** — `&&` would be worse, producing `false` for every input where `config.headless` is falsy and `true` only when it is already `true`.
- **C** — `config.headless` being undefined is the case `||` handles correctly. No crash.
- **D** — There is a bug, and it is a shipped one.

**The fix:** `config.headless ?? true`.

**Why this is worth dwelling on:** the symptom is "I set `headless: false` and it was ignored." An engineer debugging that looks at the browser launch code, the config loader, and the CLI arguments, because the *default line looks correct*. Boolean defaults with `||` are the single most common instance of this bug class, and the reason [Chapter 6.5](../../part-6-framework-engineering/05-configuration.md) specifies `??` throughout.

**Reread if missed:** Sections C.10 and D.4.

---

## Question 5 — Precedence of `&&` and `||`

**Correct answer: B** — `isSmoke || (isRegression && failedCount === 0)`.

**Why:** `&&` binds tighter than `||`, so it groups first (Section C.5).

**Why the others are wrong:**

- **A** — What most readers assume, and the meaning most authors intend. That gap is the bug.
- **C** — Precedence, not left-to-right, determines grouping. Left-to-right applies only between operators of equal precedence.
- **D** — Perfectly valid syntax, which is what makes it dangerous.

**Why the difference matters here:** under grouping B, a smoke run is accepted regardless of failures, because `isSmoke` alone satisfies the `||`. Under grouping A, every run needs zero failures. In a promotion gate those are opposite policies.

**The rule to enforce:** parentheses whenever `&&` and `||` appear together — or better, name the groups as separate booleans so the question cannot arise, as example E.4 does. Reviewers should treat an unparenthesized mix as a blocking comment, not a nitpick.

**Reread if missed:** Section C.5.

---

## Question 6 — Short-circuiting

**Correct answer: B** — `false`, and `expensiveCheck` is not called.

**Why:** `&&` evaluates the left operand, finds it falsy, returns it, and never touches the right side (Section C.9).

**Why the others are wrong:**

- **A** — Would defeat the purpose of short-circuiting and break the safe-access pattern in C.9.
- **C** — `&&` returns an *operand*, and the falsy left operand here is `false`, not `undefined`. Worth noting that `0 && f()` returns `0`, not `false` — the operator returns the actual value.
- **D** — Valid code.

**The two consequences to draw out:**

**It enables protection.** `results.length > 0 && results[0].status === "failed"` cannot crash, because the access is never evaluated on an empty array. Reverse the order and it does crash — which is Q8.

**It can skip side effects.** If the right-hand side was doing work you needed, short-circuiting silently skips it. Rare, and baffling when it happens.

**Reread if missed:** Section C.9.

---

## Question 7 — Which is truthy

**Correct answer: C** — `[]`.

**Why:** Only eight values are falsy: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. An empty array is not among them, so it is truthy (Section C.8).

**Why the others are falsy:** A, B, and D are all on the list.

**The consequence, which is the reason the question exists:**

```ts
if (failures) { reportFailures(failures); }
```

This branch always runs, regardless of whether `failures` contains anything, because `[]` is truthy. The check reads like a guard and does nothing. The correct check is `failures.length > 0`.

**Worth adding:** `{}` is truthy too, and so are the strings `"0"` and `"false"` — the latter being the [Chapter 2.2](../../part-2-programming-fundamentals/02-data-types.md) G.3 bug where `if (run.completed)` fires for an incomplete run.

**Reread if missed:** Section C.8, and F.8.

---

## Question 8 — Condition ordering

**Correct answer: B** — The conditions are in the wrong order; `results[0]` is accessed before the length check, so an empty array crashes.

**Why:** `&&` evaluates left to right. On an empty array, `results[0]` is `undefined`, and reading `.status` from `undefined` throws (Section C.9).

**Why the others are wrong:**

- **A** — `===` is correct here. Changing it to `==` would add a second bug.
- **C** — `>= 0` is true for an empty array, which would make the guard useless even if it were ordered correctly. A worthwhile distractor: it tests whether learners understand what the guard is *for*.
- **D** — It crashes on empty input, which is [Chapter 2.1](../../part-2-programming-fundamentals/01-thinking-like-a-programmer.md) F.7 for the fourth time in this course.

**The fix:**

```ts
if (results.length > 0 && results[0].status === "failed") { }
```

**The general rule:** put the protective check first. Short-circuiting is not a performance optimization here — it is the correctness of the line. Under `noUncheckedIndexedAccess`, TypeScript flags the original, which is that setting from [Chapter 2.1](../../part-2-programming-fundamentals/01-thinking-like-a-programmer.md) C.8 paying for itself.

**Reread if missed:** Section C.9, F.8.

---

## Question 9 — `==` and a broken service

**Correct answer: B** — `"" == 0` is `true`, so the test passes and reports a clean run for a response the service could not compute; `===` would have failed loudly and shown the quoted empty string.

**Why:** This is the chapter's thesis in one scenario (Sections C.7 and D.2). The empty string coerces to `0`, satisfies the comparison, and the test reports success for a response that contains no information at all.

**Why the others are wrong:**

- **A** — They differ precisely here, which is the point.
- **C** — No type error is thrown. `==` is designed not to complain, and that design is the problem in test code.
- **D** — The most instructive wrong answer, because it is a *reasoning* error rather than a knowledge error. "Empty means zero failures" is a guess about a service that just told you it could not compute the value. A missing answer is not a zero, and a test that treats it as one is asserting something nobody verified. Worth discussing at length: it is the same conflation as [Chapter 2.2](../../part-2-programming-fundamentals/02-data-types.md) D.4's null-versus-absent, arriving through a different door.

**The principle to state as a rule:** in test code, prefer the comparison that fails on unexpected input. A test exists to notice when reality differs from expectation, and `==` is a tool engineered to overlook differences. Strictness is not pedantry in this context; it is the function.

**Reread if missed:** Sections C.7 and D.2.

---

## Exercise notes for instructors

### G.1 — Twenty expressions

| # | Expression | Result | Type |
|---|---|---|---|
| 1 | `10 % 4` | `2` | number |
| 2 | `"6" - 2` | `4` | number |
| 3 | `"6" + 2` | `"62"` | string |
| 4 | `2 + 3 * 4` | `14` | number |
| 5 | `(2 + 3) * 4` | `20` | number |
| 6 | `1240 >= 1240` | `true` | boolean |
| 7 | `"apple" < "banana"` | `true` | boolean |
| 8 | `"Zebra" < "apple"` | `true` | boolean |
| 9 | `"100" < "99"` | `true` | boolean |
| 10 | `1 === "1"` | `false` | boolean |
| 11 | `1 == "1"` | `true` | boolean |
| 12 | `"0" == false` | `true` | boolean |
| 13 | `[] == false` | `true` | boolean |
| 14 | `null == undefined` | `true` | boolean |
| 15 | `null === undefined` | `false` | boolean |
| 16 | `0 \|\| "fallback"` | `"fallback"` | string |
| 17 | `0 ?? "fallback"` | `0` | number |
| 18 | `"" \|\| "fallback"` | `"fallback"` | string |
| 19 | `"" ?? "fallback"` | `""` | string |
| 20 | `false && somethingUndefined()` | `false` | boolean |

Line 8 catches nearly everyone: all uppercase letters precede all lowercase ones in character order, so `"Zebra"` sorts before `"apple"`. It matters for sorted-list assertions, and it is why case-insensitive sorting needs explicit work.

**Task A — the rule for 16-19.** `||` falls back for any falsy value; `??` falls back only for `null` and `undefined`. `0` and `""` are falsy but not nullish, so the two operators disagree on exactly those cases.

**Task B — why line 20 does not crash.** `&&` short-circuits: the left operand is falsy, so the right side is never evaluated and the undefined function is never called. It demonstrates that `&&` and `||` control *whether* code runs, not merely what it produces — which is why condition ordering is a correctness concern (Q8).

**Task C — what strict TypeScript rejects.** Lines 10-13 are flagged as comparisons between unrelated types (10 and 11 for number/string, 12 and 13 for the coercion). Lines 14 and 15 compile, since `null` and `undefined` are comparable. The lesson: **the compiler already prevents most `==` disasters in typed code.** The real exposure is data typed as `any` — `JSON.parse` output, untyped library returns — which is precisely where API test code lives. That is why the discipline still matters in a typed language.

### G.2 — Fix ten conditions

| # | Fix | What was wrong |
|---|---|---|
| 1 | `=== HTTP_OK` | `==`, plus a magic number |
| 2 | `failedCount > 0` (inverted) | `== false` on a number; says nothing about intent |
| 3 | `config.retries ?? 3` | `0` silently becomes 3 |
| 4 | `config.headless ?? true` | Can never produce `false` (Q4) |
| 5 | `if (isPassed \|\| isSkipped)` | De Morgan; three negations for an `or` |
| 6 | `if (isSmoke \|\| (isRegression && failedCount === 0))` | Precedence; better still, name the groups |
| 7 | `if (failures.length > 0)` | `[]` is truthy |
| 8 | `Math.abs(total - expected) < 0.005` | Float equality |
| 9 | `results.length > 0 && results[0].status === "failed"` | Order — crashes on empty |
| 10 | `if (durationMs != null && durationMs > MAX)` | Third condition is the negation of the second |

**Task D — number 9.** The defect is evaluation order, not an operator choice: the array access happens before the guard that protects it. The general rule is that in a `&&` chain, each condition may assume the ones to its left succeeded, so protective checks go first. Same shape as Q8 — if the cohort missed Q8, work this one on the board.

**Task E — number 10.** `durationMs > MAX` and `!(durationMs <= MAX)` are the same condition written twice. Two of the three conditions are needed: the null check and one comparison. Note that `!= null` here is the sanctioned loose-equality idiom and should *not* be "fixed" to `!== null`, since that would stop catching `undefined`. Learners who "correct" it have applied the rule without understanding the exception.

**Task F — why number 4 is worst.** Because the expression's range of possible outputs is a single value. Numbers 1, 3, and 7 produce wrong answers for *some* inputs; number 4 produces `true` for every input, so the configuration option it implements does not exist. A bug that makes a feature unreachable is worse than one that makes it occasionally wrong, because there is no input that reveals it.

### G.3 — Express the policy

**Model answer for Task A:**

```ts
const MIN_PASS_RATE = 98;
const MAX_SKIPPED = 2;
const MAX_DURATION_MS = 30 * 60 * 1000;

const hasExecutedTests = executedCount > 0;
const meetsPassRate = hasExecutedTests && passRatePercent >= MIN_PASS_RATE;
const noCriticalFailures = criticalFailedCount === 0;
const nothingBlocked = blockedCount === 0;
const skipsAcceptable =
  skippedCount === 0 || (skippedCount <= MAX_SKIPPED && criticalSkippedCount === 0);
const runFinished = isCompleted;
const withinDuration = durationMs <= MAX_DURATION_MS;

const canPromote =
  hasExecutedTests &&
  meetsPassRate &&
  noCriticalFailures &&
  nothingBlocked &&
  skipsAcceptable &&
  runFinished &&
  withinDuration;
```

**Task B — boundaries.** The defensible reading: 98.0% exactly *is* acceptable (`>=`), because "at least 98%" is the English; exactly 2 skips *is* acceptable (`<=`), because "at most 2" is the English; exactly 30 minutes *is* acceptable (`<=`), because "under 30 minutes" arguably is not — this one is genuinely ambiguous and the right answer is to say so and pick one. Accept any choice with reasoning. Reject answers that do not notice there was a decision.

**Task C — why naming removes the parentheses.** `skipsAcceptable` contains the `||`-inside-`&&` structure, and once it is a named boolean the outer expression contains only `&&`. No precedence question can arise, so no parentheses are needed and no reader has to check. This is structural rather than cosmetic, and it is the habit worth taking from the whole chapter.

**Task D — the eight cases.** 1 promote; 2 promote (boundary, 2 skips allowed); 3 reject (97.9 < 98); 4 reject (blocked); 5 promote (2 skips, none critical); 6 reject (3 > 2); 7 reject (critical skipped); 8 reject (31 min).

Case 2 versus 6 tests the `MAX_SKIPPED` boundary; case 3 tests the pass-rate boundary. If a learner's table disagrees with theirs but is internally consistent with their documented boundary decisions, mark it correct.

**Task E — ordering.** `hasExecutedTests` and the count comparisons are cheap; anything requiring a scan of results (counting critical failures by tag) is more expensive. Ordering cheap-first short-circuits sooner. **The result cannot change**, because `&&` is associative and every operand here is a pure boolean with no side effects — which is precisely the property that makes reordering safe, and worth naming: reordering conditions is safe only when they have no side effects and none depends on a previous one succeeding. Number 9 in G.2 is the counterexample.

**Task F — the empty run.** The stated policy contains no rule about having run any tests, and several implementations therefore promote an empty run: nothing failed, nothing blocked, nothing skipped, completed, fast. `NaN >= 98` being false catches it by accident in most implementations, which is worse than catching it deliberately because it is not robust — an implementation that defaults `passRate` to `100` when there are no tests would sail through.

This is the [Chapter 1.4](../../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) cannot-fail suite promoted to production, and **noticing that the policy as written was incomplete is the entire point of the task.** Learners who add `hasExecutedTests` and say "the policy did not specify this, so I decided it" have done exactly what [Chapter 2.1](../../part-2-programming-fundamentals/01-thinking-like-a-programmer.md) G.1 Task A was training.

---

## Assignment 2.4 — grading notes

**Run scenario 9 first.** If it prints `NaN` or `GREEN`, stop and return the assignment; requirements 3 and 4 exist specifically for it, and the rest of the marking is moot if the empty run produces a false green.

**Then run the self-check scenario** (`passed: 0, failed: 0, blocked: 40`). This one is nastier than scenario 9 because `executedCount` is 0 while the run clearly *happened*. A learner whose guard is `total === 0` rather than `executed === 0` will produce `GREEN` here. It is worth adding to the required scenarios if you run this course a second time.

**Scenario 7 separates verdict from promotability**, and it is the requirement learners most often collapse. A run that is GREEN but took 31 minutes is still GREEN — the tests all passed — and is not promotable. Learners who make it AMBER or RED have conflated "did the tests pass" with "should we ship," which is a genuine conceptual error worth correcting: the first is a fact about the run, the second is a policy decision, and mixing them makes the verdict unusable for anything but this one gate.

**Requirement 9's three-boolean limit** is the structural requirement, and it will feel arbitrary to learners. The justification to give them: an expression with seven `&&`-ed booleans is readable, and one with seven booleans *and* a nested `||` is not — the limit forces the C.5 naming discipline rather than relying on judgment. Accept a longer final `canPromote` chain of named booleans; the limit is on expressions that combine raw comparisons.

**Requirement 13's boundary comments** are where partial understanding shows. A weak submission writes `// >= because at least`. A strong one writes `// >= : a run at exactly 90.0% is AMBER, not RED. Chosen because the threshold is stated as a minimum acceptable rate; if the intent were "better than 90" this would be >.` The difference is whether the learner knows the decision could have gone the other way.

**A shortcut to watch for.** Some learners will satisfy "no numeric literal in a comparison" by naming constants like `const ZERO = 0` and writing `blockedCount === ZERO`. That is the letter of the requirement and the opposite of its spirit. `=== 0` is fine — the requirement targets *thresholds and magic numbers*, values where a reader cannot tell what the number means. Worth clarifying in the brief if it happens more than once.

**What a strong submission looks like:** the guard is on `executedCount`, not `total`; `NO DATA` is a genuine fourth verdict rather than a special-cased print; the `Notes` field for scenario 7 names the duration and the actual value against the limit, so a reader knows how far over it was; and the boundary comments show awareness that each decision was a choice.
