# Instructor Notes — Part VII: CI/CD

[← Module Overview](00-module-overview.md) · [Table of Contents](../README.md)

**This part is where infrastructure friction can consume the learning.** Half a session lost to a Jenkins plugin, a Docker permission error, or a corporate proxy is common. Prepare the environment in advance, provide a known-good fallback, and be ruthless about keeping the focus on concepts rather than yak-shaving.

---

## 1. Teaching goals for the module

1. **Learners own their pipeline.** Not "DevOps set it up" — they wrote it, they can read it, they can fix it.
2. **Artifacts on failure are non-negotiable.** A build that fails without evidence is a wasted build.
3. **Secrets never touch the repository.** Establish this as a professional identity issue, not a course rule.
4. **CI differences are diagnosable, not magical.** By the end, "it fails only in CI" should trigger a method, not a shrug.

---

## 2. Preparation before the module (do this a week ahead)

| Item | Why | Fallback |
|---|---|---|
| Jenkins running in Docker, image pre-pulled | Plugin installs over a slow network eat a session | A shared instructor-hosted Jenkins with per-learner jobs |
| HTML Publisher, JUnit, and Git plugins pre-installed | Plugin discovery is not the lesson | Pre-baked Jenkins image with plugins included |
| Playwright Docker image pre-pulled on every machine | The first pull is ~1-2 GB | Local registry mirror, or pull during a break |
| A demo repository with a known-good `Jenkinsfile` | Unblocks learners who are stuck on syntax | Provide after 20 minutes of independent attempt, not before |
| Verified Docker Desktop permissions on lab machines | Common corporate blocker | Cloud VMs, or WSL2 setup instructions verified in advance |
| Git remote access confirmed (SSH keys or tokens) | Auth failures block Chapter 7.1 entirely | HTTPS with personal access tokens as the documented path |

Run the whole flow yourself on a lab machine before the session. Every instructor who skips this loses a session to something small.

---

## 3. Common beginner misconceptions

| Chapter | Misconception | Correction |
|---|---|---|
| 7.1 | "Commit at the end of the day" | Show two `git log` outputs: one with six meaningful commits, one with "wip", "wip2", "fix". Ask which they would want during an incident. |
| 7.1 | "Branches are for big features" | Branch per change, always. Demo how a branch keeps a broken experiment out of everyone's way. |
| 7.1 | "Merge conflicts mean something went wrong" | They are normal. Manufacture one deliberately and resolve it live, slowly. |
| 7.1 | "`git push --force` fixes my mistake" | Show what it does to a colleague's clone. Teach `revert` and `reset --soft` first. |
| 7.1 | "Pull requests are for developers" | Test code deserves review more, not less: locators, waits, data, isolation. Preview Chapter 8.2. |
| 7.1 | "Commit messages don't matter for test code" | `git log --oneline` for the last month is the only maintenance history a suite has. |
| 7.2 | "CI runs my tests the same way I do" | Different machine, no browsers, no `.env`, less CPU, shared with other jobs. Enumerate this list explicitly. |
| 7.2 | "Green pipeline means working pipeline" | Break a test on purpose and require them to see red. A pipeline that cannot fail is theatre. |
| 7.2 | "Publish the report after tests pass" | `post { always }`. The failing run is the one you need evidence from. |
| 7.2 | "Secrets in env blocks are fine" | Show a credential echoed into a build log by an innocent `printenv`, then switch to `credentials()`. |
| 7.2 | "One pipeline runs everything" | Smoke on every commit, regression nightly. Connect to Chapter 1.4's suite design. |
| 7.2 | "`npm install` in CI" | `npm ci` is deterministic and honors the lockfile. Explain why reproducibility matters more than convenience. |
| 7.3 | "Docker is for deployment" | Reproducibility: pinned browsers and libraries, identical everywhere. |
| 7.3 | "A container is a virtual machine" | Draw the difference: shared kernel, isolated filesystem and process space. Enough to reason, no more. |
| 7.3 | "I'll install browsers at runtime" | Time both approaches. Baked-in wins by minutes per build. |
| 7.3 | "The image will behave identically" | Timezone, locale, fonts, CPU count, and `/dev/shm` size all differ. Make them find at least one difference. |
| 7.3 | "`latest` is the convenient tag" | Pin the version. Show a suite that broke overnight because `latest` moved. |

---

## 4. Concepts learners find genuinely difficult

**Why CI fails when local passes.** Give them a diagnostic checklist rather than intuition: environment variables present? browsers installed? base URL reachable from the agent? CPU count and therefore timing? state left over from a previous build? clock and timezone? Then have them work the list on a real failure. The checklist is the deliverable.

**Declarative pipeline structure.** Groovy syntax errors are demoralizing and uninstructive. Provide a skeleton with stage names and empty bodies so they fill in behavior rather than fight braces. Syntax fluency is not a learning objective here.

**Credentials.** The mechanics are simple; the discipline is not. Make the failure vivid: an accidental `env | sort` in a build step, with a fake but realistic-looking token in the log. Then show binding via `credentials()` and masking.

**Dockerfile layer caching.** Learners write a Dockerfile that reinstalls everything on every build. Teach the one rule that matters: copy `package*.json` and install *before* copying source, so dependency layers cache. Show build times before and after.

**Choosing what runs when.** Learners default to "run everything on every commit." Make them do the arithmetic: commits per day × suite minutes × agents. Then have them design a smoke subset and defend its composition — which is Chapter 1.4 arriving with real consequences.

---

## 5. Suggested demonstrations

### Demo 1 — The illegible history (10 min, Chapter 7.1)

Two `git log --oneline` outputs on screen, same work, different discipline. Ask which repository they would rather inherit. Then show `git bisect` finding a regression in the good history and being useless in the bad one.

### Demo 2 — Conflict resolution, slowly (20 min, Chapter 7.1)

Two branches editing the same page object. Show the conflict markers, explain each section, resolve, verify by running the tests. Emphasize the last step: resolving a conflict without running tests is guessing.

### Demo 3 — The pipeline that cannot fail (15 min, Chapter 7.2)

A `Jenkinsfile` with `npx playwright test || true`. Break a test. Build stays green. Ask what the pipeline is for. Then fix it and rebuild. This demo permanently changes how learners read pipeline code.

### Demo 4 — Artifacts on failure (20 min, Chapter 7.2)

Same failing build twice: once with reports only on success (nothing to look at), once with `post { always }` publishing the report and archiving traces. Open the trace from the Jenkins build page and diagnose the failure there. Connects Part VI's tooling to CI.

### Demo 5 — The leaked secret (10 min, Chapter 7.2)

Print a fake token via an environment dump, show it in the build log and in the build page, then bind it properly and show `****` masking. Then note that logs are often world-readable inside a company.

### Demo 6 — Local versus container differences (20 min, Chapter 7.3)

Run the same suite locally and in the container. Deliberately include a test sensitive to timezone or locale. Diagnose the difference together, then decide whether to pin the environment or make the test locale-independent. Both answers are legitimate and the discussion is the lesson.

### Demo 7 — Layer caching (10 min, Chapter 7.3)

Two Dockerfiles, one with `COPY . .` before `npm ci`. Time a rebuild after a one-line source change: minutes versus seconds.

### Demo 8 — `/dev/shm` and browser crashes (10 min, Chapter 7.3)

Run Chromium in a container with a small `/dev/shm` and show the crash, then fix it with the documented flag or `--ipc=host`. This is the single most common real-world containerized-Playwright failure, and seeing it once saves learners hours later.

---

## 6. Suggested live activities

| Activity | Chapter | Format | Time |
|---|---|---|---|
| Branch, commit, push, open a PR on your own suite | 7.1 | Individual | 25 min |
| Deliberate conflict and resolution in pairs | 7.1 | Pairs | 25 min |
| Peer review of a partner's PR (locators, waits, data) | 7.1 | Pairs, swap | 25 min |
| Fill in a skeleton `Jenkinsfile` stage by stage | 7.2 | Individual | 35 min |
| Break a test and prove the build goes red with artifacts | 7.2 | Individual | 20 min |
| Parameterize the build for environment and tag | 7.2 | Individual | 25 min |
| Design a five-minute smoke suite and defend its contents | 7.2 | Groups of 3 | 25 min |
| Write a Dockerfile, then optimize it for caching | 7.3 | Individual | 30 min |
| Find one behavioral difference between local and container | 7.3 | Pairs, report findings | 30 min |
| CI failure triage using the diagnostic checklist | 7.2, 7.3 | Whole class | 30 min |

The **peer review** activity is doing double duty: it teaches PR mechanics and rehearses Chapter 8.2's review skills a week early, which makes Part VIII noticeably smoother.

---

## 7. Questions to ask learners

- "Read your last five commit messages. Would they help you six months from now?"
- "You are on `main` and about to experiment. What is your first command?"
- "You resolved the conflict. What must you do before pushing?"
- "Your pipeline is green. Prove it can go red."
- "A test failed in last night's build. What do you open first?"
- "Where does the base URL come from in this build? Where does the password come from?"
- "Would this credential appear in the build log if a step ran `env`?"
- "The suite takes 18 minutes. Which tests run on every commit, and why those?"
- "Your suite passes locally and fails in CI. Work the checklist out loud."
- "How many CPUs does the agent have, and what does your worker count assume?"
- "Why is `npm ci` used here instead of `npm install`?"
- "Your image uses `:latest`. What happens to your suite next Tuesday?"
- "What is left behind in the test environment after this build?"

---

## 8. Signs a learner is struggling

| Signal | Likely cause | Response |
|---|---|---|
| Commits directly to `main` throughout | Habit from solo work | Make branch-and-PR a submission requirement, not advice |
| Terrified of merge conflicts, avoids pulling | Never resolved one with support | Walk through two together; it stops being scary immediately |
| Pipeline "works" but never fails | `|| true`, or a missing exit-code propagation | Require the break-it proof for the CI/CD project |
| Reports published only on success | Copied a happy-path template | Demo 4, then require `post { always }` |
| Secrets in the `Jenkinsfile` or `.env` committed | Time pressure and convenience | Hard rule with a grade cap; add a pre-commit secret scan to the project |
| Rebuilds repeatedly hoping for green | No diagnostic method | Give the checklist; require a written diagnosis before the next build |
| Stuck for hours on Docker permissions | Environment problem, not a learning problem | Unblock immediately with the fallback environment; the concept is the objective, not the setup |
| Suite passes in container only with `--workers=1` | Resource limits or `/dev/shm` | Demo 8, then measure and set workers from the agent's CPU count |
| Blames Jenkins for flakiness | Has not connected CI to Part VI defects | Run their suite locally with CPU throttling and reproduce it there |

---

## 9. Remediation exercises

**Git avoidance.**
Structured drill: create a branch, make three logical commits, push, open a PR, respond to one review comment with a follow-up commit, merge, delete the branch. Repeat twice more with different changes until the loop is automatic.

**Cannot resolve conflicts.**
Manufacture five conflicts of increasing difficulty, all in test code (same locator changed two ways, a fixture edited by both, an import block). Require running the suite after each resolution.

**Pipeline that cannot fail.**
Require three proofs: a passing build, a failing build with published report and archived trace, and a build that fails at the install stage. Each with a screenshot of the Jenkins page.

**Secrets discipline.**
Have them audit their own repository history for secrets (`git log -p | grep -i` patterns for tokens and passwords), report findings, and set up a pre-commit check. Then discuss rotation: a leaked secret is not fixed by deleting the commit.

**Cannot diagnose CI-only failures.**
Provide three CI failures with logs and artifacts: one missing env var, one missing browser dependency, one timing failure caused by a busy agent. Require a written diagnosis using the checklist before any fix.

**Inefficient Docker builds.**
Optimization challenge: reduce rebuild time after a one-line source change by at least 80%, and explain each change in terms of layer caching.

**Learners who are ahead.**
Sharded CI with merged HTML reports across shards; a nightly regression job separate from the per-commit smoke job; a flake register that parses JSON results from the last N builds and posts the top unstable tests; a `docker compose` setup that starts the demo app, waits for health, runs the suite, and tears everything down in one command. All four appear in real jobs, and the last one is directly reusable in the capstone.

---

## 10. Assessment guidance for this part

- **Require the red build.** No CI/CD project passes without evidence of a failing build that still published its report and artifacts.
- **Scan the repository and the build log for secrets** before anything else. A leaked credential caps the project grade regardless of quality elsewhere — say so in advance, then enforce it.
- **Grade the Git history.** Branch usage, commit granularity, and message quality are 20% of the CI/CD project for good reason.
- **Verify from a clean clone on a machine that is not theirs.** Undocumented setup steps are the most common deduction.
- **Check `npm ci` versus `npm install`**, and whether the lockfile is committed. Small detail, real reproducibility consequence.
- **Ask where the worker count came from.** "Four because the agent has four cores" is a good answer; "four because the docs said so" is not.

---

## 11. Transition into Part VIII

Close by pointing at the last remaining gap:

> "Your suite now runs automatically, in a reproducible environment, and publishes evidence when it fails. There is one thing left that determines whether it is still valuable in a year: whether another engineer can read it, change it, and trust it. Part VIII is about that — clean code for tests, reviewing someone else's automation, and being able to defend an architecture in a room full of people who will push back."

Then set up the capstone explicitly: everything from Parts II-VII is a component, and the capstone is the integration — including a live architecture defense where "I copied this pattern" will not be an acceptable answer.
