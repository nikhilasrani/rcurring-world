import type { SignDef, InteriorDef, InteractionTarget } from '../utils/types';

/**
 * InteractionSystem: Detects adjacent interactables when player presses action button.
 *
 * Checks the tile the player is facing for:
 * 1. NPCs (via Grid Engine getCharactersAt)
 * 2. Signs (from sign definitions array)
 * 3. Doors (from interior definitions array)
 *
 * Priority: NPC > Sign > Door (NPC always wins if standing on a sign/door tile)
 */
export class InteractionSystem {
  private signDefs: SignDef[] = [];
  private interiorDefs: InteriorDef[] = [];

  constructor(signDefs: SignDef[], interiorDefs: InteriorDef[]) {
    this.signDefs = signDefs;
    this.interiorDefs = interiorDefs;
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
}
