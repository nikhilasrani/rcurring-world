# Pitfalls Research

**Domain:** GBA-style tile-based exploration game (Phaser JS + Tiled + Capacitor + AI assets + Playwright)
**Researched:** 2026-03-19
**Confidence:** HIGH (most pitfalls verified across multiple sources including Phaser GitHub issues, official docs, and community post-mortems)

## Critical Pitfalls

### Pitfall 1: Tileset Bleeding / Seam Artifacts

**What goes wrong:**
Hairline gaps appear between tiles during rendering, especially visible when the camera moves or zooms. Pixels from adjacent tiles in the tileset image "bleed" into neighboring tiles because GPU texture sampling reads fractional pixel coordinates at tile boundaries. This is the single most reported visual bug in Phaser tilemap games.

**Why it happens:**
When WebGL (or Canvas at non-integer positions) samples a tileset texture, it can read pixels from the edge of an adjacent tile in the spritesheet. This gets worse with camera zoom (non-integer scale factors), sub-pixel camera movement, and on high-DPI / Retina displays where the internal resolution differs from the display resolution.

**How to avoid:**
- Use `tile-extruder` (npm package from sporadic-labs) to extrude all tilesets before importing into Phaser. Extrusion duplicates edge pixels outward so sampling errors read the correct color.
- When adding extruded tilesets in Phaser, set margin and spacing correctly: a 1px extrusion means `margin: 1, spacing: 2` in `map.addTilesetImage()`.
- If using camera zoom, extrude by 2px or more instead of 1px.
- Set `roundPixels: true` in the game config and on the camera to prevent sub-pixel rendering.
- Use integer camera scroll values: `camera.setScroll(Math.round(x), Math.round(y))`.

**Warning signs:**
- Flickering lines between tiles during scrolling
- Lines that appear only at certain zoom levels or on certain devices
- Lines visible on mobile but not desktop (different GPU sampling behavior)

**Phase to address:**
Asset pipeline setup phase (Phase 1 / Foundation). Must be solved before any map content is authored, because retroactively extruding tilesets after maps are built in Tiled requires re-exporting everything.

---

### Pitfall 2: Pixel Art Scaling Destroys the GBA Aesthetic

**What goes wrong:**
Pixel art looks blurry, smeared, or has inconsistent pixel sizes across the screen. The crisp, sharp GBA look is lost. On Retina/high-DPI displays, the game renders at physical resolution then gets scaled, causing bilinear filtering to blur everything. On non-integer scale factors, some pixels appear larger than others (the "fat pixel" problem).

**Why it happens:**
GBA resolution is 240x160. Modern screens are 1920x1080 or higher. Scaling 240x160 to fit a 1080p screen requires ~6.75x scaling -- a non-integer factor. Nearest-neighbor scaling at non-integer ratios causes some pixels to be 6px wide and others 7px wide, creating a visibly uneven grid. Additionally, Phaser defaults to bilinear filtering, and high-DPI devices compound the problem by applying their own scaling layer.

**How to avoid:**
- Render at a fixed low resolution (e.g., 240x160 or 480x320) and use integer scaling only (2x, 3x, 4x, etc.) to fill the screen. Letterbox the remainder.
- Set `pixelArt: true` in the Phaser game config -- this disables antialiasing and texture smoothing globally.
- Set `roundPixels: true` in both the game config and camera config.
- Use Phaser's Scale Manager with `mode: Phaser.Scale.FIT` and explicitly set the game resolution to GBA-like dimensions.
- On Retina displays, set `zoom: 1 / window.devicePixelRatio` and multiply game dimensions by `devicePixelRatio`, OR use `resolution: window.devicePixelRatio` (but test thoroughly -- this has historically been buggy).
- Accept letterboxing. Stretching to fill destroys pixel consistency.

**Warning signs:**
- Pixel art looks "soft" or "blurry" on any device
- Some tiles appear slightly larger than others
- Art looks perfect on desktop but wrong on mobile
- Text or UI elements look fuzzy next to crisp pixel art

**Phase to address:**
Foundation phase (Phase 1). The rendering pipeline, scale mode, and resolution must be locked down before any visual content is created. Every asset depends on this decision.

---

### Pitfall 3: Tilemap Layer Count Tanks Performance

**What goes wrong:**
Frame rate degrades linearly with each tilemap layer added. A map with 8 layers runs at roughly half the FPS of a map with 1 layer. Developers designing maps in Tiled naturally create many layers (ground, paths, buildings, rooftops, decorations, collision, etc.) without realizing the rendering cost.

**Why it happens:**
Each tilemap layer in Phaser is a separate rendering pass. Even with camera culling, each layer iterates over all visible tiles independently. Phaser GitHub issue #839 demonstrated: 1 layer = 62fps, 4 layers = 52fps, 6 layers = 42fps, 8 layers = 34fps. The cost is per-layer, not per-tile -- empty tiles in a layer still cost processing time for culling checks.

**How to avoid:**
- Design maps with a strict maximum of 3-4 visible tilemap layers. Combine decorative elements onto fewer layers in Tiled using "flatten" operations.
- Use a dedicated collision layer that is never rendered (set `visible: false` or use object layers for collision data instead).
- For decorative objects that don't tile (NPCs, signs, trees), use Phaser Sprites placed from Tiled object layers rather than additional tile layers. Object layers have zero rendering cost until sprites are created from them.
- Profile early: add an FPS counter from day one and test on the lowest-target mobile device.

**Warning signs:**
- Map designer keeps adding layers in Tiled "for organization"
- FPS drops when entering areas with more visual detail
- Performance is fine on desktop but terrible on mobile
- More than 5 tilemap layers in any single map

**Phase to address:**
Map design phase (Phase 2 / Content). Establish layer budgets and naming conventions before map authoring begins. Document the layer structure as a standard.

---

### Pitfall 4: iOS WebGL Context Loss and Mobile Rendering Failures

**What goes wrong:**
Game crashes or shows a black screen on iOS Safari / Capacitor WebView when the user locks their phone, switches apps, or the device is under memory pressure. WebGL context is silently destroyed by the OS, and Phaser does not automatically recover. Additionally, WebGL on iOS can be significantly slower than Canvas rendering -- the opposite of what developers expect.

**Why it happens:**
iOS aggressively reclaims GPU resources from background WebViews. When a Capacitor-wrapped game goes to background, iOS destroys the WebGL context. On resume, Phaser tries to render to a dead context and either crashes or shows nothing. Furthermore, Apple's WebGL implementation in WKWebView has historically been less optimized than their Canvas implementation, meaning WebGL can actually perform 30% worse than Canvas on older iOS devices.

**How to avoid:**
- Listen for WebGL context loss events and implement recovery: `game.canvas.addEventListener('webglcontextlost', ...)` and `webglcontextrestored`.
- On context loss: pause the game, show a loading indicator. On restore: reload textures and resume.
- Test with Canvas renderer (`type: Phaser.CANVAS`) on iOS target devices. If Canvas is faster, use it. A 2025 case study showed 30% performance improvement switching from WebGL to Canvas on older Android devices too.
- Consider renderer auto-detection: use Canvas on iOS/older devices, WebGL elsewhere.
- Handle Capacitor `appStateChange` events to pause/resume the game properly.
- Test on actual iOS devices, not just simulators -- context loss behavior differs.

**Warning signs:**
- Black screen after switching back to the app
- Crash reports from iOS users with no clear stack trace
- "WebGL: context lost" in console
- Performance worse on iOS than expected despite "hardware acceleration"

**Phase to address:**
Mobile packaging phase (Phase 3 / Mobile). Must be addressed before any App Store submission. But the renderer choice (WebGL vs Canvas) should be evaluated during Foundation (Phase 1).

---

### Pitfall 5: AI-Generated Tilesets Lack Grid Consistency

**What goes wrong:**
AI-generated pixel art tiles do not align to the pixel grid, have inconsistent pixel sizes within a single tile, contain anti-aliased edges that break the pixel art aesthetic, use inconsistent color palettes across tiles, and do not seamlessly tile with adjacent pieces. Every tileset requires extensive manual cleanup, negating the "speed" advantage of AI generation.

**Why it happens:**
AI image generators are trained on high-resolution images and learn to produce smooth gradients and anti-aliased edges. They fundamentally do not understand the constraints of pixel art: strict grid alignment, limited palettes, no anti-aliasing, edge-pixel matching for seamless tiling. Even "pixel art" models produce "pixel-art-looking" images that fake the aesthetic but violate the technical constraints required for a tileset. The AI gets you ~70% there; the remaining 30% is manual grid alignment, palette enforcement, and seam fixing.

**How to avoid:**
- Treat AI output as a "first draft," never as production-ready. Budget 30-40% of asset time for manual cleanup in Aseprite or Piskel.
- Enforce a strict color palette (e.g., 32 colors max, defined in a .pal file). Run all AI output through a palette quantization step before use.
- Generate tiles at exactly the target resolution (16x16 or 32x32). Do NOT generate at higher resolution and downscale -- this introduces anti-aliasing artifacts.
- Use specialized pixel art AI tools (PixelLab, Retro Diffusion) over general-purpose generators (Midjourney, DALL-E). They understand grid constraints better.
- Create a validation checklist for every tile: grid alignment, palette compliance, edge pixel matching, no sub-pixel elements, seamless tiling test.
- Build a reference spritesheet early with 5-10 "golden" tiles that define the art style. Use these as style anchors for all future AI generation.

**Warning signs:**
- Tiles look great in isolation but have visible seams when placed in a grid
- Zooming in reveals anti-aliased (gradient) edges on what should be hard pixel boundaries
- Color picker shows dozens of slightly-different-but-almost-the-same colors
- Tiles from different generation sessions look like they belong to different games
- Manual cleanup time exceeds generation time

**Phase to address:**
Asset pipeline phase (Phase 1 / Foundation for pipeline setup, Phase 2 / Content for execution). The validation pipeline and palette must be established before any bulk asset generation begins.

---

### Pitfall 6: Memory Leaks from Scene Transitions

**What goes wrong:**
Memory usage grows continuously as players move between areas (scenes). After 10-15 scene transitions, the game becomes sluggish and eventually crashes, especially on mobile devices with limited memory. Textures from previous scenes remain in GPU memory even after the scene is destroyed.

**Why it happens:**
Phaser does not automatically clean up all resources when a scene is destroyed. Specifically: textures loaded in one scene persist in the TextureManager unless explicitly removed. Event listeners registered with arrow functions cannot be removed with `.off()` because the reference is lost. Tweens, timers, and physics bodies may keep references to destroyed game objects. Phaser 3.70 had a specific bug where DynamicTexture destruction leaked memory (fixed in later versions but illustrates the fragility).

**How to avoid:**
- Implement a strict scene lifecycle: `init()` -> `preload()` -> `create()` -> `update()` -> `shutdown()`. The `shutdown` event is where ALL cleanup must happen.
- Never load the same texture with different keys across scenes. Use a shared preload scene for common assets (player sprite, UI elements, common tiles).
- Store event listener references so they can be properly removed: `this.handler = () => {...}; this.input.on('pointerdown', this.handler);` then `this.input.off('pointerdown', this.handler);` in shutdown.
- Use Chrome DevTools GPU memory inspector to track texture allocation across scene transitions during development.
- For zone transitions in the exploration game: consider keeping the map scene alive and swapping tilemap data rather than destroying/recreating scenes.
- Call `this.scene.stop()` (not just `this.scene.start('newScene')`) to properly trigger shutdown on the old scene.

**Warning signs:**
- Memory usage in DevTools grows after each zone transition and never decreases
- Game becomes sluggish after extended play sessions
- Textures occasionally appear corrupted or missing after scene switches
- Mobile crashes after 10+ minutes of gameplay

**Phase to address:**
Architecture phase (Phase 1 / Foundation for the scene management pattern, Phase 2 / Content for zone transition implementation). The scene lifecycle pattern must be designed before multiple zones exist.

---

### Pitfall 7: Collision Layer Mismanagement in Tiled-to-Phaser Pipeline

**What goes wrong:**
Player walks through walls, gets stuck in invisible collision geometry, or collision works in Tiled preview but breaks in Phaser. Collision boundaries do not match visual tile boundaries, creating a frustrating "the door looks open but I can't walk through it" experience.

**Why it happens:**
Tiled and Phaser handle collision differently. Common mistakes: (1) Using tile GID-based collision but forgetting that Tiled GIDs are 1-indexed while Phaser arrays are 0-indexed. (2) Setting collision properties on tiles in Tiled but calling the wrong Phaser method (`setCollisionByProperty` vs `setCollisionByExclusion` vs `setCollision`). (3) Using Arcade Physics collision with tilemaps and getting strange Y-velocity artifacts where sprites jitter or fall through edges at low FPS. (4) Forgetting that collision must be set BEFORE adding physics colliders.

**How to avoid:**
- Use a single, consistent collision strategy. Recommended: set a boolean custom property `collides: true` on blocking tiles in Tiled, then use `layer.setCollisionByProperty({ collides: true })` in Phaser.
- Use Tiled's "object layer" for complex collision shapes (polygon colliders for irregular buildings/landmarks) rather than trying to make tile collision work for non-rectangular shapes.
- Keep the collision layer as a separate, invisible tilemap layer dedicated solely to collision. Do NOT mix visual tiles and collision tiles on the same layer.
- Set collision BEFORE calling `this.physics.add.collider(player, layer)`.
- Test collision visually: use `layer.renderDebug(this.add.graphics())` during development to see collision boundaries overlaid on the map.
- For the Bengaluru landmarks (irregular shapes like Chinnaswamy Stadium), use object-based collision polygons rather than axis-aligned tile collision.

**Warning signs:**
- Player clips through certain tiles but not others
- Player gets stuck on invisible geometry in open areas
- Collision works on one map edge but not the opposite
- Jittery sprite behavior near tile boundaries

**Phase to address:**
Map implementation phase (Phase 2 / Content). Must be standardized before multiple maps are created or the inconsistency compounds across every zone.

---

### Pitfall 8: Audio Broken on iOS / Capacitor Without User Interaction

**What goes wrong:**
Game audio (ambient Bengaluru city sounds, metro announcements, NPC dialogue sounds) plays fine on desktop and Android but is completely silent on iOS. No error is thrown -- audio simply does not play. This is a showstopper for the ambient sound design that is core to the Bengaluru feel.

**Why it happens:**
iOS enforces a strict policy: no audio can play until the user has interacted with the page (tap, click). The WebAudio API's AudioContext starts in a "suspended" state on iOS and must be resumed via a user gesture handler. This policy applies even inside Capacitor's WKWebView. Even after initial interaction, iOS can re-suspend audio if the app goes to background and returns. The `mediaTypesRequiringUserActionForPlayback` WKWebView configuration can help but has broken across iOS versions (worked in iOS 16.0, broke in iOS 16.3.1).

**How to avoid:**
- Implement a mandatory "tap to start" screen before any game audio. This is the only reliable cross-version solution. Do NOT try to auto-play audio.
- After the initial tap, call `AudioContext.resume()` explicitly.
- Listen for Capacitor `appStateChange` and re-resume the AudioContext when the app returns to foreground.
- Use Phaser's built-in audio unlock mechanism (`sound.unlock`) but verify it actually works on your target iOS versions.
- Test audio on real iOS devices across at least 2 iOS versions. Simulator audio behavior differs from real devices.
- For ambient sound: start the audio system on the title screen tap, then crossfade ambient sounds as the player enters different zones.

**Warning signs:**
- Audio works on desktop/Android but is silent on iOS
- Audio works on first launch but not after backgrounding
- No console errors despite no audio output
- Audio works in Safari but not in the Capacitor WebView (or vice versa)

**Phase to address:**
Audio implementation phase (Phase 2 for basic audio, Phase 3 / Mobile for iOS-specific fixes). The "tap to start" pattern should be designed into the UI from the beginning.

---

### Pitfall 9: App Store Rejection for "Minimal Functionality" WebView Wrapper

**What goes wrong:**
Apple rejects the Capacitor-wrapped game under Guideline 4.2 ("Minimum Functionality"), claiming it is merely a website in a native wrapper and does not provide sufficient native integration to justify being an app. This can happen even for a fully functional game.

**Why it happens:**
Apple has tightened WebView app reviews significantly in 2025. A Phaser game running inside Capacitor's WKWebView technically IS a web page in a native shell. If the app does not demonstrate "app-like" behavior -- offline functionality, native UI integration, device feature usage, proper app lifecycle management -- Apple's reviewers may flag it. Games get more leeway than utility apps, but the risk is real, especially for a first submission from a new developer account.

**How to avoid:**
- Implement genuine offline functionality: the game must work without an internet connection. Bundle all assets in the app binary, not loaded from a remote server.
- Add native integration via Capacitor plugins: haptic feedback on interactions, native splash screen, proper status bar handling, local notifications (optional), and native share functionality.
- Implement proper app lifecycle: handle background/foreground transitions, save state on app suspend, restore on resume.
- Use a native-feeling launch flow: splash screen -> loading -> game, not a blank WebView that loads.
- Include App Store metadata that emphasizes the game aspects, not the web technology.
- Pre-submission: test with TestFlight and have someone outside the team verify the "app-like" feel.

**Warning signs:**
- App loads with a visible blank white screen before content appears
- No functionality works without internet
- No native UI elements visible anywhere (no native navigation, alerts, or controls)
- App metadata describes it as a "web-based" experience

**Phase to address:**
Mobile packaging phase (Phase 3 / Mobile). Must be fully addressed before App Store submission. Plan for at least one rejection-and-resubmit cycle in the timeline.

---

### Pitfall 10: Save Data Loss in Capacitor / Mobile Browsers

**What goes wrong:**
Player progress (quest state, inventory, explored areas) is lost when the app is force-closed, the device runs low on storage, or the user clears browser data. On iOS, WKWebView localStorage can be purged by the OS under memory pressure without warning.

**Why it happens:**
localStorage in a WKWebView is not as persistent as native app storage. iOS can clear WebView data independently of the app. Private browsing mode clears all localStorage on session end. The 5MB localStorage limit can be hit by large save files (full map exploration state + inventory + quest progress). Additionally, storing objects without JSON serialization silently fails -- `localStorage.setItem('data', playerObject)` stores `"[object Object]"` instead of the actual data.

**How to avoid:**
- Use Capacitor's Preferences API (`@capacitor/preferences`) instead of raw localStorage. It stores data in native storage (UserDefaults on iOS, SharedPreferences on Android) which is far more persistent.
- Always use `JSON.stringify()` when saving and `JSON.parse()` when loading. Wrap in try-catch for corrupted data.
- Implement save versioning: include a version number in saved data so future game updates can migrate old save formats.
- Auto-save on scene transitions, quest completion, and inventory changes -- not just on explicit "save" actions.
- Keep save data compact: store tile coordinates and state flags, not full tilemap data. Target < 100KB per save.
- Implement a "save health check" on game load: verify save data integrity before restoring state, fall back to new game gracefully if corrupted.

**Warning signs:**
- Players report lost progress after closing and reopening the app
- Save data works on desktop but not on mobile
- `localStorage.getItem()` returns `null` unexpectedly
- Save file size growing beyond 1MB

**Phase to address:**
Foundation phase (Phase 1) for the save system architecture. Must use native storage from the start -- migrating from localStorage to Capacitor Preferences later requires a data migration strategy.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded tile IDs for collision | Quick collision setup | Every tileset change breaks collision; impossible to maintain across zones | Never -- use named properties from day one |
| Single monolithic scene for the whole map | Simpler architecture, no scene transition bugs | Cannot scale to multiple neighborhoods; memory grows unbounded | Only for the initial 5-minute prototype / proof of concept |
| Raw localStorage for saves | Zero dependencies, instant implementation | Data loss on iOS, no migration path, 5MB limit | Only during early desktop-only development; replace before mobile |
| Inline asset paths (hardcoded strings) | Faster initial development | Asset reorganization requires find-and-replace across entire codebase | Never -- use a manifest/constants file from day one |
| Skipping tile extrusion | Fewer build steps, simpler pipeline | Bleeding artifacts appear on every device differently; debugging is painful | Never -- extrude from the first tileset |
| Loading all zone assets upfront | No loading screens between zones | 30+ second initial load, high memory baseline, mobile crashes | Only when the game has a single small zone (< 500 tiles) |
| Using Phaser's global registry for all game state | Easy access from any scene | Namespace collisions, hard to track mutations, impossible to serialize for saves | Only for truly global state (settings, audio volume); use a proper state manager for game data |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Tiled -> Phaser | Exporting as CSV instead of JSON; losing custom properties | Always export as JSON. Use Tiled's custom properties for collision, NPC spawn points, and zone transitions. Verify the JSON includes all object layers. |
| Tiled -> Phaser | Tileset image path mismatch after extrusion | Use relative paths in Tiled. After extruding, update the tileset source path in the .json file or re-link in Tiled. Automate this in the build pipeline. |
| Phaser -> Capacitor | Assuming `file://` protocol works the same as `http://` | Capacitor serves files via its own protocol (`capacitor://` on iOS). Relative asset paths work; absolute paths starting with `/` may not. Test asset loading on device early. |
| Capacitor -> iOS | Not configuring WKWebView for audio/media | Set `allowsInlineMediaPlayback`, configure `mediaTypesRequiringUserActionForPlayback` in `capacitor.config.ts`. Still require user gesture for first audio. |
| Playwright -> Phaser | Trying to query game objects via DOM selectors | Phaser renders to a single `<canvas>` element. There are no DOM nodes for game objects. Use screenshot comparison, coordinate-based clicks on the canvas, or expose game state via `window.__gameState` for test assertions. |
| Playwright -> Phaser | Flaky tests due to animation/timing | Use Playwright's Clock API to control game time. Advance frames deterministically rather than waiting for real time. Pause animations during state assertions. |
| AI generators -> Tilesets | Generating tiles individually without context | Generate tiles in groups/sheets showing adjacency. Include "context tiles" in the prompt showing neighboring tiles for edge consistency. Post-process with palette enforcement. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Too many tilemap layers | FPS drops linearly with layer count; fine on desktop, stutters on mobile | Max 3-4 visible layers; use object layers for decorations | > 5 layers on any mobile device |
| Unbounded NPC sprite count | Smooth in small areas, stutters in market/crowded scenes | Object pool NPCs; only activate sprites within camera view + margin | > 50 active sprites on screen simultaneously |
| Large tilemap without chunking | Initial load is slow; camera movement causes full-map iteration | Split world into zone chunks (32x32 tile sections); load surrounding chunks only | Maps larger than 100x100 tiles on mobile |
| Uncompressed audio files | 30+ second load times; 50MB+ app size | Use OGG Vorbis (web) / AAC (iOS fallback). Compress ambient loops to 96kbps. | Total audio assets > 10MB uncompressed |
| Creating new objects every frame in update() | GC pauses cause frame stutters every few seconds | Object pooling for particles, projectiles, floating text. Pre-allocate in create(). | Any use of `new` in the update loop on mobile |
| Rendering debug graphics in production | 10-20% FPS overhead from collision debug visualization | Use build flags / environment variables to strip debug rendering. Never ship with `renderDebug()` active. | Always -- debug rendering is expensive even when nothing is drawn |
| Phaser event emitter overuse | Memory growth, duplicate handlers, cascading event chains | Use direct method calls for same-scene communication. Events only for cross-scene messaging. | > 100 active event listeners |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing game state on `window` for Playwright tests in production | Players can manipulate quest completion, inventory, unlocked areas via browser console | Use a build flag to only attach `window.__gameState` in test/development builds. Strip in production with dead code elimination. |
| Storing unlockable content conditions client-side only | Trivial to bypass progression; spoil all content by editing localStorage | For a single-player offline game this is an acceptable tradeoff. If future multiplayer/leaderboards are added, move validation server-side. |
| Loading remote assets or scripts at runtime | Supply chain attack vector; allows injecting malicious code into the game | Bundle ALL assets in the app binary. No CDN loading, no remote script execution. This also satisfies App Store offline requirements. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual indication of interactable objects/NPCs | Players walk past landmarks and NPCs without knowing they can interact | Show a subtle interaction indicator (icon, glow, or exclamation mark) when player is within interaction range. Use a dedicated "interactable" object layer in Tiled. |
| Tile-grid-locked movement without smoothing | Movement feels robotic and un-GBA-like; real GBA Pokemon games use smooth pixel-by-pixel movement with grid alignment only at rest | Implement smooth pixel movement with grid snapping at destination. Player visually glides between tiles rather than teleporting. |
| Metro fast-travel without loading context | Players get disoriented after teleporting to a new zone; "where am I?" | Show a brief metro ride transition (even just a few seconds of screen wipe + station name) to give spatial context. Real Namma Metro station announcements as audio. |
| Inaccessible quest log / inventory on mobile | Players forget what they're doing after putting the phone down | Persistent accessible UI button for quest log. Show active quest hint on screen. Auto-save means they can always resume context. |
| Tiny touch targets for NPC interaction on mobile | Players tap repeatedly trying to talk to an NPC; frustrating on small screens | Increase interaction hitbox to 1.5x-2x the visual sprite size on mobile. Use Phaser's input priority system to prevent mis-taps on overlapping NPCs. |
| No audio feedback for interactions | Game feels silent and lifeless despite ambient sound design | Add subtle SFX for: menu open/close, item pickup, NPC dialogue advance, quest complete. Even simple 8-bit-style beeps add enormous feel. |

## "Looks Done But Isn't" Checklist

- [ ] **Tilemap rendering:** Looks correct at default zoom -- verify at 2x, 3x zoom AND on a Retina display. Check for bleeding at all zoom levels.
- [ ] **NPC interaction:** Works when walking up to NPC -- verify it works from all 4 directions, not just the one tested. Verify interaction range is consistent.
- [ ] **Collision boundaries:** Player can't walk through buildings -- verify collision at every edge and corner of every building, especially diagonal approaches. Tile corners are notorious weak spots.
- [ ] **Scene transitions:** Zone transition works once -- verify it works when going back and forth 10 times. Check memory after each transition. Verify no duplicate event listeners accumulate.
- [ ] **Audio:** Sounds play on desktop -- verify on iOS Safari, Android Chrome, AND inside Capacitor WebView on both platforms. Verify after app background/foreground cycle.
- [ ] **Save/load:** Save and load works in a single session -- verify after app force-close, device restart, and after the app has been in background for 24 hours.
- [ ] **Quest state:** Quest completion works -- verify quest state persists across save/load. Verify partially-completed quests resume correctly. Verify quest items remain in inventory after zone transition.
- [ ] **Pixel scaling:** Looks crisp on dev machine -- verify on at least 3 different screen sizes/DPIs. Check that ALL sprites (player, NPCs, UI) scale consistently, not just tiles.
- [ ] **Touch controls:** D-pad works -- verify it handles diagonal input, rapid direction changes, and simultaneous movement + interaction attempts. Verify it doesn't drift or stick.
- [ ] **App Store build:** Capacitor build succeeds -- verify the built IPA/APK actually runs on a device (not just builds). Verify asset paths resolve correctly in the packaged app.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Tileset bleeding | LOW | Run tile-extruder on all tilesets; update margin/spacing in Phaser loader calls. Can be done without re-authoring maps. |
| Pixel scaling wrong | MEDIUM | Change game config resolution and scale mode. May require re-positioning UI elements and adjusting camera bounds. |
| Too many tilemap layers | MEDIUM | Flatten layers in Tiled (merge compatible layers). Requires re-exporting all maps but no gameplay logic changes. |
| Memory leaks from scenes | HIGH | Requires architectural refactor of scene lifecycle. Must audit every scene for resource cleanup, add shutdown handlers, potentially restructure how zones are loaded. |
| AI tileset inconsistency | HIGH | Manual pixel-by-pixel cleanup of every generated tile. Potentially regenerate entire tilesets with stricter pipeline. Cannot be automated retroactively. |
| Collision layer mismatch | MEDIUM | Re-author collision data in Tiled with consistent property naming. Tedious but mechanical; scales linearly with map count. |
| iOS audio broken | LOW | Add "tap to start" screen and AudioContext.resume() call. Small code change but requires testing across iOS versions. |
| App Store rejection | MEDIUM | Add native Capacitor plugins, offline support, proper lifecycle handling. Takes 1-2 weeks. Budget one rejection cycle in timeline. |
| Save data loss on mobile | HIGH | Migrate from localStorage to Capacitor Preferences. Requires data migration strategy for existing players. Harder to fix retroactively than to do right from the start. |
| Playwright tests flaky | MEDIUM | Switch from timing-based to deterministic frame-advance testing. Requires refactoring test architecture but not game code. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Tileset bleeding | Phase 1 (Foundation) -- Asset pipeline setup | Visual inspection at multiple zoom levels on 3+ devices |
| Pixel scaling | Phase 1 (Foundation) -- Renderer configuration | Screenshot comparison across device matrix (phone, tablet, desktop, Retina) |
| Layer count performance | Phase 2 (Content) -- Map design standards | FPS profiling on lowest-target mobile device; enforce 3-4 layer max in map review |
| iOS WebGL context loss | Phase 3 (Mobile) -- Capacitor integration | Automated test: background app for 30s, resume, verify rendering intact |
| AI tileset consistency | Phase 1 (Foundation) for pipeline; Phase 2 (Content) for execution | Tile validation checklist per asset: grid alignment, palette check, seam test |
| Scene memory leaks | Phase 1 (Foundation) -- Scene architecture | Memory profiling after 20 scene transitions; no upward trend allowed |
| Collision management | Phase 2 (Content) -- Map implementation standard | Debug overlay verification for every map; automated collision boundary test |
| iOS audio | Phase 2 (Content) for audio system; Phase 3 (Mobile) for iOS fixes | Manual test on 2+ iOS versions; automated Capacitor test for audio after background |
| App Store rejection | Phase 3 (Mobile) -- Pre-submission checklist | TestFlight external review; offline-mode test; native feature audit |
| Save data persistence | Phase 1 (Foundation) -- Save system architecture | Automated test: save, force-close app, relaunch, verify data intact |

## Sources

- [Phaser tilemap performance and layer count impact (GitHub #839)](https://github.com/photonstorm/phaser/issues/839)
- [Phaser 3.70 DynamicTexture memory leak (GitHub #6669)](https://github.com/phaserjs/phaser/issues/6669)
- [Phaser memory leak across scene transitions (GitHub #5456)](https://github.com/photonstorm/phaser/issues/5456)
- [Phaser tilemap collision bugs with Arcade physics (GitHub #4732)](https://github.com/phaserjs/phaser/issues/4732)
- [tile-extruder tool for tileset bleeding (sporadic-labs)](https://github.com/sporadic-labs/tile-extruder)
- [Phaser forum: tileset bleeding discussion](https://phaser.discourse.group/t/issue-with-tileset-bleeding/3911)
- [Phaser forum: iOS performance issues](https://phaser.discourse.group/t/ios-performance-issue/870)
- [Phaser forum: Safari WebGL performance](https://phaser.discourse.group/t/performance-issues-with-safari/1958)
- [Managing big maps in Phaser 3 (Dynetis Games)](https://www.dynetisgames.com/2018/02/24/manage-big-maps-phaser-3/)
- [Phaser 3 optimization in 2025 (phaser.io news)](https://phaser.io/news/2025/03/how-i-optimized-my-phaser-3-action-game-in-2025)
- [Integer scaling for pixel art (tanalin.com)](https://tanalin.com/en/articles/integer-scaling/)
- [Pixel art scaling without destroying it (colececil.dev)](https://colececil.dev/blog/2017/scaling-pixel-art-without-destroying-it/)
- [Modular Game Worlds in Phaser 3 -- Tilemaps (Michael Hadley)](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6)
- [Capacitor games guide (capacitorjs.com)](https://capacitorjs.com/docs/guides/games)
- [Phaser + Capacitor mobile deployment tutorial (phaser.io)](https://phaser.io/tutorials/bring-your-phaser-game-to-ios-and-android-with-capacitor)
- [iOS WKWebView WebGL context loss (Apple Developer Forums)](https://developer.apple.com/forums/thread/737042)
- [iOS WKWebView audio autoplay restrictions (Apple Developer Forums)](https://developer.apple.com/forums/thread/728463)
- [Automating Canvas testing with Playwright (BioCatch)](https://medium.com/@BioCatchTechBlog/automating-canvas-testing-with-playwright-and-object-detection-models-8d58235b17b7)
- [Canvas testing with CanvasGrid and Playwright (dev.to)](https://dev.to/fonzi/testing-html5-canvas-with-canvasgrid-and-playwright-5h4c)
- [AI Pixel Art consistency problems (QWE Academy)](https://www.qwe.edu.pl/tutorial/create-pixel-art-with-ai-tools/)
- [App Store review guidelines and Capacitor rejection patterns (nextnative.dev)](https://nextnative.dev/blog/app-store-review-guidelines)
- [Phaser state management pitfalls (Medium)](https://medium.com/@renatocassino/stop-struggling-with-state-in-phaser-js-how-phaser-hooks-will-revolutionize-your-code-7c68f972ce5a)
- [Phaser Renderer blurriness on high-DPI (GitHub #3198)](https://github.com/phaserjs/phaser/issues/3198)

---
*Pitfalls research for: GBA-style Bengaluru exploration game (Phaser JS + Tiled + Capacitor + AI assets + Playwright)*
*Researched: 2026-03-19*
