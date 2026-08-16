# Instructor Notes — Part III: Automation Fundamentals

[← Module Overview](00-module-overview.md) · [Table of Contents](../README.md)

**Two sessions, almost no code, disproportionate leverage.** Everything you enforce for the next 21 weeks is defined here. Instructors who rush this part spend Parts V and VI arguing the same points repeatedly with no shared vocabulary to appeal to.

---

## 1. Teaching goals for the module

1. **Install a shared vocabulary.** After this part, "that test isn't isolated" should end a discussion rather than start one.
2. **Make trust the primary metric.** Learners arrive optimizing for coverage. Leave them optimizing for trustworthiness.
3. **Give them a constitution they wrote themselves.** Rules learners author are rules learners follow. The Chapter 3.2 assignment exists for this reason.

---

## 2. Common beginner misconceptions

| Misconception | How it surfaces | Correction |
|---|---|---|
| "Green means correct" | Learners submit tests that pass against a broken app | Give them a suite that passes against an app you have deliberately broken. Ask what the suite proved. |
| "Independence just means no shared variables" | Tests still share a database record | Broaden the definition: independent in *data*, *state*, *order*, and *time*. |
| "Isolation is impossible in end-to-end testing" | Fatalism, usually from experience with a bad suite | Distinguish isolating the *test* from isolating the *system*. Unique data per test is achievable everywhere. |
| "Determinism means no random values" | Learners hardcode `user1@test.com` to be "deterministic" | Invert it: hardcoded shared data is the *least* deterministic choice under parallelism. Random unique data stabilizes the verdict. |
| "AAA is a formatting convention" | Comments saying `// Arrange` above tangled code | AAA is a constraint on *structure*: no assertions in Arrange, no new setup in Assert. |
| "`beforeAll` is the fast option" | Shared login state mutated by later tests | Show a failure that only appears when one test is run alone. |
| "Cleanup is optional if the environment is reset nightly" | Data accumulates until the suite slows or collides | Ask what happens when two engineers run the suite simultaneously at 4 p.m. |
| "More layers is more professional" | Five-layer architecture for eight tests | Introduce the cost of indirection. Make them justify each layer with a concrete duplication it removes. |
| "Reuse everything immediately" | A helper used once, parameterized six ways | Rule of three: duplicate twice, abstract on the third. |
| "Reports are overhead" | No reporter configured, failures debugged by rerunning | Time a diagnosis with and without a trace. The difference sells itself. |

---

## 3. Concepts learners find genuinely difficult

**Isolation vs independence.** These blur together. Keep the distinction concrete: *independence* is about relationships between tests (does A require B to run first?); *isolation* is about the test's blast radius (does A touch anything that B also touches?). A test can be independent and not isolated — it does not need another test to run first, but it mutates a shared record and will eventually collide.

**Determinism when the system is genuinely stateful.** Learners correctly object that a real e-commerce app has stock levels, sequential order numbers, and rate limits. Do not dismiss this. Teach the actual professional answers: create your own data, assert on relationships rather than absolutes ("stock decreased by one" not "stock is 41"), and accept that some checks belong at a lower layer.

**Where does this code go?** Layer placement feels arbitrary until they have felt the pain of a wrong placement. The most effective teaching move is a repository with three deliberate violations (a locator in a test, a business workflow inside a page object, a hardcoded URL in a utility) and asking them to find the smell before naming the rule.

**Abstraction timing.** "Abstract on the third occurrence" is easy to state and hard to feel. Show a real over-abstraction: a `BasePage` class with eleven protected methods, two of which are used. Ask what a new team member has to read before writing their first test.

---

## 4. Suggested demonstrations

### Demo 1 — The test that cannot fail (10 min, Chapter 3.1)

```ts
test("user can log in", async ({ request }) => {
  const response = await request.post("/api/login", {
    data: { email: "user@example.com", password: "wrong-password" },
  });
  expect(response).toBeTruthy();          // always passes
  expect(response.status()).toBeDefined(); // always passes
});
```

Ask: what would have to break in the application for this test to go red? Nothing. Then have the room rewrite it.

### Demo 2 — The order-dependency trap (15 min, Chapter 3.1)

Show three tests where test 1 creates a product, test 2 edits it, test 3 deletes it. Run the file: green. Run only test 2 (`--grep`): red. Run with two workers: red, intermittently. Learners remember this demo for the rest of the course; it is the cheapest way to make parallelism's constraints real 15 weeks before Chapter 6.7.

### Demo 3 — Shared data collision (10 min, Chapter 3.1)

Two learners run the same registration test simultaneously against the same environment with a hardcoded email. One fails with "email already exists." Do this live with actual volunteers if the environment allows — the social proof lands harder than a slide.

### Demo 4 — AAA rescue (20 min, Chapter 3.1)

Project a 40-line test with interleaved setup, actions, and assertions. Restructure it live into three visually distinct phases without changing behavior. Then ask what the test is *for* — the answer becomes obvious only after the restructuring, which is the point.

### Demo 5 — Layer violation hunt (20 min, Chapter 3.2)

A small repository with three planted violations. Learners find them in pairs. Reveal, then derive the layering rules from the smells they found rather than presenting the rules first.

### Demo 6 — Diagnosing with and without artifacts (15 min, Chapter 3.2)

Same failure, twice: once with only `Error: expect(received).toBe(expected)` in the console, once with a screenshot, a trace, and a named assertion message. Time both diagnoses. This is the argument for Chapter 6.8, delivered early.

---

## 5. Suggested live activities

| Activity | Chapter | Format | Time |
|---|---|---|---|
| Audit five supplied tests, name the violated property | 3.1 | Pairs | 25 min |
| "Make this test able to fail" — rewrite weak assertions | 3.1 | Individual | 20 min |
| AAA restructuring relay on a tangled test | 3.1 | Whole class, one keyboard | 20 min |
| Setup strategy debate: shared fixture vs per-test creation | 3.1 | Two groups, argue assigned sides | 25 min |
| Assign 20 code snippets to layers | 3.2 | Groups of 3 | 25 min |
| Draft the class "framework constitution" collectively | 3.2 | Whole class, then individual refinement | 30 min |

The **assigned-sides debate** is worth protecting. Forcing learners to argue for shared fixtures surfaces the genuine trade-off (speed, environment cost, rate limits) instead of leaving them with a slogan.

---

## 6. Questions to ask learners

- "What would have to break in the application for this test to fail?"
- "If I run only this one test, on a fresh environment, does it pass?"
- "If two people run this suite at the same time, what collides?"
- "Which phase is this line in — Arrange, Act, or Assert? Why is it not obvious?"
- "This test asserts five things. If it fails, do you know which one broke, from the report alone?"
- "You put the login flow in a page object. What happens when the mobile app needs the same flow?"
- "Name a duplication this layer removes. If you cannot, why does the layer exist?"
- "This helper is used once. Defend it."
- "Your test cleaned up after itself. What happens if it fails halfway through?"
- "A test failed in CI last night and passed this morning. What is your first move?" (Correct answer: read the artifacts, not rerun.)

---

## 7. Signs a learner is struggling

| Signal | Likely cause | Response |
|---|---|---|
| Audits every test as "fine" | No model of what failure looks like | Give tests with obvious planted defects first; build the pattern-recognition, then increase subtlety |
| Uses "flaky" for every kind of failure | Vocabulary not yet differentiated | Insist on naming a category each time: timing, data, order, environment, or genuine bug |
| Puts everything in the test layer | Has not felt duplication yet | Point back at their own Project 2 code and count the repetitions |
| Designs five layers for eight tests | Confusing ceremony with engineering | Require a named duplication per layer; delete the unjustified ones together |
| Cannot explain why order dependency matters | Has never run tests in parallel | Re-run Demo 2 with them individually |
| Writes assertions that restate the action | Assertion purpose unclear | "What is the *user-visible outcome*? Assert that, not the thing you just did." |
| Silent during the debate activity | Either disengaged or lacks confidence to argue | Assign them the side they disagree with; structure lowers social risk |

---

## 8. Remediation exercises

**Cannot identify weak assertions.**
Twenty assertions, one per line. For each: "what does this actually prove?" Then rewrite the ten weakest. Concrete and quick, and it transfers directly to Chapter 4.3.

**Cannot see order dependencies.**
Give a five-test file with three hidden dependencies. They must make every test pass in isolation, then run the file reversed. Verify by running with `--workers=4`.

**Struggles with AAA.**
Constrained format: exactly three comment blocks, no code outside them, no assertions before the Assert block. Ten tests under this constraint makes the structure automatic.

**Cannot place code in layers.**
Give the file names only (`checkout.spec.ts`, `CartPage.ts`, `userFactory.ts`, `config.ts`, `AuthService.ts`) and 20 one-line code snippets. Sorting into named buckets is easier than designing layers, and it builds the intuition that designing requires.

**Over-abstracts.**
Take their own over-abstracted design and require them to delete two layers, keeping behavior identical. Then ask which deletion they regret. Usually neither, which is the lesson.

**Learners who are ahead.**
Have them write the "worst possible suite" deliberately — order-dependent, shared data, weak assertions, no layers — and then write the incident report explaining how it failed in production. The artifact is reusable as teaching material in Chapter 8.2, and inverting the problem sharpens judgment faster than another audit.

---

## 9. Assessment guidance for this part

- **Grade the audit's reasoning, not its verdicts.** A learner who names the wrong property but describes the actual failure mechanism understands more than one who guesses the right label.
- **Require the falsifiability check.** Every submitted test in this part and afterwards must come with one sentence: "this test fails if X breaks." If they cannot write the sentence, the test is not finished.
- **The framework constitution is a living document.** Grade it on specificity and internal consistency, not on matching your opinions. Revisit it in Chapter 8.3 and reward learners who changed it for stated reasons.
- **Quizzes should be scenario-heavy here.** Definition recall is nearly worthless for this material; give them a test and ask what is wrong with it.

---

## 10. Transition into Part IV

Close by framing API testing as the ideal training ground for what they just learned:

> "You now have standards. The fastest way to practice them is at the API layer, where there is no rendering, no timing, and no locators — so if a test is unreliable, it is unambiguously your test's fault. We start with HTTP itself, because you cannot assert on a response you cannot read."

Also set the expectation that Part IV is the first part where they write code that talks to a real system, and that their Part III constitution will be enforced on it from the first test.
