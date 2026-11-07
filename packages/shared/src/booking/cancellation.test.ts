import { describe, expect, it } from 'vitest';
import { computeCancellationRefund, type CancellationInput } from './cancellation.js';

const base: CancellationInput = {
  policy: 'MODERATE',
  cancelledBy: 'RENTER',
  bookedAt: new Date('2026-12-01T00:00:00Z'),
  startsAt: new Date('2026-12-10T00:00:00Z'),
  cancelledAt: new Date('2026-12-05T00:00:00Z'),
  rentalMinor: 90_000n,
  deliveryFeeMinor: 5_000n,
  renterServiceFeeMinor: 9_000n,
};

describe('computeCancellationRefund', () => {
  it('refunds everything when the owner cancels', () => {
    const refund = computeCancellationRefund({ ...base, cancelledBy: 'OWNER' });
    expect(refund.totalRefundMinor).toBe(104_000n);
  });

  it('refunds everything within the grace period', () => {
    const refund = computeCancellationRefund({
      ...base,
      cancelledAt: new Date('2026-12-01T00:30:00Z'),
    });
    expect(refund.refundServiceFeeMinor).toBe(9_000n);
  });

  it('refunds the full rental but not the fee before the moderate cut-off', () => {
    const refund = computeCancellationRefund(base);
    expect(refund.refundRentalMinor).toBe(90_000n);
    expect(refund.refundServiceFeeMinor).toBe(0n);
    expect(refund.totalRefundMinor).toBe(95_000n);
  });

  it('refunds half after the moderate cut-off', () => {
    const refund = computeCancellationRefund({
      ...base,
      cancelledAt: new Date('2026-12-08T00:00:00Z'),
    });
    expect(refund.refundRentalMinor).toBe(45_000n);
    expect(refund.ownerRetainsRentalMinor).toBe(45_000n);
  });

  it('refunds nothing of the rental under strict policy close to the start', () => {
    const refund = computeCancellationRefund({
      ...base,
      policy: 'STRICT',
      cancelledAt: new Date('2026-12-08T00:00:00Z'),
    });
    expect(refund.refundRentalMinor).toBe(0n);
    expect(refund.totalRefundMinor).toBe(5_000n);
  });
});
