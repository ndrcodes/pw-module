# 02 — Course Objectives, Learning Outcomes, and Competency Checklist

[← Back to Table of Contents](../README.md)

---

## 1. Course objectives

These are the twenty commitments this course makes to you. Each is mapped to the chapters that deliver it and the artifact that proves it.

| # | Objective | Delivered in | Proven by |
|---|---|---|---|
| 1 | Understand fundamental programming concepts | 2.1-2.7 | Quizzes 2.1-2.7, Project 1 |
| 2 | Solve basic programming problems using logical thinking | 2.1, 2.5-2.7 | Assignments 2.5-2.7 |
| 3 | Write TypeScript programs | 2.2-2.10 | Project 1, Project 2 |
| 4 | Understand arrays, objects, functions, and asynchronous programming | 2.7-2.9, 2.12 | Project 2, Assignment 2.12 |
| 5 | Understand HTTP, REST APIs, requests, and responses | 4.1-4.2 | Quizzes 4.1-4.2 |
| 6 | Design effective API test cases | 4.3 | Assignment 4.3, Project 3 |
| 7 | Build API automation using Playwright | 4.4-4.8 | Project 3 |
| 8 | Build Web automation using Playwright | 5.1-5.5 | Project 4 |
| 9 | Use reliable locator strategies | 5.2 | Project 4, code review assignment |
| 10 | Write effective assertions | 4.3, 5.4 | Projects 3 and 4 |
| 11 | Understand synchronization and avoid flaky tests | 5.5, 6.9 | Assignment 6.9, Capstone |
| 12 | Design Page Object Models | 6.1 | Project 4, Capstone |
| 13 | Use Playwright fixtures | 6.2 | Capstone |
| 14 | Manage test data and authentication | 6.3-6.4, 4.6, 4.8 | Capstone |
| 15 | Configure parallel execution | 6.7 | Capstone |
| 16 | Debug failed and flaky tests | 6.8-6.9 | Assignment 6.8, Capstone |
| 17 | Integrate automation with Git and Jenkins | 7.1-7.2 | CI/CD project, Capstone |
| 18 | Run automation in Docker | 7.3 | Capstone |
| 19 | Apply clean-code and software-engineering principles to QA automation | 8.1-8.2 | Code review assignment, Capstone |
| 20 | Design and implement a maintainable automation framework | 3.2, 6.1-6.9, 8.3 | Capstone |

---

## 2. Learning outcomes by part

Learning outcomes are written as observable behaviors. If you cannot demonstrate the behavior, you have not finished the part — regardless of whether you read every page.

### Part I — Software Testing Fundamentals

On completion you can:

- Explain the purpose of testing to a non-technical stakeholder without using the word "bug-free"
- Distinguish QA from QC and verification from validation, with a concrete example of each
- Given a feature and a release cadence, argue which tests belong at the unit, API, and UI layers of the test pyramid
- Given a list of 20 manual test cases, classify each as "automate now", "automate later", or "keep manual", and defend the classification
- Distinguish smoke, sanity, and regression suites by purpose, scope, and runtime budget
- Explain why automation code is production code and must be engineered as such

### Part II — Programming Fundamentals

On completion you can:

- Decompose a stated problem into input, process, and output, and express the process as pseudocode before writing code
- Choose an appropriate data type for a value and explain the consequences of choosing wrongly
- Declare variables with `let` and `const`, apply type annotations, and explain when inference is sufficient
- Predict the result of expressions mixing arithmetic, comparison, and logical operators, including `===` vs `==`
- Implement branching logic using `if`/`else if`/`else`, ternary, and `switch`, and choose between them appropriately
- Iterate over collections using `for`, `while`, `do...while`, `for...of`, and `forEach`, and choose the right loop for a task
- Write functions with typed parameters, optional and default parameters, and typed return values, and explain scope and purity
- Transform and interrogate arrays of test data using `filter`, `map`, `find`, `some`, `every`, `sort`, and `reduce`
- Model real QA entities (test cases, results, users, products) as objects and arrays of objects, and destructure them
- Define type aliases, interfaces, union types, optional properties, enums, and a basic generic; narrow a union safely
- Throw, catch, and construct errors; write error messages that make a failure diagnosable; explain how assertions differ from exceptions
- Explain the difference between synchronous and asynchronous execution; use `async`/`await` correctly; run operations sequentially vs concurrently with `Promise.all()`; identify a missing `await`
- Read and write nested JSON, convert between JSON text and TypeScript objects, and explain how JSON differs from a TypeScript object

### Part III — Automation Fundamentals

On completion you can:

- Evaluate an existing automated test against independence, isolation, and determinism, and identify which property it violates
- Restructure a test into explicit Arrange → Act → Assert phases
- Choose between setup/teardown and per-test data creation for a given scenario
- Explain the responsibility of each layer in a layered automation architecture and place a proposed piece of code in the correct layer
- Explain the roles of test runner, assertion library, reporter, logs, and artifacts in a failure investigation

### Part IV — API Testing and Automation

On completion you can:

- Read an HTTP request/response pair and identify method, URL, path and query parameters, headers, body, status code, and cookies
- Choose the correct HTTP method and expected status code for a given operation
- Map REST resources and CRUD operations to endpoints, and critique an endpoint design
- Design a test set for an endpoint covering status codes, body content, headers, schema, auth, authorization, negative cases, boundaries, data integrity, and response time
- Write Playwright API tests for GET, POST, PUT, PATCH, and DELETE with headers, bodies, and query parameters
- Authenticate an API test suite with a token and assert authorization boundaries between users
- Refactor duplicated request code into a typed, reusable API client with request/response models
- Drive the same suite against multiple environments using configuration and environment variables, without hardcoded URLs or secrets

### Part V — Web Automation with Playwright

On completion you can:

- Explain the relationship between Browser, BrowserContext, and Page and why context isolation matters for test independence
- Choose a locator using the preference order role → label → text → placeholder → test ID → CSS → XPath, and justify a deviation
- Rewrite a brittle CSS or XPath locator into a resilient one
- Perform clicks, form fills, selects, checkbox and radio interactions, file uploads, and keyboard/mouse actions
- Assert visibility, text, value, attribute, URL, title, element count, and element state using web-first assertions
- Explain Playwright's auto-waiting, replace hard waits with assertion-based or network-based synchronization, and articulate why `waitForTimeout` is a defect in test code

### Part VI — Framework Engineering

On completion you can:

- Design page and component classes with clear responsibilities, and recognize over-abstraction
- Write custom fixtures for authenticated pages, API clients, and seeded data, and explain fixture scope and teardown
- Implement authentication once and reuse it via `storageState` or API-issued tokens instead of logging in through the UI in every test
- Build data factories producing valid, unique, and overridable test entities, and clean up what they create
- Configure `playwright.config.ts` for base URL, timeouts, retries, reporters, projects, and environment-specific settings, keeping secrets out of the repository
- Execute a suite across Chromium, Firefox, WebKit, branded Chrome, and mobile emulation using projects
- Configure workers, full parallelism, and sharding; identify tests that cannot run in parallel and explain why
- Investigate a failure using headed mode, the Inspector, the Trace Viewer, screenshots, video, and logs
- Given a flaky test, categorize the root cause (timing, locator, data, environment, network, concurrency, application bug, or test code) and fix the cause rather than adding a retry

### Part VII — CI/CD

On completion you can:

- Use branches, commits, pushes, pulls, merges, and pull requests to collaborate on a test repository, and resolve a simple merge conflict
- Write a Jenkins declarative pipeline that checks out code, installs dependencies, runs tests, publishes an HTML report, and archives artifacts
- Pass configuration and secrets into a pipeline via environment variables and credentials rather than committed files
- Build a Docker image containing the correct browser dependencies and run the suite reproducibly in a container
- Explain why a suite that passes locally may fail in CI, and diagnose the difference

### Part VIII — Professional Automation Engineering

On completion you can:

- Refactor a test file for naming, function size, single responsibility, duplication, and readability without changing its behavior
- Review a peer's automation pull request against locator quality, assertions, waiting, duplication, naming, test independence, test data, and error handling, and leave specific actionable comments
- Design an end-to-end framework architecture for a stated product and team, justify each layer, and explain the trade-offs you accepted

---

## 3. Final competency checklist

Use this as a self-assessment gate. A junior-to-intermediate QA Automation Engineer should be able to answer "yes, and I can demonstrate it" to every line. Tick a box only after you have done the thing at least once without copying it.

### Programming

- [ ] I can explain the difference between `let` and `const`, and I default to `const`
- [ ] I can choose a correct data type for any value and annotate it
- [ ] I can predict the output of code mixing conditionals and loops
- [ ] I can write a function with typed parameters, optional parameters, and a typed return value
- [ ] I can chain `filter`, `map`, and `reduce` over an array of test results to compute a statistic
- [ ] I can model a domain entity as an `interface` and explain why I chose `interface` over `type`
- [ ] I can use a union type and narrow it safely
- [ ] I can write and use a simple generic function
- [ ] I can throw a custom error with a diagnosable message and catch it selectively
- [ ] I can explain what a Promise is, in my own words, without saying "it's like a callback"
- [ ] I can spot a missing `await` by reading code
- [ ] I can explain when to use `Promise.all()` and when it is the wrong choice
- [ ] I can parse and stringify nested JSON and safely read a deeply nested optional field

### Testing and automation judgment

- [ ] I can decide whether a given test case is worth automating, and say why
- [ ] I can place a test at the correct layer of the test pyramid
- [ ] I can write a test that passes and fails for the right reasons
- [ ] My tests do not depend on execution order
- [ ] My tests create the data they need and clean up after themselves
- [ ] I structure every test as Arrange → Act → Assert
- [ ] I can explain each layer of my framework's architecture and what does not belong in it

### API automation

- [ ] I can read a request/response pair in DevTools and describe every part of it
- [ ] I can choose the right method and expected status code for an operation
- [ ] I can design positive, negative, boundary, and authorization tests for an endpoint
- [ ] I can write Playwright tests for all five main HTTP methods
- [ ] I can authenticate a suite and assert that user A cannot read user B's data
- [ ] I can validate a response against a schema, not just spot-check two fields
- [ ] I have built a typed, reusable API client instead of repeating `request.post` in every test
- [ ] I can run the same suite against two environments by changing configuration only

### Web automation

- [ ] I can explain Browser vs BrowserContext vs Page
- [ ] I default to role-based locators and can justify every deviation
- [ ] I can rewrite a brittle locator into a stable one
- [ ] I can automate a full login → search → cart → checkout flow
- [ ] I use web-first assertions instead of manual waits plus boolean checks
- [ ] I have removed every `waitForTimeout` from my own code and can explain what replaced it
- [ ] I can synchronize on a network response when the UI gives me no signal

### Framework engineering

- [ ] I have written page objects that expose intent, not element plumbing
- [ ] I can recognize when a page object has become over-abstracted
- [ ] I have written a custom fixture and can explain its scope and teardown
- [ ] I reuse authentication state instead of logging in through the UI in every test
- [ ] I generate unique test data rather than relying on a shared fixture record
- [ ] My configuration contains no hardcoded URLs, and my repository contains no secrets
- [ ] I can run my suite across three browser engines and one mobile emulation profile
- [ ] I can run my suite fully parallel, and I know which of my tests cannot be
- [ ] I can open a trace file and reconstruct exactly what the test did before failing
- [ ] Given a flaky test, I diagnose the cause before considering a retry

### CI/CD and professionalism

- [ ] I work on branches and open pull requests for my own test code
- [ ] I can write a Jenkins pipeline that runs my suite and publishes a report and artifacts
- [ ] I pass secrets into CI via credentials, never via committed files
- [ ] I can containerize my suite and explain why the image pins browser dependencies
- [ ] I can review someone else's automation PR and leave specific, actionable comments
- [ ] I can defend my framework's architecture in a design discussion, including its trade-offs
- [ ] I can explain what I used AI for, what I rejected, and why

---

## 4. What "done" looks like

At the start of this course, the honest statement is:

> "I don't know how to code."

At the end, the honest statement should be:

> "I can design, implement, debug, and maintain a TypeScript + Playwright automation framework, and I understand the engineering decisions behind it."

The second statement is only true when you can explain your framework's decisions to a skeptical senior engineer, and change them when the skeptic is right. The capstone project exists to force exactly that conversation.
