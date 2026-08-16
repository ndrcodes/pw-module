# Phase 2 continuation plan

Saved 16 August 2026. Resume here; do not recreate Phase 1 or rewrite finished chapters.

When you come back, tell the agent: **continue Phase 2 from Part V** (or point at this file).

---

## Current status

| Phase | Status |
|---|---|
| **Phase 1** — architecture, TOC, stubs, projects, capstone, assessment, AI policy | ✅ Complete |
| **Phase 2** — full A–J chapter bodies + answer keys | 🚧 Parts I–IV done; V–VIII remaining |

| Part | Chapters | Status |
|---|---|---|
| I — Testing fundamentals | 1.1–1.4 | ✅ + keys |
| II — Programming fundamentals | 2.1–2.13 | ✅ + keys |
| III — Automation fundamentals | 3.1–3.2 | ✅ + keys |
| IV — API testing and automation | 4.1–4.8 | ✅ + keys |
| **V — Web automation with Playwright** | **5.1–5.5** | **⬅ start here** |
| VI — Framework engineering | 6.1–6.9 | Pending |
| VII — CI/CD | 7.1–7.3 | Pending |
| VIII — Professional engineering | 8.1–8.3 | Pending |

**Do not fill** `00-course-overview/06-weekly-schedule.md` unless asked (leave as placeholder).

Progress tables to update when a part finishes:

- `README.md` → Status → Phase 2 progress
- `answer-keys/README.md` → Status table

---

## Immediate next work

1. Read `part-5-web-automation-playwright/00-module-overview.md` and `instructor-notes.md`.
2. Write full A–J bodies for **5.1 → 5.5** (stubs already have objectives + planned-coverage quotes).
3. Write matching keys under `answer-keys/part-5/`.
4. Mark Part V complete in both progress tables.
5. Then Part VI (6.1–6.9), VII (7.1–7.3), VIII (8.1–8.3) the same way.

Project 4 (web) is after 5.5 / into Part VI as already specified in the project brief. Capstone stays as written.

---

## House rules (match existing chapters)

- **Template A–J:** Learning Objectives, Prerequisites, Concept Explanation, QA Context, Code Examples (very simple → practical → QA → automation), Common Mistakes, Exercise (easy / medium / challenge), Coding Assignment, Quiz, Review.
- **Length:** about 550–1000 lines per chapter. Answer keys explain every distractor + exercise/assignment grading notes.
- **Tone:** teach judgment, not trivia. Running example is the **demo shop** (e.g. REQ-114 free shipping at $100).
- **QA data** in programming examples (test results, orders), not `[1, 2, 3]`.
- **TypeScript `strict`.** No unjustified `any`. `==` only as `== null`.
- **House type rule:** interface for objects, type for unions. Union literals, not enums. Exhaustive `switch` + `never` default.
- **Hard rules reused everywhere:** no `waitForTimeout` (−25% on P4/capstone), no committed secrets, retries ≤1 on capstone, design docs before code, return vs print, runtime JSON validation (cast ≠ check).
- **AI:** restricted through most of the course; 2.12 assignment already requires an AI usage log. Follow `00-course-overview/05-ai-policy.md`.
- **Cross-links** to later parts as previews, not implementations.
- **Do not rewrite** 1.1–4.8 or Phase 1 briefs.

Instructor notes already exist per part — align demos and misconceptions with those files.

---

## Repo map

```text
README.md                          # TOC + Phase 2 progress
PHASE-2-CONTINUE.md                # this file
00-course-overview/                # 01–05 complete; 06 weekly schedule = stub
part-1- … part-4-                  # full chapters
part-5-web-automation-playwright/  # stubs + overview + instructor notes
part-6-framework-engineering/
part-7-cicd/
part-8-professional-engineering/
projects/                          # P1–P4 briefs complete
capstone/00-capstone-overview.md
answer-keys/part-1/ … part-4/      # complete
answer-keys/part-5/ …              # create as chapters are written
```

---

## Assessment weights (do not change)

| Piece | Weight |
|---|---|
| P1 + P2 | part of 15% programming exercises |
| P3 API | 15% |
| P4 Web | 20% |
| CI/CD | 10% |
| Code review / architecture | 10% |
| Capstone | 20% |

Anchors already used: `#passing-thresholds`, `#3-universal-rubric-dimensions`.

---

## Done in the last sessions (do not redo)

- Part II close: 2.11 key, 2.12 async, 2.13 JSON + keys
- Part III: 3.1 principles, 3.2 architecture + keys
- Part IV: 4.1–4.8 + keys (HTTP → REST → design → Playwright GET → writes → auth → clients → env/factories)
