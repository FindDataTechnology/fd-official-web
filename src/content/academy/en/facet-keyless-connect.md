---
title: "Connect Without Keys: Install a Pack in WorkBuddy and Hook Up Your Data"
summary: "Install a pack from the marketplace, then complete one authorization with a single command — no key to copy or paste, renewal automatic, config written for you."
order: 7
level: build
updated: '2026-10-31'
source_material: "Facet CLI 0.3.0 (facet auth lane selection), facet-marketplace projection (2026-10-31: 75 packs, 54 with data references), WorkBuddy 5.9.3 client build review"
pack_url: ""
---

## What You Will Be Able To Do

Install a pack from the marketplace into WorkBuddy and connect it to your real data — **without ever copying or pasting a key**. Afterwards the pack's skills and roles work inside WorkBuddy, and the data connection renews itself in the background.

## Prerequisites

- WorkBuddy 5.9 or newer, installed.
- A computer with Node.js 18 or newer, for one setup command.
- A platform account that can sign in through your organization's single sign-on — the authorization step happens in a browser and must be done by you.
- A pack in mind. The marketplace carries more than seventy; this course uses "Three-Role Research Team" as the example, and any other pack works identically.

## Steps

### 1. Separate "installing capability" from "connecting data"

Worth a moment, because it explains why there are two actions later.

- **Installing a pack** puts its skills and roles into WorkBuddy. It reads public content only — no identity needed.
- **Connecting data** lets those roles read real data. That requires knowing *who you are*, hence one authorization.

The two are independent: you can install a pile of packs first and connect them one by one later. Precisely because they are separate, skipping steps 2–3 never fails on credentials.

### 2. Add the marketplace source (once)

WorkBuddy accepts external marketplace addresses. Open the plugins page → click the round "+" in the corner → choose "Marketplace source" → paste this single line:

```
FindDataTechnology/facet-marketplace
```

The `owner/repo` shorthand is enough — **no full URL needed**. The client fetches the catalog from that public repository itself. That is also why it recognizes the shorthand at once: it reads the marketplace manifest in that repository, not a web page.

Once added, the marketplace list gains this set of packs.

### 3. Install the pack

Find the pack you want and install it. Then check two places:

- the skills page lists its skills;
- the role selector on the chat page lists its roles.

That is as far as **expected behaviour** goes — installed packs cannot read your data until the next step.

### 4. Connect data (one command, one authorization)

In a terminal, replace `<pack id>` with the identifier of that pack:

```
npx @finddatatechnology/facet auth <pack id> --target workbuddy --write-mcp
```

The command first prints a "lane" line explaining *why* it takes this route, then opens a browser authorization page — sign in with your platform account and approve. It then writes the connection into WorkBuddy's config file and tightens that file's permissions so only you can read it.

**What you should see**: the terminal reports the MCP connection config was written, lists the file path, and tells you how long the pass remains valid.

> Why "on your behalf" instead of letting WorkBuddy authorize itself: the current WorkBuddy version does not yet consume the authorization fields in a user-level connection config, so the command completes the authorization for you and hands over only a short-lived pass. When the client supports it, the same command switches to the simpler route automatically — **your steps do not change**.

### 5. Confirm it is really connected

Do not test with "hello". Start a new session, pick the role you just installed, and ask a **real question whose answer you already know**. Then open the trace page for that turn: if it shows a data tool call and a result, you are connected.

### 6. When it expires, do not start over

The pass expires. Do **not** repeat the whole authorization:

```
npx @finddatatechnology/facet auth --refresh
```

It renews silently and **writes the new pass back into WorkBuddy's config** — the old entry is replaced for you, no file editing.

To see how much time is left and whether renewal is possible:

```
npx @finddatatechnology/facet auth --status --target workbuddy
```

### 7. Working with other clients on your team

Every pack with data references in the marketplace ships a per-client connection note at `connect/<client>.json`. It states which route that client should take and which command to run.

Follow that file when you switch clients, and **do not copy a colleague's config** — clients differ in which route works, so a copied config usually does not.

## If It Did Not Work

- **The list is empty after adding the source**: make sure you pasted the `owner/repo` shorthand with no extra spaces. The repository is public; no sign-in required.
- **The command says nothing was written**: re-run with `--write-mcp`, or answer y at the interactive prompt.
- **Using it reports authorization required**: run `--status` to see whether the pass expired; if so, `--refresh`. If it has not expired and you are still refused, your account lacks a role the pack requires — ask an administrator. Retrying will not help.
- **The authorization page will not open**: try another browser, or temporarily disable blocking extensions. You can also add `--no-open`, and the command prints the address for you to open manually.
- **The role works but tool calls fail**: confirm the role selector is on the pack's role, not the general assistant. Selecting a specific role narrows the available tools to that pack's declared set — by design, not a fault.

## Self-Check

You are through when all three hold:

1. `--status` shows the pass is valid and renewable.
2. A real question produces at least one data tool call in the trace page.
3. Running `--refresh` reports the config was rewritten in place, and asking again still works.

## Next Steps

With data connected, you can assemble this pack's roles into your own fixed workflow, or let it run on a schedule — that belongs to the build-it-yourself layer.
