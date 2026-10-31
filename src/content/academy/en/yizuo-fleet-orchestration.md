---
title: "Yizuo Cluster Orchestration: From a Single Assistant to a Cluster That Works Together"
summary: "Compose multiple posts into a cluster, declare how they collaborate in plain language — a supervisor dispatching work, a pipeline handing off, parallel work with a judge, external events waking posts — and watch every post's status and failures in the cockpit."
order: 3
level: use
updated: "2026-10-27"
source_material: "Yizuo·Wanxing User Manual, Clusters chapter; cluster orchestration product acceptance records (2026-10); Cluster Architect pack usage notes"
pack_url: "https://facet.finddatatech.cloud/#/packs/NoBBXkvxZnJNHlCrAwWp-w"
---

## What You Will Be Able to Do

Turn an assistant workbench that only chats into a cluster with roles, collaboration, and observability: multiple posts, each with a job, collaborating in ways you declare in plain language — a supervisor dispatching work, a finished upstream automatically handing off, several posts working in parallel with one judge, external messages waking a post — all visible in a cockpit that shows who is doing what and who is failing. Everything happens in the browser; no command line.

## Prerequisites

- A platform account (sign in to Yizuo, same as the getting-started course).
- Your deployment has the Clusters capability enabled (a "Clusters" entry in the left navigation).
- Optional but recommended: install the Cluster Architect pack (find it under the market's Clusters category; the "companion pack" link on this course page goes straight there) — a conversational assistant for cluster design: you give instructions in plain language, it drafts, shows you a diff, and lands the change only after you approve.

## Three Words First

| Word | Meaning | Analogy |
| --- | --- | --- |
| Post | A stable position in the organization, bound to an executor (an AI persona, an agent array, a remote agent, or a lightweight tool that needs no model) and a schedule | A "position" in a company — the position outlives the person |
| Scheduled run | The post's scheduled turn: what to do daily at 9, or every few hours | A shift schedule |
| Orchestration edge | A declared collaboration between posts: who triggers whom, who hands off to whom, who may dispatch to whom | Arrows on an org flow chart |

## Steps

### 1. Create your first cluster and read the cockpit

Open "Clusters" in the left navigation → "Create cluster" → add posts. Name each post, bind an executor, and give posts that need scheduled work a schedule (a cron expression, e.g. daily at 9). Saved posts appear in the org tree.

Open the cluster detail — this is the cockpit: each post card shows live status (on duty / paused / overdue / Vacant / passive), the effective model, and the latest turn outcome; the health block summarizes the whole cluster (including an "overdue" count); the latest outputs gathers each post's latest output; when a decision needs you, an approvals banner reads "waiting for N items".

### 2. Let the Architect write the orchestration (recommended)

With the Cluster Architect installed, return to the chat page, select it in the persona picker, and speak plainly:

> Build a content desk: an editor-in-chief, two writers reporting to them, plus a pipeline where the topic scout's finished work automatically flows to a writer.

The Architect will not touch anything directly — it first hands you a **draft diff**: post by post, what will be created or changed, how the edges connect, which posts are scheduled versus standby; large changes include a cost estimate (turns per post per day, roughly how many tokens per month across the cluster). Only after you explicitly approve does it land. A newly created cluster is born all-paused — review the structure and schedules in the cockpit, then press "Start cluster".

You can do without the Architect: create posts, set schedules, and swap executors by hand in the cockpit. The Architect's value is turning "one sentence" into "a reviewable org draft".

### 3. Declare collaboration: four kinds of edges

Describe collaboration in conversation; the Architect translates it into edges (the cockpit's "Orchestration" panel shows every edge the cluster has):

| You say | The system does | Good for |
| --- | --- | --- |
| "Supervisor style: everyone may dispatch to everyone" | Supervisor mode — any post may dispatch work to a teammate post mid-turn; results return to the dispatcher's next turn | Ad-hoc delegation, editor-in-chief reviews |
| "When the scout finishes, hand off to the writer" | Handoff edge — when the upstream turn ends (success or failure, both relayed honestly), the downstream post starts automatically; no retries | Pipelines |
| "Ask A and B in parallel, let C judge" | Fan-out edge — the upstream turn's end wakes several posts in parallel; once all finish, the judge post automatically starts a turn reading every outcome | Competing drafts, review panels |
| "When a customer messages the support bot, wake the support post" | Event edge — an external signal source (such as an inbound chat message) wakes the bound post | Event-driven work |

Guardrails hold the line: collaboration only happens along explicitly declared edges (no implicit inference), chained handoffs have a depth bound, frequency is capped, and every hop leaves a queryable turn record.

### 4. Watch the cluster run

After starting, back to the cockpit:

- Post cards update "last run" and failure reasons with every turn; consecutive failures raise a "consecutive failures" marker.
- The Orchestration panel shows every declared edge (in supervisor mode, post-to-post dispatch grants are marked "implicit").
- Turns woken by fan-out or handoff appear as sessions in the sidebar (e.g. "Handoff · Open-source Desk") — open one to read the upstream result verbatim. Collaboration is not a black box.
- Matters escalated for your decision wait in the banner; approving offers an "execute now" option.

### 5. Keep iterating: the org chart stays alive

Once the cluster runs, iteration is another sentence to the Architect: add or remove posts, change schedules, swap executors, add a handoff, switch a post from scheduled to standby (zero idle cost — it only runs when woken). Every change follows the same "draft diff → your approval → landed" path; deleting a post with edges clears those edges, and the Architect will call that out for separate confirmation.

## Self-check Exercises

1. Build a three-post cluster: an editor-in-chief plus two writers, with a 9am daily patrol on the chief.
2. Declare a handoff "writers hand off to the chief for the summary"; confirm it appears in the Orchestration panel.
3. Manually trigger one chief turn; watch the handoff fire and the sidebar session appear.
4. On a post card, find the latest turn's status and model; reassign that post to another persona and confirm history still belongs to the post.

## FAQ

**Where do I see a failed turn?** On the post card in the cockpit: failure status, a classified reason, and a link to the session. Failed turns also enter the event record; consecutive failures escalate to a card marker.

**Can posts call each other out of control?** No. Collaboration only happens along declared edges; dispatches are rate-capped, chained handoffs have a depth bound, and every hop is auditable.

**What scale is sensible?** Give the few posts that need their own credentials or memory their own instances, keep most posts as shared personas, and use lightweight tool posts for deterministic operations — many posts can be model-free. Beyond a few dozen posts, prefer splitting into several clusters.

## Next Steps

- Export a working cluster as a template (from the cockpit) so teammates can instantiate the same setup in one click.
- Declare an event edge on a support chat bot and watch an inbound message wake a post.
