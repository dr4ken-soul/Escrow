# Deployment Checklist

## Before deployment

- [ ] Create a fresh Monad testnet deployer wallet.
- [ ] Add testnet MON from the Monad faucet.
- [ ] Put the private key only in a local `.env` file.
- [ ] Confirm `contracts:compile` succeeds.

## Deploy

```bash
npm run deploy:testnet
```

The script deploys `BatchEscrow`. The app uses the existing Monad testnet USDC token; it does not deploy or mint a replacement token.

Current Monad Testnet deployment:

```text
BatchEscrow: 0x832c0c1bc199f849b68120b83d7e92d3089e6ea3
USDC:        0x534b2f3A21130d7a60830c2Df862319e593943A3
```

The updated contract is a fresh deployment, so campaigns created against the previous BatchEscrow address are not migrated. Use the current address for new demos and submissions.

## Configure the app

```env
VITE_BATCH_ESCROW_ADDRESS=0x832c0c1bc199f849b68120b83d7e92d3089e6ea3
VITE_USDC_ADDRESS=0x534b2f3A21130d7a60830c2Df862319e593943A3
```

Restart the dev server or rebuild the static app after changing Vite environment variables.

## Verify

Verify `BatchEscrow` in the Monad explorer using Solidity `0.8.24`, optimizer disabled, and the exact source file in `contracts/`. Preserve the deployed address and the USDC address in the final submission form and the README.

## Submission items still requiring external action

- Hosted project URL.
- Public GitHub repository URL.
- Deployed Monad Testnet contract addresses: BatchEscrow above and USDC `0x534b2f3A21130d7a60830c2Df862319e593943A3`.
- Public demo video under three minutes.
- Public social post URL for the viral prize.
