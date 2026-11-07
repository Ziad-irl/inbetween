// Client-facing enum contract. The Prisma schema mirrors these values;
// apps/api has a test that fails if the two drift apart.

export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ar';

export const CURRENCIES = ['EGP'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Drives verification level, deposit rules, instant-book eligibility and moderation. */
export const RISK_TIERS = ['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED'] as const;
export type RiskTier = (typeof RISK_TIERS)[number];

export const PRICE_UNITS = ['HOUR', 'DAY', 'WEEK', 'MONTH'] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];

export const LISTING_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'ACTIVE',
  'PAUSED',
  'REJECTED',
  'ARCHIVED',
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const ITEM_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as const;
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const FULFILLMENT_METHODS = ['PICKUP', 'DELIVERY', 'OPERATOR_INCLUDED'] as const;
export type FulfillmentMethod = (typeof FULFILLMENT_METHODS)[number];

export const CANCELLATION_POLICIES = ['FLEXIBLE', 'MODERATE', 'STRICT'] as const;
export type CancellationPolicy = (typeof CANCELLATION_POLICIES)[number];

export const VERIFICATION_LEVELS = ['NONE', 'L0_PHONE', 'L1_ID', 'L2_ID_SELFIE', 'L3_BUSINESS'] as const;
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export const ORGANIZATION_ROLES = ['OWNER', 'MANAGER', 'STAFF'] as const;
export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const PLATFORM_ROLES = ['USER', 'SUPPORT', 'ADMIN'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

/** Minimum verification required to rent from or list in each risk tier. */
export const RISK_TIER_RULES: Readonly<
  Record<
    RiskTier,
    {
      renterLevel: VerificationLevel;
      ownerLevel: VerificationLevel;
      depositRequired: boolean;
      instantBookAllowed: boolean;
      manualReview: boolean;
      businessOnly: boolean;
    }
  >
> = {
  LOW: {
    renterLevel: 'L0_PHONE',
    ownerLevel: 'L0_PHONE',
    depositRequired: false,
    instantBookAllowed: true,
    manualReview: false,
    businessOnly: false,
  },
  MEDIUM: {
    renterLevel: 'L1_ID',
    ownerLevel: 'L1_ID',
    depositRequired: true,
    instantBookAllowed: true,
    manualReview: false,
    businessOnly: false,
  },
  HIGH: {
    renterLevel: 'L2_ID_SELFIE',
    ownerLevel: 'L2_ID_SELFIE',
    depositRequired: true,
    instantBookAllowed: false,
    manualReview: true,
    businessOnly: false,
  },
  RESTRICTED: {
    renterLevel: 'L2_ID_SELFIE',
    ownerLevel: 'L3_BUSINESS',
    depositRequired: true,
    instantBookAllowed: false,
    manualReview: true,
    businessOnly: true,
  },
};

const LEVEL_ORDER: Readonly<Record<VerificationLevel, number>> = {
  NONE: 0,
  L0_PHONE: 1,
  L1_ID: 2,
  L2_ID_SELFIE: 3,
  L3_BUSINESS: 4,
};

export function meetsVerificationLevel(actual: VerificationLevel, required: VerificationLevel) {
  return LEVEL_ORDER[actual] >= LEVEL_ORDER[required];
}
