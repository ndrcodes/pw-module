---
id: overview
slug: /answer-keys
title: Answer Keys
sidebar_label: Overview
---

# Answer Keys

[Table of Contents](../README.md)

Quiz answer keys for all 47 chapters, one file per chapter, mirroring the chapter paths.

## Layout

```text
answer-keys/
â”œâ”€â”€ part-1/01-what-is-software-testing.answers.md
â”œâ”€â”€ part-2/02-data-types.answers.md
â”œâ”€â”€ ...
â””â”€â”€ part-8/03-scalable-automation-architecture.answers.md
```

Each chapter's Section I links to its key here. A key contains, per question:

- the correct answer
- **why** it is correct, in a sentence or two
- why each plausible distractor is wrong â€” the distractors encode common misconceptions, so this is often the most instructive part
- the chapter section to reread if the question was missed

## Status

Answer keys are written alongside the full chapter bodies in **Phase 2**, part by part, because a key is only meaningful once the quiz it answers exists. Chapter links to files in this folder resolve as each part is completed.

| Part | Keys |
|---|---|
| I â€” Software Testing Fundamentals | âœ… Complete (4 of 4) |
| II â€” Programming Fundamentals | âœ… Complete (13 of 13) |
| III â€” Automation Fundamentals | âœ… Complete (2 of 2) |
| IV â€” API Testing and Automation | âœ… Complete (8 of 8) |
| V â€” Web Automation with Playwright | Pending (0 of 5) |
| VI â€” Framework Engineering | Pending (0 of 9) |
| VII â€” CI/CD | Pending (0 of 3) |
| VIII â€” Professional Engineering | Pending (0 of 3) |

Part I keys also carry **exercise and assignment notes for instructors**, since those chapters have no code and are graded on written judgment. Part II keys carry the same, plus model solutions for the code exercises and a grading-notes section for each chapter assignment â€” including the specific latent defects learners are expected to find in the refactoring tasks.

## For instructors

Keys are kept in a separate folder rather than inline so a cohort can be given the chapter files without the answers. If you distribute the repository to learners, exclude this directory or keep it on a separate branch.

Quiz weighting and the retake policy are in the [Assessment Strategy](../00-course-overview/04-assessment-strategy.md#4-quizzes-10).
