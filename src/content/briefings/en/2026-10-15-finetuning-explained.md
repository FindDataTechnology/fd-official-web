---
date: "2026-10-15"
title: "What Fine-Tuning Actually Solves: A Legal Contract Case"
summary: Domain fine-tuning changes format, conventions and output stability — not what the model knows. We tested that boundary on legal contract drafting and review, and confirmed that private deployment is practical.
tags: [research, methodology]
sources:
  - Xingyan research archive · legal model evaluation records
  - Xingyan research archive · model quantization and deployment records
---

## The requirement was never "it can chat"

In legal contract work the requirement is concrete: draft contracts in the customer's own clause formats and conventions, and judge an existing contract against the customer's own review checklist.

A base model falls short on both counts. The drafted clauses do not read like the language of this field, and on the review side the structured output could not be parsed reliably, leaving the downstream steps with nothing to consume.

Both are problems of format, convention and output stability rather than missing knowledge — and telling the two apart is what decides whether the answer is fine-tuning or retrieval.

## The approach: LoRA adaptation, not a full retrain

We applied lightweight domain adaptation to a 27B-class open-source base model: LoRA with r=16 and alpha=32, covering 7 projection layers, at roughly 80 million trainable parameters.

LoRA keeps the trained part small: a modest set of weights attached to the base model, rather than a rewritten model. In practice that means no full retrain — a single multi-GPU machine is enough, which keeps both compute cost and time within reach. For a customer, this is the line between affordable and not.

## Drafting quality: read the mean with the median and the sample size

Drafting quality is measured with chrF, a text-similarity metric: the mean rose from 19.5 to 51.0, with a median of 42.9 across 55 validation samples.

Those numbers should be read together with the sample size: 3 of the 55 samples are highly similar to training samples, and we identified them separately.

## Review judgment: a qualitative conclusion only

For contract review judgment (the judge model), our conclusion stays qualitative: it moved from barely usable to reliably usable, and the parsing failures in its structured output were eliminated. The full evaluation methodology will be published alongside the research write-up.

## Deployment: 4-bit quantization, from about 54GB to about 18.5GB of VRAM

The same adapter loads onto a 4-bit quantized base with no observed degradation, and VRAM use falls from about 54GB to about 18.5GB.

The implication for customers is direct: the model can run on the customer's own compute, data never leaves their environment, and private deployment becomes viable.

## The boundary: fine-tuning does not fix missing knowledge

Fine-tuning addresses format, conventions, domain language and output stability. It does not address missing knowledge — statutes and cases the model has never seen cannot be fine-tuned into existence, and that is a job for retrieval.

One ordering rule cannot be reversed: build the evaluation set first, then fine-tune. Without an evaluation set, you cannot tell whether a fine-tuning run made the model better or worse, and every later claim about improvement loses its footing.
