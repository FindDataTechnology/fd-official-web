---
title: "Install Your First Pack"
summary: "Connect the marketplace, subscribe and install a pack, then pick its role in the chat — actions and expected outcomes only, no internals."
order: 2
level: use
updated: "2026-10-18"
source_material: "Yizuo-Wanxing manual §1.3 (pack installation flow)"
pack_url: "https://facet.finddatatech.cloud/#/packs/bQ-NlOBloZegGfkiczktDA"
---

## What You Will Be Able To Do

Install your first pack (an industry capability bundle) into Yizuo. After it is installed, new experts/roles appear on the chat page, carrying ready-made skills and tools. This course only covers installing and confirming it works — not how it works inside.

## Prerequisites

- You have finished Ground Your First Question in Your Own Documents.
- A platform account. The marketplace connection step must be clicked by you in person — an administrator cannot do it for you. The exact spot is below.

## Steps

### 1. Open the packs page

Open Settings and find Packs in the side panel. You will see two parts: the installed list (possibly empty) and the marketplace entry.

### 2. Connect the marketplace (once only)

Click Connect Marketplace. A sign-in page opens — confirm with the same organization account (Continue with SSO), and the page hops back to packs.

**What you should see**: the button turns to connected (or the prompt disappears). Marketplace-sourced packs need this step; installing without it shows a missing-credential notice.

> Why nobody can do this for you: the step mints a pickup credential tied to your personal account — only you can claim it.

### 3. Subscribe and install

Browse the marketplace list → open a pack's details → Subscribe → Install to runtime.

**What you should see**: the pack appears under My Packs as enabled. Three places gain new things: new skills under Settings → Skills (ready immediately), and a new expert/role in the agent selector on the chat page.

### 4. Put it to real work

Start a new session, pick the new role in the agent selector, and ask a real business question (never validate with "hello"). Ask for a chart if you need one — charts are filed into results automatically.

**Note**: once a specific expert is selected, its available tools narrow to the set the pack declares. That is by design, not a fault. Switch back to the general assistant or another expert for other tools.

### 5. Confirm it really called the tools

To be sure the answer was not invented: open the trace page, find the turn you just ran, and look for skill executions and tool-call records. Seeing records, you can hand the conclusion over with confidence.

## If Something Did Not Work

- Connect Marketplace errors out or will not hop through: wait a few minutes and retry once; if it still fails, the shared sign-in service is likely under maintenance — contact platform operations.
- Install clicks do nothing, or a missing-credential notice appears: finish step 2 (marketplace connection) and install again.
- Installed but no new role in the agent selector: refresh the chat page once; if still nothing, check the install status under Settings → Skills.
- Installed but asking errors with a tool-unavailable note: make sure the agent selector is on the new role, not the general assistant.

## Next Steps

Capabilities are in. To assemble them into your own standing workflow — or deploy one as a service programs can call — that is the build-your-own tier, see Wanxing and Facet Together (it assumes you have finished this course).

Companion Facet pack: once this course's pack is on the Facet marketplace, subscribe and install from the pack card on this page.
