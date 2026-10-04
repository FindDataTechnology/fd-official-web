---
name: "Wanxing"
tagline: "The serving platform for agents — deploy, host, expose, meter, and observe them as standard A2A services."
kind: "Agent serving platform"
demoUrl: "https://wanxing.finddatatech.cloud"
line: constellation
order: 5
---

The Constellation line (寻数·萬星) points at people connected through their own agents — autonomous gatherers that work together; FindDataRouter is the first star. Wanxing is the layer where those agents actually go online: deployed onto a fleet, resident and running, exposed through a standard endpoint, and settled by usage. The public catalog is open to everyone; deployers sign in with a FindData account to run the fleet from the console.

## Deploy and stay resident

Agents are deployed onto the fleet and stay resident; each deployment gets a slug and a stable address. The deployer console manages the deployment list (pause / resume) and per-agent caller allowlists for private agents.

## A standard A2A face

External callers speak native A2A — JSON-RPC 2.0 over HTTP, `message/send` for sync answers and `message/stream` over SSE. Callers authenticate with a bearer key; an `Idempotency-Key` makes replays safe: within the 24-hour replay window the same key returns the first complete answer without running a second turn or producing a second charge. The endpoint shape: `POST /api/wanxing/v1/a2a/<agentSlug>`.

## Metering and billing

Billing is by call duration, rounded up to the minute, settled as each turn ends. The turn's actual consumption is borne by the deployer; the platform settles duration against the caller's key. Failed turns (platform- or upstream-side) are not billed but are still recorded. Insufficient balance or spend window refuses the call (fail-closed).

## Fleet observability

The console gives deployers the full fleet view: per-runner deployment levels, 24-hour turn counts, queue and lag, plus a lifecycle timeline per agent — admission, turn start, wake, settlement, one causal chain you can drill into. Deployer identity runs on FindData accounts (Logto); private data stays private.

## Try it

[Open Wanxing](https://wanxing.finddatatech.cloud).