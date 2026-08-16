# Chapter 2.2 — Data Types

🟢 **Beginner** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [2.1 Thinking Like a Programmer](01-thinking-like-a-programmer.md) |
| **Next chapter** | [2.3 Variables and Constants](03-variables-and-constants.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Identify** the type of any given value: `string`, `number`, `boolean`, `null`, `undefined`, array, or object.
2. **Explain** why data types exist and what they let a language and a compiler do for you.
3. **Distinguish** `null` from `undefined`, and **describe** what each communicates in an API response.
4. **Predict** the result of operations that mix types, including string concatenation with numbers.
5. **Describe** how TypeScript's type system relates to JavaScript's runtime values.
6. **Choose** an appropriate type for real QA data such as a test status, duration, retry count, or failure message.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Input → process → output decomposition | [Chapter 2.1](01-thinking-like-a-programmer.md) |
| A working Node.js and TypeScript environment | [Chapter 2.1](01-thinking-like-a-programmer.md) |

No prior programming knowledge assumed.

---

## C. Concept Explanation

### C.1 The defect this chapter prevents

Start with the bug, because it is real and it will happen to you.

An API returns a test's duration. Your test checks it against a budget:

```ts
const duration = response.durationMs;   // arrives as "1240" — text, not a number
if (duration > 2000) {
  throw new Error("Test exceeded the 2 second budget");
}
```

This code is wrong, it does not crash, and it passes. `"1240" > 2000` is `false`, so no error is thrown — which is the answer you wanted, for the wrong reason. Change the budget to `900` and it is still `false`, because comparing text to a number does not do what it looks like it does. The check is dead. It will never fail, no matter how slow the test gets.

That is the [Chapter 1.1](../part-1-testing-fundamentals/01-what-is-software-testing.md) "test that cannot fail," produced not by carelessness but by a type mistake invisible on the page. Understanding types is how you stop writing it.

### C.2 What a type is

A **type** is the kind of a value, and it determines what the value can do.

`1240` is a number. You can add it, compare it to other numbers, divide it. `"1240"` is a string — text that happens to contain digits. You can measure its length, split it, join it to other text. They look nearly identical on screen and they are different kinds of thing, in the same way that a photograph of a key is not a key.

Types exist because they let three useful things happen:

**Operations get meaning.** `+` means addition for numbers and joining for strings. The language needs to know which you have.

**Mistakes become findable.** If a function expects a number and you hand it text, something can notice. In TypeScript, that something is the compiler, and it notices before your code runs.

**Code becomes readable.** `durationMs: number` tells the next person what the value is. They do not have to run the program to find out.

JavaScript — the language TypeScript builds on — has types but is relaxed about them: it converts values automatically when you mix them, which is where C.1's silent failure comes from. TypeScript adds a checker that refuses the mix before you ever run it. Section C.10 covers what that means.

### C.3 `string` — text

A string is text. Three ways to write one:

```ts
"Checkout with expired card"      // double quotes
'Checkout with expired card'      // single quotes — identical meaning
`Checkout with expired card`      // backticks — a template literal
```

Double and single quotes are interchangeable; pick one and be consistent (this book uses double). Backticks are different and more useful: they let you embed values.

```ts
const testName = "checkout with declined card";
const durationMs = 2050;

console.log(`Test "${testName}" took ${durationMs} ms`);
```

```text
Test "checkout with declined card" took 2050 ms
```

Everything inside `${...}` is evaluated and inserted. You will use this constantly for failure messages, and it is the difference between an unreadable diagnostic and a useful one — a point [Chapter 2.11](11-error-handling.md) returns to.

**The QA trap.** A string containing digits is still a string:

```ts
console.log("1240".length);        // 4  — four characters
console.log(1240.toString().length); // also 4, but 1240 was a number first
```

When data arrives from a file, a form field, an environment variable, or an unpredictable API, digits frequently arrive as text. Assume nothing.

### C.4 `number` — quantities

One numeric type covers everything: integers, decimals, negatives.

```ts
const total = 10;
const passRate = 87.5;
const drift = -3;
const zero = 0;
```

Arithmetic works as expected:

```ts
console.log(6 / 8);        // 0.75
console.log(6 / 8 * 100);  // 75
console.log(10 % 3);       // 1   — remainder, useful for "every Nth"
```

**Two surprises worth knowing now.**

**Division by zero does not crash.** It produces `Infinity`, and `0 / 0` produces `NaN` ("not a number"):

```ts
console.log(10 / 0);   // Infinity
console.log(0 / 0);    // NaN
```

That second one is how an empty test run produces `NaN%` in a report — the [Chapter 2.1](01-thinking-like-a-programmer.md) empty-input problem showing up in arithmetic. `NaN` is also viral: any arithmetic involving it produces `NaN`, so one bad value silently poisons a whole calculation.

**Decimals are not exact.**

```ts
console.log(0.1 + 0.2);            // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);    // false
```

This is not a bug in JavaScript; it is how binary floating-point works in nearly every language. Some decimal fractions have no exact binary representation, exactly as 1/3 has no exact decimal representation.

It matters enormously for QA, because money is decimal. `19.99 * 3` will not give you exactly `59.97`. Two practical responses: compare with a tolerance rather than exact equality, or work in integer cents and divide only for display. You will meet both again when asserting on prices in [Part IV](../part-4-api-testing-and-automation/00-module-overview.md).

```ts
const expected = 0.3;
const actual = 0.1 + 0.2;
console.log(Math.abs(actual - expected) < 0.0001);   // true — close enough
```

### C.5 `boolean` — true or false

Two values only: `true` and `false`. This is the natural type of a verdict.

```ts
const testPassed = true;
const isRetryable = false;
const meetsTarget = 87.5 >= 95;    // false — the comparison produces a boolean
```

That last line is the important one: **comparisons produce booleans.** Every assertion you will ever write ultimately reduces to a boolean, which is why [Chapter 2.4](04-operators.md) and [Chapter 2.5](05-conditional-logic.md) matter so much.

A naming convention worth adopting immediately: name booleans as questions with a yes/no answer — `isRetryable`, `hasFailures`, `shouldSkip`, `canCheckout`. `status` is a bad boolean name because it does not read as true-or-false, and `flag` tells the reader nothing at all.

### C.6 `null` and `undefined` — two kinds of nothing

Every language has one "no value." JavaScript has two, and the distinction carries real meaning in QA work.

**`undefined`** means *never set*. It is what you get from a variable that was declared but not assigned, an object property that does not exist, or a function that returns nothing.

**`null`** means *deliberately empty*. Someone chose to put "no value" here.

```ts
const errorMessage = null;         // this test failed with no message — on purpose
let notesField;                    // undefined — nobody has set it yet

console.log(errorMessage);         // null
console.log(notesField);           // undefined
```

**Why this matters in an API response.** Consider two responses to `GET /tests/4821`:

```json
{ "name": "checkout", "status": "failed", "errorMessage": null }
```

```json
{ "name": "checkout", "status": "failed" }
```

The first says: the field exists, and its value is deliberately empty. The second says: the field is absent. These are different claims, and the difference is frequently the bug you are hunting. An absent field often means the server never populated it — a serialization defect. An explicit `null` usually means the server considered it and had nothing to report.

An automated test that treats them as interchangeable cannot tell you which happened. This is why [Chapter 2.10](10-typescript-fundamentals.md) distinguishes an optional property (`errorMessage?: string`, may be absent) from a nullable one (`errorMessage: string | null`, always present and possibly empty), and why [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md) treats "is this field absent or null?" as a contract question worth asserting on.

### C.7 Arrays — ordered collections

An array holds multiple values in order. Square brackets, comma separated.

```ts
const statuses = ["passed", "failed", "skipped"];
const durations = [1240, 980, 3180];
const browsers = ["chromium", "firefox", "webkit"];
```

Access by position, counting from **zero**:

```ts
console.log(statuses[0]);        // "passed"
console.log(statuses[2]);        // "skipped"
console.log(statuses.length);    // 3
```

Zero-based indexing means the last item is at `length - 1`. Reaching past the end does not crash:

```ts
console.log(statuses[5]);        // undefined
```

That `undefined` is precisely the trap `noUncheckedIndexedAccess` in your `tsconfig.json` protects against. With it enabled, TypeScript forces you to acknowledge that `statuses[5]` might not exist — mildly annoying, and it prevents the class of crash where you confidently use a value that was never there.

Arrays are how you will hold every set of test results, every list of products, every collection of users. [Chapter 2.8](08-arrays.md) is entirely about working with them.

### C.8 Objects — labeled records

An object holds named values. This is the shape of a single entity.

```ts
const result = {
  name: "checkout with declined card",
  status: "failed",
  durationMs: 2050,
  retries: 1,
  errorMessage: "expected 200 received 402",
};
```

Access by name:

```ts
console.log(result.name);          // "checkout with declined card"
console.log(result.durationMs);    // 2050
console.log(result.nonexistent);   // undefined — no crash
```

Each property has its own type. In this object: two strings, two numbers, and one more string. That mixture is normal and it is the reason objects exist — a test result is genuinely a bundle of differently-typed facts about one thing.

**Arrays and objects combine**, and the combination is the single most common shape in QA automation: an array of objects.

```ts
const results = [
  { name: "login valid",    status: "passed", durationMs: 1240 },
  { name: "checkout card",  status: "failed", durationMs: 2050 },
];

console.log(results.length);            // 2
console.log(results[1].status);         // "failed"
```

An array of test results. An array of products. An array of users. A JSON API response. Get comfortable reading `results[1].status` — array position, then property name — because you will read it thousands of times.

### C.9 Inspecting types at runtime with `typeof`

`typeof` reports the type of a value while the program runs.

```ts
console.log(typeof "failed");      // "string"
console.log(typeof 1240);          // "number"
console.log(typeof true);          // "boolean"
console.log(typeof undefined);     // "undefined"
console.log(typeof { a: 1 });      // "object"
console.log(typeof [1, 2, 3]);     // "object"   <- note this
console.log(typeof null);          // "object"   <- and this
```

The last two are historical oddities you simply have to know.

**Arrays report as `"object"`.** To test for an array, use `Array.isArray(value)`.

**`typeof null` is `"object"`.** This is a well-known bug in the original language design, preserved forever for compatibility. To test for null, compare directly: `value === null`.

```ts
console.log(Array.isArray([1, 2, 3]));   // true
console.log(Array.isArray({ a: 1 }));    // false
```

You will use `typeof` most when validating data that came from outside your program — a JSON file, an API response — which is exactly what [Chapter 2.13](13-json.md) is about.

### C.10 Type coercion — the silent conversions

JavaScript converts types automatically when you mix them. This is the mechanism behind C.1's dead check, and the rules are worth knowing precisely because they are not intuitive.

**`+` with a string means joining, not adding:**

```ts
console.log("5" + 5);        // "55"    string
console.log(5 + "5");        // "55"    string
console.log("total: " + 6);  // "total: 6"
```

**Every other arithmetic operator converts to number:**

```ts
console.log("5" * 2);        // 10      number
console.log("5" - 2);        // 3       number
console.log("5" / 2);        // 2.5     number
```

So `+` joins and `-` subtracts, on the same values. This asymmetry catches everyone once.

**Comparisons on two strings compare alphabetically, character by character:**

```ts
console.log("10" < "9");     // true    !!
console.log(10 < 9);         // false
```

`"10" < "9"` is true because comparison proceeds character by character: `"1"` comes before `"9"`. This is the defect that ruins version checks and sorted-order assertions.

**Mixing a string and a number in a comparison converts the string:**

```ts
console.log("1240" > 2000);  // false — "1240" becomes 1240, then 1240 > 2000
console.log("1240" > 900);   // true
```

So the C.1 example was not quite as dead as it looked — the conversion does happen for `>`. The real problem there is subtler and worse: it works by accident. Feed it `"1,240"` or `"1240ms"` or `""` and the conversion produces `NaN`, every comparison with `NaN` is `false`, and the check silently disappears. Code that is right by luck fails without warning when the input shifts.

```ts
console.log("1240ms" > 900);   // false — NaN > 900 is false
console.log("" > 900);         // false — "" becomes 0
console.log(NaN > 900);        // false
console.log(NaN < 900);        // false — both comparisons false, always
```

**The rule to adopt:** convert deliberately, never accidentally.

```ts
const raw = "1240";
const durationMs = Number(raw);

if (Number.isNaN(durationMs)) {
  throw new Error(`Duration is not numeric: "${raw}"`);
}
if (durationMs > 2000) { /* now this comparison means what it says */ }
```

TypeScript prevents most of this. `"1240" > 2000` is a compile error under `strict`, and you will see it before running anything. But data crossing your program's boundary — `JSON.parse`, file reads, `process.env` — arrives untyped, and there the discipline above is what protects you.

### C.11 What TypeScript adds

TypeScript is JavaScript plus a type checker. The checker runs before your program does and disappears entirely at runtime.

**Annotations** state a type explicitly:

```ts
const testName: string = "checkout";
const durationMs: number = 2050;
const passed: boolean = false;
```

**Inference** means you usually do not have to:

```ts
const testName = "checkout";     // TypeScript already knows this is a string
const durationMs = 2050;         // and this is a number
```

Both forms are identical to the checker. Prefer inference for obvious cases, and annotate where it adds information — function parameters, function returns, and anything whose type is not visible from the value. [Chapter 2.3](03-variables-and-constants.md) covers when each is appropriate.

**What the checker buys you:**

```ts
const durationMs: number = 2050;
const budget: string = "2000";

if (durationMs > budget) { }
//  ^^^^^^^^^^^^^^^^^^^
//  error TS2365: Operator '>' cannot be applied to types 'number' and 'string'.
```

The C.1 defect, caught before the program ran, with the line and the reason. That is the cheapest test you will ever write, and it is free.

**What the checker does not do:** it does not exist at runtime. Nothing in your compiled program checks anything. If data arrives from outside — an API, a file — TypeScript believes whatever you told it:

```ts
const data = JSON.parse(text) as { durationMs: number };
// TypeScript now believes durationMs is a number.
// If the JSON actually contained "1240", it is a string and nothing noticed.
```

This is the single most important limitation to understand, and it is why [Chapter 2.13](13-json.md) insists on **validating** parsed JSON rather than casting it, and why [Project 3](../projects/project-3-api-automation.md) deducts marks for a cast without a runtime check. A type annotation is a claim, not a guarantee.

### C.12 Choosing types for QA data

The practical skill. Here are realistic fields with the right choice and the reasoning:

| Field | Type | Why |
|---|---|---|
| `name` | `string` | Text |
| `status` | `"passed" \| "failed" \| "skipped" \| "blocked"` | A closed set. See below |
| `durationMs` | `number` | A quantity you compare and sum |
| `retries` | `number` | A count |
| `passed` | `boolean` | A verdict |
| `errorMessage` | `string \| null` | Present but empty when there is no error |
| `screenshotPath` | `string \| undefined` | Absent unless a screenshot was taken |
| `tags` | `string[]` | An ordered collection of text |
| `startedAt` | `string` (ISO 8601) | Store as text, parse when you need to compare |
| `browser` | `"chromium" \| "firefox" \| "webkit"` | A closed set |

Three decisions in that table deserve explanation.

**Why `status` is not just `string`.** With `string`, this compiles:

```ts
if (result.status === "faled") { }    // typo — compiles fine, never true
```

The condition is never true, the branch never runs, and nothing warns you. With a union of the four allowed values, the typo is a compile error immediately. This is the union type from [Chapter 2.10](10-typescript-fundamentals.md), and it is required by [Project 2](../projects/project-2-test-case-management.md) for exactly this reason.

**Why `durationMs` and not `duration`.** The name carries the unit. `duration: 2` is ambiguous — seconds? milliseconds? — and unit confusion is a real source of wrong assertions. Put the unit in the name and the ambiguity disappears.

**Why timestamps as strings.** ISO 8601 text (`"2026-04-17T14:32:00Z"`) is unambiguous, sorts correctly as text, survives JSON round-trips, and is readable in a log. Parse it into a date object only when you need to do arithmetic on it. Storing dates as timestamps-in-numbers is a recurring source of timezone defects.

---

## D. QA Context

### D.1 Types are the fields of every API response you will assert on

Every API response is objects, arrays, strings, numbers, booleans, and nulls — nothing else. When you write an API test in [Part IV](../part-4-api-testing-and-automation/00-module-overview.md), you are asserting about typed values in exactly the shapes from C.7 and C.8.

```json
{
  "id": 4821,
  "name": "checkout with declined card",
  "status": "failed",
  "durationMs": 2050,
  "retries": 1,
  "errorMessage": "expected 200 received 402",
  "screenshotPath": null,
  "tags": ["checkout", "payment", "smoke"],
  "startedAt": "2026-04-17T14:32:00Z"
}
```

You can already read every type in that response. `id` is a number, `tags` is an array of strings, `screenshotPath` is null, `startedAt` is a string. That reading skill is a prerequisite for the contract validation in [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md), which is the practice of asserting that *every* field has the type it should — not merely the two fields you care about today.

### D.2 The type mismatch that produces a false pass

This is the pattern to internalize, because it is the reason this chapter exists at all.

A wrong type rarely crashes. It usually produces a plausible wrong answer, and in a test that means a green result with no coverage. Three variants you will meet:

```ts
// 1. The dead comparison
if (response.durationMs > 2000) { }
// If durationMs is "2050ms", this is NaN > 2000, which is false. Forever.

// 2. The always-true truthiness check
if (response.errorCount) { }
// If errorCount is the string "0", this is TRUE — a non-empty string is truthy.
// The number 0 would have been false. Opposite behavior, same-looking data.

// 3. The joined total
const total = subtotal + shipping;
// If subtotal is "100.00", total is "1004.99" — a string, and the assertion
// that it equals 104.99 fails confusingly, or passes if you compare to a string.
```

Variant 2 is the nastiest, because the failure is inverted: the check fires when it should not, or does not fire when it should, depending on whether a numeric field arrived as text.

**The defense, and it is a habit rather than a technique:** when data crosses into your program from outside, check its type before using it. When data is internal, let TypeScript's annotations do the work. The boundary is where the discipline is needed, and knowing where your boundaries are is most of the skill.

### D.3 Why `status` as a free string is a real bug source

Recall from [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) that a test which cannot fail is worse than no test. Here is the type-level version:

```ts
const failures = results.filter((r) => r.status === "Failed");
```

If statuses are lowercase `"failed"`, this returns an empty array. Your report cheerfully announces zero failures. No error, no warning, no crash — and the report is worse than useless because it is confidently wrong.

With `status` typed as a union of the four allowed lowercase values, `"Failed"` is a compile error at the moment you type it. The defect cannot reach the report.

This is also the strongest available answer to a learner who finds TypeScript's annotations to be busywork: **the union type is a test.** It runs on every keystroke, costs nothing, and catches a class of defect that no amount of manual review reliably catches.

### D.4 `null` versus `undefined` as a diagnostic signal

A worked example of the C.6 distinction mattering.

You are testing `GET /orders/{id}`. The contract says a cancelled order has a `cancelledAt` timestamp and a live one does not. You see:

```json
{ "id": 991, "status": "cancelled" }
```

`cancelledAt` is **absent**, not null. What does that tell you?

Three hypotheses, and the distinction narrows them: the order was cancelled but the timestamp was never written (a data defect); the field exists in the database but was dropped in serialization (an API defect); or the API omits null fields as a convention (not a defect, and something your contract should have documented).

If the response had been `"cancelledAt": null`, the third hypothesis disappears and the first two become far more likely. The presence or absence of the key is evidence, and a test that treats absent and null as the same thing throws that evidence away.

This is why [Project 3](../projects/project-3-api-automation.md) asks you to validate the full response contract rather than selected fields, and why "should an added field fail the suite?" is one of the defense questions — knowing what your contract says about absence is part of knowing your contract.

---

## E. Code Examples

Type these. Predict each output before running, as the [Part II study method](00-module-overview.md#how-to-study-this-part) requires.

### E.1 Very simple — every primitive and its `typeof`

```ts
// types-tour.ts
const testName = "checkout with declined card";
const durationMs = 2050;
const passed = false;
const errorMessage = null;
let screenshotPath;

console.log(testName, "->", typeof testName);
console.log(durationMs, "->", typeof durationMs);
console.log(passed, "->", typeof passed);
console.log(errorMessage, "->", typeof errorMessage);
console.log(screenshotPath, "->", typeof screenshotPath);

const tags = ["checkout", "payment"];
console.log(tags, "->", typeof tags, "| isArray:", Array.isArray(tags));
```

```text
checkout with declined card -> string
2050 -> number
false -> boolean
null -> object
undefined -> undefined
[ 'checkout', 'payment' ] -> object | isArray: true
```

Two oddities on display: `typeof null` is `"object"`, and arrays report as `"object"` too. Both are C.9's historical quirks, and both are why `Array.isArray` and `=== null` exist.

### E.2 Practical — the coercion surprises

```ts
// coercion.ts
console.log('"5" + 5      =', "5" + 5);
console.log('5 + "5"      =', 5 + "5");
console.log('"5" * 2      =', "5" * 2);
console.log('"5" - 2      =', "5" - 2);
console.log('"10" < "9"   =', "10" < "9");
console.log('10 < 9       =', 10 < 9);
console.log('"1240" > 900 =', "1240" > 900);
console.log('"1240ms">900 =', "1240ms" > 900);
console.log('"" > 900     =', "" > 900);
console.log('0.1+0.2      =', 0.1 + 0.2);
console.log('0.1+0.2===0.3=', 0.1 + 0.2 === 0.3);
console.log('10/0         =', 10 / 0);
console.log('0/0          =', 0 / 0);
```

```text
"5" + 5      = 55
5 + "5"      = 55
"5" * 2      = 10
"5" - 2      = 3
"10" < "9"   = true
10 < 9       = false
"1240" > 900 = true
"1240ms">900 = false
"" > 900     = false
0.1+0.2      = 0.30000000000000004
0.1+0.2===0.3= false
10/0         = Infinity
0/0          = NaN
```

Three of these lines are QA defects waiting to happen:

`"10" < "9"` being `true` breaks any sorted-order or version assertion done on strings.

`"1240ms" > 900` being `false` is the dead check from C.1 — and note it is false while `"1240" > 900` is true, so the same code works or does not depending on whether the API happens to include a unit suffix.

`0.1 + 0.2 === 0.3` being `false` breaks money assertions, which is most of e-commerce testing.

Under `strict` TypeScript, several of these lines are compile errors. Comment them out one at a time to see which — the ones the compiler rejects are precisely the ones you will never ship, and the ones it accepts are the ones to stay alert to.

### E.3 QA-oriented — typing one test result

```ts
// one-result.ts
const result: {
  name: string;
  status: "passed" | "failed" | "skipped" | "blocked";
  durationMs: number;
  retries: number;
  errorMessage: string | null;
  screenshotPath: string | undefined;
  tags: string[];
} = {
  name: "checkout with declined card",
  status: "failed",
  durationMs: 2050,
  retries: 1,
  errorMessage: "expected 200 received 402",
  screenshotPath: "artifacts/checkout-declined.png",
  tags: ["checkout", "payment", "smoke"],
};

console.log(`${result.name}: ${result.status.toUpperCase()} in ${result.durationMs} ms`);
console.log(`tags: ${result.tags.join(", ")} (${result.tags.length} total)`);
console.log(`error: ${result.errorMessage ?? "none"}`);
```

```text
checkout with declined card: FAILED in 2050 ms
tags: checkout, payment, smoke (3 total)
error: expected 200 received 402
```

Four things introduced here, each briefly:

`status` is a **union of four literal values**, not `string`. Try changing it to `"faled"` — a compile error, immediately, which is D.3's point made concrete.

`errorMessage: string | null` is present-but-possibly-empty; `screenshotPath: string | undefined` may be absent. C.6's distinction, expressed in types.

`??` is the **nullish coalescing** operator: use the left value unless it is `null` or `undefined`, in which case use the right. It is how you print `"none"` instead of `null`.

That inline type block is verbose. [Chapter 2.9](09-objects.md) and [Chapter 2.10](10-typescript-fundamentals.md) replace it with a named `interface`, which is what you will actually write. It is spelled out here so you can see that a type is just a description of shape.

### E.4 Automation-oriented — reading a real API response

```ts
// api-shape.ts
const responseText = `{
  "runId": 4821,
  "suite": "checkout-regression",
  "startedAt": "2026-04-17T14:32:00Z",
  "completed": true,
  "totals": { "passed": 6, "failed": 2, "skipped": 1, "blocked": 1 },
  "results": [
    { "name": "login valid", "status": "passed", "durationMs": 1240, "errorMessage": null },
    { "name": "search results", "status": "failed", "durationMs": 3180, "errorMessage": "expected 1 received 0" }
  ]
}`;

const run = JSON.parse(responseText);

console.log("runId        ", run.runId, "->", typeof run.runId);
console.log("suite        ", run.suite, "->", typeof run.suite);
console.log("completed    ", run.completed, "->", typeof run.completed);
console.log("totals       ", "->", typeof run.totals, "(an object)");
console.log("totals.passed", run.totals.passed, "->", typeof run.totals.passed);
console.log("results      ", "-> array:", Array.isArray(run.results), "length:", run.results.length);
console.log("results[1].status      ", run.results[1].status);
console.log("results[0].errorMessage", run.results[0].errorMessage, "->", typeof run.results[0].errorMessage);
```

```text
runId         4821 -> number
suite         checkout-regression -> string
completed     true -> boolean
totals        -> object (an object)
totals.passed 6 -> number
results       -> array: true length: 2
results[1].status       failed
results[0].errorMessage null -> object
```

This is the shape of everything you will test in Part IV: **objects containing objects containing arrays of objects.** Note `run.totals.passed` — chaining property names to reach into nesting — and `run.results[1].status` — index, then property. Those two access patterns cover most of API testing.

One critical observation, and it is the C.11 limitation made real: `JSON.parse` returns `any`. TypeScript knows nothing about this data and will let you write `run.totls.passed` (typo) or `run.runId.toUpperCase()` (nonsense on a number) with no complaint at all. Both crash at runtime. Everything the compiler was doing for you in E.3 is switched off here, because the data came from outside.

That gap is exactly what [Chapter 2.13](13-json.md) closes.

---

## F. Common Mistakes

### F.1 Treating `"1240"` and `1240` as interchangeable

**The mistake:** using a numeric-looking string in arithmetic or comparison without converting it.

**Why it happens:** they look identical when printed, and sometimes the code works by accident (`"1240" > 900` is correctly `true`).

**What it costs:** a check that works today and silently dies when the input format shifts — a unit suffix, a thousands separator, an empty string. `NaN` compared to anything is `false`, so the check disappears without a sound.

**Instead:** convert deliberately with `Number(...)` and reject `NaN` explicitly:

```ts
const durationMs = Number(raw);
if (Number.isNaN(durationMs)) throw new Error(`Not numeric: "${raw}"`);
```

### F.2 Comparing strings and expecting numeric order

**The mistake:** `"10" < "9"`, or sorting `["9", "10", "100"]` and expecting numeric order.

**Why it happens:** the values look like numbers.

**What it costs:** wrong version comparisons, wrong sorted-order assertions, wrong "highest value" results. It fails in a way that looks almost right, which delays discovery.

**Instead:** convert to numbers before comparing. If sorting, sort numerically — `[...]sort((a, b) => a - b)`, covered in [Chapter 2.8](08-arrays.md).

### F.3 Using `null` and `undefined` interchangeably

**The mistake:** asserting `expect(response.cancelledAt).toBeNull()` when the field is actually absent, or treating both as "empty."

**Why it happens:** both mean "no value" in casual reading, and both are falsy.

**What it costs:** you lose the diagnostic signal from D.4. An absent field and an explicit null point at different defects, and a test that conflates them cannot distinguish a serialization bug from a data bug.

**Instead:** decide which your contract requires, type it accordingly (`string | null` versus `string | undefined`), and assert on the one you specified.

### F.4 Assuming a numeric-looking JSON field is a number

**The mistake:** `JSON.parse(text) as { durationMs: number }` and proceeding as though that were verified.

**Why it happens:** the cast makes the compiler stop complaining, which feels like resolution.

**What it costs:** the annotation is a claim, not a check (C.11). If the JSON contained `"1240"`, nothing noticed, and you are back in F.1 with the compiler now actively unhelpful because it believes you.

**Instead:** validate at the boundary. [Chapter 2.13](13-json.md) covers how, and [Project 3](../projects/project-3-api-automation.md) deducts marks for a cast without a runtime check.

### F.5 Expecting exact decimal arithmetic

**The mistake:** `expect(total).toBe(59.97)` after `19.99 * 3`.

**Why it happens:** the arithmetic is correct on paper, and decimals feel exact.

**What it costs:** intermittent, baffling assertion failures on money — the worst kind, because the values printed in the failure message look identical to the eye.

**Instead:** compare with a tolerance, or work in integer cents and convert only for display. Assert `Math.abs(actual - expected) < 0.005` for currency, or better, compare `5997 === 5997`.

### F.6 Modeling a closed set as a free string

**The mistake:** `status: string`, then comparing to `"Failed"` when the data says `"failed"`.

**Why it happens:** `string` always works and requires no thought.

**What it costs:** the D.3 defect — a filter that silently returns nothing and a report that confidently states zero failures. No error, no crash, wrong answer.

**Instead:** a union of literal values. `status: "passed" | "failed" | "skipped" | "blocked"`. The typo becomes a compile error, and the union doubles as documentation of what values are legal.

### F.7 Forgetting that `NaN` makes every comparison false

**The mistake:** assuming that if `x > 100` is false, then `x <= 100` must be true.

**Why it happens:** it is true for every number. It is false for `NaN`, where *both* comparisons are false.

**What it costs:** an `if`/`else` where neither branch does what you expect, and a bug that resists reasoning because it violates an assumption you did not know you were making.

**Instead:** check `Number.isNaN(x)` at the point where the value enters your program, and fail loudly there rather than letting `NaN` propagate.

---

## G. Exercise

Suggested total time: 90 minutes.

### G.1 Easy — Name the type, then verify (20 min)

For each value, write down the type you expect and what `typeof` will report. **Predict first, then run** — the gap between the two columns is the lesson.

| # | Value |
|---|---|
| 1 | `"failed"` |
| 2 | `2050` |
| 3 | `"2050"` |
| 4 | `true` |
| 5 | `null` |
| 6 | `undefined` |
| 7 | `["checkout", "smoke"]` |
| 8 | `{ name: "login", status: "passed" }` |
| 9 | `0` |
| 10 | `""` |
| 11 | `0.1 + 0.2` |
| 12 | `10 / 0` |
| 13 | `0 / 0` |
| 14 | `[]` |
| 15 | `1240 > 900` |

Then answer:

**A.** Which three values report a `typeof` that might surprise someone? Explain each.

**B.** Items 9 and 10 are both "empty-ish." What is `typeof` for each, and how would you distinguish "the number zero" from "the empty string" from "null" from "undefined" in a check?

### G.2 Medium — Predict twelve expressions (30 min)

Write your prediction for every line **before running anything**. Then run, and for each mismatch write one sentence explaining the rule you had wrong.

```ts
 1  "3" + 4
 2  3 + "4"
 3  "3" * "4"
 4  "3" - 4
 5  "12" > "9"
 6  12 > 9
 7  "12" > 9
 8  "abc" > 9
 9  true + 1
10  1 === "1"
11  0.3 - 0.1 === 0.2
12  [] + []
```

Then answer:

**C.** Lines 1 and 4 use the same operands with different operators and produce different *types*. State the rule in one sentence.

**D.** Line 8 produces `false`. Would `"abc" < 9` also be false? Why is that dangerous in an `if`/`else`?

**E.** Line 10 uses `===`. What would `1 == "1"` produce, and why is `==` banned in this course? ([Chapter 2.4](04-operators.md) covers this properly — reason it out now.)

**F.** Which of these twelve lines does `strict` TypeScript reject at compile time? Which does it allow? What does that tell you about where your validation effort belongs?

### G.3 Challenge — Audit an API response (40 min)

Here is a real-shaped test report response.

```json
{
  "runId": "4821",
  "suite": "checkout-regression",
  "startedAt": "2026-04-17T14:32:00Z",
  "finishedAt": null,
  "completed": "false",
  "durationMs": 28400,
  "totals": { "passed": 6, "failed": 2, "skipped": 1 },
  "passRate": "75.0%",
  "results": [
    {
      "name": "login with valid credentials",
      "status": "passed",
      "durationMs": 1240,
      "retries": 0,
      "errorMessage": null,
      "tags": ["login", "smoke"]
    },
    {
      "name": "search returns results",
      "status": "Failed",
      "durationMs": "3180",
      "retries": "1",
      "errorMessage": "expected 1 received 0",
      "tags": []
    }
  ]
}
```

**Task A.** List every field with its actual JSON type (not the type you think it should be). Include nested fields, using dotted paths like `results[1].retries`.

**Task B.** Identify **at least five fields whose type is suspicious**. For each, say what type it should be and what bug the wrong type suggests.

**Task C.** For three of your suspicious fields, write the specific assertion that would *falsely pass* because of the wrong type. Show the code and explain why it passes.

**Task D.** `totals` has three keys but the results include a `blocked` status elsewhere in the system. What kind of defect does a missing key represent, and how does that differ from a key present with value `0`?

**Task E.** `finishedAt` is `null` while `completed` is `"false"`. Are these consistent? Write the one-sentence bug report line you would file, in the [Chapter 1.1](../part-1-testing-fundamentals/01-what-is-software-testing.md) E.2 style.

**Task F.** Write the TypeScript type this response *should* have, using unions where a field is a closed set. Then say what would happen if you cast the actual response above to your correct type — which fields would lie, and when would you find out?

<details>
<summary>Hint: two of the suspicious fields, to check you are on track</summary>

`"runId": "4821"` is a string where an ID is almost certainly numeric — and note that this one may be *intentional*, since some APIs return IDs as strings deliberately to avoid integer overflow in other languages. That makes it a contract question rather than an obvious defect, which is worth saying in your answer.

`"completed": "false"` is the worst field in the response. It is the *string* `"false"`, which is truthy. `if (run.completed)` is `true` for a run that has not completed. Three more remain in `results[1]`.

</details>

---

## H. Coding Assignment

### Assignment 2.2 — A typed test environment description

**Objective.** Choose the correct type for every field of a realistic configuration object, and demonstrate that you understand the `null`/`undefined` distinction well enough to use each deliberately.

**The problem.** Every automation framework needs to describe the environment it is running against. You will build that description with correct types, print it readably, and show what happens when types are wrong.

**Requirements.**

| # | Requirement |
|---|---|
| 1 | Create `assignment-2-2/environment.ts` |
| 2 | Declare an object describing a test environment with **at least** the fields in the table below, each with an explicit type annotation |
| 3 | Every field's type is the narrowest correct choice — a closed set must be a union of literals, not `string` |
| 4 | Include one field that is `string \| null` and one that is `string \| undefined`, and add a comment on each explaining why that choice rather than the other |
| 5 | Print a formatted report of the environment using template literals |
| 6 | Handle the null/undefined fields in the output so that neither `null` nor `undefined` ever appears in printed text |
| 7 | Add a second `brokenEnvironment` object with **three deliberately wrong types**, each with a comment stating what defect it would cause |
| 8 | For each of the three, write a check that *falsely passes* because of the wrong type, and print its misleading result |
| 9 | Print the `typeof` of at least five fields, including one array (using `Array.isArray`) |
| 10 | Demonstrate the floating-point problem with a money calculation, and show a correct tolerance-based comparison next to it |
| 11 | No `any` anywhere in the file |
| 12 | Runs clean with `npx tsc --noEmit` under `strict` |

**Required fields.**

| Field | Meaning | Your job |
|---|---|---|
| `name` | Environment name, one of staging / production / local / ci | Closed set |
| `baseUrl` | The application URL | |
| `apiBaseUrl` | The API URL | |
| `retries` | How many times a failed test is retried | |
| `runInParallel` | Whether tests run concurrently | |
| `workers` | Number of parallel workers | |
| `defaultTimeoutMs` | Per-action timeout | Note the unit in the name |
| `browsers` | Which browsers to run | Array of a closed set |
| `notes` | Free-text operator notes | Decide: null or undefined? Justify |
| `slackWebhookUrl` | Where to post results, if configured | Decide: null or undefined? Justify |
| `createdAt` | When the config was written | See C.12 on timestamps |

**Expected output shape.** Match the structure; your values may differ.

```text
TEST ENVIRONMENT
================
Name:            staging
App URL:         https://staging.demoshop.example
API URL:         https://staging-api.demoshop.example
Retries:         2
Parallel:        yes (4 workers)
Timeout:         30000 ms
Browsers:        chromium, firefox, webkit (3)
Notes:           (none)
Slack webhook:   (not configured)
Created:         2026-04-17T14:32:00Z

TYPE INSPECTION
===============
name             -> string
retries          -> number
runInParallel    -> boolean
browsers         -> object | isArray: true
notes            -> object   (null)

DELIBERATE TYPE DEFECTS
=======================
1. retries as "2" (string)
   Check: retries > 3        -> false   [falsely passes: looks within limit]
   Why:   comparison coerces, and would break entirely on "2 retries"

2. runInParallel as "false" (string)
   Check: if (runInParallel) -> true    [falsely passes: a non-empty string is truthy]
   Why:   the string "false" is truthy; the boolean false is not

3. defaultTimeoutMs as "30s" (string)
   Check: timeout > 60000    -> false   [falsely passes: NaN > 60000 is always false]
   Why:   NaN comparisons are always false, so the guard is dead

MONEY ARITHMETIC
================
19.99 * 3          = 59.970000000000006
=== 59.97          = false
within 0.005       = true
in integer cents   = 5997 === 5997 -> true
```

**Constraints.**

- Explicit type annotations on the main environment object. This is one of the few places the course asks you to annotate what could be inferred, because the point of the assignment is the choosing.
- The three deliberate defects must be *silent* failures — wrong answers, not crashes. A defect that throws an error is not making the point.
- No `any`, no `as` casts, no `@ts-ignore`.

**Suggested approach.**

1. Write the expected output first, as [Chapter 2.1](01-thinking-like-a-programmer.md) E.2 taught.
2. Decide each field's type on paper, with a one-line justification. Two of them are judgment calls.
3. Write the object, then the report, then the type inspection.
4. Do the deliberate defects last, and check each one genuinely produces a misleading result rather than an error.

**Acceptance criteria.**

- [ ] All eleven required fields present, each explicitly annotated
- [ ] `name` and `browsers` use unions of literals, not `string`
- [ ] One `| null` field and one `| undefined` field, each with a justifying comment
- [ ] Neither `null` nor `undefined` appears in the printed report
- [ ] Three deliberate defects, each producing a silent wrong answer, each explained
- [ ] `typeof` shown for ≥5 fields including an array check
- [ ] Money example shows the problem and a correct comparison
- [ ] `npx tsc --noEmit` reports no errors
- [ ] No `any`, no casts, no suppressions

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Type choices | 30% | Every field narrowest-correct; unions used where a closed set exists; units in names |
| null vs undefined reasoning | 20% | The justifying comments show genuine understanding of C.6, not a restatement |
| Deliberate defects | 25% | All three silent; each explanation identifies the mechanism, not just the symptom |
| Output quality | 15% | Readable; no raw null/undefined; matches the specified shape |
| Correctness | 10% | Compiles under strict; runs; no `any` |

**Self-check.** Change `name` to `"stagng"`. You should get a compile error before running anything. If you do not, requirement 3 has failed — you typed `string` somewhere.

> **AI usage: restricted.** Same as [Chapter 2.1](01-thinking-like-a-programmer.md).
>
> **Allowed:** "what does `typeof null` return and why," "explain nullish coalescing," "what does this error mean."
> **Not allowed:** "write my environment object," "choose types for these fields," "give me three type defects."
>
> The type-choosing *is* the assignment. Outsourcing it leaves you with a file and no judgment.

---

## I. Quiz

Eight questions. Answer key: [`answer-keys/part-2/02-data-types.answers.md`](../answer-keys/part-2/02-data-types.answers.md).

**1.** What does `typeof []` return?

- A) `"array"`
- B) `"object"`
- C) `"undefined"`
- D) It is a compile error

**2.** What is the value and type of `"5" + 5`?

- A) `10`, number
- B) `"55"`, string
- C) `"5 5"`, string
- D) `NaN`, number

**3.** Which comparison is `true`?

- A) `10 < 9`
- B) `"10" < "9"`
- C) `0.1 + 0.2 === 0.3`
- D) `NaN === NaN`

**4.** An API response contains `"errorMessage": null`. A different response for the same endpoint omits `errorMessage` entirely. What is the significant difference?

- A) None — both mean there is no error message
- B) `null` means the field exists and is deliberately empty; absence means the field was never populated, which may indicate a serialization or data defect
- C) `null` is a bug and absence is correct
- D) Absence is faster to transmit

**5.** Identify the bug.

```ts
const timeoutRaw = process.env.TIMEOUT_MS;   // "30s"
if (Number(timeoutRaw) > 60000) {
  throw new Error("Timeout too high");
}
```

- A) `process.env` values are always numbers, so `Number()` is unnecessary
- B) `Number("30s")` is `NaN`, and every comparison with `NaN` is false, so the guard can never fire
- C) The comparison should use `>=`
- D) There is no bug

**6.** Why should a test `status` field be typed as `"passed" | "failed" | "skipped" | "blocked"` rather than `string`?

- A) It uses less memory
- B) It runs faster
- C) A typo like `"Failed"` becomes a compile error instead of a filter that silently matches nothing
- D) It is required by Playwright

**7.** True or false: if `x > 100` evaluates to `false`, then `x <= 100` must evaluate to `true`.

**8.** Scenario. You write `const data = JSON.parse(body) as { durationMs: number }`, then `if (data.durationMs > 2000)`. The API actually returns `"durationMs": "2050"`. What happens?

- A) TypeScript catches it at compile time
- B) It throws a runtime type error
- C) It compiles and runs; the comparison coerces the string and happens to work here, but nothing verified the type and a value like `"2050ms"` would silently disable the check
- D) The cast converts the string to a number

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Type | The kind of a value; determines what operations mean |
| `string` | Text; digits inside quotes are still text |
| `number` | One type for integers and decimals; decimals are inexact |
| `NaN` | "Not a number"; every comparison with it is false; it is viral |
| `boolean` | The type every comparison and every assertion produces |
| `null` | Deliberately empty |
| `undefined` | Never set |
| Array | Ordered collection; zero-indexed; out-of-range gives `undefined` |
| Object | Labeled record; the shape of one entity |
| Array of objects | The most common shape in QA automation |
| `typeof` | Runtime type check; reports `"object"` for arrays and for `null` |
| Coercion | `+` joins if either side is a string; other operators convert to number |
| TypeScript | A compile-time checker that vanishes at runtime |

### Mistakes recap

Numeric strings used as numbers · string comparison expecting numeric order · conflating `null` and `undefined` · trusting a cast on parsed JSON · exact decimal comparison · closed sets typed as `string` · forgetting that both `NaN` comparisons are false.

### Habits to carry forward

**Convert at the boundary, deliberately.** Anywhere data enters your program from outside — `JSON.parse`, a file, `process.env`, a form field — convert and validate there. Inside your program, let the types do the work.

**Type closed sets as unions.** Any field with a known finite set of legal values gets a union. It costs one line and eliminates a class of silent-wrong-answer defect.

**Put units in names.** `durationMs`, `timeoutMs`, `priceCents`. Unit ambiguity produces wrong assertions that look right.

### Competency check

> **Given an unfamiliar API response, can you state the type of every field and name the one most likely to cause a false-passing assertion?**

Exercise G.3 is that check. If you found fewer than five suspicious fields, redo it after rereading C.10 and D.2 — the skill being tested is not vocabulary but suspicion, and it is the foundation of the contract testing in [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md).

Two secondary checks:

- Can you explain, without notes, why `if (run.completed)` is `true` when `completed` is the string `"false"`?
- Can you say what a type annotation guarantees about data that came from `JSON.parse`? (Nothing. If your answer was anything else, reread C.11.)

**Gate for this chapter:** you can name the type of every value in E.4's response and explain what `JSON.parse` returning `any` costs you. [Chapter 2.3](03-variables-and-constants.md) starts naming these values, and the naming decisions only make sense once the types do.

---

[← 2.1 Thinking Like a Programmer](01-thinking-like-a-programmer.md) · [Next: 2.3 Variables and Constants →](03-variables-and-constants.md)
