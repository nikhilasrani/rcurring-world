import type { SignDef, InteriorDef, InteractionTarget, PickupDef, InteriorInteractable } from '../utils/types';

/**
 * InteractionSystem: Detects adjacent interactables when player presses action button.
 *
 * Checks the tile the player is facing for:
 * 1. NPCs (via Grid Engine getCharactersAt)
 * 2. Signs (from sign definitions array)
 * 3. Doors (from interior definitions array)
 * 4. Pickups (world item pickups, skip collected)
 * 5. Interior interactables (coffee counter, metro map wall, etc.)
 *
 * Priority: NPC > Sign > Door > Pickup > InteriorInteractable
 */
export class InteractionSystem {
  private signDefs: SignDef[] = [];
  private interiorDefs: InteriorDef[] = [];
  private pickupDefs: PickupDef[] = [];
  private collectedPickupIds: Set<string> = new Set();
  private interiorInteractables: InteriorInteractable[] = [];

  constructor(signDefs: SignDef[], interiorDefs: InteriorDef[]) {
    this.signDefs = signDefs;
    this.interiorDefs = interiorDefs;
  }

  /** Set available pickup definitions and which ones are already collected. */
  setPickupDefs(pickups: PickupDef[], collectedIds: string[]): void {
    this.pickupDefs = pickups;
    this.collectedPickupIds = new Set(collectedIds);
  }

  /** Set interior interactable definitions for the current interior. */
  setInteriorInteractables(interactables: InteriorInteractable[]): void {
    this.interiorInteractables = interactables;
  }

  /**
   * Check what interactable target is at the player's facing position.
   * Returns InteractionTarget or null if nothing interactable is there.
   */
  checkInteraction(gridEngine: any, playerCharId: string): InteractionTarget | null {
    const facingPos = gridEngine.getFacingPosition(playerCharId);

    // 1. Check for NPC characters at facing position
    const charsAtPos: string[] = gridEngine.getCharactersAt(facingPos, undefined);
    const npcId = charsAtPos.find((id: string) => id !== playerCharId);
    if (npcId) {
      return { type: 'npc', id: npcId, position: facingPos };
    }

    // 2. Check for signs at facing position
    const sign = this.signDefs.find(
      (s) => s.position.x === facingPos.x && s.position.y === facingPos.y
    );
    if (sign) {
      return { type: 'sign', id: sign.id, position: facingPos };
    }

    // 3. Check for doors (interior doorPositions) at facing position
    const interior = this.interiorDefs.find(
      (i) => i.doorPosition.x === facingPos.x && i.doorPosition.y === facingPos.y
    );
    if (interior) {
      return { type: 'door', id: interior.id, position: facingPos };
    }

    // 4. Check for pickups at facing position (skip collected)
    const pickup = this.pickupDefs.find(
      (p) =>
        p.position.x === facingPos.x &&
        p.position.y === facingPos.y &&
        !this.collectedPickupIds.has(p.id)
    );
    if (pickup) {
      return { type: 'pickup', id: pickup.id, position: facingPos };
    }

    // 5. Check for interior interactables at facing position
    const interactable = this.interiorInteractables.find(
      (ia) => ia.position.x === facingPos.x && ia.position.y === facingPos.y
    );
    if (interactable) {
      return { type: interactable.type, id: interactable.id, position: facingPos };
    }

    return null;
  }

  /** Get sign definition by ID */
  getSignData(signId: string): SignDef | undefined {
    return this.signDefs.find((s) => s.id === signId);
  }

  /** Get interior definition by ID */
  getInteriorData(interiorId: string): InteriorDef | undefined {
    return this.interiorDefs.find((i) => i.id === interiorId);
  }

  /** Get pickup definition by ID */
  getPickupData(pickupId: string): PickupDef | undefined {
    return this.pickupDefs.find((p) => p.id === pickupId);
  }

  /** Get interior interactable definition by ID */
  getInteractableData(id: string): InteriorInteractable | undefined {
    return this.interiorInteractables.find((ia) => ia.id === id);
  }

  /** Mark a pickup as collected (updates the skip set) */
  markPickupCollected(pickupId: string): void {
    this.collectedPickupIds.add(pickupId);
  }
}
