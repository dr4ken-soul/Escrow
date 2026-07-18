# BUILD_GUIDE.md — Vault

Sequential build phases. Complete each phase fully before moving to the next, order matters because later phases depend on foundations laid earlier.

## Phase 1 — Foundation

Scaffold the React 18 + Vite + TypeScript project. Install Tailwind, `motion/react`, TanStack React Query, Zustand, React Router v6, Lucide React. Set up the design tokens from FRONTEND_SPEC.md as CSS variables, load Newsreader, Manrope, and Martian Mono. Confirm the token system renders correctly on a blank page before building anything on top of it.

## Phase 2 — Landing page structure

Build the top editorial strip nav with the wordmark, ticker placeholder, and connect action. Build the hero section layout with the video background slot wired to `vault-hero-bg.mp4`, gradient overlay, headline, subhead, and CTA. Build out the remaining five landing sections in order: the agent loop, live trade proof, squad intelligence preview, track fit strip, closing CTA. Leave all asset slots as plain comments per CLAUDE.md.

## Phase 3 — Wallet connection

Integrate WDK for wallet creation and connection. Build the connect flow triggered from the landing CTA. Implement wallet-gated routing so `/app` and its children redirect unauthenticated visitors back to the landing hero.

## Phase 4 — Dashboard shell

Build the sidebar navigation for the app interior. Build the `/app` route shell with the KPI strip (four tiles, Squad Value, Agent Status, Open Trades, USDt Balance) using skeleton shimmer while data loads. Wire the wallet dropdown into the sidebar footer.

## Phase 5 — Squad data and player tiles

Implement the Player and Squad data model. Build the player tile component, radar chart, value trend sparkline, and use it consistently on both `/app/squad` and the landing page's squad intelligence preview so the two never diverge visually. Build the full `/app/squad` grid route.

## Phase 6 — QVAC agent integration

Integrate the QVAC SDK for on-device squad evaluation. Implement the evaluate step of the agent decision loop, confirm it runs entirely on-device with no network calls in the reasoning path. Build the `/app/agent` reasoning log route and wire evaluation outputs into it.

## Phase 7 — Trade proposal and negotiation

Implement the propose and negotiate steps of the agent loop, agent-to-agent trade construction and response logic. Extend the reasoning log to capture proposal and negotiation entries alongside evaluation entries.

## Phase 8 — WDK settlement

Wire the settle step to WDK, executing the actual USDt transfer between agent wallets on trade acceptance, enforcing the spending limit set at wallet creation. Update squad state on both sides once a trade settles.

## Phase 9 — Live trade feed

Build the trade feed component for the dashboard. Implement the confirmed motion behaviour, new rows slide in from the top, settlement values count up from zero. Build the full `/app/trades` history table with sorting and date filtering.

## Phase 10 — Polish and demo preparation

Full pass against the quality bar in FRONTEND_SKILL.md, borders over cards, no inline hover handlers, no hardcoded hex values, no placeholder copy anywhere. Confirm every asset slot without a supplied file is still a plain comment. Prepare the live demo path, squad setup through to a settled trade, as the walkthrough for the submission video.
