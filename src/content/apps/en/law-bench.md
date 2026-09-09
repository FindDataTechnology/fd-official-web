---
name: "LawBench — Contract Intelligence"
tagline: "Draft contracts from a clause library, review them with AI across three dimensions, and evaluate every draft against rubrics."
kind: "Legal AI platform"
demoUrl: "http://23.144.68.246:30830"
order: 10
---

LawBench is FindData Technology's contract drafting and review platform. It
turns contract work into a measurable pipeline: generate a draft from a curated
clause library, review it with multiple AI models in parallel, and score the
result against reusable rubrics.

## Contract generation

Drafts are assembled — not hallucinated — from a clause library grounded in
Chinese contract taxonomy: the 19 typical named contracts of the Civil Code
(买卖、租赁、服务 and more) plus the practical "China Contract Classification"
system of 5,000+ template contracts across up to six taxonomy levels. Pick a
contract type, a stance (which side you represent), and scenario tags, and
LawBench assembles a complete draft with the right clauses attached.

## Triple AI review

Every draft can go through a three-reviewer pipeline (LangGraph-orchestrated,
three models in parallel):

| Reviewer | Dimension |
|----------|-----------|
| Legal | accuracy and compliance of the clauses |
| Commercial | fairness of the deal terms for your stance |
| Completeness | missing clauses, undefined terms, gaps |

Each reviewer returns structured findings, so revisions target specific
clauses rather than vague feedback.

## Evaluation, not vibes

Reviews are graded. Rubrics (with per-criterion scoring), DeepEval metrics, and
side-by-side prompt comparisons make drafting quality measurable and
regression-testable — including a "harbor" of read-only reference rubrics.

## Clause RAG & law references

A retrieval index over the clause library powers clause search and assembly,
and per-contract-type surveys of applicable laws and regulations (with an
aggregated, deduplicated law-reference index) keep drafts anchored to the
actual legal basis.

## Integrates as MCP

An MCP server exposes the platform as 37 tools — contract generation, rubric
and prompt management, evaluation runs, clause search, law references — so AI
agents (Claude, LibreChat, any MCP client) can draft and review contracts
directly from a chat.

## Try it

The contract review assistant is live: [open the demo](http://23.144.68.246:30830).
