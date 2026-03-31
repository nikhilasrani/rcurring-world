# Recurring World — Bengaluru Explorer

## What This Is

A Pokemon FireRed/Emerald-style exploration game set in Bengaluru, built with GBA-era pixel graphics. Players walk through recognizable neighborhoods, interact with NPCs at real landmarks, and experience the sights and sounds of the city — buying flowers on Sampige Road, catching a cricket match at Chinnaswamy, riding the Namma Metro. Designed for Bengaluru locals who'll recognize every street corner.

## Core Value

The city must *feel* like Bengaluru — recognizable landmarks, authentic interactions, and a nostalgic pixel art aesthetic that makes locals say "I know that place." Getting the look, sound, and feel right matters more than feature count.

## Requirements

### Validated

- ✓ GBA-style tile-based exploration in MG Road / CBD area — v1.0
- ✓ Recognizable pixel art landmarks (Chinnaswamy, UB City, Cubbon Park, Vidhana Soudha) — v1.0
- ✓ Cross-platform: web + touch controls + GitHub Pages deployment — v1.0
- ✓ Automated testing with Playwright — v1.0 (171 unit tests + E2E suites)
- ✓ NPC interactions (5 NPCs with Kannada-English dialogue, signs, building interiors) — v1.0
- ✓ Quest system ("find the best filter coffee" quest with 3 objectives) — v1.0
- ✓ Inventory system with Bengaluru-specific items (masala dosa, filter coffee, jasmine) — v1.0
- ✓ Metro fast-travel (Namma Metro Purple Line, 3 stations, door transition) — v1.0
- ✓ Ambient sound design (city layers, zone-specific overlays, BGM crossfade, SFX) — v1.0
- ✓ Save/load persistence with auto-save on zone transitions — v1.0
- ✓ Pause menu with 5 tabs (Inventory, Quests, Journal, Save, Settings) — v1.0
- ✓ Discovery journal with zone completion tracking — v1.0

### Active

(Next milestone — see `/gsd:new-milestone`)

### Out of Scope

- Battle system — this is exploration, not combat
- Multiplayer — single-player experience first
- Complex economy/trading — NPCs give items as interactions, not transactions
- Capacitor mobile packaging — deferred to v2 (web-first for v1)
- Areas beyond MG Road / CBD — expand zone by zone in future milestones
- Real-time events / live content — static content first
- Character customization — art pipeline cost too high for v1
- Voice acting — text works better than bad voice lines

## Context

**Current state (v1.0 shipped):** Playable 5-minute Bengaluru walk. 7,233 LOC TypeScript, Phaser 3.90.0 + Grid Engine. 171 unit tests, E2E suites via Playwright. Deployed to GitHub Pages.

**Starting zone:** MG Road / CBD area — 60x60 tilemap with 144 tiles, 5 landmark zones, 4 building interiors, 5 NPCs with Kannada dialogue, 1 complete quest.

**Target audience:** Bengaluru locals — people who live or have lived in the city. The nostalgia comes from recognizing real places rendered in GBA pixel style.

**Asset strategy:** Programmatic asset generation (pngjs for sprites, canvas for tilesets, ffmpeg for audio). All assets are CI-reproducible via scripts.

**Growth model:** v1.0 proved the core loop works. Next: expand to more neighborhoods (Malleshwaram, Lalbagh, Indiranagar), more quests, richer NPCs, visual polish (weather, day/night).

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
| Phaser 3.90.0 over Phaser 4 | Rex plugin ecosystem has no v4 support | ✓ Good — rapid development with rich plugin ecosystem |
| MG Road / CBD as starting zone | Highest landmark density, recognizable to most Bengaluru locals | ✓ Good — 5 landmarks fit naturally in walkable area |
| Programmatic asset generation | pngjs sprites, canvas tilesets, ffmpeg audio — CI-reproducible | ✓ Good — no manual asset pipeline, fully deterministic |
| Grid Engine plugin | Tile-locked movement with collision, pathfinding, animation mapping | ✓ Good — handled all movement complexity cleanly |
| Capacitor deferred to v2 | Web-first with touch controls sufficient for v1 | ✓ Good — reduced scope, GitHub Pages deployment works |
| Pure TypeScript managers | Quest/Inventory/Journal/Save managers with no Phaser imports | ✓ Good — 100% unit testable, clean separation |
| Rex VirtualJoystick | Floating touch joystick with EventsCenter decoupling | ✓ Good — mobile playable from Phase 1 |
| AudioManager with ambient layers | Base + overlay model for zone-specific city sounds | ✓ Good — authentic Bengaluru soundscape |

---
*Last updated: 2026-03-31 after v1.0 milestone*
