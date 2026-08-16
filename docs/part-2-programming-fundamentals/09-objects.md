# Chapter 2.9 — Objects

🟡 **Intermediate** · [Part II Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | II — Programming Fundamentals |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [2.7](07-functions.md), [2.8](08-arrays.md) |
| **Next chapter** | [2.10 TypeScript Fundamentals](10-typescript-fundamentals.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Create** objects with properties and **access** them using dot and bracket notation.
2. **Model** nested data, and **read** deeply nested values safely using optional chaining.
3. **Work** with arrays of objects — the dominant QA data structure — combining them with array methods.
4. **Destructure** objects and arrays, including renaming and default values.
5. **Define** object methods and **explain** what `this` refers to inside them.
6. **Handle** optional properties, and **distinguish** an absent property from one set to `null`.
7. **Copy** objects safely, and **explain** the difference between a shallow and a deep copy.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Objects as a value type | [Chapter 2.2](02-data-types.md) |
| Functions and callbacks | [Chapter 2.7](07-functions.md) |
| Array methods, especially `filter`, `map`, `find`, `reduce` | [Chapter 2.8](08-arrays.md) |

---

## C. Concept Explanation

### C.1 A labeled record

An object is a labeled record: named properties describing one thing. An array answers "how many, and in what order." An object answers "what are the parts of this one item."

A single test result is an object — name, status, duration, maybe an error and a retry count. Combine the two structures and you get the shape that dominates automation work: **an array of objects.** Nearly every question in this course is a question about an array of objects, which is why [Chapter 2.8](08-arrays.md) and this chapter are inseparable.

```ts
const result = {
  name: "login valid",
  status: "passed",
  durationMs: 820,
};
```

The names on the left are **keys**. The values on the right can be any type, including other objects and arrays.

### C.2 Dot versus bracket access

```ts
console.log(result.name);          // "login valid"
console.log(result["status"]);     // "passed"
```

Dot access is the default. Bracket access is required when the key is in a variable, or is not a valid identifier:

```ts
const field = "durationMs";
console.log(result[field]);        // 820

const headers: Record<string, string> = { "content-type": "application/json" };
console.log(headers["content-type"]);
```

A missing key is `undefined`, not a crash:

```ts
console.log(result.errorMessage);  // undefined
```

The crash comes from the *next* step: reading a property of that `undefined`.

### C.3 Adding, updating, removing

```ts
result.retries = 1;                // add
result.status = "failed";          // update
delete result.retries;             // remove — rarely the right tool
```

Prefer setting a property to `undefined` or omitting it when you build a new object. `delete` is legal and surprising in reviews.

Updating one field without losing the rest:

```ts
const updated = { ...result, status: "failed" };
```

The spread copies enumerable own properties, then `status` overwrites. This is the factory-override pattern from [Chapter 2.7](07-functions.md), now at the object level.

### C.4 Nested objects — and the first real crash

```ts
const failed = {
  name: "checkout card",
  status: "failed",
  error: {
    message: "Expected 201, got 500",
    field: "status",
  },
};

console.log(failed.error.message);   // works
```

A passing result often has no `error` at all:

```ts
const passed = { name: "login valid", status: "passed" };
console.log(passed.error.message);
// TypeError: Cannot read properties of undefined (reading 'message')
```

This is not hypothetical. API responses omit fields constantly. A cart without a discount has no `discount` object. A user without a middle name has no `middleName`. Unguarded nested access is the most common runtime crash in beginner automation code.

### C.5 Optional chaining and nullish coalescing

```ts
console.log(passed.error?.message);           // undefined — no crash
console.log(passed.error?.message ?? "none"); // "none"
```

`?.` stops the chain if the value before it is `null` or `undefined`, and yields `undefined`. `??` supplies a default only for `null`/`undefined`, not for `0` or `""` — the distinction [Chapter 2.4](04-operators.md) already taught.

**Optional chaining is a read tool, not a policy.** If a field is *required* and missing, `?.` hides the defect. Use it when absence is allowed. When absence is a bug, let it throw — or, better, validate and throw a diagnosable error ([Chapter 2.11](11-error-handling.md)).

```ts
// Required field — do not hide a missing order number
const orderId = response.order.id;          // crash is correct if id is gone

// Optional field — absence is normal
const code = response.discount?.code ?? null;
```

### C.6 Arrays of objects

```ts
const results = [
  { name: "login", status: "passed", durationMs: 800 },
  { name: "checkout", status: "failed", durationMs: 2400, error: { message: "500" } },
  { name: "search", status: "skipped", durationMs: 0 },
];

const failedNames = results
  .filter((r) => r.status === "failed")
  .map((r) => r.name);

const firstError = results.find((r) => r.error)?.error?.message;
```

This is the daily data structure. `filter`/`map`/`find` from [Chapter 2.8](08-arrays.md) become useful the moment the items have named fields.

### C.7 Destructuring

```ts
const { name, status } = result;
const { name: testName, durationMs: ms = 0 } = result;
```

Rename with `name: testName`. Default with `= 0` (applied when the value is `undefined`).

Nested:

```ts
const { error: { message } = { message: "none" } } = failed;
```

That last form is legal and often less readable than `failed.error?.message ?? "none"`. Destructure when you will use three or more fields. Otherwise, read them.

In a function parameter — the form you will use constantly:

```ts
function format({ name, status }: { name: string; status: string }): string {
  return `${name}: ${status}`;
}
```

Array destructuring is the same idea for positions:

```ts
const [first, second] = failedNames;
const [slowest] = [...results].sort((a, b) => b.durationMs - a.durationMs);
```

### C.8 Methods and `this` — kept small

A method is a function stored on an object. `this` inside it refers to the object it was called on — **if it was called as a method**.

```ts
const counter = {
  count: 0,
  increment() {
    this.count += 1;
    return this.count;
  },
};

counter.increment();   // 1
```

```ts
const inc = counter.increment;
inc();                 // this is undefined (strict) — crash
```

Pulling a method off its object loses `this`. Arrow functions capture `this` from the surrounding scope and do not bind to the caller — which is why they are the wrong choice for methods that need `this`, and the right choice for callbacks.

You do not need a deep `this` model yet. You need one rule: **if you pass a method as a callback, bind it or wrap it.** Page objects in [Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md) are objects with methods; they work because you call `cartPage.addItem()`, not because you pass `cartPage.addItem` into `forEach`.

### C.9 Absent versus `null`

| What you see | Meaning in this course |
|---|---|
| Property missing | Never set. The producer did not mention it. |
| `undefined` | Same as missing after a read, or explicitly set to "no value assigned." |
| `null` | **Deliberately empty.** The producer considered the field and said "none." |

```ts
const guest = { name: "buyer", email: "buyer@shop.test" };
const deleted = { name: "buyer", email: null };

console.log(guest.email);     // undefined — field omitted
console.log(deleted.email);   // null — field present, empty on purpose
```

An API that omits `discount` on an undiscounted order is different from one that sends `"discount": null`. Your code should distinguish them when the distinction is in the contract. `== null` matches both, which is why it is the one allowed loose equality — and why it is the wrong tool when you need to know *which* kind of emptiness you have.

```ts
if (!("discount" in order)) {
  // field absent
} else if (order.discount === null) {
  // field present, empty
} else {
  // field present, has a value
}
```

### C.10 References, shallow copies, deep copies

Objects are passed by **reference**. Two variables can point at the same object.

```ts
const original = { name: "login", tags: ["smoke"] };
const alias = original;
alias.name = "checkout";
console.log(original.name);   // "checkout" — same object
```

A **shallow copy** (`{ ...original }` or `Object.assign({}, original)`) copies the top level. Nested objects and arrays are still shared.

```ts
const copy = { ...original };
copy.name = "search";
copy.tags.push("nightly");
console.log(original.name);   // "login" — top-level string was copied
console.log(original.tags);   // ["smoke", "nightly"] — array was shared
```

A **deep copy** duplicates the nested structure. `structuredClone(original)` does this for plain data. `JSON.parse(JSON.stringify(original))` also deep-copies, and loses `Date`, `undefined`, and functions — [Chapter 2.13](13-json.md) will show why.

**Rule for test data:** treat fixtures as read-only. If you need a variant, copy (deeply, if anything is nested) and change the copy. Shared mutation is how Test A’s `tags.push` makes Test B fail only under `--workers=4`.

### C.11 `Object.keys`, `values`, `entries`

```ts
const counts = { passed: 5, failed: 2, skipped: 1 };

Object.keys(counts);     // ["passed", "failed", "skipped"]
Object.values(counts);   // [5, 2, 1]
Object.entries(counts);  // [["passed", 5], ["failed", 2], ["skipped", 1]]
```

Use these when you are iterating a *record* (a lookup by name) rather than a list. A status-count map is a record. A run of results is a list — keep it as an array of objects.

### C.12 Object versus `Map`

| Use | Structure |
|---|---|
| Fixed, known field names (`name`, `status`) | object |
| Dynamic keys you add at runtime (id → result) | `Map` (or `Record<string, T>` if the keys are strings and you want JSON later) |

For this course, objects and `Record<string, number>` cover almost everything. Reach for `Map` when keys are not strings or you need guaranteed insertion order with frequent add/delete. Do not turn a list of results into an object keyed by `"0"`, `"1"` — that is an array wearing a disguise.

---

## D. QA Context

### D.1 API responses are nested objects

```ts
// Preview of Chapter 4.3
const order = await response.json();
expect(order.id).toMatch(/^ORD-/);
expect(order.customer.email).toContain("@");
expect(order.discount?.code ?? null).toBeNull();
expect(order.items.every((item: { quantity: number }) => item.quantity > 0)).toBe(true);
```

You will assert on fields, not on the whole object (objects compare by reference, so `===` is almost never what you want). Optional fields use `?.`. Arrays of line items use [Chapter 2.8](08-arrays.md) methods.

### D.2 Domain entities become typed models

User, product, cart, order — the objects you sketch here become the interfaces of [Chapter 2.10](10-typescript-fundamentals.md) and the request/response models of [Chapter 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md). If you model `price` as a string because the UI shows `"$10.00"`, every calculation later is wrong. Model the *data*, not the display.

### D.3 Factory overrides are shallow spreads

```ts
function buildOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "ORD-1001",
    customer: { email: "buyer@shop.test" },
    items: [{ sku: "LAMP", quantity: 1 }],
    ...overrides,
  };
}

const custom = buildOrder({
  customer: { email: "other@shop.test" },
});
```

`overrides.customer` **replaces** the whole customer object. It does not merge. If you needed to keep other customer fields, you would spread nested: `customer: { ...base.customer, ...overrides.customer }`. [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md) spends a section on this. Notice it now so a factory that "sometimes drops the address" is a shallow-spread bug, not a mystery.

### D.4 Shared mutation under parallel workers

Two tests import `defaultUser`. Test A does `defaultUser.role = "admin"`. Test B expects `buyer`. Under one worker, order happens to save you. Under four, it does not. The object is the fixture; the mutation is the flake. Copy, or build fresh each time.

---

## E. Code Examples

### E.1 Very simple — one result, property by property

```ts
const result = {
  name: "login valid",
  status: "passed",
  durationMs: 820,
};

console.log(result.name);
console.log(result.status);
console.log(result.durationMs);
```

### E.2 Practical — nested access, then made safe

```ts
const passed = { name: "login", status: "passed" };
const failed = {
  name: "checkout",
  status: "failed",
  error: { message: "Expected 201, got 500" },
};

// console.log(passed.error.message); // crash
console.log(passed.error?.message ?? "none");  // "none"
console.log(failed.error?.message ?? "none");  // "Expected 201, got 500"
```

### E.3 QA-oriented — array of results, destructured in a loop

```ts
for (const { name, status, durationMs } of results) {
  console.log(`${name} | ${status} | ${durationMs}ms`);
}

const totalFailedMs = results
  .filter(({ status }) => status === "failed")
  .reduce((acc, { durationMs }) => acc + durationMs, 0);
```

### E.4 Automation-oriented — a realistic order

```ts
const order = {
  id: "ORD-2044",
  customer: { email: "buyer@shop.test", name: { first: "Ada", last: "Rahman" } },
  items: [
    { sku: "LAMP", quantity: 2, unitPrice: 49.5 },
    { sku: "CLIP", quantity: 1, unitPrice: 1.0 },
  ],
  discount: null as { code: string; amount: number } | null,
  shipping: { amount: 0, method: "free" },
};

const itemCount = order.items.reduce((acc, { quantity }) => acc + quantity, 0);
const subtotal = order.items.reduce(
  (acc, { quantity, unitPrice }) => acc + quantity * unitPrice,
  0,
);
const discountAmount = order.discount?.amount ?? 0;
const email = order.customer.email;
const lastName = order.customer.name?.last ?? "(none)";

console.log({ itemCount, subtotal, discountAmount, email, lastName });
```

`discount` is `null` (deliberately empty), not absent. `name.last` uses `?.` because some accounts have no structured name. `email` does not — if it is missing, that is a contract bug and a crash is information.

---

## F. Common Mistakes

### F.1 Unguarded nested access

`result.error.message` on a pass. Use `?.` when optional; validate when required.

### F.2 Optional chaining on required fields

`order.id?.startsWith("ORD")` passing when `id` is missing. The test should have failed. `?.` hid it.

### F.3 Treating absent and `null` as the same

Sometimes they are. When the contract distinguishes them, `== null` erases the distinction.

### F.4 Mutating a shared object

`user.role = "admin"` on a fixture. Copy first.

### F.5 Shallow copy treated as deep

`{ ...order }` then `copy.items.push(...)` mutates `order.items`. `structuredClone` or a nested spread.

### F.6 Replacing a whole nested object when you meant to patch one field

Factory override `{ customer: { email } }` drops `customer.name`. Spread the inner object.

### F.7 Destructuring that is harder than a read

`const { a: { b: { c: d } = {} } = {} } = x` versus `x.a?.b?.c`. Prefer the second.

### F.8 Comparing objects with `===`

`{ a: 1 } === { a: 1 }` is `false`. Compare fields, or compare a serialized form you control.

---

## G. Exercise

Suggested total time: 110 minutes.

### G.1 Easy — Build and update a test case (20 min)

Create a test-case object with `id`, `title`, `suite`, `priority`, and `steps` (an array of `{ order, action }`). Read each field. Add optional `owner`. Update `priority`. Print a one-line summary using destructuring. Do not mutate a second variable that aliases the same object and then claim you have two cases.

### G.2 Medium — Orders per customer (40 min)

Given an array of at least six order objects (`id`, `customerEmail`, `total`, `status`), using array methods and destructuring in callbacks:

1. Total spend per customer (a `Record<string, number>`).
2. The largest order (the object, not just the total).
3. Emails of customers with at least one `unshipped` order.

Do not mutate the input. Prove it by logging the first order's `total` before and after.

### G.3 Challenge — Absent versus null versus present (50 min)

A product response may include `discount`, `stock`, and `rating` in any of three states: absent, `null`, or a value. Write `summarizeProduct(product)` that:

- never throws
- returns `{ discount, stock, rating, missing: string[] }`
- uses `null` in the output for a field that was deliberately `null`
- uses a documented default (`0` for stock, `null` for discount/rating) for absent fields
- lists absent field names in `missing`

Prove it with four fixtures: all present, all null, all absent, mixed. Then write two sentences: when would treating absent and `null` the same hide a contract bug?

---

## H. Coding Assignment

### Assignment 2.9 — QA domain models

**Objective.** Model test cases, runs, users, and products as objects, then answer questions across nested structures without mutating inputs and without throwing on missing optional data. These shapes feed [Project 2](../projects/project-2-test-case-management.md) and [Chapter 2.10](10-typescript-fundamentals.md).

**Deliverable.** `assignment-2-9/models.ts` plus `demo.ts`.

**Entities** (inline types are fine; interfaces arrive next chapter):

```ts
// TestCase: id, title, suite, priority, steps[], owner?
// TestRun: id, startedAt, results[] where each result has name, status, durationMs, error?
// User: id, email, role, address?: { city, country }
// Product: sku, name, price, stock, discount?: { code, amount } | null
```

**Required functions** (pure, no print):

```ts
export function suitesWithFailures(run: TestRun): string[]
export function failedStepTitles(cases: TestCase[], run: TestRun): string[]
export function usersMissingAddress(users: User[]): string[]
export function productsOutOfStock(products: Product[]): string[]
export function productsWithDiscount(products: Product[]): string[]
export function applyDiscount(product: Product): Product
```

**Rules.**

| Function | Behavior |
|---|---|
| `suitesWithFailures` | Unique suite names that have at least one failed result. A result's suite is the prefix before the first `:`, or `"unknown"` if none. |
| `failedStepTitles` | Titles of cases whose `id` matches a failed result name (result name equals case id). |
| `usersMissingAddress` | Emails where `address` is absent **or** `city` is missing. `address: null` counts as missing. |
| `productsOutOfStock` | SKUs where `stock === 0`. Absent stock is not zero — list those SKUs separately in `demo.ts` as a note, using `missing`. |
| `productsWithDiscount` | SKUs where `discount` is a non-null object. `null` and absent do **not** count. |
| `applyDiscount` | Return a **new** product whose `price` is reduced by `discount.amount` if present; otherwise return a shallow-enough copy with the same price. Never mutate the input. |

**Fixtures.** Hardcode at least: 4 cases, 1 run of 6 results (2 failed), 4 users (one without address, one with `address: { city missing }`), 5 products (one `stock: 0`, one no `stock`, one `discount: null`, one `discount: { code, amount }`, one no discount key).

**Requirements.**

| # | Requirement |
|---|---|
| 1 | No function mutates its arguments (prove in `demo.ts`) |
| 2 | No unguarded nested access — no crash on the fixtures |
| 3 | `productsWithDiscount` distinguishes `null` from absent |
| 4 | `applyDiscount` returns a new object; input `price` unchanged |
| 5 | `demo.ts` is the only file that prints |
| 6 | `npx tsc --noEmit` clean; no `any` |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Safe nested access | 25% | No crash; `?.` only on optional fields |
| Absent vs `null` | 20% | Discount and address cases distinguished as specified |
| Non-mutation | 20% | Proven in demo; `applyDiscount` copies |
| Query correctness | 20% | Suites, titles, emails, SKUs match fixtures |
| Modeling | 15% | Nested shapes match the entities; arrays of objects used naturally |

> **AI usage: restricted.** Same as Chapter 2.7. Do not ask for `applyDiscount` or the absent-vs-null logic.

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-2/09-objects.answers.md`](../answer-keys/part-2/09-objects.answers.md).

**1.** What does this throw or print?

```ts
const r = { name: "login", status: "passed" };
console.log(r.error.message);
```

- A) `undefined`
- B) `none`
- C) `TypeError: Cannot read properties of undefined`
- D) `""`

**2.** What does `r.error?.message ?? "none"` print for the same `r`?

- A) `undefined`
- B) `none`
- C) a TypeError
- D) `null`

**3.** True or false: `{ ...original }` copies nested arrays so `copy.items.push(x)` cannot change `original.items`.

**4.** `const a = { x: 1 }; const b = a; b.x = 2;` — what is `a.x`?

- A) `1`
- B) `2`
- C) `undefined`
- D) a TypeError

**5.** When must you use bracket access?

- A) Always
- B) When the key is in a variable or is not a valid identifier
- C) Never, if you have TypeScript
- D) Only for arrays

**6.** `{ a: 1 } === { a: 1 }` is:

- A) `true`
- B) `false`
- C) a compile error
- D) `undefined`

**7.** A product has no `discount` key. Another has `discount: null`. Which check treats them differently?

- A) `product.discount == null`
- B) `product.discount === null` versus `!("discount" in product)`
- C) `product.discount ?? 0`
- D) `!product.discount`

**8.** Why is `order.id?.startsWith("ORD")` dangerous in a test if `id` is required?

- A) Optional chaining is deprecated
- B) A missing required field becomes `undefined`, the assertion may pass or skip, and the defect is hidden
- C) `startsWith` does not exist
- D) It is slower

**9.** `buildOrder({ customer: { email: "x" } })` uses `{ ...base, ...overrides }`. What happens to `base.customer.name`?

- A) It is kept and merged
- B) It is dropped — the whole `customer` object is replaced
- C) It becomes `null`
- D) A TypeError

**10.** Two tests share `defaultUser` and one assigns `defaultUser.role = "admin"`. What is the risk?

- A) None, if they run sequentially
- B) Shared mutation; the other test can see `admin`, especially under parallel workers
- C) Objects cannot be assigned
- D) `role` is readonly automatically

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Object | A labeled record of properties |
| Array of objects | The dominant QA data structure |
| `?.` | Safe read when absence is allowed |
| `??` | Default for `null`/`undefined` only |
| Absent vs `null` | Never mentioned vs deliberately empty |
| Destructuring | Unpack fields; rename and default as needed |
| `this` | The object a method was called on; lost if you detach it |
| Shallow copy | Top level only; nested references shared |
| Deep copy | Nested structure duplicated (`structuredClone`) |
| Reference | Two variables, one object; mutation is visible to both |

### Mistakes recap

Unguarded `.error.message` · `?.` on required fields · shallow copy as deep · mutating fixtures · `===` on objects · factory override replacing a whole nested object.

### Competency check

> **Given an unfamiliar nested API response, can you extract three values safely and say what your code does when each is missing?**

Do it on E.4's `order` for `id`, `discount.code`, and `customer.name.last` without notes.

**Gate:** you are ready for [Chapter 2.10](10-typescript-fundamentals.md) when you can explain, out loud, why `{ ...obj }` is not enough to protect a fixture that contains an array.

---

[← 2.8 Arrays](08-arrays.md) · [Next: 2.10 TypeScript Fundamentals →](10-typescript-fundamentals.md)
