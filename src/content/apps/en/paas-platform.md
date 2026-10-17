---
name: "Platform"
tagline: "An AI assistant platform built on the DeepSeek Harness runtime, with streaming agent chat, document RAG, and MCP extensibility across web and desktop — in a hosted cloud edition and a self-hosted edition."
kind: "AI assistant platform"
demoUrl: "https://platform.finddatatech.cloud"
line: base
order: 10
---

Platform is the execution base of the FindData product matrix — the Base line
(寻数·壹座): every FindData project runs on this AI harness. Built on the
DeepSeek Harness (dsh) runtime, it ships in two editions with the identical UI:

- **Hosted cloud** (the Try-it entry on this page): open in a browser and go,
  nothing to install. Besides the web app there is a WeChat mini program and an
  Electron desktop client (macOS .dmg / Windows .exe), with history and outputs
  synced across devices.
- **Self-hosted**: run it on your own machine and keep the data in your own
  environment. Deployment is documented in the
  [repo README](https://github.com/FindDataTechnology/platform) (auto-synced to
  this site at build time).

## Streaming agent chat

Conversations stream in real time and render the full agent loop: chain of
thought, tool calls, and skill execution. For each conversation you can choose
the model and the agent to run it with.

## Document RAG on your own documents

Bring your own PDF, Markdown, and plain-text files, or point Platform at web
URLs. It builds an index over them and retrieves from that index during the
conversation, so answers are grounded in your documents.

## Agents, MCP, and scheduled work

The platform surface around the chat covers:

- MCP extension runtime management
- Agent and app catalog, with cloud refresh
- Scheduled tasks
- Persistent sessions and chat history
- System status panel

The interface is Chinese-first, with en/es/fr/ja also available. Keys and
tokens stay on the server side — they never enter the browser.

## Academy courses

To get started, the free web courses live in the
[Xingyan Academy](/research/academy): the getting-things-done tier walks from
first sign-in to your first installed pack, and the build-your-own tier shows
how to deploy a workflow as a service programs can call. This page carries no
step-by-step tutorial — for learning, go straight to the courses.

## Try it

[Open the demo](https://platform.finddatatech.cloud).
