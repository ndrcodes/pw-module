# Chapter 2.13 — JSON

🟢 **Beginner** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [2.9](09-objects.md), [2.10](10-typescript-fundamentals.md), [2.11](11-error-handling.md) |
| **Next chapter** | [3.1 Principles of Good Automated Tests](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |

---

> This chapter closes Part II. The idea that must survive: **JSON is text; an object is a runtime value; a type annotation is a claim, not a check.** [Project 2](../projects/project-2-test-case-management.md) is built on that idea.

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Read** and **write** JSON objects, arrays, and nested structures, and **name** the value kinds JSON permits.
2. **Convert** between JSON text and TypeScript values using `JSON.parse()` and `JSON.stringify()`.
3. **Explain** the difference between JSON text and a runtime object, and **identify** bugs caused by confusing them.
4. **Describe** what is lost in a JSON round trip, including dates and `undefined`.
5. **Explain** why `JSON.parse()` returns `any`, and **describe** the risk that creates for typed test code.
6. **Handle** malformed JSON safely, and **access** deeply nested optional fields without crashing.
7. **Validate** parsed data at runtime before treating it as a typed value.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Objects, nesting, optional chaining | [Chapter 2.9](09-objects.md) |
| Interfaces, types, and `any` | [Chapter 2.10](10-typescript-fundamentals.md) |
| `try`/`catch` for parse failures | [Chapter 2.11](11-error-handling.md) |
| Arrays of objects | [Chapter 2.8](08-arrays.md) |

---

## C. Concept Explanation

### C.1 JSON is text

**JSON** (JavaScript Object Notation) is a text format for exchanging structured data. It is the wire format of essentially every API you will test, the usual shape of fixture files, Playwright's JSON reporter output, and the persistence format for [Project 2](../projects/project-2-test-case-management.md).

Its syntax *looks like* a JavaScript object literal. That convenience is also the confusion this chapter exists to remove:

```ts
const text = '{"status":"passed"}';   // a string — characters between quotes
const obj  = { status: "passed" };    // an object — a runtime value with a property

text === obj;                         // false, and a type error under strict
typeof text;                          // "string"
typeof obj;                           // "object"
```

`'{"status":"passed"}'` is twenty characters. `{ status: "passed" }` is an object. Comparing one to the other, or asserting on a response body before parsing it, produces the familiar failure: "why is my assertion comparing a string to an object?"

### C.2 The six value kinds

JSON can represent exactly these:

| Kind | Example |
|---|---|
| object | `{ "id": "TC-1" }` |
| array | `[1, 2, 3]` |
| string | `"passed"` |
| number | `1240` |
| boolean | `true` |
| null | `null` |

That is the whole language. There is no date type, no `undefined`, no function, no `NaN`, no `Infinity`, no comments, no trailing commas, and **keys must be double-quoted strings**.

```json
{
  "name": "login valid",
  "status": "passed",
  "durationMs": 820,
  "error": null,
  "tags": ["smoke", "auth"]
}
```

Invalid, even though TypeScript would accept the equivalent object literal:

```text
{ name: 'login', trailing: true, }   // single quotes, unquoted key, trailing comma
```

When you hand-write a fixture and the parse fails, check those three first.

### C.3 What JSON cannot represent

| TypeScript value | After `JSON.stringify` | After `JSON.parse` of that |
|---|---|---|
| `new Date("2026-08-16")` | `"2026-08-16T00:00:00.000Z"` (a string) | still a string, never a `Date` |
| `{ retries: undefined }` | `{}` — the key vanishes | the property is gone |
| `{ fn() {} }` | `{}` | gone |
| `{ n: NaN }` | `{ "n": null }` | `null` |
| `{ n: Infinity }` | `{ "n": null }` | `null` |
| `undefined` as a root value | `undefined` (stringify returns the JS value `undefined`, not the text `"undefined"`) | you have nothing to parse |

A **round trip** is `JSON.parse(JSON.stringify(value))`. It is a deep copy of *JSON-safe* data. It is not an identity function. The [instructor notes](instructor-notes.md) Demo 8 is this table in one snippet:

```ts
const original = { name: "Login", ranAt: new Date(), retries: undefined };
const restored = JSON.parse(JSON.stringify(original));
// restored.ranAt is a string
// "retries" in restored  → false
```

If your domain has timestamps, store **ISO strings** (`createdAt: string`) and parse them into `Date` only at the edges, deliberately. That is why Project 2's model uses `createdAt: string`, not `Date`.

### C.4 `JSON.parse` — text to value, typed `any`

```ts
const text = '{"status":"passed","durationMs":1240}';
const value = JSON.parse(text);
```

`JSON.parse` returns `any`. The compiler will let you write `value.durationMs.toFixed(1)` and `value.noSuchField.explode()` with equal confidence. Neither is checked until runtime.

Malformed text **throws** `SyntaxError`:

```ts
JSON.parse("{ not json");          // throws
JSON.parse("<html>404</html>");    // throws — a common API failure mode
```

Always parse inside `try`/`catch` at a boundary. An HTML error page is not JSON. Treating it as a typed object produces a failure that looks like a product bug two lines later.

### C.5 `JSON.stringify` — value to text

```ts
const obj = { status: "passed", durationMs: 1240 };
JSON.stringify(obj);
// '{"status":"passed","durationMs":1240}'

JSON.stringify(obj, null, 2);      // pretty-print with 2-space indent — fixtures, git diffs
```

The second argument is a **replacer** (array of keys to keep, or a function). You will rarely need it in this course. The third argument is indentation. Use it for files humans will read; omit it for compact wire payloads.

`stringify` does not throw on ordinary objects. It *does* throw on circular references (`a.b = a`). Test data should never be circular.

### C.6 Cast is not a check

```ts
interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
}

const claimed = JSON.parse(text) as TestResult;  // still no check
```

`as TestResult` is a message to the compiler: *trust me*. The network can send `"durationMs": "1240"` (a string), `"status": "PASS"`, or an HTML page that somehow got past a sloppy parse. The annotation will not notice. [Chapter 2.10](10-typescript-fundamentals.md) said this; this chapter is where you **stop claiming and start checking**.

```ts
function isTestStatus(value: unknown): value is TestResult["status"] {
  return value === "passed" || value === "failed" || value === "skipped";
}

function parseTestResult(raw: unknown): TestResult {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("TestResult: expected an object");
  }
  const rec = raw as Record<string, unknown>;
  if (typeof rec.name !== "string" || rec.name.trim() === "") {
    throw new Error(`TestResult.name: required non-empty string (got ${JSON.stringify(rec.name)})`);
  }
  if (!isTestStatus(rec.status)) {
    throw new Error(`TestResult.status: expected passed|failed|skipped (got ${JSON.stringify(rec.status)})`);
  }
  if (typeof rec.durationMs !== "number" || Number.isNaN(rec.durationMs)) {
    throw new Error(`TestResult.durationMs: expected number (got ${JSON.stringify(rec.durationMs)})`);
  }
  return { name: rec.name, status: rec.status, durationMs: rec.durationMs };
}
```

Two habits:

1. Parse to `unknown`, not `any`. (`JSON.parse` is `any`; assign through `unknown` immediately.)
2. Check every field you will use. Return a value the type actually describes.

This is a hand-rolled validator. [Chapter 4.3](../part-4-api-testing-and-automation/03-designing-api-test-cases.md) will argue for schema libraries on real APIs. The *judgment* is the same: **the compiler is not a contract test.**

### C.7 Nested payloads and safe access

```ts
const orderText = `{
  "id": "ORD-9",
  "buyer": { "email": "ada@shop.test" },
  "discount": null,
  "items": [{ "sku": "LAMP", "qty": 2 }]
}`;

const raw: unknown = JSON.parse(orderText);
const order = parseOrder(raw);           // you write parseOrder

order.items[0]?.sku;                     // optional chaining — [Chapter 2.9](09-objects.md)
order.discount?.amount;                  // null stays null; no crash
```

Do not write `order.items[0].sku` against data that crossed a boundary until the validator has proven `items` is a non-empty array of objects with `sku`. After validation, the type can be strict and the access can be direct. **Optional chaining is for data you have not validated yet, or fields the contract marks optional.** After a validator, a missing required field should already have thrown.

### C.8 Loading a file

```ts
import { readFile } from "node:fs/promises";

async function loadResults(path: string): Promise<TestResult[]> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    throw new Error(`Cannot read ${path}: ${messageOf(error)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (error) {
    throw new Error(`Malformed JSON in ${path}: ${messageOf(error)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`${path}: expected an array of test results`);
  }

  return parsed.map((item, index) => {
    try {
      return parseTestResult(item);
    } catch (error) {
      throw new Error(`${path}[${index}]: ${messageOf(error)}`);
    }
  });
}
```

Three failure modes, three messages: missing file, malformed text, well-formed JSON with the wrong shape. Project 2's F10 is this function with a policy choice on "missing file" (start empty) versus "malformed" (do not silently discard).

Never commit a JSON fixture that contains real credentials. [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md) will treat secrets as a framework concern; the habit starts here.

### C.9 Comparing JSON

Two objects with the same keys in different order stringify differently:

```ts
JSON.stringify({ a: 1, b: 2 }) === JSON.stringify({ b: 2, a: 1 });  // false
```

Do not assert equality on raw JSON strings unless you control key order. Compare parsed, validated objects field by field, or use a matcher that ignores key order. Pretty-printed files also differ by trailing newlines and indentation — another reason string equality on fixtures is brittle.

### C.10 Side by side

| | JSON text | TypeScript object |
|---|---|---|
| What it is | Characters | Runtime value |
| Types | Six kinds, no dates | The full type system, erased at compile time |
| Validation | Syntax only (`parse` throws or not) | Compiler checks *your* code, not the wire |
| `undefined` | Does not exist | Exists; dropped on stringify |
| Quotes on keys | Required, double | Optional if the key is a valid identifier |
| Trailing comma | Illegal | Legal |
| Role in tests | Wire, files, reporter output | The values you actually assert on |

---

## D. QA Context

### D.1 Request and response bodies

In [Part IV](../part-4-api-testing-and-automation/00-module-overview.md) you will write:

```ts
const response = await request.post("/orders", { data: body });
const json = await response.json();
```

`data: body` is stringify'd for you. `response.json()` is parse. The result is still unvalidated. Casting it to `Order` is the C.6 bug with a Playwright logo on it. Validate, then assert.

### D.2 Dates that look equal and are not

```ts
expect(order.createdAt).toBe(new Date("2026-08-16"));  // string vs Date — never equal
expect(order.createdAt).toBe("2026-08-16T00:00:00.000Z"); // maybe, if the server uses that exact string
```

The field arrived as a string. Compare strings, or parse both sides to instants on purpose. Naive `Date` equality is a flake waiting for a timezone.

### D.3 Fixtures, reporter output, `storageState`

| Artifact | JSON role |
|---|---|
| Test-data files | Input you must validate ([Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md)) |
| Playwright JSON reporter | Input to a flake-tracking script ([Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md)) — Project 1's shape, from a file |
| `storageState` | Cookies and localStorage as a JSON file ([Chapter 6.3](../part-6-framework-engineering/03-authentication-strategies.md)) |
| API mocks | Bodies you stringify; if you hand-write them, trailing commas will waste an hour |

### D.4 Persistence is a contract with your future self

Project 2 saves a library to disk and reads it back. A round trip that drops `undefined` steps, stringifies dates, or trusts `as TestCase[]` will corrupt the library on the next launch. **The loader is the product.** Features that mutate in memory and never survive restart are a demo, not an app.

---

## E. Code Examples

### E.1 Very simple — stringify, parse, types

```ts
const result = { name: "login valid", status: "passed" };
const text = JSON.stringify(result);
const back = JSON.parse(text);

console.log(typeof text);          // "string"
console.log(typeof back);          // "object"
console.log(back.name);            // "login valid"
console.log(text === back);        // false
```

Print `text` and `back`. Read them aloud: one is characters, one is a value.

### E.2 Practical — round-trip losses

```ts
const original = {
  name: "Login",
  ranAt: new Date("2026-08-16T00:00:00.000Z"),
  retries: undefined as number | undefined,
  extra: Infinity,
};

const restored: unknown = JSON.parse(JSON.stringify(original));
console.log(restored);
// { name: "Login", ranAt: "2026-08-16T00:00:00.000Z", extra: null }
```

Document three differences before you run it. Then run it. Each miss is a misconception this chapter is for.

### E.3 QA-oriented — load, type, validate

A file `cases.json`:

```json
[
  {
    "id": "TC-0011",
    "title": "Checkout applies free shipping over $100",
    "suite": "checkout",
    "priority": "high",
    "status": "active",
    "automated": true,
    "tags": ["REQ-114"],
    "steps": [{ "order": 1, "action": "Add items totaling $100" }],
    "expectedResult": "Shipping is $0",
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-10T08:00:00.000Z"
  }
]
```

Load it with C.8's shape. Reject a record whose `priority` is `"HIGH"` or whose `steps` is missing. Do not "fix" it silently — [Chapter 2.11](11-error-handling.md) fail-fast.

### E.4 Automation-oriented — nested order, optional discount

```ts
interface OrderItem { sku: string; qty: number }
interface Order {
  id: string;
  items: OrderItem[];
  discount: { code: string; amount: number } | null;
}

function parseOrder(raw: unknown): Order {
  // checks omitted here — you write them in G.3 / H
  // after validation:
  return raw as Order; // only legal *inside* the function, after every field was checked
}

const order = parseOrder(JSON.parse(text) as unknown);
const firstSku = order.items[0]?.sku;
const amount = order.discount?.amount ?? 0;
```

Assert on `amount`, not on `JSON.stringify(order)`. Key order is not part of the contract.

---

## F. Common Mistakes

### F.1 Asserting on a body before parsing

`expect(response).toEqual({ id: "ORD-9" })` against a Response object, or against the raw text. Parse, validate, then assert.

### F.2 `as` after parse

Looks typed. Checks nothing. See C.6. This is the defect Project 2 graders look for (T6).

### F.3 Trailing commas or single quotes in fixtures

Valid TypeScript. Invalid JSON. The parse error points at a character; read it.

### F.4 Expecting a `Date` to survive a round trip

It becomes a string. Store ISO strings in files and models that persist.

### F.5 Reading vanished `undefined` as "the server deleted my field"

You stringified. The key was never in the text.

### F.6 Parsing without `try`/`catch`

An HTML 500 page crashes your loader in `JSON.parse`. Catch at the boundary; name the path.

### F.7 Deep access without a check

`parsed.buyer.address.zip` on a 401 body. Optional chaining or — better — validate first.

### F.8 Secrets in committed JSON

Tokens, passwords, real emails. Use placeholders. Rotate anything that was ever committed.

### F.9 String-equality on JSON text

Key order, whitespace, and Unicode escaping will flake the assertion. Compare objects.

### F.10 `JSON.parse` into `any`, then arithmetic

`"1240" + 10` becomes `"124010"` if the field was a string. Validate `typeof === "number"`.

---

## G. Exercise

Suggested total time: 110 minutes.

### G.1 Easy — Fix five documents (25 min)

Each of these should parse and print `id` (or the nested field named in the comment). Fix the JSON, not the TypeScript.

```text
1. { id: "ORD-1", total: 10 }
2. { "id": "ORD-2", "total": 10, }
3. { 'id': "ORD-3", "total": 10 }
4. { "id": "ORD-4", "total": 10, "note": undefined }
5. { "id": "ORD-5" "total": 10 }
```

For (4), `undefined` is not JSON — use `null` or omit the key. Write one sentence: which of those two choices means "the field is present and empty" versus "the field is absent"?

### G.2 Medium — Round-trip audit (35 min)

Build an object that contains a `Date`, an `undefined` property, a nested array, `NaN`, and a method. Round-trip it. In a table, every difference: field, before, after, *why* (cite C.3).

Then answer: if this object were a Project 2 test case, which fields would you type as `string` on purpose, and which would you refuse to persist?

### G.3 Challenge — Validating loader (50 min)

Write `loadTestCases(text: string): TestCase[]` that:

1. Parses inside `try`/`catch`; malformed JSON becomes a diagnosable error (not the raw `SyntaxError` alone — include that it was JSON).
2. Requires an array.
3. Validates each element: `id` string, `title` non-empty string, `priority` one of the four literals, `steps` a non-empty array.
4. Collects **every** problem (record index + field + rule), then throws **one** error listing all of them — do not stop at the first bad record.
5. Returns `TestCase[]` on success. No `any`. No `as TestCase` except after the field checks, inside the parser.

Feed it: valid array; `{}`; `"not json"`; array with one good and one bad record; array with two bad records. The two-bad case must mention both.

This is Assignment 2.13's core, without the file I/O.

---

## H. Coding Assignment

### Assignment 2.13 — Validated JSON test-data loader

**Objective.** Read a JSON file of test cases, parse it safely, validate every required field and value type at runtime, report every problem found (not just the first), and return a typed collection. Explain in writing why a type annotation alone was insufficient.

This loader is reused in [Project 2](../projects/project-2-test-case-management.md). Write it so you can copy the module.

**Deliverable.** `assignment-2-13/load-test-cases.ts`, `types.ts`, `demo.ts`, `NOTES.md`, plus at least three fixture files: `valid.json`, `malformed.json`, `invalid-shape.json`.

```ts
export interface LoadIssue {
  index: number | null;    // null = document-level (not an array, malformed, etc.)
  field: string;
  rule: string;
  actual: unknown;
}

export class TestDataError extends Error {
  readonly issues: LoadIssue[];
  constructor(path: string, issues: LoadIssue[]);
}

export function parseTestCases(text: string, path: string): TestCase[];
export function loadTestCasesFile(path: string): Promise<TestCase[]>;
```

Use the Project 2 `TestCase` / `TestStep` fields ([project brief §3.3](../projects/project-2-test-case-management.md#33-data-model)). Validation rules from §3.4 that apply to **loaded** data: title, suite, priority, status, steps (at least one, `order` sequential from 1), expectedResult (non-empty, not vague). `id` must be a non-empty string (generation is Project 2's job; the loader checks presence).

`loadTestCasesFile`: missing file → `TestDataError` with a clear issue (do not start empty here — that policy is Project 2's). Malformed JSON → issue naming `path`. Invalid shape → all issues, one throw.

`demo.ts` loads each fixture and prints either the count of cases or the `issues` list. It must not crash the process uncaught — catch `TestDataError` and print `issues`.

**Requirements.**

| # | Requirement |
|---|---|
| 1 | `JSON.parse` result typed `unknown`, never left as `any` |
| 2 | No `as TestCase` / `as TestCase[]` without preceding field checks |
| 3 | All issues collected; two bad records → two issues minimum |
| 4 | Diagnosable: `field`, `rule`, `actual` on every issue |
| 5 | `NOTES.md`: why `as TestCase[]` after parse is insufficient — one concrete counterexample from your fixtures |
| 6 | `tsc --noEmit` clean; `strict` |
| 7 | Fixtures contain no secrets |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Runtime validation | 30% | Every required field and union checked; cast-only solutions score 0 here |
| Error reporting | 25% | Batch issues; `TestDataError`; path in the message |
| Types | 20% | `unknown` at the boundary; Project 2-compatible interfaces |
| NOTES.md | 15% | Counterexample, not a slogan |
| Fixtures and demo | 10% | Three files; demo prints issues without an uncaught throw |

> **AI usage: restricted.** The validator is the point. An AI-generated `as TestCase[]` with a comment "validated" fails the assignment.

---

## I. Quiz

Nine questions. Answer key: [`answer-keys/part-2/13-json.answers.md`](../answer-keys/part-2/13-json.answers.md).

**1.** Which of the following is valid JSON?

- A) `{ name: "login" }`
- B) `{ "name": "login", }`
- C) `{ "name": "login" }`
- D) `{ 'name': "login" }`

**2.** After `const restored = JSON.parse(JSON.stringify({ ranAt: new Date(), retries: undefined }))`, what is true?

- A) `restored.ranAt` is a `Date` and `retries` is `undefined`
- B) `ranAt` is a string and `retries` is missing
- C) Both fields are `null`
- D) `stringify` throws

**3.** True or false: `'{"id":1}'` and `{ id: 1 }` are the same value.

**4.** `JSON.parse(text) as TestResult` means:

- A) The text was checked against the `TestResult` shape at runtime
- B) The compiler is told to trust you; nothing was checked
- C) Invalid JSON becomes `null`
- D) TypeScript will reject extra fields in the JSON

**5.** An API returns an HTML 500 page. `await response.json()` (or `JSON.parse` of the body) typically:

- A) Returns `{ status: 500 }`
- B) Throws (malformed JSON)
- C) Returns `null`
- D) Returns the HTML as an object

**6.** Why is `JSON.parse` typed `any`?

- A) JSON is untyped at runtime; the compiler cannot know the shape
- B) A historical accident; it actually returns `TestResult`
- C) Because JSON cannot contain numbers
- D) So that `await` works

**7.** Two objects have the same keys and values in different key order. Their `JSON.stringify` results:

- A) Always compare equal
- B) May compare unequal because key order is preserved in the string
- C) Are both `undefined`
- D) Throw

**8.** Project 2 stores `createdAt` as a `string`. Why?

- A) TypeScript cannot represent dates
- B) JSON has no date type; ISO strings round-trip
- C) Strings compare faster
- D) Playwright requires it

**9.** You need a nested optional discount amount from a parsed payload you have **not** validated. Safest access:

- A) `payload.discount.amount`
- B) `payload.discount?.amount`
- C) `(payload as any).discount.amount`
- D) `JSON.stringify(payload.discount.amount)`

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| JSON | Text in six value kinds |
| Object | A runtime value |
| `parse` / `stringify` | Text ⇄ value; both are lossy at the edges |
| Round trip | Drops `undefined`/functions; dates become strings; `NaN`/`Infinity` become `null` |
| `parse` returns `any` | The compiler stops here |
| `as` | A claim, not a check |
| Validator | `unknown` in, typed value or diagnosable error out |
| File loader | Three failures: missing, malformed, wrong shape |

### Mistakes recap

Body before parse · `as` after parse · fixture syntax · Date round-trip · vanished `undefined` · no `try`/`catch` · deep access · secrets in git · string equality on JSON · arithmetic on `any`.

### Competency check

> **Given a JSON response and a TypeScript interface, can you say what the compiler guarantees and what it does not?**

The compiler guarantees that *your code* treats the value as that shape. It does not guarantee that the bytes on the wire match. That sentence is the whole chapter.

### Part II gate

Before [Part III](../part-3-automation-fundamentals/00-module-overview.md), from a blank file, without notes:

> Write a typed function that takes an array of test results and returns totals, pass rate, and failed test names, using `filter` and `reduce`, correct on an empty array.

Then add: parse that array from a JSON string with a validator, not a cast.

If either task still feels like guessing, redo [2.8](08-arrays.md), [2.10](10-typescript-fundamentals.md), and this chapter's G.3.

**Project 2** — [Mini Test Case Management App](../projects/project-2-test-case-management.md) — is the Part II exam that ships. Build the loader from Assignment 2.13 first.

---

[← 2.12 Asynchronous Programming](12-asynchronous-programming.md) · [Next: Part III — 3.1 Principles of Good Automated Tests →](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md)
