import type { CancellationPolicy } from '../enums.js';
import { applyBps } from '../money.js';

interface RefundTier {
  /** Applies when the cancellation happens at least this many hours before the start. */
  minHoursBeforeStart: number;
  /** Share of the rental refunded, in basis points. */
  refundBps: number;
}

/** Ordered from most to least generous. Mirrors docs/architecture/booking-lifecycle.md. */
export const CANCELLATION_TIERS: Readonly<Record<CancellationPolicy, readonly RefundTier[]>> = {
  FLEXIBLE: [
    { minHoursBeforeStart: 24, refundBps: 10_000 },
    { minHoursBeforeStart: Number.NEGATIVE_INFINITY, refundBps: 5_000 },
  ],
  MODERATE: [
    { minHoursBeforeStart: 72, refundBps: 10_000 },
    { minHoursBeforeStart: Number.NEGATIVE_INFINITY, refundBps: 5_000 },
  ],
  STRICT: [
    { minHoursBeforeStart: 24 * 7, refundBps: 5_000 },
    { minHoursBeforeStart: Number.NEGATIVE_INFINITY, refundBps: 0 },
  ],
};

/** A renter who cancels within this window after booking gets everything back. */
export const CANCELLATION_GRACE_HOURS = 1;

export interface CancellationInput {
  policy: CancellationPolicy;
  cancelledBy: 'RENTER' | 'OWNER' | 'OPS';
  bookedAt: Date;
  startsAt: Date;
  cancelledAt: Date;
  rentalMinor: bigint;
  deliveryFeeMinor: bigint;
  renterServiceFeeMinor: bigint;
}

export interface CancellationRefund {
  refundRentalMinor: bigint;
  refundDeliveryFeeMinor: bigint;
  refundServiceFeeMinor: bigint;
  totalRefundMinor: bigint;
  /** Part of the rental that stays with the owner (before commission). */
  ownerRetainsRentalMinor: bigint;
}

const HOUR_MS = 3_600_000;

export function computeCancellationRefund(input: CancellationInput): CancellationRefund {
  const full = (): CancellationRefund => ({
    refundRentalMinor: input.rentalMinor,
    refundDeliveryFeeMinor: input.deliveryFeeMinor,
    refundServiceFeeMinor: input.renterServiceFeeMinor,
    totalRefundMinor: input.rentalMinor + input.deliveryFeeMinor + input.renterServiceFeeMinor,
    ownerRetainsRentalMinor: 0n,
  });

  // Owner or ops cancellations always refund the renter in full.
  if (input.cancelledBy !== 'RENTER') return full();

  const hoursSinceBooking = (input.cancelledAt.getTime() - input.bookedAt.getTime()) / HOUR_MS;
  if (hoursSinceBooking <= CANCELLATION_GRACE_HOURS) return full();

  const hoursBeforeStart = (input.startsAt.getTime() - input.cancelledAt.getTime()) / HOUR_MS;
  const tier = CANCELLATION_TIERS[input.policy].find(
    (t) => hoursBeforeStart >= t.minHoursBeforeStart,
  )!;

  const refundRentalMinor = applyBps(input.rentalMinor, tier.refundBps);
  // Delivery has not happened yet, so its fee is always refunded; the service fee is not.
  const refundDeliveryFeeMinor = input.deliveryFeeMinor;
  return {
    refundRentalMinor,
    refundDeliveryFeeMinor,
    refundServiceFeeMinor: 0n,
    totalRefundMinor: refundRentalMinor + refundDeliveryFeeMinor,
    ownerRetainsRentalMinor: input.rentalMinor - refundRentalMinor,
  };
}
