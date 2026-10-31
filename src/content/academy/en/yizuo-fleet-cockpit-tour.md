---
title: "Yizuo Cluster Cockpit, Illustrated: What Every Block and Every Word Means"
summary: "Using a live three-post content cluster as the example, this course walks through the cluster cockpit block by block: the five health counters, the vocabulary card, the orchestration panel and canvas, the execution timeline, post cards, the latest-outputs stream and the approval queue — every screenshot annotated with what to look at. You will finish able to read your own cluster at a glance and create your first post."
order: 4
level: use
updated: "2026-10-28"
source_material: "Yizuo cluster cockpit UI and its built-in vocabulary card (current-word edition, October 2026)"
pack_url: ''
---

## What you will be able to do

Open a cluster cockpit and understand it without guessing: what the five counters at the top mean, what the canvas and the orchestration panel are telling you, how to use the execution timeline, what each status badge and button on a post card does, when the approval queue needs you, and what words like "outputs", "on call" or "vacant" actually refer to. You will also create your first post and know where to trace any piece of work back to its conversation.

## Prerequisites

- A platform account; the "Clusters" entry visible in the left navigation after signing in.
- Having a cluster of your own helps, but is not required — this course uses a live three-post content cluster as the example.

## Three words first: cluster, post, holder

A cluster is a team. A post is a stable position within it. The holder is whoever occupies that position. Positions and holders are deliberately separated: swapping the holder never touches the post — its schedule, its place in the tree and its output history all stay. The cockpit you are about to read is this team's dashboard.

## Steps

### 1. From the list to the cockpit

Click "Clusters" in the left navigation. The list shows all your clusters, each labelled with its state and post count; "Create cluster" in the top-right starts a new one. A brand-new cluster has no posts yet, so the structure view says "No posts yet — start staffing one".

![The cluster list and the create entry in the page's top-right corner](https://cms.finddatatech.cloud/uploads/00_fleet_list_59584c3269.png)

Select a cluster to open its cockpit. A row of buttons in the header covers whole-cluster actions: "Approvals" (items waiting on your ruling), "Pause all", "Add post", "Archive" and "Dissolve". The next screenshot is the main stage of this course — take it in as a whole first, then we break it down block by block.

![Cockpit top: health counters, vocabulary card, orchestration and canvas](https://cms.finddatatech.cloud/uploads/01_cockpit_top_abcde482e4.png)

### 2. Health counters: five numbers that summarize the team

Below the title sits a row of colored counters, one per post status. Hover any of them for the full explanation:

| Counter | When it lights up | What you should do |
| --- | --- | --- |
| OK | The post has a holder and works on schedule | Nothing |
| Paused | The cluster or this post is paused; it stays idle even when due | Resume it from the post card when wanted |
| Overdue | It was due but did not hand in its output within the tolerance window | Open "Outputs" or "Source chat" on the card to see where it stuck |
| Vacant | No holder bound, or the bound role no longer exists | Click "Swap holder" to bind one |
| On call | Not scheduled, costs nothing, waits to be dispatched or woken by an approval | Normal; nothing to do |

In the example cluster: the patrol post is OK; the content post is on call — it has no schedule and waits for the supervisor to dispatch work; the source post is paused — it stays idle until you resume it from the post card. One row of numbers, and you already know the whole team. That is exactly what the counters are for.

### 3. The vocabulary card: old word → current word

If you learned the earlier names of these features (reporting, sign-off, passive…), expand the "Vocabulary" row under the health counters — nine old-to-new pairs at a glance:

![Vocabulary card expanded: nine old-to-new pairs](https://cms.finddatatech.cloud/uploads/03_vocabulary_card_543e1be73d.png)

| Old | Current | Meaning |
| --- | --- | --- |
| Reporting | Outputs | What a post hands in when its turn ends |
| Sign-off | Approval | Your ruling on a post's request for authorization |
| Failed | Overdue | Due but no output within the tolerance window |
| To-fill | Vacant | No holder bound, or the bound role no longer exists |
| Passive | On call | Not scheduled; waits for dispatch or approval wake-up |
| Rotation | Swap holder | Bind a different holder to the post |
| Cadence | Scheduled runs | The post's timed turns (daily at 9, every few hours…) |
| Report stream | Latest outputs | The timeline of each post's most recent output |
| Handoff | Relay | When an upstream post finishes, work passes downstream |

New to clusters? Skip this row entirely — the current words are the final naming, and the interface only ever shows them.

### 4. Orchestration and the canvas: how this team collaborates

Below the vocabulary card sits the orchestration area (middle of screenshot 1). Its first line states the team's collaboration mode and guardrails: "supervisor mode" means posts may dispatch work to each other; the depth limit and per-hop budget cap how many hops a dispatch can travel and how long each hop may take, so delegation cannot snowball. The second line, "dispatch", says where dispatch rights come from: with no edge declared one by one it reads "implicit grants only" and gives the pair count — rights come from the mode itself, not from a drawn wiring diagram.

Three more things live in the same block:

- **The config bar**: model distribution (how many posts run on each model), reasoning effort, context budget and 24-hour edge traffic — read the whole team's profile first, then decide whether to change posts one by one;
- **The canvas**: the graph of posts and their connections; nodes carry the post name, holder, effective model and latest run time, and the particles travelling along an edge mean dispatch/relay is genuinely happening;
- **The "Design" button**: enter design mode to wire edges by hand. Every change produces a draft diff and lands only after you confirm it; a newly created cluster likewise waits for your confirmation of its structure before anything fires.

### 5. The execution timeline: what this team actually ran

Under the orchestration area sits the expandable "Execution timeline". Each row is one real turn — status (succeeded / failed / partial), source (schedule / manual / delegated / event), post, duration and token counts. Three dropdowns filter by status, source and post; open any row and the "Waterfall" below breaks that turn into tool-call bars, with a "Live" / "Replay cursor" switch in its corner so you can step through what it was doing.

![Execution timeline: run rows and the waterfall](https://cms.finddatatech.cloud/uploads/06_execution_timeline_369de22f31.png)

This is the first place to look when something smells wrong: check for failed runs, open the waterfall to see which tool it stalled on and for how long, then go to the post card or the source chat for detail.

### 6. The structure view: reading a post card

The structure view lists every post card by hierarchy. Top to bottom on a card:

![Post cards (from another three-post cluster; card anatomy is identical)](https://cms.finddatatech.cloud/uploads/02_post_cards_7200cb941f.png)

- **Status badge** (top-left): OK / on call / vacant / overdue / paused — matching the counters one to one;
- **Post name and holder**: the post name in bold; "Persona" means the holder is a role configured on the platform, "Array" is a group of agents working together, "Agent service" is an externally registered agent service; followed by the effective model;
- **Scheduled runs**: e.g. "daily 9:0"; without one it reads "on call (no schedule; runs when tasked)";
- **Latest-turn summary**: one sentence on what this round did and found (the metric row sits alongside it, self-reported by the post's latest turn);
- **Buttons**: "Outputs" shows the post's output details (each output carries "Source chat", one click back to the full conversation); "Details" opens the post's side panel with three tabs — Config / Outputs / Approvals. Swap holder, pause and remove all live under Config.

### 7. Latest outputs: the team timeline

At the bottom of the page, "Latest outputs" lines up every post's most recent output — newest first, troubled posts pinned to the top — each row carrying its status badge and post name, with "Source chat" one click away. Whenever you wonder "who did what recently", look here first instead of walking through every card.

![Latest outputs: each post's most recent output](https://cms.finddatatech.cloud/uploads/07_latest_outputs_df343156f8.png)

### 8. The approval queue: when the decision is yours

When a post needs your authorization (say, replacing a credential or running a sensitive operation), it does not act on its own — it files the request into the approval queue, and a banner at the top of the cockpit reads "N awaiting you". Click "Approvals" in the top-right; the drawer title carries the pending count:

![Approval queue: an example request awaiting your ruling](https://cms.finddatatech.cloud/uploads/04_approval_queue_883b6940da.png)

Each request states who filed it (the source post), when, the full story, the suggested deadline and the post's own recommended handling. Once you rule on it, the status becomes "approved"; tick "show all (resolved/expired too)" to review handled items as well. Ignored requests expire, and the post will remind you again — or try a different approach — on a later turn.

### 9. Creating your first post

Click "Add post" in the top-right:

![The add-post dialog](https://cms.finddatatech.cloud/uploads/05_create_post_a390739035.png)

- **Post title**: name it after the function (e.g. "patrol post");
- **Target kind**: decides who you can bind — "Persona" is a role configured on the platform, "Array" is a group of agents working together, "Agent service" is an externally registered agent service;
- **Incumbent**: the specific target to bind;
- **Reports to**: leave unselected for a top-level post;
- **Scheduled runs**: pick a schedule (hourly / daily at a time / custom cron) or keep "on call (no schedule; runs when tasked)". An on-call post costs nothing and only works when dispatched or woken by an approval. Once a schedule is chosen, a prompt-template field appears — the instruction handed to this post on every timed or woken turn (one sentence is enough).

Save, and the post appears in the structure view. A post without a holder is vacant, and the "vacant" counter ticks up.

## Self-check

1. Open your own cluster cockpit, read out the five counters, and say which kind of post each number counts.
2. Expand the vocabulary card, find the current word for "handoff", then locate where that word appears in the interface.
3. In the execution timeline, filter by "failed", open a row and read its waterfall — say which tool it stalled on.
4. Open the approval queue and confirm nothing is waiting for you; tick "show all" to see what a handled request looks like.
5. Add an on-call post (no schedule) to your cluster and watch it counted under "on call".

## FAQ

**Q: How is on-call different from paused?**
On call is a property of the post: no schedule, works only when dispatched or woken by an approval, costs nothing meanwhile. Paused is a state someone put it in: while paused, the post stays idle even when due. On call needs no action; paused is usually the result of a deliberate operation.

**Q: The counters say overdue, but the post card looks fine?**
Refresh the page first. If they still disagree, open the post's "Outputs" and check the latest turn's time — anything past the tolerance window counts. The window is derived automatically from the post's schedule interval.

**Q: Does a vacant post ever work by itself?**
No. Vacant means nobody holds the position, so nothing can ever wake it. Bind a holder via "Swap holder" to bring it back.

**Q: The approval queue looks empty, but I remember approving something?**
By default only pending items show. Tick "show all (resolved/expired too)" to review approved and expired requests.

**Q: How do I make posts collaborate automatically (upstream finishing passes downstream, a supervisor dispatches work)?**
That is the territory of orchestration — see the next course; the cockpit's "Design" mode also lets you wire edges by hand.

## Next step

- "Yizuo Cluster Orchestration: From a Single Assistant to a Team That Works Together" — declare collaboration in plain language: supervisor dispatch, pipeline relay, parallel drafts with a judge, and external event wake-up.
