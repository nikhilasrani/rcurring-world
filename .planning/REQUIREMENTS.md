# Requirements: Recurring World -- Bengaluru Explorer

**Defined:** 2026-03-19
**Core Value:** The city must feel like Bengaluru -- recognizable landmarks, authentic interactions, and nostalgic pixel art that makes locals say "I know that place."

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Movement

- [x] **MOVE-01**: Player can walk on a 16x16 tile grid in 4 directions using keyboard or D-pad
- [x] **MOVE-02**: Player sprite has walk animations for all 4 directions (minimum 3 frames each)
- [x] **MOVE-03**: Player cannot walk through walls, buildings, water, or other impassable tiles
- [x] **MOVE-04**: Camera follows the player smoothly and stays bounded within the map edges
- [x] **MOVE-05**: Player can toggle running shoes to move at 2x speed

### Exploration

- [x] **EXPL-01**: MG Road / CBD zone is explorable with recognizable pixel art of Chinnaswamy Stadium, UB City, Cubbon Park entrance, Vidhana Soudha, and MG Road Metro station
- [x] **EXPL-02**: Player can enter and exit 2-3 building interiors (metro station, shop, landmark) via door tiles
- [x] **EXPL-03**: Area name banner slides in when player enters a new zone or building (e.g., "MG Road", "Cubbon Park")
- [x] **EXPL-04**: Player can discover and visit all major landmarks in the MG Road / CBD area

### NPC

- [x] **NPC-01**: 3-5 interactive NPCs are placed in the world (chai-walla, auto driver, local guide, shopkeeper, park visitor)
- [x] **NPC-02**: Player can walk up to an NPC and press action button to talk
- [x] **NPC-03**: NPCs face toward the player when spoken to
- [x] **NPC-04**: Dialogue appears in a bottom-of-screen box with typewriter text reveal and tap-to-advance
- [x] **NPC-05**: Dialogue supports multi-page messages and displays the NPC's name
- [x] **NPC-06**: NPC dialogue uses culturally authentic language (English with Kannada words/phrases mixed in)

### Signs

- [x] **SIGN-01**: Player can interact with signs, notice boards, and plaques to read text
- [x] **SIGN-02**: Sign text uses the same dialogue box system as NPC dialogue

### Quest

- [ ] **QUST-01**: Player can accept a quest from an NPC through dialogue
- [ ] **QUST-02**: Player can track quest objectives (accepted -> in-progress -> complete)
- [ ] **QUST-03**: At least 1 complete quest exists: "Find the best filter coffee on MG Road" or equivalent city-specific quest
- [ ] **QUST-04**: Quest completion triggers a reward (item, NPC reaction, or new dialogue)

### Inventory

- [ ] **INVT-01**: Player can collect items into an inventory
- [ ] **INVT-02**: Player can view collected items with pixel art icons and flavor text descriptions
- [ ] **INVT-03**: Collectible items include Bengaluru-specific local items (masala dosa, filter coffee, jasmine flowers, etc.)

### Journal

- [ ] **JRNL-01**: Player has a discovery journal that records landmarks visited
- [ ] **JRNL-02**: Journal tracks NPCs met and items collected
- [ ] **JRNL-03**: Journal shows completion percentage for the current zone

### Metro

- [ ] **MTRO-01**: Player can enter a metro station and access a metro map UI
- [ ] **MTRO-02**: Player can select a destination station and fast-travel to it
- [ ] **MTRO-03**: Metro travel includes a transition animation (doors close, brief ride, doors open)

### Audio

- [ ] **AUDO-01**: Basic SFX play for key actions: footsteps, door open/close, NPC interaction chime, menu sounds
- [ ] **AUDO-02**: Area-specific background music plays (at least outdoor theme + interior theme)
- [ ] **AUDO-03**: Music crossfades on zone/building transitions
- [ ] **AUDO-04**: Ambient city sounds are layered by area (e.g., traffic near roads, birds in Cubbon Park, announcements near metro)

### Save

- [ ] **SAVE-01**: Player can manually save their game from the pause menu
- [ ] **SAVE-02**: Game auto-saves on zone transitions
- [ ] **SAVE-03**: Saved state includes player position, quest progress, inventory, visited landmarks, and journal entries
- [ ] **SAVE-04**: Player can load their saved game and resume from where they left off

### Platform

- [x] **PLAT-01**: Game runs in a web browser (Chrome, Safari, Firefox)
- [x] **PLAT-02**: Virtual D-pad and action button overlay appears on touch devices
- [x] **PLAT-03**: Touch controls do not obscure the gameplay area
- [ ] **PLAT-04**: Pause menu is accessible via menu button/key with sections: Inventory, Quests, Journal, Save, Settings

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Navigation

- **NAV-01**: Auto-rickshaw NPC offers short-distance rides within a zone with humorous haggling dialogue
- **NAV-02**: Second explorable zone (Malleshwaram, Lalbagh, or Indiranagar) connected via metro

### Visual

- **VISL-01**: Weather effects -- rain overlay, evening palette shift, morning mist in parks
- **VISL-02**: Bilingual signboards displaying Kannada + English text on in-game signs
- **VISL-03**: Day/night palette cycle (cosmetic, no gameplay gating)

### Platform

- **PLAT-05**: Capacitor packaging for iOS App Store and Google Play Store distribution
- **PLAT-06**: NPC portrait sprites alongside dialogue text

### Content

- **CONT-01**: 3-5 additional quests with variety: fetch, explore, photograph, talk-to-all types
- **CONT-02**: More BGM tracks with per-zone music identity
- **CONT-03**: Multiple interconnected zones with metro network

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Combat / battle system | Exploration game, not an RPG. Combat-free is a design choice, not a limitation. |
| Multiplayer / co-op | Networking adds massive scope. This is a solitary city stroll experience. |
| Complex economy / trading | Economy balancing is a black hole. NPCs give items as interactions, not transactions. |
| Procedural generation | Value is handcrafted Bengaluru authenticity. Generated content feels generic. |
| Minigames (cricket, cooking) | Each minigame is a separate game to build. Defer to v2+ if core loop validates. |
| Character customization | Art pipeline cost multiplied. Low value for a game about the city, not the avatar. |
| Voice acting | Production cost too high. Bad voice lines kill immersion worse than text. |
| Full Bengaluru city map | One neighborhood done well > entire city done poorly. Expand zone by zone. |
| Real-time clock / live events | Locks content behind time. Players in different contexts miss things. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOVE-01 | Phase 1 | Complete |
| MOVE-02 | Phase 1 | Complete |
| MOVE-03 | Phase 1 | Complete |
| MOVE-04 | Phase 1 | Complete |
| MOVE-05 | Phase 1 | Complete |
| EXPL-01 | Phase 1 | Complete |
| PLAT-01 | Phase 1 | Complete |
| PLAT-02 | Phase 1 | Complete |
| PLAT-03 | Phase 1 | Complete |
| NPC-01 | Phase 2 | Complete |
| NPC-02 | Phase 2 | Complete |
| NPC-03 | Phase 2 | Complete |
| NPC-04 | Phase 2 | Complete |
| NPC-05 | Phase 2 | Complete |
| NPC-06 | Phase 2 | Complete |
| SIGN-01 | Phase 2 | Complete |
| SIGN-02 | Phase 2 | Complete |
| EXPL-02 | Phase 2 | Complete |
| EXPL-03 | Phase 2 | Complete |
| EXPL-04 | Phase 2 | Complete |
| QUST-01 | Phase 3 | Pending |
| QUST-02 | Phase 3 | Pending |
| QUST-03 | Phase 3 | Pending |
| QUST-04 | Phase 3 | Pending |
| INVT-01 | Phase 3 | Pending |
| INVT-02 | Phase 3 | Pending |
| INVT-03 | Phase 3 | Pending |
| JRNL-01 | Phase 3 | Pending |
| JRNL-02 | Phase 3 | Pending |
| JRNL-03 | Phase 3 | Pending |
| MTRO-01 | Phase 3 | Pending |
| MTRO-02 | Phase 3 | Pending |
| MTRO-03 | Phase 3 | Pending |
| SAVE-01 | Phase 3 | Pending |
| SAVE-02 | Phase 3 | Pending |
| SAVE-03 | Phase 3 | Pending |
| SAVE-04 | Phase 3 | Pending |
| PLAT-04 | Phase 3 | Pending |
| AUDO-01 | Phase 4 | Pending |
| AUDO-02 | Phase 4 | Pending |
| AUDO-03 | Phase 4 | Pending |
| AUDO-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap revision (PLAT-02, PLAT-03 moved to Phase 1)*
