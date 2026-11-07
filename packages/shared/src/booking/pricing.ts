import type { Currency, PriceUnit } from '../enums.js';
import { applyBps } from '../money.js';

/** A month is billed as 30 days. */
export const UNIT_HOURS: Readonly<Record<PriceUnit, number>> = {
  HOUR: 1,
  DAY: 24,
  WEEK: 24 * 7,
  MONTH: 24 * 30,
};

/** Upper bound for a single booking (about two years). */
export const MAX_RENTAL_HOURS = 24 * 366 * 2;

export interface UnitPrice {
  unit: PriceUnit;
  amountMinor: bigint;
}

export interface PriceLine {
  unit: PriceUnit;
  quantity: number;
  unitAmountMinor: bigint;
  amountMinor: bigint;
}

/** Billable hours between two instants, rounded up to the next full hour. */
export function durationInHours(startsAt: Date, endsAt: Date): number {
  const ms = endsAt.getTime() - startsAt.getTime();
  if (!Number.isFinite(ms) || ms <= 0) throw new RangeError('endsAt must be after startsAt');
  return Math.ceil(ms / 3_600_000);
}

/**
 * Cheapest combination of the listing's unit prices that covers `hours`.
 * Example: with HOUR=20 and DAY=300, 26h costs 1 day + 2 hours = 340, not 2 days.
 * Unbounded "covering" knapsack; O(hours × units), fine for the bounded duration.
 */
export function cheapestRentalPrice(
  prices: readonly UnitPrice[],
  hours: number,
): { totalMinor: bigint; lines: PriceLine[] } {
  if (!Number.isInteger(hours) || hours < 1) throw new RangeError('hours must be a positive integer');
  if (hours > MAX_RENTAL_HOURS) throw new RangeError(`Rentals are limited to ${MAX_RENTAL_HOURS} hours`);
  const usable = prices.filter((p) => p.amountMinor >= 0n);
  if (usable.length === 0) throw new Error('Listing has no prices');

  const cost: bigint[] = [0n];
  const choice: number[] = [-1];
  for (let h = 1; h <= hours; h++) {
    let best: bigint | undefined;
    let bestIndex = -1;
    for (let index = 0; index < usable.length; index++) {
      const price = usable[index]!;
      const candidate = cost[Math.max(0, h - UNIT_HOURS[price.unit])]! + price.amountMinor;
      if (best === undefined || candidate < best) {
        best = candidate;
        bestIndex = index;
      }
    }
    cost[h] = best!;
    choice[h] = bestIndex;
  }

  const counts = new Map<number, number>();
  for (let h = hours; h > 0; ) {
    const index = choice[h]!;
    counts.set(index, (counts.get(index) ?? 0) + 1);
    h = Math.max(0, h - UNIT_HOURS[usable[index]!.unit]);
  }

  const lines = [...counts.entries()]
    .map(([index, quantity]) => {
      const price = usable[index]!;
      return {
        unit: price.unit,
        quantity,
        unitAmountMinor: price.amountMinor,
        amountMinor: price.amountMinor * BigInt(quantity),
      };
    })
    .sort((a, b) => UNIT_HOURS[b.unit] - UNIT_HOURS[a.unit]);

  return { totalMinor: cost[hours]!, lines };
}

export interface QuoteInput {
  prices: readonly UnitPrice[];
  startsAt: Date;
  endsAt: Date;
  /** Number of identical units (business inventory). */
  quantity?: number;
  /** Deposit per unit. */
  depositMinor: bigint;
  deliveryFeeMinor?: bigint;
  renterServiceFeeBps: number;
  ownerCommissionBps: number;
  currency?: Currency;
}

export interface Quote {
  currency: Currency;
  durationHours: number;
  quantity: number;
  lines: PriceLine[];
  rentalMinor: bigint;
  deliveryFeeMinor: bigint;
  renterServiceFeeMinor: bigint;
  ownerCommissionMinor: bigint;
  /** Held separately (pre-auth or captured), not part of renterPaysMinor. */
  depositMinor: bigint;
  /** rental + delivery + renter service fee. */
  renterPaysMinor: bigint;
  /** rental + delivery − commission. */
  ownerReceivesMinor: bigint;
  /** renter service fee + owner commission. */
  platformRevenueMinor: bigint;
}

/**
 * The price a renter sees and the amounts the ledger posts both come from here.
 * Invariant: renterPaysMinor === ownerReceivesMinor + platformRevenueMinor.
 */
export function buildQuote(input: QuoteInput): Quote {
  const quantity = input.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity < 1) throw new RangeError('quantity must be >= 1');

  const durationHours = durationInHours(input.startsAt, input.endsAt);
  const { totalMinor, lines } = cheapestRentalPrice(input.prices, durationHours);
  const rentalMinor = totalMinor * BigInt(quantity);
  const deliveryFeeMinor = input.deliveryFeeMinor ?? 0n;
  const renterServiceFeeMinor = applyBps(rentalMinor, input.renterServiceFeeBps);
  const ownerCommissionMinor = applyBps(rentalMinor, input.ownerCommissionBps);

  return {
    currency: input.currency ?? 'EGP',
    durationHours,
    quantity,
    lines: lines.map((line) => ({
      ...line,
      quantity: line.quantity * quantity,
      amountMinor: line.amountMinor * BigInt(quantity),
    })),
    rentalMinor,
    deliveryFeeMinor,
    renterServiceFeeMinor,
    ownerCommissionMinor,
    depositMinor: input.depositMinor * BigInt(quantity),
    renterPaysMinor: rentalMinor + deliveryFeeMinor + renterServiceFeeMinor,
    ownerReceivesMinor: rentalMinor + deliveryFeeMinor - ownerCommissionMinor,
    platformRevenueMinor: renterServiceFeeMinor + ownerCommissionMinor,
  };
}
