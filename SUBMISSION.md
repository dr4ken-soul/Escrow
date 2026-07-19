# Spark Submission

## Name

Escrow

## Description

Onchain fixed-payout escrow for KOL marketing campaigns on Monad.

## Problem

Agencies either pay KOLs upfront and risk undelivered work, or ask KOLs to post first and leave them chasing payment for days. Both sides rely on private promises, invoices, and manual follow-up.

## Solution

Escrow locks the full Monad testnet USDC campaign budget onchain before work begins. Every campaign is private: the agency creates it, the app generates a one-time invite code + share link, and only KOLs with that code can register a wallet for a slot. Each KOL submits a public proof URL and receives their assigned fixed payout the instant the agency approves. If the agency stays silent past the review timeout, the KOL can claim the payout themselves. Before proof is submitted, the agency can adjust an individual slot's payout or remove a slot. The agency can reclaim the budget of unclaimed slots at any time, and any remaining unused budget returns after the deadline — pending submissions stay reserved until reviewed or timeout-claimed. Identity is your wallet — no signup, no backend — and in the app each KOL sees only their own slot, so payouts stay private from other KOLs (all campaign state is still verifiable onchain).

## Category

Monad Testnet

## Project URL

https://escrow-campaign.vercel.app

## GitHub repository

https://github.com/dr4ken-soul/Escrow

## Contract address

BatchEscrow: `0x95f9dc5DAF89e36Fae922538525063720e2fc960`

USDC (Monad testnet): `0x534b2f3A21130d7a60830c2Df862319e593943A3`

## Demo video

https://x.com/ice_bearcute/status/2078875327124869591

## Social post

https://x.com/ice_bearcute/status/2078875327124869591

## Three-minute demo script

1. Show the landing page and explain the trust gap in one sentence.
2. Connect the agency wallet and create a private three-slot campaign at 100 USDC per KOL.
3. Approve USDC and fund the campaign — point out the locked budget and the generated invite code / share link.
4. Switch wallets, open the share link, register the slot with the invite code, and submit a proof URL.
5. Switch back to the agency, optionally adjust a slot's payout, then approve the proof and show the payout transaction.
6. Show reclaiming unfilled budget (Release unfilled budget) and mention the timeout-claim safeguard.
7. Open the public proof page to show the onchain slot ledger, budget, deadline, and contract address.
