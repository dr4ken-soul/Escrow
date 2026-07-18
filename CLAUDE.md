# Escrow Agent Context

Read this before working on the project.

## Product

Escrow is a batch escrow dApp for KOL campaign payouts. Agencies lock campaign budgets onchain. KOLs accept slots, submit proof links, and receive payment after approval or after timeout if the agency goes silent.

## Non-Negotiable Product Rules

- Wallet identity only, no username/password auth.
- Roles are campaign-specific.
- The agency wallet for a campaign cannot accept, claim, or be assigned a KOL slot inside that same campaign.
- Onchain state is the source of truth.
- Do not fake successful transactions. Confirm the transaction first.
- Use Monad testnet for the hackathon.
- Use mock USDC for test settlement.
- Keep the escrow contract generic to ERC20 tokens.
- No backend database for MVP.

## Design Rules

- Primary aesthetic: Bento grid operational.
- Navigation: scroll-morph pill on landing, fixed sidebar inside app.
- Landing background: premium static hero image.
- App background: static but atmospheric.
- Fonts: Instrument Serif, Manrope, IBM Plex Mono.
- Palette: Escrow Slate from `FRONTEND_SPEC.md`.
- No hardcoded logo, favicon, icon mark, or brand symbol.
- Use text-only `Escrow` until Paul supplies or requests a real mark.
- Use CSS variables for colours.
- Use `motion/react`, not `framer-motion`.
- Scroll-triggered reveals use `viewport={{ once: false, amount: 0.1 }}`.
- Loading states are skeleton shimmer, not spinners.
- Hover states are CSS class based.

## Stack

- React 18.
- Vite.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- `motion/react`.
- React Router v6.
- wagmi.
- viem.
- TanStack React Query.
- Zustand.
- Solidity.
- Hardhat.

## MVP Priority

Build one real flow:

1. Agency creates and funds fixed campaign.
2. KOL joins open slot.
3. KOL submits proof URL.
4. Agency approves.
5. Contract pays KOL.
6. Public proof page shows the onchain state.

Only add invite-only and milestone payout after this works.

