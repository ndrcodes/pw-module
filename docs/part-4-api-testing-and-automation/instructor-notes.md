# Instructor Notes — Part IV: API Testing and Automation

[← Module Overview](00-module-overview.md) · [Table of Contents](../README.md)

**This is where learners first write automation that talks to a real system, and where their Part III standards get tested.** Expect high motivation — the first passing API test is a genuine milestone — and expect that motivation to produce fast, sloppy, duplicated code. The module is sequenced to exploit that: let them build the mess in 4.4-4.6, then make them refactor it in 4.7.

---

## 1. Teaching goals for the module

1. **Learners can read HTTP fluently.** Everything else in this part depends on it. Do not accelerate past 4.1 for a cohort that has never opened the Network tab.
2. **Learners design test sets before writing tests.** The Chapter 4.3 matrix is the highest-value artifact in the module.
3. **Learners refactor their own duplication.** The 4.7 refactor must be *their* code, not a supplied example, or the lesson does not land.
4. **Learners stop hardcoding.** No IDs, no URLs, no credentials. This habit determines whether their capstone survives parallel execution.

---

## 2. Common beginner misconceptions

| Chapter | Misconception | Correction |
|---|---|---|
| 4.1 | "Headers are optional metadata" | Remove `Content-Type` from a POST live and watch the 415. Headers are part of the contract. |
| 4.1 | "The URL is just an address" | Decompose one URL on the board into scheme, host, path, path params, query params. Ask which parts are data. |
| 4.1 | "4xx means the API is broken" | 4xx means *you* sent something unacceptable; 5xx means the server failed. A 400 in a negative test is a pass. |
| 4.1 | "Cookies and tokens are unrelated to my tests" | Show a session cookie in DevTools, then the same auth as a Bearer token. Both are just headers. |
| 4.2 | "REST means JSON over HTTP" | Resources, uniform interface, statelessness. Then critique a real endpoint like `POST /getUserById`. |
| 4.2 | "Every operation needs a new endpoint" | Show CRUD collapsing onto one resource with five methods. |
| 4.3 | "Test design is writing more tests" | It is choosing which risks to cover. Give a 30-test matrix and ask which 8 they would keep if they had one hour. |
| 4.3 | "Negative testing is sending nonsense" | Require the specific expected failure: status, error body shape, and *no side effect*. Verify the side effect absence. |
| 4.4 | "`expect(response.ok()).toBeTruthy()` is enough" | Change the response body in the mock and show the test still passing. |
| 4.4 | "`await` is optional here since it works" | Remove one `await` and show a passing test that asserts nothing. |
| 4.5 | "Cleanup can happen at the end of the file" | Show a mid-test failure leaving orphaned data. Move cleanup into teardown that always runs. |
| 4.5 | "PUT and PATCH are the same" | PUT with a partial body erasing fields is a real, findable bug. Demo it. |
| 4.6 | "Login once in `beforeAll` and share the token" | Fine for read-only tests; dangerous when tests mutate the same user. Discuss explicitly, do not just forbid it. |
| 4.6 | "Authorization testing is checking 401" | The interesting test is a *valid* token for the *wrong* user getting 403 or 404. |
| 4.7 | "Clients are extra layers for no benefit" | Have them rename a field in the API and count the files they must touch, before and after. |
| 4.7 | "Typed models are ceremony" | Show a typo in `respose.body.totl` caught at compile time versus at 2 a.m. in CI. |
| 4.8 | "`.env` is safe to commit if it's only staging" | Never. Establish the rule now; it is a real-world firing offense. |
| 4.8 | "Environment config means an if-statement per test" | Configuration belongs in one place. Tests must not know which environment they are on. |

---

## 3. Concepts learners find genuinely difficult

**What to assert.** Beginners either assert one trivial thing or assert the entire response body verbatim (which breaks on every unrelated field addition). Teach the middle path explicitly: assert the fields your test is *about*, plus schema-level checks for the contract. Give them the heuristic — "would a reviewer be able to tell what this test is for, from its assertions alone?"

**Test data ownership.** The idea that a test should create its own data feels wasteful to learners used to a shared staging environment. Make the cost concrete: run two copies of their suite simultaneously against a shared account and let them watch the collisions.

**The refactor in 4.7.** The difficulty is not writing a class; it is deciding what belongs in the client versus the test. Give a single rule and enforce it: **the client knows how to call the API; the test knows what should be true.** No assertions inside clients. No raw `request.post` inside tests.

**Authorization boundaries.** Learners struggle to set up two users cleanly. This is a genuine framework problem, and it is the right time to preview fixtures (Chapter 6.2) without implementing them yet. Show the duplication, name the future solution, move on.

**Schema validation.** Hand-rolled field-by-field checks get tedious fast, and learners conclude schema validation is not worth it. Introduce a runtime validator (Zod or similar) as a bonus path so the effort matches the value.

---

## 4. Suggested demonstrations

### Demo 1 — Network tab archaeology (20 min, Chapter 4.1)

Open the demo shop, log in, add an item to the cart, and check out — with the Network tab open and filtered to XHR/fetch. Narrate each request: method, URL, headers, body, status, response. Learners see that the UI is a client of the same API they are about to test. This single demo reframes the whole module.

### Demo 2 — Breaking the contract with headers (10 min, Chapter 4.1)

Send the same POST three times: correct `Content-Type`, missing, and wrong. Collect the status codes. Ask which of these a real client might do by accident, and whether the API's behavior is acceptable.

### Demo 3 — Endpoint design critique (15 min, Chapter 4.2)

Put four endpoint designs on screen, one good and three bad (`POST /getUser`, `GET /deleteProduct/5`, `POST /api/v1/users/5/update-email-address`). Have the room diagnose each, then propose the RESTful version.

### Demo 4 — Building a test matrix live (25 min, Chapter 4.3)

Take `POST /api/orders` and build the matrix as a class, filling columns for status, body, headers, schema, auth, authorization, negative, boundary, integrity, timing. Aim for 25+ candidate tests, then prioritize down to 10. The prioritization discussion is the real lesson.

### Demo 5 — The passing test that asserts nothing (10 min, Chapter 4.4)

```ts
test("get products", async ({ request }) => {
  const response = request.get("/api/products");   // no await
  expect(response).toBeTruthy();                   // a Promise is truthy
});
```

Green. Then fix it properly and show the difference. Refer back to Chapter 2.12 explicitly — this is the payoff of that bug hunt.

### Demo 6 — Orphaned data from a mid-test failure (15 min, Chapter 4.5)

A test that creates a product, fails an assertion, and never reaches its inline cleanup. Show the leftover record, then move cleanup into `afterEach`/teardown and repeat. Connect to Chapter 3.1's isolation principle.

### Demo 7 — The cross-user access bug (15 min, Chapter 4.6)

Two users, A and B. Request B's order with A's valid token. If the demo app returns 200, celebrate: they have found a real authorization defect, and it is the most valuable bug type an API tester finds. If it returns 403, discuss why 404 might be preferable (not leaking existence).

### Demo 8 — Rename a field, count the damage (20 min, Chapter 4.7)

Before the refactor: change `product.title` to `product.name` in the API and count how many test files break. After the refactor: the same change touches one model and one client. Do the counting out loud; the number is the argument.

---

## 5. Suggested live activities

| Activity | Chapter | Format | Time |
|---|---|---|---|
| Annotate a captured request/response, label every part | 4.1 | Individual | 20 min |
| Method-and-status matching: 12 operations | 4.1 | Rapid fire, whole class | 10 min |
| Redesign three bad endpoints | 4.2 | Pairs | 20 min |
| Build a test matrix for `POST /api/cart/items` | 4.3 | Groups of 3, then compare coverage | 30 min |
| Prioritization: cut a 30-test matrix to 8 | 4.3 | Groups, defend cuts to the room | 20 min |
| First green test race (GET with three real assertions) | 4.4 | Individual | 20 min |
| CRUD lifecycle relay: each learner writes one step | 4.5 | Whole class, one keyboard | 25 min |
| Find the authorization hole in the demo API | 4.6 | Pairs, exploratory | 25 min |
| Refactor *your own* Chapter 4.5 tests into a client | 4.7 | Individual, then peer review | 40 min |
| Run the same suite against two environments | 4.8 | Individual | 20 min |

The **prioritization** activity and the **4.7 refactor of their own code** are the two that must not be cut. Test design without prioritization is unrealistic, and a refactor of someone else's code teaches nothing about why abstraction matters.

---

## 6. Questions to ask learners

- "What are the five parts of this request, and which of them is data?"
- "What status code do you expect, and what status code would be a bug?"
- "This returned 200. Are you sure it worked?"
- "Which field in this response is your test actually about?"
- "If a developer adds a new field to this response tomorrow, does your test break? Should it?"
- "Where did this ID come from? What happens on a fresh database?"
- "Your test failed halfway. What is left behind in the system?"
- "Two of these tests run at the same time. What collides?"
- "You have a valid token for user A. What should happen when you request user B's order, and why might 404 be better than 403?"
- "Your client method returns the raw response. Should it? What would the test lose if it returned a typed object instead?"
- "How would you point this suite at staging? How many files change?"
- "Where is that password stored right now?" (Ask often, especially before commits.)

---

## 7. Signs a learner is struggling

| Signal | Likely cause | Response |
|---|---|---|
| Every test asserts only the status code | Does not yet know what else is available | Walk through one response object together and list ten assertable facts |
| Tests pass but never fail when the API is broken | Weak assertions, or missing `await` | Make "break the endpoint and prove red" a required step before submission |
| Hardcoded IDs from manual database peeks | Has not internalized data ownership | Reset the database in front of them and watch the suite collapse |
| Copies the same 15 lines into every test | Normal in 4.4-4.6, a problem if it persists past 4.7 | Do the rename-a-field exercise one-on-one |
| Cannot get auth working, blocked for hours | Usually a header format or token-refresh issue | Provide a working reference request in a REST client so they can compare byte for byte |
| Wraps every request in `try/catch` | Carrying over a defensive habit that hides failures | Show that a swallowed 500 becomes a green test |
| Suite passes alone, fails with `--workers=4` | Shared data or shared user state | Return to Chapter 3.1 Demo 2 and have them find the shared resource |
| Struggles to read compiler errors on typed clients | Types feel like obstacles | Read three errors aloud together, translating each into plain English |

---

## 8. Remediation exercises

**Cannot read HTTP.**
Ten captured request/response pairs. For each, write out method, path params, query params, three headers and their purpose, body, status, and one sentence on what the client was trying to do. Repeat until fast.

**Weak assertions.**
Give a response body and require ten distinct assertions about it, ranked by value. Then require them to justify keeping only the top four.

**Cannot design negative tests.**
For one endpoint, produce ten invalid requests, each violating exactly one rule (missing field, wrong type, out of range, unauthenticated, wrong user, malformed JSON, oversized payload, unsupported method, wrong content type, duplicate creation). For each, state the expected status *and* the expected side effect (usually none), then verify both.

**Hardcodes data.**
Constraint drill: rewrite three of their tests so that no literal value appears except in the assertion of a computed relationship. Force factory-style creation before Chapter 6.4 formalizes it.

**Cannot structure a client.**
Give the client's method signatures only (`createProduct(input: NewProduct): Promise<Product>`) and have them implement bodies. Then have them write the signatures for a second resource themselves.

**Cannot configure environments.**
Two `.env` files and one config module. Requirement: switch environments with a single command, and prove no test file changed. `git diff` is the proof.

**Learners who are ahead.**
Add runtime schema validation with Zod across every response; write a contract-diff script that flags unexpected new fields; implement a retry-with-backoff utility for a genuinely flaky third-party call and explain when that is legitimate versus when it is hiding a bug.

---

## 9. Assessment guidance for this part

- **Require the break-it proof.** For every assignment: modify the API or its data so the test *should* fail, and include the red output. This single requirement eliminates most weak-assertion submissions.
- **Grep for `waitForTimeout`, hardcoded URLs, hardcoded IDs, and `: any`** before reading the code. It is fast and predictive.
- **Run their suite with `--workers=4` twice.** Order dependence and shared-data collisions surface immediately and are worth more grading attention than style.
- **Grade the 4.3 matrix on prioritization, not volume.** A 10-test matrix with reasoning beats a 40-test matrix without.
- **In the 4.7 review, ask where the assertions live.** Any assertion inside a client is a layer violation and should cost architecture marks with an explanation, not just a deduction.
- **Project 3 defense questions:** "Which test would catch a developer accidentally making orders visible across users?" and "Show me the one place a base URL is defined."

---

## 10. Pacing guidance

| Week | Sessions | Risk to watch |
|---|---|---|
| 12 | 4.1, 4.2 | Experienced testers may find this slow; give them the endpoint-critique work early |
| 13 | 4.3, 4.4 | High energy at the first green test; guard against sloppy assertions becoming habit |
| 14 | 4.5, 4.6 | Auth setup is the most common place learners get stuck for hours — provide a reference request |
| 15 | 4.7, 4.8 | The refactor takes longer than expected; protect the full session for it |
| 16 | Project 3 lab and review | Use the review to run everyone's suite with `--workers=4` publicly |

If time is short, compress 4.2 rather than 4.3. Test design is the durable skill; REST theory can be picked up on the job.

---

## 11. Transition into Part V

Frame the browser as an addition of *problems*, not power:

> "You already know how to design tests, assert meaningfully, own your data, and structure a client. Part V adds exactly one new thing: a rendering engine that takes time to catch up with itself. Every difficulty you meet in the next three weeks is a timing or locator problem, not a test-design problem — because you already solved those here."

Then make the pyramid argument concrete one more time: whatever they *can* verify through the API, they should, so that their UI suite stays small enough to stay trustworthy.
