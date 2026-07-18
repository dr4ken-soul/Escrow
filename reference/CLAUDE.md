# CLAUDE.md — Vault

Persistent context for any AI coding agent working on this project. Read this in full before touching any file.

## What Vault is

Vault is an autonomous fantasy football manager. A QVAC agent runs entirely on the user's own device, evaluates their squad, and negotiates trades directly with other users' agents. When two agents agree a trade, it settles on-chain in USDt through WDK. The user never picks a lineup and never approves a trade manually, the agent runs the squad. The product's entire proof is watching two agents settle a real transaction live.

Built for the Tether Developers Cup. Tracks: QVAC (Local AI) and WDK (Wallets). Theme: football and the global tournament moment.

## Non-negotiable rules

**No cards.** Vault is not Sorare and is not a collectible game. Players are data objects: stats, form score, value, position. Never introduce card flipping, packs, rarity tiers, or any collectible mechanic.

**No hardcoded logo, favicon, icon, or emoji anywhere.** Every brand asset slot stays a plain HTML comment until Paul supplies the real file. The one exception is a plain typographic wordmark, "Vault" set in Newsreader with nothing attached to it, no mark, no icon. That is typography, not a logo, and is safe to ship as a placeholder.

**No placeholders or lorem ipsum.** Every string of copy in every file is final, real copy, not a stand-in.

**No em dashes anywhere.** Not in UI copy, not in code comments, not in JSDoc, not in error messages. None.

**British English throughout.** Every string, every comment, every label.

**CSS variables only.** No hardcoded hex values inside components. Everything pulls from the design tokens defined in FRONTEND_SPEC.md.

**Hover states are CSS class based.** No inline `onMouseEnter` or `onMouseLeave` handlers.

**Loading states are skeleton shimmer, never spinners.**

**`motion/react`, not `framer-motion`.** All animation imports use the restructured package name.

## Writing rules

Two separate voices apply depending on what is being written.

**Formal and in-product copy** (UI labels, error states, agent reasoning strings, button text, JSDoc, code comments): British English, no em dashes, periods only when the sentence needs one, commas only when needed, direct and confident, never opens with filler, under three paragraphs for any block of explanatory copy.

**Paul's personal voice** (used only in MARKETING.md): all lowercase, no periods, no em dashes, blank line between paragraphs, natural and close to his own words, no date references.

Both voices apply to everything the coding agent generates, including strings embedded in components. This is not just a tone note, it governs literal text output.

## Tech stack

React 18 + Vite + TypeScript. Tailwind CSS for styling, CSS variables for the design system, no hardcoded values. `motion/react` for animation. TanStack React Query for data fetching. Zustand for client state. React Router v6. Lucide React for icons where icons are structurally necessary (never as logo substitutes).

WDK for wallet creation, signing, and agent wallet primitives. QVAC SDK for on-device model inference, no cloud calls anywhere in the agent's reasoning path.

## Project identity

Name: **Vault**. Single word, locked, do not propose alternatives.

Palette name: **Matchday Amber**. Full token values in FRONTEND_SPEC.md.

Typography: Newsreader (display), Manrope (body), Martian Mono (all data, numbers, and live values).

## Hackathon context

Tether Developers Cup. 8,000 USDt total prize pool, 1,000 USDt per track winner (Pears, QVAC, WDK), 5,000 USDt for Cup Champion across all tracks. Judged on technical ambition, user experience, real-world utility, creativity, and real use of the chosen tracks. Submission needs a public GitHub repo under Apache 2.0 or MIT, clear setup steps, and a demo video under three minutes.

Vault combines QVAC and WDK, which the hackathon explicitly calls out as welcome and impressive. The demo strength is the live agent-to-agent trade settling on screen, that is the moment every file in this project should be built to support.
