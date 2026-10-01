---
name: "Platform"
tagline: "A local-first AI assistant platform built on the DeepSeek Harness runtime, with streaming agent chat, document RAG, and MCP extensibility across web and desktop."
kind: "AI assistant platform"
demoUrl: "https://platform.finddatatech.cloud"
line: base
order: 10
---

Platform (v1.3.0) is the execution base of the FindData product matrix — the
Base line (寻数·壹座): every FindData project runs on this AI harness. Built on
the DeepSeek Harness (dsh) runtime, it ships as a web app and as an Electron
desktop client — macOS .dmg and Windows .exe — with the same UI on both ends,
and a private-deployment edition is available.

## Streaming agent chat

Conversations stream in real time and render the full agent loop: chain of
thought, tool calls, and skill execution. For each conversation you can choose
the model and the agent to run it with.

## Document RAG on a local index

Bring your own PDF, Markdown, and plain-text files, or point Platform at web
URLs. It builds a local index over them and retrieves from that index during
the conversation, so answers are grounded in your documents.

## Agents, MCP, and scheduled work

The platform surface around the chat covers:

- MCP extension runtime management
- Agent and app catalog, with cloud refresh
- Scheduled tasks (cron)
- Persistent sessions and chat history
- System status panel

## Local-first by design

A single command starts the whole thing, and all data lives in local SQLite.
Keys and tokens stay on the server side — they never enter the browser. The
interface is Chinese-first, with en/es/fr/ja also available.

## Try it

[Open the demo](https://platform.finddatatech.cloud).
