---
id: intro
slug: /
title: QA Automation Engineering with TypeScript and Playwright
sidebar_label: Overview
---

# QA Automation Engineering with TypeScript and Playwright

### From "I don't know how to code" to "I can design, implement, debug, and maintain an automation framework"

A complete beginner-to-intermediate training program and technical book for people moving into QA Automation Engineering. No prior programming experience required.

| | |
|---|---|
| **Language** | TypeScript |
| **Automation framework** | Playwright (Web + API) |
| **API automation** | Playwright `APIRequestContext` |
| **CI/CD** | Jenkins |
| **Version control** | Git |
| **Containerization** | Docker |
| **Starting level** | Complete beginner (no coding experience) |
| **Ending level** | Junior-to-intermediate QA Automation Engineer / aspiring SDET |
| **Length** | 47 chapters, 4 projects, 1 capstone, 32-week schedule |

---

## Teaching philosophy

> **Understand the concept → Learn the syntax → Practice with small problems → Apply it to QA → Build a project → Integrate it into an automation framework.**

Every programming concept in this book is taught twice: once as a programming idea, and again as a QA automation tool. You will never learn a language feature without also learning why an automation engineer needs it.

---

## How to use this book

**If you are a learner:**

1. Read [Course Overview](00-course-overview/01-overview.md) and [Objectives and Outcomes](00-course-overview/02-objectives-and-outcomes.md) first.
2. Follow the chapters in order. The ordering is deliberate — see [Learning Progression](00-course-overview/03-learning-progression.md) for the dependency rules.
3. For each chapter: read sections A-F, then do **every** exercise in G before attempting the assignment in H. Take the quiz in I without looking at the answer key.
4. Answer keys live in [Answer keys](answer-keys/overview.md). Do not open them until you have written your own answers down.
5. Read the [Generative AI Policy](00-course-overview/05-ai-policy.md) before you use an AI assistant on any assignment. It is part of the curriculum, not a disclaimer.

**If you are an instructor:**

1. Use [Weekly Schedule](00-course-overview/06-weekly-schedule.md) as your term plan (2 sessions/week, ~90 minutes each).
2. Grading structure and rubrics: [Assessment Strategy](00-course-overview/04-assessment-strategy.md).

**Difficulty markers** appear on every chapter and assignment:

- 🟢 **Beginner** — no dependencies beyond the previous chapter
- 🟡 **Intermediate** — requires comfort with multiple earlier chapters
- 🔴 **Advanced** — requires design judgment, not just syntax

---

## Chapter template

Every chapter follows the same ten-section structure so you always know where to look:

| Section | Purpose |
|---|---|
| **A. Learning Objectives** | 3-7 measurable outcomes |
| **B. Prerequisite Knowledge** | What you must already know |
| **C. Concept Explanation** | The idea, from zero |
| **D. QA Context** | Why an automation engineer needs this |
| **E. Code Examples** | Simple → practical → QA-oriented → automation-oriented |
| **F. Common Mistakes** | What beginners get wrong and why |
| **G. Exercise** | Easy → Medium → Challenge |
| **H. Coding Assignment** | One larger applied problem with acceptance criteria |
| **I. Quiz** | 5-10 mixed-format questions (answer key stored separately) |
| **J. Review** | Key concepts, mistakes recap, competency check |

---

## Table of Contents

### Front Matter — Course Design

| Document | Contents |
|---|---|
| [01 — Course Overview](00-course-overview/01-overview.md) | Course information, target audience, prerequisites, tech stack, environment setup |
| [02 — Objectives and Outcomes](00-course-overview/02-objectives-and-outcomes.md) | 20 course objectives, learning outcomes, final competency checklist |
| [03 — Learning Progression](00-course-overview/03-learning-progression.md) | Difficulty progression, dependency map, ordering rules |
| [04 — Assessment Strategy](00-course-overview/04-assessment-strategy.md) | Grading weights, rubrics, failure modes, bonus challenges |
| [05 — Generative AI Policy](00-course-overview/05-ai-policy.md) | Allowed / restricted / required AI usage, AI usage log format |
| [06 — Weekly Schedule](00-course-overview/06-weekly-schedule.md) | 32-week, two-sessions-per-week term plan |

---

### Part I — Software Testing Fundamentals 🟢

*Why automation exists, and what it is for. No code yet.*

[Module Overview](part-1-testing-fundamentals/00-module-overview.md)

| # | Chapter | Level |
|---|---|---|
| 1.1 | [What Is Software Testing?](part-1-testing-fundamentals/01-what-is-software-testing.md) | 🟢 |
| 1.2 | [Manual Testing vs Test Automation](part-1-testing-fundamentals/02-manual-vs-automation-testing.md) | 🟢 |
| 1.3 | [Test Strategy and the Test Pyramid](part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md) | 🟢 |
| 1.4 | [Regression, Smoke, Sanity, and Test Case Quality](part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) | 🟢 |

---

### Part II — Programming Fundamentals 🟢🟡

*Programming from absolute zero, taught with QA examples throughout.*

[Module Overview](part-2-programming-fundamentals/00-module-overview.md)

| # | Chapter | Level |
|---|---|---|
| 2.1 | [Thinking Like a Programmer](part-2-programming-fundamentals/01-thinking-like-a-programmer.md) | 🟢 |
| 2.2 | [Data Types](part-2-programming-fundamentals/02-data-types.md) | 🟢 |
| 2.3 | [Variables and Constants](part-2-programming-fundamentals/03-variables-and-constants.md) | 🟢 |
| 2.4 | [Operators](part-2-programming-fundamentals/04-operators.md) | 🟢 |
| 2.5 | [Conditional Logic](part-2-programming-fundamentals/05-conditional-logic.md) | 🟢 |
| 2.6 | [Loops](part-2-programming-fundamentals/06-loops.md) | 🟢 |
| 2.7 | [Functions](part-2-programming-fundamentals/07-functions.md) | 🟢 |
| 2.8 | [Arrays](part-2-programming-fundamentals/08-arrays.md) | 🟡 |
| 2.9 | [Objects](part-2-programming-fundamentals/09-objects.md) | 🟡 |
| 2.10 | [TypeScript Fundamentals](part-2-programming-fundamentals/10-typescript-fundamentals.md) | 🟡 |
| 2.11 | [Error Handling](part-2-programming-fundamentals/11-error-handling.md) | 🟡 |
| 2.12 | [Asynchronous Programming](part-2-programming-fundamentals/12-asynchronous-programming.md) | 🟡 |
| 2.13 | [JSON](part-2-programming-fundamentals/13-json.md) | 🟢 |

**Project 1** — [Test Result Analyzer](projects/project-1-test-result-analyzer.md) 🟢 (after 2.8)
**Project 2** — [Mini Test Case Management App](projects/project-2-test-case-management.md) 🟡 (after 2.13)

---

### Part III — Automation Fundamentals 🟡

*What separates a script that passes from a test you can trust.*

[Module Overview](part-3-automation-fundamentals/00-module-overview.md)

| # | Chapter | Level |
|---|---|---|
| 3.1 | [Principles of Good Automated Tests](part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) | 🟡 |
| 3.2 | [Test Automation Architecture](part-3-automation-fundamentals/02-test-automation-architecture.md) | 🟡 |

---

### Part IV — API Testing and Automation 🟡

*API testing comes before Web automation: faster feedback, simpler debugging, fewer moving parts.*

[Module Overview](part-4-api-testing-and-automation/00-module-overview.md)

| # | Chapter | Level |
|---|---|---|
| 4.1 | [HTTP Fundamentals](part-4-api-testing-and-automation/01-http-fundamentals.md) | 🟢 |
| 4.2 | [REST APIs and CRUD](part-4-api-testing-and-automation/02-rest-api-and-crud.md) | 🟢 |
| 4.3 | [Designing API Test Cases](part-4-api-testing-and-automation/03-designing-api-test-cases.md) | 🟡 |
| 4.4 | [Playwright API Testing Basics](part-4-api-testing-and-automation/04-playwright-api-testing-basics.md) | 🟡 |
| 4.5 | [Write Operations: POST, PUT, PATCH, DELETE](part-4-api-testing-and-automation/05-playwright-api-write-operations.md) | 🟡 |
| 4.6 | [API Authentication and Authorization](part-4-api-testing-and-automation/06-api-authentication-and-authorization.md) | 🟡 |
| 4.7 | [Reusable API Clients and Models](part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md) | 🔴 |
| 4.8 | [API Test Data and Environment Configuration](part-4-api-testing-and-automation/08-api-test-data-and-environments.md) | 🔴 |

**Project 3** — [E-Commerce API Automation Suite](projects/project-3-api-automation.md) 🟡 (after 4.8)

---

### Part V — Web Automation with Playwright 🟡

*Now, and only now, we open a browser.*

[Module Overview](part-5-web-automation-playwright/00-module-overview.md)

| # | Chapter | Level |
|---|---|---|
| 5.1 | [Playwright Fundamentals](part-5-web-automation-playwright/01-playwright-fundamentals.md) | 🟡 |
| 5.2 | [Locator Strategy](part-5-web-automation-playwright/02-locator-strategy.md) | 🟡 |
| 5.3 | [Browser Actions](part-5-web-automation-playwright/03-browser-actions.md) | 🟡 |
| 5.4 | [Web Assertions](part-5-web-automation-playwright/04-web-assertions.md) | 🟡 |
| 5.5 | [Synchronization and Flaky Tests](part-5-web-automation-playwright/05-synchronization-and-flaky-tests.md) | 🔴 |

**Project 4** — [E-Commerce Web Automation](projects/project-4-web-automation.md) 🟡 (after 5.5 + 6.1)

---

### Part VI — Framework Engineering 🔴

*From scripts to a framework a team can live with for years.*

[Module Overview](part-6-framework-engineering/00-module-overview.md)

| # | Chapter | Level |
|---|---|---|
| 6.1 | [Page Object Model](part-6-framework-engineering/01-page-object-model.md) | 🟡 |
| 6.2 | [Fixtures](part-6-framework-engineering/02-fixtures.md) | 🔴 |
| 6.3 | [Authentication Strategies](part-6-framework-engineering/03-authentication-strategies.md) | 🔴 |
| 6.4 | [Test Data Management](part-6-framework-engineering/04-test-data-management.md) | 🔴 |
| 6.5 | [Configuration and Environments](part-6-framework-engineering/05-configuration.md) | 🟡 |
| 6.6 | [Cross-Browser and Mobile Emulation](part-6-framework-engineering/06-cross-browser-and-mobile.md) | 🟡 |
| 6.7 | [Parallel Execution and Sharding](part-6-framework-engineering/07-parallel-execution-and-sharding.md) | 🔴 |
| 6.8 | [Debugging Playwright Tests](part-6-framework-engineering/08-debugging-playwright-tests.md) | 🟡 |
| 6.9 | [Diagnosing Flaky Tests](part-6-framework-engineering/09-diagnosing-flaky-tests.md) | 🔴 |

---

### Part VII — CI/CD 🟡

*A test that only runs on your laptop is a personal hobby, not a quality gate.*

[Module Overview](part-7-cicd/00-module-overview.md)

| # | Chapter | Level |
|---|---|---|
| 7.1 | [Git for Automation Engineers](part-7-cicd/01-git-for-automation-engineers.md) | 🟢 |
| 7.2 | [Jenkins Pipelines](part-7-cicd/02-jenkins-pipelines.md) | 🟡 |
| 7.3 | [Docker for Test Automation](part-7-cicd/03-docker-for-test-automation.md) | 🔴 |

---

### Part VIII — Professional Automation Engineering 🔴

*The judgment that separates a junior from an engineer.*

[Module Overview](part-8-professional-engineering/00-module-overview.md)

| # | Chapter | Level |
|---|---|---|
| 8.1 | [Clean Code for Automation](part-8-professional-engineering/01-clean-code-for-automation.md) | 🟡 |
| 8.2 | [Code Review for Automation Engineers](part-8-professional-engineering/02-code-review-for-automation.md) | 🔴 |
| 8.3 | [Designing a Scalable Automation Architecture](part-8-professional-engineering/03-scalable-automation-architecture.md) | 🔴 |

---

### Projects

| Project | Title | After | Level | Weight |
|---|---|---|---|---|
| 1 | [Test Result Analyzer (CLI)](projects/project-1-test-result-analyzer.md) | Ch 2.8 | 🟢 | part of 15% |
| 2 | [Mini Test Case Management App](projects/project-2-test-case-management.md) | Ch 2.13 | 🟡 | part of 15% |
| 3 | [E-Commerce API Automation](projects/project-3-api-automation.md) | Ch 4.8 | 🟡 | 15% |
| 4 | [E-Commerce Web Automation](projects/project-4-web-automation.md) | Ch 6.1 | 🟡 | 20% |

### Capstone

[**Final Capstone Project — Full-Stack Automation Framework**](capstone/00-capstone-overview.md) 🔴 — 20%

Build and ship a complete TypeScript + Playwright framework covering API and UI automation, Page Objects, fixtures, data factories, auth state, environment config, parallel execution, Docker, and a Jenkins pipeline publishing HTML reports, screenshots, and traces.

---

## Repository layout

```
.
├── README.md                        This file
├── 00-course-overview/              Program design documents
├── part-1-testing-fundamentals/     ... through part-8-professional-engineering/
│   ├── 00-module-overview.md        Module intro, chapter map, module outcomes
│   ├── instructor-notes.md          Teaching guidance for the whole module
│   └── NN-chapter-name.md           Chapters (sections A-J)
├── projects/                        Project briefs 1-4
├── capstone/                        Final capstone brief
└── answer-keys/                     Quiz answer keys, mirroring chapter paths
```

---

## Status

This book is written in two phases.

- **Phase 1 (complete)** — Full architecture: all course design documents, module overviews, instructor notes, project briefs, capstone brief, and every chapter's Learning Objectives + Prerequisite Knowledge + concept preview.
- **Phase 2 (in progress, part by part)** — Full chapter bodies: Concept Explanation, QA Context, code examples, common mistakes, exercises, coding assignments, quizzes with answer keys, and reviews.

### Phase 2 progress

| Part | Chapters | Status |
|---|---|---|
| I — Software Testing Fundamentals | 4 | ✅ Complete, with answer keys |
| II — Programming Fundamentals | 13 | ✅ Complete — 2.1–2.13 with answer keys |
| III — Automation Fundamentals | 2 | ✅ Complete — 3.1–3.2 with answer keys |
| IV — API Testing and Automation | 8 | ✅ Complete — 4.1–4.8 with answer keys |
| V — Web Automation with Playwright | 5 | Awaiting Phase 2 |
| VI — Framework Engineering | 9 | Awaiting Phase 2 |
| VII — CI/CD | 3 | Awaiting Phase 2 |
| VIII — Professional Engineering | 3 | Awaiting Phase 2 |

Chapters awaiting Phase 2 content are clearly marked inside the file. Their objectives and prerequisites are final and usable for planning, and the [course overview](00-course-overview/01-overview.md), [projects](projects/), and [capstone](capstone/00-capstone-overview.md) are complete and teachable now.
