---
name: "Open-Data MCP"
tagline: "Unify akshare, yfinance, EDGAR and more into one semantic schema so AI agents query financial and economic data by concept and entity — from a hundred sources, through one interface."
kind: "Open-source data platform"
demoUrl: "https://www.finddatatech.cloud/demo"
line: wire
order: 10
---

fd-open-data-mcp is the core of the Wire line (寻数·柏讯) — let AI read the
world for you. It is an open-data ontology MCP that unifies multiple Python
data libraries into a single semantic schema, so AI agents query financial and
economic data by concept and entity instead of adapting to each source's API.
A crawl platform runs behind it, feeding the ontology from a hundred sources.

## One semantic schema, many sources

akshare, yfinance, EDGAR, World Bank, CNStats and other Python data libraries
are mapped into one semantic schema — `semantic_observations`. Agents ask in
terms of concepts and entities: Moutai's `price.close`, China's GDP. The
system resolves each query across sources, ranks them by quality, fails over
when a source is unavailable, and refreshes on a schedule.

## An open-source fd-* family

The fd-* package family is open source: installable from PyPI, with the code
on the FindDataOfficial GitHub org.

## Explore

- [Documentation](/docs)
- [Online demo](/demo)
- [Indicator catalog](/indicators)
- [fd-open-data-mcp introduction](/fd-open-data-mcp)
