# Chapter 7.3 — Docker for Test Automation

🔴 **Advanced** · [Part VII Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | VII — CI/CD |
| **Estimated time** | 1 session (90 min) + 5 hours independent work |
| **Prerequisite chapters** | [7.2 Jenkins Pipelines](02-jenkins-pipelines.md) |
| **Next chapter** | [8.1 Clean Code for Automation](../part-8-professional-engineering/01-clean-code-for-automation.md) |

---

## A. Learning Objectives

By the end of this chapter you will be able to:

1. **Explain** what a container is, how it differs from a virtual machine, and why reproducibility matters for a test suite.
2. **Write** a `Dockerfile` that runs your Playwright suite, using an official Playwright base image.
3. **Optimize** an image for layer caching, and **measure** the rebuild improvement.
4. **Run** the suite in a container with configuration and secrets passed in, and artifacts retrieved out.
5. **Compose** the application under test and the test suite into one command with `docker compose`.
6. **Diagnose** container-specific failures, including `/dev/shm` browser crashes and resource limits.
7. **Identify** behavioral differences between local and containerized runs, and **decide** whether to pin the environment or fix the test.

---

## B. Prerequisite Knowledge

| Required | From |
|---|---|
| A working pipeline and artifact publishing | [Chapter 7.2](02-jenkins-pipelines.md) |
| Environment-driven configuration and secrets | [Chapter 6.5](../part-6-framework-engineering/05-configuration.md) |
| Worker counts and resource sensitivity | [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) |
| Basic terminal usage | [Chapter 2.1](../part-2-programming-fundamentals/01-thinking-like-a-programmer.md) |

No prior Docker experience assumed.

---

## C. Concept Explanation

"It works on my machine" is not a joke, it is a diagnosis: your suite depends on a Node version, a set of browser binaries, system libraries, a locale, a timezone, and a CPU count that all happen to be present locally. A container packages the first four of those explicitly, so the same suite runs identically on your laptop, a colleague's laptop, and a CI agent. For QA that reproducibility is the entire value proposition — Docker in this course is not a deployment tool, it is a way of eliminating an entire category of unexplainable failure.

Practically, you start from an official Playwright image, which already contains the browsers and their system dependencies at matching versions. Getting that pairing right by hand is genuinely fiddly, and version drift between the Playwright package and its browser dependencies is a common source of confusing errors, so using the official image and **pinning its version** is both easier and more correct than building from a bare Node image.

Two details separate a working image from a good one. **Layer caching**: copy `package*.json` and install dependencies *before* copying your source, so a one-line test change does not reinstall everything. The measured difference is minutes versus seconds per build. And **resource limits**: Chromium needs more shared memory than a container's default `/dev/shm` provides, which produces crashes that look like flakiness and are fixed with a documented flag or `--ipc=host`. Learners who meet that once never lose an afternoon to it again.

`docker compose` completes the picture by starting the application under test alongside the suite, waiting for health, running the tests, and tearing everything down in one command — which is what makes a truly self-contained CI job possible.

The subtle work in this chapter is comparison. Running the same suite locally and in a container will surface differences: timezone, locale, font rendering, available CPUs affecting timing. Each difference is a decision, not automatically a bug — you either pin the environment to make it deterministic, or make the test independent of it. Being able to argue which is appropriate is what earns this chapter its 🔴.

> **Full section coming in a follow-up pass.** Planned coverage:
> - Containers versus virtual machines, in enough depth to reason and no more
> - Images, layers, containers, volumes, and registries
> - Why reproducibility matters more for tests than for most software
> - Official Playwright images, version pinning, and why browser/library pairing is fragile by hand
> - Writing a `Dockerfile`: base, workdir, dependency install, source copy, entrypoint
> - Layer caching: the ordering rule, with before/after build measurements
> - `.dockerignore` and image size
> - Passing configuration and secrets in; never baking them into an image
> - Getting artifacts out: volumes and bind mounts for reports and traces
> - `/dev/shm`, `--ipc=host`, and Chromium crashes in containers
> - CPU and memory limits, and their effect on worker count and timing
> - `docker compose`: app plus tests, health checks, dependency ordering, teardown
> - Running the container from Jenkins, and Docker-in-Docker considerations
> - Local versus container behavioral differences: timezone, locale, fonts, CPU count
> - Deciding to pin the environment versus fixing the test
> - Image size, build time, and CI cost trade-offs

---

## D. QA Context

> **Coming in a follow-up pass.** Planned coverage: how containerizing removes the "works locally" class of CI failure entirely; why the `/dev/shm` crash is the most common real-world containerized-Playwright problem and looks exactly like flakiness; how compose-based runs let a developer reproduce a CI failure on their laptop in one command; how container CPU limits interact with the worker-count decision from [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md); and why an image tagged `latest` can break your suite overnight without anyone changing code.

---

## E. Code Examples

> **Coming in a follow-up pass.** Planned progression:
> 1. **Very simple:** running the suite inside the official Playwright image with one command
> 2. **Practical:** a `Dockerfile`, then the same file reordered for caching, with build times for both
> 3. **QA-oriented:** passing config and secrets in, mounting a volume to retrieve traces and reports
> 4. **Automation-oriented:** a `docker compose` file starting the demo app with a health check, running the suite, and exiting with the suite's status — plus the `/dev/shm` crash and its fix

---

## F. Common Mistakes

> **Coming in a follow-up pass.** Planned coverage:
> - Using `latest` instead of a pinned version
> - `COPY . .` before `npm ci`, defeating layer caching
> - Baking secrets or `.env` into an image
> - No `.dockerignore`, so `node_modules` and reports bloat the build context
> - Building browsers from scratch instead of using the official image
> - Ignoring `/dev/shm` and misreading the crash as flakiness
> - Running with the same worker count despite fewer available CPUs
> - No volume mount, so artifacts vanish with the container
> - Assuming identical behavior without verifying timezone and locale
> - A compose setup that does not wait for the app to be healthy before testing

---

## G. Exercise

> **Coming in a follow-up pass.** Planned progression:
> - **Easy:** Run your existing suite inside the official Playwright image.
> - **Medium:** Write a `Dockerfile`, optimize it for caching, and report the rebuild time improvement after a one-line source change.
> - **Challenge:** Build a `docker compose` setup that starts the app, waits for health, runs the suite, retrieves artifacts, and exits with the suite's status — then find at least one behavioral difference from your local run and justify how you handled it.

---

## H. Coding Assignment

> **Planned: Containerized suite (completes the CI/CD project).** Deliver a pinned, cache-optimized `Dockerfile`; a `.dockerignore`; a `docker compose` setup running app and tests in one command with health checks and artifact retrieval; secrets passed in at runtime only; a documented `/dev/shm` or resource configuration; a Jenkins stage that runs the containerized suite; and a written local-versus-container comparison naming every difference found and how you resolved it. Full objective, requirements, constraints, acceptance criteria, and suggested approach coming in a follow-up pass.

---

## I. Quiz

> **Coming in a follow-up pass.** 10 questions planned: container-versus-VM reasoning, layer-caching ordering, secrets-in-images judgment, `/dev/shm` symptom identification, and two local-versus-container difference scenarios. Answer key at [`answer-keys/part-7/03-docker-for-test-automation.answers.md`](../answer-keys/part-7/03-docker-for-test-automation.answers.md).

---

## J. Review

> **Coming in a follow-up pass.** Competency check: *can someone with only Docker installed run your entire suite against the application with one command?*
>
> This closes Part VII. Gate before Part VIII: a stranger can clone and run your suite, your Jenkins job runs it from a clean checkout, breaking a test turns the build red with artifacts published, no secret is anywhere in the repository or logs, and the containerized run matches your local run or you can explain every difference.

---

[← 7.2 Jenkins Pipelines](02-jenkins-pipelines.md) · [Next: Part VIII — 8.1 Clean Code for Automation →](../part-8-professional-engineering/01-clean-code-for-automation.md)
