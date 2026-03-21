import Phaser from 'phaser';
import { TouchControls } from '../ui/TouchControls';
import { DialogBox } from '../ui/DialogBox';
import { ZoneBanner } from '../ui/ZoneBanner';
import { PauseMenu } from '../ui/PauseMenu';
import { QuestHUD } from '../ui/QuestHUD';
import { ItemNotification } from '../ui/ItemNotification';
import { MetroMap } from '../ui/MetroMap';
import { InventoryPanel } from '../ui/InventoryPanel';
import { QuestPanel } from '../ui/QuestPanel';
import { JournalPanel } from '../ui/JournalPanel';
import { SavePanel } from '../ui/SavePanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { eventsCenter } from '../utils/EventsCenter';
import { SCENES, EVENTS, ASSETS } from '../utils/constants';
import type { DialogueData, InventoryItem } from '../utils/types';
import type { QuestManager } from '../systems/QuestManager';
import type { InventoryManager } from '../systems/InventoryManager';
import type { JournalManager } from '../systems/JournalManager';
import type { SaveManager } from '../systems/SaveManager';
import questData from '../data/quests/best-filter-coffee.json';

/**
 * UIScene: Parallel overlay scene for touch controls, dialogue box, zone banner,
 * and Phase 3 UI components (pause menu, quest HUD, item notification, metro map).
 *
 * UI elements position relative to the actual game dimensions, which dynamically
 * match the viewport aspect ratio (set by BootScene). No cropping, no hardcoded sizes.
 */
export class UIScene extends Phaser.Scene {
  private touchControls!: TouchControls;
  private dialogBox!: DialogBox;
  private zoneBanner!: ZoneBanner;

  // Phase 3 UI components
  private pauseMenu!: PauseMenu;
  private questHUD!: QuestHUD;
  private itemNotification!: ItemNotification;
  private metroMap!: MetroMap;
  private saveIconSprite!: Phaser.GameObjects.Sprite;

  // Tab panel references (for data refresh)
  private inventoryPanel!: InventoryPanel;
  private questPanel!: QuestPanel;
  private journalPanel!: JournalPanel;
  private savePanel!: SavePanel;

  constructor() {
    super({ key: SCENES.UI });
  }

  create(): void {
    this.touchControls = new TouchControls(this);

    this.input.keyboard?.on('keydown-T', () => {
      this.touchControls.toggle();
    });

    this.dialogBox = new DialogBox(this);
    this.zoneBanner = new ZoneBanner(this);

    // Phase 3 UI components
    this.pauseMenu = new PauseMenu(this);
    this.questHUD = new QuestHUD(this);
    this.itemNotification = new ItemNotification(this);
    this.metroMap = new MetroMap(this);

    // Create tab panels and wire them to the pause menu
    const pb = this.pauseMenu.getPanelBounds();
    this.questPanel = new QuestPanel(this, pb.x, pb.y, pb.width, pb.height);
    this.inventoryPanel = new InventoryPanel(this, pb.x, pb.y, pb.width, pb.height);
    this.journalPanel = new JournalPanel(this, pb.x, pb.y, pb.width, pb.height);
    this.savePanel = new SavePanel(this, pb.x, pb.y, pb.width, pb.height);
    const settingsPanel = new SettingsPanel(this, pb.x, pb.y, pb.width, pb.height);
    this.pauseMenu.setPanels(this.questPanel, this.inventoryPanel, this.journalPanel, this.savePanel, settingsPanel);

    // Wire save button — delegates to WorldScene which has Grid Engine access
    // for the player's current position. WorldScene emits GAME_SAVED on success.
    this.savePanel.onSave = () => {
      eventsCenter.emit(EVENTS.SAVE_GAME);
    };
    eventsCenter.on(EVENTS.GAME_SAVED, ({ timestamp }: { timestamp: number }) => {
      this.savePanel.showFeedback(true);
      this.savePanel.update(timestamp);
    });

    // Save icon sprite (bottom-right corner, hidden until save event)
    this.saveIconSprite = this.add.sprite(0, 0, ASSETS.SPRITE_SAVE_ICON);
    this.saveIconSprite.setDepth(55);
    this.saveIconSprite.setScrollFactor(0);
    this.saveIconSprite.setVisible(false);

    // Position UI to current game dimensions
    this.repositionUI();

    // Reposition on viewport resize
    this.scale.on('resize', () => this.repositionUI());

    // === Event listeners ===

    eventsCenter.on(EVENTS.NPC_INTERACT, (dialogueData: DialogueData) => {
      this.dialogBox.show(dialogueData);
    });

    eventsCenter.on(EVENTS.SIGN_INTERACT, (dialogueData: DialogueData) => {
      this.dialogBox.show(dialogueData);
    });

    eventsCenter.on(EVENTS.ZONE_ENTER, (zoneName: string) => {
      this.zoneBanner.show(zoneName);
    });

    eventsCenter.on(EVENTS.TOUCH_ACTION, () => {
      if (this.dialogBox.isActive()) {
        this.dialogBox.advance();
      }
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.dialogBox.isActive()) {
        this.dialogBox.advance();
      }
    });
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.dialogBox.isActive()) {
        this.dialogBox.advance();
      }
    });

    // --- Phase 3: Pause menu, quest HUD, item notification, metro map ---

    // Pause menu open/close
    eventsCenter.on(EVENTS.PAUSE_MENU_OPEN, () => {
      if (!this.pauseMenu.isMenuOpen() && !this.dialogBox.isActive() && !this.metroMap.isMapOpen()) {
        this.refreshPanelData();
        this.pauseMenu.open();
      }
    });
    eventsCenter.on(EVENTS.PAUSE_MENU_CLOSE, () => {
      this.pauseMenu.close();
    });

    // Quest progress updates
    eventsCenter.on(EVENTS.QUEST_ACCEPTED, ({ questId }: { questId: string }) => {
      const qm = this.registry.get('questManager') as QuestManager | undefined;
      const progress = qm?.getProgress(questId);
      if (progress) this.questHUD.update(progress.completed, progress.total);
    });
    eventsCenter.on(EVENTS.QUEST_OBJECTIVE_COMPLETE, ({ questId }: { questId: string }) => {
      const qm = this.registry.get('questManager') as QuestManager | undefined;
      const progress = qm?.getProgress(questId);
      if (progress) this.questHUD.update(progress.completed, progress.total);
    });
    eventsCenter.on(EVENTS.QUEST_COMPLETE, () => {
      this.questHUD.hide();
      this.zoneBanner.show('Quest Complete!');
    });

    // Item collected notification
    eventsCenter.on(EVENTS.ITEM_COLLECTED, ({ item }: { item: { name: string } }) => {
      this.itemNotification.show(item.name);
    });

    // Metro map open
    eventsCenter.on(EVENTS.METRO_MAP_OPEN, () => {
      if (!this.metroMap.isMapOpen() && !this.pauseMenu.isMenuOpen()) {
        this.metroMap.open();
      }
    });

    // Save icon flash
    eventsCenter.on(EVENTS.SAVE_ICON_SHOW, () => {
      this.flashSaveIcon();
    });

    // === Keyboard input for Phase 3 UI ===

    // Escape key: close overlays or open pause menu
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.metroMap.isMapOpen()) {
        this.metroMap.close();
      } else if (this.pauseMenu.isMenuOpen()) {
        this.pauseMenu.close();
      } else if (!this.dialogBox.isActive()) {
        eventsCenter.emit(EVENTS.PAUSE_MENU_OPEN);
      }
    });

    // Left/Right: navigate pause menu tabs or metro map stations
    this.input.keyboard?.on('keydown-LEFT', () => {
      if (this.pauseMenu.isMenuOpen()) {
        this.pauseMenu.navigateTab('left');
      } else if (this.metroMap.isMapOpen()) {
        this.metroMap.navigateStation('left');
      }
    });
    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (this.pauseMenu.isMenuOpen()) {
        this.pauseMenu.navigateTab('right');
      } else if (this.metroMap.isMapOpen()) {
        this.metroMap.navigateStation('right');
      }
    });

    // Up/Down: dialogue choice cursor or panel navigation
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.dialogBox.isActive() && this.dialogBox.isChoiceActive()) {
        this.dialogBox.moveChoiceCursor('up');
      }
    });
    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.dialogBox.isActive() && this.dialogBox.isChoiceActive()) {
        this.dialogBox.moveChoiceCursor('down');
      }
    });
  }

  /**
   * Flash the save icon briefly in the bottom-right corner.
   */
  private flashSaveIcon(): void {
    const { width, height } = this.scale.gameSize;
    this.saveIconSprite.setPosition(width - 20, height - 20);
    this.saveIconSprite.setVisible(true);
    this.saveIconSprite.setAlpha(0);
    this.tweens.add({
      targets: this.saveIconSprite,
      alpha: 1,
      duration: 200,
      hold: 1500,
      yoyo: true,
      onComplete: () => this.saveIconSprite.setVisible(false),
    });
  }

  /** Refresh all panel data from registry managers before showing the pause menu. */
  private refreshPanelData(): void {
    // Inventory
    const im = this.registry.get('inventoryManager') as InventoryManager | undefined;
    if (im) this.inventoryPanel.update([...im.getItems()] as InventoryItem[]);

    // Quests
    const qm = this.registry.get('questManager') as QuestManager | undefined;
    if (qm) {
      const activeId = qm.getActiveQuestId();
      const state = activeId ? qm.getQuestState(activeId) ?? null : null;
      this.questPanel.update(state, questData.name);
    }

    // Journal
    const jm = this.registry.get('journalManager') as JournalManager | undefined;
    const npcsMetIds = this.registry.get('npcsMetIds') as Set<string> | undefined;
    if (jm) {
      const npcIds = [...(npcsMetIds ?? [])];
      const itemIds = im ? im.getItems().map(i => i.id) : [];
      this.journalPanel.update({
        completion: jm.getCompletionPercentage([], npcIds, itemIds),
        places: jm.getPlacesDiscovered([]),
        npcs: jm.getNPCsMet(npcIds),
        items: jm.getItemsFound(itemIds),
      });
    }

    // Save
    const sm = this.registry.get('saveManager') as SaveManager | undefined;
    if (sm) {
      const existing = sm.load();
      this.savePanel.update(existing?.timestamp ?? null);
    }
  }

  private repositionUI(): void {
    const { width, height } = this.scale.gameSize;
    const bounds = { x: 0, y: 0, width, height };
    this.dialogBox.reposition(bounds);
    this.zoneBanner.reposition(bounds);
    this.touchControls.reposition(bounds);
    this.pauseMenu.reposition(bounds);
    this.questHUD.reposition(bounds);
    this.itemNotification.reposition(bounds);
    this.metroMap.reposition(bounds);
  }

  update(): void {
    this.touchControls.update();
  }

  shutdown(): void {
    this.dialogBox?.destroy();
    this.zoneBanner?.destroy();
    this.touchControls?.destroy();
    this.pauseMenu?.destroy();
    this.questHUD?.destroy();
    this.itemNotification?.destroy();
    this.metroMap?.destroy();
    this.saveIconSprite?.destroy();
    this.scale.off('resize');
    eventsCenter.off(EVENTS.NPC_INTERACT);
    eventsCenter.off(EVENTS.SIGN_INTERACT);
    eventsCenter.off(EVENTS.ZONE_ENTER);
    eventsCenter.off(EVENTS.PAUSE_MENU_OPEN);
    eventsCenter.off(EVENTS.PAUSE_MENU_CLOSE);
    eventsCenter.off(EVENTS.QUEST_ACCEPTED);
    eventsCenter.off(EVENTS.QUEST_OBJECTIVE_COMPLETE);
    eventsCenter.off(EVENTS.QUEST_COMPLETE);
    eventsCenter.off(EVENTS.ITEM_COLLECTED);
    eventsCenter.off(EVENTS.METRO_MAP_OPEN);
    eventsCenter.off(EVENTS.SAVE_ICON_SHOW);
  }
}
