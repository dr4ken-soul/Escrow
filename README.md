# Escrow — onchain batch escrow for KOL campaigns

**Live demo:** https://escrow-campaign.vercel.app · **Network:** Monad testnet (chain 10143) · **Settlement:** USDC

Escrow locks a marketing campaign's full budget onchain *before* any work happens, then releases each KOL's fixed payout the moment their post is approved — or automatically if the agency goes silent. No invoices, no upfront trust, no chasing payment.

Built for the **Spark hackathon** (Build Anything, on Monad).

## The problem

KOL campaign payments run on trust. An agency either pays upfront and risks the KOL never posting, or the KOL posts first and chases payment for days. Both sides burn time on invoices, payment screenshots, and "checking with finance."

## The solution

The agency deposits the whole budget into the `BatchEscrow` contract upfront. KOLs can see the money is locked and waiting. Each KOL submits a public proof URL; the agency approves and the contract pays that KOL instantly. If the agency never reviews, the KOL can claim after a review timeout — so the escrow never degrades back into "just trust the agency to click approve." Unclaimed or unused budget returns to the agency.

## How it works

1. **Create (private).** The agency creates a campaign and locks `payout × slots` of USDC. Every campaign is invite-only — the app generates a one-time invite code + share link, and the campaign is never listed publicly in the app.
2. **Invite.** The agency shares the code/link privately with the KOLs it wants.
3. **Join.** A KOL opens the link and registers a wallet for a slot with the code. Identity = wallet address; no signup, no password.
4. **Per-KOL pricing.** Before a KOL submits proof, the agency can adjust that individual slot's payout (e.g. 50 USDC for one, 200 for another) and top up escrow if needed.
5. **Prove.** The KOL publishes the post, then submits the public proof URL.
6. **Settle.** Approve → instant payout. Reject → the KOL resubmits. Silence past the review window → the KOL claims via timeout.
7. **Reclaim.** The agency can release the budget of unclaimed slots at any time (`releaseUnfilled`), or withdraw remaining unused budget after the deadline. Pending submissions stay reserved until they are reviewed or timeout-claimed.

## Key properties

- **Onchain-first, zero backend.** Budget, slot ownership, proof URLs, payouts, and the review timeout all live in `BatchEscrow` on Monad. The frontend only reads the chain and signs transactions. The chain is the database.
- **Private by design.** Invite-only campaigns; in the app a KOL sees only their own slot, and payouts are hidden from other KOLs. (Everything is public onchain — the app hides it at the UI layer, while a dedicated `/campaigns/:id/proof` page exposes campaign state deliberately for public verification.)
- **Fair to both sides.** Budget is locked before work begins; the timeout claim protects the KOL from a silent agency.
- **Generic ERC-20.** The contract works with any ERC-20; on Monad testnet it settles in USDC.

## Deployed contracts (Monad testnet · chain 10143)

| Contract | Address |
| --- | --- |
| BatchEscrow | [`0x95f9dc5DAF89e36Fae922538525063720e2fc960`](https://testnet.monadexplorer.com/address/0x95f9dc5DAF89e36Fae922538525063720e2fc960) |
| USDC | [`0x534b2f3A21130d7a60830c2Df862319e593943A3`](https://testnet.monadexplorer.com/address/0x534b2f3A21130d7a60830c2Df862319e593943A3) |

## Local setup

```bash
npm install
cp .env.example .env      # then fill in the addresses below
npm run contracts:compile
npm run dev
```

```env
VITE_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
VITE_BATCH_ESCROW_ADDRESS=0x95f9dc5DAF89e36Fae922538525063720e2fc960
VITE_USDC_ADDRESS=0x534b2f3A21130d7a60830c2Df862319e593943A3
```

Connect any injected EVM wallet (MetaMask) on Monad testnet. The agency wallet needs testnet **MON** (gas) and **USDC** (budget). Get testnet USDC from Circle's faucet (https://faucet.circle.com).

## Deploy your own

Fund a deployer wallet with testnet MON, add its key to `.env` locally (never commit it), then run the deploy script:

```env
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
DEPLOYER_PRIVATE_KEY=0x...
```

```bash
npm run deploy:testnet
```

Point `VITE_BATCH_ESCROW_ADDRESS` at the printed address and restart Vite.

## Verify

```bash
npm run build             # type-checks and bundles the frontend
npm run contracts:compile # compiles the Solidity sources
```

## Contracts

- **`BatchEscrow.sol`** — campaigns, invite-code slot claiming, per-slot adjustable payouts, proof submission, approval/rejection, timeout claim, `releaseUnfilled` (reclaim unclaimed-slot budget anytime), and post-deadline `withdrawUnused`. Works with any ERC-20.
- **`MockUSDC.sol`** — a local ERC-20 fixture for Solidity tests only. The live app settles in real Monad testnet USDC.

The agency wallet is assigned by creating the campaign; the contract blocks the campaign creator from becoming a KOL in its own campaign. There is no separate account system — every action is a signed transaction from a wallet.
