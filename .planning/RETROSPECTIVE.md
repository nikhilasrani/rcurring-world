# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Bengaluru Explorer MVP

**Shipped:** 2026-03-31
**Phases:** 4 | **Plans:** 20 | **Tasks:** 41

### What Was Built
- GBA-style pixel art exploration game with tile-locked movement on a 60x60 MG Road/CBD tilemap
- 5 interactive NPCs with Kannada-English dialogue, 4 building interiors, zone discovery banners
- Complete game systems: quest loop, inventory, journal, Namma Metro fast-travel, save/load, pause menu
- Audio system with BGM crossfade, ambient city layers, SFX, and Chrome autoplay handling
- Touch controls (floating joystick + action buttons) for mobile web play
- GitHub Pages deployment with CI pipeline

### What Worked
- Programmatic asset generation (pngjs, canvas, ffmpeg) eliminated manual asset pipeline and kept everything CI-reproducible
- Pure TypeScript managers with no Phaser imports enabled clean unit testing (171 tests)
- Wave-based plan execution with parallel subagents kept velocity high (~7min/plan average)
- Grid Engine plugin handled all movement complexity, freeing plans to focus on game logic
- Phase structure (foundation → interaction → systems → polish) minimized rework between phases

### What Was Inefficient
- Audio placeholder files shipped as silent MP3s and were only caught during human verification — needed real audio generation earlier
- Settings panel sliders were implemented visually but never wired to keyboard/pointer input — dead code shipped through Phase 3 and 4 without detection
- ROADMAP.md plan checkboxes drifted out of sync with actual completion (Phases 2-4 showed unchecked despite being complete)

### Patterns Established
- `scripts/generate-*.cjs` pattern for reproducible asset generation
- EventsCenter for decoupled inter-system communication
- Registry-based manager persistence across Phaser scene restarts
- JSON data files for all game content (NPCs, items, quests, signs)
- E2E tests using `__PHASER_GAME__` dev hook for canvas state inspection

### Key Lessons
1. Placeholder assets should produce observable output — silent MP3s passed all automated checks but failed the real test (human hearing)
2. Input wiring should be tested end-to-end, not just the visual layer — dead code in SettingsPanel went undetected for 2 phases
3. Chrome AudioContext autoplay requires deliberate UX design (unlock gate), not just code workarounds

### Cost Observations
- Model mix: 100% opus (quality profile)
- Timeline: 12 days (2026-03-19 → 2026-03-31)
- 135 commits, 419 files, ~110K insertions
- Notable: Average plan execution was 7 minutes — consistent velocity across all 4 phases

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 4 | 20 | Initial process — wave execution, programmatic assets, pure-logic managers |

### Cumulative Quality

| Milestone | Tests | LOC | Key Metric |
|-----------|-------|-----|-----------|
| v1.0 | 171 | 7,233 | 42/42 requirements validated |

### Top Lessons (Verified Across Milestones)

1. Programmatic asset generation scales better than manual pipelines for AI-assisted development
2. Pure-logic managers (no framework imports) are the key to high unit test coverage
