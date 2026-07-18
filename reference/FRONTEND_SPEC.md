# FRONTEND_SPEC.md — Vault

Full frontend specification. Every decision here was confirmed directly with Paul across the design gate process, nothing in this file is an assumption.

## 0. Assets in this folder

This spec is handed off alongside a set of files. Each one is called out below with what it is for and how to use it, read this before opening any of them.

- **`vault-hero-bg.mp4`** — the literal, final hero background video. This is not a reference, load it directly as the hero section's video source exactly as described in section 3.
- **`reference-images/reference-player-radar-chart.jpg`** — a shape reference only, for the radar or traits chart described in section 4 under `/app/squad`. Match the diamond-style chart geometry and how the value trend line sits beneath it, nothing else. Do not copy this image's colours, copy, layout, or any other element, Vault's own tokens and copy apply everywhere.
- **`reference-images/reference-agent-control-panel.jpg`** — a shape reference only, for the right-hand agent control panel described in section 4 under `/app` Dashboard. Match the panel's proportions and how fields stack vertically, nothing else, same rule as above.
- **`reference-images/reference-trade-feed-rows.jpg`** — a shape reference only, for the trade feed row layout described in section 4 under `/app` Dashboard. Match how each row arranges its icon, label, amount, and timestamp, nothing else, same rule as above.

Anywhere a section below says "see reference," it is pointing back to one of these three files. Everywhere else in this spec, exact values are already given in prose or CSS and no image is needed.

## 1. Design tokens

### Colour, "Matchday Amber"

```css
:root {
  --bg-primary: #080a0f;
  --bg-secondary: #0d0f16;
  --bg-surface: #12141d;
  --bg-elevated: #191c27;

  --accent: #f0a030;
  --accent-hover: #ffb954;
  --accent-glow: rgba(240, 160, 48, 0.14);

  --text-primary: #eef0f4;
  --text-secondary: #868c9c;
  --text-muted: #454b5c;

  --border-subtle: rgba(255, 255, 255, 0.04);
  --border-default: rgba(255, 255, 255, 0.08);

  --success: #22c55e;
  --error: #ef4444;
}
```

No hardcoded hex values inside any component file. Every colour reference pulls from these variables.

### Typography

- Display: **Newsreader** (editorial serif, used for headlines, the ticker wordmark, and section titles)
- Body: **Manrope** (all running copy, labels, buttons)
- Data and mono: **Martian Mono** (every number, every stat, every live value, the trade feed, the ticker itself)

This pairing has not been used together on any prior project. Do not substitute Inter, Roboto, Arial, Space Grotesk, or any system font as a fallback for the display role.

### Spacing and radius

8px base unit. Radius kept small and consistent, 6px on cards and inputs, 4px on pills and tags. Vault leans toward sharp editorial geometry, not soft rounded surfaces.

## 2. Navigation

### Landing: top editorial strip

Three zones in a single fixed bar. Left, the Vault wordmark set in Newsreader, no icon, no mark attached. Centre, a live scrolling ticker, squad value and agent status flowing continuously, styled like a stock ticker crossed with a match day scoreboard, running in Martian Mono. Right, a single connect action.

This pattern has not appeared in any prior project and was chosen specifically for that reason.

### App interior: sidebar

Fixed left sidebar, editorial hierarchy matching the reference pulled from the dashboard image set. Vault wordmark at the top, four primary links below it (Dashboard, Squad, Agent, Trades), user wallet identity pinned at the bottom. No icon substitutes for the wordmark here either.

### App interior: background

A very quiet starfield texture sits behind the entire viewport, sidebar included, near-black with only a faint suggestion of scattered points and a soft glow toward the top centre. Opacity is kept low enough that it never competes with sidebar legibility or data density, it reads as atmosphere, not decoration. Stays fixed during scroll.

## 3. Landing page

### Hero

Full viewport, video background. Asset: `vault-hero-bg.mp4`, the chrome and gold knot with a fixed static camera orbit, geometry never deforms. Video sits behind a subtle dark gradient overlay at the bottom third only, enough to keep headline text legible without flattening the metal's contrast. Top editorial strip nav sits over the video. Headline and subhead sit lower third, left aligned, Newsreader for the headline, Manrope for the subhead. Single primary CTA, connect wallet and enter the demo.

Headline direction: state plainly what Vault does, an agent that runs your squad and trades on your behalf, settled in USDt, no cloud, no manual approval.

### Section order

1. **Hero** — video background, ticker nav, headline, subhead, CTA.
2. **The agent loop** — three step visual explainer, build the squad, the agent watches form and value continuously, the agent trades autonomously. Each step gets a short Martian Mono numeral (01, 02, 03) and a Manrope description.
3. **Live trade proof** — a real screenshot of the dashboard's trade feed mid-settlement, two agent identities, an offer, an accepted counter, a settled USDt amount. This section carries the entire sales argument, keep the surrounding copy minimal and let the screenshot do the work.
4. **Squad intelligence** — a single player tile preview, radar chart, value trend, form score, pulled directly from the app interior component so the landing page never invents a different visual language from the product itself.
5. **Track fit strip** — two compact columns, QVAC and WDK, one line each stating exactly how the track is used. No padding copy, this section exists for judges scanning quickly.
6. **Closing CTA** — repeat the connect action, single line reinforcing the core pitch.

## 4. App interior

### `/app` — Dashboard

Three structural zones, not two. Left, the global sidebar. Centre, the main column: a small "last updated" indicator showing the agent's most recent sync time sits at the very top, directly above the KPI strip, matching where this element actually sits in the source reference rather than in the sidebar. Below that, the KPI strip (Squad Value, Agent Status, Open Trades, USDt Balance, numbers in Martian Mono, labels in Manrope, all values live), then the trade feed. Right, a fixed agent control panel, always visible, showing what the QVAC agent is doing at this exact moment, its current evaluation step, a short live reasoning snippet, and a link through to the full log at `/app/agent`. The right panel is the "is it working right now" view, the agent page is the full history. See reference: `reference-images/reference-agent-control-panel.jpg` for panel proportions and vertical field stacking, adapt everything else to Vault's own tokens.

**Trade feed motion:** full animation confirmed. When a new trade lands, the row slides in from the top and the settlement number counts up from zero to its final value rather than appearing instantly. This is the one place in the entire product where expressive motion is deliberately used, because it is the moment that sells the demo. See reference: `reference-images/reference-trade-feed-rows.jpg` for row layout, icon, label, amount, and timestamp arrangement, adapt everything else to Vault's own tokens.

### `/app/squad`

Full roster as a grid of player tiles. Each tile: photo slot (plain comment until Paul supplies real assets), name, position, club, a radar chart plotting the same attribute set as the landing page preview, a value trend sparkline beneath it, and a compact two-column agent read directly under that, Strengths on one side and Style on the other, a short agent-generated line for each. No card treatment, no flip interaction, no rarity styling of any kind. See reference: `reference-images/reference-player-radar-chart.jpg` for the diamond-style chart geometry and how the value trend sits beneath it, adapt everything else to Vault's own tokens.

### `/app/agent`

The agent's reasoning trace, presented as a reverse chronological log. Every decision the agent made is a single entry: what it evaluated, what it decided, and why, written in the formal writing voice defined in CLAUDE.md. This page exists to make the agent's autonomy legible and trustworthy, not to entertain.

### `/app/trades`

Full settlement history as a data table, not cards. Columns: counterparties, players involved, agreed value, settlement transaction reference, timestamp. Sortable by column header, filterable by date range.

## 5. Component patterns

**Dashboard hardening: borders over cards.** Interior surfaces use `1px solid var(--border-default)` rather than heavy drop shadows or filled card backgrounds. This keeps the data-dense interior legible and premium rather than stacking box on box.

**Hover states** are CSS class based only, `.trade-row:hover` and similar, never inline handlers.

**Loading states** are skeleton shimmer across every data-dependent surface, KPI tiles, trade feed rows, player tiles. No spinners anywhere in the product.

**Entrance animation** on first load of any page uses the standard Framer blur-in pattern via `motion/react`. The trade feed's count-up and slide-in behaviour is the only additional expressive motion beyond that baseline.

## 6. Wallet-gated routing

`/app` and every route beneath it require an active WDK wallet connection. Unconnected visitors hitting any `/app/*` route are redirected to the landing hero with the connect CTA in focus. The app interior wallet dropdown shows the connected address, USDt balance, and a disconnect action, styled consistently with the KPI tile treatment rather than as a separate visual system.

## 7. Asset slots

Every one of the following stays a plain HTML comment (`{/* Vault logo asset, provided by Paul */}` or equivalent) until the real file is supplied: logo mark, favicon, any player photography, any club or competition badge. The Newsreader wordmark is the only text based exception and is not a placeholder, it is the intended final treatment for the nav brand mark.
