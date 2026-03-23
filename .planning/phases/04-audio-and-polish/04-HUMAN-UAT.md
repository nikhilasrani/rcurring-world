---
status: partial
phase: 04-audio-and-polish
source: [04-VERIFICATION.md]
started: 2026-03-23T00:00:00Z
updated: 2026-03-23T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Audio plays without console errors
expected: Title music plays on title screen. Outdoor BGM and city-base ambient start outdoors. Walking produces footstep loop. Building enter/exit plays door SFX and crossfades BGM. NPC interaction plays chime. Pause menu plays menu SFX. Dialogue produces tick sounds.
result: [pending]

### 2. Zone-specific ambient switching
expected: Walking into Cubbon Park zone overlays cubbon-park ambient on top of city-base. Leaving zone restores base-only ambient.
result: [pending]

### 3. E2E Playwright audio test
expected: `npx playwright test tests/e2e/audio-boot.spec.ts` passes with dev server running.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
