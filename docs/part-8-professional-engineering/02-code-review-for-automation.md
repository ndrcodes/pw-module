# Chapter 8.2 — Code Review for Automation Engineers

🔴 **Advanced** · [Part VIII Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VIII — Professional Automation Engineering |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [8.1 Clean Code for Automation](01-clean-code-for-automation.md) |
| **Next chapter** | [8.3 Designing a Scalable Automation Architecture](03-scalable-automation-architecture.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Review** an automation pull request against the ten-area checklist: locators, assertions, waiting, duplication, naming, independence, data, error handling, architecture, and configuration.
2. **Identify** the defects that matter most, including tests that cannot fail and shared state that only breaks under parallelism.
3. **Prioritize** comments as blocking, important, or optional, and **explain** the difference.
4. **Write** comments using observation, consequence, and suggestion, without commenting on the author.
5. **Distinguish** a team standard from a personal preference, and **label** each accordingly.
6. **Respond** to a review you receive: accepting, partially accepting, or disagreeing with a technical reason.
7. **Decide** whether to approve, request changes, or block, and **justify** the decision.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Clean code standards and a style guide | [Chapter 8.1](01-clean-code-for-automation.md) |
| Reliability properties and layer rules | [Part III](../part-3-automation-fundamentals/00-module-overview.md) |
| Locators, synchronization, assertions | [Part V](../part-5-web-automation-playwright/00-module-overview.md) |
| Page objects, fixtures, data, config | [Part VI](../part-6-framework-engineering/00-module-overview.md) |
| Pull request mechanics | [Chapter 7.1](../part-7-cicd/01-git-for-automation-engineers.md) |

---

## C. Concept Explanation

Code review is where standards become real. Everything you have learned about locators, waiting, data ownership, and layering is enforceable only if someone looks at a pull request and says so before it merges — and once you are the engineer who does that well, you shape how an entire team writes tests. That is the promotion path in this discipline, and it is a learnable skill rather than a personality trait.

Reviewing automation is different from reviewing application code because the failure modes are different. An application bug usually announces itself; a bad test lies quietly. The two defects a reviewer must never miss are **a test that cannot fail** — weak assertions, a missing `await`, a swallowed error — and **shared state that only breaks under parallel execution**, which passes review, passes locally, and starts failing intermittently next month. Both look completely fine at a glance, which is exactly why a checklist beats intuition.

The second half of the skill is communication, and it is not a soft add-on: a comment the author cannot act on is a defective comment regardless of tone. Three practices carry most of the value. **Prioritize**, because thirty unranked nitpicks hide the one blocking issue — ask "if this merges as-is, what goes wrong?" and label accordingly. **Structure each comment** as observation, consequence, suggestion: "this locator is positional, so it breaks when a row is inserted; `getByRole('row', { name: ... })` would survive." **Separate standards from preferences** explicitly, because a reviewer who presents their taste as a rule loses credibility and, eventually, influence.

Receiving review is the other half of the same skill, and both failure modes are worth naming. Defensiveness wastes everyone's time; instant capitulation to every comment means the reviewer's opinion has replaced your judgment. The professional response to each blocking comment is one of three things: accept and change, partially accept with a stated alternative, or disagree with a technical reason. "I disagree because X" is a fully legitimate answer, and in this course it is rewarded.

> **Full section coming in a follow-up pass.** Planned coverage:
> - What code review is for: shared ownership and knowledge transfer, with defect-finding as a side effect
> - Why test code needs review more than application code
> - The ten-area checklist, with what to look for and a worked example of each
> - The two defects a reviewer must never miss, and how to spot them
> - Prioritization: blocking, important, optional, and preference
> - The observation-consequence-suggestion structure
> - Reviewing for what is *missing*: absent negative cases, absent cleanup, absent assertions
> - Reviewing architecture: layer violations, upward dependencies, unjustified abstractions
> - Standards versus preferences, and how to say which you are invoking
> - Review scope and size: why a 40-file PR gets a worse review than a 4-file one
> - Approving, requesting changes, and blocking: choosing correctly
> - Responding to review: the three legitimate responses
> - Disagreement, escalation, and deciding when to defer
> - Reviewing across experience levels, in both directions
> - Using the checklist as a self-review before opening a PR

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: how this checklist is the actual grading instrument for [Project 4](../projects/project-4-web-automation.md) and the [capstone](../capstone/00-capstone-overview.md), so learners are reviewed by the standard they have practiced applying; how reviewing developers' unit tests extends a QA engineer's influence beyond their own repository; why approving a test that cannot fail is worse than blocking a good one; and how a weekly review ritual keeps a suite's standards from drifting as a team grows.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** one weak assertion, with the review comment that catches it
> 2. **Practical:** two reviews of the same PR — thirty unranked nitpicks that miss the real bug, versus four prioritized comments that find it
> 3. **QA-oriented:** five blunt comments rewritten in observation-consequence-suggestion form, technical content preserved
> 4. **Automation-oriented:** a PR with ten planted defects, including a test that cannot fail and a fixture sharing state, worked through the full checklist

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Reviewing only formatting and style
> - Approving quickly to be helpful
> - Thirty comments with no priorities
> - Comments that state a problem with no suggestion
> - Presenting personal preference as a team standard
> - Rewriting the author's approach in your own style without cause
> - Commenting on the author rather than the code
> - Missing what is absent: no cleanup, no negative cases, no assertions
> - Ignoring architecture and reviewing line by line only
> - Defensiveness or blanket capitulation when receiving review
> - Merging your own PR without review because it is "only test code"

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Review a small PR restricted to three checklist areas (assertions, waiting, data) and label each comment's priority.
> - **Medium:** Review the ten-defect PR fully; compare your findings with the answer key and note what you missed and why.
> - **Challenge:** Peer-review a classmate's [Project 4](../projects/project-4-web-automation.md), then respond in writing to the review you received — accepting, partially accepting, or disagreeing with a technical reason for each comment.

---

## H. Coding Assignment

> **Planned: Code review portfolio (part of the 10% review and architecture assignment).** Deliver three artifacts: (1) a full written review of the supplied ten-defect pull request, with prioritized, actionable comments and a stated approve/request-changes decision; (2) a peer review of a classmate's project; (3) your written response to the review you received, including at least one reasoned disagreement. Graded on defects found, prioritization accuracy, and actionability of comments. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: classify-the-comment-priority, identify-the-defect-a-reviewer-must-catch, rewrite-the-comment, standard-versus-preference judgment, and two "approve, request changes, or block?" scenarios. Answer key at [`answer-keys/part-8/02-code-review-for-automation.answers.md`](../answer-keys/part-8/02-code-review-for-automation.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *for the last PR you reviewed, which comment was blocking — and if you found none, are you sure?*

---

[← 8.1 Clean Code for Automation](01-clean-code-for-automation.md) · [Next: 8.3 Designing a Scalable Automation Architecture →](03-scalable-automation-architecture.md)
