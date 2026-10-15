---
date: "2026-10-15"
title: Data Quality by Declarative Rules, Not Spot Checks
summary: "We turned data quality into executable declarative rules rather than a document of good intentions: declarative rules, an injection defense, and checks that really run in production. Only together do they make \"trustworthy, traceable, auditable\" something you can prove."
tags: [product, methodology]
sources:
  - Xingyan research archive · data quality rule design records
  - Archived acceptance report · production quality checks
---

## Spot checks cannot prove quality

A spot check is always limited to a sample: the batch you looked at being clean says nothing about the next batch, and nothing about the rows nobody happened to open. Quality has to be proven by rules, not felt through sampling.

That is the standard we set for ourselves: when someone asks how we know the data is clean, the answer should be a rule and its result, not an assurance.

## Why we did not build our own validation library

The rule syntax follows the style of the public project SodaCL, and execution reuses the public validation library pandera.

We did evaluate building a validation library of our own, and decided against it: maintaining one in-house costs too much. Data quality rules do not need a self-built execution engine to work — the public option was enough.

## Three design decisions

### Declarative rules

Data rules are written like a checklist. Rules are expressed declaratively, rather than scattered across one-off scripts.

A checklist that is written down can be reviewed by the people who own the data; logic buried in a one-off script cannot.

### An injection defense

Rule sources go through a closed enumeration: a rule can only come from a list defined in advance, never from a free-form string — which prevents content injection.

Rules are data too, and they deserve the same constraint as the data they check.

### Real evaluation in production

Three classes of checks run for real in the production environment. A quality rule that takes no part in real evaluation is only a document.

## One package, not three tools

Quality rules, data snapshots and sensitivity tiers are not three isolated tools but one package.

Together they answer a single question: can this data product prove that it is trustworthy, traceable and auditable? If it cannot prove it, it is only a claim.

## What it means for customers

To a customer, a verifiable data contract is worth more than a verbal promise that "the data is clean".

A rule can be read by the business side and executed by a machine — that is the difference between a contract and a promise.
