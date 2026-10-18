---
date: "2026-10-18"
title: "law-bench: Making Contract-Drafting Quality Measurable, Iterable and Regression-Testable"
summary: "An evaluation loop for Chinese contract drafting: all-pass binary aggregation instead of weighted scoring, with multi-judge per-criterion verdicts driving clause-level self-healing. 39 of 43 contract types reach all-criteria pass (18/19 typical, 21/24 atypical). We also report a negative result honestly — a human blind-labelling pilot measured only 36.5% human-judge agreement (κ=0.075), with judges systematically stricter than humans, so that pass rate is an internal scale, not a human-validated accuracy."
kind: paper
tags: [research, evaluation, contract-drafting]
sources:
  - "Full paper (Chinese and English versions, paper archive no. 01 in the Xingyan research files)"
  - "Human blind-labelling pilot: 126 contract-criterion pairs, two annotators, stratified sampling"
---

## Bottom line first

We built an evaluation loop for Chinese contract drafting. Its core is not "more accurate scoring" but that it **changes what the generator can do**: collapsing per-criterion verdicts to a binary all-pass signal removes the trade-off between criteria, so the generator can no longer offset a missing mandatory clause with strengths elsewhere, and the only way to move the signal is to fix each point.

On 43 Chinese contract types — the typical contracts of the Civil Code plus common atypical ones — 39 types reach all-criteria pass (18/19 typical, 21/24 atypical). The four failing types each miss only one or two criteria, and they split into two structurally different kinds: a defect in the clause itself, and a ceiling on the judge's own reliability.

**One thing must be said in the same breath**: we ran a human blind-labelling pilot to test the judges, and the result is negative — over 126 contract-criterion pairs, inter-annotator agreement was 85.7% (κ=0.522), while human-judge agreement was only 36.5% (κ=0.075), and the disagreement is strongly one-directional (humans pass where judges fail in 157 cases; the reverse in 3). This means 39/43 must be read as **consistency under the system's internal scale**, not as human-validated accuracy. The result does not overturn the method's usefulness, but it fixes how it may be read: the judge signal is good enough to decide when the self-healing loop stops, not good enough to serve as ground truth, and human review must stay inside the loop.

## Method and conditions

**Why not weighted sums.** Weighted scoring turns criteria into mutually compensable components; the loss from one missing mandatory clause can be recovered from surplus elsewhere, so the generator can route around a single legal requirement and still move the total. Binary aggregation removes that trade-off: the signal answers only "is there an unmet normative requirement". The cost is that binary alone does not rank quality (9/10 and 0/10 are both 0), so the diagnostic role goes to the pass count — which criterion is stuck, whether a rewrite moved it, all answered by the per-criterion record.

**Multiple judges and confidence.** Each criterion is ruled on independently by three judge models; the majority forms the verdict, and the share of judges supporting it is the confidence. Multi-judge is aimed at measurable judge bias and at performance differences between judges large enough to change conclusions; a single judge's taste is not a quality criterion.

**How self-healing writes back.** Improvement is triggered by a confidence threshold, and the threshold is a simple majority rather than unanimity — a unanimous threshold leaves real defects in place whenever two judges fail a clause and one passes it. Write-back **merges rather than replaces**: update the body if a custom clause exists, create one if not, because a full rewrite loses what earlier rounds already got right while fixing one defect.

**Evaluation set.** 43 Chinese contract types (19 typical Civil Code contracts + 24 atypical), with a further 23 not entering evaluation; every count-based claim uses 43 as the denominator. Each type is evaluated against its own rule set (8–11 criteria). There is no train/test split.

**Result caliber.** Data come from a single run record (commit 644576e). The self-healing process contains multiple rounds, but the full evaluation was **not re-run**, so no mean or standard deviation is reported.

## Results

**Main result.** 39 of 43 types pass every criterion. By group: 18/19 typical (95%), 21/24 atypical (88%). Most types reach all-pass within the first two rounds.

**Threshold sensitivity.** A unanimous threshold (0.99) reacts only to unanimous failure, so 8 types stall on the judges' split floor: two of three judges find a real defect (confidence 0.67) and the third passes, giving only partial pass with no improvement triggered. Lowering the threshold to a majority (0.67) unlocks all 8 within one to two rounds. The problem with unanimity is that it ties sensitivity to whichever judge is most lenient.

**Two kinds of structural wall.**

| Type | Symptom | Attribution | Direction |
|---|---|---|---|
| Lease | Stuck on a single criterion (accuracy of statutory citation); 5 rounds of rewriting never satisfied all 3 judges | Clause-quality wall | The generator cannot substantiate the citation it makes; the fix is retrieval and verification of statutory basis |
| Land transfer / film production / service | Appears as 0.67-confidence majority disagreement; improvement triggers but does not converge within the round cap, and the pass count oscillates | Judge-reliability ceiling | Existing records support only that these are **undecidable under the current judge set**, not that the clauses are defective |

Conflating the two misleads in both directions: treating measurement noise as a quality defect leads to pointless corpus rewriting, while attributing a real defect to the judge shelves a generator capability gap as a tooling problem.

**Judge-validity pilot (a negative result — the honest core of this section).** From all evaluation runs carrying complete drafts, three (draft × criterion) pairs were drawn per contract type, stratified, giving 126 pairs (42 of the 43 types have draft-bearing runs), with two blind labelling slots:

- Inter-annotator agreement **85.7%** (126 double-labelled pairs, κ=0.522, moderate);
- Human-judge agreement **36.5%** (κ=0.075);
- Confusion matrix (252 verdicts): human pass / judge fail in 157 cases, human fail / judge pass in 3 — the disagreement is strongly one-directional, with judges systematically stricter than humans.

**An engineering constraint that changes how results must be read.** A first attempt at 36-way concurrency (4 evaluation streams × 3 judges × 3 workers) produced 0/10 for the property-service contract. Investigation confirmed this was not contract quality but a rate-limit cascade: requests over the upstream quota returned 429, and recording a 429 as a failure turns a contract missing one or two criteria into a zero-pass contract. At 12-way concurrency no 429s occurred. The cause is that limiting is metered per **account**, not per model — the three judge backends share one bucket. Since 0/10 and 9/10 are both 0 under all-pass aggregation, one cascade amplifies noise into a signal indistinguishable from a structural defect, so any pass-rate figure must state its concurrency configuration.

![Pass results across 43 Chinese contract types](/research/papers/fig2-pass-distribution.png)

## What it means in practice

**For people building evaluation systems**: binary aggregation is not an accuracy compromise but a redefinition of the objective. If, in your setting, "one missing mandatory item" cannot be offset by "everything else done well", then a weighted score is the wrong measure. Conversely, if you need quality tiers rather than compliance verdicts, binary throws away information you need.

**For people using LLMs as judges**: the number our pilot produced is 36.5% agreement — far worse-looking than most published figures. The reason is not a weak model, but that we placed the judge inside a **strict binary** decision with no alignment calibration. Anyone wiring a judge signal into an automated pipeline should first run a blind pilot like this, measure their own number, and then decide whether the judge can be a stopping signal and whether it can be ground truth.

**How we use it**: the judge only decides when the self-healing loop stops, never serves as ground truth, and human review stays inside the loop. That is the part of our own system this negative result changed.

**Three things still owed** (listed as limitations in the paper): (1) the gains from self-healing and from tagging were not ablated, so their contributions can only be inferred indirectly from per-criterion records; (2) the evaluation ran once, with no mean or standard deviation, and the passing list holds only for this concurrency configuration; (3) the evaluation set covers Chinese law only — extending it requires rebuilding the mandatory-requirement list and criteria for the target jurisdiction, so the method transfers but the content must be rebuilt.
