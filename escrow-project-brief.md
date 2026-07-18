# Escrow Hackathon Project Brief

## Hackathon Context

This project is for the Spark hackathon by Build Anything.

Theme: build anything onchain that solves a personal problem.

Core requirements we must satisfy:

- The project must be new and started during the hackathon window.
- The project must be built solo.
- The project must have an onchain component on Monad mainnet or testnet.
- The project must have a hosted/deployed web demo.
- The GitHub repository must be public.
- A demo video under 3 minutes is required.
- Submission requires a project name, description, problem, solution, project URL, GitHub repo, category, contract address, demo video URL, and social post URL.

The project should avoid looking like generic AI output. The UI should have a clear identity, fit in the viewport, and demonstrate one real working flow instead of many fake features.

## Working Name

For now, the project will simply be called Escrow.

We will choose the final name later.

## Concept

Escrow is a batch escrow system for KOL marketing campaigns.

It lets an agency create a campaign, lock the full campaign budget onchain, let KOLs accept assigned or open campaign slots, submit proof of work, and receive automatic payout once the agency approves their submission.

The goal is to create a fair middle ground between:

- Agency pays upfront and risks the KOL not posting.
- KOL posts first and chases payment later.

Escrow makes the campaign budget visible and locked before work starts, then releases payment only when work is completed and reviewed.

## Problem

KOL campaign payments are usually trust-based.

Agencies want protection because a KOL may accept payment and fail to post.

KOLs want protection because they may post first and wait days or weeks for payment, or never get paid.

Both sides lose time in manual coordination, invoices, follow-ups, payment screenshots, and private promises.

## Solution

Escrow uses an onchain smart contract to hold the campaign budget and enforce payout rules.

The agency deposits the campaign budget upfront. KOLs can see that funds are locked. Each KOL submits proof of work. The agency approves valid submissions, and the contract releases payment instantly to the KOL wallet.

If the agency goes silent after a KOL submits proof, the KOL can claim payment after a review timeout. This prevents the escrow from becoming another trust-based system where KOLs still depend on the agency clicking approve.

After the campaign deadline, the agency can withdraw unused budget for empty slots or undelivered work.

## Primary Users

### Agency

The agency is the campaign owner.

Agency actions:

- Connect wallet.
- Create campaign.
- Choose campaign mode: open or invite-only.
- Choose payout mode: fixed payout or milestone payout.
- Deposit campaign budget.
- Invite or assign KOL wallets when using invite-only mode.
- Review submitted proof.
- Approve valid proof.
- Reject invalid proof with a reason.
- Withdraw unused budget after campaign deadline.

### KOL

The KOL is the campaign participant.

KOL actions:

- Connect wallet.
- View open campaigns or assigned campaigns.
- Accept a campaign slot.
- Submit proof of work.
- Resubmit if rejected.
- Claim payment automatically if the agency does not review within the timeout.
- Receive payment directly to their wallet after approval or timeout claim.

## Login And Identity

There will be no username/password login for the MVP.

Identity is based on wallet address.

Every important action is a signed transaction:

- Creating a campaign.
- Funding a campaign.
- Accepting a slot.
- Submitting proof.
- Approving proof.
- Rejecting proof.
- Claiming after timeout.
- Withdrawing unused funds.

### How We Separate Agency And KOL

We do not need two separate login systems.

A wallet becomes an agency for a campaign when it creates that campaign. The campaign creator address is stored as the campaign agency/admin.

For KOLs, a wallet becomes a campaign participant when it accepts or is assigned a KOL slot.

This means roles are campaign-specific:

- The same wallet can be an agency in one campaign.
- The same wallet can be a KOL in another campaign.
- Inside one campaign, the campaign creator is the agency.
- Inside one campaign, the agency wallet cannot accept, claim, or be assigned a KOL slot.
- KOL slots are separate participant records.

### Agency Account / Assignment Model

When we say "create/assign account for agencies," we should keep it lightweight for the hackathon.

Recommended MVP model:

- Agency connects wallet.
- If the wallet creates a campaign, it becomes an agency automatically.
- Optional agency profile data can be collected in the frontend, such as agency name and website.
- Agency profile data can be stored as campaign metadata instead of building a backend account system.

Possible future version:

- Add an onchain or offchain agency profile registry.
- Add verified agency badges.
- Add team members or agency operators.

For the hackathon, campaign creator equals agency admin.

## Campaign Modes

### Open Campaign

The agency creates a campaign with a maximum number of KOL slots.

Any wallet can join until all slots are filled or the campaign deadline passes.

Example:

- 10 slots.
- 100 mock USDC per KOL.
- Any KOL can connect wallet and claim one available slot.

### Invite-Only Campaign

The agency creates a campaign and assigns specific wallet addresses to KOL slots.

Only invited wallets can accept their assigned slots.

This fits real agency workflows where a campaign manager already knows which creators they want.

## Payout Modes

Agencies can choose the payout mode when creating the campaign.

### Fixed Payout

Each approved KOL receives one fixed payout.

Example:

- 10 KOLs.
- 100 mock USDC per approved KOL.
- Total budget: 1,000 mock USDC.

Flow:

1. KOL accepts slot.
2. KOL submits proof link.
3. Agency approves.
4. Contract releases 100 mock USDC to KOL.

This should be the first payout mode we implement because it is simple and demo-friendly.

### Milestone Payout

Each KOL payout is split across milestones.

Example:

- Total per KOL: 100 mock USDC.
- Milestone 1: Post submitted, 40%.
- Milestone 2: Post live after 24 hours, 40%.
- Milestone 3: Analytics proof submitted, 20%.

Flow:

1. KOL accepts slot.
2. KOL submits proof for milestone 1.
3. Agency approves milestone 1.
4. Contract releases 40 mock USDC.
5. KOL later submits proof for milestone 2.
6. Agency approves milestone 2.
7. Contract releases 40 mock USDC.
8. KOL submits analytics proof for milestone 3.
9. Agency approves milestone 3.
10. Contract releases 20 mock USDC.

Important implementation note:

Milestone payout is more complex than fixed payout. For the MVP, we can support it if time allows, but the fixed payout flow must work first.

## Proof Submission

KOLs submit proof through the frontend.

For the MVP, proof can be:

- A post URL, such as an X/Twitter post link.
- Optional notes from the KOL.
- Optional analytics screenshot or file link if using a hosted storage service later.

Since we are avoiding a backend for MVP, the simplest proof value stored onchain is a text URI or URL.

Examples:

- `https://x.com/creator/status/123`
- `https://www.tiktok.com/@creator/video/123`
- `https://www.linkedin.com/posts/...`

The contract stores or emits the submitted proof link.

Agency review:

- Approve: payment is released.
- Reject: agency must provide a rejection reason.
- Resubmit: KOL can submit a new proof link.

For milestone campaigns, proof is submitted per milestone.

## Review Timeout

The timeout is a core fairness feature.

When a KOL submits proof, the agency has a fixed review window.

Example:

- Review window: 3 days.
- KOL submits proof at timestamp T.
- Agency can approve or reject until T + 3 days.
- If agency does nothing, the KOL can call `claimAfterTimeout`.

If the agency rejects proof, the rejection reason is recorded and the KOL can resubmit. The review timer restarts from the new submission time.

This prevents agency silence from trapping KOL earnings.

## Token Model

Monad testnet will be used for the hackathon.

We will use:

- Native MON for gas.
- A mock USDC token deployed by us for campaign payments.

The escrow contract should be generic for ERC20 tokens, so the token address is configurable. On mainnet, the same escrow logic can point to a real USDC address without changing core contract logic.

Contracts:

- `BatchEscrow`
- `MockUSDC`

## Smart Contract Responsibilities

The `BatchEscrow` contract should handle:

- Campaign creation.
- Campaign funding.
- Open or invite-only campaign participation.
- Slot acceptance.
- Proof submission.
- Proof approval.
- Proof rejection with reason.
- Fixed payout release.
- Milestone payout release if included.
- Timeout claim.
- Deadline-based unused budget withdrawal.
- Event emission for frontend indexing.

Important data:

- Campaign agency address.
- ERC20 token address.
- Total deposited budget.
- Payout mode.
- Max KOL slots.
- Campaign deadline.
- Review timeout.
- Slot records.
- Proof records.
- Payout status.

## Frontend Responsibilities

The frontend should be a wallet-connected app with no backend auth.

Core pages:

- Campaign dashboard for agencies.
- Campaign discovery or assigned campaigns for KOLs.
- Campaign detail page.
- Public campaign proof page.
- Create campaign flow.
- Submit proof flow.
- Review proof flow.

Agency view:

- Created campaigns.
- Total budget locked.
- Slots filled.
- Pending submissions.
- Approved KOLs.
- Rejected submissions.
- Remaining budget.
- Withdraw button after deadline.

KOL view:

- Available campaigns.
- Assigned invite-only campaigns.
- Accepted campaigns.
- Proof submission status.
- Payment status.
- Claim-after-timeout button when eligible.

Public campaign page:

- Campaign metadata.
- Budget locked.
- Token used.
- Payout mode.
- Number of slots.
- Slots filled.
- Submission statuses.
- Contract address.
- Deadline.
- Review timeout.

## MVP Scope

The minimum version that should be completed first:

1. Agency connects wallet.
2. Agency creates a fixed-payout campaign.
3. Agency deposits mock USDC.
4. KOL connects wallet.
5. KOL joins an open campaign.
6. KOL submits a proof URL.
7. Agency approves or rejects proof.
8. Approved KOL receives payout instantly.
9. KOL can claim after review timeout if the agency goes silent.
10. Agency can withdraw unused budget after deadline.

Stretch goals:

- Invite-only campaigns.
- Milestone payout campaigns.
- Agency profile metadata.
- Better public proof page.
- Social share card.

## Things To Avoid For MVP

Avoid these until the core flow works:

- Username/password auth.
- Backend database.
- X/Twitter API verification.
- AI proof judging.
- Complex arbitration or dispute court.
- Multi-admin agency teams.
- Real USDC integration.
- Chat or messaging.
- Advanced analytics dashboards.

## Demo Story

The demo video should be simple:

1. Agency creates a campaign for 3 KOLs at 100 mock USDC each.
2. Agency deposits 300 mock USDC into escrow.
3. KOL wallet joins the campaign.
4. KOL submits a post URL as proof.
5. Agency reviews and approves.
6. KOL wallet receives 100 mock USDC.
7. Show public campaign page proving funds, submission, and payout status.
8. Briefly mention timeout protection for silent agencies.

## Pitch

Escrow is a trust-minimized payout system for KOL campaigns.

Agencies lock the full campaign budget upfront, KOLs can verify the money exists before they work, and payouts happen automatically when submitted work is approved.

If an agency goes silent, KOLs can claim after a timeout, so escrow protects both sides instead of simply moving trust from one private promise to another.

## Open Decisions

- Final project name.
- Whether milestone payout ships in MVP or becomes a stretch goal.
- Whether invite-only campaigns ship in MVP or become a stretch goal.
- Exact review timeout default.
- Exact campaign deadline rules.
- Whether proof links are stored directly onchain or emitted as events only.
- Final frontend visual identity.
