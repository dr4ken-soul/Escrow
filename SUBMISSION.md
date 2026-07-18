# Spark Submission Draft

## Name

Escrow

## Description

Onchain fixed-payout escrow for KOL campaigns.

## Problem

Agencies either pay KOLs upfront and risk undelivered work, or ask KOLs to post first and leave them chasing payment. Both sides rely on private promises and manual follow-up.

## Solution

Escrow locks the full Monad testnet USDC campaign budget before work begins. KOLs claim open slots or use an invite code, submit a public proof URL, and receive their assigned fixed payout after approval. If the agency stays silent beyond the review timeout, the KOL can claim. Before proof is submitted, the agency can adjust or remove a slot. After the deadline, unused funds return to the agency.

## Category

Monad Testnet

## Project URL

`TODO: hosted URL`

## GitHub repository

`TODO: public repository URL`

## Contract address

`TODO: BatchEscrow address`

`0x534b2f3A21130d7a60830c2Df862319e593943A3`

## Demo video

`TODO: public video URL, under 3 minutes`

## Social post

`TODO: public post URL`

## Three-minute demo script

1. Show the landing page and explain the trust gap in one sentence.
2. Connect the agency wallet and create a three-slot campaign at 100 USDC per KOL.
3. Fund the campaign and point out the locked budget.
4. Switch wallets, claim a slot, and submit a proof URL.
5. Switch back, approve the proof, and show the payout transaction.
6. Open the public proof page and show the slot status, budget, deadline, and contract address.
7. End by mentioning the timeout claim and unused-budget refund safeguards.
