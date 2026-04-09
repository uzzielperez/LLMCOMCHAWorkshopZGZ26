---
name: frontend-design
description: >-
  Creates distinctive, production-grade frontend interfaces and avoids generic
  AI aesthetics. Use when building or styling web UI, Reveal.js slides, HTML/CSS
  for presentations, dashboards, landing pages, or when the user asks to beautify,
  polish, or redesign slide decks, components, or layouts in this repository.
---

# Frontend design (distinctive UI)

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, interface, or **slide deck** to build or refine. They may include context about the purpose, audience, or technical constraints.

**For this repo:** When editing the Reveal.js workshop deck (`index.html`, `slides.md`, related CSS), treat slides as a UI surface—typography, color tokens, spacing, and motion should feel intentional and memorable, not template-default.

## Design thinking

Before coding, understand the context and commit to a **bold** aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this **unforgettable**? What is the one thing someone will remember?

**Critical:** Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work—the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend aesthetics guidelines

Focus on:

- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics—unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (`animation-delay`) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space **or** controlled density.
- **Backgrounds & visual details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

**Never** use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), clichéd color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. **Never** converge on common choices (Space Grotesk, for example) across generations.

**Important:** Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

## Slide decks (Reveal.js)

When applying this skill to presentation HTML/CSS:

- Prefer loading **distinctive** webfonts (e.g. via Google Fonts or self-hosted) in `index.html` and wiring them through CSS variables—do not rely on bland system stacks for headings.
- Use the deck’s existing variables (`--accent`, `--bg`, etc.) as a **system**: extend or refine them rather than sprinkling one-off colors.
- Enhance **section transitions**, **title slides**, and **data-dense slides** with purposeful contrast (size, weight, color)—not uniform small text.
- Keep performance sane: CSS animations and transforms over heavy JS; respect reduced-motion when adding motion.

Remember: aim for extraordinary creative work—commit fully to a distinctive vision rather than default patterns.
