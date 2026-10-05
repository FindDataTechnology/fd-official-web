---
name: "Contract Template Data"
tagline: "The official Chinese contract-template corpus (SAMR 合同示范文本), crawled daily and served structured — the reference layer for contract drafting and review."
kind: "Data service"
line: lex
order: 20
---

A structured corpus of official Chinese contract templates (合同示范文本),
collected from the State Administration for Market Regulation (SAMR) and kept
current by an automated crawl pipeline.

## How it is collected

A dedicated crawler (`scraw-law-contracts`) runs as a scheduled job on the
Kubernetes crawl platform, with images rolled out through GitOps (ArgoCD),
fetching the SAMR contract-template library **daily at 02:00**; structured
records and archived documents are stored by the crawl pipeline.

## What is inside

- The official SAMR contract-template library — the standard-form templates
  China's market regulator publishes for common deal types.
- Coverage mapped to Chinese contract taxonomy: the Civil Code's typical named
  contracts and the practical China Contract Classification used by
  practitioners (5,000+ template contracts, up to six taxonomy levels).

## What it is for

The corpus is the reference layer of our legal line: it grounds clause
libraries and drafting workflows (see [LawBench](/products/law-bench)), powers
clause retrieval, and gives reviewers a standard-form baseline to compare a
draft against.

## Availability

The data service is available on request — [contact us](https://github.com/FindDataTechnology)
for access and licensing.
