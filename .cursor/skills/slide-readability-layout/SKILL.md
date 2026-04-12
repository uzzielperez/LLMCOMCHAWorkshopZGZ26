---
name: slide-readability-layout
description: >-
  Audits and fixes slide readability, typographic hierarchy, spacing, and text
  block placement using layout “math” (measure, scale, rhythm, contrast, safe
  area). Use when the user asks about readable slides, word walls, cramped text,
  alignment, whitespace, WCAG contrast, 16:9 layout, or polishing how words and
  blocks sit on screen in Reveal.js decks (slides.md + index.html CSS).
---

# Slide readability & layout (the “math”)

## Purpose

Make each slide **easy to read at a glance** and **visually balanced** at presentation resolution (this repo: think **1280×720** and laptop fullscreen). Use **repeatable rules** (measure, scale, rhythm, contrast, density)—not taste alone.

**Sibling skills:** **slide-narrative-flow** = story order and bridges. **frontend-design** = distinctive aesthetic direction. This skill = **legibility and placement discipline**; it can request small CSS/HTML edits even when the look stays “on brand.”

## When to apply

Triggers: readability, legible, too much text, wall of words, cramped, spacing, padding, alignment, hierarchy, font size, contrast, accessible, WCAG, “golden ratio” / grid / **math of layout**, slide density, bullets too long, overflow, 16:9 safe area.

---

## The math (use as checks, not superstition)

### 1. Measure (line length)

- **Body-ish lines** on slides: aim for roughly **~12–18 words per line** or **~45–65 characters** for comfort. Much longer → hard to scan; much shorter → choppy.
- **Narrow columns** (two-column slides): each column should still respect a similar cap; if not, increase `max-width`, bump font, or **split the slide**.

### 2. Type scale (hierarchy)

- **H2 title** should read clearly **from the back row**: typically **largest** type on the slide (except rare hero slides).
- **Body / bullets** = **clearly smaller** than the title—usually **~0.45–0.65×** the section’s base `font-size` in this deck’s CSS pattern (`em` on nested elements), not equal to the title.
- **Captions / hints / footnotes** = **one step smaller** again; same family or mono as the deck specifies.

If title and body **feel the same weight/size**, hierarchy is broken → adjust CSS or remove competing bold lines.

### 3. Vertical rhythm (spacing)

- Use **consistent spacing multiples** (e.g. **4/8px** at root, or **0.25em / 0.5em** steps) for: margin above lists, below titles, between paragraphs.
- **Related** items sit **tighter**; **unrelated** blocks need **more air** than a single blank line in markdown implies—often needs `margin` on wrappers (`<ul>`, `<div class="...">`).
- Avoid **orphan headings**: if `h2` is followed immediately by a dense wall, insert **structure** (short lead line, smaller set of bullets, or split slide).

### 4. Contrast (WCAG-minded)

- **Normal text** vs background: target **≥ 4.5:1** (AA). **Large text** (roughly ≥24px equivalent): **≥ 3:1**.
- **Muted** (`--muted`, dim gray-blue) is for **secondary** copy only; do not use it for **main** claims learners must read.
- **Accent** on **large** words OK; accent-on-accent (low contrast between two bright colors) fails fast—keep one dominant text color per slide.

### 5. Density & chunking

Heuristics for **live talks** (tighten further for posters):

| Signal | Rule of thumb |
|--------|----------------|
| Bullets | **≤ 5–6** per slide; **≤ 2 lines** each when possible |
| Idea | **One focal claim** per slide; supporting bullets **prove** that claim |
| Paragraphs | Prefer **1 short** paragraph + list over **2 long** paragraphs |
| Links / code | **One primary** call-to-action or code block focal; side notes smaller |

If markdown stacks many `##` levels or giant lists, **split slides** or move detail to speaker notes / handout (if the project supports notes).

### 6. Safe area & alignment (16:9)

- Keep critical text inside an imaginary **margin** (~**4–6%** inset from each edge) so projectors do not clip.
- **Avoid edge-hugging** long URLs or code unless they wrap inside a padded `pre`.
- **Consistent alignment**: pick **left** or **center** per *section type*; do not alternate randomly slide-to-slide in the same act.

### 7. Motion & reveals (Reveal.js)

- **Fragments** (`-->`) on **every** bullet can feel sluggish; use for **builds** that teach sequence, not decoration.
- If text **animates in** too small or too fast, prefer **static** legibility over flair.

---

## Workflow for the agent

1. **Viewport check** — Assume **1280×720** (and one wider laptop width). Identify slides with known dense classes (`viz-slide`, long `ul`, small `em` body).
2. **Scan `slides.md`** — Flag slides with: long bullets, many nested lists, tiny `code` spans in paragraphs, multiple competing `h2`-sized lines, raw URLs without break opportunities.
3. **Scan `index.html` CSS** — For those slide classes, check `font-size`, `line-height` (often **1.35–1.55** for body), `max-width`, `padding`, `letter-spacing` on headings, `color`/`opacity` on secondary text.
4. **Diagnose** — Map issues to the **math** rows above (measure, scale, rhythm, contrast, density, safe area).
5. **Fix** — Prefer:
   - **CSS** adjustments affecting a **class** (whole section type) over one-off inline styles.
   - **Content** edits: shorter bullets, split slide, lead sentence, `word-break` on long URLs in markup if needed.
6. **Verify** — After edits: no overlap with fixed UI chrome; headings still larger than body; contrast not worse.

---

## Output format

**Audit-only:**

```markdown
## Readability verdict
[2–3 sentences]

## Checks (pass / warn / fail)
- Measure / scale / rhythm / contrast / density / safe area — bullet each

## Slide hotspots
- **[id or title]** — issue + rule violated + suggested fix

## Suggested changes
[Ordered: CSS selectors / slide splits / copy trims]
```

**When improving:** implement CSS (`index.html`) and/or `slides.md` edits; end with **Files touched** and a short **before/after** note for the worst 2–3 slides.

---

## Boundaries

- Do **not** rewrite technical content for “pretty” if it changes meaning; shorten or **re-wrap** only.
- Do **not** fight **frontend-design** direction: if the deck is intentionally dense or maximal, **surface the tradeoff** (readable vs aesthetic) and offer **scoped** relief (spacing, contrast), not a full redesign unless asked.
- **slide-narrative-flow** owns reordering for story; this skill may **split** a slide for density even if order stays the same—note if that affects narrative and suggest narrative review if needed.

---

## Quick self-check

- [ ] At least one **numeric** rationale cited (e.g. bullet count, contrast concern, max-width, scale step).
- [ ] Fixes favor **systematic** CSS over scattered inline styles unless the deck already relies on them.
- [ ] 1280×720 **safe area** considered for dense or full-bleed layouts.
