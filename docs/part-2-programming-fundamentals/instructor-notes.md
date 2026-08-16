# Instructor Notes — Part II: Programming Fundamentals

[← Module Overview](00-module-overview.md) · [Table of Contents](../README.md)

**This is the part where cohorts are lost.** Attrition and long-term failure in QA automation programs correlate more strongly with a rushed Part II than with anything in Playwright. Protect the time. If you must cut something from this course, cut Part VI chapters 6.6 and 6.7 — never cut here.

---

## 1. Teaching goals for the module

Three outcomes, in priority order:

1. **Learners can read code they have never seen and predict what it does.** This matters more than authoring fluency, because most of their professional life will be spent reading an existing suite.
2. **Learners reach for the right construct.** Not "can use `reduce`" but "recognizes this is a `reduce` problem."
3. **Learners are not afraid of error messages.** A learner who reads the compiler output is self-sufficient; one who panics needs an instructor forever.

Notice what is not on the list: memorizing syntax. Syntax arrives free with practice.

---

## 2. Common beginner misconceptions, chapter by chapter

| Chapter | Misconception | Correction |
|---|---|---|
| 2.1 | "Pseudocode is a waste of time, let me just code" | Have them code a moderately branchy problem cold, watch them stall, then do it again with pseudocode first. Time both. |
| 2.2 | "`null` and `undefined` are the same" | `undefined` = never set; `null` = deliberately set to nothing. Show an API response with each and ask which represents a bug. |
| 2.2 | "Types are just labels" | Show `"5" + 5` producing `"55"` and ask what happens when a duration field arrives as a string from JSON. |
| 2.3 | "`const` means the value can never change" | `const` fixes the *binding*, not the contents. Demo mutating a `const` array. This surprises nearly everyone. |
| 2.3 | "Longer names are worse" | `r` vs `passedTestCount`. Show a code review comment on the former. |
| 2.4 | "`==` is fine in practice" | Live: `"0" == false // true`, `[] == false // true`. Then frame as a false-pass in an assertion. |
| 2.4 | "`&&` and `\|\|` return booleans" | They return operands. `status \|\| "unknown"` is a defaulting idiom they will meet constantly. |
| 2.5 | "More nesting means more thorough logic" | Refactor a 4-level nested condition into guard clauses on screen; ask which they would rather debug at 2 a.m. |
| 2.5 | "`switch` is the tidy version of `if`" | Demo fall-through with a missing `break`, then explain when `switch` genuinely reads better. |
| 2.6 | "`for` is the default loop" | Show `for...of` and `forEach` on test data; ask which one communicates intent. Then show why index loops still matter. |
| 2.6 | "You can `await` inside `forEach`" | Sequenced badly on purpose in 2.12, but plant the flag here: `forEach` does not wait. |
| 2.7 | "Functions are for code you use twice" | Functions are for *naming an idea*. `isCriticalFailure(result)` used once is still better than an inline condition. |
| 2.7 | "Printing and returning are the same" | A function that only prints cannot be tested or composed. This is the single most common Project 1 defect. |
| 2.8 | "`map` and `forEach` are interchangeable" | `map` returns; `forEach` discards. Show a learner losing their transformed array. |
| 2.8 | "`sort` is harmless" | `sort` mutates in place, and sorts numbers as strings by default. `[1, 10, 2].sort()` on screen ends the argument. |
| 2.8 | "`reduce` is advanced and avoidable" | Build it up from a `for` loop with an accumulator so it arrives as a refactor, not a novelty. |
| 2.9 | "Dot access always works" | `results[0].error.message` on a passing result. Introduce optional chaining as the fix, and `?.` as a smell when overused. |
| 2.9 | "Objects and arrays are different worlds" | An array of objects is *the* QA data structure. Spend real time here. |
| 2.10 | "`interface` and `type` are the same, pick randomly" | Give a defensible house rule (interfaces for object shapes, type aliases for unions and utilities) and hold to it all course. |
| 2.10 | "`any` fixes type errors" | It silences them. Show a real bug that `any` allowed through — a `durationMs` string arriving from JSON. |
| 2.10 | "Generics are for library authors" | One motivating example: a typed `first<T>(items: T[]): T \| undefined`. Stop there. |
| 2.11 | "`try/catch` around everything is defensive" | Swallowed errors are how tests pass while the app is broken. Show a `catch {}` that hides a 500. |
| 2.11 | "An assertion failure and an exception are the same" | Distinguish deliberately: assertion = a verdict about the system; exception = the code could not continue. |
| 2.12 | "`await` makes code slow" | Show sequential vs `Promise.all` timing. Then show where `Promise.all` is *wrong* (ordered dependencies). |
| 2.12 | "A Promise is a callback with nicer syntax" | Model states explicitly: pending → fulfilled/rejected. Draw it. |
| 2.12 | "Forgetting `await` is a small mistake" | It is the defining beginner Playwright bug. Demo a test that passes while asserting nothing. |
| 2.13 | "JSON has types" | JSON has *five* value kinds and no dates, no undefined, no functions. Show a `Date` surviving `stringify` and not surviving `parse`. |
| 2.13 | "`JSON.parse` returns my interface" | It returns `any`. Casting is a claim, not a check. Preview runtime validation from Chapter 4.3. |

---

## 3. Concepts learners find genuinely difficult

**Callbacks (2.7 → 2.8).** The conceptual leap is that a function can be a *value*. Build the bridge explicitly: first a named function passed by name, then an inline arrow, then the same thing inside `filter`. Three steps, in that order. Learners who see `.filter(r => r.status === "failed")` before that scaffolding memorize it as punctuation.

**`reduce` (2.8).** The hard parts are the accumulator's identity and the initial value. Always derive `reduce` from a `for` loop the learners just wrote. Never present it fresh.

**Asynchrony (2.12).** The difficulty is not the keywords, it is believing that a line of code can start something and move on. Physical demonstration works: hand two learners tasks, one blocking (wait for the kettle) and one concurrent (start the kettle, set the table), and time the room. Then map it onto code.

**Missing `await`.** Learners cannot see it because nothing visibly breaks. Manufacture the failure: an async function that returns `false`, awaited vs not, inside an `if`. `if (isReady())` on a Promise is always truthy. Let them stare at that.

**Type narrowing (2.10).** Union types feel like a restriction until narrowing turns them into a guarantee. Use a `TestStatus` union and a `switch` that TypeScript proves exhaustive, then add a case to the union and let the compiler find every unhandled site. That demo converts skeptics.

---

## 4. Suggested live-coding demonstrations

### Demo 1 — Input, process, output on a real problem (2.1, 20 min)

Problem: "Given a list of test results, how many passed?" Refuse to write code for the first ten minutes. Extract inputs, outputs, and the process in words. Draw the flowchart. Then implement, and point out that the code is now transcription rather than invention.

### Demo 2 — The type-mismatch bug (2.2, 10 min)

```ts
const durationFromJson = "1240";
const budget = 2000;
console.log(durationFromJson + budget);   // "12402000"
console.log(durationFromJson > budget);   // false — string comparison
```

Ask which of these would ship a false pass in a performance assertion.

### Demo 3 — `const` does not mean immutable (2.3, 5 min)

```ts
const failedTests = ["Login"];
failedTests.push("Checkout");   // legal
// failedTests = [];            // illegal
```

Short, memorable, prevents a recurring confusion.

### Demo 4 — Guard clauses beat nesting (2.5, 15 min)

Write a 4-level nested validation on screen, then refactor to early returns while narrating each step. Keep both versions visible side by side and ask the room to vote.

### Demo 5 — Building `reduce` from a loop (2.8, 20 min)

Three progressive versions of "total duration": `for` loop with accumulator → `forEach` with an outer variable → `reduce`. Emphasize that all three are correct and the third states intent most directly.

### Demo 6 — Sequential vs concurrent (2.12, 20 min)

```ts
// Sequential: ~3 seconds
const a = await fetchResult(1);
const b = await fetchResult(2);
const c = await fetchResult(3);

// Concurrent: ~1 second
const [x, y, z] = await Promise.all([fetchResult(1), fetchResult(2), fetchResult(3)]);
```

Then add a dependency (`c` needs `a`'s id) and show why `Promise.all` becomes wrong. Both halves matter; the second half is what stops learners parallelizing everything in the capstone.

### Demo 7 — The silent missing `await` (2.12, 15 min)

```ts
async function isEnvironmentReady(): Promise<boolean> { return false; }

if (isEnvironmentReady()) {
  console.log("Ready!");   // always prints — a Promise is truthy
}
```

Follow with the Playwright preview: an unawaited `expect` that never fails. Tell them plainly this is the bug they will personally write in Part V.

### Demo 8 — JSON round-trip losses (2.13, 10 min)

```ts
const original = { name: "Login", ranAt: new Date(), retries: undefined };
const restored = JSON.parse(JSON.stringify(original));
// ranAt is now a string; retries has vanished
```

---

## 5. Suggested live activities

| Activity | Chapter | Format | Time |
|---|---|---|---|
| Write pseudocode for "should this test be retried?" | 2.1 | Pairs on paper, no laptops | 20 min |
| Type-guessing gauntlet: 15 values, name the type | 2.2 | Whole class, rapid fire | 10 min |
| `let` or `const`? 12 declarations, justify each | 2.3 | Individual then compare | 10 min |
| Predict-the-output worksheet (20 expressions) | 2.4 | Individual, then reveal | 20 min |
| Refactor nested conditions into guard clauses | 2.5 | Pairs, swap code | 25 min |
| Choose the loop: 8 scenarios, pick and defend | 2.6 | Groups of 3 | 20 min |
| Extract three functions from a supplied wall of code | 2.7 | Individual | 25 min |
| Array-method relay: each learner adds one link to a chain | 2.8 | Whole class at one keyboard | 25 min |
| Model the demo shop's product and order as interfaces | 2.9, 2.10 | Pairs, compare to real API JSON | 30 min |
| Bug hunt: 6 snippets, find the missing `await` | 2.12 | Individual, timed | 20 min |
| Parse a real API response and type it | 2.13 | Individual | 25 min |

The **array-method relay** and the **missing-`await` bug hunt** are the two highest-yield activities in this part. Run them even if you cut others.

---

## 6. Questions to ask learners

- "What is the type of this value, and what happens if it arrives as a string instead?"
- "Would you use `let` or `const` here? What would break if I changed it?"
- "What does this function return when I pass it an empty array?" (Ask this constantly. It is the most common defect.)
- "Rewrite this `for` loop as a `filter`. Which version tells the reader more?"
- "Where does this variable stop existing?"
- "This function both computes a pass rate and prints it. Why is that a problem for us later?"
- "What is the accumulator here, and what is it *for*?"
- "Is that a Promise or a value? How can you tell by reading it?"
- "You forgot an `await` on line 12. What is the observable symptom?"
- "Why is `JSON.parse` returning `any` dangerous when I have a perfectly good interface?"
- "How would you test this function?" (Plants Part III.)

---

## 7. Signs a learner is struggling

| Signal | Likely cause | Response |
|---|---|---|
| Copies examples but cannot modify them | Pattern-matching without a mental model | Force prediction before running; ban copy-paste for a week |
| Every function returns `void` and prints | Has not separated computation from presentation | One-on-one: make them unit-test their own function; the pain teaches the lesson |
| Uses `any` everywhere | Type errors feel like obstacles rather than information | Sit with them and read three compiler messages aloud, translating each |
| Solutions crash on empty arrays or missing fields | Only ever considers the happy path | Add "what if it's empty / null / a string" as a required checklist item on every submission |
| Cannot explain their own working code | Almost always AI-assisted without engagement | Non-punitive: ask them to re-derive it on paper. Then reset expectations per the [AI policy](../00-course-overview/05-ai-policy.md). |
| Deeply nested conditionals everywhere | Has not internalized guard clauses | Constraint exercise: maximum one level of nesting allowed |
| `await` sprinkled randomly or omitted | No execution model, only a keyword habit | Return to the kettle demo; draw the timeline by hand |
| Silent, no questions, submissions stop | Fell behind and is hiding it | Reach out directly and privately. This is the highest-risk signal in the entire course. |

The last row deserves emphasis. In this part, silence is not comprehension. Build a weekly low-stakes check-in that makes admitting confusion routine.

---

## 8. Remediation exercises

**Cannot decompose problems (2.1).**
Five problems, pseudocode only, no code allowed. Grade the pseudocode. Then implement only the ones whose pseudocode was correct.

**Confuses types (2.2-2.4).**
Twenty-item prediction worksheet with mixed types and operators. Require a written prediction *before* running. Repeat weekly until predictions are consistently right.

**Cannot write functions (2.7).**
Ten one-line functions with fixed signatures supplied. They fill in only the body. Once fluent, remove the signatures and have them write those too.

**Cannot use array methods (2.8).**
Give the same problem four times: solve with `for`, then `forEach`, then `filter`+`map`, then `reduce`. Seeing one problem through four lenses builds the recognition that no amount of new problems will.

**Cannot model data (2.9-2.10).**
Hand them three real JSON responses from the demo API and have them write interfaces that make `tsc` pass. Concrete data first, abstraction second.

**Cannot reason about async (2.12).**
Timeline drawing: for six snippets, draw when each operation starts and finishes on a horizontal axis, before running. Then run and compare. Repeat until the drawings match reality.

**Learners who are ahead.**
Do not give them Part III early. Give depth instead: re-implement `filter`, `map`, and `reduce` from scratch using only loops; write a generic `groupBy`; add strict compiler flags (`noUncheckedIndexedAccess`) and fix the fallout. All three pay off directly in Part VI.

---

## 9. Assessment guidance for this part

- **Always test with an empty array and a missing field.** Make it explicit in every rubric, since it is the defect graders see most.
- **Reject `any` without a written justification.** One line in a comment is enough; the point is that it becomes a decision rather than a reflex.
- **Grade function signatures separately from bodies.** A learner with correct signatures and a buggy body understands the design; the reverse rarely does.
- **Require prediction logs** on the predict-the-output exercises. The log is the artifact, not the answer.
- **Project 1 and 2 defenses:** ask "what happens if the results file is empty?" and "which of these functions could you reuse in Project 3?" The second question previews reuse as a design goal.

---

## 10. Pacing guidance

| Week | Sessions | Risk to watch |
|---|---|---|
| 3 | 2.1, 2.2 | Learners impatient to write "real code" — hold the line on pseudocode |
| 4 | 2.3, 2.4 | Fast and confidence-building; use the surplus time for prediction drills |
| 5 | 2.5, 2.6 | First real logic bugs appear; normalize debugging out loud |
| 6 | 2.7, 2.8 (basics) | **Highest-risk week.** Callbacks arrive. Slow down here rather than in 2.8. |
| 7 | 2.8 (higher-order), 2.9 | `reduce` and nested data; expect visible struggle and plan office hours |
| 8 | 2.10, 2.11 | Types feel bureaucratic; keep every example tied to real API data |
| 9 | 2.12, 2.13 | **Second-highest-risk week.** Async is the gate to Playwright. Do not compress it. |
| 10 | Project 1 review, Project 2 lab | Use the review to surface shared defects publicly and without blame |

If you fall behind, borrow time from Week 4, never from Weeks 6 or 9.

---

## 11. Transition into Part III

Close Part II by connecting it forward explicitly:

> "You can now write TypeScript. From here on, every new thing you learn is a *test-specific* use of what you already have. Next we stop asking 'how do I write this code' and start asking 'what makes this test trustworthy' — because a test that passes for the wrong reason is worse than no test at all."

Then set the Part III expectation honestly: two sessions, almost no code, and the vocabulary that the remaining 24 weeks depend on.
