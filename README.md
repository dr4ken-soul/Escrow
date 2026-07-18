# Escrow

Escrow is a wallet-connected batch escrow for KOL campaign payouts. An agency locks a fixed budget in Monad testnet USDC before work begins. KOLs claim open or invite-code slots, submit a proof URL, and receive the assigned payout after approval or after a review timeout.

The project is the Spark hackathon V1: Monad Testnet USDC, fixed-payout campaigns, invite-code access, removable slots, and adjustable pre-submission payouts.

## What is real in V1

- `MockUSDC.sol`: local-only ERC-20 fixture for Solidity tests.
- `BatchEscrow.sol`: funded campaigns, campaign-specific roles, open slot claiming, proof URLs, approval, rejection, timeout claims, and unused budget withdrawal.
- React frontend: wallet connection through an injected EVM wallet, contract reads through Monad RPC, and signed transaction flows for every state change.
- Public proof page at `/campaigns/:id/proof`.

The agency wallet is assigned by creating the campaign. There is no separate username/password account. The contract prevents the campaign creator from becoming a KOL in that same campaign.

## Local setup

```bash
npm install
Copy-Item .env.example .env
npm run contracts:compile
npm run dev
```

Add deployed addresses to `.env` before connecting the frontend:

```env
VITE_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
VITE_BATCH_ESCROW_ADDRESS=0x832c0c1bc199f849b68120b83d7e92d3089e6ea3
VITE_USDC_ADDRESS=0x534b2f3A21130d7a60830c2Df862319e593943A3
```

## Monad Testnet deployment

Fund a deployer wallet with testnet MON, then add its private key to `.env` locally. Never commit the key.

```env
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
DEPLOYER_PRIVATE_KEY=0x...
```

The deployment script is intentionally explicit:

```bash
npm run deploy:testnet
```

The current BatchEscrow deployment is `0x832c0c1bc199f849b68120b83d7e92d3089e6ea3`. Keep the Monad testnet USDC address above, and restart Vite after changing environment variables. The agency wallet must hold testnet USDC and MON for funding, payout adjustments, approvals, and gas transactions.

## Demo path

1. Agency wallet creates a public or private campaign, for example 10 slots at 100 USDC.
2. Agency approves the BatchEscrow contract to spend the calculated USDC budget, then locks the full budget.
3. Switch to a second wallet and claim a slot.
4. Submit a public proof URL. Private campaigns require the agency-generated invite code when joining.
5. Switch back to the agency wallet, adjust an unsubmitted slot payout if needed, then approve or reject the proof.
6. Open the public proof route to show the slot ledger and payout state.

The timeout claim is available after the configured review window. Unused budget can be withdrawn by the agency after the campaign deadline; pending proofs remain reserved until they are approved or timeout-claimed.

## Verification

```bash
npm run build
npm run contracts:compile
npm test
```

`npm run build` type-checks and bundles the frontend. `npm run contracts:compile` verifies both Solidity sources. The live transaction flow still requires a Monad testnet deployment and wallet-funded smoke test.

## Stretch roadmap

The 40/40/20 milestone payout preset, agency profile metadata, and social proof cards are documented in [FUTURE_UPDATES.md](./FUTURE_UPDATES.md). Invite-code campaigns are already included in the V1 contract surface.
