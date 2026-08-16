# Chapter 2.11 — Error Handling

🟡 **Intermediate** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [2.7](07-functions.md), [2.9](09-objects.md), [2.10](10-typescript-fundamentals.md) |
| **Next chapter** | [2.12 Asynchronous Programming](12-asynchronous-programming.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Distinguish** an error, an exception, and a test failure, and **use** the terms precisely.
2. **Throw** errors deliberately and **catch** them with `try`/`catch`/`finally`.
3. **Write** error messages that let a reader diagnose the problem without rerunning anything.
4. **Define** and **use** custom error classes, and **explain** when they add diagnostic value.
5. **Explain** why swallowing an error in test code produces a false pass, and **identify** it in review.
6. **Contrast** assertions with exceptions, and **decide** which mechanism a given situation calls for.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Functions, return values, and scope | [Chapter 2.7](07-functions.md) |
| Objects and optional data | [Chapter 2.9](09-objects.md) |
| Types, unions, and narrowing | [Chapter 2.10](10-typescript-fundamentals.md) |

---

## C. Concept Explanation

### C.1 Fail loudly

An **error** is a value describing something that went wrong. **Throwing** it interrupts normal execution and hands control to whoever is prepared to catch it.

In application code the usual goal is to recover. **In test code the usual goal is the opposite: fail loudly and informatively.** The instinct beginners import from tutorials — wrap risky work in `try`/`catch` so nothing crashes — is how a broken system produces a green suite. A `catch` that logs and continues has converted a real defect into silence.

That inversion is the whole chapter.

### C.2 Vocabulary

| Term | Meaning here |
|---|---|
| **Error** (the object) | A value, usually `Error` or a subclass, with `name`, `message`, `stack` |
| **Exception** | The event of throwing; control leaves the current function |
| **Test failure / assertion failure** | The system under test produced a wrong result; the test framework records a fail |
| **Defect** | The flaw in the product (from [Chapter 1.1](../part-1-testing-fundamentals/01-what-is-software-testing.md)) |

An exception means *this code could not continue* — file missing, network down, data invalid. An assertion means *this code continued and the answer was wrong* — status 500 when 201 was expected. Both can end a test. They mean different things in triage.

### C.3 The `Error` object

```ts
const err = new Error("POST /orders returned 500 for user qa-user-8842");
console.log(err.name);     // "Error"
console.log(err.message);  // the string you passed
console.log(err.stack);    // call stack — where it was created
```

**Throw `Error` objects, not strings.** `throw "failed"` has no stack. `throw new Error("failed")` does.

### C.4 `throw` and the call stack

```ts
function parseStatus(raw: string): TestStatus {
  if (raw !== "passed" && raw !== "failed") {
    throw new Error(`Unknown status ${JSON.stringify(raw)}`);
  }
  return raw;
}

function classify(raw: string): string {
  const status = parseStatus(raw);  // throw leaves classify too
  return status;
}
```

An uncaught throw ends the program (or the test). That is correct when the operation was essential.

### C.5 `try` / `catch` / `finally`

```ts
try {
  const status = parseStatus(input);
  console.log(status);
} catch (error) {
  console.log("could not parse");
} finally {
  console.log("always runs");
}
```

`finally` runs whether the `try` succeeded, threw, or returned. Use it for cleanup that must happen in *this* function. In Playwright tests, cleanup belongs in **fixture teardown** ([Chapter 6.2](../part-6-framework-engineering/02-fixtures.md)), not in a `finally` inside the test body — testers forget the `finally` on the next assertion they add.

### C.6 Catch `unknown`, narrow, rethrow

Under `strict`, `catch (error)` types `error` as `unknown`. You must narrow it.

```ts
function messageOf(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
```

Catch **selectively**. If you only know how to handle a validation error, rethrow everything else:

```ts
try {
  validate(record);
} catch (error) {
  if (error instanceof MissingFieldError) {
    return { ok: false, reason: error.message };
  }
  throw error;
}
```

Swallowing a `RangeError` because you were catching `MissingFieldError` with a bare `catch` is how environment failures look like bad data.

### C.7 Diagnosable messages

A message is an interface. The reader is often a colleague in CI, without your terminal history.

```ts
// Useless
throw new Error("Request failed");
throw new Error("invalid");
throw new Error("Error occurred");

// Diagnosable
throw new Error(
  `POST /api/orders returned 500 for user qa-user-8842 with payload { itemCount: 3 }`,
);
throw new Error(
  `TestCase TC-0043: field "priority" must be critical|high|medium|low, got "urgent"`,
);
```

A diagnosable message names **the operation, the input, and the expectation or actual**. After [Chapter 2.12](12-asynchronous-programming.md), it also names the resource you were waiting on.

If a colleague cannot act on the message without rerunning, the message is not done.

### C.8 Custom error classes

```ts
class MissingFieldError extends Error {
  constructor(public readonly field: string) {
    super(`Missing required field "${field}"`);
    this.name = "MissingFieldError";
  }
}

class InvalidStatusError extends Error {
  constructor(public readonly value: string) {
    super(`Unknown status ${JSON.stringify(value)}`);
    this.name = "InvalidStatusError";
  }
}
```

Worth defining when **callers need to distinguish causes**: retry a network error, do not retry a validation error; report all validation errors in a batch; fail the test on assertion, fail the *setup* on missing data.

Not worth defining for a single `throw` you never catch by type. A good message on `Error` is enough.

[Project 2](../projects/project-2-test-case-management.md) requires custom errors for validation and not-found. This chapter is where you learn why.

### C.9 Swallowed errors are false passes

```ts
test("creates an order", async () => {
  try {
    const order = await createOrder(payload);
    expect(order.id).toMatch(/^ORD-/);
  } catch {
    // "don't crash the suite"
  }
});
```

If `createOrder` throws (500, timeout, bad JSON), the `catch` eats it. The test is **green**. The system is broken. This is the most expensive kind of silence in the course — [Chapter 1.2](../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) called it negative value.

**Never wrap an assertion in `try`/`catch`.** Playwright's `expect` throws on failure. Catching that throw is how you delete the verdict.

Graders check for this. [Project 3](../projects/project-3-api-automation.md) and [Project 4](../projects/project-4-web-automation.md) deduct for it.

### C.10 Assertions versus exceptions

| Situation | Mechanism |
|---|---|
| The product returned the wrong status | **Assertion** — `expect(status).toBe(201)` |
| The environment is unreachable | **Exception** — throw; the test errors (not "fails the assertion") |
| Test data is missing a required field | **Exception** (validation) — do not send garbage to the API |
| You want to try the next ID in a list | Return a result object; do not throw for a normal miss if you will recover |

Frameworks often display "failed" vs "error" / "broken" differently. Failed = verdict about the product. Error = the test could not finish. Mixing them makes the report lie about *what kind of problem you have*.

### C.11 Fail fast in tests

Defensive programming in an app: keep going, show a fallback. Defensive programming in a test: **stop**. A test that continues after a failed setup produces assertions about the wrong world — or worse, passes them.

```ts
const user = await createUser();
if (!user.id) {
  throw new Error("createUser returned no id — cannot continue checkout");
}
await checkout(user.id);
```

Do not invent a default id and proceed. That is how you test checkout for a user that does not exist and call it coverage.

---

## D. QA Context

### D.1 `try`/`catch` around `expect` is a defect

Covered in C.9. It will appear in code review ([Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md)) as an automatic comment.

### D.2 CI reads your messages

The HTML report and Jenkins console ([Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md)) show `error.message`. That string is the entire briefing for someone who did not write the test. Write it for them.

### D.3 API clients: "said no" versus "unreachable"

```ts
class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    public readonly body: string,
  ) {
    super(`HTTP ${status} from ${url}: ${body.slice(0, 200)}`);
    this.name = "HttpError";
  }
}

class NetworkError extends Error {
  constructor(url: string, cause: unknown) {
    super(`Unreachable ${url}: ${messageOf(cause)}`);
    this.name = "NetworkError";
  }
}
```

A 422 is a product verdict (often an assertion). ECONNREFUSED is infrastructure. [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md) uses this split so tests can assert on 422 and fail the run on network.

### D.4 Factories throw; they do not silently fix

A factory that receives `priority: "urgent"` should throw `InvalidStatusError`, not coerce to `"high"`. Coercion hides the caller's bug and makes two tests disagree about what they created.

### D.5 Cleanup is teardown, not `finally` in the test

`finally` in a test body is easy to get wrong when you add a second assertion. Fixtures run teardown even when the test throws. Prefer them once they exist. Until then, `finally` is acceptable if it is the only cleanup and it is obvious.

---

## E. Code Examples

### E.1 Very simple — throw and catch

```ts
try {
  throw new Error("sandbox down");
} catch (error) {
  console.log(error instanceof Error ? error.message : error);
}
```

### E.2 Practical — two messages

```ts
throw new Error("failed");
throw new Error(
  `GET /cart/88 returned 404; expected an existing cart for user qa-buyer-04`,
);
```

The first costs a rerun. The second often does not.

### E.3 QA-oriented — validator with a custom error

```ts
class TestDataError extends Error {
  constructor(
    public readonly field: string,
    public readonly rule: string,
    public readonly actual: unknown,
  ) {
    super(`Invalid ${field}: ${rule} (got ${JSON.stringify(actual)})`);
    this.name = "TestDataError";
  }
}

function requireTitle(title: unknown): string {
  if (typeof title !== "string" || title.trim().length < 5) {
    throw new TestDataError("title", "string of at least 5 characters", title);
  }
  return title.trim();
}
```

### E.4 Automation-oriented — swallowed vs loud

```ts
// False green
async function badTest(): Promise<void> {
  try {
    const res = await fetchOrder("ORD-1");
    if (res.status !== 200) {
      throw new Error("bad status");
    }
  } catch {
    /* ignore */
  }
}

// Loud
async function goodTest(): Promise<void> {
  const res = await fetchOrder("ORD-1");
  if (res.status !== 200) {
    throw new Error(
      `GET /orders/ORD-1 returned ${res.status}, expected 200`,
    );
  }
}
```

In Playwright you would use `expect(res.status()).toBe(200)` and you would still not catch it.

---

## F. Common Mistakes

### F.1 `try`/`catch` around an assertion

Converts fail into pass. Delete the `try`.

### F.2 Empty `catch {}`

Same, with less honesty.

### F.3 Log and continue when the operation was essential

A logged error that the test ignores is a green test.

### F.4 Messages with no context

`"invalid"`, `"failed"`, `"error occurred"`.

### F.5 `throw "string"`

No stack.

### F.6 Catch-all when you meant one type

Catch `MissingFieldError`, rethrow the rest.

### F.7 Exceptions for ordinary control flow

A loop of "try this id, catch not-found, try the next" is a `find`. Throw when you cannot continue.

### F.8 `finally` cleanup that should be a fixture

Works until the test grows.

### F.9 Treating unreachable and wrong-response as the same

One is infrastructure. One is a product verdict. Different errors, different triage.

---

## G. Exercise

Suggested total time: 100 minutes.

### G.1 Easy — Three invalid inputs (20 min)

Write `parsePriority(raw: string): Priority` that throws `Error` for anything not in the union. Call it with `"high"`, `"HIGH"`, `"urgent"`. Print `name` and `message` for each catch. Then decide: should `"HIGH"` be accepted (normalized) or rejected? Document the decision in a comment — either is fine if consistent.

### G.2 Medium — Rewrite six messages (30 min)

Rewrite each so it names operation, input, and expectation:

1. `"failed"`
2. `"invalid input"`
3. `"timeout"`
4. `"not found"`
5. `"assertion error"`
6. `"cannot read property"`

Then pick one and write the *worse* version you have seen in a real log (or invent a realistic one). What information was missing?

### G.3 Challenge — Four swallowed errors (50 min)

A module (write it) has four `catch` blocks that hide: a missing file, a `JSON.parse` failure, a thrown validation error, and an assertion-like check (`if (status !== 200) throw`). Make each failure visible **without changing the success-path return values**. For each `catch`, write one sentence: what bug was hidden, and what a caller sees now.

Do not leave a catch-all. Selective catch + rethrow is allowed.

---

## H. Coding Assignment

### Assignment 2.11 — Test data validator

**Objective.** Validate test-data records with typed custom errors and diagnosable messages. Report **every** problem in a batch, not only the first. Write a note on which errors must not be caught.

**Deliverable.** `assignment-2-11/validate.ts`, `demo.ts`, and `NOTES.md`.

```ts
export class MissingFieldError extends Error { /* field */ }
export class InvalidStatusError extends Error { /* field, actual */ }
export class OutOfRangeError extends Error { /* field, min, max, actual */ }

export interface RawCase {
  id?: unknown;
  title?: unknown;
  priority?: unknown;
  steps?: unknown;
}

export function validateCase(raw: RawCase): void  // throws on first problem

export function validateBatch(raws: RawCase[]): {
  ok: RawCase[];
  errors: { index: number; message: string; name: string }[];
}
```

**Rules for a valid case.**

| Field | Rule |
|---|---|
| `id` | required string matching `/^TC-\d{4}$/` |
| `title` | required string, trimmed length 5–120 |
| `priority` | `"critical" \| "high" \| "medium" \| "low"` |
| `steps` | array of length ≥ 1 |

Use `MissingFieldError` when the field is absent or `undefined`. Use `InvalidStatusError` for bad `priority` or bad `id` shape. Use `OutOfRangeError` for title length and empty `steps` (min 1, max ignored or 50).

`validateBatch` catches **only** those three classes, records them, continues. Any other throw leaves the batch (rethrow).

**Fixtures in `demo.ts`:** one valid; missing title; `priority: "urgent"`; `title: "ab"`; `steps: []`; `id: 12` (wrong type — treat as invalid status or missing, documented).

**`NOTES.md` (half a page):** which errors this validator should *not* catch if it called a file loader or HTTP client, and why.

**Requirements.**

| # | Requirement |
|---|---|
| 1 | Custom classes set `this.name` |
| 2 | Every message includes field and rule |
| 3 | Batch reports all validation failures |
| 4 | Batch rethrows unknown errors (prove with a stub that throws `Error("disk")`) |
| 5 | No empty `catch` |
| 6 | `tsc --noEmit` clean; no `any` |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Message quality | 25% | Field + rule + actual; CI-readable |
| Custom types | 20% | Three classes; selective catch |
| Batch vs fail-fast | 20% | `validateCase` first-error; batch collects |
| Rethrow discipline | 20% | Unknown errors not swallowed; proven |
| Notes | 15% | Clear on network/IO vs validation |

> **AI usage: restricted.** Do not generate the error classes or `NOTES.md`.

---

## I. Quiz

Nine questions. Answer key: [`answer-keys/part-2/11-error-handling.answers.md`](../answer-keys/part-2/11-error-handling.answers.md).

**1.** A test wraps `expect(status).toBe(201)` in `try/catch {}`. The API returns 500. What does the test report?

- A) Failed
- B) Passed (the assertion throw was swallowed)
- C) Skipped
- D) A compile error

**2.** True or false: in test code, the default should be to catch errors so the suite does not crash.

**3.** Which message is diagnosable?

- A) `Error: failed`
- B) `Error: invalid`
- C) `Error: POST /orders returned 422; field "email" is required; payload email=""`
- D) `Error: Error`

**4.** `finally` runs:

- A) Only on success
- B) Only on throw
- C) On success, throw, and return from `try`
- D) Never if you `catch`

**5.** Why narrow `catch (error: unknown)`?

- A) It is optional style
- B) `error` is `unknown`; `.message` is not safe until `instanceof Error`
- C) All catches are strings
- D) TypeScript forbids `Error`

**6.** When is a custom error class worth it?

- A) Always
- B) When callers must distinguish causes (retry vs report vs fail)
- C) Never — messages are enough
- D) Only in Playwright

**7.** `throw "sandbox down"` is worse than `throw new Error("sandbox down")` because:

- A) Strings are slower
- B) You lose the stack trace
- C) TypeScript cannot compile strings
- D) It is a syntax error

**8.** createUser returns no `id`. What should the checkout test do?

- A) Use `"user-1"` and continue
- B) Throw — fail fast; do not assert checkout on a missing user
- C) Catch and pass
- D) Skip checkout silently

**9.** HTTP 422 vs ECONNREFUSED — best pairing?

- A) Both assertions
- B) 422 often an assertion about the product; ECONNREFUSED an exception about the environment
- C) Both should be swallowed
- D) Both are `any`

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Fail loud | Tests must not convert defects into silence |
| Error vs assertion | Could not continue vs continued and was wrong |
| Diagnosable message | Operation, input, expectation — no rerun needed |
| Custom class | When the *type* of failure changes the response |
| `unknown` in `catch` | Narrow before you read |
| Rethrow | Catch what you can handle; throw the rest |
| No catch around `expect` | That catch is a false pass |

### Mistakes recap

Empty `catch` · catch around assertions · `"failed"` messages · throw strings · catch-all · proceed after failed setup.

### Competency check

> **Given a failure message from your own code, could a colleague diagnose the problem without rerunning it?**

Rewrite G.2's six lines from memory. If any still says only `"invalid"`, you are not done.

**Gate:** you are ready for [Chapter 2.12](12-asynchronous-programming.md) when you treat a swallowed error as a failed test, not as politeness.

---

[← 2.10 TypeScript Fundamentals](10-typescript-fundamentals.md) · [Next: 2.12 Asynchronous Programming →](12-asynchronous-programming.md)
