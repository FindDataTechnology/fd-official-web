---
name: "Zhiyantai"
tagline: "One evaluation and ontology workbench shared by every business line: one ledger page per domain, with declaration, curation, release and consumption reconciled in place."
kind: "Evaluation & ontology workbench"
demoUrl: "https://lawbench.finddatatech.cloud/d"
ctaLabel: "Open the console"
line: lex
order: 12
---

Zhiyantai is FindData's evaluation and ontology platform. It is not the back office of a
single business line: **the business domain is its first layer of organization** — the page
you land on after signing in is "my domains", and only inside a domain do the six areas
appear (ontology, evaluation assets, proposal inbox, release, settings).

## One ledger page per domain

An ontology is not a pile of unrelated tables; it is a ledger you can reconcile line by
line: what vocabulary the anchored template declares, which units the corpus actually
curates, which version was published (digest included), and which consumers are pulling it.
All four layers sit side by side on one page. A layer with no data shows its own empty
state and next step instead of being hidden.

## The production loop closes on the platform

External producers submit drafts into the domain's inbox, and a draft must carry
checkable evidence. A domain lead confirms it — the content is written through the
kernel's single write path — or rejects it with a recorded reason. The same evidence
cannot be resubmitted after a rejection; new evidence is the only way back in.

## Evaluation assets belong to domains

What a domain evaluates is decided by the assets on its shelf. Belonging is a
**directory** fact rather than ownership: the same rubric can be the yardstick of two
business lines at once, and unassigning never touches the asset itself.

## Interface to distributed consumption

A published version is an immutable snapshot carrying a digest and a changelog; machines
pull it from `GET /api/v1/distribution/{domain}/ontology` with a registered credential,
and every successful pull leaves an append-only footprint.

## Getting in

The console lives at `/d` on this site and requires a FindData identity. With no domain
membership you get an honest empty state, not an empty asset list.
