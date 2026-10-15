---
date: "2026-10-15"
title: Why We Built Our Own Evaluation Instead of Borrowing a Public Benchmark
summary: The evaluation layer is not academic decoration — it is part of the product. Without a baseline there is no "how much better". Here is how we built our own, and two lessons from the day it went live.
tags: [methodology, research]
sources:
  - Xingyan research archive · retrieval evaluation baseline records
  - Archived acceptance report · evaluation layer launch defect fixes
---

## The evaluation layer is part of the product

The conclusion first: the evaluation layer is not academic decoration, it is part of the product. Without a baseline, "how much better" has no answer, and every improvement stays at the level of "it feels better".

## Public legal benchmarks: borrow the methodology, not the code

We scouted public legal benchmarks. They score contract generation quality, which is not structurally the same task as our retrieval work — the same question set does not test the same capability.

So we carried over zero code and borrowed only the methodology.

## Three parts of our own runner

- **A dataset contract**: every query states why it is in the set, together with its annotation strength — strong or medium.
- **A pure-function scorer**: no large model takes part in the scoring process, so scoring does not depend on a model and the same input always yields the same result.
- **Two fingerprints**: a dataset content fingerprint plus a configuration fingerprint. Results with different fingerprints are not comparable — a rule that rules out misleading numbers by mechanism rather than by discipline.

## Baselines across three domains

The metric is MRR@10, reported with sample size and annotation strength:

- Government retrieval: 12 items, strong annotation
- Paper retrieval: 14 items, medium annotation
- Script retrieval: 15 items, strong annotation

Sample size and annotation strength travel with every number. A baseline reported without them cannot be read, and cannot be trusted.

## Two lessons

**Lesson one: a perfect score is not proof of superior quality.** A perfect score on a small corpus with tight queries says the pipeline is healthy, not that the system is superior; and numbers from different domains cannot be compared across domains.

**Lesson two: the evaluation layer caught a real defect on the day it went live.** Results that each of two retrieval paths could find on their own were lost after fusion ranking. After the fix, MRR on the same benchmark rose from 0.70 to 1.00 (12 strong-annotated items), and a separate class of numbered queries went from 2/4 to 4/4.

## What this means for customers

Your AI project needs a baseline of its own as well — and one that is established before optimization begins.

Put the baseline in place first, and every later change has something to be compared against.
