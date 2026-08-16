# Instructor Notes — Part VIII: Professional Automation Engineering

[← Module Overview](00-module-overview.md) · [Table of Contents](../README.md)

**This part is taught mostly through other people's code and live discussion.** There is little new syntax. The material only works if learners engage with real artifacts — their own old code, a peer's pull request, a genuine design disagreement. Lecturing about clean code produces nothing; reviewing actual code produces the whole learning.

Two social risks to manage from the first session: learners can experience review as criticism, and confident learners can dominate design discussions. Both are handled by structure rather than by appeals to good behavior.

---

## 1. Teaching goals for the module

1. **Learners write for the next reader.** The stranger-at-2-a.m. test becomes their internal standard.
2. **Learners review usefully and safely.** Specific, prioritized, about the code, not the person.
3. **Learners can defend and revise a design.** Both halves matter; stubbornness and capitulation are equally wrong.
4. **Learners own standards rather than obeying them.** The revised constitution is the evidence.

---

## 2. Common beginner misconceptions

| Chapter | Misconception | Correction |
|---|---|---|
| 8.1 | "Clean code is subjective polish" | Reframe as cost: time to onboard, time to diagnose, probability of rewrite. Use their own Week 13 code as evidence. |
| 8.1 | "Test code has lower standards" | It is read under stress, by people who did not write it, when something is already broken. |
| 8.1 | "DRY everything" | Show an over-DRY test that requires opening four files to understand one assertion. Then show the readable version with mild duplication. |
| 8.1 | "Comments mean the code is unclear" | In test code, justifying a deviation is the correct use of a comment. Model it: `// CSS locator: no accessible name, bug FE-2211 filed`. |
| 8.1 | "Long test names are unprofessional" | `test("rejects checkout when cart is empty")` is a specification. Show a CI report full of good names versus `test 1..12`. |
| 8.1 | "Helper functions make code cleaner" | `helpers.ts` is where clarity goes to die. Name the concept or leave the code inline. |
| 8.2 | "Review means finding as much as possible" | Show a review with 30 unranked comments and ask which one was the blocking bug. Then show a review with 3 blocking, 4 important, 2 optional. |
| 8.2 | "Style opinions and standards are the same" | Require labels: blocking, important, optional, and "personal preference, ignore freely." |
| 8.2 | "'This is wrong' is efficient feedback" | Model the structure: observation, consequence, suggestion. "This locator is positional, so it breaks when a row is added. `getByRole('row', { name: ... })` would survive." |
| 8.2 | "Approving fast is being helpful" | Approving a test that cannot fail is worse than blocking it. The reviewer shares ownership of what merges. |
| 8.2 | "Authors should defend their code" | Authors should *understand* it. Distinguish explaining a reason from resisting change. |
| 8.3 | "Best architecture = most layers" | Minimum structure that makes the expected change cheap. Ask what change they are optimizing for. |
| 8.3 | "One correct answer exists" | Give two scenarios (3-person startup weekly releases; 40-person enterprise quarterly releases) and show different correct answers. |
| 8.3 | "Architecture is decided once" | Show a real evolution: scripts → page objects → fixtures → services, each step triggered by a specific pain. |
| 8.3 | "Copying a well-known structure is safe" | If they cannot state which duplication a layer removes, they cannot maintain it. |

---

## 3. Concepts learners find genuinely difficult

**When duplication is acceptable.** After twenty-five weeks of "extract the duplication," the nuance lands badly. Give a concrete boundary: duplication in *locators, flows, setup, and configuration* is a defect; duplication of two or three lines in *test bodies* that keeps a test readable standalone is acceptable. Show both.

**Prioritizing review comments.** Learners genuinely cannot tell a blocking issue from a nitpick at first. Teach the question: "if this merges as-is, what goes wrong?" Nothing → optional. Slower or harder to maintain → important. Test cannot fail, leaks secrets, breaks under parallelism, or hides a bug → blocking.

**Giving feedback without damaging the relationship.** This is a genuine skill and most learners have never been taught it. The observation-consequence-suggestion structure works, and so does one rule: comment on the code's behavior, never on the author's ability. Rehearse it, including the awkward case where the whole approach is wrong.

**Receiving feedback.** Some learners get defensive; some capitulate instantly to any comment. Both are failures. Require an explicit response to every blocking comment: accept and change, or explain and discuss. "I disagree because X" is a fully acceptable answer and should be praised when reasoned.

**Designing for a context that is not their own.** Learners design for themselves. Force the constraints: this team has two testers and thirty developers; releases are weekly; there is an existing Selenium suite nobody wants to throw away. Constraints make architecture real.

**Admitting they were wrong.** The constitution revision is where this gets tested. Reward changed positions explicitly and publicly, so it reads as competence rather than concession.

---

## 4. Suggested demonstrations

### Demo 1 — Your own code, twelve weeks later (15 min, Chapter 8.1)

Project an anonymized Part IV or early Part V test from *this cohort* (with permission) and have the room critique it. Learners see their own growth, and the criticism is safe because everyone recognizes their own past code in it.

### Demo 2 — The unreadable failure (15 min, Chapter 8.1)

Two failing tests, same defect. One reports `expect(received).toBe(expected)` from `test("test 4")`. The other reports a named assertion from `test("shows out-of-stock message when inventory is zero")`. Ask which one they would rather find in a CI email at 2 a.m.

### Demo 3 — Over-DRY autopsy (15 min, Chapter 8.1)

A test whose meaning requires opening a spec, a helper, a fixture, and a constants file. Trace it live with the room, counting file switches. Then show the flattened version and count again.

### Demo 4 — Two reviews of the same PR (20 min, Chapter 8.2)

Same pull request, two reviews on screen: 30 unranked nitpicks that miss a swallowed error, versus 4 prioritized comments that catch it. Ask which reviewer they want on their team. This demo sets the standard for the whole chapter.

### Demo 5 — Rewriting harsh comments (15 min, Chapter 8.2)

Five real-sounding blunt comments ("this is wrong", "why would you do this?", "did you even run this?"). Rewrite each live using observation-consequence-suggestion, preserving the technical content exactly. Learners see that kindness costs no rigor.

### Demo 6 — The planted-defect PR, worked live (25 min, Chapter 8.2)

Review the ten-defect PR as a class, one area of the checklist at a time. Deliberately include two defects that look fine (a test that cannot fail; a fixture that shares state only under parallelism) so learners see why a checklist beats intuition.

### Demo 7 — Same product, two architectures (25 min, Chapter 8.3)

Design for a 3-person startup shipping daily, then for a 40-person enterprise shipping quarterly. Same application. Different correct answers on shared fixtures, environment strategy, and how much abstraction is justified. This demo kills the "one right structure" belief permanently.

### Demo 8 — Architecture defense, modeled by the instructor (20 min, Chapter 8.3)

Present your own framework design and have the room attack it. Model the behaviors: concede a valid point immediately, ask for evidence on a speculative one, and say "I don't know, here is how I would find out." Learners imitate what they see far more than what they are told.

---

## 5. Suggested live activities

| Activity | Chapter | Format | Time |
|---|---|---|---|
| Refactor your own earliest test file, no behavior change | 8.1 | Individual | 35 min |
| Naming clinic: rename 15 tests and 10 methods | 8.1 | Pairs | 20 min |
| Draft a team style guide, then merge into one class version | 8.1 | Groups, then whole class | 30 min |
| Review the planted-defect PR individually, then compare | 8.2 | Individual then whole class | 40 min |
| Comment rewriting: blunt to constructive | 8.2 | Pairs | 20 min |
| Peer review of a classmate's Project 4 | 8.2 | Pairs, real PRs | 40 min |
| Respond to the review you received | 8.2 | Individual | 20 min |
| Architecture design for a supplied scenario | 8.3 | Groups of 3 | 35 min |
| Architecture defense, groups challenge each other | 8.3 | Whole class | 40 min |
| Revise the framework constitution with a changelog | 8.3 | Individual | 25 min |

The **peer review plus written response** pair is the core of the module. Reviewing without receiving teaches only half the skill, and receiving is where the professional maturity develops.

---

## 6. Questions to ask learners

**On clean code:**
- "Read this test name. Can you tell what it verifies without reading the body?"
- "How many files must I open to understand this assertion?"
- "This is called `helper`. What concept does it represent?"
- "This function does three things. What are they called individually?"
- "You deviated from a course standard here. Where is the justification comment?"
- "Would you understand this in six months, at 2 a.m., during an incident?"

**On review:**
- "Which of your comments is blocking, and which is preference?"
- "If this merges unchanged, what goes wrong?"
- "You approved this. Could any test in it fail if the feature broke?"
- "This comment says 'this is wrong'. What is the consequence, and what is your suggestion?"
- "The author disagrees with you and has a reason. What now?"
- "You received eight comments. Which do you accept, which do you push back on, and why?"

**On architecture:**
- "Which duplication does this layer remove? Name it."
- "What change are you optimizing for being cheap?"
- "This design has five layers and this team has two testers. Defend that."
- "What did you deliberately not build, and when would you build it?"
- "What in your constitution changed since Week 11, and what changed your mind?"
- "What is the weakest part of your design? What would make you revisit it?"

The last two questions are the best predictors of capstone performance. Learners who can answer them are ready; learners who insist nothing is weak are not.

---

## 7. Signs a learner is struggling

| Signal | Likely cause | Response |
|---|---|---|
| Refactors by renaming variables only | Sees clean code as cosmetic | Do one structural refactor together: extract a method, flatten nesting, name a concept |
| Refactor changes behavior and breaks tests | Not running the suite between steps | Impose the discipline: small change, run, commit; repeat |
| Review comments are all formatting | Cannot yet see behavioral defects | Restrict them to three checklist areas (assertions, waiting, data) so attention lands where it matters |
| Reviews with 30 unranked comments | No prioritization model | Cap them at five comments; scarcity forces ranking |
| Approves everything quickly | Conflict-avoidant, or lacks confidence | Require one blocking-or-important finding per review, and make it a stated norm that finding nothing is a review failure |
| Defensive when receiving feedback | Reading code critique as personal | Reframe explicitly and privately; then have them review someone else's code, which builds empathy fast |
| Accepts every comment without thought | Deference | Require them to push back on at least one comment with a technical reason |
| Copies a well-known framework structure wholesale | Pattern-matching without a model | Ask which duplication each layer removes; delete the ones with no answer |
| Designs identically regardless of the scenario | Not using constraints | Change the constraints mid-exercise and require a redesign |
| Insists their design has no weaknesses | Confidence outrunning experience | Pose a concrete future change (mobile app added, suite triples in size) and ask what breaks first |

---

## 8. Remediation exercises

**Cannot refactor safely.**
Ten-step drill on one file: each step is a single named refactor (rename, extract method, flatten condition, remove duplication) followed by a full test run and a commit. Deliverable is the commit history, which proves the discipline.

**Cannot spot behavioral defects in review.**
Focused sets: five PRs each containing exactly one defect type (weak assertion, hard wait, shared data, swallowed error, locator coupling). Named category up front, so they learn what the smell looks like before hunting blind.

**Reviews are unhelpful.**
Rewrite drill: take their own review and rewrite every comment in observation-consequence-suggestion form with a priority label. Same content, professional delivery.

**Cannot receive feedback.**
Structured response format for each comment: "Accepted, changed to X" / "Partially — I did Y instead because Z" / "Disagree because Z, proposing we keep as-is." Removes the emotional load by making the response mechanical.

**Cannot design for context.**
Three scenarios, same product, twenty minutes each: solo tester with daily releases; five testers with weekly releases; twenty testers across three products with a shared platform team. Require one paragraph on what differs and why. Repetition under changing constraints teaches what a single design exercise cannot.

**Copies architecture without understanding.**
Deletion challenge: remove two layers from their design and keep it working. Then a paragraph on what was genuinely lost. Usually nothing, which is the lesson.

**Learners who are ahead.**
Have them write the team onboarding document for their framework ("how to add your first test in 20 minutes") and test it on a classmate who has never seen the repository — a real, humbling, valuable exercise. Or have them write an ADR (architecture decision record) set for three past decisions, including one they now consider wrong. Both produce artifacts usable in the capstone defense.

---

## 9. Assessment guidance for this part

- **Grade the refactor on behavior preservation plus rationale.** Require the before/after test run output. A refactor that changes behavior is not a refactor.
- **Grade reviews on the defects found and the prioritization**, per the rubric in [Assessment Strategy §6](../00-course-overview/04-assessment-strategy.md#6-project-rubrics). The planted-defect PR has a known answer key; weight the two subtle defects highest.
- **Require review comments to be labeled** blocking / important / optional. Unlabeled reviews get returned.
- **Grade the architecture document on fit and justification, not sophistication.** A three-layer design for a two-person team, well argued, outscores a seven-layer design copied from a conference talk.
- **Explicitly reward changed positions** in the constitution changelog. Say so in advance so learners know honesty pays.
- **Never grade "niceness" as a soft skill.** Grade it as clarity: a comment the author cannot act on is a defective comment, regardless of tone.

---

## 10. Capstone kickoff (Week 29, Session 2)

Use the second session of Week 29 to launch the capstone properly rather than as an announcement:

1. **Walk the [capstone brief](../capstone/00-capstone-overview.md) and rubric line by line.** No surprises at defense time.
2. **Show the review checklist from 8.2 being used as the grading instrument.** Learners should recognize every criterion.
3. **Have each learner write a one-page plan** — scope, layers, what they will build first, what they will deliberately not build — and give feedback that same session. Bad plans are cheap to fix now and expensive to fix in Week 32.
4. **Set the defense expectations explicitly:** "walk me through this file", "what happens if I delete line N", "what is the weakest part of your design", "what did you use AI for and what did you reject".
5. **Require the [AI usage log](../00-course-overview/05-ai-policy.md#ai-usage-log-format) from day one**, not retroactively. Retroactive logs are fiction.
6. **Name the most common capstone failure modes** now: starting with the framework instead of a working test; over-abstracting before there is anything to abstract; leaving CI to the last week; and letting flakiness accumulate rather than fixing it as it appears.

Then close the taught portion of the course by pointing back at the beginning:

> "In Week 1 the honest sentence was 'I don't know how to code.' The capstone exists so that the honest sentence becomes 'I can design, implement, debug, and maintain a TypeScript and Playwright framework, and I can explain the decisions behind it.' The defense is not a test of memory. It is the conversation you will have in every job interview and every design review for the rest of your career."
