# Frontend Image Direction Skill

## What This File Is For

Before writing code for a landing page, marketing site or any multi-section layout, use this workflow to generate one horizontal reference image per section. These images are visual blueprints showing layout, typography scale, spacing, component style and colour palette. A developer or coding agent looks at the images and builds from them.

This is NOT an asset creation workflow. It does not produce images you embed into the page (see FRONTEND_SKILL.md Step 12 for that). It produces design reference comps used to communicate what the finished sections should look like before any code is written.

---

## Relationship to FRONTEND_SKILL.md

| Step 12 (FRONTEND_SKILL.md) | This file (IMAGEGEN_SKILL.md) |
|---|---|
| Generates video or image assets embedded *inside* a section | Generates blueprint images of the *entire section layout* |
| Output: MP4 or JPEG that lives in the HTML | Output: Reference comps reviewed before coding begins |
| Answers: "What visual asset goes in the background?" | Answers: "How should this section be laid out?" |
| Triggered when a hero needs a cinematic background | Triggered at the start of any multi-section build |

Use both on the same project. Generate section blueprints first (this file), then produce the video or hero asset (Step 12) to embed into the hero blueprint.

---

## Hard Output Rule

Generate one separate horizontal image per section. No exceptions.

| Request | Images to generate |
|---|---|
| "hero" | 1 |
| "landing page" (no count specified) | 6 |
| "full website" or "full website template" | 8 |
| "marketing site" | 8 |
| "product page" | 6 |
| "portfolio" | 6 |
| Explicit section count given | That exact number |

Never combine multiple sections into one tall image. Never return a single image for the whole page. Never skip sections and return one "best" image. If only one image can be rendered per call, generate them sequentially in the same response, labelled "Section 1 of 6: Hero", "Section 2 of 6: Trust bar" and so on until the full set is delivered.

Each image must be horizontal (16:9 is the default). Hero images may use 21:9 for a wider cinematic feel. Narrower content sections may use 16:10.

---

## Continuity Rule

All section images from the same project must read as one coherent site. Enforce these across every image in the set:

- Same colour palette and accent logic
- Same typeface family and scale hierarchy
- Same CTA visual style (variations in size or weight are fine but the family stays the same)
- Same border-radius language (either sharp, rounded or squircle — pick one, hold it)
- Same image treatment (colour grade, contrast, framing style)
- Same tonal voice in any visible copy

A viewer scrolling through all images must read them as one product, not a collage of different styles.

---

## Hero Composition Bias

The left-text / right-image hero is the most overused AI pattern. It is allowed but it must not be the default starting point. Before using it, consider these alternatives and pick the one that best fits the brand:

- Centred statement over full-bleed image (text in lower 40% of frame)
- Bottom-left text over background image
- Bottom-right text over background image
- Top-left lead, supporting content bottom-right
- Stacked centre (label, headline, sub-copy and CTA all centred with generous negative space)
- Image-as-canvas with text overlaid in a clean safe area
- Right-text / left-image (inverted classic)
- Off-grid editorial offset (asymmetric pull)
- Mini minimalist (tiny wordmark, short statement, thin CTA, mostly negative space)

Use left-text / right-image only when it is genuinely the strongest choice for the project. Run a quick pre-output check: "Am I picking this out of habit?" If yes, pick a different anchor.

---

## Absolute Hero Rules

- The hero must feel like a strong opening scene
- Keep the hero composition clean and uncluttered
- Do not fill the first viewport with pills, fake stats, badges, logo strips and small details
- The main headline reads as a short, powerful statement (5-10 words is ideal)
- Supporting text is concise and does not wrap beyond 2-3 lines
- Prioritise negative space and contrast over density
- Typography: prefer medium or light weight with tight tracking and strong scale contrast over extra-bold shouting
- Do not use gradient text on the H1 as a lazy premium shortcut
- Do not use giant meaningless outline numbers, cheap SVG filler graphics or random floating orbs as graphic elements

---

## Section Composition Anchors

Each section picks one anchor. Across the full set of images, at least 3 different anchors must appear. Never use the same anchor twice in a row.

| Anchor | Description |
|---|---|
| Centred statement | All content centred, generous space around it |
| Top-left lead, bottom-right support | Heading top-left, secondary content / CTA bottom-right |
| Bottom-left text over background | Text low and left, image fills the whole section |
| Bottom-right CTA cluster | Visual leads left, actions cluster bottom-right |
| Left-third caption / right-two-thirds visual | Classic — use sparingly, never twice in a row |
| Right-third caption / left-two-thirds visual | Inverted classic |
| Centred low | Text in the lower 40% of the section over a full image |
| Off-grid editorial offset | Asymmetric pull with clear reading hierarchy |
| Stacked centre | Label, headline, sub, CTA stacked vertically, ultra-minimal |
| Image-as-canvas with text safe area | Text in a high-contrast zone over a full-bleed image |

---

## Background Modes

Pick one per section. Vary across the full set so the page does not feel like a single texture repeated.

| Mode | When to use |
|---|---|
| Solid surface with inline asset | Clean product-focused sections |
| Subtle grid or dot field | Technical / SaaS feel |
| Full-bleed image with tonal overlay | Hero, cinematic CTA, testimonials |
| Editorial side-image (50/50, 60/40, 40/60) | Feature showcases, about sections |
| Image as entire visual with text in safe area | High-impact hero, full-width feature |
| Flat colour block with small accent crop | Clean brand moments, minimal sections |
| Cinematic tonal gradient (palette-matched, low chroma) | Footer CTA, atmospheric transitions |
| Micro-noise gradient over solid | Premium tactile sections, pricing |
| Colour-blocked diptych (two flat fields meeting) | Bold modernist feature sections |
| Soft radial vignette with product crop | Luxury, editorial feel |

---

## Section Size Rhythm

Across the set, mix section ambition deliberately. Do not make every section the same height or density.

- Some sections are large, art-directed and content-rich
- Some are mini — mostly negative space with a single statement or metric
- Some are medium editorial blocks with balanced content

This rhythm creates a premium scrollscape, not uniform slabs.

---

## What Every Section Image Must Communicate

A developer or coding agent must be able to look at the image and understand:

- Layout structure and grid system
- Section hierarchy (what is primary, secondary, tertiary)
- Spacing and padding scale
- Typography sizes and weight hierarchy
- CTA position and style
- Component styling (card shape, button style, badge design)
- Image treatment and framing
- Overall colour usage

Do not produce vague mood art. The image must be implementation-friendly.

---

## CTA Variation

Do not default to a pill-shaped primary button in every section. Vary CTA treatment across the page:

| Style | When to use |
|---|---|
| Classic primary pill | Primary action, hero |
| Outline / ghost button | Secondary action, lighter sections |
| Underlined inline link with arrow | In-body CTAs, testimonial sections |
| Banner-style full-width CTA | Final CTA section |
| Oversized headline with tiny CTA hint | Confidence plays, portfolio |
| CTA as caption under a strong visual | Image-led sections |

The primary page action must always be the most visually dominant CTA. Other CTAs are clearly subordinate.

---

## Theme Paradigms (Pick One Per Project)

Commit to one and hold it across every section image.

| Paradigm | Character |
|---|---|
| Pristine Light Mode | Off-white or cream tones, sharp dark text, editorial confidence |
| Deep Dark Mode | Charcoal or graphite, elegant glow used sparingly |
| Bold Studio Solid | Strong controlled colour fields (oxblood, royal blue, forest, vermilion) with crisp contrasting UI |
| Quiet Premium Neutral | Bone, sand, taupe, stone, muted contrast, restrained luxury |
| Cold Ops | Near-black with cold blue-green accent, industrial utilitarian, monospace type on data |

---

## Typography Direction

Pick one per project and hold it:

| Direction | Character |
|---|---|
| Clean Grotesk | Satoshi-like, geometric, neutral, modern |
| Refined Grotesk | Neue-Montreal-like, slightly editorial, sophisticated |
| Expressive Display | Cabinet / Clash-like, strong personality, bold headings |
| Compressed Statement | Monument-like, powerful vertical rhythm |
| Editorial Serif + Sans | High-contrast heading serif paired with clean body sans |
| Swiss Rational | Strong hierarchy, mathematical spacing, rational structure |

Never default to generic web typography energy. Avoid Inter as a display font.

---

## Creativity Escalation Rule

The output must show real creative ambition. Do not settle for the first obvious layout solution. Before generating, actively push in at least 3 of these directions:

- Stronger composition
- More distinctive typography
- More confident scale contrast
- More memorable hero concept
- More interesting image treatment
- More expressive section rhythm
- More original framing or cropping
- More art-directed visual tension
- More surprising but clear layout structure

Creativity must feel intentional, not chaotic. Make bold but controlled decisions. Make the page feel designed, not auto-generated.

---

## What Not To Generate

These are the default AI patterns to actively avoid:

- Centred dark hero with a purple or blue glow and meaningless floating shapes
- Generic dashboard card spam with no breathing room
- Weak typography hierarchy (everything at similar size)
- Cloned sections (same layout repeated with different copy)
- Text-heavy layouts with not enough imagery
- Overly dense sections with no breathing room
- Random outer neon glows on buttons or cards
- Generic placeholder content (John Doe, Acme Inc, 99.9%, Lorem ipsum)
- Six-word startup slogans: "Elevate. Seamless. Unleash. Next-Gen."

---

## Pre-Generation Checklist

Before generating any section image, confirm:

- [ ] One theme paradigm selected and held across the set
- [ ] One typography direction selected and held across the set
- [ ] Hero composition chosen from the alternatives list (not defaulting to left-text / right-image without justification)
- [ ] Section count matches the request defaults or explicit count
- [ ] Each section has a different composition anchor (no two identical in a row)
- [ ] Background modes vary across the set
- [ ] Every image communicates layout, hierarchy, spacing, typography scale, CTA position and component style clearly enough that a developer can build from it
- [ ] No placeholder names, fake stats or generic brand names in any visible copy
- [ ] No pure black backgrounds (use off-black)
- [ ] No gradient text on large headings as a substitute for real hierarchy
