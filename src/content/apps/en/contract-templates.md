---
name: "Contract Template Data"
tagline: "The official Chinese contract-template corpus (SAMR 合同示范文本), crawled daily and served structured — the reference layer for contract drafting and review."
kind: "Data service"
order: 20
---

A structured corpus of official Chinese contract templates (合同示范文本),
collected from the State Administration for Market Regulation (SAMR) and kept
current by an automated crawl pipeline.

## How it is collected

A dedicated crawler (`scraw-law-contracts`) runs as a scheduled CronJob on a
Scrapyd crawl stack (with Redis and PostgreSQL), fetching the SAMR contract-
template library **daily at 02:00**. Each run stores structured records to
SQLite/JSONL and archives the collected documents to object storage (MinIO).

## What is inside

- The official SAMR contract-template library — the standard-form templates
  China's market regulator publishes for common deal types.
- Coverage mapped to Chinese contract taxonomy: the Civil Code's typical named
  contracts and the practical China Contract Classification used by
  practitioners (5,000+ template contracts, up to six taxonomy levels).

## What it is for

The corpus is the reference layer of our legal line: it grounds clause
libraries and drafting workflows (see [LawBench](/apps/law-bench)), powers
clause retrieval, and gives reviewers a standard-form baseline to compare a
draft against.

## Availability

The data service is available on request — [contact us](https://github.com/FindDataTechnology)
for access and licensing.
