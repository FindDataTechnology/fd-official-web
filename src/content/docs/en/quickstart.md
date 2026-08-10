---
title: Quickstart
order: 1
---

# Quickstart

Install and run the open-data ontology MCP — ask for data as concepts and entities, get ranked, failover, refreshed answers.

## Install

```bash
uv sync                  # base install

# For full data source support (akshare, yfinance, edgar, world bank, …)
uv sync --extra data
```

Set `FINDDATA_ROOT` (default: the parent `finddata/` dir) to locate the `fd-*` providers, and `EDGAR_IDENTITY="your_email@example.com"` before using SEC EDGAR data.

## Set up the ontology

```bash
# 1. create the ontology tables
fd-open-data-mcp migrate

# 2. import the catalogs (akshare, yfinance, cn-gov, cn-report, edgar, …)
fd-open-data-mcp import-catalog
# or one provider:  fd-open-data-mcp import-catalog akshare

# 3. consume indicator_defs as concepts + propose column→concept bindings
fd-open-data-mcp consume-concepts
fd-open-data-mcp propose-bindings

# 4. seed per-source entity identifiers (stocks, countries, …)
fd-open-data-mcp seed-entities

# 5. generate per-concept refresh schedules
fd-open-data-mcp generate-schedules
```

## Read data

```bash
fd-open-data-mcp read --concept-id 234 --entity-type stock --entity-id 1 --date 2024-07-26
```

## Run as an MCP server

```bash
fd-open-data-mcp serve        # stdio transport
```

Or use natural language over the AI search tool (`ai_search`) to go from query → concepts → entities → values in one call.

## Remote access

The live server is exposed for agent clients once the site is on HTTPS: add the remote MCP URL `https://finddata.cn/mcp` with the org's bearer token. During the IP-first phase the web playground works over plain HTTP; some MCP clients refuse non-HTTPS servers until the HTTPS swap.
