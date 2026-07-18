---
name: crypto-web3-blueprint
description: Read this file alongside SKILL.md whenever the project is crypto or Web3 related in any form. This covers the full range: on-chain products (NFT marketplaces, DeFi protocols, smart contract deployments), off-chain crypto tools (bots, dashboards, analytics, portfolio trackers), AI agent products built for crypto audiences, community sites for blockchain projects, and ambassador or content platforms for Web3 companies. It does not replace SKILL.md, it extends it based on what the specific project actually needs.
---

# Crypto and Web3 Blueprint Skill

You understand the full spectrum of crypto and Web3 projects and you never treat them all the same. A trading bot is not a DeFi protocol. An AI agent site for a crypto company is not an NFT marketplace. A community dashboard for a blockchain project is not a smart contract product. Read the project description carefully and apply only the sections of this file that are relevant to what is actually being built.

---

## Step 1: Classify the Project Type First

Before asking any questions or making any decisions, identify which category the project falls into. More than one can apply.

**Category A: On-chain product**
The product deploys smart contracts, mints NFTs, processes on-chain transactions or requires users to connect a wallet and sign transactions. Examples: NFT marketplace, DeFi lending protocol, token launchpad, on-chain subscription manager, RWA tokenisation platform.

**Category B: Off-chain crypto tool**
The product interacts with blockchain data or crypto APIs but does not deploy contracts or require wallet signing. Examples: trading bot, portfolio tracker, on-chain analytics dashboard, price alert tool, arbitrage engine, crypto copy-trading platform, Telegram or Discord bot for DeFi monitoring.

**Category C: AI agent for crypto**
The product is an AI agent or AI-powered tool that operates in crypto markets or for crypto audiences. Examples: an AI agent that trades prediction markets, an AI that analyses on-chain data and gives signals, a chatbot for a DeFi protocol, an agent that monitors wallet activity. These may or may not touch on-chain transactions directly.

**Category D: Web3-adjacent site or platform**
The product is a website, platform or content tool built for a blockchain company or crypto-native audience but is not itself a crypto product. Examples: ambassador programme site, content creator platform for a Web3 project, community portal, governance voting frontend without smart contract deployment, documentation site for a protocol.

Apply only the steps below that match the category or categories of the project. When in doubt, ask one clarifying question: does this product deploy smart contracts or require users to sign on-chain transactions?

---

## Step 2: Clarifying Questions by Category

Ask only the questions relevant to the project's category. Do not ask all of them for every project.

**For Category A (on-chain products)**
- What chain is this built on and is it EVM-compatible
- Is there a testnet phase before mainnet and is mainnet live yet
- What currency does the product settle in: native gas token, stablecoin, or both
- Is there a native project token planned and if so when
- Who are the two main user types and what financial actions does each perform
- Does the product require off-chain identity (email signup) alongside wallet auth or is wallet-only sufficient

**For Category B (off-chain crypto tools)**
- What data sources does the bot or tool consume: on-chain RPC, centralised exchange APIs, price oracles, or a mix
- Does it require a user-facing frontend or is it a backend service only
- How does it authenticate: API keys, wallet signature, OAuth, or none
- Does it need persistent storage for signals, history or user settings
- What is the output: Telegram or Discord messages, a web dashboard, automated trades, or alerts
- Is there a monetisation layer (subscription, per-signal fee, freemium) or is it open source

**For Category C (AI agents)**
- Does the agent execute on-chain transactions itself or does it only provide signals and recommendations
- If it executes transactions: which chain, which protocols and how is the wallet managed (user-owned, agent-managed, custodial)
- What data does the agent consume: social sentiment, on-chain data, price feeds, news, or a mix
- Does the product need a user-facing interface or does it operate autonomously in the background
- Is there a human-in-the-loop (user approves before execution) or is it fully autonomous
- What is the target platform: X/Twitter, Telegram, Discord, a web app, or API-first

**For Category D (Web3-adjacent sites)**
- What blockchain or protocol is the company building on
- Does the site need wallet connection for any feature (gated content, governance, identity) or is it purely informational
- Is there a token associated with the project and does the site need to display or interact with it
- What is the primary audience: community members, potential investors, developers, or ambassadors

---

## Step 3: Tech Stack by Category

Apply only the stack relevant to the project type.

**Category A: On-chain products**

| Layer | Choice | Why |
|---|---|---|
| Smart contracts | Solidity + Hardhat | EVM-compatible, industry standard |
| Wallet connection | wagmi + viem | Best-in-class EVM wallet library |
| Contract interaction | ethers.js v6 | Pairs with wagmi, standard for EVM dApps |
| NFT metadata | IPFS via Pinata | Permanent, content-addressed, tamper-evident |
| Auth | Supabase Auth + wallet connection | Email auth only if off-chain identity is needed alongside wallet |
| Database | Supabase (Postgres) | Off-chain records mirroring on-chain state |
| Frontend | Next.js 14 App Router with TypeScript | SSR for SEO, works with wagmi providers |

Always write on-chain first: confirm the transaction, then update the database. Never write an off-chain record claiming an on-chain event before the transaction confirms.

**Category B: Off-chain crypto tools and bots**

| Layer | Choice | Why |
|---|---|---|
| Backend | Python with FastAPI or async scripts, or Node.js | Python for data-heavy signal work, Node for real-time event streaming |
| On-chain data | ethers.js or web3.py via RPC endpoint | Read-only chain access without wallet signing |
| CEX data | CCXT library | Unified interface for 100+ centralised exchanges |
| Price feeds | CoinGecko API, CoinMarketCap API, or Chainlink oracle | Free tiers available |
| Bot delivery | python-telegram-bot or discord.py | Telegram for most crypto bots, Discord for community tools |
| Database | Supabase (Postgres) or Redis | Postgres for history and user data, Redis for fast signal caching |
| Frontend (if needed) | Next.js with Tailwind | Only if the tool needs a user-facing dashboard |
| Auth (if needed) | API key per user or Supabase Auth | API key is simpler for developer-facing tools |
| Monetisation | Stripe (via a separate payment page or link), USDC payment link, or freemium model | Payment happens on a web page or bot command flow, not inside the tool itself |

**Category C: AI agents for crypto**

| Layer | Choice | Why |
|---|---|---|
| Agent framework | LangChain, LangGraph or custom | LangChain for tool-using agents, LangGraph for multi-step workflows |
| LLM | Claude API (claude-sonnet or claude-opus) | Best reasoning for financial and on-chain decision-making |
| On-chain execution (if needed) | ethers.js or viem with a managed wallet | Use a hot wallet for agent execution, never the user's wallet unless they explicitly approve each action |
| Data ingestion | Twitter/X API, on-chain RPC, Polymarket API, news feeds | Based on what signals the agent needs |
| Memory | Supabase or Pinecone | Supabase for structured history, Pinecone for vector memory |
| Delivery | Telegram bot, X bot, or web dashboard | Match where the target audience already lives |

If the agent executes on-chain transactions autonomously, the agent's wallet private key must be stored in a proper secrets manager, not a .env file that could be committed. Transactions above a configurable threshold should require human approval before execution.

**Category D: Web3-adjacent sites**

Same stack as any web product: Next.js 14, TypeScript, Tailwind CSS. Add wagmi and viem only if wallet connection is needed for a specific feature. If the site only reads chain data without user transactions, use read-only ethers.js with a public RPC endpoint. No Hardhat or Solidity is needed.

---

## Step 4: Monetisation by Category

**Category A (on-chain products)**
Protocol fees via smart contracts routed to a treasury wallet. Listing fees, trading fees and verification fees all in the settlement token. Never Stripe for the core product transactions. See treasury wallet guidance in Step 6.

**Category B (off-chain tools and bots)**
Subscription via USDC payment or crypto payment link, per-signal credit model, freemium with paid tiers, or open source with a paid hosted version. If there is a separate marketing website for the tool, Stripe can be added there for fiat payment. The bot or tool itself does not process payments directly, it checks whether a user has an active subscription by looking up their status in the database after they have paid through whichever channel was set up.

**Category C (AI agents)**
Subscription to access the agent, pay-per-use in credits or USDC, or a free tier with a premium tier that unlocks more autonomy or higher limits. Revenue sharing from trading profits is complex and needs legal consideration before promising it.

**Category D (Web3-adjacent sites)**
Usually not directly monetised as a standalone product. Revenue comes from the company that engaged you to build it.

---

## Step 5: Additional Blueprint Files by Category

**Category A (on-chain products)**: generate all of these
- PRODUCT.md: how the product works for both user types in plain language
- TEAM_OPS.md: treasury wallet management, verification or review processes, user support. Update at end of every build week and every phase.
- WHITEPAPER.md: technical document covering problem, solution, smart contract architecture with key functions, fee model and phased roadmap
- FAQ.md: public-facing FAQ with fees summary table. Update when new features ship.
- DOCS.md: developer integration guide. Generate at the start of mainnet phase, not before.

**Category B (off-chain tools)**: generate these
- README.md: setup, environment variables, how to run locally and in production
- PRODUCT.md: what the tool does, how users interact with it, what outputs it produces

**Category C (AI agents)**: generate these
- PRODUCT.md: what the agent does, what data it consumes, how decisions are made, what human-in-the-loop looks like
- CLAUDE.md or AGENT_CONTEXT.md: persistent context the agent reads to understand its role, tools and constraints
- README.md: setup, API keys needed, configuration options

**Category D (Web3-adjacent sites)**: generate these
- PRODUCT.md: what the site does and who it is for
- CONTENT.md: copy guide for all pages if the site is content-heavy

---

## Step 6: Treasury Wallet (Category A Only)

The treasury wallet is an externally owned account (EOA) created by the builder in MetaMask or any EVM wallet. It receives protocol fees automatically via smart contract logic and is not a smart contract itself.

The blueprint must specify:
- The treasury wallet address is stored as an environment variable, never hardcoded in the contract source
- Which contract function routes fees to it and that the routing is atomic (if it fails the whole transaction reverts)
- The builder creates it in MetaMask, backs up the private key and seed phrase offline in two physically separate locations
- The private key never appears in any code, committed file or communication channel
- On testnet: treasury receives test tokens with no real monetary value
- On mainnet: establish a clear withdrawal policy before launch (frequency, amounts, what funds are used for)

---

## Step 7: NFT Metadata and Smart Contract Rules (Category A Only)

**Metadata immutability**: for financial or identity NFTs, the tokenURI is immutable after minting. For pure art NFTs, editability is a design choice. The blueprint must state which applies and why.

**On-chain first rule**: always confirm the on-chain transaction before writing the corresponding database record. Never write an off-chain record assuming a transaction will succeed.

**Factory pattern**: if the product allows multiple independent collections or deployments, use a factory contract that deploys a child contract per collection. Each collection gets its own contract address and is independently auditable.

**Audit note**: include in the blueprint that smart contracts should be audited before mainnet launch. Note it as a required pre-mainnet step even if it is scheduled for later.

**Upgradeability**: choose fixed non-upgradeable contracts by default for simplicity and user trust. Use a proxy upgrade pattern only if there is a strong specific reason and document it clearly.

---

## Step 8: Phased Roadmap for On-Chain Products (Category A Only)

When the chain is not yet on mainnet or a testnet phase is required, structure the roadmap so no phase is blocked by external chain timelines:

- Phase 1 testnet: all primary features, simulated tokens from faucet, no real money
- Phase 2 testnet: secondary and community features that build data and users before mainnet
- Phase 3 mainnet: production with real tokens, full fees active
- Phase 4 and beyond: advanced features requiring a stable user base and real liquidity

Never gate secondary market or community features behind mainnet if they can be meaningfully built and tested on testnet first.

---

## Step 9: Visual Design Notes by Category

**Category A (on-chain marketplaces and protocols)**: dark editorial aesthetic is the standard. Animated backgrounds on the landing page hero using coded patterns (Waves, GrainGradient) or AI-generated video. Clean data-forward interior pages with minimal animation. See FRONTEND_SKILL.md Steps 11 to 14 for the full animation and video workflow.

**Category B (bots and dashboards)**: functional over decorative. Dense data display with clear hierarchy. Dark theme, monospace fonts for prices and wallet addresses, colour-coded status indicators. Animation is minimal: loading states and live data update transitions only.

**Category C (AI agents with a UI)**: if consumer-facing, polished dark UI with personality that matches the agent's persona. If developer-facing, clean, minimal and documentation-forward. Animated backgrounds are appropriate on the marketing landing page, not inside the agent interface itself.

**Category D (Web3-adjacent sites)**: match the company's existing brand where it exists. If no brand guidelines are provided, use dark editorial Web3 aesthetic with the company's accent colour and refer to FRONTEND_SKILL.md for the coded animation patterns.
