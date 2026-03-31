---
status: resolved
trigger: "Audio does not work anywhere in the game — no title music, no world audio, no SFX. No console errors."
created: 2026-03-31T00:00:00Z
updated: 2026-03-31T00:00:00Z
---

## Current Focus

hypothesis: RESOLVED — All audio issues confirmed fixed by user.
test: Human verification passed.
expecting: N/A
next_action: Archive session

## Symptoms

expected: Audio should play throughout the game — title music on title screen, ambient audio in world, SFX for interactions, footsteps, etc.
actual: Title screen audio does NOT play. Audio works after title screen (in world scenes). User also wants a visible mute button (HTML overlay, not Phaser) absolutely positioned in a corner.
errors: No console errors visible — audio silently fails to play.
reproduction: Launch the game — no audio plays on title screen. Navigate to world scene — audio plays there.
started: Audio was added in the latest phase (Phase 04 - audio and polish). Title music has never worked.

## Eliminated

- hypothesis: Key mismatch between BootScene asset loading and AudioManager sound.add() calls
  evidence: Constants ASSETS.AUDIO_* keys match audio-config.json entry.key values exactly (e.g., 'bgm-title' in both)
  timestamp: 2026-03-31

- hypothesis: Audio code bug (AudioManager not initialized, events not wired, sound.play not called)
  evidence: Code flow is correct — TitleScene creates AudioManager on first boot, calls startTitleMusic(), WorldScene retrieves from registry. No code bugs found.
  timestamp: 2026-03-31

- hypothesis: Chrome autoplay policy blocking audio (simple version)
  evidence: TitleScene already handles sound.locked with deferred play. But the handling has a race condition (see root cause below).
  timestamp: 2026-03-31

- hypothesis: Silent placeholder audio files
  evidence: Fixed in previous session — real audible audio files now exist. Audio works in WorldScene, confirming files are good.
  timestamp: 2026-03-31

## Evidence

- timestamp: 2026-03-31
  checked: UIScene.ts keyboard handlers (lines 202-228) — what happens when arrow keys pressed with pause menu open
  found: Left/Right keys call pauseMenu.navigateTab() (switches between tabs). Up/Down keys ONLY handle dialogBox.moveChoiceCursor() when dialogue is active. When pause menu is open and Settings tab is active, up/down/left/right do NOT call settingsPanel.navigate() or settingsPanel.adjustValue(). These methods exist on SettingsPanel but are never invoked by any code path.
  implication: Keyboard input for settings sliders was designed (methods exist) but never wired to the input system.

- timestamp: 2026-03-31
  checked: SettingsPanel.ts — pointer interactivity on slider elements
  found: Sliders are drawn via scene.add.graphics() (sliderGraphics). Graphics object has NO setInteractive() call. Labels (Text objects) also have no setInteractive(). There are no pointerdown/pointermove handlers. The slider is purely visual rendering with no input handling.
  implication: Mouse/touch interaction was never implemented for the sliders. They appear but cannot be clicked or dragged.

- timestamp: 2026-03-31
  checked: PauseMenu.ts — does it expose which tab is active?
  found: PauseMenu has activeTabIndex (private) and TAB_LABELS (static readonly). Settings is index 4. There is no public method to query the active tab index, only switchTab() and navigateTab(). The isMenuOpen() method is public.
  implication: UIScene needs to know when Settings tab is active to route up/down to settingsPanel. PauseMenu needs a getActiveTabIndex() accessor.

- timestamp: 2026-03-31
  checked: File sizes of all audio assets in public/assets/audio/
  found: All BGM files are exactly 15,846 bytes. All SFX files are exactly 1,668 bytes. All ambient files are exactly 15,846 bytes. Identical sizes within each category.
  implication: Files are likely generated from a template, not real audio recordings.

- timestamp: 2026-03-31
  checked: Binary content of title-theme.mp3 and footstep.mp3 via xxd
  found: Files contain valid MPEG frame headers (0xfffb9000) but ALL audio data is zero-filled. The frames are structurally valid MP3 but encode pure silence.
  implication: Browser decodes these without error but produces zero-amplitude audio — explains "no errors, no sound."

- timestamp: 2026-03-31
  checked: scripts/generate-placeholder-audio.cjs
  found: Script explicitly generates "silence" — creates MPEG frames with zero audio data. Comment says "Generate placeholder MP3 files (silence)." BGM = 38 frames (~1s silence), SFX = 4 frames (~0.1s silence).
  implication: These files were always intended as temporary placeholders. Real audio was never generated to replace them.

- timestamp: 2026-03-31
  checked: git log --oneline --all -- 'public/assets/audio/'
  found: Only one commit (1a1249e) ever touched audio assets — the initial placeholder generation. No subsequent commit replaced them with real audio.
  implication: The placeholder-to-real-audio replacement step was never executed.

- timestamp: 2026-03-31
  checked: Human verification of audio after placeholder replacement
  found: Audio does NOT play on title screen. Audio DOES play in world scenes (after title screen). Title screen audio is specifically broken.
  implication: Audio files are now valid and audible. The issue is code-specific to TitleScene audio initialization.

- timestamp: 2026-03-31
  checked: TitleScene.create() lines 67-73 — Chrome autoplay handling with sound.locked and 'unlocked' event
  found: Race condition. AudioContext.resume() is a Promise — the 'unlocked' event fires asynchronously AFTER the Promise resolves. But the user's first click (which unlocks audio) ALSO triggers pointerdown on a menu item, which synchronously calls stopTitleMusic() and scene.start(). By the time 'unlocked' fires and startTitleMusic() runs, the scene is already transitioning away.
  implication: Title music start is called too late — after the scene is already leaving. World audio works because by the time WorldScene.create() runs, AudioContext is already unlocked.

- timestamp: 2026-03-31
  checked: Fix implementation — TitleScene unlock gate + MuteButton HTML overlay
  found: (1) TitleScene now gates menu behind "Click anywhere to begin" prompt when sound.locked is true. First click unlocks AudioContext, 'unlocked' event fires and starts title music, then menu is revealed. Second click navigates. (2) MuteButton created as HTML button overlaid in top-right corner of game container, using Phaser's SoundManager.mute for global toggle. Build passes (0 TS errors, Vite builds), all 171 unit tests pass.
  implication: Fix correctly decouples the audio unlock interaction from the menu navigation interaction, ensuring title music starts before the user can navigate away.

## Resolution

root_cause: |
  Two issues:
  1. (Original) Race condition between Chrome AudioContext unlock and scene transition on TitleScene.
  2. (Follow-up) Settings panel sliders non-interactive. SettingsPanel had navigate() and adjustValue() methods but UIScene keyboard handlers never called them — Left/Right always switched tabs, Up/Down only handled dialogue choices. Additionally, slider Graphics had no setInteractive() or pointer event handlers, making them unclickable.
fix: |
  1. TitleScene unlock gate: Decoupled audio unlock from menu navigation (previous fix).
  2. HTML mute button: MuteButton class as HTML overlay (previous fix).
  3. UIScene keyboard routing: Up/Down now route to settingsPanel.navigate() when Settings tab (index 4) is active. Left/Right route to settingsPanel.adjustValue() on Settings tab and inventoryPanel.navigate() on Inventory tab (index 1). Added Q/E as dedicated tab-switch shoulder buttons that always work.
  4. SettingsPanel pointer interactivity: Added invisible Zone hit areas over each slider track and the run toggle. Pointer down sets slider value from click position. Drag support via scene-level pointermove/pointerup events. Toggle responds to click.
  5. PauseMenu accessor: Added getActiveTabIndex() public method so UIScene can query which tab is active.
verification: TypeScript type-check: 0 errors. Vite production build: success. Unit tests: 171 passed, 0 failed. Human verified: all audio works (title music, mute button, settings sliders with keyboard and pointer, volume changes applied correctly).
files_changed:
  - src/scenes/TitleScene.ts
  - src/ui/MuteButton.ts
  - src/main.ts
  - src/scenes/UIScene.ts
  - src/ui/SettingsPanel.ts
  - src/ui/PauseMenu.ts
