import type { Currency, PriceUnit, RiskTier } from '@inbetween/shared/enums';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface CategoryNode {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  iconKey: string | null;
  riskTier: RiskTier;
  children: CategoryNode[];
}

/** Money arrives as strings of minor units (ADR-0008). */
export interface ListingCard {
  id: string;
  title: string;
  currency: Currency;
  depositMinor: string;
  instantBook: boolean;
  rating: { average: number; count: number } | null;
  category: { slug: string; nameAr: string; nameEn: string };
  location: { governorate: string; city: string };
  prices: Array<{ unit: PriceUnit; amountMinor: string }>;
  coverImage: { storageKey: string; altText: string | null } | null;
}

export interface Paginated<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}

/**
 * Server-side GET against the API. Returns null when the API is unreachable
 * so pages degrade gracefully (and builds don't depend on a running API).
 */
export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
