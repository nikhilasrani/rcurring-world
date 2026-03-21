---
phase: 3
slug: game-systems
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 (unit) + Playwright 1.58.2 (E2E) |
| **Config file** | `vitest.config.ts` (unit), `playwright.config.ts` (E2E) |
| **Quick run command** | `vitest run --reporter=verbose` |
| **Full suite command** | `npm run test:all` |
| **Estimated runtime** | ~15 seconds (unit) + ~45 seconds (E2E) |

---

## Sampling Rate

- **After every task commit:** Run `vitest run --reporter=verbose`
- **After every plan wave:** Run `npm run test:all`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds (unit), 60 seconds (full)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | QUST-01 | unit | `vitest run tests/unit/quest-manager.test.ts -t "accept" --reporter=verbose` | W0 | pending |
| 03-01-02 | 01 | 1 | QUST-02 | unit | `vitest run tests/unit/quest-manager.test.ts -t "objective" --reporter=verbose` | W0 | pending |
| 03-01-03 | 01 | 1 | QUST-03 | E2E | `playwright test tests/e2e/coffee-quest.spec.ts` | W0 | pending |
| 03-01-04 | 01 | 1 | QUST-04 | unit | `vitest run tests/unit/quest-manager.test.ts -t "complete" --reporter=verbose` | W0 | pending |
| 03-02-01 | 02 | 1 | INVT-01 | unit | `vitest run tests/unit/inventory-manager.test.ts --reporter=verbose` | W0 | pending |
| 03-02-02 | 02 | 1 | INVT-02 | E2E | `playwright test tests/e2e/pause-menu.spec.ts` | W0 | pending |
| 03-02-03 | 02 | 1 | INVT-03 | unit | `vitest run tests/unit/inventory-manager.test.ts -t "capacity" --reporter=verbose` | W0 | pending |
| 03-03-01 | 03 | 1 | JRNL-01 | unit | `vitest run tests/unit/journal-manager.test.ts -t "landmark" --reporter=verbose` | W0 | pending |
| 03-03-02 | 03 | 1 | JRNL-02 | unit | `vitest run tests/unit/journal-manager.test.ts -t "npc\|item" --reporter=verbose` | W0 | pending |
| 03-03-03 | 03 | 1 | JRNL-03 | unit | `vitest run tests/unit/journal-manager.test.ts -t "completion" --reporter=verbose` | W0 | pending |
| 03-04-01 | 04 | 2 | MTRO-01 | E2E | `playwright test tests/e2e/metro-travel.spec.ts` | W0 | pending |
| 03-04-02 | 04 | 2 | MTRO-02 | compile | `npx tsc --noEmit` | N/A | pending |
| 03-04-03 | 04 | 2 | MTRO-03 | E2E | `playwright test tests/e2e/metro-travel.spec.ts` | W0 | pending |
| 03-05-01 | 05 | 2 | SAVE-01 | unit | `vitest run tests/unit/save-manager.test.ts -t "save" --reporter=verbose` | W0 | pending |
| 03-05-02 | 05 | 2 | SAVE-02 | unit | `vitest run tests/unit/save-manager.test.ts -t "auto" --reporter=verbose` | W0 | pending |
| 03-05-03 | 05 | 2 | SAVE-03 | unit | `vitest run tests/unit/save-manager.test.ts -t "state" --reporter=verbose` | W0 | pending |
| 03-05-04 | 05 | 2 | SAVE-04 | unit + E2E | `vitest run tests/unit/save-manager.test.ts -t "load" --reporter=verbose` | W0 | pending |
| 03-06-01 | 06 | 2 | PLAT-04 | E2E | `playwright test tests/e2e/pause-menu.spec.ts` | W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/quest-manager.test.ts` -- stubs for QUST-01, QUST-02, QUST-04
- [ ] `tests/unit/inventory-manager.test.ts` -- stubs for INVT-01, INVT-03
- [ ] `tests/unit/journal-manager.test.ts` -- stubs for JRNL-01, JRNL-02, JRNL-03
- [ ] `tests/unit/save-manager.test.ts` -- stubs for SAVE-01, SAVE-02, SAVE-03, SAVE-04
- [ ] `tests/e2e/pause-menu.spec.ts` -- stubs for PLAT-04, INVT-02
- [ ] `tests/e2e/coffee-quest.spec.ts` -- stubs for QUST-03
- [ ] `tests/e2e/metro-travel.spec.ts` -- stubs for MTRO-01, MTRO-03

Note: MTRO-02 (metro station selection) and INVT-03 (item catalog content) are verified via `npx tsc --noEmit` compile checks and inventory-manager unit tests respectively, not dedicated test files. The MetroMap is a Phaser UI class with no pure-logic unit to test independently; station data is hardcoded and validated at compile time. Item catalog content (8 Bengaluru items in items.json) is validated by the inventory-manager tests that exercise item addition with real ItemDef data.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Metro transition animation visual quality | MTRO-03 | Subjective visual assessment of doors close/ride/doors open animation | 1. Enter metro station 2. Select destination 3. Verify animation plays smoothly with doors closing, train ride, doors opening |
| Pixel art item icons render correctly | INVT-02 | Visual quality check for generated sprites | 1. Open inventory tab 2. Verify each item has visible pixel art icon 3. Verify icons are distinguishable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
