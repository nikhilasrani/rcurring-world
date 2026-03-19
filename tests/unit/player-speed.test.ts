import { describe, it, expect } from 'vitest';
import { getPlayerSpeed, getMovementDirection } from '../../src/entities/Player';

describe('Player Speed', () => {
  it('returns walk speed (4) when not running', () => {
    expect(getPlayerSpeed(false)).toBe(4);
  });

  it('returns run speed (8) when running', () => {
    expect(getPlayerSpeed(true)).toBe(8);
  });

  it('run speed is exactly 2x walk speed', () => {
    expect(getPlayerSpeed(true)).toBe(getPlayerSpeed(false) * 2);
  });
});

describe('Movement Direction', () => {
  it('returns LEFT when left is pressed', () => {
    expect(
      getMovementDirection({ left: true, right: false, up: false, down: false })
    ).toBe('left');
  });

  it('returns RIGHT when right is pressed', () => {
    expect(
      getMovementDirection({ left: false, right: true, up: false, down: false })
    ).toBe('right');
  });

  it('returns UP when up is pressed', () => {
    expect(
      getMovementDirection({ left: false, right: false, up: true, down: false })
    ).toBe('up');
  });

  it('returns DOWN when down is pressed', () => {
    expect(
      getMovementDirection({ left: false, right: false, up: false, down: true })
    ).toBe('down');
  });

  it('returns null when no direction pressed', () => {
    expect(
      getMovementDirection({
        left: false,
        right: false,
        up: false,
        down: false,
      })
    ).toBeNull();
  });

  it('prioritizes left over right (no diagonal)', () => {
    expect(
      getMovementDirection({ left: true, right: true, up: false, down: false })
    ).toBe('left');
  });

  it('prioritizes horizontal over vertical', () => {
    expect(
      getMovementDirection({ left: true, right: false, up: true, down: false })
    ).toBe('left');
  });
});
