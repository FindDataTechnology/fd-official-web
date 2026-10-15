---
title: "Yizuo Getting Started: Your First Deliverable from Zero"
summary: "From sign-in to hand-off: load your own documents into the knowledge base, install an industry pack, produce findings backed by real tool calls, and hand over an anonymous read-only share link."
order: 1
source_material: "Yizuo·Wanxing User Manual §1 (Yizuo interface map, minimum onboarding, full pack-install flow, common operations); Platform Guides pack (the Yizuo & Wanxing manual skill)"
pack_url: ''
---

## What You Will Be Able to Do

Complete your first deliverable with Yizuo (the AI assistant workbench): load your own documents into the knowledge base, install an industry pack, have it produce findings backed by real tool calls, and hand over an anonymous read-only share link. Everything happens in the browser — no software to install, no command line.

## Prerequisites

- A platform account (provisioned by your organization or platform operations; sign-in uses single sign-on).
- A browser, plus one or two documents of your own (PDF, Markdown, plain text, or just a web page URL).

## Steps

### 1. Sign in and learn the workbench map

Open `platform.finddatatech.cloud` and sign in with your organization account. You land on the chat page by default; this step is about knowing what each area is for.

| Location | What it is for |
| --- | --- |
| `/chat` | Chat home (the default page): streaming reasoning, tool calls and skill execution; switch models and agents at the top right |
| `/knowledge` | Knowledge base: import PDF / Markdown / text / web URLs for retrieval-augmented answers |
| `/agents` | Agent and app catalog (includes agents that arrive with a pack) |
| `/tasks` | Scheduled tasks, with optional notifications |
| `/resources` | Resources: charts and other outputs are filed here automatically |
| `/trace` | Per-turn call trace — where you verify that tools were really called |
| `/settings/<section>` | Settings: general, account, models, MCP, skills, packs, presets, and more |

### 2. Ground answers in your own documents

Go to `/knowledge` and import one or two documents of your own (PDF, Markdown, plain text, or a web URL). Back on the chat page, ask a question whose answer exists only in your material, and confirm the answer cites your documents rather than speaking in generalities. This is the step that turns a general-purpose assistant into one that understands your business.

### 3. Install a pack to bring industry capabilities in

1. Settings → Packs (`/settings/packs`).
2. First click "Connect MCP Market": on the login page that opens, choose Continue with Logto — it is a shared session, you never type a password, and a 7-day personal token is minted for you. Marketplace-sourced MCP servers need this step; without the credential you get `credential-required`. No administrator can do this for you — you have to click it once yourself.
3. Browse the marketplace → open a suite's details → subscribe → install to the runtime ("My Packs").
4. After installation the pieces land in different places: skills under Settings → Skills (hot-loaded, ready immediately); MCP servers under Settings → MCP; agents / roles in the agent selector on the chat page.

### 4. Put it to real work

Open a new session, pick the role you just installed in the agent selector, and ask a real business question — do not validate with something like "hello". Have it give you a conclusion, and ask for a chart if you need one; charts are filed into Resources automatically.

Note the focused mode: once you pick a specific agent, the available tools narrow by design to the set that pack declares. That is intended behavior, not a fault.

### 5. Check the trace to prove it is not a hallucination

Open `/trace` and find the turn you just ran: you will see skill execution and real tool calls in the form `mcp__<server>__<tool>`. This is the dependable way to judge whether the model actually queried data, and it is the self-check to run before handing conclusions to a colleague.

### 6. Hand the result over

Choose Share from the session menu to get a `/share/:token` read-only link that opens anonymously. Send it to a colleague and your first deliverable is done.

## Self-Check

- Grounding works: ask a question answered only by the documents you imported, and the reply cites your material.
- Tools are real: find at least one `mcp__<server>__<tool>` call in `/trace`.
- The hand-off works: open the share link in a private window and see the full session without signing in.

## Next Steps

Once the capabilities are connected, the next step is to turn them into your own standing workflow: continue to course two, Wanxing and Facet Together, where you combine skills and MCP servers into a custom preset and deploy that workflow as a service programs can call.

Companion Facet pack: the dual-format pack for this course will be available on the Facet marketplace (`facet.finddatatech.cloud`); once it is published, search for the course name under Settings → Packs in Yizuo to subscribe and install. The marketplace URL will be filled in on this page once the pack is published.
