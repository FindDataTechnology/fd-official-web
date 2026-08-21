---
title: Protocol overview
order: 2
description: "`fd-open-data-protocol` is the manifest contract a datasource must expose to be ingested by `fd-open-data-mcp`."
---

# The open-data protocol

`fd-open-data-protocol` is the manifest contract a datasource must expose to be ingested by `fd-open-data-mcp`. It's what makes "one MCP, every source" possible: any provider that conforms becomes a first-class source in the ontology.

## What a datasource manifest declares

A conforming datasource publishes a catalog describing:

- **name** — the provider's stable identifier
- **functions** — the query operations it supports (e.g. fetch daily bars, fetch GDP)
- **columns** — the physical output fields of those functions
- **entity definitions** — the entity types it covers (stocks, countries, industries, …)
- **relationships** — links between entities
- **concepts** — the semantic indicators it can provide
- **bindings** — the mapping from its columns to ontology concepts

The MCP registers these into the ontology database; `propose-bindings` then proposes the column→concept mappings that the semantic layer uses to resolve your natural-language queries.

## Why it matters

Because the contract is explicit, the MCP can rank candidate sources for a concept by quality × accessibility × freshness, fetch from the best one, fail over, and cache — all without per-source special-casing.

See the [fd-open-data-protocol](https://github.com/FindDataTechnology/fd-open-data-protocol) repository for the full manifest schema and validation rules.
