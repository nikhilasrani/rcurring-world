---
phase: 4
slug: audio-and-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 (unit) + playwright 1.58.2 (e2e) |
| **Config file** | vitest.config.ts (unit), playwright.config.ts (e2e) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npm run test:all` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npm run test:all`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | AUDO-01 | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "sfx" -x` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | AUDO-01 | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "footstep" -x` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | AUDO-02 | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "bgm" -x` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | AUDO-03 | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "crossfade" -x` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 1 | AUDO-04 | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "ambient" -x` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 1 | AUDO-04 | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "ambient crossfade" -x` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | ALL | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "duck" -x` | ❌ W0 | ⬜ pending |
| 04-04-02 | 04 | 2 | ALL | unit | `npx vitest run tests/unit/audio-manager.test.ts -t "settings" -x` | ❌ W0 | ⬜ pending |
| 04-05-01 | 05 | 2 | ALL | e2e | `npx playwright test tests/e2e/audio-boot.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/audio-manager.test.ts` — stubs for AUDO-01 through AUDO-04, ducking, settings wiring
- [ ] `tests/e2e/audio-boot.spec.ts` — covers audio asset loading verification (checks Phaser sound cache keys exist after boot)
- [ ] AudioManager must be testable without Phaser by mocking the sound manager interface (same pattern as existing managers — no Phaser imports in pure logic)

*Existing vitest + playwright infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audio sounds correct/authentic | ALL | Subjective quality assessment | Play game, listen to each sound in context, verify Bengaluru feel |
| Crossfade feels smooth | AUDO-03 | Perceptual timing judgment | Walk between outdoor and interior, verify no jarring cuts |
| Ambient layers blend naturally | AUDO-04 | Mix quality is perceptual | Walk through all 4 zones, verify layers blend without clashing |
| Volume levels balanced | ALL | Mix balance is perceptual | Play through full loop, verify no sound overwhelms others |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
