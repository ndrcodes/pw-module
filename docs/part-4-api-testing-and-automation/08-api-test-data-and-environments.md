# Chapter 4.8 — API Test Data and Environment Configuration

🔴 **Advanced** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | IV — API Testing and Automation |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [4.6](06-api-authentication-and-authorization.md), [4.7](07-reusable-api-clients-and-models.md) |
| **Next chapter** | [5.1 Playwright Fundamentals](../part-5-web-automation-playwright/01-playwright-fundamentals.md) |

---

> Two questions decide whether a suite is usable by a team: **where does the base URL come from**, and **where does the data come from**. Both answers have the same shape: **not from inside the test.**

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Configure** a suite to run against multiple environments by changing configuration only, with no test file edits.
2. **Load** configuration from environment variables with validated defaults, and **fail fast** on missing required values.
3. **Keep** secrets out of the repository, and **document** required variables with a committed example file.
4. **Distinguish** static reference data from dynamically created test data, and **choose** correctly.
5. **Build** simple data factories that produce valid, unique, overridable entities.
6. **Design** cleanup that is reliable, idempotent, and non-failing.
7. **Explain** the trade-offs of seeding shared data versus creating data per test.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Typed clients and models | [Chapter 4.7](07-reusable-api-clients-and-models.md) |
| Token handling and secrets | [Chapter 4.6](06-api-authentication-and-authorization.md) |
| Unique data and cleanup | [Chapter 4.5](05-playwright-api-write-operations.md) |
| Determinism and isolation | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |
| Default and optional parameters | [Chapter 2.7](../part-2-programming-fundamentals/07-functions.md) |
| `Partial`, interfaces | [Chapter 2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md) |

---

## C. Concept Explanation

### C.1 Hardcoding caps the suite

`https://localhost:3000` in twenty files means the suite runs in one place. `ORD-000041` from a database peek dies on reset. `if (env === "staging")` in a test is **two suites pretending to be one**.

Proof you did this chapter: `git diff tests/` is empty when you switch environments.

### C.2 One configuration module

```ts
export interface AppConfig {
  baseURL: string;
  defaultPassword: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable ${name}. See .env.example.`);
  }
  return value;
}

export function loadConfig(): AppConfig {
  return {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    defaultPassword: required("E2E_USER_PASSWORD"),
  };
}

export const config = loadConfig();
```

**Resolution:** environment (CI / shell) wins; `.env` for local (via `dotenv` if you add it — or Playwright's env); defaults only for non-secrets (`BASE_URL` local).

**Fail fast** on missing secrets at load, not deep in test 17 with `401` and a shrug.

**Read once.** Import `config`. Do not scatter `process.env.BASE_URL` in clients and specs — one typo, twelve behaviors.

Playwright: set `use.baseURL` from `config.baseURL` in `playwright.config.ts`. Tests still use relative paths.

### C.3 Secrets

| File | Committed? | Contains |
|---|---|---|
| `.env` | **Never** | Real URLs if sensitive, passwords, tokens |
| `.env.example` | Yes | `E2E_USER_PASSWORD=` and comments |
| `.gitignore` | Yes | `.env`, `playwright-report/`, `test-results/` |

"Only staging" is not a defense. Staging passwords open staging data.

If you already committed a secret: **rotate** (invalidate the old one), then remove from git history if the course/ops process says so. Deleting the file on `main` leaves it in old commits.

CI stores the same names in a credential store ([Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md)). Tests still call `loadConfig()`.

### C.4 Tests must not know the environment name

```ts
// forbidden
if (process.env.ENV === "staging") {
  expect(body.tax).toBe(0);
}

// allowed: behavior from data
expect(body.shipping).toBe(subtotal >= 100 ? 0 : 4.99);
```

If staging tax differs, that is **data** (a fixture or a config *value* like `config.taxIncluded`), not a branch on the environment string.

### C.5 Static vs dynamic data

| Kind | Example | Strategy |
|---|---|---|
| **Static / reference** | Currency codes, country list, "USD" | Commit JSON; do not mutate |
| **Dynamic** | Users, orders, carts, products you edit | Factory + cleanup |
| **Shared seed** | A catalogue of 10k products that takes 10 minutes to build | Seed once; tests **must not** mutate those rows; create overlays |

Decision: if two workers can change it, it is not static. Seed is legitimate for expensive immutable reference data. Seed that tests then PATCH is [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) `beforeAll` again.

### C.6 Factories

```ts
export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  const id = crypto.randomUUID();
  return {
    email: `buyer-${id}@shop.test`,
    password: config.defaultPassword,
    name: "Ada Buyer",
    ...overrides,
  };
}

export function buildProduct(overrides: Partial<NewProduct> = {}): NewProduct {
  const id = crypto.randomUUID().slice(0, 8);
  return {
    sku: `LAMP-${id}`,
    title: "Aeron Desk Lamp",
    price: 49.5,
    active: true,
    ...overrides,
  };
}
```

`buildUser({ role: "seller" })` states the only thing the test cares about. Defaults are **valid**. Overrides win.

Uniqueness: UUID in email/sku. Timestamp can collide. Counters fail across workers.

**Log** generated emails/skus in the expect message or `test.info().annotations` so a failure is reproducible. Seeding `Math.random` is optional; logging is not.

### C.7 Cleanup, completed

From [Chapter 4.5](05-playwright-api-write-operations.md), now as a rule set:

1. Always runs (`afterEach`, `finally`, later fixtures).
2. Idempotent — second run is fine.
3. Already-deleted → do not fail the test.
4. Never delete what you did not create (especially seed/reference).

```ts
async function safeDelete(run: () => Promise<APIResponse>): Promise<void> {
  try {
    const res = await run();
    if (res.status() !== 200 && res.status() !== 204 && res.status() !== 404) {
      console.warn(`cleanup unexpected status ${res.status()}`);
    }
  } catch {
    // teardown must not mask or fail the test
  }
}
```

### C.8 Shared seed vs per-test create

| | Per-test factory | Shared seed |
|---|---|---|
| Isolation | Best | Only if immutable |
| Speed | More POSTs | Fast reads |
| Parallel | Safe by construction ([Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md)) | Collides if anyone writes |
| When | Default | Rate limits, minute-long provisioning, huge catalogues |

Argue both sides. Default remains per-test. This 🔴 judgment is "I seeded because X," not "I hardcoded `user1` because it was easier."

### C.9 Lifecycle of a run

```text
Before:  empty (or immutable seed only)
During:  each test's users/products/orders exist
After:   those records gone (best effort); seed untouched
```

An environment full of `buyer-*-@shop.test` after a week is a cleanup bug. It slows DBs and embarrasses the team.

### C.10 Toward fixtures

`test.extend({ buyer: async ({ request }, use) => { ...; await use(user); /* teardown */ } })` is [Chapter 6.2](../part-6-framework-engineering/02-fixtures.md). Factories stay the **values**. Fixtures stay the **lifecycle**. You have the values now.

---

## D. QA Context

### D.1 "Works on my machine"

Almost always `BASE_URL` or a missing env var. CI is the honest environment ([Part VII](../part-7-cicd/00-module-overview.md)). Fail-fast messages should name the variable.

### D.2 Factories make workers boring

Unique emails are isolation by construction. Shared `admin@shop.test` is a flake scheduled for Week 22.

### D.3 Same factories seed UI

Part V / Project 4 call `buildUser` + API clients. Do not invent a second user shape.

### D.4 Leaked credential is an incident

Rotate, notify, do not "just gitignore it now."

---

## E. Code Examples

### E.1 Very simple — base URL

```ts
use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000" }
```

Switch: `BASE_URL=https://staging.shop.test npx playwright test`. `git diff tests` empty.

### E.2 Practical — `loadConfig`

C.2. Missing `E2E_USER_PASSWORD` throws before tests run. Message points at `.env.example`.

### E.3 QA-oriented — three factories

`buildUser`, `buildProduct`, `buildOrderInput`. Five tests converted. Overrides for `price: 100` (REQ-114) and `role: "admin"` if the API allows.

### E.4 Automation-oriented — two envs + double cleanup

Run local and staging (or local + a second port). Cleanup function invoked twice in a unit-ish test or a dedicated spec — second call does not throw.

---

## F. Common Mistakes

### F.1 Hardcoded URLs, passwords, peeked IDs
### F.2 Committed `.env` ("only staging")
### F.3 `if (environment === "staging")` in tests
### F.4 `process.env` in twenty files
### F.5 Missing var → mysterious 401 in test 17
### F.6 Factory returns the same email every time
### F.7 Random data, no log, cannot reproduce
### F.8 Cleanup throws on 404
### F.9 Cleanup only on success
### F.10 Seed rows mutated by every test
### F.11 Real customer PII in fixtures

---

## G. Exercise

Suggested total time: 100 minutes.

### G.1 Easy — Config only (20 min)

Remove hosts from tests. `git diff tests/` proves it. Switch `BASE_URL` once.

### G.2 Medium — Three factories (35 min)

Unique + `Partial` overrides. Convert five tests.

### G.3 Challenge — Two environments (45 min)

One variable change. Fail-fast. `.env.example` only. Cleanup run twice. No secrets in git (`git grep` / `git check-ignore .env`).

---

## H. Coding Assignment

### Assignment 4.8 — Environment-driven suite with factories

Final prep for [Project 3](../projects/project-3-api-automation.md).

| # | Requirement |
|---|---|
| 1 | `local` and a second env via **one** variable (`BASE_URL` or `ENV` that only the config module interprets) |
| 2 | Typed `loadConfig()`; fail-fast; single source |
| 3 | Factories: user, product, order (or cart line) — unique, overridable |
| 4 | Cleanup always / idempotent / non-failing |
| 5 | `.env.example` committed; `.env` ignored |
| 6 | Tests contain no host, password, or peeked id |
| 7 | `PROOF.md`: `git diff tests` on env switch; fail-fast message screenshot/text |

**How this is assessed.**

| Dimension | Weight | Full marks |
|---|---|---|
| Config | 25% | One module; switch without test edits |
| Secrets | 25% | Grep-clean; example file |
| Factories | 25% | Unique + overrides |
| Cleanup | 15% | Double-run safe |
| Proof | 10% | Diff + fail-fast |

> **AI usage: restricted.**

---

## I. Quiz

Ten questions. Answer key: [`answer-keys/part-4/08-api-test-data-and-environments.answers.md`](../answer-keys/part-4/08-api-test-data-and-environments.answers.md).

**1.** Switching staging should require changing:

- A) Every spec
- B) Configuration / env vars only
- C) Client method names
- D) Assertion matchers

**2.** A missing required password should:

- A) Surface as 401 in a random test
- B) Fail fast at config load with the variable name
- C) Default to `"password"`
- D) Be committed to git

**3.** True or false: Committing `.env` is fine if the values are staging-only.

**4.** `if (env === "staging") expect(tax).toBe(0)` in a test is wrong because:

- A) Tax never matters
- B) Tests must not branch on environment name — you have forked the suite
- C) Staging cannot have tax
- D) `expect` is illegal

**5.** Country codes in a committed JSON file are:

- A) Dynamic data — must factory
- B) Static reference data — safe to share if tests do not mutate them
- C) Secrets
- D) Environment URLs

**6.** `buildUser()` called twice should:

- A) Return the same email
- B) Return two unique emails
- C) Return `admin@shop.test`
- D) Throw

**7.** Factory overrides exist so that:

- A) Tests can set the one field they care about (`price: 100`) and keep valid defaults
- B) You can skip validation
- C) Secrets can live in code
- D) `baseURL` can move

**8.** Cleanup runs a second time; the record is already gone. Cleanup should:

- A) Fail the suite
- B) Succeed (404/ignore)
- C) Recreate production data
- D) Print the password

**9.** A 10-minute catalogue seed is legitimate when:

- A) You always want to skip factories
- B) Data is expensive and tests will **not** mutate those rows
- C) You need `user1@test.com`
- D) CI is down

**10.** Proof the suite is environment-agnostic:

- A) A comment that says so
- B) `git diff tests/` empty after changing `BASE_URL` and a green run
- C) Hardcoded staging URL
- D) More retries

---

## J. Review

### Key concepts

| Concept | The one-sentence version |
|---|---|
| Config module | Only place env is read |
| Fail fast | Missing secret names the variable |
| `.env` / `.env.example` | Real vs documented |
| Static vs dynamic | Mutability decides |
| Factory | Valid + unique + `Partial` |
| Cleanup | Always, idempotent, quiet |
| Seed | Immutable reference only |

### Competency check

> **Could a colleague clone your repository, set two environment variables, and get a green run against their own environment?**

### Part IV gate

Before [Part V](../part-5-web-automation-playwright/00-module-overview.md) and after [Project 3](../projects/project-3-api-automation.md):

- Three consecutive runs, any order, `--workers=4`
- Fresh database, no manual prep
- No hardcoded id, URL, or password
- Every test: "this fails if X breaks"
- Break one endpoint body → exactly the relevant tests go red

The fifth point is the one learners skip and graders always check.

**Project 3** is the Part IV exam that ships. Bring the 4.3 matrix, 4.7 clients, and this config module.

---

[← 4.7 Reusable API Clients and Models](07-reusable-api-clients-and-models.md) · [Next: Part V — 5.1 Playwright Fundamentals →](../part-5-web-automation-playwright/01-playwright-fundamentals.md)
