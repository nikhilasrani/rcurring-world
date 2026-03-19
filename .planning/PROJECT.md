# Recurring World — Bengaluru Explorer

## What This Is

A Pokemon FireRed/Emerald-style exploration game set in Bengaluru, built with GBA-era pixel graphics. Players walk through recognizable neighborhoods, interact with NPCs at real landmarks, and experience the sights and sounds of the city — buying flowers on Sampige Road, catching a cricket match at Chinnaswamy, riding the Namma Metro. Designed for Bengaluru locals who'll recognize every street corner.

## Core Value

The city must *feel* like Bengaluru — recognizable landmarks, authentic interactions, and a nostalgic pixel art aesthetic that makes locals say "I know that place." Getting the look, sound, and feel right matters more than feature count.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] GBA-style tile-based exploration in MG Road / CBD area
- [ ] Recognizable pixel art landmarks (Chinnaswamy, UB City, Cubbon Park, Vidhana Soudha)
- [ ] NPC interactions (buy chai, browse shops, talk to locals)
- [ ] Simple quest system (e.g., "find the best filter coffee on MG Road")
- [ ] Inventory system for collected items
- [ ] Metro as fast-travel mechanic between zones
- [ ] Ambient sound design (city sounds, metro announcements, market noise)
- [ ] Cross-platform: web + iOS/Android via Capacitor
- [ ] Automated testing with Playwright

### Out of Scope

- Battle system — this is exploration, not combat
- Multiplayer — single-player experience first
- Complex economy/trading — economy not a priority for v1
- Rich metro ride experience — start as travel mechanic, iterate later
- Areas beyond MG Road / CBD — start with one zone, expand later
- Real-time events / live content — static content first

## Context

**Starting zone:** MG Road / CBD area — dense with landmarks. Chinnaswamy Stadium, UB City, Cubbon Park, Vidhana Soudha, MG Road metro station all within walking distance in-game.

**First playable experience:** A mini adventure. Player spawns near MG Road, explores the area, talks to 3-5 NPCs, and completes a simple quest. 5 minutes of gameplay that nails the feel.

**Target audience:** Bengaluru locals — people who live or have lived in the city. The nostalgia comes from recognizing real places rendered in GBA pixel style. Every landmark, street, and NPC interaction should trigger "I've been there" moments.

**Asset strategy:** AI-generated assets broken into discrete tasks that can be farmed out to different AI agents (Codex, Gemini, etc.). Start with placeholder pixel art that looks realistic, then iterate with AI to get the authentic Bengaluru feel. Tiles, sprites, NPC art, landmark art, and sound files are all separate workstreams.

**Growth model:** Start small — one neighborhood, a handful of NPCs, one quest. Get the feel right. Then expand: more localities (Malleshwaram, Lalbagh, Indiranagar), more NPCs, more quests, richer metro experience. The architecture must support this expansion.

## Constraints

- **Engine**: Phaser JS — chosen for rapid AI-assisted iteration over Godot/Unity
- **Language**: JavaScript/TypeScript
- **Mobile**: Capacitor wrapper for App Store / Play Store
- **Testing**: Playwright for automated E2E testing
- **Art style**: GBA-era pixel art (GameBoy Advance resolution and palette feel)
- **Map tooling**: Tiled (standard for Phaser tilemaps)
- **Asset generation**: AI-generated, broken into agent-farmable tasks

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phaser JS over Godot/Unity | Enables rapid iteration with AI agents + web-native + Playwright testable | — Pending |
| MG Road / CBD as starting zone | Highest landmark density, recognizable to most Bengaluru locals | — Pending |
| Placeholder assets first | Get gameplay feel right before investing in polished art | — Pending |
| Capacitor for mobile | Web-first development, native packaging for stores when ready | — Pending |
| AI asset pipeline | Scale art/sound creation across multiple AI agents with discrete tasks | — Pending |

---
*Last updated: 2026-03-19 after initialization*
