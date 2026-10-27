---
title: "Yizuo Getting Started: Your First Deliverable from Zero"
summary: "From sign-in to hand-off: load your own documents into the knowledge base, install an industry pack, produce findings backed by real tool calls, and hand over an anonymous read-only share link."
level: 'use'
order: 1
source_material: "Yizuo·Wanxing User Manual §1 (Yizuo interface map, minimum onboarding, full pack-install flow, common operations); Platform Guides pack (the Yizuo & Wanxing manual skill)"
updated: '2026-10-27'
pack_url: 'https://facet.finddatatech.cloud/#/packs/bQ-NlOBloZegGfkiczktDA'
---

## What You Will Be Able to Do

Complete your first deliverable with Yizuo (the AI assistant workbench): load your own documents into the knowledge base, install an industry pack, have it produce findings backed by real tool calls, and hand over an anonymous read-only share link. Everything happens in the browser — no software to install, no command line.

## Prerequisites

- A platform account (provisioned by your organization or platform operations; sign-in uses single sign-on).
- A browser, plus one or two documents of your own (PDF, Markdown, plain text, or just a web page URL).

## Steps

### 1. Sign in and learn the workbench map

Open the platform entry and sign in with your organization account (single sign-on, no extra password). You land on the chat page by default; this step is about knowing what each area is for.

| Location | What it is for |
| --- | --- |
| Chat home (the default page) | Streaming reasoning, tool calls and skill execution; switch models and agents at the top right |
| Knowledge base | Import PDF / Markdown / text / web URLs for retrieval-augmented answers |
| Agent catalog | Agents and apps, including agents that arrive with a pack |
| Scheduled tasks | Time-based runs, with optional notifications |
| Resource library (left nav) | Charts and other outputs are filed here automatically |
| Call trace (left nav) | The per-turn record of tool calls — where you verify that tools were really called |
| Settings (bottom left) | General, account, models, external tools, skills, packs, custom presets, and more |

### 2. Ground answers in your own documents

Go to the knowledge base in the left navigation and import one or two documents of your own (PDF, Markdown, plain text, or a web URL). Back on the chat page, ask a question whose answer exists only in your material, and confirm the answer cites your documents rather than speaking in generalities. This is the step that turns a general-purpose assistant into one that understands your business.

### 3. Install a pack to bring industry capabilities in

1. Settings → Packs, the entry at the bottom left of the platform.
2. First click "Connect market": on the login page that opens, choose "Continue with your organization account" — it is a shared session, you never type a password, and a 7-day personal credential is minted for you. Marketplace-sourced capabilities need this step; without the credential the installation is refused with a missing-credential notice. No administrator can do this for you — you have to click it once yourself.
3. Browse the marketplace → open a suite's details → subscribe → install it into the runtime ("My packs").
4. After installation the pieces land in different places: skills under Settings → Skills (hot-loaded, ready immediately); external tools under Settings → External tools; agents and roles appear in the agent selector on the chat page.

### 4. Put it to real work

Open a new session, pick the role you just installed in the agent selector, and ask a real business question — do not validate with something like "hello". Have it give you a conclusion, and ask for a chart if you need one; charts are filed into Resources automatically.

Note the focused mode: once you pick a specific agent, the available tools narrow by design to the set that pack declares. That is intended behavior, not a fault.

### 5. Check the trace to prove it is not a hallucination

Open the call trace page in the left navigation and find the turn you just ran: you will see skill execution, and one real tool-call record after another (the tool name plus what it returned). This is the dependable way to judge whether the model actually queried data, and it is the self-check to run before handing conclusions to a colleague.

### 6. Hand the result over

Choose Share from the session menu to get a `/share/:token` read-only link that opens anonymously. Send it to a colleague and your first deliverable is done.

## Self-Check

- Grounding works: ask a question answered only by the documents you imported, and the reply cites your material.
- Tools are real: find at least one tool-call record (with the tool name and its return) in the call trace page.
- The hand-off works: open the share link in a private window and see the full session without signing in.

## Next Steps

Once the capabilities are connected, the next step is to turn them into your own standing workflow: continue to course two, Wanxing and Facet Together, where you combine skills and external tools into a custom preset and deploy that workflow as a service programs can call.

Companion pack: the dual-carrier pack for this course will be available on the marketplace once published; from then on you can search for the course name under Settings → Packs in Yizuo to subscribe and install. The publication status is shown at the entry at the bottom of this page (it reads "coming soon" until the pack ships).

## If It Did Not Work

- **The login page will not open, or the connection step fails**: this is your organization account's single sign-in — ask platform operations to confirm the account is provisioned. A page that will not open at all is usually network restrictions; try a normal network.
- **You cannot find the role you just installed in the chat page's selector**: check Settings → Skills first to confirm the skill really installed; the agent selector sits at the top of the chat page — refresh and open it again. A skill installed but the external tools missing almost always means the "connect market" step was skipped.
- **The call trace page shows no tool calls**: the model answered from its own knowledge instead of querying data. Rephrase the question, ask it to cite its data source and show how it queried, and run the turn again.
- **The share link will not open, or asks you to sign in**: make sure you sent the whole link (it is easy to truncate); if it still fails, regenerate the link from the session menu.
