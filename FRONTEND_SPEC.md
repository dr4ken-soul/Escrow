# Escrow Frontend Spec

Every design decision here follows the approved gates.

## Confirmed Gates

- Gate 1 aesthetic: Bento grid operational.
- Gate 2 navigation: A2 scroll-morph pill on landing, fixed sidebar for app interior.
- Gate 3 background: premium static hero image on landing, static but atmospheric app interior.
- Gate 4 fonts: Instrument Serif for display, Manrope for body, IBM Plex Mono for data.
- Gate 5 palette: Escrow Slate.
- Gate 6 hero: operational hero with dashboard mockup and premium static image.
- Gate 7 sections: hero, problem, flow, payout modes, proof page, Monad fit, final CTA.

## Global Design System

### Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
```

```css
:root {
  --font-display: 'Instrument Serif', serif;
  --font-body: 'Manrope', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}
```

### Palette: Escrow Slate

```css
:root {
  --bg-primary: #090b0d;
  --bg-secondary: #101316;
  --bg-surface: #15191d;
  --bg-elevated: #1d2328;

  --accent: #d6a354;
  --accent-hover: #efbd6f;
  --accent-glow: rgba(214, 163, 84, 0.16);

  --verified: #49c184;
  --verified-glow: rgba(73, 193, 132, 0.16);
  --pending: #d6a354;
  --rejected: #e05f5f;

  --text-primary: #f2f0ea;
  --text-secondary: #a8b0b8;
  --text-muted: #67717b;

  --border-subtle: rgba(242, 240, 234, 0.06);
  --border-default: rgba(242, 240, 234, 0.11);

  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-tooltip: 600;
}
```

### Global CSS Rules

```css
html {
  scroll-behavior: smooth;
  scrollbar-width: none;
  background: var(--bg-primary);
  color: var(--text-primary);
}

html::-webkit-scrollbar {
  display: none;
}

body {
  min-height: 100dvh;
  background: var(--bg-primary);
  font-family: var(--font-body);
}

.noise-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.38'/%3E%3C/svg%3E");
  background-size: 180px 180px;
}
```

## Animation Rules

Use `motion/react`, not `framer-motion`.

Standard entrance:

```ts
initial: { filter: 'blur(10px)', opacity: 0, y: 18 }
animate: { filter: 'blur(0px)', opacity: 1, y: 0 }
transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] }
```

Scroll-triggered reveals must replay:

```tsx
viewport={{ once: false, amount: 0.1 }}
```

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Landing Navigation

Recipe reference: A2 scroll-morph pill from `FRONTEND_SKILL.md`.

### Initial Nav State

Element: `header`

Classes:

```txt
fixed top-0 left-0 right-0 z-[var(--z-sticky)] px-4 md:px-8 lg:px-10 pt-4 pointer-events-none
```

Inner bar classes:

```txt
pointer-events-auto mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--bg-primary)]/35 px-3 py-3 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-4
```

Brand text:

```txt
font-display text-[1.45rem] italic leading-none tracking-normal text-[var(--text-primary)]
```

Centre links:

```txt
hidden items-center gap-1 md:flex
```

Each link:

```txt
rounded-[0.5rem] px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
```

CTA button:

```txt
group ml-auto inline-flex min-h-11 items-center gap-3 rounded-full bg-[var(--accent)] px-4 py-2 font-body text-sm font-semibold text-[var(--bg-primary)] transition-colors duration-200 hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
```

CTA icon wrapper:

```txt
flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-primary)]/10 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-px
```

### Scrolled Pill State

Apply after `scrollY > 80`.

Inner bar classes changed to:

```txt
pointer-events-auto mx-auto grid max-w-[680px] grid-cols-[auto_1fr_auto] items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/72 px-2 py-2 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
```

Z-index stack:

```txt
z-0: page content
z-[var(--z-sticky)]: fixed navigation
z-[var(--z-modal)]: wallet modal
z-[var(--z-toast)]: transaction toasts
```

## Section 1: Hero

Recipe reference: `product-mockup-hero`, customised for Bento grid operational.

Layout:

```txt
relative min-h-[100dvh] overflow-hidden bg-[var(--bg-primary)] px-4 pb-12 pt-28 md:px-8 lg:px-10 lg:pb-16 lg:pt-32
```

Background image layer:

```txt
absolute inset-0 z-0 overflow-hidden
```

Image classes:

```txt
h-full w-full object-cover opacity-46 saturate-[0.72] contrast-[1.08]
```

Gradient overlay:

```txt
absolute inset-0 z-[1] bg-[radial-gradient(circle_at_70%_28%,rgba(214,163,84,0.14),transparent_32%),linear-gradient(90deg,var(--bg-primary)_0%,rgba(9,11,13,0.82)_38%,rgba(9,11,13,0.62)_100%)]
```

Noise overlay:

```txt
noise-overlay absolute inset-0 z-[2] opacity-[0.18] pointer-events-none
```

Content grid:

```txt
relative z-10 mx-auto grid min-h-[calc(100dvh-9rem)] max-w-7xl grid-cols-1 content-end gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end
```

Left content:

```txt
max-w-3xl pb-2 md:pb-8 lg:pb-12
```

Status eyebrow:

```txt
mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/55 px-3 py-2 backdrop-blur-xl
```

Eyebrow dot:

```txt
h-2 w-2 rounded-full bg-[var(--verified)] shadow-[0_0_18px_var(--verified-glow)]
```

Eyebrow text:

```txt
font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-secondary)]
```

Headline:

```txt
max-w-[11ch] font-display text-[clamp(4rem,10vw,8.75rem)] italic leading-[0.82] tracking-normal text-[var(--text-primary)] text-balance
```

Subheading:

```txt
mt-6 max-w-[42rem] font-body text-base leading-7 text-[var(--text-secondary)] md:text-lg md:leading-8
```

CTA row:

```txt
mt-8 flex flex-col gap-3 sm:flex-row sm:items-center
```

Primary CTA `Create campaign`:

```txt
group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[var(--accent)] px-5 py-3 font-body text-sm font-semibold text-[var(--bg-primary)] transition-colors duration-200 hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
```

Secondary CTA `Find campaigns`:

```txt
inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)]/45 px-5 py-3 font-body text-sm font-semibold text-[var(--text-primary)] transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
```

Dashboard mockup shell:

```txt
relative rounded-[1.75rem] border border-[var(--border-default)] bg-[var(--bg-secondary)]/78 p-2 shadow-[0_28px_80px_rgba(214,163,84,0.08)] backdrop-blur-xl
```

Dashboard inner:

```txt
rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--bg-primary)]/82 p-4 md:p-5
```

Mockup grid:

```txt
grid grid-cols-1 gap-px overflow-hidden rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--border-subtle)] md:grid-cols-6
```

Budget module:

```txt
relative bg-[var(--bg-surface)] p-5 md:col-span-4 md:min-h-[220px]
```

Budget label:

```txt
font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--text-muted)]
```

Budget value:

```txt
mt-5 font-mono text-4xl font-semibold leading-none text-[var(--text-primary)] md:text-5xl
```

Slot module:

```txt
bg-[var(--bg-surface)] p-5 md:col-span-2
```

Proof queue module:

```txt
bg-[var(--bg-surface)] p-5 md:col-span-3
```

Payout module:

```txt
bg-[var(--bg-surface)] p-5 md:col-span-3
```

Timeline row:

```txt
flex items-center justify-between border-t border-[var(--border-subtle)] py-3 first:border-t-0
```

Timeline label:

```txt
font-body text-sm text-[var(--text-secondary)]
```

Timeline status:

```txt
rounded-full border border-[var(--border-subtle)] px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--accent)]
```

Entrance animation:

```txt
eyebrow delay 0.20s
headline delay 0.32s
subheading delay 0.48s
CTA row delay 0.64s
mockup delay 0.76s, initial { filter: 'blur(12px)', opacity: 0, y: 28, scale: 0.97 }, animate { filter: 'blur(0px)', opacity: 1, y: 0, scale: 1 }, duration 0.84s, ease [0.16,1,0.3,1]
```

Z-index stack:

```txt
z-0: static hero image
z-[1]: gradient overlay
z-[2]: noise overlay
z-10: hero content and mockup
z-[var(--z-sticky)]: navigation
```

Asset brief:

```txt
Type: premium static hero image
Description: cinematic dark operational escrow scene, abstract locked campaign budget ledger, thin copper status lines, green verified markers, wallet proof trails, no logos, no brand symbols, no readable fake company names
Mood: trustworthy, precise, onchain operations, premium but restrained
Palette: near-black slate, muted copper, verified green, warm off-white highlights
Composition: high-contrast safe area on lower-left for headline, denser data glow and ledger geometry on right
Resolution: 2400x1400 WebP or AVIF
Fallback: layered radial gradients and noise using Escrow Slate tokens
```

Hero image sourcing workflow:

```txt
Status: FINAL ASSET SELECTED
Selected reference: C:\Users\Paul\Documents\Coding Area\Hackathon\Escrow\image\DPP360™ Digital Product Passport Infrastructure….jfif
Final hero image: C:\Users\Paul\Documents\Coding Area\Hackathon\Escrow\Escrow_vault_with_ledger_traces_202607161344.jpeg
Required before code build: copy this final image into the app public assets folder during implementation
Technique reference: FRONTEND_SKILL.md Technique 8, Premium Static Hero Image Background

Priority order:
1. If Paul provides a hero image, use that exact file and filename. Apply the overlay and treatment above.
2. If Paul wants a fresh AI-generated image, generate original hero art from the asset brief above.
3. If Paul has or wants a Pinterest reference, use the Pinterest reference then recreate/adapt it with Google Flow.
4. Curated stock is last resort only, and must not look like generic business stock.

Pinterest plus Google Flow workflow:
1. Find or receive a Pinterest reference that matches dark operational escrow, technical ledger, campaign proof, and copper-green status energy.
2. Open Google Flow at labs.google/fx/tools/flow.
3. Set aspect ratio to 16:9, variation count to 2x, image model to Nano Banana 2.
4. Upload the Pinterest reference image.
5. Prompt Flow to keep the reference style while adapting the output to Escrow Slate.
6. Place the denser visual activity in the right half or right two-thirds of the frame.
7. Keep the left/lower-left area dark and open for hero copy.
8. Remove all text, watermarks, logos, brand symbols, fake company names, and readable UI labels.
9. Replace any purple, blue, red, or neon accent glow with muted copper and verified green.
10. Download the best variant at highest resolution.
11. Compress in Squoosh to under 500KB.
12. Save as WebP or AVIF only if we generated the asset ourselves.
13. Lock the final file path in this spec before implementation begins.

Google Flow prompt:
Keep the same overall visual language from the reference image, but adapt it into an original premium Web3 escrow hero image. Use a near-black slate background with muted copper ledger lines and verified green status markers. Place the densest abstract campaign escrow geometry, locked budget trails, wallet proof paths, and subtle onchain event traces on the right half of the frame. Keep the left two-thirds dark enough for large light text to sit clearly. No text, no watermarks, no logos, no brand symbols, no fake company names, no readable UI labels. Aspect ratio: 16:9.

Performance:
- Hero image uses loading="eager".
- Container includes background-color: var(--bg-primary).
- Generated asset target size is under 500KB.
- If Paul provides JPEG, PNG, WebP, or AVIF, use the provided format and filename exactly.
```

Chosen reference rationale:

```txt
Use DPP360™ Digital Product Passport Infrastructure….jfif as the reference.

Why this one:
- It already reads as a secure held-value object, close to an escrow vault.
- The black cube form connects to locked budget without using a literal padlock.
- Copper/gold seams already align with Escrow Slate better than blue or purple references.
- It has no visible text, no watermark, and no human subject.
- Google Flow can extend the dark background into 16:9 and move the cube to the right third.

Runner-up:
31806741114786350.jfif has a strong orbital glass core, but it feels more like a generic sci-fi engine than escrow. Use only if the cube reference fails.
```

Exact Google Flow settings:

```txt
Tool: Google Flow
URL: labs.google/fx/tools/flow
Mode: image generation with reference image attached
Reference image: C:\Users\Paul\Documents\Coding Area\Hackathon\Escrow\image\DPP360™ Digital Product Passport Infrastructure….jfif
Image model: Nano Banana 2
Aspect ratio: 16:9
Variation count: 2x
Output target: 2400x1350 or highest available 16:9
Final compression: Squoosh, WebP if generated by us, under 500KB
```

Google Flow reference adaptation prompt:

```txt
Use the attached reference image as the visual source. Keep the same core object, same premium dark 3D style, same black modular cube form, same secure vault-like feeling, and the same subtle gold/copper illuminated seams.

Adapt the image into a wide 16:9 landing page hero background. Place the cube on the right third of the frame, slightly above centre, with enough scale that it feels important but not cropped. Extend the dark slate background across the full frame. Keep the left half and lower-left area mostly empty, dark, and calm so large landing page headline text can sit there clearly.

Make the object feel more like an escrow vault for held campaign funds: add very subtle copper ledger traces, thin transaction rails, and a few small verified green proof nodes around the cube. Keep these details minimal and premium, not like a dashboard and not like a busy interface.

Match the Escrow Slate palette: near-black slate background, black metal cube surfaces, muted copper/gold seams, tiny verified green status glints, warm off-white highlights. Remove or avoid any dominant blue, purple, neon rainbow, or overly colourful reflections.

Do not add text, numbers, labels, logos, watermarks, brand symbols, UI screens, dashboards, coins, tokens, padlock icons, people, hands, or handshakes. The final result should feel like secure onchain escrow infrastructure, not generic crypto art.

Aspect ratio: 16:9.
```

Pinterest search keywords:

```txt
Primary searches:
- dark fintech
- digital vault
- blockchain abstract

Anti-searches:
- purple crypto dashboard
- neon NFT background
- blue blockchain network
- generic business handshake
- stock finance office
```

Reference selection checklist:

```txt
Pick references that have:
- A dark enough left side or lower-left area for large hero copy.
- Dense visual interest on the right side.
- Copper, gold, amber, or green accents that can map to Escrow Slate.
- Abstract ledger, transaction, proof, vault, network, or verification energy.
- No visible brand marks, readable UI labels, watermarks, or logo-like symbols.

Reject references that have:
- Purple or blue as the dominant crypto accent.
- Generic office people, handshake photos, or obvious stock finance imagery.
- Too much text embedded in the image.
- A focal object centred where the dashboard mockup needs to sit.
```

Original hero image direction:

```txt
Direction name: Locked Ledger

Subject:
A cinematic abstract escrow ledger environment. Thin copper rails form a layered transaction grid across a near-black slate surface. Verified green nodes mark approved KOL proof events. A central locked budget core sits slightly right of centre, built from geometric glass-metal planes, not a literal padlock icon.

Composition:
16:9 frame. Left third and lower-left remain dark and calm for headline and CTA. Right half carries the densest visual activity, with ledger paths, campaign slots, proof nodes, and a subtle escrow core. The image should feel like a campaign payout system seen as infrastructure, not a decorative crypto wallpaper.

Colour:
Near-black slate background, muted copper highlights, verified green status lights, warm off-white glints. No purple, no dominant blue, no neon rainbow.

Texture:
Fine grain, subtle depth haze, sharp technical lines, matte glass reflections, low-chroma cinematic lighting.

Must not include:
Text, logos, brand symbols, padlock emoji style icons, readable UI labels, human faces, handshakes, dollar bills, coins, generic crypto tokens, floating purple cubes.

Image generation prompt:
Cinematic abstract Web3 escrow ledger environment on a near-black slate background, thin muted copper transaction rails forming a layered technical grid, verified green proof nodes glowing softly, a geometric glass-metal locked budget core slightly right of centre, subtle campaign slot paths and onchain event traces, left third kept dark and open for large landing page text, premium fintech security mood, fine film grain, matte reflections, restrained contrast, no text, no logos, no watermarks, no readable UI labels, no human faces, no coins, no purple, no blue neon, 16:9 hero image.
```

## Section 2: Problem

Recipe reference: bespoke Bento grid operational.

Section:

```txt
relative z-10 w-full bg-[var(--bg-secondary)] py-20 md:py-28
```

Container:

```txt
mx-auto grid max-w-7xl grid-cols-1 gap-px bg-[var(--border-subtle)] px-4 md:px-8 lg:grid-cols-12 lg:px-10
```

Heading cell:

```txt
bg-[var(--bg-primary)] p-6 md:p-8 lg:col-span-5 lg:min-h-[420px]
```

Label:

```txt
font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--accent)]
```

Title:

```txt
mt-6 max-w-[10ch] font-display text-5xl italic leading-[0.9] text-[var(--text-primary)] md:text-7xl
```

Problem cell:

```txt
bg-[var(--bg-surface)] p-6 md:p-8 lg:col-span-7
```

Comparison grid:

```txt
grid grid-cols-1 gap-px overflow-hidden rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--border-subtle)] md:grid-cols-2
```

Comparison card:

```txt
bg-[var(--bg-primary)] p-5 md:p-6
```

Card title:

```txt
font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--text-muted)]
```

Card body:

```txt
mt-5 font-body text-lg leading-8 text-[var(--text-secondary)]
```

Scroll animation:

```txt
initial { filter: 'blur(10px)', opacity: 0, y: 22 }
whileInView { filter: 'blur(0px)', opacity: 1, y: 0 }
viewport { once: false, amount: 0.1 }
transition { duration: 0.7, ease: [0.16,1,0.3,1], delay: index * 0.08 }
```

Z-index stack:

```txt
z-0: section background
z-10: content grid
```

## Section 3: How Escrow Works

Recipe reference: `architecture-layers`, customised.

Section:

```txt
relative w-full bg-[var(--bg-primary)] py-20 md:py-32
```

Container:

```txt
mx-auto max-w-5xl px-4 md:px-8 lg:px-10
```

Header:

```txt
mx-auto max-w-3xl text-center
```

Title:

```txt
font-display text-5xl italic leading-[0.9] text-[var(--text-primary)] md:text-7xl
```

Layer stack:

```txt
mt-14 flex flex-col gap-3
```

Layer card:

```txt
grid grid-cols-[auto_1fr] gap-4 rounded-[1rem] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 transition-colors duration-200 hover:border-[var(--accent)] md:p-6
```

Layer number:

```txt
font-mono text-sm text-[var(--accent)]
```

Layer title:

```txt
font-body text-lg font-semibold text-[var(--text-primary)]
```

Layer description:

```txt
mt-2 font-body text-sm leading-6 text-[var(--text-secondary)]
```

Animation:

```txt
initial { filter: 'blur(10px)', opacity: 0, y: 20 }
whileInView { filter: 'blur(0px)', opacity: 1, y: 0 }
viewport { once: false, amount: 0.1 }
transition { duration: 0.6, ease: [0.16,1,0.3,1], delay: index * 0.08 }
```

Z-index stack:

```txt
z-0: section background
z-10: content
```

## Section 4: Payout Modes

Recipe reference: `capabilities-grid`, adapted without video.

Section:

```txt
relative overflow-hidden bg-[var(--bg-secondary)] py-20 md:py-32
```

Background:

```txt
absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(73,193,132,0.09),transparent_28%),radial-gradient(circle_at_80%_58%,rgba(214,163,84,0.12),transparent_30%)]
```

Noise:

```txt
noise-overlay absolute inset-0 z-[1] opacity-[0.12] pointer-events-none
```

Container:

```txt
relative z-10 mx-auto max-w-7xl px-4 md:px-8 lg:px-10
```

Grid:

```txt
mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--border-subtle)] lg:grid-cols-2
```

Mode card:

```txt
bg-[var(--bg-surface)] p-6 md:min-h-[420px] md:p-8
```

Mode title:

```txt
font-display text-4xl italic leading-none text-[var(--text-primary)] md:text-5xl
```

Mode rows:

```txt
mt-8 space-y-3
```

Mode row:

```txt
flex items-center justify-between border-t border-[var(--border-subtle)] pt-3
```

Label:

```txt
font-body text-sm text-[var(--text-secondary)]
```

Value:

```txt
font-mono text-sm text-[var(--accent)]
```

Animation:

```txt
initial { filter: 'blur(10px)', opacity: 0, y: 24 }
whileInView { filter: 'blur(0px)', opacity: 1, y: 0 }
viewport { once: false, amount: 0.1 }
transition { duration: 0.72, ease: [0.16,1,0.3,1], delay: cardIndex * 0.1 }
```

Z-index stack:

```txt
z-0: radial background
z-[1]: noise
z-10: content
```

## Section 5: Public Proof Page

Recipe reference: bespoke product proof mockup.

Section:

```txt
relative w-full bg-[var(--bg-primary)] py-20 md:py-32
```

Container:

```txt
mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-10
```

Text column:

```txt
lg:sticky lg:top-28 lg:self-start
```

Proof mockup:

```txt
rounded-[1.75rem] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-2
```

Inner proof:

```txt
rounded-[1.25rem] bg-[var(--bg-surface)] p-5 md:p-6
```

Status grid:

```txt
grid grid-cols-1 gap-px overflow-hidden rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--border-subtle)] md:grid-cols-3
```

Status cell:

```txt
bg-[var(--bg-primary)] p-4
```

Status number:

```txt
font-mono text-2xl font-semibold text-[var(--text-primary)]
```

Status label:

```txt
mt-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--text-muted)]
```

Event row:

```txt
grid grid-cols-[auto_1fr_auto] items-start gap-3 border-t border-[var(--border-subtle)] py-4 first:border-t-0
```

Event dot:

```txt
mt-1 h-2.5 w-2.5 rounded-full bg-[var(--verified)]
```

Event title:

```txt
font-body text-sm font-semibold text-[var(--text-primary)]
```

Event meta:

```txt
mt-1 font-mono text-[0.68rem] text-[var(--text-muted)]
```

Animation:

```txt
initial { filter: 'blur(10px)', opacity: 0, y: 22 }
whileInView { filter: 'blur(0px)', opacity: 1, y: 0 }
viewport { once: false, amount: 0.1 }
transition { duration: 0.72, ease: [0.16,1,0.3,1], delay: 0.12 }
```

Z-index stack:

```txt
z-0: section background
z-10: content
```

## Section 6: Monad Fit

Recipe reference: `metrics-section`, customised.

Section:

```txt
relative overflow-hidden bg-[var(--bg-secondary)] py-20 md:py-28
```

Container:

```txt
relative z-10 mx-auto max-w-7xl px-4 md:px-8 lg:px-10
```

Metrics grid:

```txt
grid grid-cols-1 gap-px overflow-hidden rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--border-subtle)] md:grid-cols-4
```

Metric cell:

```txt
bg-[var(--bg-primary)] p-5 md:p-6
```

Metric value:

```txt
font-mono text-2xl font-semibold text-[var(--text-primary)] md:text-3xl
```

Metric label:

```txt
mt-3 font-body text-sm leading-6 text-[var(--text-secondary)]
```

Animation:

```txt
initial { filter: 'blur(10px)', opacity: 0, y: 18 }
whileInView { filter: 'blur(0px)', opacity: 1, y: 0 }
viewport { once: false, amount: 0.1 }
transition { duration: 0.62, ease: [0.16,1,0.3,1], delay: index * 0.06 }
```

Z-index stack:

```txt
z-0: background
z-10: content
```

## Section 7: Final CTA

Recipe reference: bespoke Bento CTA.

Section:

```txt
relative min-h-[70dvh] overflow-hidden bg-[var(--bg-primary)] px-4 py-20 md:px-8 md:py-28 lg:px-10
```

Container:

```txt
mx-auto grid max-w-7xl grid-cols-1 gap-px overflow-hidden rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--border-subtle)] lg:grid-cols-[1.1fr_0.9fr]
```

Main CTA cell:

```txt
bg-[var(--bg-surface)] p-8 md:p-12 lg:p-14
```

Heading:

```txt
max-w-[11ch] font-display text-5xl italic leading-[0.88] text-[var(--text-primary)] md:text-7xl
```

Action row:

```txt
mt-8 flex flex-col gap-3 sm:flex-row
```

Checklist cell:

```txt
bg-[var(--bg-primary)] p-8 md:p-12
```

Checklist row:

```txt
flex items-center justify-between border-t border-[var(--border-subtle)] py-4 first:border-t-0
```

Animation:

```txt
initial { filter: 'blur(10px)', opacity: 0, y: 24 }
whileInView { filter: 'blur(0px)', opacity: 1, y: 0 }
viewport { once: false, amount: 0.1 }
transition { duration: 0.72, ease: [0.16,1,0.3,1], delay: 0.1 }
```

Z-index stack:

```txt
z-0: background
z-10: CTA content
```

## App Interior

### Shell

Route group: `/app/*`

Layout:

```txt
min-h-[100dvh] bg-[var(--bg-primary)] text-[var(--text-primary)] lg:grid lg:grid-cols-[280px_1fr]
```

Atmospheric background:

```txt
fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_12%,rgba(214,163,84,0.08),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(73,193,132,0.07),transparent_24%),var(--bg-primary)]
```

Noise:

```txt
noise-overlay fixed inset-0 z-[1] opacity-[0.10] pointer-events-none
```

Sidebar:

```txt
sticky top-0 z-20 hidden h-[100dvh] border-r border-[var(--border-subtle)] bg-[var(--bg-primary)]/82 p-4 backdrop-blur-xl lg:flex lg:flex-col
```

Sidebar brand:

```txt
px-3 py-3 font-display text-3xl italic text-[var(--text-primary)]
```

Sidebar link:

```txt
flex min-h-11 items-center gap-3 rounded-[0.75rem] px-3 font-body text-sm font-semibold text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
```

Active link:

```txt
bg-[var(--accent-glow)] text-[var(--accent)] ring-1 ring-[var(--border-default)]
```

Main:

```txt
relative z-10 min-w-0 px-4 py-4 md:px-6 lg:px-8
```

### `/app` Operational Home

Top grid:

```txt
grid grid-cols-1 gap-px overflow-hidden rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--border-subtle)] md:grid-cols-4
```

KPI cell:

```txt
bg-[var(--bg-surface)] p-5
```

KPI label:

```txt
font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--text-muted)]
```

KPI value:

```txt
mt-4 font-mono text-2xl font-semibold text-[var(--text-primary)]
```

Dashboard grid:

```txt
mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]
```

Primary panel:

```txt
rounded-[1.25rem] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 md:p-6
```

Right action panel:

```txt
rounded-[1.25rem] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5 md:p-6 xl:sticky xl:top-6
```

### Campaign Workspace

Workspace grid:

```txt
grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]
```

Submission row:

```txt
grid grid-cols-1 gap-4 border-t border-[var(--border-subtle)] py-5 first:border-t-0 md:grid-cols-[1fr_auto]
```

Approve button:

```txt
inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--verified)] px-4 font-body text-sm font-semibold text-[var(--bg-primary)] transition-opacity duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--verified)]
```

Reject button:

```txt
inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--rejected)]/40 bg-[var(--rejected)]/10 px-4 font-body text-sm font-semibold text-[var(--rejected)] transition-colors duration-200 hover:bg-[var(--rejected)]/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rejected)]
```

### Wallet Dropdown

Trigger:

```txt
inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 font-mono text-xs text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
```

Panel:

```txt
absolute right-0 top-[calc(100%+0.5rem)] z-[var(--z-dropdown)] w-[320px] rounded-[1rem] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.36)]
```

Panel animation:

```txt
initial { opacity: 0, scale: 0.95, y: -6 }
animate { opacity: 1, scale: 1, y: 0 }
exit { opacity: 0, scale: 0.95, y: -6 }
transition { duration: 0.18, ease: [0.22,1,0.36,1] }
style { transformOrigin: 'top right' }
```

Product status header:

```txt
rounded-[0.75rem] border border-[var(--border-subtle)] bg-[var(--verified-glow)] p-3
```

Status text:

```txt
font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--verified)]
```

Disconnect button:

```txt
mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--rejected)]/40 bg-[var(--rejected)]/10 font-body text-sm font-semibold text-[var(--rejected)] transition-colors duration-200 hover:bg-[var(--rejected)]/16
```

## Wallet Modal

Backdrop:

```txt
fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/60
```

Modal:

```txt
fixed left-1/2 top-1/2 z-[var(--z-modal)] w-[calc(100vw-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.42)] md:p-6
```

Title:

```txt
font-display text-3xl italic text-[var(--text-primary)]
```

Body:

```txt
mt-3 font-body text-sm leading-6 text-[var(--text-secondary)]
```

Connector button:

```txt
mt-5 flex min-h-12 w-full items-center justify-between rounded-[0.85rem] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 font-body text-sm font-semibold text-[var(--text-primary)] transition-colors duration-200 hover:border-[var(--accent)]
```

## Accessibility Requirements

- Add skip link as first focusable element.
- Every icon-only button needs `aria-label`.
- Every form input needs visible label.
- Focus returns to modal trigger after close.
- Focus moves to the first invalid field on form errors.
- Colour is never the only indicator of status.
- All wallet and transaction errors state the cause and next action.

## Asset Policy

No hardcoded logo, favicon, icon mark, or brand symbol. Use text-only `Escrow` until Paul supplies a real asset or asks for a generated mark.

## Self-Check

- Exact Tailwind classes are provided for every major element.
- Animation values include initial, animate, duration, easing, and delay.
- Z-index stacks are declared per section.
- Hero has an asset brief.
- Responsive classes are included.
- Recipe references are named where applicable.
- Wallet-gated routing and wallet dropdown patterns are specified.
