---
name: slide-narrative-flow
description: >-
  Judges and improves narrative flow for slide decks: arc, ordering, bridges,
  pacing, and segues. Use when the user wants a flow audit, critique, reorder,
  smoother transitions, or direct edits to slides.md / Reveal markdown; includes
  safe-edit rules for slide ids, internal jumps, and interactive slide classes
  wired in slides-viz.js.
---

# Slide narrative flow (judge + improve)

## Purpose

1. **Judge** whether a deck reads as one story: motivation → concepts → depth → payoff, with rhythm and clear handoffs.
2. **Improve** that story by **reordering slides**, **adding bridges**, **tightening redundant beats**, and **fixing broken promises** — implementing edits in the source (usually `slides.md`) when the user wants changes, not only advice.

This is **sequence and rhetoric**, not typography or theme. Visual polish stays with **deck-visual-explainer** / **frontend-design** unless a viz lands before its definition.

## When to apply

Triggers: narrative flow, story arc, slide order, pacing, transitions, segues, bridges, “smooth out,” “reorder,” “does this deck make sense,” workshop structure, critique **or** **improve** `slides.md`.

| User intent | Action |
|-------------|--------|
| Audit / review / feedback only | Diagnose + structured report; **no** file edits unless they ask to apply. |
| Improve / fix / reorder / rewrite flow | Diagnose + **implement** agreed edits in `slides.md` (and jump targets / `index.html` only if flow requires it). |

If unclear, ask once: **“Report only, or should I edit `slides.md`?”** Default to **edit** when they say “improve the narrative flow.”

---

## Phase A — Read the spine

Build an ordered list from the source:

- Titles: `##` / `#` headings per slide.
- Metadata: `<!-- .slide: id="..." class="..." -->` — **preserve verbatim** when moving slides.
- Badges: `deck-badge` text (section labels).
- **Jumps**: every `data-deck-jump="..."` and `data-arc-jump="..."` → must resolve to an existing slide `id`.
- **Implicit promises** — early “we will / next we” vs later payoff.
- **Interactive slides**: sections whose `class` includes `*-interactive-slide` or `viz-slide` are wired in `slides-viz.js` via **class names**, not ids. **Do not strip or rename those classes** when improving flow; only move the whole slide block.

---

## Phase B — Judge (dimensions)

| Dimension | Question |
|-----------|----------|
| **Arc** | Single through-line (question → tools → resolution)? |
| **Prerequisites** | Does each hard slide assume terms already introduced? |
| **Pacing** | Dense runs broken by recap, example, or lighter slide? |
| **Redundancy** | Repeat definitions without payoff; contradictions? |
| **Transitions** | Section boundaries explain *why* we move, not only *what* is next? |
| **Motivation** | “Why care” before heavy math/code? |
| **Payoff** | Hands-on / summary after the ideas they depend on? |
| **Ending** | Close ties to opening question or deliberate open thread? |

**Heuristics:** rule of three (motivate → define → apply); **one new abstraction per slide**; **recap as glue** after dense runs; **hands-on after stable models**; recurring metaphor (pills, film, pipeline) must not fight technical order.

---

## Phase C — Report (required before or with edits)

Use this structure (shorten only if the user asks for terseness):

```markdown
## Narrative flow verdict
[2–4 sentences]

## Flow map (compressed)
[Ordered: section → one line on link to neighbors]

## Friction points
- **Major** — [cite slide title + `id`]
- **Minor** — [...]

## Planned changes
1. [e.g. Move block `id="..."` after `id="..."`]
2. [e.g. Add bridge slide between X and Y]
3. [...]

## Optional re-order sketch
[High-level only if helpful]
```

If **improving**, the **Planned changes** section doubles as the edit checklist; after editing, add:

```markdown
## Done
- [x] ...
Files touched: `slides.md` (…)
```

---

## Phase D — Improve (edit the deck)

### D1. Reorder slides

- Cut/paste whole slides: from `---` separator through the content **up to but not including** the next `---` (the next slide starts after `---`).
- Keep the **entire** `<!-- .slide: ... -->` line attached to its slide body.
- **Never duplicate** an `id=` across slides; ids must stay unique.
- After any reorder: **`rg 'data-deck-jump=' slides.md`** and **`rg 'data-arc-jump=' slides.md`** — every target must still exist as a slide `id`. Update buttons/links if targets moved or were renamed.

### D2. Add bridges (lightweight)

Prefer **one short slide** or **2–3 lines** at the top of the next section over long prose.

**Default (minimal, no new CSS)** — new `id` must be unique:

```markdown
---

<!-- .slide: id="arc-bridge-SECTION" class="ref-slide" -->
<div class="deck-badge">Bridge</div>

## From **[previous idea]** → **[next idea]**

<p>One or two sentences: why this order, and what question the next block answers.</p>
```

**This repo’s styled journey bridge** — `deck-bridge-slide` in `index.html` expects the **engine-journey** layout (see `arc-transformer` in `slides.md`). Reuse that full pattern only when a journey graphic fits; otherwise prefer the minimal block above or an `outlook-slide` + `outlook-lead` if you need the same typography as other outlook segues.

### D3. Tighten without breaking viz

- **Cut** duplicate bullets if the same definition appears twice with no new angle.
- **Split** a slide only when it clearly violates “one new abstraction” and splitting does not orphan interactive markup (each half needs its own `<!-- .slide: -->` and complete inner HTML).
- **Do not** move interactive demos **earlier** without checking prerequisites on prior slides; prefer moving **explanation earlier** or **demo later**.

### D4. Fix promises

- Either add a later slide that pays off an early promise, or **soften/remove** the promise on the early slide.
- Align `deck-inline-jump` / recap links so “optional jumps” still make sense after reorder.

### D5. Verify after edits

- [ ] All `id=` unique; all `data-deck-jump` / `data-arc-jump` targets exist.
- [ ] `<!-- .slide: ... class="..." -->` on interactive slides unchanged unless intentionally duplicating a **non-interactive** template.
- [ ] Opening and closing slides still match the workshop framing (title, hands-on, Q&A).
- [ ] Run a quick **`rg` on removed ids** in `slides.md` and `index.html` so nothing points to deleted slides.

---

## Boundaries

- **Scope**: Prefer `slides.md`-only edits. Touch `index.html` / `slides-viz.js` only when fixing broken jumps or when flow work **requires** a new class hook (rare).
- **Volume**: Do not rewrite the whole deck unless the user asks. Ship the **smallest** reorder + bridge set that fixes the major frictions.
- **Content accuracy**: Do not invent technical claims to “smooth” flow; bridges are about **ordering and motivation**, not new facts.

---

## Quick self-check

**After judge-only response**

- [ ] Verdict states arc coherence for the audience.
- [ ] Major friction identified or explicitly “none.”
- [ ] Suggested moves are concrete (reorder / bridge / cut).

**After improve pass**

- [ ] Report includes **Planned changes** and **Done** with files touched.
- [ ] Jump targets and slide `id`s verified.
- [ ] Interactive slide classes preserved on moved blocks.
