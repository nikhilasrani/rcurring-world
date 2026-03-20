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
});
