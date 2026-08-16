# 01 — Course Overview

[← Back to Table of Contents](../README.md)

---

## 1. Course information

| Field | Detail |
|---|---|
| **Course title** | QA Automation Engineering with TypeScript and Playwright |
| **Format** | Instructor-led cohort or self-paced, 2 sessions/week × ~90 minutes |
| **Duration** | 32 weeks (64 sessions) including project and capstone weeks |
| **Total chapters** | 47 chapters across 8 parts |
| **Graded artifacts** | 47 quizzes, ~47 coding assignments, 4 projects, 1 capstone |
| **Programming language** | TypeScript (Node.js runtime) |
| **Test framework** | Playwright Test (`@playwright/test`) |
| **API automation** | Playwright `APIRequestContext` (the `request` fixture) |
| **Web automation** | Playwright (Chromium, Firefox, WebKit) |
| **Version control** | Git (+ a hosted remote such as GitHub/GitLab/Bitbucket) |
| **CI/CD** | Jenkins (declarative pipelines) |
| **Containerization** | Docker |
| **Starting level** | Complete beginner — no programming experience assumed |
| **Ending level** | Junior-to-intermediate QA Automation Engineer / aspiring SDET |

---

## 2. What this course is

This is a **software engineering course aimed at testers**. It teaches you to write code, then teaches you to write code whose only job is to judge whether other code works.

Most automation courses start with `page.click()` on day one. Learners come out able to copy a script and completely unable to fix it when the application changes. This course refuses that shortcut. You will spend the first third of the program learning to program — variables, conditions, loops, functions, arrays, objects, types, errors, and asynchronous execution — using QA examples the entire time. Only after you can write and reason about TypeScript do you touch HTTP, then API automation, then a browser, then framework design, then CI/CD.

The result is that when a test fails at 2 a.m. in a Jenkins pipeline, you will be able to read the trace, form a hypothesis, and decide whether the bug is in the application, the test, the data, or the environment. That skill — not memorized Playwright syntax — is what employers are paying for.

---

## 3. What this course is *not*

- **Not a Playwright API reference.** The official documentation at [playwright.dev](https://playwright.dev) is excellent and always more current than any book. This course teaches you the judgment to use it well.
- **Not a manual testing course.** Part I covers testing theory only to the depth an automation engineer needs to make automation decisions.
- **Not a "record and playback" course.** Playwright's codegen is introduced as a discovery tool, never as a way to author production tests.
- **Not a performance or security testing course.** Response-time assertions are covered as an API testing concern; load testing and penetration testing are out of scope.

---

## 4. Target audience

This course is designed for four overlapping groups:

**1. New QA Engineers (0-1 years experience)**
You have just entered the QA field, or you are still studying. You need both the testing mindset and the coding skill, and you need them in the right order.

**2. Manual QA Engineers transitioning to automation**
This is the primary audience. You already know how to find bugs, write test cases, and reason about requirements — that knowledge is a genuine advantage and this course leans on it constantly. What you lack is the programming foundation. You will likely find Part I easy and Part II humbling; that is expected and normal.

**3. Junior QA Engineers with partial automation exposure**
You may have run someone else's Playwright or Selenium suite, or written a few tests by pattern-matching existing code. You will benefit most from Parts III, V, VI, and VIII, which explain the reasoning you have been copying.

**4. Aspiring SDETs**
You want the software-engineering side of the role: architecture, clean code, code review, CI/CD, containerization. Parts VI-VIII and the capstone are built for you.

### Who should *not* take this course

- Experienced developers who only need Playwright specifics — skip to Part IV.
- Anyone unwilling to write code by hand while learning. Reading this book without doing the exercises will produce the illusion of competence and nothing else.

---

## 5. Prerequisites

### Required

| Prerequisite | Why |
|---|---|
| **Basic computer literacy** | Install software, manage files and folders, use a browser |
| **Willingness to use a terminal** | Every tool in this course is run from a command line. You do not need prior terminal experience; Chapter 2.1 teaches the handful of commands you need. |
| **Basic English reading** | Error messages, documentation, and log output are in English |
| **Time commitment** | 3 hours in session + 4-6 hours of independent practice per week |

### Explicitly NOT required

- Any programming language (including JavaScript or TypeScript)
- Knowledge of HTML, CSS, or the DOM (taught as needed in Chapter 5.2)
- Knowledge of HTTP or APIs (taught from scratch in Chapter 4.1)
- Prior use of Git, Jenkins, or Docker (taught from scratch in Part VII)
- A computer science degree, or any degree

### Helpful but optional

- Manual testing experience (makes Part I fast and Part III intuitive)
- Familiarity with a bug tracker such as Jira
- Having used a browser's DevTools to inspect an element

---

## 6. Technology stack and why each tool was chosen

**TypeScript** — Playwright's first-class language. Types catch a large class of automation mistakes at authoring time rather than at 2 a.m. in CI, and typed API models double as living documentation of the system under test. Learners also get transferable JavaScript skills.

**Playwright Test** — One tool covers Web automation, API automation, assertions, parallel execution, fixtures, reporting, and tracing. Learners do not have to assemble a framework from five libraries before writing their first test, and auto-waiting removes the single largest source of beginner flakiness.

**`APIRequestContext`** — Because API tests live in the same project, with the same language, runner, reporter, and CI job as UI tests, learners build one framework rather than two.

**Git** — Non-negotiable in any professional environment, and a hard prerequisite for CI.

**Jenkins** — Still the most common CI system in enterprise QA organizations, and its explicit pipeline stages make the CI concepts visible rather than magical. The concepts transfer directly to GitHub Actions or GitLab CI.

**Docker** — Solves "it passes on my machine": pinned browser binaries and system dependencies, identical locally and in CI.

---

## 7. Environment setup

Set up once, during Week 1, Session 1. Full walkthrough lives in Chapter 2.1.

### Required software

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | 20 LTS or newer | Runs TypeScript/JavaScript outside the browser |
| **npm** | Bundled with Node.js | Installs packages |
| **Visual Studio Code** | Latest | Editor |
| **Git** | 2.40+ | Version control |
| **A modern browser** | Latest | Manual exploration of the app under test |

### Installed later, when the relevant Part begins

| Tool | Introduced in |
|---|---|
| **Playwright** (`npm init playwright@latest`) | Chapter 4.4 |
| **Docker Desktop** | Chapter 7.3 |
| **Jenkins** (local, via Docker) | Chapter 7.2 |

### Recommended VS Code extensions

- **Playwright Test for VSCode** (`ms-playwright.playwright`) — run and debug tests from the editor
- **ESLint** — catches mistakes as you type
- **Prettier** — removes all formatting arguments from code review
- **GitLens** — makes Git history legible

### Verify your setup

```bash
node --version    # v20.x.x or newer
npm --version     # 10.x.x or newer
git --version     # 2.40 or newer
code --version    # any recent version
```

If all four print a version number, you are ready for Chapter 1.1.

---

## 8. Practice applications used in this course

Exercises and projects target deliberately chosen public practice targets so that no learner is blocked by access to a corporate environment.

| Purpose | Suggested target |
|---|---|
| **API practice (read/write, auth)** | A locally run mock/demo REST API (e.g. `json-server`, or a provided Docker image) |
| **Public REST practice** | `reqres.in`, `jsonplaceholder.typicode.com` |
| **Web automation practice** | `saucedemo.com`, `demoblaze.com`, or the course's own containerized demo shop |
| **Projects 3, 4, and capstone** | The **course demo e-commerce application** (auth, users, products, search, filtering, cart, checkout, orders, profile), run locally via Docker |

Running the target application locally is intentional: it teaches learners that automation depends on environment control, and it keeps tests from failing because a public sandbox is rate-limiting them.

---

## 9. Time budget

| Activity | Hours/week |
|---|---|
| Sessions (2 × 90 min) | 3.0 |
| Chapter reading | 1.5 |
| Exercises (G) | 1.5 |
| Coding assignment (H) | 2.0 |
| Quiz + review | 0.5 |
| **Total** | **~8.5** |

Project and capstone weeks shift the balance: less reading, 6-10 hours of building. Learners who cannot commit ~8 hours per week should extend the schedule to 40+ weeks rather than skip exercises.

---

## 10. Where to go next

1. [02 — Objectives and Outcomes](02-objectives-and-outcomes.md) — exactly what you will be able to do, and the checklist you will be measured against
2. [03 — Learning Progression](03-learning-progression.md) — why the chapters are in this order and what depends on what
3. [04 — Assessment Strategy](04-assessment-strategy.md) — how you will be graded
4. [05 — Generative AI Policy](05-ai-policy.md) — read before your first assignment
5. [06 — Weekly Schedule](06-weekly-schedule.md) — the 32-week plan
6. [Chapter 1.1 — What Is Software Testing?](../part-1-testing-fundamentals/01-what-is-software-testing.md) — start here
