---
name: "Wanxing Connector"
tagline: "Connect an account once and your agent gains a thousand hands — 1,500+ external services and tens of thousands of prebuilt actions, one credential vault, controllable and auditable."
kind: "Agent Connector Gateway"
demoUrl: "https://connector.finddatatech.cloud"
line: constellation
order: 15
---

SaaS accounts and credentials end up scattered across tools, and an agent asked
to act on your behalf lacks a single connection layer. Wanxing Connector is that
layer: connect GitHub, Feishu, DingTalk, Gmail, Notion, Slack, Qichacha, AMap,
Xiaohongshu, Airtable, and 1,500+ other services once via OAuth or API keys,
and your agent gains tens of thousands of prebuilt actions — sending messages,
looking up company records, reading spreadsheets, tracking shipments — ready to
execute.

## What It Is

A multi-tenant connector gateway: a per-user credential vault plus an MCP/HTTP
execution surface. Credentials, authorization scopes, action schemas, execution
policies, and redacted run logs all live inside one inspectable runtime instead
of being scattered across prompts and scripts. Actions are prebuilt — each
carries request/response schemas and required-permission declarations, and the
agent can pull a full guide before calling (the manual is a tool), so it never
guesses an API shape.

## How To Use It

Three paths, whichever platform you are on:

- **Platform (platform.finddatatech.cloud)**: zero-paste connection inside
  Yizuo — the page brings up the connector console for authorization, the
  credential flows back into your agent's credential rail automatically, and
  you simply ask the agent in chat. No key is ever copied or pasted.
- **Wire (wire.finddatatech.cloud)**: Wire's connector-based data import uses
  the same connections to pull external service data into datasets and the
  normal processing pipeline.
- **Console (connector.finddatatech.cloud)**: sign in with your FindData
  account to manage connections and inspect per-action run logs.

## Security And Control

Credentials are stored encrypted and run logs are redacted before persisting;
action-level allow/block policies decide what the agent may execute; the
execution surface is not exposed to the public internet — external calls enter
only through Platform or Wire admission rails.

## Try It Online

[Open the Wanxing Connector console](https://connector.finddatatech.cloud),
sign in with your FindData account, and connect your first external service.
