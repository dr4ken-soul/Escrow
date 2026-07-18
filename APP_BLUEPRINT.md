# Escrow App Blueprint

## Product Summary

Escrow is a wallet-connected campaign payout app for KOL marketing campaigns. Agencies lock campaign budgets onchain before work begins. KOLs join or accept assigned slots, submit proof links, and get paid from escrow when the agency approves their work or when the review timeout expires.

The product is built for Spark by Build Anything and will deploy contracts on Monad testnet.

## Core Rule

Roles are campaign-specific. A wallet can be an agency in one campaign and a KOL in another campaign, but the agency wallet for a specific campaign cannot accept, claim, or be assigned a KOL slot inside that same campaign.

## Users

### Agency

The agency creates, funds, and reviews campaign work.

Main actions:

- Connect wallet.
- Create campaign.
- Choose open or invite-only campaign mode.
- Choose fixed or milestone payout mode.
- Approve mock USDC spend.
- Deposit campaign budget into escrow.
- Review submitted proof links.
- Approve proof and release payout.
- Reject proof with a reason.
- Withdraw unused budget after deadline.

### KOL

The KOL accepts a campaign slot, submits proof, and receives payment.

Main actions:

- Connect wallet.
- Browse open campaigns.
- View assigned invite-only campaigns.
- Accept one campaign slot.
- Submit proof link and optional notes.
- Resubmit after rejection.
- Claim payment after timeout if the agency does not review.
- View payout status and transaction references.

## Product Modes

### Open Campaign

Any wallet except the campaign agency wallet can claim one slot until all slots are filled or the deadline passes.

### Invite-Only Campaign

The agency assigns wallet addresses to slots. Only assigned wallets can accept those slots.

## Payout Modes

### Fixed Payout

Each approved KOL receives the same payout amount.

Example:

- 10 KOL slots.
- 100 mock USDC per approved KOL.
- 1,000 mock USDC locked.

### Milestone Payout

Each KOL payout is split across agency-defined milestones. For the hackathon version, support a default three-step milestone preset:

- Post submitted: 40%.
- Post live after 24h: 40%.
- Analytics proof submitted: 20%.

Each milestone has its own proof link, review state, timeout, and payout release.

## MVP Scope

The MVP must ship one complete real flow before any stretch work.

Required:

- Wallet connection.
- Monad testnet network handling.
- Mock USDC deployment.
- BatchEscrow deployment.
- Fixed-payout open campaign creation.
- ERC20 approval and campaign funding.
- KOL slot acceptance.
- Proof URL submission.
- Agency approval.
- Agency rejection with reason.
- Timeout claim.
- Unused budget withdrawal.
- Public campaign proof page.

Stretch:

- Invite-only campaigns.
- Milestone payout campaigns.
- Agency profile metadata.
- Social share card.

## Smart Contracts

### MockUSDC

ERC20 test token for Monad testnet. Used only because testnet has no real USDC.

### BatchEscrow

Responsibilities:

- Create campaign.
- Fund campaign in any ERC20 token.
- Track agency address.
- Block agency wallet from KOL participation in its own campaign.
- Track campaign mode.
- Track payout mode.
- Track KOL slots.
- Track proof submissions.
- Track review windows.
- Release approved payouts.
- Release timeout payouts.
- Reject submissions with reasons.
- Refund unused budget after deadline.
- Emit events for frontend reads.

Recommended events:

- `CampaignCreated`
- `CampaignFunded`
- `SlotAccepted`
- `ProofSubmitted`
- `ProofApproved`
- `ProofRejected`
- `PayoutClaimed`
- `UnusedBudgetWithdrawn`

## Frontend Stack

- React 18.
- Vite.
- TypeScript.
- Tailwind CSS.
- shadcn/ui for accessible app primitives.
- `motion/react` for animation.
- React Router v6.
- wagmi and viem for wallet and contract interaction.
- TanStack React Query for RPC reads and transaction state.
- Zustand for small client UI state.
- Lucide React for structural icons only, never as a logo.

## Routes

- `/` landing page.
- `/app` wallet-gated operational home.
- `/app/campaigns` campaign list.
- `/app/campaigns/new` create campaign flow.
- `/app/campaigns/:id` campaign workspace.
- `/app/campaigns/:id/proof` public proof page.
- `/app/submissions` review queue.
- `/app/wallet` wallet, token approval, and network status.

## Wallet Auth

No username and password. Wallet identity is the account.

All app routes under `/app` are wallet-gated. Landing CTAs open a wallet connection modal. Direct links into `/app/*` redirect to `/` if no wallet is connected.

## Connected Home Logic

The app home should show role-based surfaces without asking users to choose a permanent role:

- If the wallet owns campaigns, show agency campaign controls first.
- If the wallet has accepted or assigned slots, show KOL obligations first.
- If neither exists, show both `Create campaign` and `Find campaigns`.

## Data Sources

Primary state comes from contract reads and emitted events.

No backend database for MVP.

Optional local-only data:

- Draft campaign form.
- Recently viewed campaign IDs.
- UI preferences.

## Demo Flow

1. Agency wallet creates a 3-slot fixed campaign.
2. Agency approves and deposits 300 mock USDC.
3. KOL wallet finds and joins the campaign.
4. KOL submits an X post URL as proof.
5. Agency wallet reviews and approves.
6. KOL receives 100 mock USDC.
7. Public proof page shows locked budget, slot status, proof URL, approval, and tx reference.
8. Mention timeout claim protection.

## Submission Fit

This project fits Spark because the onchain component is load-bearing. Remove the escrow contract and the product loses its core trust guarantee.

