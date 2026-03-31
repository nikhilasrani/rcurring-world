---
phase: 1
slug: foundation-and-movement
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + playwright |
| **Config file** | vitest.config.ts / playwright.config.ts (Wave 0 installs) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | PLAT-01 | e2e | `npx playwright test boot.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | MOVE-01 | unit | `npx vitest run movement.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | MOVE-03 | unit | `npx vitest run collision.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | MOVE-04 | unit | `npx vitest run camera.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 1 | MOVE-02 | e2e | `npx playwright test sprites.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-05 | 02 | 1 | MOVE-05 | unit | `npx vitest run running.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | EXPL-01 | e2e | `npx playwright test tilemap.spec.ts` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 2 | PLAT-02 | e2e | `npx playwright test touch.spec.ts` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 2 | PLAT-03 | e2e | `npx playwright test touch.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@vitest/coverage-v8` — unit test framework
- [ ] `playwright` + `@playwright/test` — E2E test framework
- [ ] `vitest.config.ts` — vitest configuration
- [ ] `playwright.config.ts` — playwright configuration
- [ ] `tests/unit/` — unit test directory
- [ ] `tests/e2e/` — E2E test directory

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Landmarks recognizable as Bengaluru | EXPL-01 | Subjective visual assessment | Load game, verify Chinnaswamy/UB City/Cubbon Park/Vidhana Soudha/Metro are visually identifiable |
| Touch controls feel responsive | PLAT-02 | Haptic/UX feel on real device | Deploy to GitHub Pages, test on mobile phone, verify joystick + A/B buttons respond naturally |
| Pixel art looks crisp (no sub-pixel blur) | PLAT-01 | Visual quality check | Load on desktop + mobile, verify integer scaling with no blur artifacts |

*All other behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
