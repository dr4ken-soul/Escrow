# Composition Recipes

Companion file to FRONTEND_SKILL.md. The skill file references recipes by name when generating FRONTEND_SPEC files. Each recipe is a complete section layout specified at the Tailwind-class level so the spec output leaves zero room for interpretation.

---

## How to Use Recipes

1. During Gate 1, the user picks an aesthetic direction. The AI identifies which recipes fit that aesthetic and proposes them as the section structure.
2. Each recipe is a pre-designed section layout. It provides **exact Tailwind classes, exact animation values, exact z-index stacking, and responsive breakpoints** for every element.
3. Recipes are mixed and matched per project. A single page might use `cinematic-video-hero` for the hero, `capabilities-grid` for the features, and `metrics-section` for the social proof. You never use all sections from one recipe.
4. **Fonts, colours, and assets change per project.** The recipe provides structure, spacing, and animation. The palette comes from the Gate 5 decision. The font comes from the Gate 4 decision. The assets come from the asset pipeline.
5. When writing a FRONTEND_SPEC, reference the recipe name and reproduce the exact class values. Do not paraphrase. Do not approximate. If the recipe says `rounded-[1.25rem]`, the spec says `rounded-[1.25rem]`, not `rounded-xl` and not `rounded corners`.
6. If a project needs a section that no recipe covers, invent a bespoke layout at the same level of specificity shown here. The recipe library grows over time.

---

## Section A: Golden Spec Examples

These are complete section specifications showing what a FRONTEND_SPEC section must look like. If the spec you are generating does not match this level of detail, it is not ready. Every element has exact classes, exact positions, exact animation timings. No vague descriptions. No "large heading" or "card with blur". Exact values only.

### Golden Example 1: Cinematic Video Hero (Dark Agency Page)

**Aesthetic:** Cinematic dark, liquid glass, serif italic headlines
**Fonts:** `font-heading` = Instrument Serif (italic), `font-body` = Barlow
**Based on:** MotionSites agency prompt (Prompt #3)

```
SECTION: Hero
Layout: full viewport (h-screen), centred content, video background
Background: bg-black

VIDEO BACKGROUND:
  Element: <FadingVideo> or <video autoPlay muted playsInline preload="auto">
  Position: absolute left-1/2 top-0 -translate-x-1/2 z-0
  Size: width: 120%, height: 120% (cinematic crop, centred with translateX(-50%))
  Object fit: object-cover object-top
  Asset brief: "dark atmospheric scene with slow camera drift, blue-teal accent lighting, 8s loop"
  Fallback: bg-black static frame

NOISE GRAIN OVERLAY:
  Position: absolute inset-0 pointer-events-none z-[3]
  Background: inline SVG fractalNoise pattern (baseFrequency 0.9, numOctaves 4)
  Background size: 200px 200px
  Opacity: 0.4

NAVBAR (fixed liquid glass pill):
  Position: fixed top-4 left-0 right-0 z-50
  Layout: flex items-center justify-between px-8 lg:px-16
  Logo: liquid-glass h-12 w-12 rounded-full, font-heading text-2xl italic text-white
  Centre pill (md:flex hidden): liquid-glass rounded-full px-1.5 py-1.5
    Links: px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors
    CTA button: bg-white text-black px-4 py-2 rounded-full text-sm font-medium
  Right spacer: h-12 w-12 (balances logo)

CONTENT (centred column):
  Container: relative z-10 flex flex-col h-full items-center justify-center pt-24 px-4 text-center

  Badge chip (delay 0.4s):
    liquid-glass rounded-full px-1.5 py-1.5 flex items-center gap-3
    Inner pill: bg-white text-black text-xs font-semibold px-2.5 py-1 rounded-full
    Text: text-white/80 text-sm font-body pr-3

  Headline (delay 0.5s):
    Component: <BlurText> word-by-word animation
    Classes: text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] tracking-[-4px]
    Max width: max-w-3xl
    Animation per word: blur(10px) opacity:0 y:50 -> blur(5px) opacity:0.5 y:-5 -> blur(0) opacity:1 y:0
    Duration: 0.7s per word, stagger: delay = (wordIndex * 100) / 1000 seconds

  Subheading (delay 0.8s):
    text-sm md:text-base text-white font-body font-light leading-tight mt-4 max-w-2xl

  CTA buttons (delay 1.1s):
    mt-6 flex items-center gap-6
    Primary: liquid-glass-strong rounded-full px-5 py-2.5 text-white text-sm font-medium
    Secondary: text-white/80 text-sm font-medium hover:text-white, play icon + text

  Stat cards (delay 1.3s):
    mt-8 flex gap-4
    Each card: liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left
    Icon: w-5 h-5 text-white/60
    Number: text-4xl font-heading italic tracking-[-1px] leading-none mt-4 text-white
    Label: text-white/50 text-xs mt-2 font-body

  Trust bar (delay 1.4s):
    flex flex-col items-center gap-4 pb-8
    Pill: liquid-glass rounded-full px-5 py-2.5, text-white/60 text-xs font-body
    Brand names: font-heading italic text-2xl md:text-3xl tracking-tight text-white/30, gap-12 md:gap-16

ENTRANCE ANIMATION (all elements):
  Base initial: { filter: 'blur(10px)', opacity: 0, y: 20 }
  Base animate: { filter: 'blur(0px)', opacity: 1, y: 0 }
  Base transition: duration 0.8s, ease: 'easeOut', delay as noted above
```

### Golden Example 2: Masonry Mosaic Hero (Light/White, Dental Clinic)

**Aesthetic:** Clean white, masonry card layout, shared background images
**Fonts:** `font-heading` = Open Sauce One (bold), `font-body` = Open Sauce One (regular)
**Based on:** MotionSites dental prompt (Prompt #1)

```
SECTION: Hero
Layout: full viewport (min-h-screen), white background, grid of cards sharing a single image
Background: bg-white

GRID STRUCTURE:
  Container: w-full min-h-screen p-3 md:p-5 bg-white
  Grid: CSS grid with named areas
    Desktop (lg+): 3 columns, rows auto
      "feature-bar  main-card    service-card"
      "feature-bar  main-card    cta-card"
      "info-strip   info-strip   info-strip"
    gap: 3 md:gap-4

MASKED CARDS TECHNIQUE (shared background):
  All cards that show imagery share ONE background image
  Each card: overflow-hidden, border-radius rounded-[1.5rem] md:rounded-[2rem]
  Background: background-image: url(SINGLE_IMAGE_URL)
  Background size: cover the ENTIRE grid area (not each individual card)
  Each card calculates its own backgroundPosition based on its position in the grid
  This creates a mosaic effect where the same image shows through different "windows"

  Card calculation:
    backgroundSize: `${gridWidth}px ${gridHeight}px`
    backgroundPosition: `-${cardOffsetX}px -${cardOffsetY}px`

FEATURE BAR (left column):
  Grid area: feature-bar
  Classes: rounded-[2rem] overflow-hidden relative
  Inner: absolute inset-0, background-image with calculated position
  Overlay content: absolute bottom-5 left-3 md:bottom-8 md:left-4 z-10
    Label: text-black text-xs md:text-sm font-semibold mb-1 md:mb-2
    Heading: text-black text-xl md:text-3xl lg:text-4xl font-bold leading-tight max-w-[200px] md:max-w-[280px]

MAIN CARD (centre):
  Grid area: main-card
  Classes: rounded-[2rem] overflow-hidden relative min-h-[400px] md:min-h-[500px]
  Same masked background technique
  Content: absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10
    Badge: bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium

SERVICE CARD (top right):
  Grid area: service-card
  Classes: bg-[#f5f0eb] rounded-[2rem] p-5 md:p-8 flex flex-col justify-between
  NO background image (solid colour)
  Content: service number (text-6xl font-bold text-black/10), service name, description

CTA CARD (bottom right):
  Grid area: cta-card
  Classes: bg-black rounded-[2rem] p-5 md:p-8 flex flex-col justify-between text-white
  Button: bg-white text-black rounded-full px-6 py-3 font-medium

INFO STRIP (full width bottom):
  Grid area: info-strip
  Classes: rounded-[2rem] bg-[#f5f0eb] p-4 md:p-6 flex items-center justify-between
  Contains: rating stars, open hours, phone number

ENTRANCE ANIMATION:
  Each card staggers in with:
  initial: { opacity: 0, y: 30, scale: 0.97 }
  animate: { opacity: 1, y: 0, scale: 1 }
  transition: duration 0.6s, ease: [0.16, 1, 0.3, 1], delay: cardIndex * 0.12s
```

### Golden Example 3: Dark Product Hero with App Mockup (Aura Email Client)

**Aesthetic:** Dark SaaS, gradient headline, product screenshot hero
**Fonts:** `font-heading` = Inter (tight), `font-body` = Inter
**Based on:** MotionSites Aura email prompt (Prompt #4)

```
SECTION: Hero
Layout: full viewport, centred content above app mockup
Background: bg-[#0a0a0a] with radial gradient

BACKGROUND GRADIENT:
  Radial gradient: from centre, bg-[#0a0a0a]
  Gradient stops: transparent centre -> subtle purple/blue glow at 40% -> transparent at 70%
  CSS: background: radial-gradient(ellipse at 50% 30%, rgba(120,80,255,0.08) 0%, transparent 70%)

NAVBAR:
  Position: fixed top-0 left-0 right-0 z-50
  Layout: flex items-center justify-between px-8 lg:px-16 py-4
  Background: bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5
  Logo: text-lg font-semibold text-white tracking-tight
  Links: text-sm text-white/60 hover:text-white transition-colors
  CTA: bg-white text-black px-4 py-2 rounded-lg text-sm font-medium

HERO CONTENT (centred):
  Container: relative z-10 flex flex-col items-center text-center pt-32 px-4

  Badge (delay 0.3s):
    border border-white/10 rounded-full px-4 py-1.5
    text-xs text-white/60 font-medium tracking-wide uppercase

  Headline (delay 0.5s):
    text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-[-2px] mt-6
    Gradient text on key words: bg-gradient-to-r from-white via-purple-200 to-purple-400
      background-clip: text, -webkit-text-fill-color: transparent

  Subheading (delay 0.7s):
    text-base md:text-lg text-white/50 max-w-xl mt-4 leading-relaxed

  CTA row (delay 0.9s):
    mt-8 flex items-center gap-4
    Primary: bg-white text-black px-6 py-3 rounded-lg font-medium text-sm
    Secondary: border border-white/10 text-white px-6 py-3 rounded-lg font-medium text-sm

APP MOCKUP (delay 1.1s):
  Container: mt-16 w-full max-w-5xl mx-auto
  Wrapper: rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-purple-500/5
  macOS title bar: h-8 bg-[#1a1a1a] flex items-center px-4 gap-2
    Dots: 3x w-3 h-3 rounded-full (bg-[#ff5f57], bg-[#ffbd2e], bg-[#27c93f])
  App content: screenshot image or styled div mimicking the product UI
    Background: bg-[#111111]
    Sidebar: w-[240px] bg-[#0d0d0d] border-r border-white/5
    Main area: flex-1, inbox list or product content

ENTRANCE ANIMATION:
  Same blur-fade base as Example 1
  App mockup: additional scale animation
    initial: { opacity: 0, y: 40, scale: 0.95 }
    animate: { opacity: 1, y: 0, scale: 1 }
    transition: duration 1s, ease: [0.16, 1, 0.3, 1]
```

---

## Section B: Composition Recipes

### Recipe: `cinematic-video-hero`

**Based on:** Golden Example 1 (agency page)
**Suits:** Creative agencies, premium launches, Web3, portfolios
**Aesthetic:** Full-viewport video, centred headline, liquid glass navbar, stats cards, trust bar

```
Structure:
  section: relative h-screen overflow-hidden bg-black
    z-0:  <FadingVideo> or <video> -- absolute, 120% size, centred crop
    z-3:  noise grain overlay -- absolute inset-0, pointer-events-none, SVG fractalNoise
    z-10: content layer -- relative, flex col, h-full
      z-50: navbar -- fixed top-4, liquid-glass pill, logo left, links centre, spacer right
      main: flex-1 flex-col items-center justify-center pt-24 px-4 text-center
        badge -> headline (BlurText) -> subheading -> CTAs -> stat cards -> trust bar

Key classes:
  Navbar pill: liquid-glass rounded-full px-1.5 py-1.5
  Nav links: px-3 py-2 text-sm font-medium text-white/90
  Nav CTA: bg-white text-black px-4 py-2 rounded-full text-sm font-medium
  Badge: liquid-glass rounded-full px-1.5 py-1.5
  Headline: text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic leading-[0.8] tracking-[-4px]
  Stat cards: liquid-glass p-5 w-[220px] rounded-[1.25rem]
  Stat number: text-4xl font-heading italic tracking-[-1px] leading-none
  Trust names: font-heading italic text-2xl md:text-3xl text-white/30

Animation stagger:
  badge: 0.4s | headline: 0.5s | sub: 0.8s | CTAs: 1.1s | stats: 1.3s | trust: 1.4s
```

---

### Recipe: `cinematic-video-hero-split`

**Based on:** MotionSites SynapseX prompt (Prompt #2)
**Suits:** Tech products, AI tools, crypto protocols, developer-facing
**Aesthetic:** Full-viewport video, headline bottom-left, metric bottom-right, parallax text

```
Structure:
  section: relative h-screen overflow-hidden bg-black
    z-0:  <video> background -- absolute inset-0, object-cover
    z-10: content layer -- relative, flex col, h-full, justify-end
      navbar: fixed top-0, flex between, px-8 lg:px-16, bg-black/40 backdrop-blur-md
      bottom-left: absolute bottom-8 left-8 md:left-16, max-w-lg
        label -> headline -> description -> CTA
      bottom-right: absolute bottom-8 right-8 md:right-16
        metric number -> metric label

Key classes:
  Navbar: bg-black/40 backdrop-blur-md border-b border-white/5
  Bottom-left headline: text-4xl md:text-5xl lg:text-6xl font-mono font-bold text-white leading-[0.95] tracking-tight
  Bottom-left label: text-xs uppercase tracking-[0.2em] text-white/40 font-mono mb-4
  Bottom-right metric: text-6xl md:text-7xl font-mono font-bold text-white
  Bottom-right label: text-sm text-white/40 font-mono mt-2

Animation:
  Bottom-left: slide from left -- initial: { x: -40, opacity: 0 } delay 0.6s
  Bottom-right: slide from right -- initial: { x: 40, opacity: 0 } delay 0.8s
  Parallax text layer (optional): large ghost text behind content, translateY on scroll
```

---

### Recipe: `masonry-mosaic-hero`

**Based on:** Golden Example 2 (dental clinic)
**Suits:** Clinics, restaurants, real estate, lifestyle brands, portfolios with strong imagery
**Aesthetic:** White/light background, CSS grid of cards, shared background image mosaic

```
Structure:
  section: w-full min-h-screen p-3 md:p-5 bg-white
    grid: CSS grid with named areas (see Golden Example 2)
      feature-bar: tall left column, image window, overlaid label + heading
      main-card: large centre card, image window, overlaid badge
      service-card: top-right, solid colour bg-[#f5f0eb], service info
      cta-card: bottom-right, bg-black text-white, CTA button
      info-strip: full width bottom, bg-[#f5f0eb], ratings/hours/contact

Key classes:
  All image cards: rounded-[1.5rem] md:rounded-[2rem] overflow-hidden
  Service card: bg-[#f5f0eb] rounded-[2rem] p-5 md:p-8
  CTA card: bg-black rounded-[2rem] p-5 md:p-8 text-white
  Card heading overlay: absolute bottom-5 left-3 md:bottom-8 md:left-4 z-10
  CTA button: bg-white text-black rounded-full px-6 py-3 font-medium

Novel technique:
  Masked Cards -- all image cards share ONE background image with calculated backgroundPosition
  See Novel Technique Library: Masked Cards
```

---

### Recipe: `product-mockup-hero`

**Based on:** Golden Example 3 (Aura email client)
**Suits:** SaaS products, developer tools, email/CRM apps, dashboards
**Aesthetic:** Dark background, gradient text headline, app screenshot below

```
Structure:
  section: relative min-h-screen bg-[#0a0a0a] overflow-hidden
    background: radial-gradient(ellipse at 50% 30%, rgba(120,80,255,0.08), transparent 70%)
    navbar: fixed, bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5
    content: flex col items-center text-centre pt-32 px-4
      badge -> headline (gradient text on key words) -> sub -> CTAs -> app mockup

Key classes:
  Badge: border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 uppercase tracking-wide
  Headline: text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-[-2px]
  Gradient words: bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent
  CTA primary: bg-white text-black px-6 py-3 rounded-lg font-medium text-sm
  CTA secondary: border border-white/10 text-white px-6 py-3 rounded-lg font-medium text-sm
  Mockup wrapper: rounded-xl border border-white/10 overflow-hidden shadow-2xl
  macOS dots: w-3 h-3 rounded-full (#ff5f57, #ffbd2e, #27c93f)

Animation:
  Same blur-fade stagger as cinematic-video-hero
  App mockup: initial { opacity: 0, y: 40, scale: 0.95 } duration 1s ease [0.16,1,0.3,1]
```

---

### Recipe: `capabilities-grid`

**Based on:** Capabilities section from the agency page
**Suits:** Services section, features section, team capabilities
**Aesthetic:** Video background, large italic heading top, 3-column liquid glass cards bottom

```
Structure:
  section: relative min-h-screen overflow-hidden bg-black
    z-0:  <FadingVideo> background -- absolute inset-0 object-cover
    z-10: content -- px-8 md:px-16 lg:px-20 pt-24 pb-10 flex col min-h-screen
      header: mb-auto
        label: text-sm font-body text-white/80 mb-6 ("// Capabilities" or similar)
        heading: font-heading italic text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]
      cards grid: mt-16 grid grid-cols-1 md:grid-cols-3 gap-6

Key classes:
  Card: liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col
  Card icon box: liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center
  Card tags: flex flex-wrap gap-1.5, each tag: liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90
  Card title: font-heading italic text-3xl md:text-4xl tracking-[-1px] leading-none
  Card body: text-sm text-white/90 font-body font-light leading-snug max-w-[32ch] mt-3

Layout: icon + tags at top, spacer (flex-1) in middle, title + body at bottom
```

---

### Recipe: `services-mosaic`

**Based on:** Dental prompt services grid
**Suits:** Service listings, feature grids, pricing sections
**Aesthetic:** Grid of glass/blur cards with service names and numbers, mixed light/dark

```
Structure:
  section: py-20 md:py-32 px-4 md:px-8 bg-white (or bg-[#0a0a0a] for dark variant)
    container: max-w-7xl mx-auto
      heading: text-centre mb-16
      grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6

Key classes (light variant):
  Card: bg-[#f5f0eb] rounded-[2rem] p-6 md:p-8 flex flex-col min-h-[280px]
  Service number: text-6xl font-bold text-black/10 leading-none
  Service name: text-xl font-semibold text-black mt-auto
  Service description: text-sm text-black/60 mt-2 leading-relaxed

Key classes (dark variant):
  Card: liquid-glass rounded-[1.25rem] p-6 md:p-8 flex flex-col min-h-[280px]
  Service number: text-6xl font-bold text-white/10 leading-none
  Service name: text-xl font-semibold text-white mt-auto
  Service description: text-sm text-white/60 mt-2 leading-relaxed

Animation: stagger per card, delay = index * 0.1s
```

---

### Recipe: `metrics-section`

**Based on:** SynapseX prompt metrics area
**Suits:** Social proof, statistics, KPIs, performance numbers
**Aesthetic:** Video or dark background, centred subtitle, 3-column metric numbers

```
Structure:
  section: relative py-24 md:py-32 overflow-hidden bg-black
    optional: <video> background at z-0
    content: relative z-10 px-8 md:px-16
      subtitle: text-centre, text-sm uppercase tracking-[0.2em] text-white/40 font-mono mb-16
      metrics grid: grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-centre

Key classes:
  Metric number: text-5xl md:text-6xl lg:text-7xl font-heading italic (or font-mono font-bold) text-white leading-none
  Metric label: text-sm text-white/40 mt-3
  Metric divider (optional): border-r border-white/10 (between columns on desktop)

Animation:
  Each metric: counter animation from 0 to final value over 1.5s, ease-out
  Stagger: delay 0.2s per column
  Trigger: IntersectionObserver, replays on re-enter
```

---

### Recipe: `architecture-layers`

**Based on:** SynapseX prompt architecture section
**Suits:** Technical architecture, API layers, stack diagrams, how-it-works
**Aesthetic:** Pure black background, centred heading, stacked border cards

```
Structure:
  section: py-24 md:py-32 bg-black
    container: max-w-4xl mx-auto px-8
      heading: text-centre
        label: text-xs uppercase tracking-[0.2em] text-white/40 font-mono mb-4
        title: text-3xl md:text-4xl font-semibold text-white tracking-tight
      layers: mt-16 flex flex-col gap-4

Key classes:
  Layer card: border border-white/10 rounded-xl p-6 flex items-start gap-4
    hover: border-white/20 transition-colors
  Layer number: text-sm font-mono text-white/30 min-w-[2rem]
  Layer title: text-base font-semibold text-white
  Layer description: text-sm text-white/50 mt-1 leading-relaxed

Animation:
  Each layer slides in from bottom with stagger
  initial: { opacity: 0, y: 20 }
  animate: { opacity: 1, y: 0 }
  delay: index * 0.15s
  duration: 0.6s, ease: [0.16, 1, 0.3, 1]
```

---

### Recipe: `split-image-text`

**Based on:** Dental prompt section 3
**Suits:** About sections, story sections, team sections, product details
**Aesthetic:** Two-column layout with heading and images on one side, tall image on other

```
Structure:
  section: py-20 md:py-32 px-4 md:px-8 bg-white (or bg-[#0a0a0a])
    container: max-w-7xl mx-auto
      grid: grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12

Left column:
  heading: text-3xl md:text-4xl lg:text-5xl font-heading (bold or italic) leading-tight
  description: text-base text-black/60 (or text-white/60) mt-4 leading-relaxed max-w-lg
  image row: mt-8 grid grid-cols-2 gap-4
    Each image: rounded-[1.5rem] overflow-hidden aspect-[4/3] object-cover

Right column:
  Single tall image: rounded-[2rem] overflow-hidden h-full min-h-[500px] object-cover
  Optional overlay cards: absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4

Key classes:
  Left heading: text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight
  Image: rounded-[1.5rem] w-full h-full object-cover
  Overlay card: bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg

Animation:
  Left column: fade-in from left, delay 0.3s
  Right column: fade-in from right, delay 0.5s
  Images: scale from 0.95 to 1.0 with opacity
```

---

### Recipe: `footer-video`

**Based on:** SynapseX prompt footer
**Suits:** Closing sections, contact sections, final CTAs
**Aesthetic:** Two-column layout with video on one side, copy and logo on other

```
Structure:
  section: py-20 md:py-0 bg-black
    container: max-w-7xl mx-auto px-8
      grid: grid-cols-1 lg:grid-cols-2 gap-0 min-h-[500px]

Left column (video):
  Classes: relative overflow-hidden rounded-2xl lg:rounded-none lg:rounded-l-2xl
  <video>: absolute inset-0 w-full h-full object-cover
  Min height: min-h-[300px] lg:min-h-full

Right column (content):
  Classes: flex flex-col justify-centre p-8 md:p-12 lg:p-16
  Logo: text-2xl font-heading italic text-white mb-8
  Heading: text-2xl md:text-3xl font-semibold text-white tracking-tight
  Description: text-sm text-white/50 mt-4 leading-relaxed max-w-md
  CTA: mt-8, bg-white text-black px-6 py-3 rounded-full font-medium text-sm
  Bottom: mt-auto pt-8, flex between, text-xs text-white/30 (copyright, links)

Animation:
  Video column: fade-in, delay 0.3s
  Content items: stagger from right, delay 0.5s start, 0.1s per item
```

---

## Section C: Novel Technique Library

These are bespoke visual techniques extracted from premium sites. Each one is specified at implementation level so it can be referenced in a spec and built verbatim.

### Technique: Masked Cards

Multiple cards sharing a single background image. Each card shows a different "window" into the same image, creating a cohesive mosaic effect.

```
How it works:
  1. All cards are in a CSS grid with known dimensions
  2. One background image covers the entire grid area
  3. Each card sets its own backgroundPosition to show only its portion of the image
  4. The cards have overflow-hidden and border-radius

Implementation:
  - Measure the grid container dimensions (useRef + ResizeObserver)
  - For each card, calculate its offset within the grid
  - Set inline styles:
      backgroundImage: url(IMAGE_URL)
      backgroundSize: `${gridWidth}px ${gridHeight}px`
      backgroundPosition: `-${card.offsetLeft}px -${card.offsetTop}px`
  - All cards MUST have: overflow-hidden, border-radius, position: relative

When to use:
  Hero sections with strong imagery, portfolio grids, service showcases where
  visual cohesion matters more than individual card images
```

---

### Technique: Mouse-Scrubbed Video

The cursor's horizontal position controls the video timeline. Moving left rewinds, moving right advances.

```
Implementation (useVideoScrub hook):
  const useVideoScrub = (videoRef: RefObject<HTMLVideoElement>) => {
    useEffect(() => {
      const v = videoRef.current
      if (!v) return
      const onMove = (e: MouseEvent) => {
        const pct = e.clientX / window.innerWidth
        if (v.duration) v.currentTime = pct * v.duration
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, [videoRef])
  }

Video element:
  <video ref={ref} muted playsInline preload="auto"> -- NO autoPlay, NO loop
  Touch fallback: autoplay with loop on touch devices (no mousemove available)

When to use:
  Character rotation reveals, product 360-degree showcases, interactive exploration
  Best with multi-angle character videos from Step 12 STEP 2C
```

---

### Technique: Splash Screen Counter

A 0-100 loading counter displayed before the main page reveals.

```
Implementation:
  State: const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let frame: number
    const start = performance.now()
    const duration = 2000 // 2 seconds

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setCount(Math.floor(progress * 100))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setDone(true)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

Display:
  Fullscreen overlay: fixed inset-0 z-[100] bg-black flex items-center justify-center
  Counter: text-8xl font-mono font-bold text-white tabular-nums
  When done: AnimatePresence exit animation (fade out + scale up)

When to use:
  Premium landing pages that preload heavy assets (video, fonts)
  Creative portfolios, luxury brands, immersive experiences
```

---

### Technique: Text Scramble Animation

Characters randomise through symbols before revealing the final text, character by character.

```
Implementation:
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'

  function useTextScramble(text: string, trigger: boolean, speed = 30) {
    const [display, setDisplay] = useState('')
    useEffect(() => {
      if (!trigger) return
      let frame: number
      let iteration = 0
      const tick = () => {
        setDisplay(
          text.split('').map((char, i) =>
            i < iteration ? char : chars[Math.floor(Math.random() * chars.length)]
          ).join('')
        )
        iteration += 1 / 3
        if (iteration < text.length) frame = requestAnimationFrame(tick)
        else setDisplay(text)
      }
      frame = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(frame)
    }, [text, trigger, speed])
    return display
  }

Display:
  <span className="font-mono">{scrambledText}</span>
  Trigger: on IntersectionObserver entry or on page load

When to use:
  Tech/hacker aesthetic, AI products, data platforms, crypto protocols
  Best with monospace fonts
```

---

### Technique: FadingVideo Crossfade Loop

Seamless video looping without visible jump cuts by fading out before end and fading back in on restart.

```
Implementation:
  See motionsites-test/src/App.tsx FadingVideo component

  Key logic:
    1. On loadeddata: set opacity to 0, play, fade to 1 over 500ms
    2. On timeupdate: when remaining time <= 0.55s, start fading to 0 over 550ms
    3. On ended: set opacity to 0, reset currentTime to 0 (or switch src for multi-video), play, fade to 1

  Multi-source support:
    Pass src as string[] to cycle through multiple videos
    On ended, increment srcIndex and load the next source

  CSS: the video element needs will-change: opacity for GPU acceleration

When to use:
  Any video background where the raw loop has a visible jump
  Especially important for AI-generated videos which rarely loop seamlessly
```

---

### Technique: 3D Perspective Text

CSS `perspective()` and `rotateX()` creating faux 3D depth on text elements, optionally driven by scroll position.

```
Implementation:
  Static version:
    <div style={{ perspective: '400px' }}>
      <h2 style={{
        transform: 'rotateX(24deg) translateZ(15px)',
        transformOrigin: 'bottom centre'
      }}>
        Heading Text
      </h2>
    </div>

  Scroll-driven version:
    const [rotation, setRotation] = useState(24)
    useEffect(() => {
      const onScroll = () => {
        const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight)
        setRotation(24 - progress * 24) // 24deg -> 0deg as user scrolls
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }, [])

Key values:
  perspective: 400px (moderate depth, not too dramatic)
  rotateX: 15-30deg (subtle tilt, not extreme)
  translateZ: 10-20px (slight forward push)
  transformOrigin: bottom centre (tilts "away from" the viewer)

When to use:
  Hero headlines on tech/creative sites, section titles that need dramatic presence
  Pairs well with monospace or bold sans-serif fonts
  NOT suitable for body text or small UI elements
```
