---
title: "Blueprint Studio Walkthrough: Turning One Sentence into a Publishable Agent Team"
summary: "A step-by-step tour of Blueprint Studio on the live product: create a blueprint, set boundaries, pick a judge model, then validate, approve, cast, trial-run, sign, and re-cast. Learn the two-key acceptance model — a model verdict is evidence, your signature is the final call — and why 'the judge didn't run' is different from 'insufficient evidence'. By the end you can ship your first trial-proven agent team to the marketplace."
order: 6
level: use
updated: "2026-10-30"
source_material: "Blueprint Studio product surfaces and real judge-lane trial records (2026-10 current vocabulary)"
pack_url: ''
---


## What you will be able to do

Take one business sentence ("summarize overnight news and position moves before the morning meeting") and turn it into a **blueprint** that runs the full production line: validate → approve → cast → trial run → sign → re-cast. You end up with an agent team that has **actually been proven to run** and can be installed into your workspace. You will also learn to read every badge in a trial report: which assertions a machine checked, which one a judge model graded, and what "the judge didn't run" means compared to "insufficient evidence".

## Prerequisites

- A Yizuo account; after signing in you can see **Blueprint Studio** in the left navigation.
- The deployment's model lane is working (the judging leg uses an inexpensive judge model; if no lane is configured the studio says so honestly instead of pretending to pass).
- No coding required. The structural segments (post roster, acceptance assertions) are done in the form plus a little JSON — and you can hand your requirements to the **Blueprint Architect** assistant to draft in natural language.

## Meet the surface

![Blueprint Studio: your blueprints on the left (status badge and version), the workbench on the right; the button row across the top is the whole production line](https://cms.finddatatech.cloud/uploads/blueprint_studio_01_studio_overview_485935e252.png)

Each card in the left column is one blueprint: name, status (draft / approved / cast), version. The right side is the workbench, top to bottom: **action bar** (Save, Validate, Approve, Cast & Publish), **editing tracks** (Form / JSON / Draft tabs), **validation verdict**, **edit diff**, and the **trial report**. In the picture the green button up top reads "Re-cast (refresh green report)" — it only lights up once the blueprint has a **signed green report**. That is the end station of this course; just recognize it now.

## Steps

### 1. Create a blueprint

Press "New" in the left column. You get a skeleton with all six segments present (scenario name placeholder "Untitled scenario"); every field is editable. Don't want to start from blank? Use the "Draft" tab: copy a prompt to the Blueprint Architect in a chat — its JSON lands in the same draft pool and goes through the same validation chain. Drafting bypasses no gates.

### 2. Form track: draw the boundaries

![Form track: scenario name, one-line purpose, out-of-scope, data sources, judge model — five fields saying what this team is and is not](https://cms.finddatatech.cloud/uploads/blueprint_studio_02_form_judge_b545ef7787.png)

The form track manages the public face of the blueprint:

- **Scenario name / one-line purpose** — who this team works for, doing what.
- **Out of scope** — what it will never do (e.g. a morning-briefing team names "stock picks, order placement" as out of bounds). As important as the purpose: it is the reference whenever someone later asks "why didn't it do X".
- **Data sources** — register-listed tool names or logical source names only (like websearch). Endpoint URLs are forbidden; credentials are forbidden. Validation catches either per field.
- **Judge model** — pick the grader for model-judged assertions. The default "follow deployment default" **echoes the model actually resolved** (a budget judge tier in the screenshot). You may also pick another model from the roster. One hard rule: **the judge cannot be the model doing the work** — no self-grading.

### 3. JSON track: posts, cadence, acceptance assertions

![JSON track: the structural view of the same draft — post roster, orchestration, cadence, acceptance assertions, board skeleton](https://cms.finddatatech.cloud/uploads/blueprint_studio_04_json_track_18d30b6a7f.png)

Post roster (how many posts, who hands off to whom, how often it runs), **acceptance assertions**, and the board skeleton live on the JSON track. Form and JSON are two views of one draft; edits stay in sync. Acceptance assertions are the heart of the line: they state what "this team actually works" means. Two kinds:

- **Machine assertions** — facts a script verifies: "every post is staffed", "the first round really fired", "reports landed". Ran or didn't run — checkable, no opinion.
- **Model assertions (llm-judged)** — judgment calls go to the judge model with a written **rubric**, e.g. "both the scanning post and the minutes post are staffed in the trial team". After reading real evidence the judge returns one of three states: `pass`, `fail`, or `insufficient-evidence`.

Only `pass` counts toward green. Rule of thumb for writing rubrics: **anchor them to facts the evidence can carry** (name the posts, name the artifact) — vague "is it good?" rubrics get you insufficient-evidence.

### 4. Validate: let the gate find your mistakes

![Validation verdict: all passed; problems are named field by field (which segment, which item, why)](https://cms.finddatatech.cloud/uploads/blueprint_studio_03_validate_pass_da9765fdd6.png)

Press "Validate". The chain checks every segment: shape, data-source rules, cron syntax, the assertion closed set, judge-model availability — **each failure names its own field**. "Approve" only unlocks after a full pass, and editing any field invalidates the previous green and demands a re-validate.

### 5. Approve, then cast and publish

Approval is your signature as the blueprint owner — only the creator can approve. After that, "Cast & Publish" goes through the platform's existing release channel and produces a team pack in the marketplace carrying provenance: who approved, which version, whether it has been trial-proven. **The team is installable now** — but the report panel is still empty. Published is not proven.

### 6. Trial run: really build the posts, really fire the first round

![Trial report: green badge, verdicts per assertion, the judge's reasoning quoting the evidence, judge source and signature line](https://cms.finddatatech.cloud/uploads/blueprint_studio_05_trial_report_8fb75cf02c.png)

Press "Run trial" in the report panel (this button appears once the blueprint is cast). The platform **really creates the posts** in an isolated sandbox, **really fires the first round**, then checks each assertion: machines verify facts; the judge model reads the evidence and grades the rubric. Every badge on the report comes from a real execution — green is a ledger, not a color scheme.

### 7. Sign: the second key

After a fully green trial, "Sign report" appears below. The meaning: **the model's green is evidence; your signature is the final call.** Both keys must be on the table for the report to support a sellable state — a signature without a green verdict counts for nothing, and vice versa.

### 8. Re-cast: put the green report into the pack

With a **signed green report** in hand, the top green button turns into "Re-cast (refresh green report)". Press it once more and the report slot inside the published pack updates. **Paid team packs are gated on this report**: a paid pack without a green signed trial report is refused from sale. If the report is overwritten by a newer run, the old signature is void and the button dims — refresh the pack by signing again.

## What the judge actually looks at

Beyond the three states, the studio separates "the judging itself failed":

- **Model: green / red / insufficient evidence** — the judge really read the evidence; its reasoning quotes it.
- **Model: didn't run (lane unavailable)** — the judge was never reached (timeout, rate limit, upstream failure). This is **not** "it failed the assertion"; it is "no verdict at all", and the fix direction is opposite: the first means fix evidence or rubric, the second means **just re-run**. The notice bar, the audit record, and the report badge all say so explicitly.

![Honest layering: the assertion row shows 'didn't run (lane unavailable)' — an infrastructure failure is never disguised as a verdict](https://cms.finddatatech.cloud/uploads/blueprint_studio_06_lane_unavailable_e377f0d25f.png)

The audit record ships with every verdict: rubric, judge model, evidence digest, raw model output, conclusion and timestamp — archived with the report so you can always ask "who gave this green, and based on what".

## Self-check

- The blueprint's left-column badge reaches "Cast"; the report panel shows "Green"; the top button reads "Re-cast (refresh green report)".
- When validation says "all passed", the machine assertion rows in the report should all show "Pass" — the two cross-check each other.
- Deliberately tighten one rubric to demand a post that doesn't exist, re-run the trial: you should get insufficient-evidence or red, and green should drop — proof the gate is working.

## If it doesn't work

- **"Approve" is greyed out**: run validation first; any edit voids the previous green, so re-validate.
- **"Trial did not run" notice** (lane or sandbox failure): nothing is written to the ledger — simply run the trial again. If it persists, tell your platform admin the time window so they can check the model lane.
- **"Judge model not in roster"**: switch to "follow deployment default" or pick a listed model; the deployment default is configured by the platform admin.
- **409 on cast**: a pack with the same name already exists — publish a new version under it instead of creating a second pack.
- **Signature disappeared after a re-run**: by design. A signature binds to exactly one report.

## Next steps

- Read the Cockpit Walkthrough course to learn the dashboard behind a trial run.
- Install the Blueprint Architect pack to draft blueprints in natural language, then bring them back through validation and approval.
- Planning a paid team pack? Remember to re-cast the signed green report into the pack — that is the only thing the sellability gate accepts.
