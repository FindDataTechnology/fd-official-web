---
name: "LiangLü · Law, for Everyone"
tagline: "Law is not only for practitioners: contract drafting with triple AI review, statute & case retrieval, regression-testable rubrics — and help everyone understand why the law is as it is."
kind: "Legal AI platform"
demoUrl: "https://lex.finddatatech.cloud"
line: lex
order: 10
---

LiangLü (良律) belongs to the Lex family (寻数·识律). Its core audience is not only lawyers and other legal practitioners — it is also for ordinary people: why the law says what it says, how it used to be, whether it is reasonable, and what harms it carries. The law's legitimacy depends on the changing times, and it takes the effort of both practitioners and the public to keep it healthy. That is what we hope to contribute.

As a product, LiangLü is the line's main platform: backed by the line's fine-tuned legal models and the law_db corpus served through the business MCP, it turns contract work into a measurable pipeline — generate a draft from a curated clause library, review it with multiple AI models in parallel, and score the result against reusable rubrics.

## Contract workbench (LawBench)

Drafts are assembled — not hallucinated — from a clause library grounded in
Chinese contract taxonomy: the 19 typical named contracts of the Civil Code
(买卖、租赁、服务 and more) plus the practical "China Contract Classification"
system of 5,000+ template contracts across up to six taxonomy levels. Pick a
contract type, a stance (which side you represent), and scenario tags, and a
complete draft is assembled with the right clauses attached. Every draft can go
through a three-reviewer pipeline (LangGraph-orchestrated, three models in
parallel):

| Reviewer | Dimension |
|----------|-----------|
| Legal | accuracy and compliance of the clauses |
| Commercial | fairness of the deal terms for your stance |
| Completeness | missing clauses, undefined terms, gaps |

Each reviewer returns structured findings, so revisions target specific
clauses rather than vague feedback. Contract e-signature is in closed preview.

## Evaluation, not vibes

Reviews are graded. Rubrics (with per-criterion scoring), DeepEval metrics, and
side-by-side prompt comparisons make drafting quality measurable and
regression-testable — including a "harbor" of read-only reference rubrics.

## Clause RAG & law references

A retrieval index over the clause library powers clause search and assembly,
and per-contract-type surveys of applicable laws and regulations (with an
aggregated, deduplicated law-reference index) keep drafts anchored to the
actual legal basis. Statute and case retrieval is a standalone entry point of
the platform.

## Integrates as MCP

An MCP server exposes the platform as 52 tools — contract generation, rubric
and prompt management, evaluation runs, clause search, law references — so AI
agents (Claude, LibreChat, any MCP client) can draft and review contracts
directly from a chat.

## The engine is open source

The contract workbench engine is open-sourced as **law-bench** at
[FindDataTechnology/law-bench](https://github.com/FindDataTechnology/law-bench)
(see the [repo page](/repos/law-bench)); the evaluation loop's method — including
its honest negative result — is written up in the research article
["law-bench: Making Contract-Drafting Quality Measurable, Iterable and
Regression-Testable"](/research/articles/law-bench-evaluation-loop).

## Try it

The LiangLü platform is live: [open 良律](https://lex.finddatatech.cloud).
