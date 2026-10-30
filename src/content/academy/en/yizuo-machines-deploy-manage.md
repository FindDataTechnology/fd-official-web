---
title: "Deploy and Manage Your Machine: a Real Computer, Governed from the Cloud"
summary: "Bring a real computer into the unified console: install the desktop app, enable the resident steward, pair it, then watch the roster and edit cloud expectations — and learn the convergence rule that local actions always win. Offline doesn't mean stopped; the cloud never reaches into your machine."
order: 4
level: use
updated: "2026-10-30"
source_material: "Yizuo production walkthroughs (2026-10-30: nine-leg production round-trip + a real foreign machine pairing leg on a GitHub runner, run 41012878574); live console UI strings (machines.*, settings.devices.*); the desktop app's steward settings panel; v1.3.27 official download links"
pack_url: ''
---

> One-sentence architecture: **machines do the work and fetch their own
> orders.** The cloud only writes *expectations*; each machine pulls them on
> its own beat. There is no control channel back in: the cloud can't reach
> into your machine, and when the network drops, the machine keeps working
> anyway.
> If you're new to the interface itself, start with lesson one, *Yizuo
> Getting Started* (`/research/academy/yizuo-getting-started`).

## Part 1 — Bringing a machine online

### Step 1: Download and install the desktop app

From the product page **www.finddatatech.cloud/products/base**:

| OS | File |
|---|---|
| Windows | `Platform.Setup.<version>.exe` |
| macOS (Apple silicon) | `Platform-<version>-arm64.dmg` |

Open the app after installing. It is already a **fully functional local
instance** — you can build teams and run tasks without any cloud account
(this instance is open-access with no account system; no pairing needed).

### Step 2: Install the resident steward

In the app: **Settings → the steward tab → the install/consent button on
that tab** (in the Chinese UI it reads 同意并安装后台管家 — one button, one
meaning: the resident steward).

The steward is a resident service: it survives closing the app and starts
on boot. It is the 7×24 backbone of the machine.

### Step 3: Mint a pairing code in the console

Sign in at **platform.finddatatech.cloud** in a browser →
**Settings → Paired devices**.

The page shows a **6-digit pairing code and a QR**: single use, valid for
**5 minutes**; hit refresh for a new one after expiry.

### Step 4: Pair

Back in the desktop app, either:

- **Scan**: on the pairing screen hit the scan button and point the camera
  at the QR from step 3 — server address and account bind in one capture;
- **Type**: enter the server address (`https://platform.finddatatech.cloud`)
  and the same 6 digits manually.

The moment pairing succeeds, the console's **Machines** page shows this
machine.

> **Privacy boundary (read before pairing)**: a paired machine reports only
> online state, OS and version, and counts/name-tags of teams, roles and
> tasks. **Prompts, conversation content and tool parameters never leave
> the machine.**
>
> **Unpairing**: console → Settings → Paired devices → revoke this device;
> the machine can also unpair from its own pairing screen. After revocation
> cloud expectations stop flowing; the machine's own work is unaffected (it
> simply stops taking orders).

## Part 2 — Managing from the cloud

### The roster at a glance

One card per machine: name, status badge, system info, a summary
(**teams n · roles n · deployments n**), and detail freshness ("n seconds/
minutes/hours ago").

Three presence states: **online** (reporting on beat) / **silent** (no
report past the timeout — usually offline or the app isn't running) /
**never reported** (paired but hasn't reported yet). Alert badges: silence
timeout, **expectation diverges from reality**, crash protection,
consecutive expectation-pull failures, merge rejected.

Click a card for the **detail drawer**: deployment entries, agent run
states, rejected expectation merges. "Detail stale" means reports fell
behind — check that the steward on that machine is running.

### Editing cloud deployment expectations

The **"Deployment expectations (cloud)"** block in the drawer is the
control surface:

- add a team/role from the deployment entries below, or flip an entry
  **enabled/disabled**;
- **remove** entries you no longer want;
- saving writes the cloud expectation set. The UI's own hint, verbatim:
  changes land only in the cloud expectation set; the machine pulls and
  converges on its own beat, and **local manual actions always win**.

### Convergence takes a beat

Machines fetch on their own schedule (roughly a minute), diff expectations
against reality, and reconcile — **expectations are not pushed instantly**.
Give it 1–2 minutes after saving and the entry shows a "cloud" source tag.

### The local-wins rule (the key mental model)

Every deployment carries a source tag: **cloud expectation** or
**local manual**.

- If you deploy a role locally on the machine that the cloud also expects,
  that row gets *adopted* into local-manual and the cloud **never touches
  it again** (the roster may briefly flag it as divergent — that's by
  design, not a fault);
- **Removing a cloud expectation** deletes only rows the cloud created;
  local-manual rows stay put;
- To hand control back to the cloud: remove the local manual deployment,
  and the next beat re-lands the cloud expectation.

### Offline and self-healing

While disconnected, the machine keeps working (tasks run, teams stay on
duty); the cloud simply can't see it — the card flips to **silent** with a
silence-timeout alert. Network back, reporting resumes automatically, and
expectations missed in the window land on the next beat. Everything the
cloud knows comes from the machine's own reports — silence is not loss of
control; it's the machine quietly doing its job.

## FAQ

| Symptom | What to do |
|---|---|
| Machines page says "no paired machines" | Follow steps 3–4 above; codes expire after 5 minutes — refresh for a new one |
| "Roster unavailable" | You're signed out or the service is off — sign in to the console first |
| "Server version too old for device pairing" | Platform-side upgrade needed (ask your deployment operator) |
| Expectation saved but nothing moves | Check the card's alert badges: pull failures / merge rejected → open the drawer for the reason (e.g. the pack isn't installed on that machine) |
| Crash-protection badge | A team on that machine failed repeatedly and was degraded for safety; check the machine's live task state, then disable or repair |
| Retire an old device for good | Settings → Paired devices → revoke; the roster row clears |

## Next step

Once machines are in, team-level management (multi-role collaboration,
scheduled duty, orchestration) continues in the course *Yizuo Fleet
Orchestration* (`/research/academy/yizuo-fleet-orchestration`).
