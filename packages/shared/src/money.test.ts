import { describe, expect, it } from 'vitest';
import { applyBps, divRoundHalfEven, formatMoney, money, parseMajor } from './money.js';

describe('divRoundHalfEven', () => {
  it('rounds halves to the even neighbour', () => {
    expect(divRoundHalfEven(5n, 2n)).toBe(2n); // 2.5 -> 2
    expect(divRoundHalfEven(7n, 2n)).toBe(4n); // 3.5 -> 4
    expect(divRoundHalfEven(-5n, 2n)).toBe(-2n);
  });

  it('rounds non-halves normally', () => {
    expect(divRoundHalfEven(10n, 3n)).toBe(3n);
    expect(divRoundHalfEven(11n, 3n)).toBe(4n);
  });
});

describe('applyBps', () => {
  it('computes percentages in basis points', () => {
    expect(applyBps(90_000n, 1_000)).toBe(9_000n);
    expect(applyBps(12_345n, 250)).toBe(309n); // 308.625 -> 309
  });

  it('handles amounts beyond 32-bit range (the rocket case)', () => {
    expect(applyBps(500_000_000_000n, 1_000)).toBe(50_000_000_000n);
  });
});

describe('parseMajor', () => {
  it('converts EGP decimals to piastres', () => {
    expect(parseMajor('1250.5')).toBe(125_050n);
    expect(parseMajor('300')).toBe(30_000n);
  });

  it('rejects too many decimals', () => {
    expect(() => parseMajor('1.234')).toThrow(RangeError);
  });
});

describe('formatMoney', () => {
  it('formats in English and Arabic', () => {
    expect(formatMoney(money(30_000n), 'en')).toContain('300');
    expect(formatMoney(money(30_000n), 'ar')).toContain('300');
  });
});
