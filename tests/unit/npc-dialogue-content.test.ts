import { describe, it, expect } from 'vitest';

// Import all NPC data
import chaiWalla from '../../src/data/npcs/chai-walla.json';
import autoDriver from '../../src/data/npcs/auto-driver.json';
import jogger from '../../src/data/npcs/jogger.json';
import shopkeeper from '../../src/data/npcs/shopkeeper.json';
import guard from '../../src/data/npcs/guard.json';

const allNPCs = [chaiWalla, autoDriver, jogger, shopkeeper, guard];

// Kannada words and phrases that should appear in NPC dialogue
// per CONTEXT.md: "2-3 Kannada words per NPC (saar, guru, namaskara, banni, oota aitha?)"
const kannadaWords = [
  'saar',
  'guru',
  'namaskara',
  'banni',
  'oota aitha',
  'namma',
];

describe('NPC dialogue content', () => {
  it('has 5 NPCs', () => {
    expect(allNPCs).toHaveLength(5);
  });

  it.each(allNPCs)('$name has 2-4 dialogue pages', (npc) => {
    expect(npc.dialogue.pages.length).toBeGreaterThanOrEqual(2);
    expect(npc.dialogue.pages.length).toBeLessThanOrEqual(4);
  });

  it.each(allNPCs)('$name has dialogue.name set', (npc) => {
    expect(npc.dialogue.name).toBeTruthy();
    expect(npc.dialogue.name).toBe(npc.name);
  });

  it.each(allNPCs)('$name dialogue contains Kannada words', (npc) => {
    const allText = npc.dialogue.pages.join(' ').toLowerCase();
    const hasKannada = kannadaWords.some((w) =>
      allText.includes(w.toLowerCase())
    );
    expect(hasKannada).toBe(true);
  });

  it('all NPCs have unique IDs', () => {
    const ids = allNPCs.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all NPCs have valid sprite keys', () => {
    allNPCs.forEach((npc) => {
      expect(npc.spriteKey).toMatch(/^npc-/);
    });
  });

  it('all NPCs have patrol configuration', () => {
    allNPCs.forEach((npc) => {
      expect(npc.patrolRadius).toBeGreaterThan(0);
      expect(npc.patrolDelay).toBeGreaterThan(0);
      expect(npc.speed).toBeGreaterThan(0);
    });
  });

  it('all NPCs have valid positions', () => {
    allNPCs.forEach((npc) => {
      expect(npc.position.x).toBeGreaterThanOrEqual(0);
      expect(npc.position.y).toBeGreaterThanOrEqual(0);
    });
  });
});
