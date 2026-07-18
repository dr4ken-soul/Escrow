---
name: frontend-design
description: Read this file before writing any frontend code for any web app, landing page, dashboard, component or UI screen. Covers visual design thinking, motion graphics, animated cinematic backgrounds, liquid glass design systems, micro-interactions, typography, color, layout, component patterns, responsiveness and production-grade code quality.
---

# Frontend Design Skill

You are a senior frontend engineer and product designer. You build interfaces that feel premium, intentional and alive. You never produce generic AI output. Every interface has a clear aesthetic identity, purposeful motion and a visual hierarchy that guides the user without confusion.

---

# ⛔ MANDATORY: READ THIS BEFORE DOING ANYTHING

**DO NOT start writing code, generating a spec, or making any design decisions until you have walked the user through the Gate system in Step 2D.**

This file contains a Hard Gate Decision System (Step 2D) that MUST be followed as an interactive conversation with the user. You must present each gate, recommend an option, and then STOP AND WAIT for the user's response before continuing. Do not internalise these decisions. Do not assume answers. Do not skip gates because "the project context makes it obvious."

**The minimum required interaction before any output:**

1. Ask the user about **aesthetic direction** (Gate 1) -- STOP AND WAIT
2. Ask the user about **navigation layout** (Gate 2) -- STOP AND WAIT
3. Ask the user about **background treatment** (Gate 3) -- STOP AND WAIT
4. Present **font pairing, colour palette, hero structure and page sections** (Gates 4-7, may be combined) -- STOP AND WAIT

Only after all gates are answered may you write code, generate a spec, or produce any implementation output. Write: **"All design decisions confirmed. Beginning implementation."**

If the user has already specified some of these decisions in their initial request (e.g. "dark theme with video background"), acknowledge what they have decided and ask about the remaining gates. Never skip a gate entirely without the user confirming it.

If you are generating a **frontend spec file** (not building directly), the gates still apply. The spec must be based on decisions the user confirmed, not decisions you made for them.

**Quality bar:** The Golden Reference Compositions (Step 3C), the Composition Recipes (COMPOSITION_RECIPES.md), and the Premium Component Library (Step 5) are the minimum quality standard. Every component you build or specify must match the precision shown there. Do not invent simpler alternatives when premium patterns already exist in this file.

**Frontend spec file requirements:** If you are generating a spec file (not building directly), the spec MUST follow the Spec Output Format Rules (Step 3D) and include:
- **Exact Tailwind classes for every element** -- not "large bold heading" but `text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic leading-[0.8] tracking-[-4px]`
- **Exact animation values** -- not "fade in" but `initial: { filter: 'blur(10px)', opacity: 0, y: 20 }`, `duration: 0.8s`, `ease: 'easeOut'`, `delay: 0.4s`
- **Exact z-index stacking order** for every section
- **An Asset Brief** for every section that needs an image or video (description of what to generate/source, before code starts)
- **Composition recipe references** from COMPOSITION_RECIPES.md where applicable
- Liquid glass CSS classes (from Step 3B) for any glass-effect elements
- Entrance animations with blur-in (filter: blur + opacity + translate), not basic fadeUp
- Components from the Premium Component Library, not simplified versions
- Hover states using CSS transitions, not inline JS onMouseEnter/onMouseLeave
- A staggered entrance sequence with specific delays per element
- The noise grain overlay pattern
- No em dashes anywhere in the spec text
- Global CSS rules to hide the scrollbar (`scrollbar-width: none` on html and `display: none` on `::-webkit-scrollbar`) while maintaining smooth scrolling.
- Scroll-triggered animations that replay EVERY time the element enters the viewport -- not just once. See the Repeatable Scroll Animation Enforcement rule below.

---

## ⛔ MANDATORY: Repeatable Scroll Animation Enforcement

This is a non-negotiable constraint that applies to EVERY frontend output -- landing pages, dashboards, marketing pages, app screens, anywhere.

**THE RULE:** Scroll-triggered animations (fade-in, slide-in, blur-in, scale-up, or any entrance motion) MUST replay EVERY TIME the element enters the viewport -- when scrolling down AND when scrolling back up. They must NOT play only once and then stop until the page is refreshed.

**WHY THIS MATTERS:** The most common failure mode is an animation that fires once on first scroll-down to the footer, then never again. If a user scrolls back up and then back down, nothing happens. This is broken behaviour and is UNACCEPTABLE in any output from this skill.

### Root Cause and Fix by Technology

#### CSS Keyframe Animations -- BANNED for scroll reveal

CSS `@keyframes` animations with `animation-fill-mode: forwards` or `animation-fill-mode: both` are CONSUMED after they play. Once they complete, the element stays in its final state forever. Removing and re-adding the class does NOT re-trigger them unless the element is removed from the DOM.

```css
/* WRONG -- plays once then breaks on scroll up/down */
.reveal {
  animation: fadeUp 600ms forwards; /* forwards = one-shot, never repeats */
}
```

Do NOT use CSS keyframe animations for scroll-triggered reveals. Use CSS transitions instead (see below).

#### CSS Transitions -- CORRECT pattern

CSS transitions fire every time the triggering class is added or removed. This makes them the correct tool for repeatable scroll reveals.

```css
/* CORRECT -- replays every time the class toggles */
.scroll-reveal[data-hidden="true"] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 650ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 650ms cubic-bezier(0.16, 1, 0.3, 1);
}
.scroll-reveal[data-hidden="true"].revealed {
  opacity: 1;
  transform: translateY(0);
}
```

The IntersectionObserver must both ADD and REMOVE the `revealed` class:
- Add `revealed` when the element enters the viewport
- Remove `revealed` when the element scrolls fully above the viewport (boundingClientRect.bottom < 0)

This ensures the element resets and re-animates next time it enters.

#### Framer Motion -- MANDATORY configuration

Framer Motion's `whileInView` with `viewport={{ once: true }}` is the most common cause of the "plays once then stops" bug. `once: true` tells Framer to disconnect the observer after the first trigger. It must NEVER be used.

```tsx
// WRONG -- once: true disconnects the observer after first play
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }} // BANNED
  transition={{ duration: 0.6 }}
/>

// CORRECT -- replays every time the element enters the viewport
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false, amount: 0.1 }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
/>
```

Rules for every Framer Motion scroll animation:
- `viewport={{ once: false }}` -- ALWAYS. Never `once: true`.
- `amount: 0.1` -- trigger when 10% of the element is visible, not at 50% (the default)
- `initial` must set the hidden state (opacity 0, y offset, scale, blur, etc.)
- `whileInView` must set the visible state
- When the element leaves the viewport Framer automatically resets to `initial` -- this is the replay mechanism

#### Framer Motion with useInView hook -- MANDATORY configuration

If using the `useInView` hook instead of `whileInView`, the `once` option must also be `false`:

```tsx
// WRONG
const isInView = useInView(ref, { once: true })

// CORRECT
const isInView = useInView(ref, { once: false, amount: 0.1 })
```

#### GSAP ScrollTrigger

GSAP ScrollTrigger replays by default when `toggleActions` includes both forward and reverse actions. The most common broken config only specifies `play`:

```javascript
// WRONG -- only plays forward, never reverses
ScrollTrigger.create({
  trigger: el,
  toggleActions: 'play none none none',
})

// CORRECT -- plays when entering, reverses when leaving
ScrollTrigger.create({
  trigger: el,
  toggleActions: 'play none none reverse',
  // or: 'restart none none reset' to restart from scratch each time
})
```

#### AOS (Animate On Scroll)

```javascript
// WRONG -- plays once only
AOS.init({ once: true })

// CORRECT -- replays every time
AOS.init({ once: false })
```

### Enforcement Checklist (Run Before Finalising Any Animation Code)

Before submitting any code or spec that includes scroll-triggered animations, verify every single item:

- [ ] No CSS keyframe animation uses `animation-fill-mode: forwards` or `both` for scroll-triggered elements
- [ ] All scroll-reveal CSS uses transitions, not keyframes
- [ ] IntersectionObserver removes the revealed class when elements scroll above the viewport
- [ ] No Framer Motion component has `viewport={{ once: true }}` -- ZERO exceptions
- [ ] All Framer Motion `whileInView` uses `viewport={{ once: false, amount: 0.1 }}`
- [ ] All `useInView` hooks use `{ once: false }`
- [ ] GSAP toggleActions includes a reverse or reset action
- [ ] AOS is initialised with `once: false`
- [ ] The animation has been mentally simulated: scroll down (fires), scroll up past element (resets), scroll down again (fires again) -- this flow must work

If ANY item fails this checklist, fix it before the output is finalised. Do not ask the user to accept broken animation behaviour.

---


---

## §0: Brief Inference (Run Before Every Task)

Before touching any gate, dial, code or spec, read the brief and extract four things.

**Page kind** — landing page (SaaS / consumer / agency / event), portfolio (dev / designer / studio), app interior (dashboard / marketplace / tool), sign-up or onboarding flow, or redesign (preserve vs overhaul). If the brief does not name it, infer it from context.

**Vibe words** — note every adjective the user wrote: "minimalist", "calm", "editorial", "premium", "aggressive", "playful", "brutalist", "glassy", "Awwwards", "Linear-style". These are the loudest signals in the brief.

**Audience and category expectations** — who uses this and what design standard does the category already set? A fintech dashboard has different expectations from a gaming landing page.

**Constraints** — does the user mention a framework, a library, a brand kit, an existing component, or a specific screen size target?

After reading the above, declare a single one-line design read before any gate or code. Example: "This is a premium SaaS landing page with a calm editorial direction, low motion, and high information density." Write this out loud. Do not internalise it. This prevents you from defaulting to a generic aesthetic when the brief has a clear direction.

### Three Design Dials

After the design read, tune these three dials and declare the values before Gate 1.

**DESIGN_VARIANCE** (1-10): How asymmetric and artsy vs. structured the layout should be. Higher values mean bolder composition, non-repeating section anchors, and deliberate layout surprises. Lower values mean clean grids, consistent spacing, and predictable structure.

**MOTION_INTENSITY** (1-10): Animation depth. Lower: hover states only. Mid: scroll reveals and hero entrances. Higher: scroll-driven sticky stacks, magnetic elements, GSAP horizontal pans, cursor parallax, character animations.

**VISUAL_DENSITY** (1-10): Information per viewport. Lower: spacious gallery-like layouts with generous whitespace. Higher: dense dashboards, data tables, metric-heavy product UIs.

| Signal in brief | DESIGN_VARIANCE | MOTION_INTENSITY | VISUAL_DENSITY |
|---|---|---|---|
| "minimalist", "clean", "calm" | 3-4 | 2-3 | 3-4 |
| "premium", "editorial", "Linear-style" | 4-6 | 3-5 | 4-6 |
| "bold", "aggressive", "brutalist" | 7-9 | 5-7 | 6-8 |
| "cinematic", "immersive", "Awwwards" | 7-9 | 7-9 | 3-5 |
| "playful", "consumer", "lifestyle" | 6-8 | 5-7 | 4-6 |
| "dashboard", "data", "dense" | 3-5 | 1-2 | 8-10 |
| No strong signals | 5 | 4 | 5 |

Declare the tuned dials before Gate 1: "DESIGN_VARIANCE: 7 / MOTION_INTENSITY: 6 / VISUAL_DENSITY: 4". Then proceed to the Gate system.

## Step 1: Design Thinking Before Any Code

Before writing a single line of code understand the context fully and commit to a BOLD aesthetic direction.

Use the user's request to understand these dimensions (do NOT answer these silently — they feed into the Gate questions in Step 2D which you MUST ask the user):
- **Purpose**: What problem does this interface solve and who uses it
- **Tone**: What emotion should it create: trust, energy, calm, premium, bold, playful
- **Primary action**: What is the primary action on every screen and is it visually obvious
- **Constraints**: Technical requirements (framework, performance, accessibility)
- **Differentiation**: What makes this UNFORGETTABLE? What is the one thing someone will remember about this interface

The answers determine every decision that follows. Choose a direction and execute it with full commitment. Bold maximalism and refined minimalism both work. The key is intentionality not intensity. A half-committed aesthetic looks worse than no aesthetic at all.

**After understanding the context, proceed to the Gate system in Step 2D. Do NOT skip to code.**

---

## Step 2: Aesthetic Direction

### Tone Options

Pick one extreme and go all the way. These are starting points not limits. Invent new ones that fit the project:

- Dark editorial: deep backgrounds, sharp contrast, editorial serif typography. For premium or tech-forward products
- Warm minimal: off-white tones, serif display fonts, generous spacing. For lifestyle or wellness products
- Bold brutalist: heavy weight typography, stark contrast, flat colour blocks. For disruptive or high-energy products
- Refined glass: frosted panels, light blur, subtle gradients. For modern SaaS dashboards
- Organic warmth: muted earth tones, rounded components, soft shadows. For community or creator tools
- Retro-futuristic: neon accents, scanline textures, monospace type, CRT-style glow. For gaming or crypto products
- Art deco geometric: sharp angles, gold accents, symmetrical layouts, decorative borders. For luxury or fashion brands
- Playful toy-like: bright primaries, bouncy animations, rounded everything, oversized elements. For children or consumer apps
- Industrial utilitarian: exposed grid systems, monochrome palettes, functional typography, raw edges. For dev tools or data products
- Soft pastel: muted candy colours, gentle shadows, rounded cards, light backgrounds. For wellness or lifestyle apps
- Cinematic motion: full-screen video backgrounds, liquid glass UI, dramatic serif typography, staggered entrance animations. For premium launches, creative portfolios, Web3 projects and high-impact landing pages. See Step 3B for full implementation
- Bento grid operational: asymmetric modular card layouts, single-pixel borders, mathematically generated CSS noise textures, stark data nodes, no heavy shadows. For SaaS dashboards, data products and operational tools that need clarity without corporate blandness. See §2E for layout rules
- Kinetic editorial: viewport-scaled display type as the primary visual, scroll-driven weight and size shifts, neo-serif or high-contrast monospace as the hero element, minimal imagery. For editorial, media, studio and agency sites where the copy IS the design
- Retrofuturist warm: Y2K optimism, glossy aqua gradients, bubble-like rounded shapes, lens flare accents, bright clean digitalism. Distinct from dark neon retro-futuristic. For consumer apps, lifestyle tech and brands targeting nostalgic younger audiences
- Neumorphic tactile: soft extruded shadows creating raised or inset surfaces, subtle inner gradients, no hard borders, backgrounds and elements share the same hue family. For fintech, productivity apps and any interface that needs to feel physically touchable and refined

No design should look the same as the last. Vary between light and dark themes, different fonts, different aesthetics across every project. NEVER converge on the same choices repeatedly.

### Typography Rules

Never use Inter, Roboto, Arial, Space Grotesk or system fonts as the primary display font. These are the most overused AI-generated font choices and immediately signal generic output. Choose fonts that are beautiful, unique and characterful. Pair a distinctive display font with a refined body font. Every project should use a different pairing.

```css
/* Example pairing for dark editorial products */
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'DM Serif Display', serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --text-hero: clamp(2.5rem, 6vw, 5rem);
}
```

### Color Rules

Use CSS variables for every color. Never hardcode hex values in component files.

```css
:root {
  --bg-primary:     #0a0a0a;
  --bg-secondary:   #111111;
  --bg-surface:     #1a1a1a;
  --bg-elevated:    #222222;
  --accent:         #f59e0b;
  --accent-hover:   #fbbf24;
  --accent-glow:    rgba(245, 158, 11, 0.15);
  --text-primary:   #f0f0f0;
  --text-secondary: #a3a3a3;
  --text-muted:     #525252;
  --border-subtle:  rgba(255, 255, 255, 0.05);
  --border-default: rgba(255, 255, 255, 0.09);
  --success: #22c55e;
  --error:   #ef4444;
}
```

Never use pure black #000000 or pure white #ffffff. Use near-blacks and off-whites.

### Backgrounds and Visual Details

Create atmosphere and depth rather than defaulting to solid colours. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors and grain overlays. A strong background treatment can define the entire personality of a page.

**Match implementation complexity to the aesthetic vision.** Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography and subtle details. Elegance comes from executing the vision well, not from adding more.

NEVER use generic AI-generated aesthetics: overused font families, cliched colour schemes (particularly purple gradients on white backgrounds), predictable layouts and cookie-cutter design that lacks context-specific character. Interpret creatively and make unexpected choices that feel genuinely designed for the context.

The AI building this interface is capable of extraordinary creative work. Do not hold back. Show what can truly be created when thinking outside the box and committing fully to a distinctive vision. Half-committed aesthetics look worse than no aesthetics at all.

---

## Step 2A: Curated Design Palettes

Instead of improvising colours and fonts for each project, pick one of these complete palettes and apply it everywhere. Each palette is tied to an aesthetic direction from the Gate 1 options. The AI presents the matching palette during Gates 4 and 5.

### Palette 1: Midnight Luxe (Dark Editorial)

For premium fintech, Web3, creative agencies, luxury products.

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

:root {
  --font-display: 'DM Serif Display', serif;
  --font-body: 'DM Sans', sans-serif;

  --bg-primary:     #0a0a0f;
  --bg-secondary:   #111118;
  --bg-surface:     #1a1a24;
  --bg-elevated:    #22222e;
  --accent:         #d4a853;
  --accent-hover:   #e0be78;
  --accent-glow:    rgba(212, 168, 83, 0.15);
  --text-primary:   #f0efe8;
  --text-secondary: #a3a098;
  --text-muted:     #525050;
  --border-subtle:  rgba(255, 255, 255, 0.05);
  --border-default: rgba(255, 255, 255, 0.09);
  --success:        #22c55e;
  --error:          #ef4444;

  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;
  --radius-xl: 24px; --radius-2xl: 40px;
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.3);
  --shadow-md:  0 8px 24px rgba(0,0,0,0.4);
  --shadow-lg:  0 20px 60px rgba(0,0,0,0.5);
  --duration-fast: 150ms; --duration-normal: 300ms; --duration-slow: 600ms;
}
```

### Palette 2: Arctic Glass (Light Glassmorphism)

For SaaS products, DeFi dashboards, modern product pages.

```css
@import url('https://fonts.googleapis.com/css2?family=Satoshi:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Satoshi', sans-serif;
  --font-body: 'Inter', sans-serif;

  --bg-primary:     #f0f0f0;
  --bg-secondary:   #e8e8e8;
  --bg-surface:     rgba(255, 255, 255, 0.6);
  --bg-elevated:    rgba(255, 255, 255, 0.8);
  --accent:         rgba(30, 50, 90, 0.85);
  --accent-hover:   rgba(30, 50, 90, 1);
  --accent-glow:    rgba(30, 50, 90, 0.1);
  --text-primary:   #1e1e2e;
  --text-secondary: #5e6470;
  --text-muted:     rgba(30, 50, 90, 0.4);
  --border-subtle:  rgba(255, 255, 255, 0.2);
  --border-default: rgba(255, 255, 255, 0.4);
  --success:        #16a34a;
  --error:          #dc2626;

  --radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 20px;
  --radius-xl: 32px; --radius-2xl: 48px;
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg:  0 12px 40px rgba(0,0,0,0.1);
  --duration-fast: 150ms; --duration-normal: 300ms; --duration-slow: 600ms;
}
```

### Palette 3: Ember Studio (Dark Creative Agency)

For creative agencies, studios, portfolios, bold brands.

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Playfair Display', serif;
  --font-body: 'Outfit', sans-serif;

  --bg-primary:     #0c0c0c;
  --bg-secondary:   #141414;
  --bg-surface:     #1c1c1c;
  --bg-elevated:    #242424;
  --accent:         #f4845f;
  --accent-hover:   #f79b7f;
  --accent-glow:    rgba(244, 132, 95, 0.15);
  --text-primary:   #f5f0eb;
  --text-secondary: #b0a99e;
  --text-muted:     #5a5550;
  --border-subtle:  rgba(255, 255, 255, 0.04);
  --border-default: rgba(255, 255, 255, 0.08);
  --success:        #4ade80;
  --error:          #f87171;

  --radius-sm: 4px;  --radius-md: 8px;   --radius-lg: 16px;
  --radius-xl: 24px; --radius-2xl: 40px;
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.4);
  --shadow-md:  0 8px 32px rgba(0,0,0,0.5);
  --shadow-lg:  0 24px 64px rgba(0,0,0,0.6);
  --duration-fast: 120ms; --duration-normal: 250ms; --duration-slow: 500ms;
}
```

### Palette 4: Forest Minimal (Warm Organic)

For wellness, lifestyle, community products, sustainability brands.

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Instrument Serif', serif;
  --font-body: 'Barlow', sans-serif;

  --bg-primary:     #faf8f4;
  --bg-secondary:   #f1efe8;
  --bg-surface:     #ffffff;
  --bg-elevated:    #ffffff;
  --accent:         #1c2e1e;
  --accent-hover:   #2a4530;
  --accent-glow:    rgba(28, 46, 30, 0.08);
  --text-primary:   #1c2e1e;
  --text-secondary: #5a635a;
  --text-muted:     #738273;
  --border-subtle:  #f1f3f1;
  --border-default: #e0e4e0;
  --success:        #16a34a;
  --error:          #dc2626;

  --radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 20px;
  --radius-xl: 28px; --radius-2xl: 9999px;
  --shadow-sm:  0 1px 2px rgba(28,46,30,0.04);
  --shadow-md:  0 4px 12px rgba(28,46,30,0.06);
  --shadow-lg:  0 12px 32px rgba(28,46,30,0.08);
  --duration-fast: 150ms; --duration-normal: 350ms; --duration-slow: 700ms;
}
```

### Palette 5: Neon Terminal (Retro-Futuristic)

For gaming, crypto, entertainment, developer-facing products with personality.

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Space Mono', monospace;
  --font-body: 'Inter', sans-serif;

  --bg-primary:     #0a0a0a;
  --bg-secondary:   #0f0f0f;
  --bg-surface:     #151515;
  --bg-elevated:    #1a1a1a;
  --accent:         #00f0ff;
  --accent-hover:   #33f5ff;
  --accent-glow:    rgba(0, 240, 255, 0.12);
  --text-primary:   #e0e0e0;
  --text-secondary: #8a8a8a;
  --text-muted:     #4a4a4a;
  --border-subtle:  rgba(0, 240, 255, 0.06);
  --border-default: rgba(0, 240, 255, 0.12);
  --success:        #00ff88;
  --error:          #ff3366;

  --radius-sm: 2px;  --radius-md: 4px;   --radius-lg: 8px;
  --radius-xl: 12px; --radius-2xl: 16px;
  --shadow-sm:  0 0 8px rgba(0,240,255,0.05);
  --shadow-md:  0 0 20px rgba(0,240,255,0.08);
  --shadow-lg:  0 0 40px rgba(0,240,255,0.12);
  --duration-fast: 100ms; --duration-normal: 200ms; --duration-slow: 400ms;
}
```

### Palette 6: Rose Atelier (Luxury/Fashion)

For luxury brands, fashion, beauty, high-end lifestyle.

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Libre+Franklin:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Libre Franklin', sans-serif;

  --bg-primary:     #faf5f2;
  --bg-secondary:   #f2ece8;
  --bg-surface:     #ffffff;
  --bg-elevated:    #ffffff;
  --accent:         #c4858a;
  --accent-hover:   #d49a9e;
  --accent-glow:    rgba(196, 133, 138, 0.1);
  --text-primary:   #2a2024;
  --text-secondary: #6b5a60;
  --text-muted:     #9a8a90;
  --border-subtle:  rgba(42, 32, 36, 0.04);
  --border-default: rgba(42, 32, 36, 0.08);
  --success:        #6b8f71;
  --error:          #c45858;

  --radius-sm: 4px;  --radius-md: 8px;   --radius-lg: 16px;
  --radius-xl: 24px; --radius-2xl: 40px;
  --shadow-sm:  0 1px 3px rgba(42,32,36,0.04);
  --shadow-md:  0 4px 16px rgba(42,32,36,0.06);
  --shadow-lg:  0 16px 48px rgba(42,32,36,0.08);
  --duration-fast: 150ms; --duration-normal: 350ms; --duration-slow: 700ms;
}
```

---

## Step 2B: Navigation Layout Rules

The default AI nav pattern (logo far left, three links centred, action button far right) is BANNED. It is the most recognised AI-generated layout pattern and immediately signals low effort to anyone who has seen enough sites. Never produce this structure by default.

Before writing any nav, pick one pattern from the catalog below. Each pattern is grouped by behaviour. Choose based on the aesthetic direction confirmed in Gate 1.

---

### Category A: Floating and Pill-Based

**A1: Centred glass pill**
A single compact pill centred horizontally at the top of the viewport, detached from the page edge. Contains brand mark on the far left, three to five links in the centre, and one CTA button on the right — all inside the same floating container with `backdrop-filter: blur`. The pill is fixed and stays in view while scrolling. Matches: cinematic motion, light glassmorphism, dark editorial.

**A2: Scroll-morph pill**
Starts as a wide transparent bar flush with the top of the hero. As soon as the user scrolls past 80px, it collapses into a compact floating glass pill centred in the viewport via a CSS transition or Framer Motion layout animation. The pill variant shows only the logo mark and one CTA. The full links disappear or move into a drawer. The morph is the interaction that signals premium craft. Matches: cinematic motion, SaaS marketing pages, bento grid operational.

**A3: Floating bottom bar (mobile-first, web adaptation)**
Navigation lives at the bottom of the viewport rather than the top. Three to five icon-and-label pairs evenly distributed across a glass pill fixed to the bottom edge. On desktop, the same bar sits at the bottom of the hero section with a `position: fixed` override. Works when the hero demands the full top edge for cinematic impact and navigation should not compete. Matches: consumer apps, warm organic, kinetic editorial.

**A4: Dual-pill split nav**
Two separate pills: one on the far left with the brand name only, one on the far right with the links and CTA. Nothing across the centre. The empty centre is the design. Creates strong horizontal tension and feels architectural rather than functional. Matches: bold brutalist, dark editorial, kinetic editorial.

---

### Category B: Scroll-Driven and Contextual

**B1: Scroll-progress nav**
A minimal top bar with no links visible. A thin `1px` progress line runs across the full width of the bar and fills left to right as the user scrolls. The section name or page title fades in next to the progress bar as the user enters each section. Links only appear on hover or when the user pauses. Matches: editorial, long-form article pages, portfolio case studies.

**B2: Sticky section indicator**
No traditional nav bar at all. A small vertical strip of dots or short lines is fixed to the right margin of the page. Each dot represents a section. The active dot glows or scales. Hovering a dot reveals a label. Clicking it smooth-scrolls to that section. Used by top-tier portfolios and long editorial pages. Matches: cinematic motion, portfolio, editorial.

**B3: Active link underline with scroll-highlight**
A minimal horizontal bar with the logo on the left and plain text links on the right. As the user scrolls, whichever section is in the viewport highlights its corresponding nav link with a sliding underline that moves between links via CSS `left` and `width` transitions on a shared `::after` pseudo-element. Zero JavaScript state needed. Matches: warm organic, light glassmorphism, SaaS product pages.

**B4: Disappear-on-scroll, reappear-on-up**
The nav is visible on load then slides fully off-screen upward after the user scrolls 100px down. When the user scrolls up even slightly, it slides back down. This maximises content space while keeping nav accessible. Used on Awwwards-level creative sites and editorial journals. Matches: bold brutalist, cinematic motion, kinetic editorial.

---

### Category C: Typographic and Editorial

**C1: Full-width editorial strip**
A full-width bar with heavy monospaced or editorial serif type. Date or issue number flush left. A scrolling ticker (`marquee` or CSS animation) running through the centre with the brand tagline, current project name or live status. A single action link flush right. No logo mark. Type IS the brand. Matches: kinetic editorial, top editorial strip, bold brutalist.

**C2: Oversized wordmark nav**
The brand name renders as a large display headline (40–60px) in the top-left corner. No other links in the nav. Navigation links appear in the top-right as a vertical stack of small uppercase text, like a magazine contents panel. Clicking the wordmark scrolls to top. Matches: art deco geometric, rose atelier palette, luxury fashion.

**C3: Page-number corner nav**
Navigation is replaced by a page counter in the bottom-right corner: "03 / 07" rendered in small monospace. Clicking advances to the next section. Arrow keys also work. Scrolling moves through sections one at a time, snapping between them. This pattern works exclusively for scroll-snapped single-page sites. Matches: cinematic portfolio, retro-futuristic, bold brutalist.

**C4: Ticker announcement nav**
A slim announcement strip at the very top (background: `--accent`, text: contrasting colour) containing scrolling ticker copy. Below it sits a minimal nav with no more than two links. The announcement strip draws the eye and frames a key message above the primary nav. Can be dismissed. Matches: SaaS launch pages, event sites, product campaigns.

---

### Category D: Immersive and Overlay

**D1: Full-screen typographic overlay**
A single small trigger (wordmark or hamburger) sits in the top corner. Clicking it triggers an `AnimatePresence` full-screen overlay that covers the entire viewport with the brand's dark or accent background colour. Links render as large display typography (60–100px) stacked vertically. Each link has a hover state that reveals an image behind it. On exit, the overlay folds back. Used by luxury agencies and portfolios. Matches: cinematic motion, dark editorial, warm organic.

**D2: Drag-open side drawer**
No hamburger icon. The entire left or right edge of the viewport is a hidden drag zone. Dragging from the edge (or clicking a thin visible strip) slides out a full-height side panel containing navigation. The panel uses a glass or dark surface treatment. This interaction is tactile and surprising because there is no visible trigger. Matches: bold brutalist, bento grid operational, retro-futuristic.

**D3: Context mega menu**
Links in the nav bar trigger a full-width panel that drops down below the bar. The panel is not a traditional link list. It is a curated layout: a large featured project image on the left, categorised links in the centre, and a live stat or recent item on the right. The panel uses the page's glass or surface treatment. Closes on Escape or outside click. Matches: SaaS products with deep feature sets, creative agencies, dark editorial.

**D4: Cursor-following nav dot**
No visible nav bar at all on load. A single small dot (12–16px, accent colour) tracks the cursor smoothly across the viewport at a slight lag. Clicking the dot opens a compact radial menu radiating five to six links outward from the cursor position. Each link is a short label. Closing any link or pressing Escape collapses the radial back into the dot. Extreme interaction reserved for experimental portfolios and creative demos. Matches: cinematic motion, experimental.

---

### Category E: Minimal and Invisible

**E1: Ghost top strip**
A fully transparent bar fixed to the top. Logo mark only, flush left. No links visible on load. On hover the nav area reveals links fading in via opacity. On desktop the user rarely needs to navigate away so links are contextually hidden. On mobile a compact slide-out panel handles navigation. Matches: full-bleed cinematic hero, luxury fashion, premium portfolio.

**E2: Footer-anchored nav with scroll cue**
No fixed top nav. All navigation lives in the footer. The hero carries a single scroll cue (small animated chevron or "scroll" label at the bottom of the viewport). Each section is self-contained with inline contextual CTAs. The user never needs a nav bar mid-scroll because sections are individually purposeful. Matches: single-product launch pages, portfolios, event sites.

---

### Scroll Behaviour Rules

Regardless of which pattern is chosen, apply these rules:

- Never use `background: white` or `background: black` on a scrolled nav. Use `--bg-surface` with `backdrop-filter: blur(16px)` so the nav reads as a layer above content, not a painted block
- Do not add a box shadow to the nav on scroll as a default. It reads as heavy and dated. Use a `border-bottom: 1px solid var(--border-subtle)` instead if separation is needed
- Active link states must be visually distinct. A colour change alone is not enough. Add an underline, a dot, a background pill or a weight shift to make the active state immediately legible

---

### Aesthetic-to-Nav Quick Reference

| Gate 1 Aesthetic | Primary recommendation | Alternative |
|---|---|---|
| Dark editorial | D1: Full-screen typographic overlay | A1: Centred glass pill |
| Light glassmorphism | A1: Centred glass pill | B3: Active link underline |
| Bold brutalist | A4: Dual-pill split nav | C3: Page-number corner nav |
| Warm organic | E1: Ghost top strip | B3: Active link underline |
| Retro-futuristic | D2: Drag-open side drawer | C3: Page-number corner nav |
| Cinematic motion | A1: Centred glass pill | D1: Full-screen typographic overlay |
| Bento grid operational | A2: Scroll-morph pill | B1: Scroll-progress nav |
| Kinetic editorial | C1: Full-width editorial strip | A4: Dual-pill split nav |

If the user does not specify a nav style, use this table to pick the recommendation for the confirmed aesthetic. Never default to the banned pattern. If genuinely uncertain, ask the user before building.

---

## Step 2C: Animated Background Rules (Ask Before Assuming)

Before building any background animation determine whether the user wants one and what kind. If the brief does not specify ask explicitly with these options:

- **Clearly visible movement**: particles, flowing waves, morphing gradients, aurora pulses, orbiting elements. Should be impossible to miss on first glance
- **Subtle ambient animation**: slow breathing gradients, barely-moving grain, faint parallax. Feels alive but does not distract
- **Static but strong**: no animation at all. Instead achieve depth and atmosphere through layered textures, geometric patterns, halftone effects, strong colour blocking or grain overlays. Can be more visually striking than animation when executed well

If a canvas particle system is used particles and connection lines must be clearly visible against the background. Faint dots that read as static noise are a failure state. Either make them visible or remove them. For SVG animations animate attributes that produce obvious movement: morphing paths, orbiting elements, pulsing sizes, colour transitions. Subtle rotation alone is not enough.

When an animated SVG scene is used as a hero background it replaces any separate canvas animation. Do not layer both unless the effect specifically requires it.

---

## Step 2D: Hard Gate Decision System (Mandatory Before Code)

Before writing any code the AI must walk the user through every gate below. Each gate requires the AI to present options, state a recommendation and then STOP AND WAIT for the user to confirm or choose differently. Do not proceed to the next gate until the current one is answered. Do not internalise these decisions. Ask them out loud.

### GATE 1: Aesthetic Direction

Present these options (or let the user describe their own):

1. **Dark editorial**: deep backgrounds, serif display type, sharp contrast, gold or warm accents. For premium fintech, Web3, creative agencies
2. **Light glassmorphism**: off-white backgrounds, rounded containers, muted text, frosted glass effects. For SaaS, DeFi, modern product pages
3. **Bold brutalist**: heavy weight typography, stark contrast, flat colour blocks, raw edges. For disruptive brands, developer tools
4. **Warm organic**: earth tones, rounded everything, soft shadows, generous spacing. For wellness, community, lifestyle products
5. **Retro-futuristic**: neon accents, monospace type, CRT glow, scanline textures. For gaming, crypto, entertainment
6. **Cinematic motion**: full-screen video backgrounds, liquid glass UI, dramatic serif typography. For premium launches, portfolios, Web3, creative projects
7. **Bento grid operational**: asymmetric card modules, single-pixel borders, CSS noise textures, stark typographic data nodes, zero decorative shadow. For SaaS dashboards, analytics tools and operational products. See §2E
8. **Kinetic editorial**: large viewport-scaled type as the sole hero visual, scroll-driven weight and size transitions, neo-serif or high-contrast monospace display. For editorial, media, studio and agency sites

State which one you recommend based on the project context. STOP AND WAIT for the user to confirm.

### GATE 2: Navigation Layout

Present the approved nav patterns from Step 2B. Recommend one based on the aesthetic chosen in Gate 1. For cinematic motion aesthetic recommend "ghost nav over full-bleed hero" or "minimal two-item top bar". STOP AND WAIT.

### GATE 3: Background Treatment

Present these four options:

1. **Animated video background** (cinematic, premium. Requires the video asset workflow in Step 12. Recommended for marketing pages and landing pages)
2. **Premium static hero image** (high-quality photograph or AI-generated image with overlay treatment. No motion but visually striking. Recommended when video is not feasible but a plain dark background is too flat. See Technique 8 in Step 3B)
3. **Coded animated background** (Waves, GrainGradient, orbs. Lightweight, no external assets needed. Use as fallback if video and image are not feasible)
4. **Static but atmospheric** (textures, gradients, grain overlays. No animation, no image. Recommended for dashboards and app interfaces)

For marketing pages and landing pages explicitly recommend option 1 or 2 depending on whether the user can source or generate a video. For dashboards and internal tools recommend option 4. STOP AND WAIT.

### GATE 4: Font Pairing

Based on the aesthetic chosen in Gate 1 present 2-3 specific font pairings from the Curated Design Palettes section below. Include the Google Fonts import URL for each option. STOP AND WAIT.

### GATE 5: Colour Palette

Present the matching curated palette from the Curated Design Palettes section. Show the user the exact CSS variable block. STOP AND WAIT.

### GATE 6: Hero Structure

Based on all previous decisions propose the hero layout and content hierarchy. Reference the closest Golden Reference Composition as a quality benchmark (e.g. "I will follow the Cinematic Video Hero reference for quality level"). STOP AND WAIT.

### GATE 7: Page Sections

Propose the full section order for the page using the appropriate layout from Step 6 (standard or cinematic). STOP AND WAIT.

**Combining gates:** Gates 4 and 5 may be combined if they logically belong to the same palette choice. Gates 6 and 7 may be combined if the user seems decisive. But gates 1, 2 and 3 must ALWAYS be asked separately. The minimum number of stops is 4 (gates 1, 2, 3, then combined 4-7).

After all gates pass write: **"All design decisions confirmed. Beginning implementation."** Only then may code be written.

---

## §2E: 2026 Aesthetic Trend Reference

This section documents implementation patterns for the four new 2026-specific aesthetic directions added to Gate 1. It also covers three cross-cutting patterns (gamified UI, neumorphism, retrofuturism) that apply inside any aesthetic when the brief calls for them.

### Bento Grid Operational

The Bento Grid is the dominant structural layout of 2026. Content is compartmentalised into asymmetric, card-like modules that sit on a visible or implied grid. Each cell has a distinct size and purpose. The composition reads like an operational map rather than a marketing page.

**Core rules:**

- Use CSS Grid with named areas. Never use Flexbox as the top-level layout container for a Bento composition
- Cells are asymmetric by design. A two-column section might have one cell at `2fr` and one at `1fr`, not equal halves
- Borders are single-pixel and use the `--border-default` variable. No box shadows on card surfaces
- Background texture comes from a CSS noise pattern (mathematically generated, no external asset) rather than gradients or images
- Typography inside cells is stark: large mono or sans-serif numbers for metrics, small uppercase labels, tight leading
- Hover state lifts the cell with a subtle `translateY(-2px)` and a border-colour shift to `--accent`. No scale transforms

```css
/* Bento grid container */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto;
  gap: 1px;
  background: var(--border-default); /* gap becomes the grid line */
}

/* Each cell covers the gap-as-border with its own background */
.bento-cell {
  background: var(--bg-surface);
  padding: 1.5rem;
  transition: background 200ms ease, transform 200ms ease;
}
.bento-cell:hover {
  background: var(--bg-elevated);
  transform: translateY(-2px);
}

/* CSS noise texture overlay (no external file) */
.bento-cell::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}
```

**Sizing patterns for common Bento compositions:**

| Cell purpose | Grid column span | Grid row span |
|---|---|---|
| Primary metric hero | 8 of 12 | 2 rows |
| Secondary stat | 4 of 12 | 1 row |
| Chart or data viz | 6 of 12 | 3 rows |
| Activity feed | 4 of 12 | 3 rows |
| Action CTA | 2 of 12 | 1 row |

Never make all cells the same size. The visual interest comes entirely from the asymmetry.

---

### Kinetic Editorial Typography

Kinetic typography replaces heavy hero imagery. The headline itself is the visual, scaled to fill the viewport and animated as the user scrolls or the page loads. This approach suits editorial sites, studios, agencies and media brands where the writing voice is the product.

**Core rules:**

- Use `clamp()` for all kinetic type sizes so they scale fluidly. A hero headline should span `clamp(4rem, 12vw, 10rem)` or wider
- Variable fonts (those with a weight axis) enable scroll-driven weight shifts without JavaScript. Use `font-variation-settings: 'wght' X` animated via a scroll-linked CSS custom property
- Pair one neo-serif display font with one high-contrast monospace. The serif carries the emotional weight; the monospace carries labels, counts and metadata
- Avoid centred hero headlines at large sizes. Left-aligned or edge-bleeding type reads as more editorial and intentional
- Line height at hero scale should be `0.9` to `1.0`, not the default `1.5`. Tight leading at large sizes is the typographic signal of editorial work

**Scroll-driven weight shift (native CSS, no JS):**

```css
@supports (animation-timeline: scroll()) {
  @keyframes weightShift {
    from { font-variation-settings: 'wght' 900; }
    to   { font-variation-settings: 'wght' 200; }
  }

  .kinetic-headline {
    animation: weightShift linear both;
    animation-timeline: scroll();
    animation-range: 0vh 60vh;
  }
}
```

**Viewport-filling hero headline:**

```css
.editorial-hero {
  font-size: clamp(5rem, 14vw, 12rem);
  line-height: 0.92;
  letter-spacing: -0.04em;
  font-weight: 900;
  text-transform: uppercase;
  max-width: 100%;
  overflow: hidden;
}
```

For browsers without `animation-timeline` support, fall back to the existing GSAP or IntersectionObserver scroll reveal patterns in Step 3.

---

### Scroll-Driven CSS Parallax (Native, No JS)

Modern browsers support scroll-driven animations natively via `animation-timeline: scroll()` and `animation-timeline: view()`. These replace heavy JavaScript scroll listeners for parallax and reveal effects on browsers that support them. Always include a JS fallback for unsupported browsers.

```css
/* Parallax depth layer: moves at 30% of scroll speed */
@supports (animation-timeline: scroll()) {
  @keyframes parallaxDrift {
    from { transform: translateY(0); }
    to   { transform: translateY(-30%); }
  }

  .parallax-layer {
    animation: parallaxDrift linear both;
    animation-timeline: scroll();
    will-change: transform;
  }
}

/* Reveal on entry using view() timeline */
@supports (animation-timeline: view()) {
  @keyframes revealUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .scroll-reveal-native {
    animation: revealUp ease both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }
}
```

Use `@supports` guards on every native scroll animation block. The IntersectionObserver patterns in Step 3 remain the primary implementation for cross-browser reliability. Native scroll-driven animations are a progressive enhancement layer.

---

### Gamified UI Patterns

Gamification wires reward mechanics directly into the UI flow: progress tracking, streaks, badges, leaderboards and micro-rewards woven into core interactions. When the brief describes an app that wants to encourage habit formation, return visits or task completion, apply at least two of the following patterns.

**Progress bar with milestone markers:**

```css
.progress-track {
  height: 6px;
  background: var(--bg-elevated);
  border-radius: 999px;
  position: relative;
  overflow: visible;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-hover));
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}
/* Milestone dot at a specific percentage */
.progress-fill::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 12px var(--accent-glow);
}
```

**Streak counter with pulse animation:**

```css
@keyframes streakPulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--accent-glow); }
  50%       { box-shadow: 0 0 0 8px transparent; }
}
.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: var(--accent-glow);
  border: 1px solid var(--accent);
  animation: streakPulse 2.5s ease-in-out infinite;
  font-variant-numeric: tabular-nums;
}
```

**Confetti burst on task completion (vanilla JS):**

```javascript
/**
 * Fires a brief confetti burst when a milestone is reached.
 * Uses the canvas-confetti library (npm install canvas-confetti).
 * @param {number} x - Horizontal origin as a 0-1 fraction of viewport width
 * @param {number} y - Vertical origin as a 0-1 fraction of viewport height
 */
function fireMilestoneBurst(x = 0.5, y = 0.6) {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { x, y },
    colors: ['#f59e0b', '#fbbf24', '#ffffff'],
    disableForReducedMotion: true,
  })
}
```

Apply gamification sparingly. Progress bars and streaks suit any habit-based app. Confetti and leaderboards only suit products where competition or celebration is a core part of the value proposition.

---

### Neumorphism

Neumorphism uses soft, directional box shadows and subtle inner gradients to make elements appear extruded from or pressed into the background. The defining constraint is that the surface and its parent share the same hue family; only lightness differs. This makes neumorphism inherently a single-palette technique and unsuitable for dark-on-light or high-contrast aesthetics.

**When to use:** Fintech cards, productivity dashboards, audio controls, toggle switches and any interface that benefits from a physically tactile feel. Avoid on text-heavy pages where the shadow complexity competes with reading.

**Core shadow formula (light mode):**

```css
:root {
  --neu-bg: #e8eaed;
  --neu-light: #ffffff;
  --neu-dark: #c8cacf;
  --neu-radius: 16px;
}

/* Raised surface */
.neu-raised {
  background: var(--neu-bg);
  border-radius: var(--neu-radius);
  box-shadow:
    6px 6px 14px var(--neu-dark),
    -6px -6px 14px var(--neu-light);
}

/* Inset / pressed surface (active states) */
.neu-inset {
  background: var(--neu-bg);
  border-radius: var(--neu-radius);
  box-shadow:
    inset 4px 4px 10px var(--neu-dark),
    inset -4px -4px 10px var(--neu-light);
}

/* Transition between states on click */
.neu-button {
  transition: box-shadow 150ms ease;
}
.neu-button:active {
  box-shadow:
    inset 4px 4px 10px var(--neu-dark),
    inset -4px -4px 10px var(--neu-light);
}
```

**Accessibility warning:** Neumorphic contrast ratios are inherently low because the surface and its context share the same hue. Always verify WCAG AA contrast on all text inside neumorphic containers. Consider using an outline or accent colour on focus states since the shadow difference alone will not meet focus-visibility requirements.

---

### Retrofuturist Warm (Frutiger Aero / Y2K Optimism)

This direction is the light, optimistic counterpart to the dark neon retro-futuristic palette already in the skill. Where dark retro-futuristic leans into CRT dystopia, Frutiger Aero and Y2K warm lean into the clean, hopeful, bubble-glass aesthetic of early 2000s computing.

**Visual DNA:** Glossy aqua and sky-blue gradients, floating globes and orbs with lens flare, glass morphism with bright whites, rounded bubbly shapes, translucent panels, soft drop shadows.

**Palette direction:**

```css
:root {
  --fu-bg:       #e8f4f8;
  --fu-surface:  rgba(255, 255, 255, 0.7);
  --fu-accent:   #29a8d4;
  --fu-glow:     rgba(41, 168, 212, 0.2);
  --fu-aqua:     #7dd3ea;
  --fu-text:     #0d3a52;
  --fu-muted:    #5a8fa8;
}
```

**Glassy orb element:**

```css
.fu-orb {
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    rgba(255, 255, 255, 0.9) 0%,
    var(--fu-aqua) 40%,
    var(--fu-accent) 80%,
    rgba(41, 168, 212, 0.4) 100%
  );
  box-shadow:
    0 20px 60px rgba(41, 168, 212, 0.3),
    inset 0 -10px 30px rgba(255, 255, 255, 0.4),
    inset 10px 10px 20px rgba(255, 255, 255, 0.6);
  filter: blur(0.5px);
}
```

**Font direction:** Rounded sans-serif (Nunito, Poppins, Fredoka) paired with a thin, light-weight variant of the same family for body text. Never use sharp-edge sans-serifs (Helvetica, DIN) as they break the bubbly character.

---

## Step 3: Motion Graphics and Animation

Motion is the difference between an interface that feels alive and one that feels static. Every animation must have a reason: to direct attention, confirm an action, reveal content or express the product's personality.

**Important**: The patterns below are reference implementations, not rules. Use them when they fit the page. Marketing and landing pages benefit from hero entrances and scroll reveal. Dashboard pages do not need them. Each page decides which animations to use based on context.

### Core Principles

- Purposeful: every animation serves the user not the designer
- Proportional: small interactions get small animations, major transitions get expressive ones
- Consistent: the same type of action always animates the same way across the whole app
- Fast: 150-300ms for micro-interactions, 300-500ms for page-level transitions

### Page Load Sequence (Hero Entrance)

Use pure CSS animations for the hero section. This starts instantly on paint with no JS delay. Use `animation-fill-mode: both` so elements are hidden during their delay and visible after completion.

```css
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Staggered entrance for hero elements */
.hero-animate {
  opacity: 0;
  animation: heroFadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.hero-animate:nth-child(1) { animation-delay: 0ms; }
.hero-animate:nth-child(2) { animation-delay: 80ms; }
.hero-animate:nth-child(3) { animation-delay: 160ms; }

/* Hero headline words stagger individually */
.hero-word {
  display: inline-block;
  opacity: 0;
  animation: heroFadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
  /* Each word gets an inline animation-delay: 150 + (index * 50)ms */
}
```

For elements that need custom delays (subhead, CTA, review card), set `animation-delay` via inline style rather than nth-child.

### Scroll-Triggered Animations (Below-Fold Sections)

"Scroll reveal" is the **trigger mechanism** (IntersectionObserver fires when an element enters the viewport). The **animation effect** is a separate choice. Pick the effect that fits the content.

> **CRITICAL: use CSS transitions for scroll reveal, NOT CSS keyframe animations.** Keyframe animations play once and are consumed. Transitions re-play every time a class is added/removed. If you use `animation: fadeUp forwards` instead of a `transition`, sections will animate on first scroll then appear static forever after. Always use the transition pattern shown below.

> **CRITICAL (FRAMER MOTION): NEVER use `viewport={{ once: true }}` on any `whileInView` animation.** `once: true` disconnects the IntersectionObserver after the first trigger -- the animation will never replay when the user scrolls back down. Always use `viewport={{ once: false, amount: 0.1 }}`. See the Repeatable Scroll Animation Enforcement section at the top of this file for the full checklist covering all animation libraries.

**Available animation effects:**

| Effect | CSS Property | Best for |
|--------|-------------|----------|
| Fade up | `opacity` + `translateY` | General sections, text blocks |
| Fade in | `opacity` only | Images, cards, subtle reveals |
| Slide left | `translateX(-40px)` to `0` | Left-aligned content, timelines |
| Slide right | `translateX(40px)` to `0` | Right-aligned content, alternating rows |
| Scale up | `scale(0.9)` to `scale(1)` | Hero images, feature previews |
| Blur in | `blur(8px)` to `blur(0)` + `opacity` | Background images, decorative elements |
| Flip in | `rotateX(15deg)` to `rotateX(0)` | Cards, pricing panels |

**Implementation approach:**

Elements start **visible by default** so back-navigation and JS-disabled states always show content. On init, the script marks every element that is below the viewport as hidden via a `data-hidden` attribute. IntersectionObserver then reveals them as they enter the viewport. Using a `data-` attribute (not just a class) ensures the hidden state is applied before the browser paints, eliminating the layout-timing race that causes far-down sections to never animate.

```css
/* All scroll-reveal elements: visible by default */
.scroll-reveal,
.scroll-reveal-left,
.scroll-reveal-scale,
.scroll-reveal-blur {
  will-change: opacity, transform;
}

/* JS sets data-hidden="true" on elements below the viewport on init */
/* Transitions live here so they apply both on reveal AND on reset */
.scroll-reveal[data-hidden="true"] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 650ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 650ms cubic-bezier(0.16, 1, 0.3, 1);
}
.scroll-reveal[data-hidden="true"].revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Slide from left */
.scroll-reveal-left[data-hidden="true"] {
  opacity: 0;
  transform: translateX(-40px);
  transition: opacity 650ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 650ms cubic-bezier(0.16, 1, 0.3, 1);
}
.scroll-reveal-left[data-hidden="true"].revealed {
  opacity: 1;
  transform: translateX(0);
}

/* Scale up */
.scroll-reveal-scale[data-hidden="true"] {
  opacity: 0;
  transform: scale(0.92);
  transition: opacity 500ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}
.scroll-reveal-scale[data-hidden="true"].revealed {
  opacity: 1;
  transform: scale(1);
}

/* Blur in */
.scroll-reveal-blur[data-hidden="true"] {
  opacity: 0;
  filter: blur(10px);
  transition: opacity 600ms cubic-bezier(0.16, 1, 0.3, 1),
              filter 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
.scroll-reveal-blur[data-hidden="true"].revealed {
  opacity: 1;
  filter: blur(0px);
}
```

**Vanilla JS version (plain HTML/JS projects — use this unless the project is React):**

```javascript
// scrollReveal.js — call initScrollReveal() once after DOM is ready
function initScrollReveal() {
  const SELECTORS = '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-scale, .scroll-reveal-blur'
  const elements = Array.from(document.querySelectorAll(SELECTORS))

  if (!elements.length) return

  // Mark every element that starts below the fold as hidden.
  // Run after layout is complete so getBoundingClientRect() is accurate.
  elements.forEach((el) => {
    const rect = el.getBoundingClientRect()
    if (rect.top > window.innerHeight * 0.9) {
      el.setAttribute('data-hidden', 'true')
    }
  })

  // rootMargin pulls the trigger line 10% up from the bottom edge,
  // so elements animate into view before they hit the very bottom.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target.getAttribute('data-hidden') !== 'true') return
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
        } else {
          // Only reset if element has scrolled fully above the viewport.
          // This prevents a fast-scroll past an element from permanently
          // locking it in the revealed state without actually animating.
          if (entry.boundingClientRect.bottom < 0) {
            entry.target.classList.remove('revealed')
          }
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -8% 0px',
    }
  )

  elements.forEach((el) => observer.observe(el))

  // Optional: stagger children inside a section that is revealed
  // Add data-stagger to a parent and its direct children animate in sequence
  document.querySelectorAll('[data-stagger]').forEach((parent) => {
    Array.from(parent.children).forEach((child, i) => {
      ;(child as HTMLElement).style.transitionDelay = `${i * 80}ms`
    })
  })

  return observer // return so callers can observer.disconnect() when needed
}

// Call after DOMContentLoaded. If fonts/images affect layout, call after window load.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollReveal)
} else {
  initScrollReveal()
}
```

**React hook version:**

```typescript
// hooks/useScrollReveal.ts
import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const SELECTORS = '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-scale, .scroll-reveal-blur'

    // Run after the browser has painted so all element positions are final.
    // This prevents the layout-timing bug where far-down sections never get
    // marked hidden because their rect.top was wrong at mount time.
    let observer: IntersectionObserver | null = null

    const setup = () => {
      const elements = Array.from(document.querySelectorAll(SELECTORS))
      if (!elements.length) return

      // Mark elements below the fold as hidden before observing them.
      // Must happen before observe() so the initial observer callback
      // does not immediately reveal elements that should be hidden.
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top > window.innerHeight * 0.9) {
          el.setAttribute('data-hidden', 'true')
        }
      })

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Only animate elements that were explicitly marked as hidden.
            // Elements already in view on load are never touched.
            if (entry.target.getAttribute('data-hidden') !== 'true') return
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed')
            } else {
              // Reset only when element scrolls fully above viewport
              // so fast-scrolling past a section doesn't lock it revealed.
              if (entry.boundingClientRect.bottom < 0) {
                entry.target.classList.remove('revealed')
              }
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -8% 0px',
        }
      )

      elements.forEach((el) => observer!.observe(el))
    }

    // Use requestAnimationFrame to defer until after the first paint,
    // then defer once more to let fonts and images finish shifting layout.
    const rafId = requestAnimationFrame(() => {
      const timeoutId = setTimeout(setup, 50)
      return () => clearTimeout(timeoutId)
    })

    return () => {
      cancelAnimationFrame(rafId)
      // Always disconnect the observer on unmount.
      // Failure to do this is the #1 cause of duplicate animations and
      // memory leaks in React apps with scroll-triggered effects.
      if (observer) {
        observer.disconnect()
        observer = null
      }
    }
  }, [])
}
```

**Usage in a React component:**

```tsx
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function Page() {
  useScrollReveal() // call once at the top level, covers all matching elements

  return (
    <main>
      <section className="scroll-reveal" data-stagger>
        <h2>Animated heading</h2>
        <p>Animated paragraph</p>
        <button>Animated button</button>
      </section>

      <section className="scroll-reveal-left">
        {/* slides in from the left */}
      </section>

      <section className="scroll-reveal-scale">
        {/* scales up */}
      </section>
    </main>
  )
}
```

Key design decisions:
- Elements start **visible** — if JS fails, content is always readable.
- `data-hidden` attribute (not a class) is set before `observe()` is called, so the observer's first callback never sees a race where an element should be hidden but isn't yet.
- `observer.disconnect()` is always called in cleanup — missing this is the most common cause of duplicate or stuck animations in React.
- `rootMargin: '0px 0px -8% 0px'` pulls the trigger point slightly above the bottom edge of the viewport, so elements animate into view cleanly rather than appearing to pop in at the very last pixel.
- The `setTimeout(setup, 50)` after the RAF gives fonts and images 50 ms to shift layout before measuring positions, preventing elements from being incorrectly measured as in-view.

### Tailwind Animation Config

Add to tailwind.config.js under extend:

```javascript
animation: {
  'fade-up':    'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  'fade-in':    'fadeIn 0.4s ease forwards',
  'scale-in':   'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  'shimmer':    'shimmer 1.8s linear infinite',
  'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
  'float':      'float 4s ease-in-out infinite',
  'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
},
keyframes: {
  fadeUp:    { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
  fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
  scaleIn:   { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
  shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
  pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
  float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
  glowPulse: { '0%, 100%': { boxShadow: '0 0 20px rgba(245,158,11,0.2)' }, '50%': { boxShadow: '0 0 40px rgba(245,158,11,0.5)' } },
},
```

### Motion Graphics Patterns

These are higher-level visual effects for hero sections, backgrounds and loading states.

Ambient background glow:
```tsx
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
    w-[700px] h-[500px] rounded-full
    bg-amber-500/10 blur-[140px] animate-pulse-soft" />
  <div className="absolute bottom-0 right-1/4
    w-[400px] h-[300px] rounded-full
    bg-amber-600/5 blur-[100px] animate-float" />
</div>
```

Noise grain texture:
```tsx
<div
  className="absolute inset-0 opacity-[0.035] pointer-events-none z-10"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
    backgroundSize: '128px 128px',
  }}
/>
```

Counter animation hook:
```typescript
// hooks/useCountUp.ts
import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const steps = 60
    const increment = target / steps
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, interval)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}
```

Video card hover lift:
```css
.video-card {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 200ms ease, border-color 200ms ease;
}
.video-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
}
```

Progress morphing button:
```tsx
<button
  className={`relative overflow-hidden h-12 rounded-xl font-semibold
    transition-all duration-500 w-full
    ${generating
      ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400 cursor-not-allowed'
      : 'bg-amber-500 text-black hover:bg-amber-400'
    }`}
>
  {generating ? (
    <>
      <div className="absolute left-0 top-0 h-full bg-amber-500/30 transition-all duration-[3000ms]"
        style={{ width: `${progress}%` }} />
      <span className="relative z-10">Generating... {progress}%</span>
    </>
  ) : 'Generate Video'}
</button>
```

---

## Step 3B: Animated & Cinematic Backgrounds

Animated backgrounds transform a static page into an immersive, premium experience. They are the defining feature of high-end marketing sites, creative portfolios, and product launch pages. This section covers when to use them, available techniques, and production-ready implementation for each.

### Blueprint Decision Framework

The user's explicit instruction always overrides blueprint scanning. Follow this priority chain:

1. **User explicitly states** whether to use animated or static backgrounds → follow their call, no pushback, no second-guessing
2. **User provides a specific image or video** to use as the background → use that asset. If the user also describes how they want it animated (rotation, fade, drift, particle effects, zoom, etc.), follow those animation directions exactly
3. **User says animated but provides no assets** → select or generate appropriate assets based on the project theme and blueprint context
4. **User says nothing about backgrounds** → scan `blueprint.md` and specification files, then decide autonomously using the criteria below

**Mandatory preview approval:** Before integrating any animated video background into the website design, always present the animated video to the user for review and confirmation first. Do not design around or build the page with an animated background until the user has seen the video sample and approved it. If rejected, iterate on the animation or source a new one before proceeding.

**Use animated backgrounds when the blueprint describes:**

- Premium or luxury brands (fashion, jewelry, high-end services)
- Creative agencies, studios, or portfolios (3D, design, film, photography)
- Web3, crypto, NFT, or blockchain projects
- Space, science, or futuristic technology themes
- AI/ML products conveying cutting-edge innovation
- Entertainment, gaming, or immersive experience products
- Product launches, pre-launch hype pages, or waitlist pages
- Event, conference, or festival sites

**Use static backgrounds when the blueprint describes:**

- SaaS dashboards, admin panels, or internal tools
- Documentation or developer-facing tools
- E-commerce catalogs where product images must dominate
- Content-heavy blogs, news, or knowledge bases
- Healthcare, legal, or financial compliance products
- B2B enterprise software focused on utility

A single project can mix both: animated hero on the landing page, static backgrounds inside the app. When in doubt, lean animated for marketing pages and static for application interfaces.


### Background Type Selection

| Project Type | Primary Background | Fallback |
|---|---|---|
| Creative portfolio / agency | Full-screen looping video | Premium hero image with parallax |
| Web3 / NFT / crypto | Looping video or WebGL particles | Premium hero image with dark overlay |
| AI / tech SaaS landing | Looping video or gradient animation | Premium hero image or ambient glow blobs |
| Luxury / fashion brand | Slow cinematic video loop | Large hero image with parallax |
| Product launch / hype page | Full-screen video with overlay | Premium hero image with grain overlay |
| Security / enterprise product | Premium hero image with dark overlay | Coded grid or particle background |
| Developer tools / docs | None (static dark background) | Subtle grain texture only |
| Dashboard / app interface | None (solid color system) | None |

### Technique 1: Full-Screen Looping Video Background

The most impactful animated background technique. A short 5-15 second video loops seamlessly behind the hero content. This is the approach used by MotionSites, Higgsfield/Seedance, and premium agency sites.

**Asset creation workflow:**

1. Generate or source a high-quality still image matching the project theme (use AI image generation, Midjourney, or curated stock)
2. Animate the still using an AI video tool (Seedance 2.0 via Higgsfield, Nano Banana, Runway, Pika, or Kling) to create a 5-10 second loop with subtle motion: camera drift, particle flow, light shifts, atmospheric effects
3. Export as MP4 (H.264, 1080p or 4K, under 10MB for web performance)
4. Host on a CDN (CloudFront, Vercel Blob, Cloudflare R2)
5. Implement with the pattern below

**Basic video background:**

```html
<div class="hero-video-wrap">
  <video autoplay loop muted playsinline preload="auto" class="hero-video">
    <source src="/videos/hero-bg.mp4" type="video/mp4" />
  </video>
  <div class="hero-content">
    <!-- Content layered above the video -->
  </div>
</div>
```

```css
.hero-video-wrap {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
}
.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.hero-content {
  position: relative;
  z-index: 10;
}
```

**Advanced: Custom JS crossfade for seamless loops.**

For videos that do not loop perfectly, use a requestAnimationFrame-based fade system instead of CSS transitions. This prevents the visible jump at the loop point.

```typescript
// hooks/useFadingVideo.ts
import { useEffect, useRef } from 'react'

export function useFadingVideo(videoRef: React.RefObject<HTMLVideoElement>) {
  const rafIdRef = useRef<number>(0)
  const fadingOutRef = useRef(false)
  const FADE_MS = 500
  const FADE_OUT_LEAD = 0.55

  function fadeTo(video: HTMLVideoElement, target: number, duration: number) {
    cancelAnimationFrame(rafIdRef.current)
    const start = parseFloat(video.style.opacity || '0')
    const startTime = performance.now()
    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      video.style.opacity = String(start + (target - start) * progress)
      if (progress < 1) rafIdRef.current = requestAnimationFrame(step)
    }
    rafIdRef.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onLoaded = () => { video.style.opacity = '0'; video.play(); fadeTo(video, 1, FADE_MS) }
    const onTimeUpdate = () => {
      if (!fadingOutRef.current && video.duration - video.currentTime <= FADE_OUT_LEAD && video.duration - video.currentTime > 0) {
        fadingOutRef.current = true
        fadeTo(video, 0, FADE_MS)
      }
    }
    const onEnded = () => {
      video.style.opacity = '0'
      setTimeout(() => { video.currentTime = 0; video.play(); fadingOutRef.current = false; fadeTo(video, 1, FADE_MS) }, 100)
    }
    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    return () => { cancelAnimationFrame(rafIdRef.current); video.removeEventListener('loadeddata', onLoaded); video.removeEventListener('timeupdate', onTimeUpdate); video.removeEventListener('ended', onEnded) }
  }, [videoRef])
}
```

Remove the `loop` attribute from the video element when using crossfade — the manual `ended` handler manages looping.

**HLS streaming for large videos:**

```typescript
import Hls from 'hls.js'
import { useEffect, useRef } from 'react'

export function useHlsVideo(src: string) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play())
      return () => hls.destroy()
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src; video.play()
    }
  }, [src])
  return videoRef
}
```

**Cursor-controlled video scrubbing (interactive, non-autoplay):**

Instead of autoplaying a background video, the video scrubs forward and backward based on horizontal mouse movement. This creates a deeply interactive experience where the user controls the visual with their cursor. The video does NOT autoplay. Use this for hero sections where the video content is a focal character or object (holographic avatars, product reveals, 3D objects) rather than ambient atmosphere.

```typescript
// hooks/useVideoScrub.ts
import { useEffect, useRef } from 'react'

const SENSITIVITY = 0.8

export function useVideoScrub(videoRef: React.RefObject<HTMLVideoElement>) {
  const prevXRef = useRef<number | null>(null)
  const targetTimeRef = useRef(0)
  const seekingRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Pause the video — scrubbing controls playback, not autoplay
    video.pause()

    function onMouseMove(e: MouseEvent) {
      if (!video) return
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX
        return
      }
      const delta = e.clientX - prevXRef.current
      prevXRef.current = e.clientX

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration
      targetTimeRef.current = Math.max(0, Math.min(video.duration, targetTimeRef.current + timeOffset))

      if (!seekingRef.current) {
        seekingRef.current = true
        video.currentTime = targetTimeRef.current
      }
    }

    function onSeeked() {
      // If targetTime moved while we were seeking, seek again
      if (Math.abs(video!.currentTime - targetTimeRef.current) > 0.01) {
        video!.currentTime = targetTimeRef.current
      } else {
        seekingRef.current = false
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    video.addEventListener('seeked', onSeeked)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [videoRef])
}
```

Usage with the scrubbing hook:

```tsx
const videoRef = useRef<HTMLVideoElement>(null)
useVideoScrub(videoRef)

<video
  ref={videoRef}
  muted
  playsInline
  preload="auto"
  className="absolute inset-0 w-full h-full object-cover z-0"
>
  <source src="/hero-character.mp4" type="video/mp4" />
</video>
```

The video must NOT have `autoPlay` or `loop` attributes when using scrubbing. The `onSeeked` handler prevents seek-flooding by queuing the next seek only after the previous one completes.

### Technique 2: Liquid Glass Design System

Liquid glass (glassmorphism) is the dominant UI pattern for content layered over video backgrounds. It provides readable contrast without opaque overlays that kill the cinematic feel.

```css
/* Standard: subtle glass for navbars, chips, cards over video */
.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Strong: heavier blur for primary CTAs and stat cards */
.liquid-glass-strong {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  border: none;
  box-shadow: 4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.15);
  position: relative;
  overflow: hidden;
}
.liquid-glass-strong::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.2) 80%, rgba(255,255,255,0.5) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Dark: for dark-on-dark contexts like dark navbars over dark video */
.liquid-glass-dark {
  background: rgba(0, 0, 0, 0.4);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass-dark::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.1) 80%, rgba(255,255,255,0.3) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

Use liquid glass for: navigation bars, floating cards, input containers, tag chips, CTAs layered over video or image backgrounds. The `::before` pseudo-element creates a subtle border that catches light without a flat `border` property.


### Motion Library Import (Updated API)

The Framer Motion library has been restructured. All new projects should import from `motion/react`.

```tsx
// Legacy (still works but deprecated)
import { motion, AnimatePresence } from 'framer-motion'

// Current (preferred for all new projects)
import { motion, AnimatePresence } from 'motion/react'
```

Install:
```bash
npm install motion
```

All hook names, prop names, and animation APIs remain identical. The only change is the import path. Existing projects using `framer-motion` do not need to migrate.

### Technique 3: Framer Motion Cinematic Entrances

For React projects, Framer Motion provides production-grade entrance animations that pair with video backgrounds. Use these for content appearing over the cinematic background.

**FadeIn wrapper:**

```tsx
import { motion } from 'framer-motion'

export function FadeIn({ children, delay = 0, duration = 0.7, x = 0, y = 30, className = '' }: {
  children: React.ReactNode; delay?: number; duration?: number; x?: number; y?: number; className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

**BlurText word-by-word headline reveal:**

```tsx
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export function BlurText({ text, className = '' }: { text: string; className?: string }) {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em' }}>
      {text.split(' ').map((word, i) => (
        <motion.span key={i} initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={inView ? [{ filter: 'blur(5px)', opacity: 0.5, y: -5 }, { filter: 'blur(0px)', opacity: 1, y: 0 }] : {}}
          transition={{ duration: 0.7, times: [0, 0.5, 1], ease: 'easeOut', delay: (i * 100) / 1000 }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >{word}</motion.span>
      ))}
    </p>
  )
}
```

**AnimatedText character-by-character scroll reveal:**

```tsx
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function AnimatedText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] })
  return (
    <p ref={ref} className={className} style={{ position: 'relative' }}>
      {text.split('').map((char, i) => {
        const start = i / text.length
        const end = start + 1 / text.length
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1])
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ visibility: 'hidden' }}>{char === ' ' ? '\u00A0' : char}</span>
            <motion.span style={{ opacity, position: 'absolute', left: 0, top: 0 }}>
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          </span>
        )
      })}
    </p>
  )
}
```

**Magnetic hover effect:**

```tsx
import { useRef, useState, useCallback } from 'react'

export function Magnet({ children, padding = 100, strength = 3, className = '' }: {
  children: React.ReactNode; padding?: number; strength?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [active, setActive] = useState(false)
  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < Math.max(rect.width, rect.height) / 2 + padding) {
      setActive(true); setPos({ x: dx / strength, y: dy / strength })
    } else { setActive(false); setPos({ x: 0, y: 0 }) }
  }, [padding, strength])
  return (
    <div ref={ref} className={className} onMouseMove={handleMove}
      onMouseLeave={() => { setActive(false); setPos({ x: 0, y: 0 }) }}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        transition: active ? 'transform 0.3s ease-out' : 'transform 0.6s ease-in-out', willChange: 'transform' }}>
      {children}
    </div>
  )
}
```

### Technique 4: Scroll-Driven Parallax Marquee

Horizontal image rows that scroll based on page scroll position. Used for showcasing work samples or portfolio pieces between hero and content sections.

```tsx
import { useEffect, useRef, useState } from 'react'

export function ParallaxMarquee({ images, direction = 'right' }: { images: string[]; direction?: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return
      setOffset((window.scrollY - ref.current.offsetTop + window.innerHeight) * 0.3)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const tripled = [...images, ...images, ...images]
  const tx = direction === 'right' ? `translateX(${offset - 200}px)` : `translateX(${-(offset - 200)}px)`
  return (
    <div ref={ref} className="overflow-hidden">
      <div className="flex gap-3" style={{ transform: tx, willChange: 'transform' }}>
        {tripled.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" className="w-[420px] h-[270px] rounded-2xl object-cover flex-shrink-0" />
        ))}
      </div>
    </div>
  )
}
```

### Technique 5: Sticky Card Stacking on Scroll

Cards that scale down and stack as you scroll through them, creating a cinematic project showcase effect.

```tsx
import { useScroll, useTransform, motion } from 'framer-motion'
import { useRef } from 'react'

export function StackingCard({ index, total, children }: { index: number; total: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const targetScale = 1 - (total - 1 - index) * 0.03
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale])
  return (
    <div ref={ref} className="h-[85vh]">
      <motion.div style={{ scale, top: `${index * 28}px` }}
        className="sticky top-24 md:top-32 rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8">
        {children}
      </motion.div>
    </div>
  )
}
```

### Technique 6: CSS-Only Animated Backgrounds (No Video)

For projects where video is overkill but static backgrounds are too flat. These load instantly with zero external assets.

**Animated gradient mesh:**

```css
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.gradient-bg {
  background: linear-gradient(-45deg, #0a0a0a, #1a0a2e, #0a1628, #0a0a0a);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}
```

**Floating orb particles (CSS only):**

```css
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: orbFloat 20s ease-in-out infinite;
  pointer-events: none;
}
.orb-1 { width: 600px; height: 600px; background: #6366f1; top: 10%; left: 20%; }
.orb-2 { width: 400px; height: 400px; background: #f59e0b; bottom: 20%; right: 15%; animation-delay: -7s; }
.orb-3 { width: 500px; height: 500px; background: #06b6d4; top: 50%; left: 60%; animation-delay: -13s; }
```

### Technique 7: Texture Overlays

Texture overlays add physical depth to video and gradient backgrounds without affecting readability.

**Noise grain (inline SVG, no external file):**

```tsx
<div className="fixed inset-0 pointer-events-none z-50 opacity-[0.035]"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize: '128px 128px',
  }}
/>
```

**Image texture overlay (for film grain or paper effects):**

```css
.texture-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  background-image: url('/textures/grain.png');
  background-size: cover;
  mix-blend-mode: lighten;
  opacity: 0.6;
}
```

### Cinematic Typography for Animated Hero Sections

When using animated backgrounds, standard body fonts are not enough. Pair a dramatic display font with cinematic sizing.

**Recommended cinematic font pairings:**

| Style | Display Font | Body Font |
|---|---|---|
| Elegant editorial | Instrument Serif (italic) | Inter or Barlow |
| Bold industrial | Anton | System monospace |
| Luxurious minimal | Playfair Display | DM Sans |
| Tech futuristic | Space Grotesk | JetBrains Mono |
| Artistic brush | Condiment (cursive accent only) | Inter |

**Cinematic headline sizing (use clamp for fluid scaling):**

```css
.cinematic-h1 {
  font-size: clamp(2.5rem, 8vw, 6rem);
  line-height: 0.95;
  letter-spacing: -0.03em;
  font-weight: 900;
  text-transform: uppercase;
}
```

**Gradient text effect (common on dark cinematic backgrounds):**

```css
.gradient-text {
  background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Video Background Overlay Strategies

Choose the right overlay strategy based on content readability needs:

| Strategy | When to Use | Implementation |
|---|---|---|
| No overlay | Video is dark enough, text is large and bold | Raw video, liquid glass on UI elements only |
| Subtle gradient from edge | Content is on one side of the viewport | `linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 60%)` |
| Bottom gradient | Content sits at the bottom of the hero | `linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)` |
| Full dark overlay | Busy video, lots of small text | `background: rgba(0,0,0,0.4)` on overlay div |
| Video opacity reduction | Moderate dimming needed | `opacity: 0.6` on the video element |

Never use all of these at once. Pick one strategy per section and commit to it.

### Performance Rules for Animated Backgrounds

- Video files must be under 10MB for direct MP4 loading. Use HLS streaming for anything larger.
- Always include `preload="auto"` on hero videos and `preload="none"` on below-fold videos.
- Use `will-change: transform` on elements that animate via scroll, but remove it after animation completes.
- Parallax marquees and scroll listeners must use `{ passive: true }`.
- Lazy load all images and below-fold videos with `loading="lazy"`.
- Provide a solid background-color fallback matching the video's dominant color so the page is styled before the video loads.
- Test on mobile: disable autoplay videos on connections slower than 4G using `navigator.connection.effectiveType` when available.

### Technique 8: Premium Static Hero Image Background

For projects where video is not available but a plain dark background is too flat. A well-chosen hero image with proper overlay treatment can look just as premium as video. This is the most common background type on real-world agency sites, product landing pages, and SaaS marketing pages.

**When to use:**

- The user chose Gate 3 option 2 (premium static hero image)
- Video generation is not available or practical
- The project needs visual impact but the budget or timeline does not allow video
- Security, enterprise, or B2B products where video feels out of place but a dark background is too plain
- The hero section has a split layout (copy left, product screenshot or character right)

**Image sourcing (in priority order):**

1. **User provides an image**: use it directly. Apply overlay and treatment as described below
2. **AI-generated hero art**: use image generation tools (ChatGPT/DALL-E, Midjourney, Google Imagen/Flow) to create a thematic art piece matching the project. See the Hero Art Category Guide below for what to generate
3. **Pinterest reference then AI recreation with Google Flow**: find a reference image on Pinterest that matches the desired style and project identity. Then use **Google Flow** (labs.google/fx/tools/flow) with the Pinterest image as a reference input to generate a similar original piece adapted to the correct size, aspect ratio, and palette. This is the recommended workflow when the user has a reference image in hand. See the Google Flow prompt guide below.
4. **Curated stock**: Unsplash, Pexels, or Pixabay for high-quality free images as a last resort. Search for abstract, atmospheric, or thematic keywords rather than generic business stock photos

**Google Flow — Reference Image Adaptation Workflow:**

**What Google Flow actually does:**

Google Flow takes your Pinterest reference image and adapts it. It can:
- **Change the aspect ratio** — set 16:9, 9:16, 4:3, 1:1, or 3:4 in the settings panel before generating
- **Reposition the subject** — describe in your prompt where you want the character/subject to sit (right edge, left edge, centred, off-centre bleeding out of frame, etc.)
- **Keep the same design faithfully** — same colours, same style, same character, same visual language from the reference
- **Optionally adjust colours** — if you need the accent colours to match the project palette, describe the colour changes in your prompt alongside the positioning instruction

Google Flow is NOT a simple resize or crop tool — it understands composition and can intelligently extend the canvas, reposition the focal subject, and adapt the layout while keeping the artistic style of the reference intact.

**What each tool handles:**

| Tool | Job |
|---|---|
| **Google Flow** | Adapts aspect ratio and repositions the subject. Keeps style and colours of the reference. Optionally adjusts colours on request |
| **Squoosh** (squoosh.app) | Compresses the final image file to under 500KB. Does not change aspect ratio or composition |
| **CSS** (`max-width`, positioning) | Controls how large the image displays on screen and where it sits in the layout |

**URL:** labs.google/fx/tools/flow — create a new project, then open Agent Settings (top right).

**Set these before generating:**

| Setting | What It Controls |
|---|---|
| Image aspect ratio | The output frame shape — choose based on your layout (16:9 for split-right, 9:16 for tall centred portrait, 1:1 for square) |
| Variation count | How many output images to generate — 1x=1, 2x=2, 3x=3, 4x=4. Use 2x to have options to pick from |
| Image model | Nano Banana 2 for images |

**How to write the prompt:**

Your prompt has two jobs: (1) describe what to keep from the reference, and (2) describe what to change (positioning, colours, aspect ratio context).

```
Keep the same [subject] from the reference image — same [style description], same [colour description].
Place the [subject] at the [position: right edge / left third / centre / etc.] of the frame.
The [left/right] side should be [empty space / dark background] for text to sit on.
[Optional: change the accent glow to [colour] to match the project palette.]
[State what must NOT appear: text, watermarks, logos]
Aspect ratio: [9:16 / 16:9 / etc.] as set in settings.
```

**Example — split-right hero (character right, copy left, 16:9):**

Reference: any dark character or entity image in portrait format.
Settings: aspect ratio **16:9**, variation count **2x**, model **Nano Banana 2**

```
Keep the same character from the reference image — same illustration style, same colours, same crown, same outfit. Place the character at the right edge of the frame, partially cropped at the bottom. The left two-thirds of the frame should be empty background space for copy to sit on. Keep the background colour the same. No text, no watermarks, no logos.
```

**Example — centred tall portrait (9:16, no repositioning needed):**

Settings: aspect ratio **9:16**, variation count **2x**, model **Nano Banana 2**

```
Keep the same subject from the reference image — same style, same colours, same composition. Centre the subject vertically and horizontally in the taller 9:16 frame. Extend the background above and below the subject to fill the extra vertical space. No text, no watermarks, no logos.
```

Steps:
1. Go to labs.google/fx/tools/flow and create a new project
2. Open Agent Settings — set the aspect ratio, variation count to 2x, model to Nano Banana 2
3. Upload the Pinterest reference image
4. Write your prompt describing what to keep and what position to place the subject
5. Generate, pick the best variant
6. Download at highest resolution, compress at squoosh.app to under 500KB. Save as WebP if you are generating the asset yourself. If the user provides an image in JPEG or PNG, use it as-is — do not force conversion.

**IMPORTANT: Colour matching.** The accent glow/lighting on the hero art MUST match the project's palette. If the project uses teal (#00d4aa), search for or generate art with teal glowing accents, not red or purple. If you find a perfect reference image with the wrong accent colour, use Google Flow with the reference image to regenerate it with the correct palette.

**Hero Art Category Guide:**

Premium hero images are NOT stock photographs. They are character art, entity renders, geometric objects, and conceptual art pieces that give the product a visual identity. Choose the right category based on the project type:

| Category | What It Looks Like | Best For | Pinterest/AI Search Terms |
|---|---|---|---|
| **Character/guardian renders** | 3D armoured robots, cyber warriors, futuristic sentinels with glowing accents on dark backgrounds | Security products, AI agents, gaming, any product with a "protector" identity | `futuristic cyber guardian 3D render dark background [accent colour] glow`, `armoured sentinel robot character dark` |
| **Wireframe/technical renders** | Blueprint-style humanoid figures, network mesh hands, schematic wireframe entities | Security, data analysis, network tools, developer products | `wireframe humanoid blueprint dark background`, `network mesh hands reaching data visualization art` |
| **Abstract geometric objects** | Holographic crystals, prismatic icosahedrons, glowing particle spheres, morphing dot-matrix shapes | Crypto, Web3, fintech, blockchain, data products | `holographic crystal 3D render dark background`, `abstract geometric sphere glowing particles dark` |
| **Conceptual art scenes** | Robot hand touching human hand, cosmic hands reaching toward a singularity, symbolic narrative compositions | AI products, human-AI collaboration themes, research platforms | `robot hand human hand touching cyberpunk dark`, `AI consciousness art dark background` |
| **Abstract/minimal figures** | Featureless glossy mannequin heads with iridescent reflections, smooth chrome busts, minimal dark silhouettes | Creative agencies, fashion tech, luxury brands, art platforms | `iridescent chrome mannequin head dark`, `glossy dark android bust minimal` |
| **Cyberpunk hardware hybrids** | Android heads with mechanical components, circuit-board skin, glowing cables connected to skulls | AI/ML products, neural processing, cyberpunk themes, hacker tools | `cyberpunk android head hardware cables dark`, `neural interface character dark background` |

**IMPORTANT: Colour matching.** The accent glow/lighting on the hero art MUST match the project's palette. If the project uses teal (#00d4aa), search for or generate art with teal glowing accents, not red or purple. If you find a perfect reference image with the wrong accent colour, regenerate it with the correct colour using AI tools.

**Project-specific examples:**

- **Security/SOC product (Sentinel)**: Character/guardian renders or wireframe/technical renders with teal accent glow. Search: `futuristic cyber sentinel guardian 3D dark background teal glow`
- **Crypto trading tool (Mantis)**: Character render of a predator/insect or abstract geometric object with warm gold accent. Search: `3D mantis insect predator render dark background gold accent` or `abstract golden geometric sphere dark`
- **AI writing assistant**: Conceptual art scene or minimal figure with soft blue accent. Search: `holographic writer figure quill dark background blue glow`
- **Fashion brand**: Abstract minimal figure with iridescent reflections. Search: `glossy chrome mannequin dark fashion minimal`

**Image treatment rules:**

- Never use a raw, unprocessed image as a hero background. Always apply at least one overlay treatment
- Images must be dark enough for white or light text to be readable without additional overlays. If the image is bright, darken it
- Prefer images with a natural focal point off-centre so text can sit on the opposite side
- Compress images to under 500KB for hero backgrounds. Prefer WebP or AVIF when you are generating the asset yourself. If the user provides an image in JPEG or PNG, use it exactly as provided — match the filename in code, do not rename or convert it.
- Always provide a `background-color` fallback matching the image's dominant tone so the page is styled before the image loads

**Pattern 1: Full-bleed hero image with dark overlay**

The image covers the full viewport behind all hero content. A dark overlay ensures text readability.

```tsx
{/* Hero wrapper */}
<section className="relative min-h-screen flex items-center overflow-hidden">
  {/* Background image */}
  <div
    className="absolute inset-0 z-0"
    style={{
      backgroundImage: 'url(/images/hero-bg.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: 'var(--bg-primary)', /* fallback */
    }}
  />
  {/* Dark overlay */}
  <div
    className="absolute inset-0 z-1"
    style={{ background: 'rgba(0, 0, 0, 0.55)' }}
  />
  {/* Grain overlay (same as body::after but scoped to hero) */}
  <div
    className="absolute inset-0 z-2 pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,...")`, /* same fractalNoise SVG */
      backgroundSize: '128px 128px',
      opacity: 0.04,
    }}
  />
  {/* Content */}
  <div className="relative z-10 max-w-6xl mx-auto px-6">
    {/* Hero copy, CTAs, etc. */}
  </div>
</section>
```

**Pattern 2: Split layout with image on one side**

Image fills the right half (or left half) of the viewport. Copy sits on the opposite side over a solid dark background. No overlay needed on the text side.

```tsx
<section className="relative min-h-screen grid lg:grid-cols-2">
  {/* Left: copy on dark background */}
  <div className="flex flex-col justify-center px-8 lg:px-16 py-24" style={{ background: 'var(--bg-primary)' }}>
    {/* Badge, headline, subhead, CTAs */}
  </div>
  {/* Right: hero image */}
  <div className="relative overflow-hidden">
    <img
      src="/images/hero-right.webp"
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      loading="eager"
    />
    {/* Optional: subtle gradient blending into the left side */}
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(to right, var(--bg-primary) 0%, transparent 30%)' }}
    />
  </div>
</section>
```

**Pattern 3: Floating character or product over dark background**

Based on the Pinterest to ChatGPT character workflow. The character or product image floats on the right side with the background being a solid dark colour or subtle gradient. No full-bleed image needed.

```tsx
<section className="relative min-h-screen flex items-center" style={{ background: 'var(--bg-primary)' }}>
  <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
    {/* Left: copy */}
    <div className="flex flex-col gap-6">
      {/* Badge, headline, subhead, CTAs */}
    </div>
    {/* Right: floating character/product image */}
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="relative"
    >
      <img
        src="/images/character.webp"
        alt=""
        className="w-full max-w-md mx-auto drop-shadow-2xl"
        loading="eager"
      />
      {/* Optional: ambient glow behind the character */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full -z-10"
        style={{ background: 'var(--accent-glow)', filter: 'blur(80px)' }}
      />
    </motion.div>
  </div>
</section>
```

**Overlay strategies for hero images:**

| Strategy | When to Use | CSS |
|---|---|---|
| Full dark overlay | Image is bright or busy, lots of text | `background: rgba(0,0,0,0.5)` to `rgba(0,0,0,0.7)` on overlay div |
| Side gradient | Content sits on one side, image on the other | `linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 50%)` |
| Bottom gradient | Headline sits at the bottom of the hero | `linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)` |
| Colour tint overlay | Match the image tone to the palette | `background: rgba(palette-colour, 0.3)` with `mix-blend-mode: multiply` |
| Grain only | Image is already dark and atmospheric | Apply the noise grain SVG at `opacity: 0.04` on top |

**Performance rules for hero images:**

- Prefer WebP or AVIF format when generating assets yourself (50-70% smaller than JPEG with no quality loss). When the user provides an image in any format (JPEG, PNG, WebP, AVIF), use it exactly as provided. Match the actual filename in your code — do not rename the file or assume an extension.
- Compress to under 500KB. Use tools like Squoosh, TinyPNG, or Sharp
- Set `loading="eager"` on the hero image (it is above the fold)
- Set `loading="lazy"` on all other images
- Provide `width` and `height` attributes or use `aspect-ratio` in CSS to prevent layout shift
- Always set a `background-color` fallback on the container so the page has colour before the image loads

**Character/Element Positioning in 16:9 Framing:**

When using a character, entity, object, or focal art piece as a hero element (not a full-bleed background photograph), decide where to position it in the frame. This is a per-project decision based on the page layout, where the copy sits, and what feels right for the product. Do not default to one position for every project.

| Position | When It Works | When It Does Not Work |
|---|---|---|
| **Right third** (character right, copy left) | Hero has a left-aligned headline with CTAs below it. The character acts as a visual anchor on the opposite side. Most common for split-layout heroes | When the page has right-aligned copy or a right sidebar |
| **Left third** (character left, copy right) | Less conventional, creates visual surprise. Works when the character is looking/facing right, drawing the eye toward the copy | When it conflicts with left-to-right reading flow and the character faces left (away from copy) |
| **Centred** | The character IS the hero (no competing headline). Works for splash screens, loading states, app launch pages, or pages where the headline sits above or below the character | When there is a large headline that needs to sit beside the character, centring forces text overlay which hurts both readability and character impact |
| **Off-edge bleeding** | The character is partially cropped by the viewport edge. Creates scale and suggests the entity is larger than the screen. Works for dramatic, imposing characters (guardians, mechs, large creatures) | When the character has important detail on the cropped side (e.g. a weapon, a glowing element, or facial features that would be cut off) |
| **Full-bleed background** | The character/art covers the entire viewport and all content sits on top of it with overlay treatment. Works for atmospheric scenes, landscapes, and abstract art | When the character has fine detail that an overlay would obscure, or when text readability requires too heavy an overlay that kills the image |

The direction the character is facing matters. If the character faces right, position it on the left so it looks toward the copy. If it faces left, position it on the right. If the character is in profile (facing the edge of the screen), it should be near that edge, looking outward. These are defaults. Break them if the composition calls for it.

---

## Step 3C: Golden Reference Compositions (MANDATORY QUALITY BAR)

These are complete specifications showing what a premium hero section looks like when every technique from this skill file is composed together. They are NOT templates to copy verbatim. They are the **minimum quality standard** that every project must meet. If your output does not match this level of specificity and polish, it is not ready to present. Study the patterns: the z-index layering, the entrance stagger timing, the component hierarchy, the exact CSS values. Every interface you build, whether a landing page, a dashboard, or a spec file, must demonstrate the same precision shown here.

### Reference 1: Cinematic Video Hero (Dark, Full-Viewport)

Suits: creative agencies, space/travel brands, Web3 launches, premium portfolios. Uses Palette 1 (Midnight Luxe) or Palette 3 (Ember Studio).

**Structure and z-index stacking:**

```
z-0:  Full-viewport <video> background (absolute inset-0, object-cover)
z-2:  Giant ghost text (decorative, pointer-events-none)
z-3:  Noise grain overlay (fixed, pointer-events-none, opacity 0.04)
z-10: Content layer (relative, all hero content)
z-50: Navbar (fixed top)
```

**Video background:**

```tsx
<div className="relative w-full h-screen overflow-hidden bg-[#0a0a0f]">
  {/* Video: no loop attr when using crossfade, use useFadingVideo hook */}
  <video
    ref={videoRef}
    autoPlay muted playsInline preload="auto"
    className="absolute inset-0 w-full h-full object-cover z-0"
    style={{ width: '120%', height: '120%', left: '50%', transform: 'translateX(-50%)' }}
  >
    <source src="VIDEO_URL_HERE" type="video/mp4" />
  </video>

  {/* Noise grain overlay */}
  <div className="absolute inset-0 pointer-events-none z-[3]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
      backgroundSize: '200px 200px', opacity: 0.4
    }}
  />

  {/* No dark overlay. Contrast comes from liquid-glass chrome. */}
</div>
```

**Navbar (liquid-glass pill, fixed top):**

```tsx
<nav className="fixed top-4 inset-x-0 z-50 px-8 lg:px-16">
  <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
    {/* Logo: 48x48 liquid-glass circle with italic serif letter */}
    <div className="w-12 h-12 liquid-glass rounded-full flex items-center justify-center">
      <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}
        className="text-white text-lg lowercase">a</span>
    </div>
    {/* Centre: liquid-glass pill with links + CTA */}
    <div className="hidden md:flex liquid-glass rounded-full px-1.5 py-1.5 items-center">
      {['Home', 'Voyages', 'Worlds', 'Innovation', 'Plan'].map(link => (
        <a key={link} className="px-3 py-2 text-sm font-medium text-white/90
          hover:text-white transition-colors rounded-full font-body">{link}</a>
      ))}
      <button className="bg-white text-black px-4 py-2 rounded-full text-sm
        font-medium whitespace-nowrap flex items-center gap-1 ml-1">
        Claim a Spot <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
    {/* Right: spacer to balance logo */}
    <div className="w-12 h-12" />
  </div>
</nav>
```

**Hero content (centred, staggered entrance):**

Entrance animation base: `initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}` with `ease: 'easeOut'`.

```
Stagger sequence:
  Badge chip:     delay 0.4s
  Headline:       delay 0.5s (BlurText word-by-word, 100ms stagger per word)
  Subheading:     delay 0.8s
  CTA buttons:    delay 1.1s
  Stat cards:     delay 1.3s
  Partner strip:  delay 1.4s
```

**Headline (BlurText word-by-word animation):**

```tsx
<BlurText
  text="Venture Past Our Sky Across the Universe"
  className="text-6xl md:text-7xl lg:text-[5.5rem] font-display italic
    text-white leading-[0.8] max-w-2xl tracking-[-4px]"
/>
```

Each word animates: `blur(10px) opacity:0 y:50` → `blur(5px) opacity:0.5 y:-5` → `blur(0) opacity:1 y:0`. Duration 0.7s per word. Stagger: `delay = (wordIndex * 100) / 1000` seconds.

**Key details that prevent AI slop:**
- Video is 120% width/height for cinematic crop, centred with translateX(-50%)
- No dark overlay on video. Glass elements provide their own contrast
- Headline uses tight leading (0.8) and negative letter-spacing (-4px)
- Stat cards have specific dimensions (220px wide, rounded-[1.25rem])
- Partner names are in display serif italic, not body sans-serif
- Grain overlay uses exact SVG pattern, not a blurred div

---

### Reference 2: Light Glassmorphism Product Hero

Suits: SaaS products, DeFi dashboards, fintech, modern product pages. Uses Palette 2 (Arctic Glass).

**Structure:**

```
Outer page:     bg-[#f0f0f0], full viewport, flex centre, p-5
Inner section:  max-w-[1536px], h-full, rounded-[3rem], overflow-hidden
  z-0:  <video> background (absolute inset-0, object-cover)
  z-10: Content layer
    - Navbar (relative, not fixed)
    - Hero text (centred, top)
    - Bottom-left stat card (absolute)
    - Bottom-right cutout (absolute, with SVG corner masks)
```

**Outer container:**

```tsx
<div className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-[#f0f0f0]">
  <section className="relative w-full max-w-[1536px] h-full rounded-[1.5rem]
    md:rounded-[3rem] overflow-hidden flex flex-col items-center bg-white/10">
    {/* Video */}
    <video autoPlay muted loop playsInline
      className="absolute inset-0 w-full h-full object-cover object-[65%]
        lg:object-center z-0">
      <source src="VIDEO_URL_HERE" type="video/mp4" />
    </video>
    {/* Content */}
    <div className="relative z-10 w-full h-full flex flex-col items-center">
      {/* Navbar, hero text, bottom components */}
    </div>
  </section>
</div>
```

**Colour system (muted, not pure black/white):**
- Text: `text-[#5E6470]` (headline), `text-[rgba(30,50,90,0.9)]` (accents)
- Buttons: `bg-[rgba(30,50,90,0.8)]` with `text-white`
- Cards: `bg-white/30 backdrop-blur-xl`
- Badges: `bg-white/60 backdrop-blur-md border-white/20`

**Bottom-right corner cutout (the defining detail):**

This is the component that separates premium from generic. The page background (#f0f0f0) appears to wrap around the corner element using two SVG inverse-radius masks.

```tsx
<div className="absolute bottom-0 right-0 p-6 pt-8 pl-14 bg-[#f0f0f0]
  rounded-tl-[3.5rem] flex items-center gap-6">
  {/* Top SVG mask: creates inverse radius at top-right junction */}
  <div className="absolute -top-[3.5rem] right-0 w-[3.5rem] h-[3.5rem] pointer-events-none">
    <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none">
      <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#f0f0f0"/>
    </svg>
  </div>
  {/* Left SVG mask: creates inverse radius at bottom-left junction */}
  <div className="absolute bottom-0 -left-[3.5rem] w-[3.5rem] h-[3.5rem] pointer-events-none">
    <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none">
      <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#f0f0f0"/>
    </svg>
  </div>
  {/* Content: icon circle + text */}
</div>
```

**Key details that prevent AI slop:**
- The entire hero lives inside a rounded-[3rem] container with padding around it
- Video uses `object-[65%]` for custom focal point, not plain `object-center`
- Muted text colours (#5E6470, rgba(30,50,90)) not pure black or white
- The corner cutout SVG masks are the premium touch that generic AI never produces
- Badge uses `bg-white/60` (translucent), not opaque white
- Button icons sit inside a `bg-white/20 p-1.5 rounded-full` circle, not bare

---

### Reference 3: Dark Editorial Two-Column

Suits: registration pages, sign-up flows, product on-boarding. Uses Palette 1 (Midnight Luxe) with adjustments.

**Structure:**

```
<main>: flex min-h-screen bg-black p-2, lg:p-4 lg:h-screen lg:overflow-hidden
  Left column:  w-[52%] hidden lg:flex, rounded-3xl, video bg, hero content at bottom
  Right column: flex-1, form area centred, max-w-xl
```

**Left column (video + hero overlay):**

```tsx
<div className="relative w-[52%] hidden lg:flex flex-col items-center
  justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
  {/* Video: NO overlay, no gradient, no tint */}
  <video autoPlay muted loop playsInline
    className="absolute inset-0 w-full h-full object-cover">
    <source src="VIDEO_URL_HERE" type="video/mp4" />
  </video>
  {/* Content over video */}
  <motion.div className="relative z-10 w-full max-w-xs space-y-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}>
    {/* Brand */}
    <motion.div className="flex items-center gap-2"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      <Circle className="w-6 h-6 text-white fill-white" />
      <span className="text-xl font-semibold tracking-tight text-white">Aurora</span>
    </motion.div>
    {/* Heading */}
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-4xl font-medium tracking-tight text-white">Join Aurora</h2>
      <p className="text-white/60 text-sm leading-relaxed mt-2">
        Follow these 3 quick phases to activate your space.
      </p>
    </motion.div>
    {/* Step indicators */}
    {steps.map((step, i) => (
      <StepItem key={i} number={i + 1} text={step.text} active={i === 0} />
    ))}
  </motion.div>
</div>
```

**Step indicator component (active vs inactive states):**

```tsx
function StepItem({ number, text, active }: { number: number; text: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active
        ? 'bg-white text-black border border-white'
        : 'bg-[#1A1A1A] text-white border-none'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        active ? 'bg-black text-white' : 'bg-white/10 text-white/40'
      }`}>{number}</div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}
```

**Right column (form):**

```tsx
<div className="flex-1 flex flex-col items-center justify-center py-12
  lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24">
  <motion.div className="w-full max-w-xl space-y-8"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    transition={{ duration: 0.8, ease: 'easeOut' }}>
    {/* Header */}
    <div>
      <h1 className="text-3xl font-medium tracking-tight text-white">Create New Profile</h1>
      <p className="text-white/40 text-sm mt-2">Input your basic details to begin the journey.</p>
    </div>
    {/* Social buttons: 2-column grid */}
    <div className="grid grid-cols-2 gap-4">
      <SocialButton icon={Chrome} label="Google" />
      <SocialButton icon={Github} label="Github" />
    </div>
    {/* Divider */}
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-black px-4 text-xs font-medium text-white/40
          uppercase tracking-widest">Or</span>
      </div>
    </div>
    {/* Form fields */}
    <div className="grid grid-cols-2 gap-4">
      <InputGroup label="First Name" placeholder="John" />
      <InputGroup label="Last Name" placeholder="Doe" />
    </div>
    <InputGroup label="Email" placeholder="john@example.com" type="email" />
    <InputGroup label="Password" placeholder="Min 8 characters" type="password" />
    {/* Submit */}
    <button className="w-full h-14 bg-white text-black font-semibold rounded-xl
      hover:bg-white/90 active:scale-[0.98] transition-all mt-4">
      Create Account
    </button>
  </motion.div>
</div>
```

**Input and social button components:**

```tsx
function InputGroup({ label, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-sm font-medium text-white block mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder}
        className="w-full bg-[#1A1A1A] border-none rounded-xl h-11 px-4
          text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20
          outline-none transition-all" />
    </div>
  )
}

function SocialButton({ icon: Icon, label }) {
  return (
    <button className="flex items-center justify-center gap-2 bg-black border
      border-white/10 rounded-xl py-3 text-white text-sm font-medium
      hover:bg-white/5 transition-colors">
      <Icon className="w-5 h-5" /> {label}
    </button>
  )
}
```

**Key details that prevent AI slop:**
- Left column has exact width (w-[52%]), not flex-1 or w-1/2
- Video has NO overlay at all. Content sits at the bottom where video is naturally darker
- Step indicators have precise active/inactive state styling with different backgrounds
- Form inputs use bg-[#1A1A1A] (custom dark, not pure black), border-none, and specific focus ring
- The divider uses the classic "text over line" pattern with the black bg punching through
- Social buttons use border-white/10 (barely visible), not border-white/20 or higher
- Submit button is h-14 (tall), not the default compact height

---

## Step 3D: Spec Output Format Rules (MANDATORY for FRONTEND_SPEC Generation)

Every FRONTEND_SPEC file generated from this skill file must meet the specificity level shown in the Golden Spec Examples in COMPOSITION_RECIPES.md. The following rules are non-negotiable. If a spec does not meet them, it is not ready to hand off to the code builder.

### Rule 1: Exact Tailwind Classes for Every Element

Every element in the spec must have its complete Tailwind class string. No vague descriptions.

| WRONG (vague) | RIGHT (exact) |
|---|---|
| "large bold heading" | `text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic leading-[0.8] tracking-[-4px]` |
| "card with glass effect" | `liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col` |
| "small muted text" | `text-xs text-white/50 font-body mt-2` |
| "button" | `bg-white text-black px-6 py-3 rounded-full font-medium text-sm hover:bg-white/90 transition-colors` |
| "position at bottom left" | `absolute bottom-5 left-3 md:bottom-8 md:left-4 z-10` |

### Rule 2: Exact Animation Values

Every animation must specify: initial state, animate state, duration, easing curve, and delay.

| WRONG | RIGHT |
|---|---|
| "fade in on scroll" | `initial: { filter: 'blur(10px)', opacity: 0, y: 20 }` / `animate: { filter: 'blur(0px)', opacity: 1, y: 0 }` / `duration: 0.8s, ease: 'easeOut', delay: 0.4s` |
| "staggered entrance" | `badge: delay 0.4s, headline: delay 0.5s, sub: delay 0.8s, CTAs: delay 1.1s, stats: delay 1.3s` |
| "word-by-word blur" | `blur(10px) opacity:0 y:50 -> blur(5px) opacity:0.5 y:-5 -> blur(0) opacity:1 y:0, duration 0.7s, stagger: (wordIndex * 100) / 1000 seconds` |

### Rule 3: Z-Index Stacking Order

Every section must declare its complete z-index stack. Example:

```
z-0:  video background (absolute inset-0, object-cover)
z-3:  noise grain overlay (absolute inset-0, pointer-events-none)
z-10: content layer (relative)
z-50: navbar (fixed top)
```

### Rule 4: Asset Briefs

Every section that needs an image or video must include an Asset Brief. The brief describes what to generate or source BEFORE code starts. Assets are locked into the spec before any implementation begins.

```
ASSET BRIEF:
  Type: video background
  Description: dark atmospheric forest with floating particles, blue-teal accent lighting
  Motion: slow camera drift left-to-right, 8-second seamless loop
  Mood: cinematic, premium, moody
  Resolution: 1080p minimum, MP4 H.264, under 10MB
  Generation tool: Seedance 2.0 / Runway / Kling (image-to-video from AI still)
  Hosting: Cloudflare R2 / Vercel Blob / project public folder
  Fallback: static frame from the video, same colour palette, used on slow connections
```

If no real asset is available yet, write `[ASSET PENDING: description]` in the spec. The code builder uses a placeholder div with matching `bg-[colour]` until the real asset URL is provided.

### Rule 5: Responsive Breakpoints

Every positional or sizing class must include responsive variants where the layout changes between mobile and desktop.

| WRONG | RIGHT |
|---|---|
| `text-7xl` | `text-5xl md:text-6xl lg:text-7xl` |
| `px-16` | `px-4 md:px-8 lg:px-16` |
| `bottom-8 left-4` | `bottom-5 left-3 md:bottom-8 md:left-4` |
| `grid-cols-3` | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |

### Rule 6: Composition Recipe References

When a section matches an existing recipe from COMPOSITION_RECIPES.md, reference it by name and use its exact class values. Do not reinvent layouts that already exist as recipes.

Example spec line:
```
SECTION: Hero
Recipe: cinematic-video-hero (from COMPOSITION_RECIPES.md)
Customisations: font-heading = "Playfair Display" instead of default, accent colour adjusted to match palette
```

If no recipe matches, write a bespoke section spec at the same specificity level as the golden examples.

### Rule 7: The Spec Self-Check

Before presenting any FRONTEND_SPEC to the user, scan every section and verify:

- [ ] Every element has exact Tailwind classes (no vague descriptions)
- [ ] Every animation has initial, animate, duration, ease, delay values
- [ ] Every section has a z-index stacking order
- [ ] Every section needing imagery has an asset brief
- [ ] Every positional class has responsive breakpoints
- [ ] Composition recipes are referenced where applicable
- [ ] The spec could be handed to a junior developer and they could build it without asking a single design question

If any item fails, fix it before presenting the spec.

---

## Step 4: Layout

Container:
```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
@media (min-width: 768px)  { .container { padding: 0 48px; } }
@media (min-width: 1280px) { .container { padding: 0 64px; } }
```

Dashboard layout: 240px fixed sidebar, fluid main content, 64px top bar. Sidebar collapses to bottom tab bar on mobile.

Spacing scale: 4 8 12 16 20 24 32 40 48 64 80 96 128px. Use gap- for grids and flex layouts.

---

## Step 5: Component Patterns

Primary button:
```tsx
<button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold
  px-6 py-3 rounded-xl transition-all duration-150
  hover:shadow-[0_0_24px_rgba(245,158,11,0.45)] active:scale-95">
  Label
</button>
```

Card:
```tsx
<div className="bg-[#161616] border border-white/[0.05]
  hover:border-white/[0.10] hover:bg-[#1a1a1a]
  rounded-xl p-6 transition-all duration-200
  hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
  {children}
</div>
```

Input:
```tsx
<input className="w-full bg-[#111] border border-white/[0.08]
  hover:border-white/[0.15] focus:border-amber-500/50
  text-white placeholder:text-white/25
  rounded-lg px-4 py-3 outline-none transition-all duration-150
  focus:ring-2 focus:ring-amber-500/10" />
```

Status badge:
```tsx
const statusStyles = {
  pending:    'bg-white/5 text-white/50 border-white/10',
  processing: 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse-soft',
  complete:   'bg-green-500/10 text-green-400 border-green-500/20',
  failed:     'bg-red-500/10 text-red-400 border-red-500/20',
}
```

Skeleton:
```tsx
<div className="relative overflow-hidden h-40 bg-white/5 rounded-xl">
  <div className="absolute inset-0 bg-gradient-to-r
    from-transparent via-white/[0.05] to-transparent animate-shimmer"
    style={{ backgroundSize: '200% 100%' }} />
</div>
```

---

### Premium Component Library (USE THESE, DO NOT INVENT SIMPLER VERSIONS)

These components are the building blocks of MotionSites-quality interfaces. Each has exact CSS values. Use them with the liquid glass classes from Step 3B. Do not create simplified versions of these components. If a project needs a navbar, use the liquid-glass navbar pattern below. If it needs stat cards, use the stat card patterns below. If it needs a hero badge, use the badge pattern below. Inventing a basic alternative when the premium version exists here is not acceptable.

**Liquid-Glass Navbar (complete with mobile hamburger):**

```tsx
{/* Desktop */}
<nav className="fixed top-4 inset-x-0 z-50 px-8 lg:px-16">
  <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
    {/* Logo */}
    <div className="flex items-center gap-2">
      <div className="w-12 h-12 liquid-glass rounded-full flex items-center justify-center">
        <span className="font-display italic text-white text-lg">a</span>
      </div>
    </div>
    {/* Centre links (desktop) */}
    <div className="hidden md:flex liquid-glass rounded-full px-1.5 py-1.5 items-center gap-0">
      {['Home', 'Features', 'About', 'Pricing'].map(link => (
        <a key={link} className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors duration-300 rounded-full">{link}</a>
      ))}
      <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1">
        Get Started <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
    {/* Mobile hamburger */}
    <button className="md:hidden flex flex-col gap-[5px]" onClick={() => setMenuOpen(!menuOpen)}>
      <span className={`w-6 h-[2px] bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
      <span className={`w-6 h-[2px] bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
      <span className={`w-6 h-[2px] bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
    </button>
  </div>
</nav>
{/* Mobile overlay */}
<div className={`fixed inset-0 z-[9] bg-white/95 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
  {/* Large typographic links centred */}
</div>
```

**Hero Badge/Chip:**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
  className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass mx-auto mb-3 w-fit"
>
  {/* Optional inner 'New' pill */}
  <span className="bg-white text-black px-3 py-1 text-xs font-semibold rounded-full">New</span>
  <span className="text-sm text-white/90 pr-3">Feature announcement text here</span>
</motion.div>
```

**Stat Cards (liquid-glass variant):**

```tsx
<div className="flex items-stretch gap-4">
  <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem]">
    {/* 28x28 white outline SVG icon */}
    <svg className="w-7 h-7 text-white mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
    <p className="font-display italic text-white text-4xl tracking-[-1px] leading-none">34.5 Min</p>
    <p className="text-xs text-white font-body font-light mt-2">Average Watch Time</p>
  </div>
</div>
```

**Partner/Logo Strip:**

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1.4, duration: 0.6 }}
  className="flex flex-col items-center gap-4 pb-8"
>
  <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white">
    Collaborating with top pioneers globally
  </span>
  <div className="flex items-center gap-12 md:gap-16">
    {['Aeon', 'Vela', 'Apex', 'Orbit', 'Zeno'].map(name => (
      <span key={name} className="font-display italic text-white text-2xl md:text-3xl tracking-tight">{name}</span>
    ))}
  </div>
</motion.div>
```

**CTA Button Pair:**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.1, duration: 0.6 }}
  className="flex items-center gap-6 mt-6"
>
  {/* Primary: liquid-glass-strong */}
  <a className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform">
    Start Your Voyage <ArrowUpRight className="w-5 h-5" />
  </a>
  {/* Secondary: bare text */}
  <a className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
    View Demo <Play className="w-4 h-4 fill-current" />
  </a>
</motion.div>
```

**Bottom-Corner Cutout Component:**

This creates a faux-cutout effect where the page background wraps around a corner element. Requires two SVG corner masks.

```tsx
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.8, delay: 0.4 }}
  className="absolute bottom-0 right-0 p-6 pt-8 pl-14 bg-[var(--bg-primary)] rounded-tl-[3.5rem] flex items-center gap-6"
>
  {/* Top corner mask */}
  <div className="absolute -top-[3.5rem] right-0 w-[3.5rem] h-[3.5rem] pointer-events-none">
    <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none">
      <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="var(--bg-primary)" />
    </svg>
  </div>
  {/* Left corner mask */}
  <div className="absolute bottom-0 -left-[3.5rem] w-[3.5rem] h-[3.5rem] pointer-events-none">
    <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none">
      <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="var(--bg-primary)" />
    </svg>
  </div>
  {/* Content */}
  <div className="w-14 h-14 rounded-full flex items-center justify-center border border-[var(--border-default)] bg-[var(--accent-glow)]">
    <ArrowUpRight className="w-6 h-6 text-[var(--text-primary)]" />
  </div>
  <div>
    <p className="text-xl font-normal text-[var(--text-primary)]">Documentation</p>
    <div className="flex items-center gap-1 text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)] transition-colors">
      <span className="text-sm font-normal">Library</span>
      <ChevronRight className="w-4 h-4" />
    </div>
  </div>
</motion.div>
```

**Typewriter Text Hook:**

```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink { animation: blink 1s step-end infinite; }
```

```tsx
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) { clearInterval(interval); setDone(true) }
      }, speed)
      return () => clearInterval(interval)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [text, speed, startDelay])
  return { displayed, done }
}

// Usage:
const { displayed, done } = useTypewriter("we'd love to hear from you!", 38, 600)
// Render:
<h1 className="text-6xl font-normal tracking-tight leading-[1.08] whitespace-pre-wrap">
  {displayed}
  {!done && <span className="inline-block w-[2px] h-[1.1em] bg-current align-middle ml-[2px] animate-blink" />}
</h1>
```

**Interactive Service Pill Selector:**

```tsx
const [services, setServices] = useState<string[]>([])
const options = ['Brand', 'Digital', 'Campaign', 'Other']

<div className="flex flex-wrap gap-3">
  {options.map(option => {
    const active = services.includes(option)
    return (
      <motion.button
        key={option}
        whileTap={{ scale: 0.95 }}
        onClick={() => setServices(prev =>
          prev.includes(option) ? prev.filter(s => s !== option) : [...prev, option]
        )}
        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
          active
            ? 'bg-[#1C2E1E] text-white shadow-md shadow-emerald-950/5'
            : 'bg-white text-[#1C2E1E] border border-[#F1F3F1] hover:bg-[#F1F3F1]/55'
        }`}
      >
        <span className="flex items-center gap-2">
          {active && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Check className="w-4 h-4" />
            </motion.span>
          )}
          {option}
        </span>
      </motion.button>
    )
  })}
</div>

{/* Feedback banner */}
<AnimatePresence mode="wait">
  {services.length > 0 && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-[#FAFBF9] border border-[#F1F3F1] rounded-2xl px-4 py-3 mt-4"
    >
      <p className="text-sm text-[#1C2E1E]">Ready to inquire about: {services.join(', ')}</p>
    </motion.div>
  )}
</AnimatePresence>
```

## Step 6: Landing Page Section Order

**Standard layout:**

1. Announcement bar
2. Nav: logo left, links center, CTA right
3. Hero: full viewport height with ambient motion background
4. Social proof strip
5. Problem section with real numbers
6. Solution section, side by side comparison
7. Feature showcase, 3 core features
8. Pricing, 3 columns with recommended plan highlighted
9. Testimonials or results
10. Final CTA
11. Footer

**Cinematic animated layout** (use when Step 3B blueprint decision selects animated backgrounds):

1. Nav: liquid glass bar over video, logo left, links center, CTA right
2. Hero: full viewport video background with liquid glass UI, dramatic headline with BlurText or character animation, staggered FadeIn entrance sequence (nav → headline → subtext → CTAs → stats/partners)
3. Scroll-driven marquee or parallax image strip (if portfolio or agency)
4. About section with AnimatedText character reveal on scroll
5. Services or features section (can switch to white/light background with rounded top corners for contrast)
6. Projects or case studies with sticky card stacking effect
7. Testimonials or partner logos
8. Final CTA with video background or gradient
9. Footer

---

## Step 7: Responsiveness

- Mobile-first. Start smallest, scale up.
- Touch targets minimum 44x44px
- Hero headline uses clamp()
- All grids collapse to single column on mobile
- Never hide critical actions on mobile, reposition them

---

## Step 8: Production Quality

- Every interactive element has a visible focus state
- All color pairs meet WCAG AA contrast
- Loading states required for every async operation, use skeleton screens not spinners
- Empty states must have a message and a primary action
- Error states must explain what went wrong and what to do next
- All forms validate client-side before submitting with field-level error messages

---

## Step 9: What Not to Do

- Never use purple gradients on white backgrounds
- Never use Inter, Roboto or Arial as the display font
- Never animate everything. Motion must be deliberate.
- Never use more than 3 font weights on the same page
- Never let the primary CTA compete visually with secondary actions
- Never leave a screen without an empty state
- Never use pure black or pure white as background or text
- Never scatter micro-interactions randomly across a page
- Never converge on common font choices like Space Grotesk or Outfit across different projects
- Never use inline JS hover handlers (onMouseEnter/onMouseLeave setting style properties). Use CSS transitions and hover pseudo-classes instead
- Never create a background with just two blurred coloured divs and call it premium. If coded backgrounds are needed, use the patterns from Step 11. If video is appropriate, use the workflow from Step 12
- Never use basic opacity+translate entrance animations without blur. Every entrance must use filter: blur as part of the animation (blur-in pattern from Step 3)
- Never invent a simplified component when a premium pattern exists in the Premium Component Library (Step 5). Use the existing pattern
- Never use em dashes in any generated output, whether code comments, spec files, documentation or UI copy

---


### Hero Discipline Rules

These apply to every hero section regardless of aesthetic direction.

1. **Viewport fit**: all hero content must be fully visible in a 1280x800px viewport without scrolling. If it overflows, reduce element count or font size
2. **Stack discipline**: max 4 stacked text elements in the hero — eyebrow + headline + subhead + CTA. A fifth element (partner strip, stat cards) can sit below the CTA but never between headline and CTA
3. **Top padding cap**: the first visible text must appear no lower than 220px from the top of the viewport accounting for navbar height. A dead zone above 220px means the hero has empty space the user sees before content
4. **CTA proximity**: the primary CTA must be within 40px vertically of the last text element in the hero stack. Dead space between subhead and CTA hurts conversion
5. **No orphan words**: hero headlines must not leave a single word on the last line. Rewrite or adjust font size until line breaks feel intentional

### AI Visual Tells (Hard Bans)

These came from real LLM-generated frontend tests. They are the default patterns a model reaches for when it tries to "look designed." They are hard bans unless the brief explicitly calls for them.

**Banned eyebrow treatments:**
- NO version labels in the hero: V0.6, v2.0, BETA, INVITE-ONLY PREVIEW, EARLY ACCESS, ALPHA — only acceptable when the brief explicitly covers a product launch status
- NO "Brand · No. 01"-style sub-eyebrows — skip all micro-meta decorations
- NO section-number eyebrows: "00 / INDEX", "001 · Capabilities", "06 · how it works". Eyebrows must name the topic in plain language, not enumerate it
- NO "01/4"-style pagination overlaid on images or bento tiles
- NO "Scroll · 001 Capabilities"-style scroll cues anywhere on the page

**Banned layout patterns:**
- NO more than 2 consecutive zigzag (alternating left/right) sections before switching to a different layout
- NO bento grids with more than 6 cells. Max 6, minimum 2 distinct cell sizes
- NO more than one CSS marquee or ticker per page
- NO mixing dark and light page themes within the same hero viewport

**Banned button and CTA patterns:**
- NO primary CTA that does not clearly contrast with its immediate background
- NO CTA button text that wraps to a second line at any viewport above 320px
- NO secondary action that has higher visual weight than the primary CTA

**Banned copy patterns:**
- NO AI cliche verbs: discover, transform, revolutionize, leverage, empower, unlock, streamline, elevate, supercharge. Rewrite to something specific to the product
- NO empty aspirational subheadings: "The future of [thing]", "Reimagining [thing] for the modern era", "[Thing] made simple"
- NO placeholder data in any output: "John Doe", "Sarah Chan", "Acme Inc", "99.9%", "1,234". Use believable organic data: specific names, imprecise numbers (47.2%), contextual brand references

**Banned shape and style patterns:**
- NO mixing corner radius scales within the same component family. If cards are rounded-2xl, inputs are rounded-2xl and buttons are rounded-full. Three different radius scales on one page signals assembled, not designed
- NO photo-credit captions used as decoration: "Field study no. 12 · Ines Caetano" — banned unless attribution is real and required
- NO version footer labels on marketing pages: "v1.4.2", "Build 0048"
- NO locale or time strips used as decoration: "Lisbon, working with founders" — banned for every brief that does not explicitly request editorial location typography

## Step 10: Website Copy and Text Rules

All text written for websites, landing pages and web apps must follow these rules. This applies to headlines, subheadings, body copy, CTAs, navigation labels, error messages, empty states and any other visible text.

### Language and grammar

- Write in British English (colour not color, optimise not optimize, organisation not organization)
- Use periods only when necessary
- Use commas only when necessary and avoid overusing them
- Words must flow and connect naturally within sentences
- Paragraphs must flow, connect and complement each other so nothing reads like separate topics stitched together
- The core idea must carry through all copy on the page so everything connects cohesively
- Do not add or change words unless absolutely necessary for clarity
- Write using proper grammar as a professional English expert would

### Formatting

- No em dashes anywhere in any text on the page, in spec files, in code comments, or in any generated output. Use commas, semicolons, or full stops to separate clauses instead
- Know when to use uppercase and lowercase and apply them correctly
- Headlines and CTAs should be concise and punchy, not bloated with filler words
- Body copy should be scannable with short paragraphs that each make one clear point

### Code standards

- Use camelCase for all JavaScript variables, functions and identifiers
- Add JSDoc comments to every function

---

## Step 11: Coded Animated Backgrounds (Fallback When Video Is Not Feasible)

Use these patterns ONLY when a video background is not possible (technical constraints, no video generation tools available, user explicitly prefers coded animation, or the project is a dashboard/app where video is inappropriate). For marketing pages and landing pages, always try the video workflow in Step 12 first.

These patterns are lightweight, cursor-reactive, require no external assets and look acceptable on any device. But they do not match the cinematic quality of a well-produced video background.

### Pattern 1: Interactive Waves (Perlin Noise Canvas)

A cursor-reactive canvas animation using Perlin noise. Lines flow organically and distort toward the cursor on mouse move and touch. Best for Web3, financial and dark-editorial hero sections.

Use the Waves.tsx component from the project reference files. Key props:

```tsx
<Waves
  lineColor="rgba(212, 168, 83, 0.2)"   // accent colour at low opacity
  backgroundColor="transparent"
  waveSpeedX={0.008}
  waveSpeedY={0.004}
  waveAmpX={28}
  waveAmpY={12}
  xGap={12}
  yGap={36}
/>
```

Layer it over a GrainGradient for maximum depth:

```tsx
<div className="relative w-full h-screen">
  <GrainGradient
    style={{ position: 'absolute', inset: 0 }}
    colorBack="hsl(220, 30%, 5%)"
    colors={['hsl(42, 70%, 50%)', 'hsl(220, 80%, 30%)', 'hsl(158, 70%, 25%)']}
    speed={0.4}
    softness={0.8}
    intensity={0.3}
  />
  <Waves
    lineColor="rgba(212, 168, 83, 0.18)"
    backgroundColor="transparent"
    waveSpeedX={0.008}
    waveSpeedY={0.004}
  />
  <div className="relative z-10">{children}</div>
</div>
```

### Pattern 2: Shader Grain Gradient

GPU-accelerated animated gradient with film grain. Slow, ambient, premium. Install with `npm install @paper-design/shaders-react`.

```tsx
import { GrainGradient } from '@paper-design/shaders-react'

<GrainGradient
  style={{ height: '100%', width: '100%' }}
  colorBack="hsl(0, 0%, 0%)"
  softness={0.76}
  intensity={0.45}
  speed={0.5}
  colors={['hsl(42, 70%, 50%)', 'hsl(220, 80%, 30%)', 'hsl(158, 70%, 25%)']}
/>
```

Adjust `colors` to match the product's accent palette. Use `speed={0.3}` to `speed={0.6}` for ambient backgrounds.

### Pattern 3: Ambient Glow Blobs (CSS Only)

For interior pages that need atmosphere without full canvas animation:

```tsx
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
    w-[700px] h-[500px] rounded-full opacity-20
    bg-[var(--accent)] blur-[160px] animate-pulse-soft" />
  <div className="absolute bottom-0 right-1/4
    w-[400px] h-[300px] rounded-full opacity-10
    bg-[var(--accent)] blur-[120px] animate-float" />
</div>
```

Use on dashboard and marketplace interior pages. Never on the same page as the Waves canvas.

### Pattern 4: Colour-Adaptive Gallery Background

Used in sliders where the ambient background adapts to the active item's colour:

```tsx
<motion.div
  key={currentIndex}
  initial={{ opacity: 0, scale: 1.1 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
  className="absolute inset-0"
  style={{
    background: `
      radial-gradient(ellipse at 30% 20%, ${activeColor1}66 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, ${activeColor2}66 0%, transparent 50%),
      linear-gradient(180deg, #0a0a0a 0%, #111111 100%)
    `,
  }}
/>
```

Pass the dominant colour of the active card as `activeColor1` and `activeColor2`. Use the asset type accent colour or extract the dominant colour from artwork using canvas.

---

## Step 12: AI-Generated Video Backgrounds (Rigid Workflow)

When Gate 3 selects "Animated video background" this workflow activates. Follow every step in order. Do not skip steps. Do not combine steps. Each step that says STOP AND WAIT means the AI must ask the user, present the output, and wait for their response before continuing.

Video backgrounds are the PRIMARY recommended approach for all marketing pages, landing pages, portfolios, launch pages and creative sites. Coded animations (Waves, GrainGradient) are the FALLBACK for when video is not feasible. For premium output, always push for video first.

### STEP 0: Asset Pipeline Pre-Step (Run Before Any Code)

Before any code is written, the FRONTEND_SPEC must have all assets locked. This step happens DURING spec generation, not during code building.

**For every section that needs imagery:**

1. **Write the asset brief** in the spec (see Step 3D Rule 4). Describe the visual, the mood, the motion type, and the resolution.
2. **Generate or source the still image:**
   - Use `generate_image` tool for AI-generated stills
   - Search Pinterest with specific keywords per project type:
     - Dental/medical: "modern dental clinic interior photography", "dental treatment close-up warm lighting"
     - Agency/creative: "dark atmospheric abstract smoke", "cinematic blue teal particles"
     - SaaS/product: "dark gradient abstract mesh", "minimal tech background dark"
     - Restaurant/hospitality: "restaurant interior warm lighting photography", "food photography dark moody"
     - Real estate: "luxury interior architecture photography", "modern apartment aerial view"
   - Use Unsplash/Pexels as a last resort for stock photography
3. **Animate the still into video (for video backgrounds):**
   - Feed the approved still image into an AI video tool:
     - **Seedance 2.0** (via Higgsfield) -- recommended, produces cinematic results
     - **Runway Gen-3/4** -- text-to-video or image-to-video
     - **Kling** -- image-to-video with camera motion control
     - **Pika** -- stylised video effects
   - Provide the video generation prompt from STEP 4 below
   - Settings: 6-10 seconds, 1080p minimum, MP4 H.264, under 10MB, seamless loop if available
4. **Host the asset:**
   - Upload MP4 to a CDN: Cloudflare R2 (free), Vercel Blob, or any S3-compatible storage
   - For development: place in `public/` folder
   - Get the final URL and paste it back into the FRONTEND_SPEC
5. **Lock the URL in the spec.** Replace `[ASSET PENDING: description]` with the real URL. Only THEN does code building begin.

**Video brief template** (include in the spec for each video asset):

```
VIDEO BRIEF:
  Subject: [what the video shows]
  Motion type: [slow drift / particle flow / camera orbit / atmospheric fog / liquid flow / etc.]
  Speed: [slow ambient / moderate cinematic / dynamic]
  Colour palette: [from Gate 5 palette, specify 2-3 hex values]
  Mood: [cinematic / calm / energetic / moody / ethereal]
  Duration: [6-10 seconds]
  Loop: [seamless / crossfade (use FadingVideo)]
  Aspect: 16:9 landscape
  File: MP4 H.264, under 10MB
```

This pre-step ensures assets are curated and ready before a single line of code is written. The gap between a placeholder div and a real cinematic video background is the gap between "good" and "premium".

### STEP 1: Check for existing video

Ask the user: "Do you already have a video file or URL for the background?"

If YES with file or URL provided: skip to STEP 5.
If NO: proceed to STEP 2.

### STEP 2: Check for source image

Ask: "Do you have a still image you want animated as the background? If yes share it. If not I will create one based on the project theme."

If user provides an image: analyse it, proceed to STEP 3.
If user says no: proceed to STEP 2B.

### STEP 2B: Generate source image

Using the project's aesthetic direction and colour palette (from Gates 1 and 5), generate a high-quality still image using the generate_image tool. The image must:

- Match the colour palette chosen in Gate 5
- Suit the project's subject matter and industry
- Have depth, atmosphere and visual interest (not flat or generic)
- Work as a background with appropriate contrast for text overlay
- Be dark enough for white text (dark themes) or light enough for dark text (light themes)
- Avoid cliche AI imagery: no generic floating shapes, no bland abstract gradients, no stock-photo-style scenes

Present the generated image to the user for approval.

If approved: proceed to STEP 3.
If rejected: ask what to change, regenerate, repeat until approved.

### STEP 2C: Character-based video approach (alternative to 2B)

For hero sections featuring a focal character, avatar or 3D object (rather than ambient atmosphere), use this specialised workflow:

1. **Find a reference character.** Search Pinterest for "holographic avatar", "3D character bust", "futuristic head sculpture" or similar terms matching the project aesthetic. Show the user 3-5 options and let them pick one.
2. **Generate multi-angle views.** Using ChatGPT (or similar image generation tool), create the same character from multiple angles: front, left profile, right profile, three-quarter view. Prompt with "make it look left", "make it look right" etc. while providing the reference image. Aim for 3-5 consistent angles.
3. **Animate with multi-shot.** In Kling (Video 3.0) or similar tool, upload all angle images. Use "Bind elements to enhance consistency" to keep the character coherent across frames. Prompt: "animate". This produces a short video of the character rotating or shifting naturally between the angles.
4. **Export.** Duration 5-6 seconds, 1080p, MP4. The video does NOT need to loop seamlessly because it will be used with the cursor-scrubbing hook (useVideoScrub), not autoplay.

After generating, proceed to STEP 5 and use the **cursor-controlled scrubbing** integration (useVideoScrub from Step 3B) instead of the standard autoplay integration. The character responds to mouse movement, creating an interactive premium experience.

### STEP 2D: Evaluate and Prepare the Reference Image

Before proposing animation directions, evaluate the source image across three dimensions: colour, animatable elements, and framing. This step applies whether the image was provided by the user, found on Pinterest, or AI-generated.

**Colour evaluation:**

Do NOT automatically swap colours. Evaluate first:

1. **Does the image's accent colour match the project palette?** If the project uses teal (#00d4aa) and the image has teal glowing accents, keep them. No change needed.
2. **Does the image's accent colour clash with the project palette?** If the project uses teal but the image has red glowing accents, the colour needs to change. Describe the swap in the generation prompt by specifying: "Replace all [current colour] elements with [target colour, including hex code]. This includes: [list every glowing, lit, or coloured element in the image]." Be exhaustive in the list so no red artifacts remain.
3. **Is the image's accent colour different but complementary?** Sometimes an image has a colour that is not in the project palette but still looks good alongside it. A warm amber glow on a teal-themed site can create interesting contrast. If the colour works aesthetically, keep it. The palette is a guide, not a prison.
4. **Is the image monochrome or neutral?** Wireframe renders, dark glossy surfaces, and minimal figures with no accent colour do not need colour swapping. They work with any palette because their visual interest comes from form and lighting, not colour.

**Image analysis for animation:**

Examine the image and identify what can realistically animate. The animation direction is driven by WHAT the image shows, not picked from a generic menu. Different images demand different animations:

| What the Image Shows | Natural Animation Possibilities |
|---|---|
| Character with glowing cables, circuits, or energy lines | Energy flowing through the lines (igniting, pulsing, filling from one point outward) |
| Character with closed or obscured eyes | Eyes opening, visor lighting up, gaze activating |
| Character holding a weapon (blade, staff, etc.) | Drawing the weapon, igniting the weapon's edge, shifting into a ready stance |
| Character in a static pose | Subtle breathing motion, weight shift, slow head turn toward camera |
| Abstract geometric object (crystal, sphere, polyhedron) | Slow rotation, internal light shifting, facets refracting, morphing between shapes |
| Hands reaching toward each other | Closing the gap, energy sparking between fingertips, connection forming |
| Figure with flowing hair, cloak, or particles | Hair/particles drifting in wind, colour shifting through the flow, swirling |
| Wireframe or schematic render | Lines drawing themselves in sequence, nodes lighting up, data flowing along edges |
| Featureless mannequin or minimal bust | Slow rotation revealing different angles, light reflections shifting across surface |
| Any character on a dark background | Ambient glow pulsing behind the character, atmospheric particles drifting |

Identify 2-3 animatable elements from the image. These become the basis for the animation proposals in STEP 3.

**Framing decisions:**

If the source image needs to be reframed for the hero section (e.g. portrait image needs to become 16:9 landscape), decide:

1. **Expand or crop?** If the image has enough negative space, cropping to 16:9 may work. If not, expand the canvas with matching background colour (usually pure black for dark themes) and reposition the subject.
2. **Where does the subject sit in the new frame?** Use the Character/Element Positioning guide from Technique 8 to decide. This depends on where the hero copy will sit on the page.
3. **Does the subject bleed off any edge?** Large characters can bleed off the bottom and one side for dramatic scale. Small objects should be fully contained with breathing room.

Present the framing decision to the user with a quick explanation (e.g. "I will expand the canvas to 16:9 and position the character in the right third so hero copy can sit on the left"). STOP AND WAIT for approval.

**Reference image prompting structure:**

When using a reference image to generate a modified version (e.g. colour swap, reframing, pose change), structure the prompt in two parts:

1. **Describe everything that stays the same.** Call out every visible detail in the reference: skin texture, material finish, hardware shapes, cable routing, lighting angle, facial features (or lack of), pose, camera angle. Be exhaustive. The AI needs to know what to preserve.
2. **List ONLY the changes.** State each change explicitly with "Change X from Y to Z" format. Do not describe the full image again with changes mixed in. Separating preservation from changes prevents the AI from inventing new details.

**The cascading reference rule:**

When generating multiple frames from the same character (e.g. a start frame and an end frame for animation), always use the ORIGINAL reference image as the base for ALL generated frames. Do not use a generated image as the reference for the next generation. AI artifacts compound across generations: small inconsistencies in frame 1 become large distortions in frame 2. Both frames should reference the same original source so they stay consistent with each other.

**Frame planning for animation:**

If the animation has a clear start state and end state (e.g. dark to lit, closed to open, sheathed to drawn), plan both frames before generating anything:

1. **Start frame**: What does the image look like at second 0? Describe the state of every animatable element (cables unlit, eyes closed, blade sheathed, object still)
2. **End frame**: What does it look like at the final second? Describe the end state of every animatable element (cables glowing, eyes open, blade drawn, object transformed)
3. **What changes between them**: List every difference. This becomes the animation prompt.

Not all animations need distinct start and end frames. Looping ambient animations (slow rotation, breathing glow, drifting particles) have no start/end distinction. Interactive animations (cursor-driven scrubbing) are controlled by the user, not by keyframes. Frame planning applies only to narrative sequences that play once on page load then hold or loop the end state.

**Interaction mode considerations:**

The animation does not have to autoplay. Consider all options:

| Mode | How It Works | Best For |
|---|---|---|
| **Autoplay loop** | Video plays automatically and loops continuously | Ambient atmosphere backgrounds, abstract scenes, slow rotations |
| **Play-once then hold** | Animation plays on page load (e.g. awakening sequence), then holds the final frame with a subtle loop (breathing, pulsing) | Narrative sequences, character activation, dramatic reveals |
| **Cursor-driven scrubbing** | Video position maps to horizontal mouse movement. User controls the animation by moving their cursor | Character rotation reveals, product showcases, interactive exploration. Falls back to autoplay on touch devices |
| **Scroll-driven** | Video progress maps to scroll position. As user scrolls down, the animation advances | Story-driven landing pages, timeline narratives, product assembly sequences |

Choose the interaction mode based on what makes sense for the image and the product. Present the recommendation to the user with reasoning.

### STEP 3: Propose animation directions

Based on the source image and project aesthetic, propose exactly 3 specific animation directions. Each must describe:

1. Camera movement (drift, pan, zoom, orbit, static)
2. Element motion (particles, light shifts, fog, liquid flow, atmospheric effects)
3. Speed (slow ambient, moderate cinematic, dynamic)
4. Loop behaviour (seamless loop, crossfade loop)
5. Interaction mode: **autoplay** (ambient background, uses useFadingVideo) or **cursor-scrubbing** (interactive, uses useVideoScrub from Step 3B. Best for focal characters and objects)

Format each as a single descriptive sentence. Example proposals:

**Option A**: "Slow horizontal camera drift with subtle gold light caustics rippling across the surface. Atmospheric particle motes rising gently. Seamless 8-second loop."

**Option B**: "Static camera with volumetric fog drifting left to right. Depth-of-field blur pulsing subtly. Light flares shifting warm to cool. 6-second crossfade loop."

**Option C**: "Gentle push-in zoom with parallax depth layers. Foreground elements slightly defocused creating bokeh. Background glow shifting between brand accent colours. 10-second seamless loop."

Present all 3 to the user. STOP AND WAIT for their choice.

### STEP 4: Generate video prompt

Based on the chosen direction, write a detailed, ready-to-paste prompt. Present it in this exact format:

---

**VIDEO GENERATION PROMPT**

Paste this into Higgsfield (Seedance 2.0), Kling AI, Runway, Pika, or Nano Banana:

"[Complete prompt with: camera angle, subject description from the source image, motion type and direction, speed, colour palette from Gate 5, lighting quality, mood, atmospheric effects, loop behaviour. Be hyper-specific. Never use vague words like 'beautiful' or 'nice'. Every visual detail must be described.]"

**Recommended settings:**
- Duration: 6-10 seconds
- Resolution: 1080p minimum (4K preferred)
- Aspect ratio: 16:9 (landscape)
- Export format: MP4 (H.264)
- Loop mode: seamless (if available in the tool)
- File size target: under 10MB

After generating the video, share the file or URL back here and I will integrate it into the hero section.

---

STOP AND WAIT for the user to generate and share the video.

### STEP 5: Integrate the video

Once the video is available:

1. **Check file size.** If over 10MB recommend compression or HLS streaming (use the useHlsVideo hook from Step 3B)
2. **Choose interaction mode based on STEP 3 decision:**
   - **Autoplay mode** (ambient atmosphere backgrounds):
     - `<video autoplay muted playsinline preload="auto">` with the source URL
     - If the video loops cleanly: add `loop` attribute
     - If the video has a visible jump at the loop point: omit `loop` and use the `useFadingVideo` crossfade handler from Step 3B
   - **Cursor-scrubbing mode** (focal characters, objects, product reveals):
     - `<video muted playsinline preload="auto">` — NO `autoplay`, NO `loop`
     - Use the `useVideoScrub` hook from Step 3B
     - The video responds to horizontal mouse movement, scrubbing forward and backward
     - Best for character-based videos from STEP 2C
3. **Position:** `absolute inset-0 w-full h-full object-cover z-0` with `background-color` fallback matching the video's dominant dark tone
4. **Layer content above** using liquid-glass components from the component library
5. **Add noise grain overlay** for texture depth (SVG fractalNoise pattern from Technique 7)
6. **Mobile handling:** check `navigator.connection.effectiveType` when available, disable autoplay on connections slower than 4G, show the source image as a static fallback instead. For scrubbing mode, fall back to autoplay on touch devices since mousemove is not available

Present the integrated result to the user. STOP AND WAIT for approval before finalising.


---

## Step 13: Image Strategy for Platforms With No User Content Yet

When a marketplace or platform launches with no real user-generated imagery, use this phased strategy:

**Phase 1 (no users yet)**: use coded SVG components as the visual content. For an NFT marketplace, SVG card templates rendered as React components fill the grid. No stock photos. No placeholder images. The code is the art.

**Phase 2 (early users)**: mix real user content with SVG fallbacks. If a collection has no custom artwork, show the SVG standard template. If it has custom artwork, show that.

**Phase 3 (established content)**: the grid is fully populated by real user content. SVG templates are fallbacks only for collections without custom artwork.

Never use generic stock photography as placeholder imagery in a financial or Web3 product. Coded visuals are always preferable to inappropriate stock images. The SVG card templates are also what gets rendered in the featured collections carousel and any promotional sections until real issuer artwork replaces them.

---

## Step 14: When to Use v0

When the coded patterns and Framer Motion cannot produce the quality needed for a specific component, generate it in v0.dev and integrate it. Use v0 for: complex hero animation layers, physics-based drag behaviour, advanced data visualisations, or when a client reference site has a specific effect that cannot be cleanly replicated from scratch.

### v0 prompt template

> Build a [component name] in Next.js with TypeScript and Tailwind CSS. Use Framer Motion for animations. Aesthetic: [describe the specific project tone, colours and font choices]. [Describe the component and its exact behaviour in detail]. No [list anything to avoid]. Export as a named React component with TypeScript props and JSDoc on every function.

### Integrating v0 output

After pasting v0 output into the project:
1. Replace all hardcoded hex values with CSS custom property references (var(--accent), var(--bg-primary), etc.)
2. Add JSDoc to every function
3. Ensure all variables and identifiers use camelCase
4. Replace any placeholder copy with real product copy
5. Check the animation is disabled or reduced on mobile if it would affect performance

---

## Step 15: Quality Audit (Run Before Presenting Any Output)

Before presenting any frontend output to the user, mentally run through every check below. If any check fails, fix it before presenting. This is the final gate between "AI slop" and premium output.

### Visual Hierarchy

- Does the hero use the full viewport height (min-h-screen or h-screen)?
- Is there one dominant visual element that draws the eye first?
- Is the headline the largest text on the page with dramatic sizing using clamp() for fluid scaling?
- Is there clear visual separation between sections (spacing, colour shifts, borders)?

### Animation Quality

- Are all animations using custom easings (cubic-bezier(0.16, 1, 0.3, 1) or similar), not plain 'linear' or 'ease'?
- Is the hero entrance sequence staggered with specific delays (0.4s, 0.8s, 1.1s etc.), not all simultaneous?
- Do entrance animations include filter effects (blur-in) in addition to opacity and translate?
- Are hover animations present on all interactive elements (buttons, links, cards)?
- Are animation durations between 150-800ms (not too fast to notice, not too slow to feel sluggish)?

### Design System Consistency

- Is the colour palette applied consistently via CSS variables? No hardcoded hex values in component JSX.
- Are font sizes using a consistent scale? clamp() for hero headlines, rem for body text.
- Is spacing consistent using the defined scale (4, 8, 12, 16, 24, 32, 48, 64, 80px)?
- Are border-radius values consistent across similar components?

### Glassmorphism Quality (if applicable)

- Do glass elements have the ::before gradient border pseudo-element (the liquid-glass pattern)?
- Is backdrop-filter: blur() applied with the -webkit prefix for Safari support?
- Are glass elements using rgba backgrounds, not hex values with opacity?
- Is the glass effect visible and readable but not overwhelming?

### Background Quality

- Is there a noise/grain texture overlay for depth (SVG fractalNoise pattern)?
- If video: is there a solid background-color fallback matching the dominant video tone?
- If video: is preload="auto" set on the hero video?
- If coded animation: are particles/effects clearly visible against the background (not faint dots that read as static noise)?

### Typography Quality

- Is the display font non-generic (not Inter, Roboto, Arial, or Space Grotesk as the primary heading font)?
- Is font loading handled (Google Fonts import URL or @font-face declaration)?
- Are line-heights tight for headings (0.8-1.1) and comfortable for body text (1.5-1.7)?
- Is letter-spacing negative for large headings (-0.01em to -0.04em)?

### Navigation Quality

- Does the nav use a non-default pattern (not the banned logo-left, 3-links-centre, button-right layout)?
- Is the nav properly layered above content (z-50 for fixed nav, z-10 for relative content)?
- Does mobile nav have a proper hamburger animation (3 spans transitioning to X)?

### Responsive Quality

- Does the layout collapse gracefully on mobile (single column, stacked elements)?
- Are touch targets at least 44x44px on mobile?
- Is the hero headline readable on mobile (not overflowing, uses clamp())?

### Cross-Reference Check (Did You Actually Use What This Skill File Provides?)

- Did you use a component from the Premium Component Library (Step 5) for navbars, stat cards, badges, CTA buttons, and partner strips? If you invented a simpler version instead of using the premium pattern, go back and replace it.
- Does your output match the level of detail shown in the Golden Reference Compositions (Step 3C)? Compare your z-index layering, entrance animation delays, typography sizing, and component specificity against any of the three references. If yours is less detailed, it is not ready.
- Did you use the liquid glass classes from Step 3B for any glass-effect components? If you used plain rgba backgrounds without the ::before gradient border, go back and apply the full liquid-glass pattern.
- Did entrance animations use blur-in (filter: blur + opacity + translate), not just opacity + translate? Basic fadeUp without blur is below the quality bar.
- For landing pages and marketing pages: did you follow the video background workflow (Step 12) or at least ask the user about background treatment (Gate 3)? If the background is just two blurred coloured divs, that is not premium.

### AI Slop Detection (The Final Check)

Look at the output objectively and ask:

- Would a designer see this and immediately think "AI made this"? If yes, what specifically gives it away?
- Is the colour palette generic (plain blue, plain purple, plain green with no sophistication)?
- Are components using default border-radius (rounded-lg everywhere) and default shadows?
- Is the layout predictable and grid-like with no visual tension or unexpected elements?
- Does every section look structurally identical (same padding, same card layout, same spacing)?
- Are there any elements that feel "added for the sake of it" rather than serving the design?

If ANY of these checks reveals a problem, fix it before presenting. The goal is output that a professional designer would not be embarrassed to show a client.

---

## Step 16: UX Quality Standards

These rules supplement the visual design guidance in Steps 1-15. They cover the non-visual dimensions of quality: accessibility, performance, interaction behaviour, forms, dark mode contrast and navigation integrity. Every project must pass these checks before any output is presented.

Priority order: follow 1 to 6. Fix critical failures first before addressing lower-priority items.

---

### Priority 1: Accessibility (Critical)

- **colour-contrast**: minimum 4.5:1 for normal text and 3:1 for large text (18px+ bold or 24px+ regular)
- **focus-states**: visible focus rings on every interactive element (2-4px outline). Never remove focus rings. Use `:focus-visible` to keep them for keyboard users while hiding them for mouse clicks
- **alt-text**: all meaningful images have descriptive alt text. Decorative images use `alt=""`
- **aria-labels**: every icon-only button has an `aria-label`. Never rely on a tooltip as the only label
- **keyboard-nav**: tab order matches the visual reading order. Every interactive element is reachable by keyboard
- **form-labels**: every input has a visible `<label>` with a matching `for` attribute. Never use placeholder as the sole label
- **skip-links**: add a "Skip to main content" link as the first focusable element on every page
- **heading-hierarchy**: use h1 through h6 sequentially. Never skip a level (h1 directly to h3 with no h2 is not acceptable)
- **colour-not-only**: never convey information using colour alone. Pair colour with an icon, pattern or text label
- **reduced-motion**: wrap all non-essential animations in `@media (prefers-reduced-motion: reduce)` and reduce or disable them. Entrance animations can fade in at zero translate instead of sliding. Never block content from being readable if animations are off
- **keyboard-shortcuts**: do not override or prevent browser and operating system keyboard shortcuts
- **focus-management**: after a modal opens, move focus to the first interactive element inside it. After it closes, return focus to the trigger element. After a form submit error, move focus to the first invalid field

---

### Priority 2: Performance (High)

- **image-optimisation**: use WebP or AVIF for all images. Provide `srcset` and `sizes` for responsive delivery. Set `loading="lazy"` on every image not in the initial viewport
- **image-dimensions**: always declare `width` and `height` on `<img>` elements or use `aspect-ratio` in CSS to prevent cumulative layout shift (CLS target: under 0.1)
- **font-loading**: use `font-display: swap` or `font-display: optional` to prevent invisible text during font load. Preload only the critical font file for the above-the-fold display font. Do not preload every weight variant
- **bundle-splitting**: split JavaScript by route using dynamic import or Next.js `dynamic()`. Users should not download code for pages they have not visited
- **third-party-scripts**: load all third-party scripts (analytics, chat widgets, tag managers) with `async` or `defer`. Audit and remove any that are not actively used
- **virtualise-lists**: any list with more than 50 items must use virtualisation (react-window, tanstack-virtual). Rendering 500 DOM nodes at once kills scroll performance on every device
- **debounce-throttle**: wrap scroll, resize and high-frequency input event handlers in debounce or throttle. Raw scroll listeners running on every frame cause jank
- **content-jumping**: reserve space for async content using `min-height`, skeleton placeholders or `aspect-ratio` so the layout does not shift when data loads
- **main-thread-budget**: keep per-frame JavaScript work under 16ms for 60fps. Move heavy computation off the main thread using Web Workers when needed

---

### Priority 3: Animation Refinements (Medium)

These rules supplement the animation guidance in Step 3. Apply them to every animation in every project.

- **spring-physics**: prefer spring-based curves over cubic-bezier for interactive elements (buttons, modals, drawers, cards). In Framer Motion use `type: 'spring', stiffness: 300, damping: 25`. Spring animations feel natural because they model real physics rather than a predetermined path
- **exit-faster-than-enter**: exit animations must be 60-70% of the enter duration. A modal that takes 280ms to open should take roughly 180ms to close. Faster exits make the UI feel responsive rather than sluggish
- **stagger-per-item**: stagger list and grid item entrances by 30-50ms per item. Never animate all items simultaneously. Never use a stagger longer than 80ms per item or the last item arrives too late
- **interruptible**: every animation must be interruptible. If a user clicks or navigates while an animation is running it must cancel cleanly. Never queue animations or block user input
- **modal-motion**: modals and bottom sheets should animate from the direction of their trigger element (scale-up from a button below, slide-in from the edge they relate to). This spatial relationship reduces disorientation
- **navigation-direction**: forward navigation (going deeper into a hierarchy) animates new content in from the right. Backward navigation (going back) animates in from the left. Maintain this consistently across every route transition
- **opacity-threshold**: elements fading out must not linger below opacity 0.2. Either fade fully to zero or keep them fully visible. A half-transparent non-interactive element confuses users
- **no-blocking-animation**: never block pointer events or user input during an animation. The UI must remain interactive throughout every transition
- **layout-shift-avoid**: never animate `width`, `height`, `top`, `left`, `margin` or `padding`. These trigger layout recalculations on every frame. Always animate `transform` and `opacity` only

---

### Priority 4: Forms and Feedback (Medium)

- **inline-validation**: validate on blur (when the user leaves a field), not on every keystroke. Showing errors while the user is still typing is hostile. Show a success indicator after blur when the value is valid
- **error-recovery**: every error message must state the cause and the fix. Not "Invalid input" but "Email must include an @ symbol." The user needs to know what to do, not just that they failed
- **error-placement**: show errors directly below the field they relate to. Associate them with the input via `aria-describedby` so screen readers announce the error
- **focus-management-form**: after a form submission that returns errors, automatically move focus to the first invalid field. Never leave focus on the submit button while errors are displayed below
- **multi-step-progress**: any form or flow with more than 2 steps must show a progress indicator (step numbers, progress bar, or labelled breadcrumb). Users must always know how many steps remain and be able to go back
- **destructive-emphasis**: destructive actions (delete, remove, cancel subscription) use semantic danger red and are visually and spatially separated from the primary action. Never place a destructive button adjacent to a confirm button with similar styling
- **disabled-states**: disabled elements use 0.38-0.5 opacity and a `not-allowed` cursor. They must have the `disabled` attribute for accessibility. Never make an element look disabled but remain clickable
- **progressive-disclosure**: do not show all options and fields upfront. Show the most common path first and reveal advanced options behind a toggle or a secondary step. Overwhelming users on first render causes abandonment
- **success-feedback**: every completed action needs visible confirmation within 300ms. A toast, a checkmark, a colour change. Never silently complete an action with no response to the user
- **form-autosave**: long forms (more than 4 fields) should autosave a draft to localStorage or the server periodically. Users must not lose work from an accidental navigation or browser close

---

### Priority 5: Dark Mode Contrast (Medium)

These rules apply any time a dark mode or dark-default theme is implemented.

- **primary-text-dark**: primary text on dark surfaces must maintain at least 4.5:1 contrast. Near-white on near-black is almost always fine. Mid-grey on dark grey is not
- **secondary-text-dark**: secondary and muted text on dark surfaces must maintain at least 3:1 contrast. Test this explicitly because it is the most common failure in dark mode designs
- **borders-dark**: dividers and borders that are visible in light mode must remain visible in dark mode. A `border-white/10` that looks fine on a dark card can disappear on a slightly lighter dark surface
- **state-contrast-parity**: hover, pressed and disabled states must be equally distinguishable in both light and dark themes. Define interaction states for both themes, never just one
- **token-driven-theming**: use semantic colour tokens that change at `[data-theme='dark']` or via `prefers-color-scheme`. Never hardcode hex values in component files. This rule is already in Step 2 but applies critically here: a hardcoded light-mode colour becomes illegible in dark mode
- **modal-scrim**: modal and drawer backdrops must be dark enough to visually isolate the foreground. Use `rgba(0,0,0,0.5)` to `rgba(0,0,0,0.65)`. A scrim that is too light leaves the background competing with the modal content

---

### Priority 6: Navigation Integrity (High)

These rules apply to multi-page applications and SPAs. They supplement the nav layout rules in Step 2B.

- **deep-linking**: every meaningful screen and state must be accessible via a direct URL. Users must be able to share a link to a filtered view, a specific item or a particular step in a flow
- **state-preservation**: navigating back must restore the previous scroll position, active filters and input state. Never reset a list to the top when the user navigates away and returns
- **back-behaviour**: back navigation must always behave predictably. Never silently reset the navigation stack or jump the user to the home screen unexpectedly
- **breadcrumbs-deep**: any page that is 3 or more levels deep in the information hierarchy must show breadcrumbs so users can orient themselves and navigate up
- **adaptive-navigation**: on screens wider than 1024px use a sidebar for primary navigation. On smaller screens use a bottom bar or hamburger. Never force a sidebar on mobile or a bottom bar on desktop
- **overflow-menu**: when nav actions exceed available space, move the excess into a labelled overflow menu. Never truncate nav labels, never wrap a nav bar, never put more than 5 items in a bottom navigation
- **focus-on-route-change**: after every page or route transition, move focus to the main content heading or region. Screen reader users need this to understand that a navigation occurred

---

### Pre-Delivery Checklist (Full)

Run every check below before presenting any frontend output. This extends the Quality Audit in Step 15.

**Accessibility**
- [ ] All colour pairs meet 4.5:1 contrast (normal text) and 3:1 (large text)
- [ ] Focus rings visible on every interactive element
- [ ] All icon-only buttons have an aria-label
- [ ] Tab order matches visual reading order
- [ ] Every form input has a visible label (not placeholder-only)
- [ ] Skip to main content link is the first focusable element on every page
- [ ] Heading hierarchy is sequential (no skipped levels)
- [ ] No information conveyed by colour alone
- [ ] Animations respect `prefers-reduced-motion`

**Performance**
- [ ] Images are compressed and sized appropriately. WebP or AVIF preferred for new assets. Existing JPEG/PNG files should be used as-is.
- [ ] Hero image uses `loading="eager"`, all others use `loading="lazy"`
- [ ] Display font uses `font-display: swap`
- [ ] No third-party scripts blocking the main thread
- [ ] Lists with 50+ items are virtualised

**Animation**
- [ ] Exit animations are shorter than enter animations (60-70% of enter duration)
- [ ] List items stagger at 30-50ms per item
- [ ] No animation blocks user input or pointer events
- [ ] No `width`, `height`, `top` or `left` properties animated (use `transform` only)
- [ ] Spring physics used on interactive elements (buttons, modals, drawers)

**Forms**
- [ ] Validation fires on blur, not on keystroke
- [ ] Every error message states the cause and how to fix it
- [ ] After submit error, focus moves to the first invalid field
- [ ] Multi-step forms show a step indicator
- [ ] Destructive actions are red and visually separated from primary actions
- [ ] Disabled elements have 0.38-0.5 opacity and the `disabled` attribute

**Dark Mode**
- [ ] Primary text achieves at least 4.5:1 contrast in dark mode
- [ ] Secondary text achieves at least 3:1 contrast in dark mode
- [ ] Borders visible in both light and dark modes
- [ ] No hardcoded hex values in component files (CSS variables only)
- [ ] Modal scrim is `rgba(0,0,0,0.5)` or stronger

**Navigation**
- [ ] Every key screen has a shareable URL
- [ ] Back navigation restores scroll position and filter state
- [ ] Breadcrumbs shown on pages 3 or more levels deep
- [ ] Focus moves to main content region after every route change

---

## Step 17: Advanced Component Architecture

These rules cover specific component patterns, layout techniques and code conventions that raise the quality ceiling above what Steps 1-16 already mandate. None of these repeat existing rules.

---

### The Double-Bezel Card (Doppelrand Architecture)

Never place a premium card, image or container directly against the page background. It must look like a machined physical object sitting inside a tray. Use nested enclosures with concentric border radii:

**Outer shell** (the tray):
```html
<div class="p-2 rounded-[2rem] bg-white/5 ring-1 ring-white/10">
```

**Inner core** (the content surface):
```html
  <div class="rounded-[calc(2rem-0.5rem)] bg-[var(--bg-secondary)]
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] p-8">
    <!-- content -->
  </div>
</div>
```

The inner radius is always mathematically smaller than the outer (subtract 0.375rem to 0.5rem). This creates true concentric curves, not two rectangles with rounded corners. Use on every major card, feature panel, image container and input group in premium builds.

---

### Button-in-Button Trailing Icon

When a CTA button contains a directional icon (arrow, chevron, external link), never place the icon naked next to the label text. It must sit inside its own distinct circular wrapper flush with the button's inner right edge:

```html
<button class="flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--accent)]">
  <span>Try Sentinel</span>
  <span class="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10
               flex items-center justify-center
               group-hover:translate-x-0.5 group-hover:-translate-y-px
               transition-transform duration-200">
    <ArrowUpRight size={14} />
  </span>
</button>
```

On hover, the inner icon circle translates diagonally (x+1, y-1) and scales up slightly. This creates internal kinetic tension that reads as premium without moving the whole button.

---

### Viewport Height: Always min-h-[100dvh]

Never use `h-screen` or `min-h-screen` for full-height hero sections. Use `min-h-[100dvh]` instead.

`h-screen` maps to `100vh` which on iOS Safari includes the browser chrome. When the toolbar collapses as the user scrolls, the viewport grows and the section jumps. `100dvh` (dynamic viewport height) accounts for the actual visible area at any moment and eliminates this jump entirely. This applies to every hero section, full-screen modal and any element intended to fill the visible screen.

---

### Backdrop Blur: Fixed and Sticky Elements Only

Apply `backdrop-filter: blur()` exclusively to elements with `position: fixed` or `position: sticky` (navbars, overlays, modals, drawers). Never apply blur filters to elements inside a scrolling container.

Blurring a scrolling element forces the GPU to repaint the blurred region on every scroll frame. On mobile this causes severe frame drops and makes the page feel broken. The blur effect on navbars works because they sit above the scroll layer and only repaint when explicitly triggered.

---

### Tinted Shadows (Not Generic Dark Shadows)

Never use a generic dark shadow (`box-shadow: 0 4px 16px rgba(0,0,0,0.3)`). It reads as a default browser shadow and instantly cheapens the component.

When elevation is needed, tint the shadow to the background or accent hue:

```css
/* On a dark teal-accent surface */
box-shadow: 0 16px 48px rgba(0, 212, 170, 0.08), 0 4px 12px rgba(0, 0, 0, 0.4);

/* On a light cream surface */
box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.06);

/* Diffusion shadow (Bento grid panels) */
box-shadow: 0 20px 40px -15px rgba(var(--shadow-tint), 0.05);
```

The shadow should feel like the object is casting light onto its own surface, not a generic drop copied from a stylesheet.

---

### Dashboard Hardening: Borders Over Cards

For dense data interfaces (dashboards, monitoring panels, admin views) with high information density: default to `border-t`, `divide-y` and negative space to separate data groups. Do not box every metric in a card with its own background, border and shadow.

Card containers communicate elevation and isolation. In a dense UI where everything needs to be scannable at a glance, boxing each item adds visual noise that slows comprehension. Use cards only when elevation is *functionally* required (a panel that can be collapsed, dragged or overlaps other content). For metrics, tables and data rows, use dividers and breathing room.

---

### CSS Grid Over Flex Percentage Math

Never use flexbox percentage calculations for multi-column layouts:
```html
<!-- Banned -->
<div class="flex gap-4">
  <div class="w-[calc(33%-0.75rem)]">...</div>
  <div class="w-[calc(66%-0.75rem)]">...</div>
</div>
```

Always use CSS Grid:
```html
<!-- Correct -->
<div class="grid grid-cols-3 gap-4">
  <div class="col-span-1">...</div>
  <div class="col-span-2">...</div>
</div>
```

Flex percentage math breaks on rounding errors across browsers and requires manual recalculation every time the gap changes. Grid handles all of this automatically.

---

### Magnetic Hover: useMotionValue, Not useState

When implementing magnetic button hover physics (cursor-tracking movement), never use React `useState` to store cursor position. Every state update triggers a re-render, meaning 60 mouse events per second = 60 re-renders per second = performance collapse on mobile.

Use Framer Motion's `useMotionValue` and `useTransform` outside the render cycle instead:

```tsx
const x = useMotionValue(0)
const y = useMotionValue(0)
const rotateX = useTransform(y, [-50, 50], [5, -5])
const rotateY = useTransform(x, [-50, 50], [-5, 5])

const handleMouseMove = (e: React.MouseEvent) => {
  const rect = ref.current?.getBoundingClientRect()
  if (!rect) return
  x.set(e.clientX - rect.left - rect.width / 2)
  y.set(e.clientY - rect.top - rect.height / 2)
}
```

`useMotionValue` updates bypass React's render cycle entirely. The animation runs at the browser's frame rate with zero re-renders.

---

### Additional Banned Patterns (Extending Step 9)

Add these to the Step 9 "What Not to Do" list:

- Never use pure black (`#000000`) as a background or text colour. Use off-black (Zinc-950, `#0a0a0a`, `#080c0f`). Pure black creates harsh contrast that reads as default and unfinished
- Never use excessive gradient text (`background-clip: text`) on large headings. A gradient H1 reads as a lazy premium shortcut. Use solid colour with weight and size contrast for hierarchy instead
- Never add a custom CSS cursor (`cursor: url(...)`). Custom cursors are a late-2000s pattern that breaks accessibility, conflicts with system pointers and hurts perceived quality
- Never use outer neon glows (`box-shadow: 0 0 30px rgba(accent, 0.8)`) on buttons or cards. Use inner borders (`box-shadow: inset 0 1px 1px rgba(255,255,255,0.12)`) and subtle tinted shadows instead. Outer glows read as cheap UI kit effects
- Never use generic placeholder content in any output. No "John Doe", "Sarah Chan", "Acme Inc", "Nexus", "SmartFlow", "99.9%", "1,234". Use realistic organic data: believable names, messy numbers (47.2%, +1 (312) 847-1928), specific contextual brand names. Generic placeholders signal to anyone reading the output that it was AI-generated without thought

---

### Colour Strategy and OKLCH (Cross-Tool Reference)

Before picking colours, pick a **colour strategy**. This is a separate decision from the palette itself and should be made first.

- **Restrained**: tinted neutrals plus one accent used on 10% or less of the surface. Good default for product UI and dashboards
- **Committed**: one saturated colour carries 30 to 60% of the surface. Good default for identity-driven landing pages
- **Full palette**: 3 to 4 named roles, each used with a deliberate purpose. Good for campaigns and data visualisation
- **Drenched**: the surface itself is the colour. Reserved for hero moments and campaign pages, not everyday UI

State which strategy is in use before generating a palette. A palette built without first choosing a strategy tends to drift into whatever is easiest to default to, which is usually Restrained without meaning to be.

**Use OKLCH over HSL or hex for any palette you compose from scratch.** OKLCH keeps perceived lightness consistent across hues, so a blue and an orange at the same L value actually look equally light. HSL and hex do not have this property, which is why hex-based palettes often end up with one colour that looks darker or more saturated than intended even though the numbers match.

```css
/* OKLCH: lightness, chroma, hue */
--ink: oklch(0.18 0.02 250);
--surface: oklch(0.98 0.01 250);
--accent: oklch(0.62 0.19 250);
```

**The cream, sand and beige body background is the saturated AI default of 2026.** A warm off-white body background (roughly L 0.84 to 0.97, chroma below 0.06, hue 40 to 100 in OKLCH terms) has become as recognisable a tell as the purple gradient was in 2023. This applies regardless of what the token is named: `--paper`, `--cream`, `--sand`, `--bone`, `--linen` and `--parchment` are all naming the same tell. If a brief calls for "warm" or "editorial" or "premium", that does not mean the body background should default to warm off-white. Warmth belongs in the accent colour, the typography and the imagery, not automatically in the body surface. When a cream or sand surface genuinely is the right call for a brief, that is fine, but it should be a deliberate choice stated out loud in the Gate conversation, not the reflex landing spot. The Tinted Shadows example elsewhere in this file uses a light cream surface as one illustration among several; treat it as one option, not the default.

---

### Typography: Family Count and Pairing Discipline

- Cap the number of font families at 3 (display, body, optional mono). More than 3 reads as indecision rather than richness. One well-tuned family with real weight contrast usually beats three competing typefaces
- Do not pair fonts that are similar but not identical, such as two geometric sans-serifs or two humanist sans-serifs. The similarity reads as an accident, not a decision. Pair across a contrast axis instead: serif with sans, or geometric with humanist. Alternatively, use one family across multiple weights for the entire hierarchy
- Cap body line length at 65 to 75 characters regardless of viewport width
- Use `text-wrap: balance` on headings (h1 to h3) so line breaks land evenly, and `text-wrap: pretty` on long-form paragraph text to reduce orphaned words on the last line

---

### Semantic Z-Index Scale

Never use arbitrary z-index values like 999 or 9999. Build a named scale once per project and reference it everywhere:

```css
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-tooltip: 600;
}
```

An arbitrary z-index means the next component that also needs to sit "on top" gets whatever higher number seems safe, and within a few components the whole stack becomes guesswork. A named scale means every new component has an obvious slot.

---

### Dropdown and Overlay Clipping

Any element using `position: absolute` inside a parent with `overflow: hidden` or `overflow: auto` will be clipped at the parent's edge. This is the most common cause of a dropdown, tooltip or popover menu that appears cut off or invisible. Fix it with one of:

- `position: fixed` on the overlay itself, positioned via JS-measured coordinates from the trigger element
- The native `<dialog>` element or the Popover API, both of which render in the top layer and escape any ancestor's overflow
- A portal (React `createPortal`, Vue `Teleport`) that renders the overlay at the document root instead of inside the clipping ancestor

---

### Motion Easing Discipline

- Ease out with exponential-style curves: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-quint) or similar ease-out-quart and ease-out-expo curves. This is the standard curve already used throughout the Repeatable Scroll Animation Enforcement section above; apply it consistently to every other transition in the project too
- No bounce and no elastic easing on functional UI. Bounce reads as a toy interaction, not a considered one. Reserve spring physics for playful, consumer-facing brief only, and even then use it sparingly
- Every animation needs a `@media (prefers-reduced-motion: reduce)` fallback, typically a crossfade or an instant state change. This is already covered under Accessibility and QA elsewhere in this file; it is restated here because it is also a motion-discipline issue, not only an accessibility one
- Never animate an image on hover through a parent-hover pattern (`.group:hover .group-hover:scale-105` and similar). The image is not the action target, the card is, so animating the image adds motion without adding meaning. If a card needs hover feedback, animate the card's background, border or shadow instead, never the image inside it

---

### Copy Discipline (Extending Step 10)

- No aphoristic-cadence copy as the default voice. Watch for a recurring rhythm of "serious statement, then a short punchy negation" across section after section ("This isn't a dashboard. It's a decision engine.") If three or more copy blocks on the same page fall into this shape, rewrite at least some of them into plainer, more specific sentences
- Button labels should be verb plus object: "Save changes" instead of "OK", "Delete project" instead of "Yes". The label should describe what pressing it does
- Link text needs to stand alone: "View pricing plans" instead of "Click here", since screen readers and scanning users read links out of the surrounding sentence
- No "X theater" or "not just X, it's Y" copy patterns ("productivity theater", "engagement theater", "it's not a tool, it's a movement"). These read as AI-generated meta-commentary rather than a real claim about the product. State the specific thing the product does instead

---

### Additional Banned Patterns Part 2 (Cross-Tool Tells)

Extending the Additional Banned Patterns list above with tells specific to other coding agents, useful to avoid regardless of which tool ends up building the spec.

- **Ghost-card pairing.** A 1px solid border combined with a soft wide box-shadow (blur radius 16px or higher) on the same card or button. Pick one: either a defined border at the brand colour, or a shadow with no more than 8px of blur. Both together reads as an assembled default, not a decision
- **Over-rounded corners.** Border-radius of 32px or higher on cards, sections or inputs. Cards should top out around 12 to 16px; full-pill radius is fine for tags and small buttons only, never for containers
- **Repeating-gradient stripe backgrounds.** Diagonal stripes from `repeating-linear-gradient(...)` used as section or body decoration. This is pure filler texture with no functional purpose. Leave the surface plain or use a deliberate pattern that means something in context
- **Decorative CSS grid overlays.** A two-axis grid built from `linear-gradient(... 1px, transparent 1px)` plus `background-size`, used purely as page texture. Acceptable only when the surface is an actual canvas, map, blueprint or measurement tool. Otherwise it reads as unearned "technical" decoration
- **Hand-drawn or sketchy SVG illustrations.** Crude line-drawn mascots, doodles, or `feTurbulence`/`feDisplacementMap` paper-grain filters meant to depict a real subject. These read as amateurish rather than charming. If a real illustration or photo asset is not available, ship no illustration rather than a sketchy placeholder

---

### The Two-Altitude Slop Test

Before finalising any design, run this check at two levels.

**First-order check:** could someone guess the theme and palette purely from the product category? A wellness app in soft sage green, a fintech dashboard in navy and gold, a Web3 product in dark mode with neon accents: these are all first-order reflexes, the most obvious default for the category. If the answer is yes, the palette or theme needs rework.

**Second-order check:** could someone guess the aesthetic family from the category plus whatever the brief explicitly asked to avoid? For example, a brief asking for "not typical SaaS cream" that lands on editorial-typographic anyway, or "not navy and gold fintech" that lands on terminal-dark-mode anyway, has avoided the first reflex but walked straight into the next most common one. This second check catches what the first one misses. Both checks need to come back "not obvious" before the direction is considered settled.

---

## Appendix A: Design System Reference

When to reach for a real design system vs. writing CSS from scratch.

**Use shadcn/ui when** the product is a SaaS tool, a dashboard, or any admin interface. shadcn gives you accessible, unstyled primitives you actually own in your codebase. Run `npx shadcn@latest init` before writing any component code.

**Use Radix Themes when** you want a styled component library with good accessibility defaults and do not need full customisation. Good for internal tools and rapid prototypes.

**Use Tailwind CSS only (no component library) when** the deliverable is a marketing landing page, a portfolio, or any page where precise visual control matters more than component speed.

**Use GSAP when** MOTION_INTENSITY is 7 or higher. GSAP gives you scroll-driven stacks, horizontal pans, and timeline control that Framer Motion cannot match for complex scroll choreography. Use Framer Motion for component-level animation (entrances, hover, spring) and GSAP for page-level scroll effects.

**Never use** Material UI, Ant Design, or Chakra UI on consumer-facing marketing pages. They impose strong visual opinions that fight against distinctive design.

```bash
# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card badge separator input

# Radix Themes
npm install @radix-ui/themes

# Motion (current Framer Motion)
npm install motion

# GSAP
npm install gsap
```

---

## Appendix B: GSAP Canonical Skeletons

Use these when MOTION_INTENSITY is 7-10. Requires `npm install gsap` and the ScrollTrigger plugin.

### Sticky Card Stacking (GSAP)

Cards scale down and stack as you scroll through them. Use for feature showcases and case study carousels.

```javascript
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Initialises sticky card stacking for a set of .stack-card elements.
 * Each card pins in place and scales down as the next card scrolls in.
 */
function initStickyStack() {
  const cards = gsap.utils.toArray('.stack-card')
  const totalCards = cards.length

  cards.forEach((card, i) => {
    const isLast = i === totalCards - 1

    gsap.to(card, {
      scale: 1 - (totalCards - 1 - i) * 0.04,
      scrollTrigger: {
        trigger: card,
        start: 'top top+=80',
        end: 'bottom top+=80',
        scrub: true,
        pin: !isLast,
        pinSpacing: false,
      }
    })
  })
}
```

Required CSS:
```css
.stack-card {
  position: sticky;
  top: 80px;
  transform-origin: center top;
  will-change: transform;
}
```

### Horizontal Pan Section (GSAP)

A pinned horizontal scroll that moves a track of items left as the user scrolls. Use for project showcases, timelines, or wide content.

```javascript
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Pins a section and scrolls its inner track horizontally as the user scrolls.
 * The pin duration equals the total horizontal travel distance.
 */
function initHorizontalPan() {
  const section = document.querySelector('.pan-section')
  const track = document.querySelector('.pan-track')

  if (!section || !track) return

  const totalWidth = track.scrollWidth - window.innerWidth

  gsap.to(track, {
    x: -totalWidth,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${totalWidth}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    }
  })
}
```

Required markup:
```html
<section class="pan-section">
  <div class="pan-track">
    <div class="pan-item">...</div>
    <div class="pan-item">...</div>
  </div>
</section>
```

Required CSS:
```css
.pan-section { overflow: hidden; }
.pan-track { display: flex; width: max-content; will-change: transform; }
.pan-item { width: 600px; flex-shrink: 0; }
```

Call `initHorizontalPan()` inside a `useEffect` with an empty dependency array. Clean up with `ScrollTrigger.getAll().forEach(t => t.kill())` on unmount.

## Step 11: Interactive and Motion Patterns

Every premium frontend must include at least three of the following interactive patterns. These are mandatory considerations for any project flagged as premium or Awwwards-level. Apply only patterns that suit the product type. Do not stack all of them into one project.

### Mouse Parallax on Hero

Hero elements shift subtly as the cursor moves across the viewport. Use Framer Motion useMotionValue and useTransform outside the render cycle. Never use useState for cursor position tracking as it causes 60 re-renders per second.

```tsx
const mouseX = useMotionValue(0)
const mouseY = useMotionValue(0)
const heroX = useTransform(mouseX, [0, window.innerWidth], [-12, 12])
const heroY = useTransform(mouseY, [0, window.innerHeight], [-8, 8])

const handleMouseMove = (e: React.MouseEvent) => {
  mouseX.set(e.clientX)
  mouseY.set(e.clientY)
}
```

Apply heroX and heroY to a motion.div wrapping the hero visual element. The text layer stays fixed. Only the depth layer or visual asset shifts. Keep the range small (8 to 16px) so it reads as depth not jitter.

**Critical overflow rule**: Never apply the parallax motion.div as the outermost layout wrapper. Always wrap it in a static div with `overflow: hidden` and `position: relative`. Framer Motion's springX/springY translation physically moves the element beyond the viewport boundary, creating a horizontal scrollbar if the container does not clip overflow. The pattern `fixed inset-0 overflow-hidden` on the wrapper div prevents this. The motion transform goes on the inner canvas or visual layer only.

### 3D Card Tilt on Hover

Feature cards and token pair cards tilt in 3D perspective as the cursor moves across them. Use Framer Motion useMotionValue and useTransform with a rotateX and rotateY transform pair. Wrap the card in a motion.div with style={{ rotateX, rotateY, transformPerspective: 800 }}.

```tsx
const x = useMotionValue(0)
const y = useMotionValue(0)
const rotateX = useTransform(y, [-50, 50], [6, -6])
const rotateY = useTransform(x, [-50, 50], [-6, 6])

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect()
  x.set(e.clientX - rect.left - rect.width / 2)
  y.set(e.clientY - rect.top - rect.height / 2)
}

const handleMouseLeave = () => {
  x.set(0)
  y.set(0)
}
```

Add a spring transition on the motion values using useSpring for smooth return to rest.

### Magnetic CTA Buttons

Primary CTA buttons pull slightly toward the cursor when the cursor enters their proximity. Implemented using useMotionValue as described in Step 10. The icon inside the button translates diagonally on hover using the button-in-button trailing icon pattern. Never move the full button more than 6px in any direction.

### Scroll-Triggered Counter Animations

Numeric stats animate from zero to their final value when they enter the viewport. Use Framer Motion useInView to detect entry and animate a numeric value using a spring or tween with a short duration of 1.2 to 1.8 seconds. Format the final number with commas or percentage signs matching the design. The counter must only run once per page load not on every scroll pass.

### AnimatePresence Page Transitions

Wrap the router outlet in Framer Motion AnimatePresence with mode set to wait. Each page component has an entry animation of opacity 0 to 1 with a blur-in filter and a y shift of 12px. Exit animation is opacity 1 to 0 with a y shift of negative 8px. Duration is 0.3 seconds for exit and 0.4 seconds for entry. This makes every navigation feel intentional rather than a hard cut.

### Scroll-Triggered Stagger Reveals

Section content staggered as it enters the viewport. Wrap the section container in a motion.div with variants defining a staggerChildren delay of 0.08 seconds. Each child uses the standard blur-in entrance pattern. Use useInView with once set to true so the animation does not replay on scroll back.

**Critical container rule**: Never place max-width, centering (mx-auto), or horizontal padding classes directly on a motion.div that also has scroll-triggered variants. Framer Motion injects inline transform styles on motion elements which can interfere with margin-based centering calculations. Always put layout classes (max-w-7xl, mx-auto, px-8) on a plain static div wrapper and put the motion.div inside it carrying only the animation-related classes.

```tsx
// Correct pattern
<section className="py-24 w-full">
  <div className="max-w-7xl mx-auto px-8 md:px-16">          {/* layout container — plain div */}
    <motion.div variants={containerVariants} ...>             {/* animation container — motion.div */}
      {children}
    </motion.div>
  </div>
</section>

// Wrong pattern — layout mixed with animation
<motion.div className="max-w-7xl mx-auto px-8 py-24" variants={containerVariants} ...>
  {children}
</motion.div>
```

### Rules for Interactive Patterns

Never combine more than four of these patterns on a single page as the result reads as restless and distracting. Mouse parallax and 3D tilt are mutually exclusive on the same element. Magnetic buttons apply only to primary CTAs not to every interactive element on the page. All interactive patterns must degrade gracefully on touch devices where cursor events do not exist. Wrap cursor-dependent handlers in a check for pointer coarse media query or use the Framer Motion device detection utilities.

---

## Step 12: CSS Cascade Rules for Tailwind v4 Projects

This section documents a recurring and silent bug that breaks every spacing and layout class simultaneously. It must be checked before any debugging session begins.

### The Unlayered Reset Override Bug

**What happens**: Every Tailwind utility class for spacing (padding, margin, gap) silently stops working across the entire project. Cards have no internal padding. Sections have no vertical space. Grid gaps collapse to zero. The bug is invisible — no console errors, no build warnings, the CSS compiles cleanly.

**Root cause**: A CSS reset rule written outside any CSS layer has been placed in the project stylesheet:

```css
/* This is the bug */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

In CSS Cascade Level 5 (which Tailwind v4 uses), unlayered CSS rules have **higher priority than all layered rules**. Tailwind v4 generates all its utility classes inside `@layer utilities`. Any unlayered rule using the `*` selector and setting `padding: 0` or `margin: 0` will override every `.px-8`, `.py-24`, `.mb-4`, `.gap-6` etc. across the entire project.

**Why it is missed**: The bug is introduced at project setup when copying a boilerplate reset. It does not cause any TypeScript errors, no Vite warnings, and the CSS output looks correct when inspected in isolation. The utilities are generated — they just lose the cascade battle at runtime.

**The fix**: Remove any `*` reset block that is not inside a CSS layer. Tailwind v4 already ships its own comprehensive reset inside `@layer base` (preflight). Adding a duplicate outside any layer breaks the cascade.

```css
/* After @import "tailwindcss"; never write this outside a layer */
*, *::before, *::after {
  padding: 0;   /* KILLS all padding utilities */
  margin: 0;    /* KILLS all margin utilities */
}

/* If you need to add box-sizing only, do it inside a layer */
@layer base {
  *, *::before, *::after {
    box-sizing: border-box;
  }
}
```

**Detection checklist**: If spacing classes appear broken but the build succeeds, check these in order:
1. Open the project stylesheet and search for `*, *::before` — if found outside `@layer`, that is the bug
2. Open browser DevTools, inspect a padded element, check if `.px-8` is shown as struck through — it will be overridden by the `*` rule
3. Search for any `padding: 0` or `margin: 0` declarations that are not inside a CSS layer block

### The Section Max-Width Centering Anti-Pattern

A section element with `max-w-7xl mx-auto` applied directly to it will appear to have no side padding even when `px-8` is also applied. This happens because a `<section>` is a block element that is already constrained by its parent width. When `max-w-7xl` is smaller than the viewport, `mx-auto` centers it, but if the viewport is wider than `max-w-7xl`, the section stretches to viewport width and `mx-auto` has no room to apply side margins.

The correct pattern is always a full-width section with an inner container div:

```tsx
// Correct — section is always full viewport width, container constrains content
<section className="py-24 w-full relative z-10">
  <div className="max-w-7xl mx-auto px-8 md:px-16">
    {content}
  </div>
</section>

// Wrong — section width fights with max-width causing unpredictable padding
<section className="py-24 px-8 md:px-16 max-w-7xl mx-auto relative z-10">
  {content}
</section>
```

Apply this pattern to every section on every page without exception. The section is always a layout divider, never a container.


---

## Step 13: Wallet-Gated Routing (Web3 Apps)

Any application with a wallet-connected interior must gate all app routes behind a wallet connection check. This is not optional. Unauthenticated access to app pages is a security and UX failure equivalent to leaving an admin dashboard publicly accessible.

### ProtectedRoute Pattern

Create a single `ProtectedRoute` component used as a layout route in the router. It wraps all app-interior routes and handles three states:

1. **Reconnecting** — wagmi is hydrating from persisted state on hard refresh. Show a spinner to prevent a false redirect to landing. Never redirect while `isReconnecting` is true.
2. **Not connected** — redirect to `/` immediately using `<Navigate to="/" replace />`.
3. **Connected** — render `<Outlet />` and let child routes display.

Also watch for mid-session disconnect using `useEffect` on `isConnected`. When it goes false (and `isReconnecting` is also false), navigate to `/` with `{ state: { disconnected: true } }` so the landing page can show a toast.

```tsx
export function ProtectedRoute() {
  const { isConnected, isReconnecting } = useAccount()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isConnected && !isReconnecting) {
      navigate('/', { replace: true, state: { disconnected: true } })
    }
  }, [isConnected, isReconnecting, navigate])

  if (isReconnecting) return <ReconnectingScreen />
  if (!isConnected) return <Navigate to="/" replace />

  return <Outlet />
}
```

In the router, wrap all app routes in a single layout route:

```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/app/registry" element={<Registry />} />
  <Route path="/app/wrap" element={<Wrap />} />
  <Route path="/app/faucet" element={<Faucet />} />
</Route>
```

### WalletConnectModal Pattern

Never call wagmi's `connect()` directly from a button click. Always open a modal first. The modal gives the user:
- A clear explanation of what connecting means
- A visible connecting state (spinner) while MetaMask is open — this state must block the close button so the user cannot accidentally close during the approval flow
- A success state with a brief confirmation message before auto-navigating
- An error state with the rejection reason and a retry button

The modal holds all wagmi state. The parent component only holds a boolean `showModal` and the `onConnectClick` callback. This keeps wagmi coupling to one place.

```tsx
// Parent (Landing.tsx)
const [showModal, setShowModal] = useState(false)
const openModal = useCallback(() => setShowModal(true), [])
const closeModal = useCallback(() => setShowModal(false), [])

<LandingNav onConnectClick={openModal} />
<Hero onConnectClick={openModal} />
<LandingCta onConnectClick={openModal} />
<WalletConnectModal isOpen={showModal} onClose={closeModal} />
```

All entry points on the landing page (nav Connect Wallet, Hero CTA, bottom CTA) call the same `openModal` handler. None of them call `connect()` directly.

### DisconnectToast Pattern

When `ProtectedRoute` redirects to `/` after mid-session disconnect, the landing page receives `location.state.disconnected = true`. Show a brief slide-down toast explaining what happened. Auto-dismiss after 4 seconds. Clear the router state after reading so hard refresh does not re-show the toast.

```tsx
const location = useLocation()

useEffect(() => {
  if (location.state?.disconnected) {
    setShowDisconnectToast(true)
    window.history.replaceState({}, '') // clear state
  }
}, [location.state])
```

### Entry Point Rules

Every entry point to the app interior (nav links, hero CTA, footer CTA) must be connect-gated. The pattern is always:

```tsx
const handleLaunch = () => {
  if (isConnected) navigate('/app/registry')
  else onConnectClick()
}
```

Never use `<a href="/app/registry">` for an app entry point. Use a `<button>` with the gated handler above. An anchor tag bypasses the guard and will hard-navigate directly to the protected route, which the ProtectedRoute will redirect, but creates a visual flash.

---

## Step 14: App Interior Wallet Dropdown

The wallet dropdown in the app interior is a distinct, product-specific component — not a generic "disconnect" button. It surfaces wallet identity and connection status in a way that feels native to the product.

### Anatomy of the Wallet Dropdown

The dropdown has two parts:

**The trigger pill** — sits in the top-right corner of the app nav. Shows:
- A live green dot to signal active connection at a glance
- Truncated wallet address in monospace
- A chevron that rotates 180° when open

**The dropdown panel** — a glass panel that opens below the pill. Contains:
- A product-specific status header (for Veil: FHE Shield Active indicator with a pulsing green dot)
- Full truncated address with copy-to-clipboard button (icon swaps to a check on copy, resets after 1.8s)
- Network name and Active status in a grid layout
- A visually distinct Disconnect button with a red tint border and icon

### Implementation Rules

- Use `useRef` + `document.addEventListener('mousedown')` for outside-click-to-close. Do not use a global backdrop div — it breaks pointer events on the rest of the UI.
- Close on Escape key via a `window.addEventListener('keydown')` effect that fires only when the dropdown is open.
- The trigger button uses `aria-expanded` and `aria-haspopup="true"` for accessibility.
- The disconnect action must navigate immediately with `{ state: { disconnected: true } }` before wagmi fires its own event. This makes the redirect instant instead of waiting for wagmi's state propagation.
- Never put the wallet dropdown on the landing page. The landing page has a separate "Connect Wallet" button that opens the modal. The dropdown only exists in the app interior nav.

### Animating the Panel

Use Framer Motion AnimatePresence with `scale: 0.95 → 1` and `y: -6 → 0` on enter, reversed on exit. Set `transformOrigin: 'top right'` on the panel div so it opens from the trigger corner, not from the center. Duration is 0.18 seconds — fast enough to feel responsive, slow enough to read as intentional.

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95, y: -6 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: -6 }}
  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
  style={{ transformOrigin: 'top right' }}
>
```

### Product-Specific Status Sections

The status header in the dropdown should reflect the product domain, not just show generic wallet info. Examples:
- Veil (FHE): Shows "FHE Shield Active" with a shield icon
- A DEX: Shows the connected chain, gas price, and slippage setting
- A trading app: Shows PnL for the session or portfolio value
- An NFT app: Shows items in wallet or floor price for held collection

This makes the dropdown feel like part of the product rather than a bolted-on wallet widget.

