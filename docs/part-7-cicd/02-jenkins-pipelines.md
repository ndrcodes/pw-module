# Chapter 7.2 — Jenkins Pipelines

🟡 **Intermediate** · [Part VII Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VII — CI/CD |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [7.1 Git for Automation Engineers](01-git-for-automation-engineers.md) |
| **Next chapter** | [7.3 Docker for Test Automation](03-docker-for-test-automation.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** what continuous integration is and what a pipeline does on each trigger.
2. **Write** a declarative `Jenkinsfile` with checkout, install, test, and report stages.
3. **Publish** an HTML report and **archive** traces, screenshots, and JUnit results — including on failure.
4. **Pass** configuration into a build with parameters, and **inject** secrets from the credential store.
5. **Ensure** a failing test fails the build, and **prove** it.
6. **Design** which suite runs on which trigger, using the suite definitions from [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md).
7. **Diagnose** a suite that passes locally and fails in CI, using a structured checklist.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| Branches, commits, and remotes | [Chapter 7.1](01-git-for-automation-engineers.md) |
| Environment-driven config and secrets | [Chapters 4.8](../part-4-api-testing-and-automation/08-api-test-data-and-environments.md), [6.5](../part-6-framework-engineering/05-configuration.md) |
| Reporters, traces, and artifacts | [Chapters 6.5](../part-6-framework-engineering/05-configuration.md), [6.8](../part-6-framework-engineering/08-debugging-playwright-tests.md) |
| Parallel-safe tests and data ownership | [Chapters 6.4](../part-6-framework-engineering/04-test-data-management.md), [6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) |
| Smoke, sanity, and regression suite design | [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) |

---

## C. Concept Explanation

Continuous integration means the suite runs automatically on every change, on a machine that is not yours, and reports to everyone. That last clause is what makes it valuable and what makes it demanding: results nobody can interpret are worse than no results, because they generate noise and erode trust.

A Jenkins declarative pipeline is a description of stages. **Checkout** fetches the branch under test. **Install** runs `npm ci` (deterministic, lockfile-respecting) and installs browsers with their system dependencies. **Test** runs the suite with a worker count suited to the agent. **Report** publishes the HTML report. Written out, it looks trivial — and two details separate a professional pipeline from a decorative one.

The first is failure handling. Publishing must live in `post { always { ... } }`, because the run you most need evidence from is the one that failed. A pipeline that publishes reports only on success has inverted its own purpose, and its failing builds cost a rerun every time. The second is secrets. Configuration comes in through parameters and environment variables, but credentials must come from Jenkins' credential store via `credentials()`, which binds and masks them. A literal token in a `Jenkinsfile` is in the repository, in the build page, and in any log that dumps the environment.

There is also a design decision that this chapter forces you to make concrete: **which suite runs when.** Running a 25-minute regression on every commit means developers wait or ignore it. The standard answer uses the suite definitions from [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) — a fast smoke suite on every commit, the full regression nightly or on demand — which is why that chapter's design work was not academic.

Finally, CI is where hidden assumptions surface. The agent has different CPU count, no `.env`, possibly a different timezone, and is running other jobs. When a suite passes locally and fails in CI, the difference is almost always one of those, and working a checklist beats rerunning hopefully.

> **Full section coming in a follow-up pass.** Planned coverage:
> - CI concepts: triggers, agents, workspaces, builds, and artifacts
> - Running Jenkins locally in Docker; the plugins this course uses
> - Declarative pipeline structure: `pipeline`, `agent`, `environment`, `stages`, `post`
> - Checkout, `npm ci`, `playwright install --with-deps`, and caching considerations
> - Running the suite: worker count from agent cores, and failing the build correctly
> - Reporters for CI: JUnit XML for Jenkins' test view, HTML for humans, blob for sharding
> - Publishing with HTML Publisher; archiving traces, screenshots, and videos
> - `post` conditions: `always`, `success`, `failure`, `unstable`, and what belongs in each
> - Build parameters: environment, tags, worker count, browser project
> - Credentials: binding, masking, and what still leaks
> - Trigger design: per-commit smoke, nightly regression, on-demand full runs
> - Notifications that people actually read
> - Retries in CI, and connecting build data to the flake register ([Chapter 6.9](../part-6-framework-engineering/09-diagnosing-flaky-tests.md))
> - Sharding across agents and merging reports
> - The CI-only failure checklist, worked on three real examples
> - How the same concepts map to GitHub Actions and GitLab CI

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: why owning the pipeline changes how a team sees the QA role; how build duration determines whether the suite becomes a merge gate; why a build that cannot fail is worse than no build; how published traces make failures diagnosable by anyone rather than only by the test's author; how retry data feeds the flake register; and how to respond when asked to disable a failing suite to unblock a release.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** a two-stage pipeline that checks out and runs the suite
> 2. **Practical:** the full four-stage pipeline with `post { always }` publishing and archiving
> 3. **QA-oriented:** parameterized builds for environment and tag, with credentials injected from the store
> 4. **Automation-oriented:** a smoke-on-commit job plus a nightly regression job, sharded across agents with merged reports

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - `|| true` or a swallowed exit code, so the build never fails
> - Publishing reports only on success
> - Secrets as literals in the `Jenkinsfile`
> - `npm install` instead of `npm ci`, and an uncommitted lockfile
> - A worker count copied from a tutorial rather than derived from the agent
> - Running the full regression on every commit
> - No archived traces, so CI failures are undiagnosable
> - Retries enabled to keep builds green, with no tracking
> - Assuming the agent has browsers, a `.env`, or your timezone
> - Rerunning the build repeatedly instead of working the checklist

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Write a pipeline that checks out, installs, and runs the suite, and see it go green.
> - **Medium:** Add report publishing and artifact archiving in `post { always }`; break a test and prove the report and trace are still published.
> - **Challenge:** Deliver a parameterized smoke job and a nightly regression job, with credentials from the store, correct failure propagation, and a written diagnosis of one CI-only failure you encountered.

---

## H. Coding Assignment

> **Planned: Working CI pipeline (part of the 10% CI/CD project).** Deliver a `Jenkinsfile` running your suite from a clean checkout; report and artifact publishing that works on failure; parameterized environment and tag selection; secrets from the credential store with none in the repository; evidence of a green build, a red build with published artifacts, and an install-stage failure; plus a documented worker-count decision based on the agent's cores. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: pipeline-stage purpose, `post` condition selection, secrets handling, `npm ci` reasoning, trigger design scenarios, and two CI-only-failure diagnosis items. Answer key at [`answer-keys/part-7/02-jenkins-pipelines.answers.md`](../answer-keys/part-7/02-jenkins-pipelines.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *can you prove your pipeline goes red when a test fails, and open the trace from the build page?*

---

[← 7.1 Git for Automation Engineers](01-git-for-automation-engineers.md) · [Next: 7.3 Docker for Test Automation →](03-docker-for-test-automation.md)
