---
phase: 02
slug: world-interaction
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x / vitest (whichever Phase 1 established) |
| **Config file** | jest.config.ts or vitest.config.ts |
| **Quick run command** | `npm test -- --bail` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --bail`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | NPC-01 | manual | Browser: walk to NPC, press action | N/A | ⬜ pending |
| 02-01-02 | 01 | 1 | NPC-02 | manual | Browser: verify dialogue box renders | N/A | ⬜ pending |
| 02-01-03 | 01 | 1 | NPC-03 | manual | Browser: verify typewriter effect | N/A | ⬜ pending |
| 02-01-04 | 01 | 1 | NPC-04 | manual | Browser: multi-page dialogue advance | N/A | ⬜ pending |
| 02-01-05 | 01 | 1 | NPC-05 | manual | Browser: NPC faces player | N/A | ⬜ pending |
| 02-01-06 | 01 | 1 | NPC-06 | manual | Browser: NPC patrol resumes | N/A | ⬜ pending |
| 02-02-01 | 02 | 1 | SIGN-01 | manual | Browser: interact with sign | N/A | ⬜ pending |
| 02-02-02 | 02 | 1 | SIGN-02 | manual | Browser: sign uses dialogue box | N/A | ⬜ pending |
| 02-03-01 | 03 | 2 | EXPL-02 | manual | Browser: enter building door | N/A | ⬜ pending |
| 02-03-02 | 03 | 2 | EXPL-03 | manual | Browser: zone banner appears | N/A | ⬜ pending |
| 02-03-03 | 03 | 2 | EXPL-04 | manual | Browser: discover landmarks | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. Phase 2 is primarily a game-logic/rendering phase — validation is manual browser testing.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| NPC interaction trigger | NPC-01 | Requires real-time player movement + keypress in browser | Walk to NPC, press Space/Enter, verify dialogue opens |
| Dialogue box rendering | NPC-02 | Visual rendering check — text styling, box position | Verify semi-transparent box at bottom, NPC name displayed |
| Typewriter text effect | NPC-03 | Animation timing is visual | Watch text appear character-by-character |
| Multi-page dialogue | NPC-04 | Interactive flow across pages | Press action to advance, verify ▼ indicator, final page closes |
| NPC face toward player | NPC-05 | Sprite direction change is visual | Approach from different angles, verify NPC turns |
| NPC patrol behavior | NPC-06 | Movement over time is visual | Wait, observe NPC walking; talk, verify patrol stops then resumes |
| Sign interaction | SIGN-01, SIGN-02 | Same dialogue system, visual | Walk to sign, press action, verify dialogue with sign content |
| Building entry/exit | EXPL-02 | Scene transition is visual | Walk to door tile, verify fade + interior load + return |
| Zone name banner | EXPL-03 | Tween animation is visual | Enter new zone, verify banner slides in/out |
| Landmark discovery | EXPL-04 | Map exploration is visual | Visit all landmarks, verify they exist on map |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
