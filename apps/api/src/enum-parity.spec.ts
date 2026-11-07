import * as shared from '@inbetween/shared';
import * as db from '@prisma/client';

// The database enums (Prisma) and the client contract (@inbetween/shared) must not drift.
const pairs: Array<[string, Record<string, string>, readonly string[]]> = [
  ['Locale', db.Locale, shared.LOCALES],
  ['Currency', db.Currency, shared.CURRENCIES],
  ['RiskTier', db.RiskTier, shared.RISK_TIERS],
  ['PriceUnit', db.PriceUnit, shared.PRICE_UNITS],
  ['ListingStatus', db.ListingStatus, shared.LISTING_STATUSES],
  ['ItemCondition', db.ItemCondition, shared.ITEM_CONDITIONS],
  ['FulfillmentMethod', db.FulfillmentMethod, shared.FULFILLMENT_METHODS],
  ['CancellationPolicy', db.CancellationPolicy, shared.CANCELLATION_POLICIES],
  ['VerificationLevel', db.VerificationLevel, shared.VERIFICATION_LEVELS],
  ['OrganizationRole', db.OrganizationRole, shared.ORGANIZATION_ROLES],
  ['PlatformRole', db.PlatformRole, shared.PLATFORM_ROLES],
  ['BookingStatus', db.BookingStatus, shared.BOOKING_STATUSES],
];

describe('enum parity between Prisma and @inbetween/shared', () => {
  it.each(pairs)('%s matches', (_name, prismaEnum, sharedValues) => {
    expect(Object.values(prismaEnum).sort()).toEqual([...sharedValues].sort());
  });
});
