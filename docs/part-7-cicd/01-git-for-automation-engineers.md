# Chapter 7.1 — Git for Automation Engineers

🟢 **Beginner** · [Part VII Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VII — CI/CD |
| **Estimated time** | 1 session (90 min) + 4 hours independent work |
| **Prerequisite chapters** | [Part VI](../part-6-framework-engineering/00-module-overview.md) complete |
| **Next chapter** | [7.2 Jenkins Pipelines](02-jenkins-pipelines.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Use** the core Git workflow: clone, status, diff, add, commit, push, pull, and log.
2. **Work** on feature branches, and **explain** why every change belongs on one.
3. **Write** commit messages that remain useful months later, at a sensible granularity.
4. **Resolve** a merge conflict in test code, and **verify** the resolution by running the suite.
5. **Open** a pull request, **respond** to review comments, and **merge** cleanly.
6. **Undo** mistakes safely with `revert` and `reset`, and **explain** why force pushing shared branches is dangerous.
7. **Configure** `.gitignore` correctly for a Playwright project, and **audit** a repository for committed secrets.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| A working test framework worth versioning | [Part VI](../part-6-framework-engineering/00-module-overview.md) |
| Basic terminal usage | [Chapter 2.1](../part-2-programming-fundamentals/01-thinking-like-a-programmer.md) |
| Secrets discipline and `.env` handling | [Chapters 4.8](../part-4-api-testing-and-automation/08-api-test-data-and-environments.md), [6.5](../part-6-framework-engineering/05-configuration.md) |

Prior Git experience is not assumed. If you have been committing to `main` all course, this chapter is for you.

---

## C. Concept Explanation

Git is usually introduced as backup, which undersells it. Its real functions are collaboration and history: it lets several people change the same codebase without blocking each other, and it produces a record of *why* the code became what it is. For a test framework, that history is frequently the only documentation that exists. When a locator changed six months ago and nobody remembers why, `git log` is where the answer lives — if the commits were written for a reader.

The workflow that makes this work is small. Create a **branch** for each change, so unfinished work never destabilizes what others depend on. Make **commits** at the granularity of a single idea, with messages that explain intent rather than mechanics: "extract cart page object to remove duplicated locators" tells a future reader something; "fix stuff" costs them an hour of reading diffs. Open a **pull request** so a colleague can review before it merges — and test code deserves review more than application code, not less, because a badly written test lies quietly for months.

**Merge conflicts** deserve explicit reassurance: they are normal, they mean two people changed nearby lines, and they are resolved by deciding what the combined code should be. The one rule that beginners skip is the important one: after resolving a conflict, run the suite. A resolution that compiles is not necessarily a resolution that is correct.

Finally, Git is where the secrets discipline from Part VI is enforced or lost. A `.gitignore` that covers `.env`, `storageState` files, `test-results/`, and `playwright-report/` prevents the most common accidents. And if a credential does get committed, the correct response is to **rotate it**, not merely to delete the file — the value is in the history, and history is distributed to everyone who cloned.

> **Full section coming in a follow-up pass.** Planned coverage:
> - What Git is for: collaboration and history, not backup
> - The three areas: working directory, staging area, repository
> - Core commands: `clone`, `status`, `diff`, `add`, `commit`, `push`, `pull`, `log`
> - Branching: creating, switching, and why branch-per-change
> - Commit granularity and message conventions used in this course
> - `git log` as documentation; `git blame` and `git bisect` for investigation
> - Merging, fast-forward versus merge commits, and rebase in one paragraph
> - Merge conflicts: reading the markers, resolving, and verifying by running tests
> - Pull requests: opening, describing, reviewing, responding, merging
> - Reviewing test code specifically, previewing [Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md)
> - Undoing safely: `revert`, `reset --soft/--hard`, `restore`, and stashing
> - Force push: why it is dangerous and when it is acceptable
> - `.gitignore` for a Playwright project, with an annotated example
> - Auditing for committed secrets, and rotating a leaked credential
> - What belongs in the repository and what does not (reports, traces, `node_modules`)

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: how a legible history lets you find when a test started failing and what changed alongside it; why the CI pipeline's first stage is a checkout, so branch strategy determines what gets tested; how PR review is the primary mechanism for enforcing the standards from Parts III and VI; why `git log` quality is graded in the CI/CD project; and how a committed `storageState` file is a credential leak indistinguishable from a committed password.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** branch, edit, add, commit, push
> 2. **Practical:** two `git log --oneline` histories compared for usefulness
> 3. **QA-oriented:** a merge conflict in a page object, resolved and verified by a suite run
> 4. **Automation-oriented:** a complete `.gitignore` for this framework, plus a secret-scan command over history

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Committing directly to `main`
> - One enormous commit at the end of the day
> - Messages like "wip", "fix", "update"
> - Committing `.env`, `storageState`, `node_modules`, `test-results/`, or `playwright-report/`
> - Resolving a conflict without running the tests
> - Force pushing a shared branch
> - Deleting a leaked secret's file and considering it handled
> - Never pulling, then facing a week-old conflict
> - Committing `test.only` or `page.pause()`
> - Treating PR review as a formality to be approved quickly

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Branch, make three logical commits, push, and open a pull request.
> - **Medium:** Create and resolve a deliberate conflict in a page object with a partner, verifying with the suite afterwards.
> - **Challenge:** Audit your repository history for secrets and stray artifacts, fix `.gitignore`, document a rotation plan for anything found, and reconstruct a clean branch-and-PR history for one recent change.

---

## H. Coding Assignment

> **Planned: Repository hygiene and collaboration workflow.** Deliver your framework in a repository with: a correct `.gitignore`, no secrets or artifacts in history (or a documented rotation plan), at least three feature branches with meaningful commits, one merged pull request containing a peer review you responded to, and one documented resolved conflict. Graded as part of the [CI/CD project](../00-course-overview/04-assessment-strategy.md#6-project-rubrics). Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 9 questions planned: command-purpose matching, commit-message critique, conflict-resolution ordering, `.gitignore` judgment, and two leaked-secret response scenarios. Answer key at [`answer-keys/part-7/01-git-for-automation-engineers.answers.md`](../answer-keys/part-7/01-git-for-automation-engineers.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *would your last ten commit messages help you find a regression six months from now?*

---

[← Part VII Overview](00-module-overview.md) · [Next: 7.2 Jenkins Pipelines →](02-jenkins-pipelines.md)
