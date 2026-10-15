---
date: "2026-10-15"
title: "LoRA Fine-Tuning for Legal Work: From \"Plausible\" to \"Aligned\" — Method and Deployment Engineering"
summary: "A legal-domain fine-tuning case study on a 27B-class open-source base with two LoRA adapters (drafting and judge): drafting chrF moved from a mean of 19.5 to 51.0, median 42.9 (55-item validation set); the judge adapter is reported qualitatively only, with its full evaluation and training-data audit to follow in a separate publication; 4-bit quantization cut measured VRAM from about 54 GB to 18.5 GB with no observed quality drop, lowering the compute threshold for private deployment."
kind: casestudy
tags: [fine-tuning, evaluation, deployment]
sources:
  - "Xingyan research archive · legal model evaluation records (星研研究档案·法律模型评测记录)"
  - "Xingyan research archive · legal model deployment records (星研研究档案·法律模型部署记录)"
  - "Archived acceptance report (已归档验收报告)"
---

## Bottom line first

Using a 27B-class open-source base, we completed a legal-domain SFT + LoRA fine-tune: two adapters, one for contract drafting and one acting as judge, with an evaluation-set-first methodology and an A/B comparison of base versus adapter-mounted base. On drafting, chrF over a 55-item validation set rose from a mean of 19.5 to 51.0, median 42.9 (3 of the 55 items were highly similar to training samples; they were identified separately and their effect excluded in interpretation). For the judge adapter we give a qualitative statement only — "from nearly unusable to stably usable, with structured-output parse failures fully resolved" — and will publish its full evaluation and training-data audit separately once complete. On the deployment side, a 4-bit quantized base carrying the same adapter reduced measured VRAM from about 54 GB to 18.5 GB with no observed drop in quality.

## Method and conditions

**The problem.** Contract drafting and review demand a stable output structure: structured results and fixed conventions. General models are often "plausible but not aligned" — the text reads reasonably, yet fields, formats and decision conventions do not line up, so the output cannot feed downstream processes.

**Training configuration.** The base is a 27B-class open-source model; LoRA was configured at r=16, alpha=32, covering 7 projection layers, with roughly 80 million trainable parameters. Two adapters carry the "drafting" and "judge" duties respectively.

**Order of operations and comparison.** The evaluation set was built first and fine-tuning started after; the evaluation ran as an A/B comparison between the base (no adapter) and the base with the adapter mounted.

**Sources.** The configuration and evaluation conventions in this section are recorded in the Xingyan research archive · legal model evaluation records; delivery and acceptance records are in the archived acceptance report.

## Results

**Drafting adapter (full measurement conventions).** Metric: chrF (a character-level generation-quality comparison score; higher is better). Comparison: base versus base + drafting adapter. Sample: a 55-item validation set. Results: mean 19.5 → 51.0, median 42.9. The mean sits above the median, indicating a right-skewed distribution — a minority of items score well above the middle of the range; this is exactly why we report median and sample size alongside any mean. Sample disclosure: 3 of the 55 items were highly similar to training samples; they were identified separately and their effect excluded in interpretation, so they do not inflate the conclusion.

**Judge adapter (qualitative only).** The judge model's improvement is described qualitatively: from nearly unusable to stably usable, with the repeated structured-output parse failures fully resolved. We give no accuracy figure. The judge model's full evaluation and training-data audit will be published separately once complete. Until that audit is closed, we do not publish the result as a verified conclusion — that is Xingyan's discipline for everything we publish.

**Deployment engineering.** Loading the same adapter onto a 4-bit quantized base showed no quality drop (a qualitative observation, not a quantified conclusion); measured VRAM fell from about 54 GB to 18.5 GB. The merge-and-export order is a hard requirement: mount the adapter on the full-precision base, merge first, then quantize; reversing the order introduces extra error. The implication: a model of this size can run on the customer's own compute environment, with data never leaving their premises.

Sources: Xingyan research archive · legal model evaluation records (drafting conventions and the judge's qualitative result), Xingyan research archive · legal model deployment records (quantization and VRAM), archived acceptance report (delivery acceptance).

## What this means in practice

**When domain fine-tuning is worth it.** Two tests: the pain points fall squarely on format, conventions and output stability; and a workable evaluation set exists first. Without the first, fine-tuning does not fix the real business problem; without the second, you cannot show that it works.

**The compute threshold for private deployment has come down.** The same adapter works on a 4-bit base, so a domain model no longer depends on very large VRAM budgets or centralized compute. For customers whose data cannot leave their premises, this is the step that turns "a plan on paper" into "an executable option".

**Quote these results with their conventions attached.** A 55-item validation set, mean and median reported side by side, and 3 similar samples identified separately; a bare mean, detached from its conventions, is not comparable to other projects. The judge model offers no figure yet — that awaits its separate publication.
