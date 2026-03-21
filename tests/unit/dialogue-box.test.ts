import { describe, it, expect } from 'vitest';
import { DialogueController } from '../../src/ui/DialogueController';

describe('DialogueController', () => {
  it('reports hasMorePages=true on page 0 of 3-page dialogue', () => {
    const ctrl = new DialogueController(['Page 1', 'Page 2', 'Page 3']);
    expect(ctrl.hasMorePages()).toBe(true);
  });

  it('reports hasMorePages=true on page 1 of 3-page dialogue', () => {
    const ctrl = new DialogueController(['Page 1', 'Page 2', 'Page 3']);
    ctrl.nextPage();
    expect(ctrl.hasMorePages()).toBe(true);
  });

  it('reports hasMorePages=false on last page of 3-page dialogue', () => {
    const ctrl = new DialogueController(['Page 1', 'Page 2', 'Page 3']);
    ctrl.nextPage();
    ctrl.nextPage();
    expect(ctrl.hasMorePages()).toBe(false);
  });

  it('getCurrentPage returns correct page text', () => {
    const ctrl = new DialogueController(['Hello world', 'Goodbye']);
    expect(ctrl.getCurrentPage()).toBe('Hello world');
    ctrl.nextPage();
    expect(ctrl.getCurrentPage()).toBe('Goodbye');
  });

  it('isLastPage returns true only on final page', () => {
    const ctrl = new DialogueController(['A', 'B']);
    expect(ctrl.isLastPage()).toBe(false);
    ctrl.nextPage();
    expect(ctrl.isLastPage()).toBe(true);
  });

  it('reset puts controller back to page 0', () => {
    const ctrl = new DialogueController(['A', 'B', 'C']);
    ctrl.nextPage();
    ctrl.nextPage();
    ctrl.reset(['X', 'Y']);
    expect(ctrl.getCurrentPage()).toBe('X');
    expect(ctrl.hasMorePages()).toBe(true);
  });

  it('dialogue with name "Raju" should return the name', () => {
    const ctrl = new DialogueController(['Hi'], 'Raju');
    expect(ctrl.getName()).toBe('Raju');
  });

  it('dialogue with no name should return empty string', () => {
    const ctrl = new DialogueController(['Hi']);
    expect(ctrl.getName()).toBe('');
  });

  it('pageIndicatorVisible is true when more pages exist', () => {
    const ctrl = new DialogueController(['A', 'B']);
    expect(ctrl.shouldShowPageIndicator()).toBe(true);
  });

  it('pageIndicatorVisible is false on last page', () => {
    const ctrl = new DialogueController(['A', 'B']);
    ctrl.nextPage();
    expect(ctrl.shouldShowPageIndicator()).toBe(false);
  });

  // ── Choice page tests ──────────────────────────────────────────

  describe('choice page support', () => {
    it('isChoicePage returns false when no choice data is set', () => {
      const ctrl = new DialogueController(['A', 'B']);
      expect(ctrl.isChoicePage()).toBe(false);
    });

    it('isChoicePage returns true on the designated choice page', () => {
      const ctrl = new DialogueController(['Intro', 'Details', 'Choose']);
      ctrl.setChoiceData(2, ['Accept', 'Decline']);
      ctrl.nextPage(); // page 1
      ctrl.nextPage(); // page 2 (choice page)
      expect(ctrl.isChoicePage()).toBe(true);
    });

    it('isChoicePage returns false on non-choice pages', () => {
      const ctrl = new DialogueController(['Intro', 'Details', 'Choose']);
      ctrl.setChoiceData(2, ['Accept', 'Decline']);
      expect(ctrl.isChoicePage()).toBe(false); // page 0
      ctrl.nextPage();
      expect(ctrl.isChoicePage()).toBe(false); // page 1
    });

    it('setChoiceData stores choices correctly', () => {
      const ctrl = new DialogueController(['A', 'B']);
      ctrl.setChoiceData(1, ['Yes', 'No']);
      expect(ctrl.getChoices()).toEqual(['Yes', 'No']);
    });

    it('getChoices returns empty array when no choice data set', () => {
      const ctrl = new DialogueController(['A', 'B']);
      expect(ctrl.getChoices()).toEqual([]);
    });

    it('getChoiceCount returns correct count', () => {
      const ctrl = new DialogueController(['A', 'B']);
      ctrl.setChoiceData(1, ['Option 1', 'Option 2']);
      expect(ctrl.getChoiceCount()).toBe(2);
    });

    it('hasMorePages returns false when on choice page', () => {
      const ctrl = new DialogueController(['Intro', 'Choose']);
      ctrl.setChoiceData(1, ['Accept', 'Decline']);
      ctrl.nextPage(); // page 1 (choice page)
      expect(ctrl.hasMorePages()).toBe(false);
    });

    it('selectChoice returns selected choice text', () => {
      const ctrl = new DialogueController(['A', 'B']);
      ctrl.setChoiceData(1, ['Accept', 'Decline']);
      expect(ctrl.selectChoice(0)).toBe('Accept');
      expect(ctrl.selectChoice(1)).toBe('Decline');
    });

    it('reset clears choice data', () => {
      const ctrl = new DialogueController(['A', 'B']);
      ctrl.setChoiceData(1, ['Accept', 'Decline']);
      ctrl.reset(['X', 'Y']);
      expect(ctrl.isChoicePage()).toBe(false);
      expect(ctrl.getChoices()).toEqual([]);
    });
  });
});
