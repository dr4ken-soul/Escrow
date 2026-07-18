# Warrant — Marketing Plan

## Goal

Keep Warrant visible during the Slack Agent Builder Challenge without sounding like a pitch deck.

The story is simple: people already say what they are going to do out loud in Slack, and it gets forgotten anyway. Warrant just makes sure it does not. Every post proves the product works, not that the idea is interesting.

Core proof to show in public: a real commitment typed in a real channel, the Canvas entry appearing seconds later, and the deadline DM arriving with working buttons.

---

## Posting Style

- all lowercase
- builder voice, not company voice
- one clear idea per post
- short lines with space between thoughts
- show what works, do not explain what you plan to build
- screen recordings whenever possible

---

## Post Plan

### post 1 — project announcement

```
building warrant for the slack agent builder challenge

the idea: you already say what you're going to do out loud in every slack channel, it just never gets tracked anywhere

no slash command, no bot to talk to

it just listens, catches a commitment, and writes it to a canvas the whole channel can see

if there's a deadline in what you said, it'll dm you the day it's due
```

Attach a screen recording of a commitment message turning into a Canvas entry.

---

### post 2 — final submission

```
submitted warrant to the slack agent builder challenge

it listens for commitments people already make in slack and turns them into a live canvas, no command required

claude reads every message for commitment language

slack's real time search checks if it's already been raised before logging it twice

on the day something's due, you get a dm with one tap to mark it done, still working, or push a day

repo and demo in the submission
```

Attach the repo link and the demo video.

---

## Submission Notes

**Project title:** Warrant

**Tagline:** Say it once. Warrant remembers.

**Built with:**
- Bolt for JavaScript
- Slack Canvas API
- Slack Real-Time Search API
- Claude API
- Socket Mode
- SQLite
- TypeScript

**Project description (under 200 words):**

Warrant listens for the commitments people already make out loud in Slack channels and turns them into a live Canvas ledger, without anyone typing a command. When someone says "I'll have the deck ready by Thursday" in a channel, Warrant catches it, classifies it with the Claude API, and writes it to that channel's Canvas with the owner, a short summary, the deadline and a link back to the original message.

On the day a commitment is due, Warrant sends the owner a private DM with the thread linked and three buttons: Done, Still working, or Push a day. Tapping one updates the Canvas entry in place, so the ledger always reflects reality without anyone editing it by hand.

Before logging a new entry, Warrant uses Slack's Real-Time Search API to check whether the same commitment has already been raised in the channel, avoiding duplicate entries for something that was simply restated.

Nothing about using Warrant requires learning an interface. It works from the moment it is added to a channel, which is the entire point.

**Demo video flow:**
1. Add Warrant to a test channel, show the empty Canvas
2. Type a real commitment message in the channel
3. Show the Canvas updating within seconds with the new entry
4. Trigger a deadline manually, show the DM arriving with the three buttons
5. Tap Done, show the Canvas entry updating in place
6. Briefly show a restated commitment being caught by the RTS check instead of duplicating

---

## Checklist

- [ ] Passive detection loop tested and working before post 1
- [ ] Full lifecycle (detect, nudge, resolve) tested at least twice before post 2
- [ ] Post 1 goes out early in the build window
- [ ] Post 2 goes out at submission
- [ ] Repo is public before post 2 goes out
- [ ] Demo video roughly 3 minutes, passive detection shown first
