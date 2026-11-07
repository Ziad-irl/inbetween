import { describe, expect, it } from 'vitest';
import { buildQuote, cheapestRentalPrice, durationInHours } from './pricing.js';

const at = (iso: string) => new Date(iso);

describe('durationInHours', () => {
  it('rounds up partial hours', () => {
    expect(durationInHours(at('2026-12-01T10:00:00Z'), at('2026-12-01T12:10:00Z'))).toBe(3);
  });

  it('rejects inverted ranges', () => {
    expect(() => durationInHours(at('2026-12-02T00:00:00Z'), at('2026-12-01T00:00:00Z'))).toThrow();
  });
});

describe('cheapestRentalPrice', () => {
  it('charges whole days when only a daily price exists', () => {
    const result = cheapestRentalPrice([{ unit: 'DAY', amountMinor: 30_000n }], 30);
    expect(result.totalMinor).toBe(60_000n);
    expect(result.lines).toEqual([
      { unit: 'DAY', quantity: 2, unitAmountMinor: 30_000n, amountMinor: 60_000n },
    ]);
  });

  it('mixes days and hours when cheaper', () => {
    const result = cheapestRentalPrice(
      [
        { unit: 'HOUR', amountMinor: 2_000n },
        { unit: 'DAY', amountMinor: 30_000n },
      ],
      26,
    );
    expect(result.totalMinor).toBe(34_000n);
  });

  it('uses a weekly price when it beats six days', () => {
    const result = cheapestRentalPrice(
      [
        { unit: 'DAY', amountMinor: 10_000n },
        { unit: 'WEEK', amountMinor: 50_000n },
      ],
      24 * 6,
    );
    expect(result.totalMinor).toBe(50_000n);
    expect(result.lines[0]?.unit).toBe('WEEK');
  });
});

describe('buildQuote', () => {
  it('matches the worked example in docs/architecture/payments-and-escrow.md', () => {
    const quote = buildQuote({
      prices: [{ unit: 'DAY', amountMinor: 30_000n }],
      startsAt: at('2026-12-01T10:00:00Z'),
      endsAt: at('2026-12-04T10:00:00Z'),
      depositMinor: 200_000n,
      renterServiceFeeBps: 1_000,
      ownerCommissionBps: 1_000,
    });
    expect(quote.rentalMinor).toBe(90_000n);
    expect(quote.renterServiceFeeMinor).toBe(9_000n);
    expect(quote.renterPaysMinor).toBe(99_000n);
    expect(quote.ownerReceivesMinor).toBe(81_000n);
    expect(quote.platformRevenueMinor).toBe(18_000n);
    expect(quote.depositMinor).toBe(200_000n);
  });

  it('keeps the ledger invariant with quantity and delivery', () => {
    const quote = buildQuote({
      prices: [{ unit: 'HOUR', amountMinor: 1_234n }],
      startsAt: at('2026-12-01T10:00:00Z'),
      endsAt: at('2026-12-01T17:00:00Z'),
      quantity: 3,
      depositMinor: 50_000n,
      deliveryFeeMinor: 7_500n,
      renterServiceFeeBps: 1_250,
      ownerCommissionBps: 875,
    });
    expect(quote.renterPaysMinor).toBe(quote.ownerReceivesMinor + quote.platformRevenueMinor);
    expect(quote.depositMinor).toBe(150_000n);
  });
});
