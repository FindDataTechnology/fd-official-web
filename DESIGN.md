---
name: FindData Official Web
description: The Agent's Console — a calm night-shift control deck, opened up as the company front door.
colors:
  midnight-ink: "#0b1020"
  hushed-indigo: "#111730"
  console-indigo: "#161d3a"
  raised-indigo: "#1b2348"
  readout-void: "#0a0f1e"
  faint-horizon: "#25305a"
  strong-horizon: "#4a5ca8"
  moonlit-white: "#e6ebff"
  dim-signal: "#9aa6d0"
  terminal-mint: "#38e1c8"
  periwinkle-signal: "#6aa6ff"
  deep-teal-ink: "#06201b"
typography:
  display:
    fontFamily: "Space Grotesk, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(2.2rem, 5vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  display-sm:
    fontFamily: "Space Grotesk, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(1.7rem, 4vw, 2.2rem)"
    fontWeight: 700
    lineHeight: 1.25
  figure-lg:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "1.7rem"
    fontWeight: 600
    lineHeight: 1.1
  subtitle:
    fontFamily: "Space Grotesk, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.3
  subhead:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.35
  lead:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.6
  micro:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.78rem"
    fontWeight: 400
  nano:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.68rem"
    fontWeight: 400
  headline:
    fontFamily: "Space Grotesk, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Space Grotesk, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "1.45rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.95rem"
    fontWeight: 400
    letterSpacing: "1px"
  mono:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.85rem"
    fontWeight: 400
  mark:
    fontFamily: "'Songti SC', 'STSong', 'Noto Serif SC', 'SimSun', serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1
rounded:
  tick: "2px"
  micro: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  widget: "14px"
  stage: "16px"
  pill: "999px"
spacing:
  tick: "4px"
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "76px"
components:
  button-primary:
    backgroundColor: "{colors.terminal-mint}"
    textColor: "{colors.deep-teal-ink}"
    rounded: "{rounded.lg}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.terminal-mint}"
  button-secondary:
    backgroundColor: "{colors.midnight-ink}"
    textColor: "{colors.moonlit-white}"
    rounded: "{colors.strong-horizon}"
    padding: "12px 22px"
  card:
    backgroundColor: "{colors.console-indigo}"
    textColor: "{colors.moonlit-white}"
    rounded: "{rounded.xl}"
    padding: "16px 18px"
  card-feature:
    backgroundColor: "{colors.raised-indigo}"
    textColor: "{colors.moonlit-white}"
    rounded: "{rounded.xl}"
    padding: "26px 30px"
  line-tab:
    backgroundColor: "{colors.midnight-ink}"
    textColor: "{colors.dim-signal}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  line-tab-active:
    backgroundColor: "{colors.midnight-ink}"
    textColor: "{colors.terminal-mint}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  line-mark:
    backgroundColor: "{colors.midnight-ink}"
    textColor: "{colors.moonlit-white}"
    rounded: "{rounded.xl}"
    size: "44px"
  nav-link:
    textColor: "{colors.dim-signal}"
    padding: "0"
  nav-link-active:
    textColor: "{colors.terminal-mint}"
  input:
    backgroundColor: "{colors.readout-void}"
    textColor: "{colors.moonlit-white}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
---

# Design System: FindData Official Web

## Overview

**Creative North Star: "The Agent's Console"**

A calm night-shift control deck: the visitor sits at a dark instrument panel where
real data readouts glow in mint. The system was built as an operator's console for
AI-agent builders, then widened into the company front door — the console is still
the metaphor, but the first thing a visitor meets is the house, not one instrument.

Two forces shape every decision. **Readouts are honest:** every number on a surface
is a live or build-time measurement, and the type treatment says so — mono for
figures, labels, and machine names; sans for human prose. **Layer, don't decorate:**
the world is flat by doctrine (see Elevation & Depth); hierarchy comes from tonal
stepping, border states, and type scale — never from ornament.

The bilingual surface is a first-class citizen of the system, not a translation
afterthought: CJK headings run with more leading than Latin defaults, and the
display face carries Latin only, letting PingFang hold the Chinese.

**Key Characteristics:**
- Dark console palette with one glowing accent; the accent is rare and load-bearing.
- Mono for anything that is a readout (figures, ids, labels); sans for prose.
- Flat surfaces, tonal depth: three declared surface steps, no decorative shadow.
- State is communicated by border color and font weight, never by motion at rest.
- Bilingual by construction: EN default, 中文 prefixed, both designed, never one patched.

## Colors

A deep indigo night with a single mint signal; periwinkle survives only as the
inline-link voice.

### Primary
- **Terminal Mint** (#38e1c8): the one brand accent. Primary CTAs, quantitative
  figures, the active navigation item, the active line tab, featured-card names and
  borders. If a surface has more than one mint element competing for attention, the
  extra one is wrong.
- **Deep Teal Ink** (#06201b): the ink that sits ON mint fills (button labels,
  active pills). Never used as a surface.

### Secondary
- **Periwinkle Signal** (#6aa6ff): demoted to one job — inline links inside prose
  and mono metadata links. It never heads a section and never fills a control.

### Neutral
- **Midnight Ink** (#0b1020): page ground.
- **Hushed Indigo** (#111730): raised band, inset wells, ladder panel.
- **Console Indigo** (#161d3a): the standard card / panel surface.
- **Raised Indigo** (#1b2348): feature-grade surface, one tonal step above panel.
- **Readout Void** (#0a0f1e): carved wells — inputs, code blocks, terminal mock.
- **Faint Horizon** (#25305a): every panel edge at rest.
- **Strong Horizon** (#4a5ca8): hover and current-state borders, line-mark frames;
  kept ≥3:1 against Midnight Ink as a non-text UI value.
- **Moonlit White** (#e6ebff): headings and primary text. Section headings are
  near-white, not accent-colored.
- **Dim Signal** (#9aa6d0): secondary prose, metadata, resting nav labels.

### Named Rules
**The One Signal Rule.** Mint is the system's only emphasis color. Buttons, figures,
current state — pick by function, then accept that the rest of the screen stays
quiet. When two things are mint, one of them should not be.

**The Links-Only Rule.** Periwinkle appears only as inline links and mono link text.
Headings are Moonlit White; controls are mint.

## Typography

**Display Font:** Space Grotesk (self-hosted latin woff2, 22 KB), with system sans fallback
**Body Font:** system stack — -apple-system / PingFang SC / Microsoft YaHei
**Label/Mono Font:** ui-monospace / SF Mono / Menlo

**Character:** A geometric display face for Latin headings gives the console its
voice; the system sans keeps Chinese clean and neutral underneath it; mono carries
every readout. The three never trade places.

### Hierarchy
The declared ramp — every `font-size` in the codebase is one of these steps:

- **display** (700, clamp(2.2–3.4rem), 1.25): homepage hero only, `text-wrap: balance`.
- **display-sm** (700, clamp(1.7–2.2rem), 1.25): secondary heroes (`/demo` tour).
- **headline** (700, 2rem, 1.3): page titles (`h1.page`).
- **figure-lg** (600, 1.7rem, 1.1): the one big number in a readout (hero stats, chart holes).
- **title** (700, 1.45rem, 1.3): section headings (strips, docs `h2`). Near-white.
- **subtitle** (700, 1.3rem, 1.3): in-page headlines (release headlines, doc `h2`).
- **subhead** (700, 1.15rem, 1.35): card and phase names.
- **lead** (400, 1.05rem, 1.6): lead paragraphs and module descriptions.
- **body** (400, 1rem, 1.6): prose; measure capped ~68–72ch on marketing surfaces.
- **label** (400, 0.95rem, letter-spacing 1px, uppercase): the mono tagline voice; used sparingly.
- **mono** (400, 0.85rem): figures, metadata rows, stat lines, file ids.
- **micro** (400, 0.78rem): chips, badges, legend, dense meta rows.
- **nano** (400, 0.68rem): the smallest captions (chart ticks, inline tags).

### Named Rules
**The Declared-Step Rule.** A new `font-size` is added to this list or it does not ship —
near-duplicate sizes (0.9 vs 0.92 vs 0.95) are drift, not nuance.

### Named Rules
**The Latin-Only Display Rule.** Space Grotesk applies to headings and kickers; body
text never loads a webfont, and CJK glyphs inside headings fall through to the
system stack by design.

**The CJK-Air Rule.** Chinese headings keep line-height ≥1.25 — the Latin default
of 1.15 crowds CJK; do not lower it to "tighten" a headline.

## Layout

A single-column console at heart: content container 1080px, reading surfaces 820–860px,
page padding 20px, header 60px sticky with `backdrop-filter: blur(6px)`.
Vertical rhythm is three-stepped: hero block (64px top), section strips (76px
between), intra-group (16–24px). The spacing scale is 4/8-based (4 · 8 · 16 · 24 · 48 · 76).

Card grids are `repeat(auto-fill, minmax(300px, 1fr))` with 16px gaps; when a line
holds ≤2 entries the grid switches to a single full-width column so a thin line never
reads as an empty page. At ≤900px the header wraps instead of scrolling; at ≤640px
paddings compress and label type steps down 0.02–0.03rem.

## Elevation & Depth

Flat by doctrine. The system uses zero decorative box-shadows: depth is conveyed by
tonal layering (Midnight Ink ground → Hushed Indigo raised → Console Indigo panel →
Raised Indigo feature, with Readout Void carved below the page for wells), by 1px
Faint Horizon borders on every panel edge, and by state as a border-color shift
(Faint → Strong Horizon on hover, → Terminal Mint for current/featured). State
changes snap immediately — the console has no transitions at rest.

### Shadow Vocabulary
- **Stage drop** (`box-shadow: 14px 22px 44px -22px rgba(2, 6, 18, 0.85)`): the terminal mock on `/demo` only — a physical instrument photographed at night, not a UI surface.
- **Signal glow** (`box-shadow: 0 10px 26px -12px rgba(56, 225, 200, 0.5)`): the platform-tour CTA only — a mint halo at half alpha.

### Named Rules
**The Tonal-Step Rule.** If two adjacent surfaces need separation, step the surface
one token (ground → raised → panel → raised) before reaching for a border, and a
border before reaching for a shadow. A shadow at rest is always a bug.

**The Ghost-Card Ban.** Never pair a 1px border with a wide soft shadow on the same
surface; declare elevation once.

## Shapes

Rectilinear with a gentle scale: radii run 2px (ticks) · 4px (micro) · 6px (small
chips) · 8px (inputs, buttons) · 10px (secondary panels) · 12px (cards, the default
workhorse) · 14–16px (widgets, trial/stage panels) · 999px (pills: line tabs,
status chips). Cards stay in the 12–16px band; pills are reserved for small controls
and status. The one signature silhouette is the **line mark**: a 朱文-style square
frame (1.5px Strong Horizon border, 6–12px radius by size) holding a single ladder
character in Songti.

### Named Rules
**The Seal-Frame Rule.** The five line marks (壹 / 识 / 柏 / 谦 / 萬) share one frame
and one ink on the official site — the ladder is serialized here; each product line's
own site keeps its personal seal. Never tint a line mark with a line-specific color
on this surface (ADR-0003).

## Components

### Buttons
- **Shape:** gently rounded (10px), no border on primary.
- **Primary:** mint fill (Terminal Mint) with Deep Teal Ink text, 12px/22px padding, 600 weight; hover = brightness 1.08, no transition.
- **Secondary:** transparent ground with Faint Horizon border and Moonlit White text; hover shifts the border to Terminal Mint.
- **Text links in prose:** Periwinkle Signal, underline on hover only.

### Chips
- **Style:** pill (999px), 13px mono, 6px/14px padding, Faint Horizon border, Dim Signal text (line tabs, status pills, indicator badges).
- **State:** active = Terminal Mint text + mint border + 8%-alpha mint fill + 700 weight. Status semantics reuse the palette: in-progress = mint fill, planned = dashed muted outline, done = mint outline.

### Cards / Containers
- **Corner Style:** 12px standard, 16px for stage/trial panels.
- **Background:** Console Indigo standard; Raised Indigo for feature/featured; Hushed Indigo for inset blocks (ladder panel, dbstats).
- **Shadow Strategy:** none at rest (see Elevation & Depth).
- **Border:** 1px Faint Horizon; hover Strong Horizon; current/featured Terminal Mint.
- **Internal Padding:** 16–18px standard cards, 26–30px feature cards, 20–22px docs/widget panels.
- **Anatomy (repo/product card):** name (mono, Moonlit White; mint when featured) over description over a mono metadata row — each on its own line, never run together.

### Inputs / Fields
- **Style:** Readout Void ground, 1px Faint Horizon, 8px radius, 10px/12px padding.
- **Focus:** border shifts to Terminal Mint; a 2px mint focus-visible outline is drawn on all interactive elements.

### Navigation
- **Style:** six top-level entries (Products · Data · Repos · Docs · Updates · Demo)
  in 0.95rem sans, Dim Signal at rest, Moonlit White on hover, Terminal Mint for the
  current page (with `aria-current="page"`); brand wordmark uses `Find<em>Data</em>`
  with the em mint.
- **Sunk surfaces:** indicators / roadmap / releases live in a centered mono footer
  row, not the header.
- **Mobile:** the header wraps to multiple lines at ≤900px; labels are never clipped
  and the nav never scrolls horizontally.

### Line Mark (signature)
A 30 / 44 / 56px square frame (朱文 outline) holding one Songti character from the
ladder 壹 · 识 · 柏 · 谦 · 萬. Appears on the homepage line cards, repo line-group
headings, and the OG cards. Monochrome by rule; `role="img"` with the line name as
its label.

### Stat Line (signature)
Quantitative claims render as a single mono line (`452 indicator concepts ·
53 MCP tools · 12 open-source repos`) with mint figures — never as hero metric
cards. Every figure comes from a build-time export (content-integrity spec).

## Do's and Don'ts

### Do:
- **Do** keep mint on ≤10% of any screen and reserve it for function (CTA, figure, current state).
- **Do** separate surfaces by tonal step and border before ever considering a shadow.
- **Do** render every quantitative claim from build-time data; if no source exists, drop the number.
- **Do** keep 仓库 for code carriers and 产品 for capability units in Chinese copy.
- **Do** give CJK headings ≥1.25 line-height and let Latin headings use Space Grotesk.
- **Do** keep the site JavaScript-free for navigation, disclosure, and layout — CSS and native elements only.
- **Do** verify contrast: body text ≥4.5:1, large text and UI graphics ≥3:1 against their surface.

### Don't:
- **Don't** use a decorative box-shadow at rest (the two named shadows belong to `/demo`'s instrument panels).
- **Don't** pair a 1px border with a wide soft shadow on one surface (ghost card).
- **Don't** color section headings with an accent — headings are Moonlit White; periwinkle is links-only.
- **Don't** tint line marks per line on the official site, and don't give an unshipped product a card (constellation rule).
- **Don't** put body text in mono, or let mono drift beyond readouts, ids, and labels.
- **Don't** add a colored left/right bar >1px to cards or callouts as decoration.
- **Don't** translate filing numbers (粤ICP备2026118740号-1 / 粤公网安备44030002016558号) or replace them with badges.