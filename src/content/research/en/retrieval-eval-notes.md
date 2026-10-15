---
date: "2026-10-15"
title: "Building Our Own Retrieval Evaluation: A Comparable Baseline, and the Two Real Defects It Caught"
summary: "Rather than adopting a public legal benchmark — which measures contract-generation quality, a task not isomorphic to retrieval — we built our own retrieval evaluation layer: a dataset contract, a pure-function scorer with zero LLM involvement in scoring, and dual fingerprints, all reported as MRR@10. On the government domain (12 strongly annotated queries) it caught and fixed two real defects — fusion ranking contamination (MRR@10 0.70 → 1.00) and an exact-match priority issue in lookups by identifier (2/4 → 4/4). The perfect scores on the papers domain (14/14) and scripts domain (15/15) are pipeline health indicators under a small corpus, not evidence of superior quality, and cannot be compared across domains."
kind: note
tags: [retrieval, evaluation]
sources:
  - "Xingyan research archive · retrieval evaluation baseline records (星研研究档案·检索评测基线记录)"
  - "Xingyan research archive · retrieval evaluation method and conventions records (星研研究档案·检索评测方法与口径记录)"
---

## Bottom line first

We did not adopt a public benchmark for retrieval quality; we built our own evaluation layer instead. Public legal-domain benchmarks measure contract-generation quality, which is not isomorphic to the retrieval task — after reconnaissance, the decision was zero code transfer and methodology borrowing only. The layer makes results comparable and accountable through a dataset contract, a pure-function scorer, and dual fingerprints, all reported as MRR@10, across three domains: government (12 strongly annotated queries), papers (14 moderately annotated), and scripts (15 strongly annotated). On the government domain it caught and fixed two real defects: fusion ranking contamination (MRR@10 rose from 0.70 to 1.00) and an exact-match priority issue in lookups by identifier (from 2/4 to 4/4).

## Method and conditions

**Why not adopt a public benchmark.** Public legal-domain benchmarks measure contract-generation quality, which is not isomorphic to retrieval — the difference is in the task itself, not in how strict the measurement is. The decision: zero code transfer, methodology borrowing only.

**Dataset contract.** Every query must state two things: why it is there (which real scenario it represents) and its annotation strength (strong or moderate). Annotation strength determines how strong a conclusion that query can support.

**Pure-function scorer.** Scoring involves zero LLM participation: the same input always yields the same score, so results can be recomputed and audited, and there is no need to build an evaluation layer for the scorer itself.

**Dual fingerprints.** Every evaluation records both a dataset content fingerprint and a configuration fingerprint; if either differs, the two results are not compared. This is a mechanical guarantee of comparability, not an appeal to discipline.

**Metric and conventions.** MRR@10: the mean reciprocal rank of the first correct result when it appears within the top 10 returned items, k=10; a query with no correct result in the top 10 scores 0.

**Domains and sample sizes.** Government: 12 strongly annotated queries. Papers: 14 moderately annotated. Scripts: 15 strongly annotated.

Sources: Xingyan research archive · retrieval evaluation method and conventions records; samples and results in Xingyan research archive · retrieval evaluation baseline records.

## Results

**Defect 1: fusion ranking contamination.** What happened: results that both retrieval paths could each find were pushed out of the top ranks after fusion. After the fix, government-domain MRR@10 rose from 0.70 to 1.00 (conventions: government domain, 12 strongly annotated queries).

**Defect 2: lookups by identifier.** What happened: when querying by identifier, exact matches were not given the correct priority. After the fix, exact matches on that subset rose from 2 of 4 cases to 4 of 4 (conventions: the by-identifier subset, 4 cases, reported as counts rather than a rate).

**Interpretation discipline (carry this whenever you quote the numbers).**

- The perfect scores on the papers domain (14/14) and scripts domain (15/15) are not evidence of superior quality. They are pipeline health indicators under a small corpus and tightly scoped queries: they say the pipeline has no obvious fault, not that retrieval quality is good.
- Numbers must not be compared across domains: the three domains differ in sample size and annotation strength (12 strong / 14 moderate / 15 strong), and their denominators do not mean the same thing.

Results source: Xingyan research archive · retrieval evaluation baseline records.

## What this means in practice

**A baseline comes first; optimisation comes second.** Without a baseline, "optimisation" can neither be shown to work nor raise an alarm on regression.

**Verifiable before-and-after is a baseline capability of AI systems engineering.** The ability to catch a real defect, quantify the size of the fix, and recompute the conclusion on the same data with the same configuration — dual fingerprints guarantee that recomputation compares like with like.

**Build the baseline for your own task.** A public benchmark answers only the question its authors set; when your task is not isomorphic to it, borrow the methodology, not the numbers.

**Read perfect scores with restraint.** A perfect score under a small corpus and tightly scoped queries is a health signal, not proof of superior quality.
