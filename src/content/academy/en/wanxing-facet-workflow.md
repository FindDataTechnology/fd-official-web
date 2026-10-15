---
title: "Wanxing and Facet Together: Build Your First Personal Workflow"
summary: "Combine the skills and MCP servers you installed in Yizuo into your own workflow (a custom preset), deploy it on Wanxing as a service programs can call, and run it with one A2A request, a visitor chat page, and the console."
order: 2
source_material: "Yizuo·Wanxing User Manual §1.3–§1.4, §2 (pack installation, custom presets and publish-and-deploy, deploying an agent as a service, A2A calls, deployer console, chat facade); Platform Guides pack (the Facet Pack Builder guide skill, including the four permission gates and the pack build chain)"
pack_url: ''
---

## What You Will Be Able to Do

Combine the skills and MCP servers you installed in Yizuo into your own personal workflow (a custom preset), deploy it on Wanxing as a service programs can call, and run that service with one A2A request, a visitor chat page, and the console.

## Prerequisites

- Course one completed, or existing familiarity with the Yizuo pack marketplace and the trace page.
- A platform account; the publish-and-deploy shortcut additionally requires your account to be in the creators group.
- To call a service you need a call key (an `sk-` credential, provided by the platform) and a tool that can send HTTPS requests (`curl` is enough).
- No deployable preset yet? That does not block the lesson: any public service in the Wanxing catalog can be called with the method in step 5, and the caller-side work is exactly the same.

## Steps

### 1. Tell the three surfaces apart

- **Facet** is the pack marketplace and supply side: skills + MCP references + a persona are assembled into a pack, then published with versions. The marketplace is at `facet.finddatatech.cloud`, and skills and MCP servers are registered at `mcp.finddatatech.cloud`.
- **Yizuo (Platform)** is the assembly and personal-use surface: subscribe to and install packs, use them in chat, and build custom presets.
- **Wanxing** is the service surface (`wanxing.finddatatech.cloud`): deploy an assembled agent as a service, exposing A2A calls, the catalog, the visitor chat page, the console, and usage.

The full chain of a service: Facet publishes a pack → Yizuo subscribes and installs → you deploy → Wanxing exposes the A2A endpoint → callers call it with a call key → the turn is billed.

### 2. Build your workflow with a custom preset

Settings → Presets (`/settings/presets`): pick a subset of the skills and MCP servers you have installed and give it a persona — that is your personal workflow. Back in `/chat`, select it in the agent selector and ask a real business question; check `/trace` to confirm it used the tools you picked.

### 3. Publish and deploy the preset as a service

Each preset row has a "Publish and deploy" action: it turns the preset into a pack (creators group required) and deploys it as an agent service in one step — the shortcut from "for myself" to "for others".

You can also use the standard entry: Yizuo → Settings → Packs → open the pack details → an agent that carries a serving contract shows a "Deploy as a service" button → optionally override rhythm / budget, paste a billing key → deploy, effective within about 5 minutes.

- Billing key: the `sk-` key you paste at deploy time is the billing identity whose model resources the agent consumes while running turns, paid by the deployer. Leave it empty to keep the existing binding.
- Once deployed, a deployment row appears on the same page: version, online / paused state, pause / resume buttons, and "Configure" — which jumps to that agent in the Wanxing console.

### 4. Watch it from the Wanxing console

The console (`#/console`, sign-in required):

| Panel | What you can do |
| --- | --- |
| Fleet board | Status overview of all agents (refreshes every 30 seconds) |
| Per-agent timeline | The agent's most recent events, including latency |
| Deployments | List your deployments; pause / resume |
| Caller allowlist | Add / remove caller emails for private agents (not needed for public ones) |
| Service config | Read and write rhythm / turn budget / model per deployment |
| Usage | Who called my agent (call records) |
| Allowance | The free-allowance cap for the visitor chat page |

### 5. Let a program call it (A2A)

First get the slug: `GET {BASE}/api/wanxing/v1/agents` returns the public catalog, and the slug looks like `packs-<packId>-<agentId>` (all lowercase). You can also read the AgentCard first: `GET {BASE}/api/wanxing/v1/a2a/{slug}/.well-known/agent-card.json`. Then send a turn:

```bash
curl -X POST "https://wanxing.finddatatech.cloud/api/wanxing/v1/a2a/<slug>" \
  -H "Authorization: Bearer <call-key>" \
  -H "Idempotency-Key: my-$(date +%s)" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"message/send",
       "params":{"message":{"role":"user","parts":[{"kind":"text","text":"Hello"}]}}}'
```

Key points:

- The synchronous response is a receipt (the agent's immediate reply); the long-running work happens inside the turn. Switch to `message/stream` for streaming; the response is SSE.
- Idempotency: `Idempotency-Key` applies to `message/send` only, with a 24-hour replay window — replaying the same key returns the first complete response, does not run a second turn, and does not create a second charge.
- Billing is by duration: minutes rounded up × the tier unit price, settled to the call key as soon as the turn ends; failed turns are not billed.
- Concurrency: one turn at a time per (caller, agent); going over returns 409 with `Retry-After` — retry as instructed.
- Common error codes: 401 invalid key; 402 insufficient balance or caller suspended; 403 private agent not on the allowlist; 404 no such service; 409 turn already in flight; 423 agent paused; 429 rate limited; 503 billing surface unavailable.

### 6. Give people a chat entry point

Public agents: anyone can open `https://wanxing.finddatatech.cloud/#/chat/<slug>` and chat after signing in. The free allowance is carried by the allowance you set in the console; when it runs out the page does not close — visitors are prompted to paste their own call key and continue, after which turns run against their own balance. Private agents require the caller to be on the allowlist first.

## Self-Check

- The service is alive: one `curl` returns a receipt, and the call record shows up in the console's usage view.
- Pause works: pause the agent in the console and call it again — you get 423 (`AGENT_PAUSED`). Resume, and the retry succeeds.
- Idempotency works: send the same `Idempotency-Key` twice; the second call returns the same response, with no second charge.

## Next Steps

Turn your workflow into a pack others can use: prepare skills → register them in the registry → assemble the manifest and pass validation → publish to Facet → open up permissions → accept. The full recipe for that chain is in the Facet Pack Builder guide, the other skill in the official Platform Guides pack in the same marketplace. When a user cannot install or use a pack, check the four gates in order: the pack-install group gate, registry scope, billing identity, and the user's own marketplace credential — the last one only the user can set up, by connecting the MCP market in Yizuo.

Companion Facet pack: the dual-format pack for this course will be available on the Facet marketplace (`facet.finddatatech.cloud`); once it is published, search for the course name under Settings → Packs in Yizuo to subscribe and install. The marketplace URL will be filled in on this page once the pack is published.
