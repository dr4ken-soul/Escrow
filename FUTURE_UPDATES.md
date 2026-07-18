# Escrow Future Updates

This file records post-V1 work and the rules that are intentionally outside the first submission flow.

## Invite-only campaigns

Implemented in the current V1 build as a shareable campaign-code mode. The agency can create an invite-only campaign with a code, and a KOL must submit that code to claim an available slot. The contract stores only the code hash.

This is a bearer code, not a wallet allowlist. Anyone who learns the code can claim an available slot, so a future allowlist mode may still be useful for tightly controlled campaigns.

Acceptance criteria:

- A wallet without the code cannot join.
- A wallet with the code can claim one available slot.
- The campaign creator still cannot occupy a KOL slot.
- The public proof page makes the campaign mode clear.

## Per-KOL payout and removal

Implemented in the current V1 build. The agency can lower an individual slot payout up to the campaign maximum, but only while that slot has no pending proof or has a rejected proof. The payout freezes as soon as proof is submitted. The agency can remove a KOL only before proof is submitted; the slot becomes available again and its reserved budget remains refundable.

The contract records individual payout values onchain. The app hides other KOL payout values from a KOL's dashboard, but a normal public blockchain cannot provide true payout confidentiality. Anyone can inspect storage, calldata, or token transfers through an explorer.

## Milestone payouts

Add a second payout mode after fixed payouts are stable. The initial preset is:

- Post submitted: 40%.
- Post live after 24h: 40%.
- Analytics proof submitted: 20%.

Each milestone needs its own proof URL, review state, timeout, and payout release. The UI should make the current milestone and remaining amount obvious before a KOL submits anything.

## Agency profile metadata

Add an agency profile layer without turning wallet identity into a username/password system. A future version may support:

- Agency display name.
- Website URL.
- Short campaign brief.
- Optional verification status.

For a first version, profile metadata can be stored as campaign metadata or a small onchain registry. It must never replace the campaign creator wallet as the source of authority.

## Social proof card

Generate a shareable campaign status card from the public proof page. It should show locked budget, completed slots, paid amount, and the contract address without exposing private wallet information beyond the public addresses already onchain.
