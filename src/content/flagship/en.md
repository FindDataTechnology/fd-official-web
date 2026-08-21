---
title: fd-open-data-mcp
tagline: The open-data ontology MCP — one protocol, every source.
---

## The problem

AI agents need real-world data — stock prices, macro indicators, government statistics, SEC filings. Today every source speaks its own API, its own units, its own quirks. Agents end up hardcoding source-specific calls, and break when a source changes or goes down.

## What it is

fd-open-data-mcp is a **semantic concept layer** over the world's open data. Instead of calling source APIs, you ask for **concepts and entities**:

- `price.close` of *Kweichow Moutai* — not "akshare stock_zh_a_hist of 600519"
- `gdp.current_usd` of *China* — not a World Bank indicator code you had to memorize

The server resolves each concept against **every source that carries it**, ranks candidates by data quality, fails over when a source is down, and refreshes cached values on a schedule. One protocol, one MCP, every source.

## By the numbers

- **15 indicator concepts** across finance, macro, and industry domains
- **45 MCP tools** — catalog, entity identity, semantic layer, entity graph, vector search, fetch, scheduled refresh, crawl policies
- **Major sources live**: akshare, yfinance, SEC EDGAR, World Bank, and growing Chinese government / industry feeds

## How it fits

The server speaks MCP over streamable HTTP — plug it into Claude, Cursor, or any MCP client, or try it right now in the [live demo](/demo). It is the reference implementation of the [fd-open-data-protocol](/repos/fd-open-data-protocol), and the data backbone for the rest of the org's projects.

The full technical README — install, configuration, tool reference — lives on the [project page](/repos/fd-open-data-mcp).
