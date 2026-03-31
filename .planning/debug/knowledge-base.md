# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## audio-not-playing — Title screen audio silent due to Chrome autoplay race condition; settings sliders non-interactive
- **Date:** 2026-03-31
- **Error patterns:** audio not playing, no sound, no console errors, silent, title music, AudioContext, autoplay, sliders non-interactive, settings panel, keyboard input not routed
- **Root cause:** (1) Race condition between Chrome AudioContext unlock and scene transition -- first click unlocked audio AND navigated away before title music could start. (2) SettingsPanel had navigate/adjustValue methods but UIScene keyboard handlers never called them, and slider Graphics had no setInteractive/pointer handlers.
- **Fix:** (1) TitleScene unlock gate decouples audio unlock from menu navigation. (2) UIScene routes keyboard to settingsPanel when Settings tab active. (3) SettingsPanel adds Zone hit areas with pointer handlers. (4) PauseMenu exposes getActiveTabIndex(). (5) HTML MuteButton overlay added.
- **Files changed:** src/scenes/TitleScene.ts, src/ui/MuteButton.ts, src/main.ts, src/scenes/UIScene.ts, src/ui/SettingsPanel.ts, src/ui/PauseMenu.ts
---
