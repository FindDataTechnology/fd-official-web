---
title: "Connect Without Keys: Install a Pack in WorkBuddy and Hook Up Your Data"
summary: "Add a marketplace source in WorkBuddy, install a pack, and establish the data connection with one command. No key is ever copied or pasted; renewal takes one command and rewrites the client connection config for you."
order: 7
level: build
updated: "2026-10-31"
source_material: "Facet CLI 0.3.0 (facet auth lane selection), facet-marketplace projection (2026-10-31: 75 packs, 54 with data references), WorkBuddy 5.9.3 client build review"
pack_url: ''
---


## What You Will Be Able To Do

Install a pack from the marketplace into WorkBuddy and let its roles read your real data. When this course is finished, three things hold at once: the pack's skills appear on the WorkBuddy skills page; its roles appear in the role selector on the chat page; and the data connection works without you storing any key.

## Prerequisites

| Item | Requirement | Symptom when missing |
|---|---|---|
| WorkBuddy | 5.9 or newer | The plugins page has no round "+" entry |
| Node.js | 18 or newer | The `npx` command fails on version or syntax |
| Platform account | Can sign in through organization single sign-on | The authorization page will not return to the terminal |
| A pack | Any marketplace pack that declares a data reference | Step 4 has no data connection to establish |

This course uses "Three-Role Research Team" as the example. With any other pack the commands and steps are identical.

## Terms

This course uses only the right-hand column below. One concept carries one name: readers and retrieval tools locate content by keyword, and two names for one thing break that lookup.

| Concept | Sole name used here |
|---|---|
| The installable unit offered by the marketplace | pack |
| The short-lived credential obtained by authorizing | pass |
| Where WorkBuddy reads connection information | connection config |
| The repository address a pack comes from | marketplace source |
| Where you inspect the tools a turn used | trace page |

## Steps

### 1. Separate "installing a pack" from "connecting data"

These are independent actions. Keeping them apart prevents an authorization failure from being misread as an install failure.

- **Installing a pack** writes the pack's skills and roles into WorkBuddy. It reads public content only and needs no identity.
- **Connecting data** lets those roles read real data. It must confirm *who you are*, so it involves one browser authorization.

The two actions never block each other. You can install several packs first and connect them one by one later; the install step never fails for lack of a pass.

### 2. Add the marketplace source

**Input**: WorkBuddy is installed and its plugins page opens.
**Action**: On the plugins page, click the round "+", choose "Marketplace source", paste the single line below, and confirm.
**Output**: The marketplace list shows the set of packs that source provides.

```
FindDataTechnology/facet-marketplace
```

The `owner/repo` shorthand is enough; no full URL is needed. WorkBuddy reads the marketplace manifest file (`marketplace.json`) inside that repository rather than a web page — that is why the shorthand is recognized on its own.

### 3. Install the pack

**Input**: Step 2 is done and the marketplace list is not empty.
**Action**: Select the target pack in the marketplace list and click install.
**Output**: Two places gain entries — the skills page lists the pack's skills, and the role selector on the chat page lists the pack's roles.

A finished install does not mean data is readable. Reading data requires step 4.

### 4. Establish the data connection

**Input**: Step 3 is done; Node.js 18 or newer is installed on this machine; a usable platform account.
**Action**: Run the command below in a terminal, replacing `<pack id>` with the identifier of the target pack.

```
npx @finddatatechnology/facet auth <pack id> --target workbuddy --write-mcp
```

The command runs in three stages, with these expected observations:

1. It prints a "lane" line naming the connection method chosen and the reason for it.
2. It opens a browser authorization page. Sign in with the platform account and approve.
3. It writes the connection into the WorkBuddy connection config and restricts that file to owner-only access.

**Output**: The terminal reports the MCP connection config was written, lists the file path written, and states how long the pass remains valid.

The command holds the pass rather than letting WorkBuddy authorize itself because the current WorkBuddy version does not yet use the authorization fields of a user-level connection config. Having the command complete the authorization and hand WorkBuddy only a short-lived pass is the only key-free path available on this version. When the client does use those fields, the same command switches to a simpler route and your actions stay unchanged.

### 5. Verify the connection

**Input**: Step 4 is done and the terminal reported a successful write.
**Action**: Start a new session, select the pack's role in the role selector, ask a real business question **whose answer you already know**, then open the trace page for that turn.
**Output**: The trace page shows at least one data tool call and its returned result.

Do not verify with a question such as "hello". A question with no answer cannot distinguish "the data was actually read" from "the model made something up".

### 6. Renew the pass

A pass has a validity period. When it expires, do not authorize again; run the command below.

```
npx @finddatatechnology/facet auth --refresh
```

**Output**: The terminal reports a silent renewal and lists the connection config files rewritten; the old pass inside them is replaced by the new one.

To inspect the current pass's remaining validity and renewal status:

```
npx @finddatatechnology/facet auth --status --target workbuddy
```

`--refresh` writes the new pass back into the WorkBuddy connection config, so no file needs manual editing. It rewrites only passes carrying this platform's audience identifier; other credentials, such as caller keys, are left untouched.

### 7. Use the same pack in another client

The marketplace repository ships a per-client connection note for every pack that declares a data reference, at `connect/<client>.json`. That file states which connection method the client should use and which command to run.

Follow that file when switching clients. Do not reuse another client's connection config — clients support different connection methods, so a reused config usually does not take effect.

## If It Did Not Work

| Symptom | Cause | Action |
|---|---|---|
| The list is empty after adding the marketplace source | The source was mistyped or contains spaces | Re-paste the full line `FindDataTechnology/facet-marketplace`; the repository is public, so no sign-in is needed |
| The terminal reports nothing was written | `--write-mcp` was omitted, or the interactive prompt was answered n | Re-run with `--write-mcp` |
| Using the pack reports authorization required | The pass has expired | Run `facet auth --refresh` |
| The pass is valid but requests are still refused | The platform account lacks a role the pack requires | Ask an administrator to grant the role; retrying does not help |
| The browser authorization page will not open | The default browser is blocked by an extension | Re-run with `--no-open`; the command prints the authorization address for manual opening |
| The role works but tool calls fail | The role selector is still on the general assistant | Select the pack's specific role in the role selector; selecting a specific role narrows available tools to the pack's declared set, which is by design |

## Self-Check

You are through when all three hold:

1. Running `facet auth --status --target workbuddy` shows the pass is valid and renewable.
2. After asking a real question, the trace page shows at least one data tool call.
3. Running `facet auth --refresh` prints that the config was rewritten in place, and asking again still works.

## Next Steps

With the data connection working, you can assemble this pack's roles into a fixed workflow, or let them run on a schedule. That belongs to the build-it-yourself layer.
