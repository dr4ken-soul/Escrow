# APP_BLUEPRINT.md — Vault

## Problem

Fantasy football rewards the manager who checks their squad daily, tracks form, and acts fast on transfer windows. Most people do not have that time, so most squads are set once and left to decay. Vault removes the manager from the loop entirely. An agent that runs on the user's own device watches form and value continuously and trades on their behalf, settling directly in USDt with another user's agent, no manual approval step.

## Target user

Fantasy football players who want to compete seriously without the daily maintenance, and Web3 users curious about agent-to-agent commerce as a real, working pattern rather than a concept.

## Tracks and fit

**QVAC (Local AI).** All squad evaluation and trade decision logic runs through the QVAC SDK on the user's own device. No cloud inference call exists anywhere in the agent's reasoning path, and no player data or trade strategy ever leaves the machine until a trade offer is actually broadcast.

**WDK (Wallets).** Each user's agent holds a self-custodial wallet created and signed through WDK. Trade settlement moves USDt directly between the two agents' wallets on acceptance. Spending limits and permission scope are enforced at the wallet layer, not just in application logic, so an agent can never move more than the user has explicitly authorised.

## MVP scope

**In scope:**
- Squad creation and roster management
- QVAC agent that evaluates squad composition, player form, and value on-device
- Agent-to-agent trade proposal and negotiation
- WDK-settled trade execution in USDt
- Live trade feed with settlement history
- Agent reasoning log for transparency

**Out of scope for this build:**
- Live match data integration (player stats are illustrative and internally consistent, not pulled from a live sports data feed)
- Mobile native app, this is a responsive web build
- Multi-league or multi-season support, one active squad per user

## Data model

**Player**
- id, name, position, club, value (USDt), form score, radar attribute set (matching the six attributes shown on both the landing preview and the squad grid)

**Squad**
- id, owner wallet address, player ids, total squad value (derived)

**Agent**
- wallet address, linked squad id, status (evaluating, negotiating, idle), spending limit, last decision timestamp

**Trade**
- id, proposing agent, receiving agent, players offered, players requested, agreed USDt value, settlement transaction reference, status (proposed, countered, accepted, settled), timestamp

## Agent decision loop

1. **Evaluate.** The agent reviews the current squad against form and value data on-device, identifies weak positions or undervalued holdings.
2. **Propose.** If a beneficial trade exists with a counterpart agent, the agent constructs and sends a proposal.
3. **Negotiate.** The counterpart agent evaluates the offer against its own squad logic, accepts, counters, or declines. This can loop.
4. **Settle.** On acceptance, WDK executes the transfer, both squads update, the trade feed and reasoning log both write a new entry.

This loop is the entire product. Every other page exists to make one part of it visible and trustworthy.

## Routes

- `/` — landing
- `/app` — dashboard (wallet gated)
- `/app/squad` — full roster
- `/app/agent` — reasoning log
- `/app/trades` — settlement history

## Judging alignment

**Technical ambition:** genuine on-device inference combined with real wallet-to-wallet settlement, not a simulated trade.

**User experience:** the user does nothing after squad setup, the entire value proposition is removing effort, and the interface reflects that by making the agent's activity legible rather than requiring input.

**Real-world utility:** a working pattern for autonomous agents holding and moving real value under explicit spending limits, applicable well beyond fantasy football.

**Real use of QVAC and WDK:** both tracks are load-bearing, not decorative. Remove QVAC and the agent has no reasoning. Remove WDK and no trade can settle.
