---
name: "Open-Data MCP & DAAS"
tagline: "Unify akshare, yfinance, EDGAR and more into one semantic schema so AI agents query financial and economic data by concept and entity — with DAAS running the whole platform locally."
kind: "Open-source data platform"
demoUrl: "https://www.finddatatech.cloud/demo"
line: data
order: 10
---

fd-open-data-mcp and DAAS form FindData Technology's data line. At the core is
an open-data ontology MCP that unifies multiple Python data libraries into a
single semantic schema, so AI agents query financial and economic data by
concept and entity instead of adapting to each source's API.

## One semantic schema, many sources

akshare, yfinance, EDGAR, World Bank, CNStats and other Python data libraries
are mapped into one semantic schema — `semantic_observations`. Agents ask in
terms of concepts and entities: Moutai's `price.close`, China's GDP. The
system resolves each query across sources, ranks them by quality, fails over
when a source is unavailable, and refreshes on a schedule.

## An open-source fd-* family

The fd-* package family is open source: installable from PyPI, with the code
on the FindDataOfficial GitHub org.

## DAAS: the whole platform, locally

DAAS packs the data line into a local platform. One curl command installs it;
everything lives in a single SQLite file served by the merged fd-daas-mcp
server — 161 MCP tools and 18 Claude Code skills in one install. It runs on
your machine, and the data stays in your hands.

## Explore

- [Documentation](/docs)
- [Online demo](/demo)
- [Indicator catalog](/indicators)
- [fd-open-data-mcp introduction](/fd-open-data-mcp)
