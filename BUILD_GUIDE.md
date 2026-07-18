# Escrow Build Guide

Build in this order. Do not start polish before the contract flow works.

## Phase 1: Project Foundation

- Scaffold React 18 + Vite + TypeScript.
- Install Tailwind CSS, shadcn/ui, `motion`, React Router, TanStack React Query, Zustand, wagmi, viem, Lucide React.
- Add global CSS variables from `FRONTEND_SPEC.md`.
- Add fonts: Instrument Serif, Manrope, IBM Plex Mono.
- Configure hidden scrollbar and smooth scrolling globally.
- Set up route shell for `/` and wallet-gated `/app/*`.

Done when: landing shell and empty app shell render with correct tokens.

## Phase 2: Smart Contracts

- Add Hardhat.
- Implement `MockUSDC`.
- Implement `BatchEscrow`.
- Enforce campaign agency cannot join or claim KOL slots in its own campaign.
- Implement fixed-payout open campaigns first.
- Implement proof submission, approve, reject with reason, timeout claim, and unused refund.
- Add unit tests for the main campaign lifecycle.

Done when: tests prove the complete agency to KOL payout flow.

## Phase 3: Deployment

- Configure Monad testnet RPC.
- Deploy `MockUSDC`.
- Deploy `BatchEscrow`.
- Store deployed addresses in frontend environment variables.
- Add README deployment notes.

Done when: contracts are deployed and callable from a script.

## Phase 4: Wallet And Contract Reads

- Configure wagmi and viem.
- Build wallet connect modal.
- Build protected route wrapper.
- Build app wallet dropdown.
- Add network status and wrong-network state.
- Add contract read hooks for campaigns, slots, submissions, and token balances.

Done when: connected wallet can read deployed contract state.

## Phase 5: Agency Flow

- Build create campaign flow.
- Build ERC20 approval state.
- Build deposit transaction state.
- Build agency campaign workspace.
- Build review queue.
- Build approve and reject actions.

Done when: agency wallet can create, fund, and review a campaign from the UI.

## Phase 6: KOL Flow

- Build open campaign discovery.
- Build slot acceptance.
- Build proof submission.
- Build rejected proof resubmission.
- Build timeout claim state and button.
- Build payout received status.

Done when: KOL wallet can join, submit proof, and get paid.

## Phase 7: Public Proof Page

- Build public campaign proof route.
- Show budget locked, slots filled, proof status, deadline, review timeout, contract address, and event timeline.
- Make the page useful for judges and KOLs without wallet connection.

Done when: the proof page explains the campaign in under 30 seconds.

## Phase 8: Stretch Features

Only after MVP works:

- Invite-only campaigns.
- Milestone payout preset.
- Agency metadata.
- Social share card.

## Phase 9: Polish And Submission

- Run full responsive pass.
- Run anti-slop design pass.
- Record demo under 3 minutes.
- Public GitHub repo.
- Hosted app URL.
- Contract address.
- Social post URL.

