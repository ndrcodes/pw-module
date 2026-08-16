# Chapter 2.4 — Operators

🟢 **Beginner** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 3.5 hours independent work |
| **Prerequisite chapters** | [2.2](02-data-types.md), [2.3](03-variables-and-constants.md) |
| **Next chapter** | [2.5 Conditional Logic](05-conditional-logic.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Use** arithmetic and assignment operators, and **predict** their results including operator precedence.
2. **Compare** values using `===`, `!==`, `<`, `>`, `<=`, `>=`, and **explain** why `===` is required rather than `==`.
3. **Demonstrate** a case where `==` produces a misleading result that would cause a false-passing assertion.
4. **Combine** conditions with `&&`, `||`, and `!`, and **predict** short-circuit behavior.
5. **Explain** what `&&` and `||` actually return, and **use** `||` and `??` for defaulting.
6. **Predict** the output of expressions mixing arithmetic, comparison, and logical operators.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Types and coercion basics | [Chapter 2.2](02-data-types.md) |
| Declaring and naming variables | [Chapter 2.3](03-variables-and-constants.md) |

---

## C. Concept Explanation

### C.1 Operators are what assertions are made of

Every assertion you will ever write is a comparison.

```ts
expect(response.status()).toBe(200);        // is this equal to that?
expect(cartItems.length).toBeGreaterThan(0); // is this greater than that?
```

And every judgment your framework makes is a combination of comparisons:

```ts
const runPassed = failedCount === 0 && blockedCount === 0;
const shouldRetry = attempt < maxAttempts && isRetryableError;
```

So this chapter is not arithmetic practice. It is learning to state a verdict precisely, which is the whole job. A sloppy comparison is a sloppy verdict, and a sloppy verdict is a test that reports the wrong thing — which [Chapter 1.2](../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) established is worse than no test at all.

### C.2 Arithmetic

```ts
console.log(6 + 2);     // 8
console.log(6 - 2);     // 4
console.log(6 * 2);     // 12
console.log(6 / 8);     // 0.75
console.log(7 % 3);     // 1    remainder
console.log(2 ** 10);   // 1024 exponent
```

`%` (modulo) gives the remainder after division. It looks academic and has two genuinely useful jobs in test code.

**"Every Nth item":**

```ts
for (let index = 0; index < 100; index++) {
  if (index % 10 === 0) {
    console.log(`Progress: ${index} of 100`);
  }
}
```

**Distributing test data across a fixed set of values:**

```ts
const browsers = ["chromium", "firefox", "webkit"];
const assignedBrowser = browsers[testIndex % browsers.length];
```

Test 0 gets chromium, test 3 gets chromium again, and the assignment never goes out of range no matter how many tests exist. This exact pattern appears in shard assignment in [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md).

### C.3 The `+` overload

`+` does two different jobs, and this is the most common arithmetic bug in the language.

```ts
console.log(2 + 3);          // 5      addition
console.log("2" + 3);        // "23"   concatenation
console.log("Total: " + 5);  // "Total: 5"
```

If either operand is a string, `+` joins. Every *other* arithmetic operator converts to number instead:

```ts
console.log("6" - 2);   // 4
console.log("6" * 2);   // 12
console.log("6" / 2);   // 3
console.log("6" + 2);   // "62"    <- the odd one out
```

The QA consequence, and it is a real defect pattern:

```ts
const subtotal = "100.00";     // arrived from an API as text
const shipping = 4.99;
const total = subtotal + shipping;

console.log(total);            // "100.004.99"
console.log(typeof total);     // "string"
```

`"100.004.99"` is not a number, is not `104.99`, and did not throw. An assertion comparing it to `104.99` fails with a confusing message; an assertion comparing it to `"104.99"` fails too, so at least you find out. The insidious version is when the wrong value happens to satisfy a loose check.

**Under `strict` TypeScript** this specific line is a compile error, which is the type system earning its keep. The danger zone is data that crossed a boundary as `any` — `JSON.parse`, as [Chapter 2.2](02-data-types.md) C.11 covered.

Prefer template literals when you mean to build text, so that `+` always means arithmetic in your code:

```ts
const message = `Total: ${total}`;   // unambiguous
```

### C.4 Assignment and compound assignment

```ts
let failedCount = 0;

failedCount = failedCount + 1;   // 1
failedCount += 1;                // 2   shorthand for the same thing
failedCount++;                   // 3   shorthand for += 1
failedCount -= 2;                // 1
```

`+=`, `-=`, `*=`, `/=` all work the same way. `++` and `--` add or subtract one.

Two notes. First, all of these require `let`, since they rebind the name — the legitimate accumulator case from [Chapter 2.3](03-variables-and-constants.md) C.3.

Second, avoid `++` in the middle of a larger expression. `array[i++]` and `x = y++ + ++y` are legal, unreadable, and a recurring source of off-by-one defects. Use `++` on a line by itself or not at all. This course's rubrics treat clever increment placement as a readability defect.

### C.5 Precedence

Operators have an evaluation order, and it mostly matches arithmetic convention.

```ts
console.log(2 + 3 * 4);        // 14, not 20 — * before +
console.log((2 + 3) * 4);      // 20
```

The full precedence table has about twenty levels. Memorizing it is the wrong investment. Instead, learn these four groups and parenthesize anything else:

| Order | Operators |
|---|---|
| 1 | `()` grouping |
| 2 | `!` negation, `**` exponent |
| 3 | `*` `/` `%` then `+` `-` |
| 4 | comparisons, then `&&`, then `\|\|` |

The one that catches people is that **`&&` binds tighter than `||`**:

```ts
// what you wrote
if (isSmoke || isRegression && failedCount === 0) { }

// how it is read
if (isSmoke || (isRegression && failedCount === 0)) { }
```

Those mean very different things. A smoke run with failures passes the first condition regardless of failures, which is almost certainly not what was intended.

**The rule this course requires: parentheses whenever `&&` and `||` appear in the same expression.** Not because you cannot learn the precedence, but because the reader of your code at 2am should not have to. Parentheses are cheaper than cleverness, and this is a graded code-review criterion in [Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md).

### C.6 Comparison operators

```ts
console.log(1240 > 900);      // true
console.log(1240 >= 1240);    // true
console.log(1240 < 900);      // false
console.log(1240 <= 900);     // false
```

Comparisons produce booleans. That is [Chapter 2.2](02-data-types.md) C.5's point, and it is why comparisons are the raw material of assertions.

**Strings compare character by character, in character order:**

```ts
console.log("apple" < "banana");   // true
console.log("Zebra" < "apple");    // true   — uppercase sorts before lowercase
console.log("10" < "9");           // true   — the QA trap
```

`"Zebra" < "apple"` being true surprises people: all uppercase letters come before all lowercase ones in character order. It matters when asserting on sorted lists, and it is why case-insensitive sorting requires explicit work.

`"10" < "9"` is the one that produces defects. Comparison stops at the first differing character, `"1"` precedes `"9"`, and the remaining digits are never examined. Version comparisons and sorted-duration assertions both break on this, and both break in a way that looks nearly right.

**Boundary conditions.** `<` versus `<=` is where off-by-one bugs live, and in test code the boundary is usually the interesting case:

```ts
const MAX_DURATION_MS = 2000;

if (durationMs > MAX_DURATION_MS) { /* fails at 2001 */ }
if (durationMs >= MAX_DURATION_MS) { /* fails at 2000 */ }
```

Which is correct depends on whether 2000ms is acceptable, and that is a requirements question. Deciding it deliberately — rather than typing whichever operator came to mind — is the [Chapter 2.1](01-thinking-like-a-programmer.md) C.5 flowchart discipline applied to a single character.

### C.7 `===` versus `==`, and why this matters more in tests

**`===` compares type and value. `==` converts first, then compares.**

```ts
console.log(1 === 1);        // true
console.log(1 === "1");      // false — different types
console.log(1 == "1");       // true  — "1" is converted to 1
```

The `==` conversion rules produce this:

| Expression | `==` result |
|---|---|
| `"0" == false` | `true` |
| `"" == false` | `true` |
| `0 == false` | `true` |
| `[] == false` | `true` |
| `null == undefined` | `true` |
| `"1" == true` | `true` |
| `"2" == true` | `false` |
| `NaN == NaN` | `false` |

Look at the last three together. `"1" == true` but `"2" == true` is false, because the conversion turns `true` into `1` rather than checking truthiness. There is a documented algorithm behind every row and no useful mental model, which is the real objection: you cannot predict `==` without looking it up.

**Why this is worse in test code than in application code.** An application bug from `==` produces wrong behavior, which someone eventually notices. A *test* bug from `==` produces a green suite, which nobody notices because green is what you wanted.

```ts
// The API is broken and returns the string "0" for errorCount
// instead of the number 0 — or worse, returns "0" when there ARE errors.
if (response.errorCount == false) {
  console.log("No errors — test passes");   // prints, because "0" == false
}
```

The suite is green. The API is broken. Nothing will tell you until a customer does. This is precisely the [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) test that cannot fail, produced by two characters.

**The rule: always `===` and `!==`. There is exactly one exception**, and it is worth knowing because you will see it in real code:

```ts
if (value == null) { }     // true for null OR undefined — idiomatic, and intentional
```

That is the conventional shorthand for "null or undefined," and the alternative is `value === null || value === undefined`. Both are acceptable in this course. Every other use of `==` is not, and most linters will flag it.

**`!==` and readability.** Negation is harder to read than affirmation, so prefer the positive form where one exists:

```ts
if (status !== "passed") { }          // fine
if (!(status === "passed")) { }       // same meaning, worse
if (failedCount !== 0) { }            // fine
if (failedCount > 0) { }              // better — says what it means
```

### C.8 Logical operators and truthiness

```ts
console.log(true && true);    // true    — both must be true
console.log(true && false);   // false
console.log(true || false);   // true    — either may be true
console.log(false || false);  // false
console.log(!true);           // false   — negation
```

Before going further you need **truthiness**, because `&&` and `||` operate on it rather than on strict booleans.

Every value is either truthy or falsy. There are exactly **eight falsy values**, and everything else is truthy:

```text
false     0     -0     0n     ""     null     undefined     NaN
```

Memorize that list. Everything not on it is truthy, including all of these, which catch people out:

```ts
"false"      // truthy — a non-empty string
"0"          // truthy — a non-empty string
[]           // truthy — an empty array!
{}           // truthy — an empty object!
" "          // truthy — a space is a character
```

Three of those are recurring defect sources.

**`"false"` is truthy**, which is the [Chapter 2.2](02-data-types.md) G.3 bug: `if (run.completed)` fires for a run whose `completed` field is the string `"false"`.

**`[]` is truthy**, so `if (failures)` is always true regardless of contents. The check you wanted is `if (failures.length > 0)`.

**`0` is falsy**, which matters enormously for defaulting. See C.10.

### C.9 What `&&` and `||` actually return

This is the part most tutorials get wrong, and knowing it correctly unlocks two patterns you will use constantly.

**`&&` and `||` do not return booleans. They return one of their operands.**

```ts
console.log(0 && "hello");        // 0        — returns the falsy left operand
console.log(1 && "hello");        // "hello"  — returns the right operand
console.log(0 || "fallback");     // "fallback"
console.log("value" || "fallback"); // "value"
```

The precise rules:

- **`a || b`** evaluates `a`. If truthy, returns `a` and **never evaluates `b`**. Otherwise returns `b`.
- **`a && b`** evaluates `a`. If falsy, returns `a` and **never evaluates `b`**. Otherwise returns `b`.

That "never evaluates" is **short-circuiting**, and it has two important consequences.

**Consequence 1: it enables safe access.**

```ts
const name = user && user.name;
// If user is null, returns null instead of crashing on null.name.
```

`user.name` is never evaluated when `user` is falsy, so no crash. Modern code prefers optional chaining for this — see C.11 — but you will meet the `&&` form everywhere.

**Consequence 2: side effects on the right may not happen.**

```ts
let callCount = 0;
function expensiveCheck(): boolean {
  callCount++;
  return true;
}

const result = false && expensiveCheck();
console.log(result, callCount);   // false 0 — expensiveCheck never ran
```

Usually this is a performance benefit. Occasionally it is a bug, when the right-hand side was doing something you needed. Order your conditions so the cheap, safe check comes first:

```ts
if (results.length > 0 && results[0].status === "failed") { }
// The length check protects the access. Reverse the order and it crashes.
```

That ordering is not a style preference; it is the correctness of the line.

### C.10 `||` versus `??` for defaults

`||` is commonly used to supply a default:

```ts
const retries = config.retries || 3;
```

This has a bug, and it is a genuinely common one in real frameworks.

If `config.retries` is `0` — meaning "do not retry," a perfectly legitimate setting — then `0` is falsy, `||` moves on, and `retries` becomes `3`. **The configuration is silently ignored.** Someone deliberately disabled retries and got three of them, and nothing in the output says so.

The same trap applies to `""` and `false`:

```ts
const notes = config.notes || "(none)";     // an intentional "" becomes "(none)"
const headless = config.headless || true;   // an explicit false becomes true !!
```

That last line is the worst: it can never produce `false`, so a `headless: false` setting is unreachable and the browser never opens visibly. A learner debugging that will look everywhere except the default.

**`??` (nullish coalescing) falls back only for `null` and `undefined`:**

```ts
const retries = config.retries ?? 3;       // 0 stays 0
const notes = config.notes ?? "(none)";    // "" stays ""
const headless = config.headless ?? true;  // false stays false
```

**The rule: use `??` for defaults, and `||` only when you genuinely want every falsy value replaced.** That second case exists — "use this string if it is empty *or* missing" is a real requirement — but it should be the deliberate choice, not the habit.

This distinction is directly load-bearing in [Chapter 6.5](../part-6-framework-engineering/05-configuration.md), where configuration merges defaults with environment overrides and `retries: 0` must survive the merge.

### C.11 Optional chaining `?.`

A preview of [Chapter 2.9](09-objects.md), included here because it belongs with the `&&` pattern from C.9.

```ts
const result = { name: "checkout", error: null };

console.log(result.error.message);     // CRASH: cannot read property of null
console.log(result.error?.message);    // undefined — no crash
```

`?.` short-circuits to `undefined` if the value before it is `null` or `undefined`. It replaces the `&&` chain:

```ts
const message = response && response.error && response.error.message;  // old
const message = response?.error?.message;                              // modern
```

It combines naturally with `??`:

```ts
const errorText = response?.error?.message ?? "no error reported";
```

That single line handles: response missing, error missing, message missing, and message present. You will write it, or something very like it, in nearly every API test.

**One caution.** `?.` makes crashes disappear, and sometimes a crash was the correct outcome. If your API contract says `error.message` is always present when `error` is, then `response.error?.message` silently returning `undefined` hides a contract violation you should be failing on. Use `?.` where absence is genuinely expected, and assert where it is not. That judgment is the subject of [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md).

---

## D. QA Context

### D.1 Every assertion is a comparison, so a sloppy comparison is a sloppy verdict

Assertion libraries look like they do something special. They do not — they wrap a comparison and produce a good failure message.

```ts
expect(response.status()).toBe(200);
// approximately: if (!(actual === 200)) throw new Error(`Expected 200, received ${actual}`)
```

`toBe` uses strict equality. That is deliberate on the library authors' part, and it means an assertion will not quietly accept `"200"` for `200`. If you have ever wondered why an assertion failed while the printed values looked identical, this is usually why: one was a string.

```text
Expected: 200
Received: "200"
```

Reading that message correctly — noticing the quotes — is a skill, and it is the whole [Chapter 2.2](02-data-types.md) chapter arriving in your terminal. The quotes are the entire diagnosis.

### D.2 How `==` makes a broken system look healthy

The pattern from C.7, in a realistic setting.

You are testing an endpoint that reports how many items failed to import. The contract says it returns a number.

```ts
const summary = await response.json();

if (summary.failedCount == 0) {
  console.log("Import clean");
} else {
  throw new Error(`Import had ${summary.failedCount} failures`);
}
```

The service has a serialization defect and returns `"0"` as a string when there are no failures — and, crucially, `""` when the field could not be computed at all. Both `"0" == 0` and `"" == 0` are `true`. Your test reports a clean import in both cases, including the one where the service could not determine the answer.

With `===`, both cases fail loudly with a message showing a quoted value, and you have found a real defect in ten seconds.

**The general principle, and it is worth stating as a rule:** in test code, prefer the comparison that fails on unexpected input. A test's job is to notice when reality differs from expectation, and `==` is a tool specifically designed to overlook differences.

### D.3 Compound conditions and retry policy

Real automation logic is compound conditions, and the [Chapter 2.1](01-thinking-like-a-programmer.md) G.2 retry policy is a good example of how quickly they get subtle.

```ts
const MAX_ATTEMPTS = 3;

const isRetryableError =
  failureMessage.includes("timeout") ||
  failureMessage.includes("ECONNRESET") ||
  failureMessage.includes("502");

const shouldRetry =
  !tags.includes("no-retry") &&
  attempts < MAX_ATTEMPTS &&
  isRetryableError;
```

Four things in that snippet are deliberate choices worth copying.

**The compound `||` is extracted into a named constant.** `isRetryableError` explains itself; the same three `includes` calls inline inside a larger condition would not.

**`&&` and `||` are never mixed in one expression.** The `||` group lives in its own named value, so no precedence question arises — C.5's rule satisfied by structure rather than by parentheses.

**The cheap checks come first.** `!tags.includes(...)` and `attempts < MAX_ATTEMPTS` short-circuit before the string searching, per C.9. On a suite with a thousand retriable-looking failures, that ordering is free performance.

**The boundary is stated as a named constant with `<`, not `<=`.** `attempts < MAX_ATTEMPTS` with `MAX_ATTEMPTS = 3` permits attempts 0, 1, and 2 — three attempts total. Writing `<=` would permit four. The constant's name makes the intended reading checkable, which is the C.6 boundary discipline.

### D.4 Defaults in configuration, where `??` is not optional

[Chapter 6.5](../part-6-framework-engineering/05-configuration.md) builds a configuration system that merges defaults with per-environment overrides. Here is why C.10 matters there.

```ts
const DEFAULTS = { retries: 2, workers: 4, headless: true, baseUrl: "" };

// Wrong
function resolve(overrides) {
  return {
    retries: overrides.retries || DEFAULTS.retries,
    headless: overrides.headless || DEFAULTS.headless,
    workers: overrides.workers || DEFAULTS.workers,
  };
}
```

Three bugs, all invisible:

`retries: 0` becomes 2. An engineer disabling retries to diagnose a flaky test gets retries anyway, and concludes the test is stable.

`headless: false` becomes `true`. Debugging locally with a visible browser is impossible, and the setting appears to be ignored for no reason.

`workers: 0` — which some runners treat as "auto-detect" — becomes 4.

```ts
// Right
retries: overrides.retries ?? DEFAULTS.retries,
headless: overrides.headless ?? DEFAULTS.headless,
workers: overrides.workers ?? DEFAULTS.workers,
```

Every one of these has been shipped in real frameworks, and every one produces the same support conversation: "I set it and it didn't take effect." Two characters.

---

## E. Code Examples

### E.1 Very simple — arithmetic and comparison side by side

```ts
// operators-basics.ts
const passedCount = 6;
const failedCount = 2;
const totalCount = passedCount + failedCount;

console.log("total       =", totalCount);
console.log("pass rate   =", (passedCount / totalCount) * 100);
console.log("rate fixed  =", ((passedCount / totalCount) * 100).toFixed(1) + "%");
console.log("remainder   =", 7 % 3);

console.log("--- comparisons ---");
console.log("failed === 0        :", failedCount === 0);
console.log("failed !== 0        :", failedCount !== 0);
console.log("rate >= 95          :", (passedCount / totalCount) * 100 >= 95);
console.log("total > 0           :", totalCount > 0);

console.log("--- precedence ---");
console.log("2 + 3 * 4           :", 2 + 3 * 4);
console.log("(2 + 3) * 4         :", (2 + 3) * 4);
```

```text
total       = 8
pass rate   = 75
rate fixed  = 75.0%
remainder   = 1
--- comparisons ---
failed === 0        : false
failed !== 0        : true
rate >= 95          : false
total > 0           : true
--- precedence ---
2 + 3 * 4           : 14
(2 + 3) * 4         : 20
```

Note `.toFixed(1)` returns a **string**, which is why `+ "%"` works there. If you then compared that value to a number you would be back in [Chapter 2.2](02-data-types.md)'s trap — formatting is a display concern, and it should happen at the last possible moment.

### E.2 Practical — the `==` demonstrations

```ts
// loose-equality.ts
console.log('"0" == false   ->', ("0" as any) == false, '  | === ->', ("0" as any) === false);
console.log('""  == false   ->', ("" as any) == false,  '  | === ->', ("" as any) === false);
console.log('0   == false   ->', (0 as any) == false,   '  | === ->', (0 as any) === false);
console.log('[]  == false   ->', ([] as any) == false,  '  | === ->', ([] as any) === false);
console.log('"1" == true    ->', ("1" as any) == true,  '  | === ->', ("1" as any) === true);
console.log('"2" == true    ->', ("2" as any) == true,  '  | === ->', ("2" as any) === true);
console.log('null == undefined ->', null == undefined,  '| === ->', null === undefined);
console.log('NaN == NaN     ->', NaN == NaN,            '  | === ->', NaN === NaN);
```

```text
"0" == false   -> true   | === -> false
""  == false   -> true   | === -> false
0   == false   -> true   | === -> false
[]  == false   -> true   | === -> false
"1" == true    -> true   | === -> false
"2" == true    -> false  | === -> false
null == undefined -> true | === -> false
NaN == NaN     -> false  | === -> false
```

The `as any` casts are there only because strict TypeScript refuses to compile most of these comparisons — which is itself the point worth noticing: **the compiler is already protecting you from the majority of `==` disasters**, and you had to actively defeat it to see them. The exposure remains wherever data arrives as `any`.

Compare lines 5 and 6. `"1" == true` is true and `"2" == true` is false, because `true` converts to the number `1` and then `"1"` converts to `1`. It is not a truthiness check, despite looking like one. There is no mental model here — only a lookup table — which is the argument against `==` in a sentence.

### E.3 QA-oriented — pass rate and verdict from counts

```ts
// verdict.ts
const GREEN_THRESHOLD = 100;
const AMBER_THRESHOLD = 90;

const passedCount = 6;
const failedCount = 2;
const skippedCount = 1;
const blockedCount = 1;

const totalCount = passedCount + failedCount + skippedCount + blockedCount;
const executedCount = passedCount + failedCount;

const passRatePercent = executedCount === 0 ? 0 : (passedCount / executedCount) * 100;

const isGreen = passRatePercent >= GREEN_THRESHOLD && blockedCount === 0;
const isAmber = !isGreen && passRatePercent >= AMBER_THRESHOLD;
const verdict = isGreen ? "GREEN" : isAmber ? "AMBER" : "RED";

const hasCoverageGap = skippedCount > 0 || blockedCount > 0;

console.log(`Total:     ${totalCount}  (executed ${executedCount})`);
console.log(`Pass rate: ${passRatePercent.toFixed(1)}% of executed`);
console.log(`Verdict:   ${verdict}`);
console.log(`Coverage gap: ${hasCoverageGap ? "yes" : "no"}`);
```

```text
Total:     10  (executed 8)
Pass rate: 75.0% of executed
Verdict:   RED
Coverage gap: yes
```

Five decisions here that you should carry into your own code.

**`executedCount === 0 ? 0 : ...` guards the division**, so an empty run reports `0.0%` rather than `NaN%`. That is [Chapter 2.1](01-thinking-like-a-programmer.md) F.7's empty case, handled deliberately rather than discovered.

**The denominator is `executedCount`, and the output says so.** "75.0% of executed" is unambiguous; "75.0%" alone is not. The [Chapter 2.1](01-thinking-like-a-programmer.md) G.3 debate, resolved in the output text.

**`isGreen` requires `blockedCount === 0`.** A run where every executed test passed but two were blocked is not green — you did not test those. Encoding that in the verdict rather than leaving it to a reader's judgment is what makes the verdict trustworthy.

**Thresholds are named constants**, so a reviewer can check the policy without decoding the arithmetic.

**`hasCoverageGap` is named as a question** and is reported separately, because a pass rate cannot express "we did not run some tests."

### E.4 Automation-oriented — a retry decision

```ts
// retry-decision.ts
const MAX_ATTEMPTS = 3;
const RETRYABLE_PATTERNS = ["timeout", "ECONNRESET", "502", "socket hang up"];

interface FailedTest {
  name: string;
  attempts: number;
  tags: string[];
  failureMessage: string;
}

const candidates: FailedTest[] = [
  { name: "search results", attempts: 1, tags: ["smoke"], failureMessage: "Timeout 30000ms exceeded" },
  { name: "checkout declined", attempts: 1, tags: ["no-retry"], failureMessage: "Timeout 30000ms exceeded" },
  { name: "cart totals", attempts: 3, tags: ["cart"], failureMessage: "socket hang up ECONNRESET" },
  { name: "price display", attempts: 0, tags: ["ui"], failureMessage: "expected 100 received 99" },
];

for (const test of candidates) {
  const lowerMessage = test.failureMessage.toLowerCase();

  const isRetryableError = RETRYABLE_PATTERNS.some((pattern) =>
    lowerMessage.includes(pattern.toLowerCase())
  );

  const isTagBlocked = test.tags.includes("no-retry");
  const hasAttemptsLeft = test.attempts < MAX_ATTEMPTS;

  const shouldRetry = !isTagBlocked && hasAttemptsLeft && isRetryableError;

  const reason = isTagBlocked
    ? "tagged no-retry"
    : !hasAttemptsLeft
      ? `attempts exhausted (${test.attempts}/${MAX_ATTEMPTS})`
      : !isRetryableError
        ? "failure is not transient"
        : "transient failure, attempts remain";

  console.log(`${shouldRetry ? "RETRY " : "SKIP  "} ${test.name.padEnd(20)} ${reason}`);
}
```

```text
RETRY  search results        transient failure, attempts remain
SKIP   checkout declined     tagged no-retry
SKIP   cart totals           attempts exhausted (3/3)
SKIP   price display         failure is not transient
```

This is close to production framework code. Four points.

**Each condition is a named boolean, then combined.** `!isTagBlocked && hasAttemptsLeft && isRetryableError` reads as English. The same logic written inline would be four lines of parentheses that nobody reviews properly.

**`.toLowerCase()` on both sides** of the pattern match, because `"Timeout"` and `"timeout"` are different strings — C.6's character-order point in its practical form. Case-sensitivity bugs in message matching are extremely common and extremely annoying.

**`some()` replaces a chain of `||`.** It scales to twenty patterns without touching the condition, and [Chapter 2.8](08-arrays.md) covers it properly. Note it short-circuits exactly like `||` does.

**The `reason` mirrors the decision order.** This matters more than it looks: a retry decision without a stated reason is unauditable, and "why did this test not retry?" is a question you will be asked. The nested ternary is at the limit of readable and would be better as a function once you have [Chapter 2.7](07-functions.md).

---

## F. Common Mistakes

### F.1 Using `==` because it usually works

**The mistake:** `if (response.errorCount == 0)`.

**Why it happens:** it works most of the time, it is one character shorter, and older tutorials use it.

**What it costs:** in test code, a false pass. `"0"`, `""`, `false`, and `[]` all satisfy `== 0`, so a broken response can produce a green suite (D.2).

**Instead:** `===` and `!==` always. The one exception is `value == null` as the idiomatic "null or undefined" check.

### F.2 Comparing numeric strings and getting character order

**The mistake:** `if (version < "9.0")`, or sorting durations that arrived as strings.

**Why it happens:** the values look like numbers.

**What it costs:** `"10" < "9"` is `true`, so version gates and sorted-order assertions produce wrong answers that look nearly right.

**Instead:** convert to numbers before comparing, and validate the conversion. For version strings, compare component by component — do not compare them as text.

### F.3 Assuming `&&` and `||` return booleans

**The mistake:** expecting `const flag = config.retries && true` to produce a boolean, or being surprised when `console.log(0 || "x")` prints `"x"` rather than `true`.

**Why it happens:** they are called logical operators and every tutorial's truth table shows booleans.

**What it costs:** confusing bugs where a variable named like a boolean holds `0` or `""` or an object, and every later check on it behaves unexpectedly.

**Instead:** know that they return an operand (C.9). If you need a genuine boolean, use a comparison: `const hasRetries = config.retries > 0`.

### F.4 Using `||` for defaults

**The mistake:** `const retries = config.retries || 3;`

**Why it happens:** it is the pattern in most older code, and it works for strings and objects.

**What it costs:** every falsy legitimate value is silently overridden. `retries: 0` becomes 3, `headless: false` becomes `true`, `notes: ""` becomes the placeholder. The setting appears to be ignored and there is no error to search for (C.10, D.4).

**Instead:** `??`. Use `||` only when you deliberately want all falsy values replaced, and say so in a comment when you do.

### F.5 Mixing `&&` and `||` without parentheses

**The mistake:** `if (isSmoke || isRegression && failedCount === 0)`.

**Why it happens:** it reads left to right as English, and English does not have precedence.

**What it costs:** the code means something other than what it says. `&&` binds tighter, so the condition is `isSmoke || (isRegression && failedCount === 0)` — a smoke run passes regardless of failures.

**Instead:** parentheses whenever both appear, or better, extract each group into a named boolean as E.4 does. This course requires it and code review enforces it.

### F.6 Over-negating

**The mistake:** `if (!(!isPassed && !isSkipped))`.

**Why it happens:** it arrives incrementally — someone adds a negation to fix a case, then another.

**What it costs:** nobody can read it, including the author a week later, and it is where logic bugs hide because reviewers approve what they cannot follow.

**Instead:** apply De Morgan's law and simplify. `!(!a && !b)` is `a || b`. If a condition needs more than one `!`, extract a named positive boolean.

### F.7 Comparing floating-point results with `===`

**The mistake:** `if (total === 104.99)` after arithmetic.

**Why it happens:** the arithmetic is correct on paper.

**What it costs:** intermittent assertion failures on money where the printed values look identical — [Chapter 2.2](02-data-types.md) C.4's floating-point problem.

**Instead:** compare with a tolerance, or work in integer cents. `Math.abs(actual - expected) < 0.005` for currency.

### F.8 Truthiness checks on arrays and objects

**The mistake:** `if (failures) { report(failures); }`.

**Why it happens:** it reads as "if there are failures."

**What it costs:** `[]` is truthy, so the branch always runs and the report always claims failures exist. The check does nothing except look like it does something.

**Instead:** check what you actually mean. `if (failures.length > 0)`. Same for objects: `Object.keys(obj).length > 0`.

---

## G. Exercise

Suggested total time: 90 minutes.

### G.1 Easy — Predict twenty expressions (25 min)

Write your prediction for each, **including the type of the result**, before running anything. Then run and explain every mismatch.

```ts
 1  10 % 4
 2  "6" - 2
 3  "6" + 2
 4  2 + 3 * 4
 5  (2 + 3) * 4
 6  1240 >= 1240
 7  "apple" < "banana"
 8  "Zebra" < "apple"
 9  "100" < "99"
10  1 === "1"
11  1 == "1"
12  "0" == false
13  [] == false
14  null == undefined
15  null === undefined
16  0 || "fallback"
17  0 ?? "fallback"
18  "" || "fallback"
19  "" ?? "fallback"
20  false && somethingUndefined()
```

Then answer:

**A.** Lines 16-19 are four combinations of two values and two operators. State the rule that explains all four in one sentence.

**B.** Line 20 does not crash even though `somethingUndefined` is not defined anywhere. Why? What does that tell you about evaluation order?

**C.** Which of lines 10-15 does strict TypeScript refuse to compile? What does that tell you about where the real risk of `==` lives?

### G.2 Medium — Fix ten conditions (30 min)

Each condition below has at least one defect: a `==`, an unnecessary negation, an ambiguous precedence, a bad default, or a truthiness mistake. Rewrite each, and state what was wrong.

```ts
 1  if (response.statusCode == 200) { }
 2  if (failedCount == false) { }
 3  const retries = config.retries || 3;
 4  const headless = config.headless || true;
 5  if (!(!isPassed && !isSkipped)) { }
 6  if (isSmoke || isRegression && failedCount === 0) { }
 7  if (failures) { reportFailures(failures); }
 8  if (total === 104.99) { }
 9  if (results[0].status === "failed" && results.length > 0) { }
10  if (durationMs != null && durationMs > MAX && !(durationMs <= MAX)) { }
```

Then answer:

**D.** Number 9 has a defect that is not about operators at all, and it will crash. Explain it, and state the general rule about ordering conditions.

**E.** Number 10 contains a redundancy. Simplify it as far as it will go, and say how many of the three conditions are actually needed.

**F.** Number 4 is the most dangerous on the list. Explain why, in terms of what values the expression can possibly produce.

### G.3 Challenge — Express a policy as one expression (35 min)

**The policy, in English.** A test run may be promoted to the release candidate if **all** of these hold:

1. The pass rate of executed tests is at least 98%.
2. No test tagged `critical` failed.
3. No test was blocked.
4. Either no test was skipped, **or** the number skipped is at most 2 **and** none of them is tagged `critical`.
5. The run completed — it was not cancelled or timed out.
6. Total run duration is under 30 minutes.

**Task A.** Express the policy as a set of named boolean constants, then one final `canPromote` expression. Do not write a single expression with twelve operators in it — the naming *is* the answer.

**Task B.** State the boundary decision for each numeric threshold. Is 98.0% exactly acceptable? Are exactly 2 skips acceptable? Is exactly 30 minutes acceptable? For each, say which operator you chose and why.

**Task C.** Rule 4 has a nested `or` inside an `and`. Draw the flowchart. Then explain why extracting it into a named boolean removes the need for parentheses entirely.

**Task D.** Prove your expression correct against these eight cases. Show a table with each named boolean's value and the final verdict.

| # | Pass rate | Critical failed | Blocked | Skipped | Skipped critical | Completed | Duration |
|---|---|---|---|---|---|---|---|
| 1 | 100% | 0 | 0 | 0 | 0 | yes | 12 min |
| 2 | 98.0% | 0 | 0 | 0 | 0 | yes | 12 min |
| 3 | 97.9% | 0 | 0 | 0 | 0 | yes | 12 min |
| 4 | 100% | 0 | 1 | 0 | 0 | yes | 12 min |
| 5 | 100% | 0 | 0 | 2 | 0 | yes | 12 min |
| 6 | 100% | 0 | 0 | 3 | 0 | yes | 12 min |
| 7 | 100% | 0 | 0 | 1 | 1 | yes | 12 min |
| 8 | 99% | 0 | 0 | 0 | 0 | yes | 31 min |

**Task E.** Order your conditions so that the cheapest checks short-circuit first. Which conditions are expensive to evaluate, and does the ordering change the result? (It must not — explain why not.)

**Task F.** A run has **zero executed tests** — everything was blocked. What does your `passRate` calculation produce, and what does `canPromote` decide? Is that the right answer? If your expression promotes it, you have found a real class of bug; fix it and say what you added.

<details>
<summary>Hint on Task F, if you want to check your thinking</summary>

`0 / 0` is `NaN`, and `NaN >= 98` is `false` (per [Chapter 2.2](02-data-types.md) F.7), so `canPromote` is correctly `false` — but *for the wrong reason*, and only by luck. Rule 3 also catches it, since tests were blocked. Now consider a run with zero tests at all: nothing blocked, nothing skipped, nothing failed, completed, fast. Several implementations promote an empty run, which is the [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) cannot-fail suite promoted to production. A `hasExecutedTests` condition is the fix, and noticing that it was missing from the stated policy is the actual point of the task.

</details>

---

## H. Coding Assignment

### Assignment 2.4 — Test verdict calculator

**Objective.** Compute a run verdict from counts using only operators, named constants, and correct boundary decisions — and handle every degenerate input without producing `NaN`, `Infinity`, or a false green.

**The problem.** Build `assignment-2-4/verdict.ts` that takes a set of counts and a configuration, and reports a verdict.

**Inputs** (hardcode as a list of scenarios; functions arrive in [Chapter 2.7](07-functions.md)):

```ts
interface RunCounts {
  label: string;
  passed: number;
  failed: number;
  skipped: number;
  blocked: number;
  criticalFailed: number;
  durationMs: number;
  completed: boolean;
}
```

**Configuration** (named constants at the top, with a documented boundary decision for each):

| Constant | Value | Meaning |
|---|---|---|
| `GREEN_MIN_PASS_RATE` | 100 | Pass rate for GREEN |
| `AMBER_MIN_PASS_RATE` | 90 | Pass rate for AMBER |
| `MAX_ACCEPTABLE_SKIPPED` | 2 | Skips tolerated before coverage is flagged |
| `MAX_RUN_DURATION_MS` | 1_800_000 | 30 minutes |

**Required scenarios.** All nine, in this order:

| # | Label | passed | failed | skipped | blocked | criticalFailed | durationMs | completed |
|---|---|---|---|---|---|---|---|---|
| 1 | clean run | 40 | 0 | 0 | 0 | 0 | 720000 | true |
| 2 | boundary green | 40 | 0 | 2 | 0 | 0 | 720000 | true |
| 3 | boundary amber | 36 | 4 | 0 | 0 | 0 | 720000 | true |
| 4 | just below amber | 35 | 4 | 0 | 0 | 0 | 720000 | true |
| 5 | critical failure | 39 | 1 | 0 | 0 | 1 | 720000 | true |
| 6 | blocked tests | 38 | 0 | 0 | 2 | 0 | 720000 | true |
| 7 | over duration | 40 | 0 | 0 | 0 | 0 | 1800001 | true |
| 8 | incomplete run | 20 | 0 | 0 | 0 | 0 | 300000 | false |
| 9 | **empty run** | 0 | 0 | 0 | 0 | 0 | 0 | true |

**Required output per scenario:**

```text
[1] clean run
    Total 40 | executed 40 | pass rate 100.0% of executed
    Verdict: GREEN
    Promotable: yes
    Notes: none

[9] empty run
    Total 0 | executed 0 | pass rate n/a
    Verdict: NO DATA
    Promotable: no
    Notes: no tests executed
```

**Requirements.**

| # | Requirement |
|---|---|
| 1 | All thresholds are named constants; no numeric literal appears in a comparison |
| 2 | Pass rate computed over **executed** tests, with the denominator stated in the output |
| 3 | Division guarded — the empty run must print `n/a`, never `NaN` |
| 4 | Verdict is one of `GREEN`, `AMBER`, `RED`, `NO DATA`; the fourth exists specifically for the empty run |
| 5 | A `criticalFailed > 0` run can never be GREEN, regardless of pass rate |
| 6 | A run with `blocked > 0` can never be GREEN |
| 7 | An incomplete run (`completed === false`) can never be promotable, regardless of everything else |
| 8 | `Promotable` requires: verdict GREEN, zero blocked, skipped within the limit, duration within the limit, and completed |
| 9 | Every condition is a **named boolean** before being combined; no expression combines more than three named booleans |
| 10 | `&&` and `||` never appear in the same expression without parentheses |
| 11 | No `==` or `!=` anywhere except the idiomatic `== null` |
| 12 | `Notes` lists every reason a run is not promotable, comma separated, or `none` |
| 13 | Every threshold's boundary decision documented in a comment: does the boundary value itself pass? |
| 14 | `npx tsc --noEmit` clean under `strict`; no `any`, no casts |

**Constraints.**

- Operators, `const`/`let`, template literals, ternaries, `for...of`, and array `.push`/`.join` only. No functions, no `filter`/`map`/`reduce` — those are Chapters 2.7 and 2.8, and the point here is to build the logic from primitives so that you understand what the later abstractions replace.
- No `if` chains longer than the verdict decision itself. Name your booleans and combine them.

**Suggested approach.**

1. Write the expected output for all nine scenarios by hand, first. Scenario 9 is the one that will teach you something.
2. Decide every boundary. Write the decisions down before coding — is exactly 90.0% amber or red?
3. Build the named booleans one at a time, printing each for scenario 1 until they are all right.
4. Only then combine them into `verdict` and `isPromotable`.
5. Run scenario 9 early. If it prints `NaN`, requirement 3 has failed and it is easier to fix now.

**Acceptance criteria.**

- [ ] All nine scenarios produce output in the specified shape
- [ ] Scenario 9 prints `n/a` and `NO DATA`, never `NaN`
- [ ] Scenario 2 (2 skips) and scenario 5 (critical failure) demonstrate rules 5-6 correctly
- [ ] Scenario 7 is GREEN but not promotable — verdict and promotability are separate judgments
- [ ] Scenario 8 is not promotable despite a 100% pass rate
- [ ] No numeric literal in any comparison
- [ ] No `==` except `== null`
- [ ] Every mixed `&&`/`||` parenthesized, or avoided by naming
- [ ] All boundary decisions documented
- [ ] `tsc --noEmit` clean, no `any`

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Degenerate input handling | 25% | Empty run correct; no `NaN`/`Infinity` anywhere; guard is deliberate, not accidental |
| Boundary decisions | 20% | Every threshold's inclusivity chosen and documented; scenarios 2, 3, 4, 7 correct |
| Condition naming and structure | 20% | Named booleans throughout; no expression a reviewer must decode |
| Operator correctness | 15% | Strict equality; `??` where defaulting; no precedence ambiguity |
| Verdict logic | 15% | Critical failures and blocked tests correctly override; promotability separate from verdict |
| Output quality | 5% | Notes explain every rejection; denominator stated |

**Self-check.** Two tests of your work. First, add a tenth scenario yourself: `passed: 0, failed: 0, blocked: 40` — a run where every test was blocked. Your program should say `NO DATA`, not `GREEN`, and if it says GREEN you have a false-green bug of the kind this whole chapter is about. Second, hand your `Notes` output for scenario 7 to a colleague and ask them what to do about it; if they cannot tell, the note is not doing its job.

> **AI usage: restricted.** Same as [Chapter 2.1](01-thinking-like-a-programmer.md).
>
> **Allowed:** "what is the difference between `??` and `||`," "why is `NaN >= 90` false," "does `&&` bind tighter than `||`."
> **Not allowed:** pasting the requirements and asking for an implementation, or asking what edge cases you have missed.
>
> Requirement 3 and scenario 9 exist to make you meet the empty-input problem yourself. An AI will handle it for you and you will not have learned that it needed handling.

---

## I. Quiz

Nine questions. Answer key: [`answer-keys/part-2/04-operators.answers.md`](../answer-keys/part-2/04-operators.answers.md).

**1.** What is the value and type of `"6" + 2`?

- A) `8`, number
- B) `"62"`, string
- C) `4`, number
- D) `NaN`, number

**2.** Which is `true`?

- A) `1 === "1"`
- B) `"100" < "99"`
- C) `null === undefined`
- D) `NaN === NaN`

**3.** What does `0 || "fallback"` return, and what does `0 ?? "fallback"` return?

- A) `"fallback"` and `"fallback"`
- B) `0` and `0`
- C) `"fallback"` and `0`
- D) `0` and `"fallback"`

**4.** Identify the bug.

```ts
const headless = config.headless || true;
```

- A) `||` should be `&&`
- B) An explicit `headless: false` is falsy, so `||` returns `true` — the expression can never produce `false`, and the setting is unreachable
- C) `config.headless` might be undefined and crash
- D) There is no bug

**5.** How is this condition actually grouped?

```ts
if (isSmoke || isRegression && failedCount === 0) { }
```

- A) `(isSmoke || isRegression) && failedCount === 0`
- B) `isSmoke || (isRegression && failedCount === 0)`
- C) Left to right, so A
- D) It is a syntax error

**6.** What does `false && expensiveCheck()` return, and is `expensiveCheck` called?

- A) `false`, and it is called
- B) `false`, and it is not called
- C) `undefined`, and it is called
- D) A compile error

**7.** Which of these values is **truthy**?

- A) `0`
- B) `""`
- C) `[]`
- D) `NaN`

**8.** Identify the bug.

```ts
if (results[0].status === "failed" && results.length > 0) { }
```

- A) `===` should be `==`
- B) The conditions are in the wrong order — `results[0]` is accessed before the length check, so an empty array crashes
- C) `> 0` should be `>= 0`
- D) There is no bug

**9.** Scenario. A test asserts `if (summary.failedCount == 0) pass(); else fail();`. The service has a serialization defect and returns `""` for `failedCount` when it cannot compute the value. What happens, and what would `===` have done?

- A) Nothing changes; both operators behave identically here
- B) `"" == 0` is `true`, so the test passes and reports a clean run for a response the service could not compute; `===` would have failed loudly and shown the quoted empty string
- C) The test crashes with a type error
- D) `==` is fine because the value is empty, which means zero failures

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Operators build assertions | Every verdict is a comparison or a combination of them |
| `+` is overloaded | Joins if either side is a string; every other arithmetic operator converts to number |
| `%` | Remainder; used for "every Nth" and for cycling through a fixed set |
| Precedence | `&&` binds tighter than `\|\|`; parenthesize whenever both appear |
| String comparison | Character by character; `"10" < "9"` is true; uppercase precedes lowercase |
| `===` always | `==` coerces, has no mental model, and produces false passes in tests |
| `== null` | The one legitimate `==`: means null or undefined |
| Truthiness | Eight falsy values; `[]`, `{}`, `"0"`, and `"false"` are all truthy |
| `&&` / `\|\|` return operands | Not booleans; and they short-circuit |
| Short-circuiting | Order conditions so the cheap, protective check comes first |
| `??` over `\|\|` for defaults | `\|\|` silently overrides `0`, `""`, and `false` |
| `?.` | Short-circuits to `undefined`; use where absence is expected, assert where it is not |

### Mistakes recap

`==` because it usually works · numeric strings compared as text · assuming `&&`/`||` return booleans · `||` for defaults · unparenthesized `&&` with `||` · over-negation · float equality · truthiness checks on arrays.

### Habits to carry forward

**`===`, always.** With `== null` as the single exception, stated as a deliberate idiom rather than a slip.

**`??` for defaults.** `||` only when you want every falsy value replaced, and say so when you do.

**Name your conditions before combining them.** `!isTagBlocked && hasAttemptsLeft && isRetryableError` is reviewable; the same logic inline is not. This is the single highest-value habit in the chapter and it recurs in every rubric from here on.

**Decide boundaries deliberately.** `<` or `<=` is a requirements question, not a typing reflex.

### Competency check

> **Can you look at a comparison in a test and say what it would do if the value arrived as the wrong type?**

Test it: for each of these, say what happens if the right-hand value arrives as a string instead of a number, and whether the test passes, fails, or lies.

```ts
expect(response.status()).toBe(200);
if (durationMs > MAX_DURATION_MS) { }
if (failedCount == 0) { }
const retries = config.retries || 3;
```

Answers: the first fails loudly and shows quotes, which is correct behavior; the second coerces and works by accident until the string gains a suffix; the third lies; the fourth silently ignores a legitimate `0`. If you could not produce those four answers, reread C.7 and C.10.

Two secondary checks:

- Can you name all eight falsy values without looking?
- Can you say, without hesitating, whether `if (isSmoke || isRegression && ok)` means what its author intended?

**Gate for this chapter:** your Assignment 2.4 scenario 9 prints `NO DATA` rather than `NaN`, and you can state the `??` versus `||` rule and give the `headless: false` example. [Chapter 2.5](05-conditional-logic.md) uses these expressions to make decisions, and the boundary and precedence discipline established here is what keeps those decisions correct.

---

[← 2.3 Variables and Constants](03-variables-and-constants.md) · [Next: 2.5 Conditional Logic →](05-conditional-logic.md)
