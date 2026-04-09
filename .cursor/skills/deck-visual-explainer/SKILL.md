---
name: deck-visual-explainer
description: >-
  Builds rich, interactive, animated HTML artifacts that turn dense slide or
  lecture content into visual explainers with minimal copy. Use when the user asks
  for interactive explainers, animated companions to a deck, “visual summaries,”
  explorable concepts, micro-sites from slides, or wants to cut wordiness while
  teaching the same ideas in this workshop repo or similar presentation projects.
---

# Deck visual explainer (interactive HTML artifacts)

## Purpose

Turn **long-form slide or outline text** into a **separate, self-contained HTML experience** that **teaches the same concepts** through **motion, layout, and interaction** — not through paragraphs. The artifact is **not** a second copy of the deck; it is a **compression layer**: fewer words, more structure, feedback, and animation.

## When to use this skill

Apply when the user (or task) mentions any of:

- Interactive explainer, animated explainer, visual explainer, “companion” to slides
- Reducing wordiness, “show don’t tell,” explorable concepts
- HTML artifact, micro-site, interactive diagram, scrollytelling, step-through UI
- Turning `slides.md` (or a section) into something **hands-on** for learners

Do **not** use this skill for: editing Reveal.js theme CSS only, PDF export, or pure prose summaries without an interactive deliverable.

## Design principles

1. **Words are scarce** — Default budget: short labels, one-line prompts, tooltips for detail. Move definitions into **hover**, **click-to-expand**, or **step captions** (one sentence per step).
2. **One idea per view** — Each screen or step shows a single concept or comparison. Avoid dense bullet walls.
3. **Interaction is the explanation** — Sliders, toggles, draggable handles, clicking regions, or sequenced “next” steps beat static text.
4. **Animation carries meaning** — Use motion to show **causality** (e.g. token flows into model, attention weights lighting up), **state change**, or **before/after**. Prefer CSS transforms/opacity; add JS when state is non-trivial.
5. **Faithful to the source** — Do not invent technical claims. If the deck says “illustrative,” the artifact must say the same. Link or reference slide numbers/section titles when helpful.

## Output shape (pick one per task)

The agent should choose the smallest form that meets the goal:

| Form | Best for |
|------|----------|
| **Single-file HTML** (`artifact.html`) | Shareable, no build step; embed CSS/JS inline or `<style>`/`<script>` |
| **Small folder** (`explainer/index.html` + `explainer/explainer.js` + optional `explainer.css`) | Clearer structure, easier to test |
| **Canvas inside the repo** | If the user already uses Cursor Canvas for dashboards — only when the skill `canvas` applies |

Default for this workshop: **single file or `artifacts/<topic>/`** next to `index.html`, loaded via local server.

## Implementation constraints

- **No framework required** — Vanilla HTML/CSS/JS is preferred unless the user already uses React/Vite in the project.
- **Accessible basics** — Visible focus states, `prefers-reduced-motion` respected (offer non-animated path or simplify motion).
- **Performance** — Avoid huge assets; prefer SVG/CSS; lazy-init heavy demos.
- **Aesthetic** — Follow the project’s **frontend-design** skill when styling: distinctive typography, cohesive palette, avoid generic “AI slop” UI.

## Suggested patterns (examples)

- **Stepper / reveal:** “Next” advances through 4–8 panels; each panel one diagram + one caption.
- **Comparison:** Two columns with synced controls (e.g. bigram vs transformer) or a single toggle.
- **Scrubber:** Slider drives a single illustration (temperature, context length, number of heads).
- **Mini-simulation:** Fake logits → softmax bars updating live from a slider (clearly labeled illustrative).

## Workflow for the agent

1. **Identify scope** — Which section of `slides.md` (or user-provided outline) becomes the explainer? One PART or one theme per artifact.
2. **Extract claims** — List only the ideas that must appear; strip adjectives and repeated motivation.
3. **Design the interaction map** — For each idea: default control, visual, one caption.
4. **Build** — HTML shell, CSS layout, JS state. No build step unless requested.
5. **Smoke test** — Open via local HTTP; fix layout at 1280×720 and a laptop width.
6. **Point back** — Tell the user the file path and how it relates to the deck (e.g. “Covers PART 1 § Attention slides”).

## Relationship to other assets

- **`slides.md` / `index.html`** — Source of truth for *content*; the explainer *compresses* it.
- **`slides-viz.js`** — Reuse patterns (e.g. bar charts, SVG helpers) only by copying/adapting small utilities; do not break the deck’s Reveal integration.
- **`frontend-design` skill** — Use for visual quality of the artifact.

## Anti-patterns

- Long scroll of text with occasional diagrams (that is still a document, not this skill).
- Lorem ipsum or placeholder concepts where the deck has real definitions.
- Animations with no pedagogical role (decorative-only motion should be minimal).

Remember: the goal is a **memorable, explorable object** that makes the deck feel *lighter* when learners open it side-by-side with the slides.
