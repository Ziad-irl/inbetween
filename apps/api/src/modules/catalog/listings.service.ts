import { Injectable, NotFoundException } from '@nestjs/common';
import type { ListingSearchQuery } from '@inbetween/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Public coordinates are rounded (~1 km) until a booking is confirmed. */
const approximate = (coordinate: number) => Math.round(coordinate * 100) / 100;

const listingCardSelect = {
  id: true,
  title: true,
  contentLocale: true,
  condition: true,
  currency: true,
  depositMinor: true,
  instantBook: true,
  ratingAverage: true,
  ratingCount: true,
  category: { select: { slug: true, nameAr: true, nameEn: true, riskTier: true } },
  location: { select: { governorate: true, city: true, latitude: true, longitude: true } },
  prices: { select: { unit: true, amountMinor: true } },
  media: { select: { storageKey: true, altText: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
} satisfies Prisma.ListingSelect;

type ListingCardRow = Prisma.ListingGetPayload<{ select: typeof listingCardSelect }>;

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * MVP search: keyword + category + pagination over ACTIVE listings.
   * Full-text (ar/en), PostGIS radius and availability filters arrive in M1 (ADR-0007).
   */
  async search(query: ListingSearchQuery) {
    const where: Prisma.ListingWhereInput = { status: 'ACTIVE', deletedAt: null };
    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        select: listingCardSelect,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return {
      page: query.page,
      pageSize: query.pageSize,
      total,
      items: rows.map(toListingCard),
    };
  }

  async findPublic(id: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id, status: 'ACTIVE', deletedAt: null },
      select: {
        ...listingCardSelect,
        description: true,
        attributes: true,
        fulfillmentMethods: true,
        quantity: true,
        minRentalHours: true,
        maxRentalHours: true,
        cancellationPolicy: true,
        deliveryFeeMinor: true,
        media: { select: { storageKey: true, altText: true, kind: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!listing) {
      throw new NotFoundException({ code: 'LISTING_NOT_FOUND', message: 'Listing not found' });
    }
    return {
      ...toListingCard(listing),
      description: listing.description,
      attributes: listing.attributes,
      fulfillmentMethods: listing.fulfillmentMethods,
      quantity: listing.quantity,
      minRentalHours: listing.minRentalHours,
      maxRentalHours: listing.maxRentalHours,
      cancellationPolicy: listing.cancellationPolicy,
      deliveryFeeMinor: listing.deliveryFeeMinor,
      media: listing.media,
    };
  }
}

function approximateLocation(location: ListingCardRow['location']) {
  return {
    governorate: location.governorate,
    city: location.city,
    latitude: approximate(location.latitude),
    longitude: approximate(location.longitude),
  };
}

function toListingCard(row: ListingCardRow) {
  return {
    id: row.id,
    title: row.title,
    contentLocale: row.contentLocale,
    condition: row.condition,
    currency: row.currency,
    depositMinor: row.depositMinor,
    instantBook: row.instantBook,
    rating: row.ratingCount > 0 ? { average: row.ratingAverage, count: row.ratingCount } : null,
    category: row.category,
    location: approximateLocation(row.location),
    prices: row.prices,
    coverImage: row.media[0] ?? null,
  };
}
