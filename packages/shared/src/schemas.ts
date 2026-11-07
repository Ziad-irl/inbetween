import { z } from 'zod';
import { FULFILLMENT_METHODS, LOCALES } from './enums.js';

/** Minor-unit amount as a decimal string (JSON-safe bigint). */
export const minorAmountSchema = z.string().regex(/^\d+$/, 'Expected a non-negative integer string');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const listingSearchQuerySchema = paginationSchema
  .extend({
    q: z.string().trim().min(1).max(100).optional(),
    categorySlug: z.string().trim().max(100).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().min(1).max(200).default(15),
    startsAt: z.iso.datetime({ offset: true }).optional(),
    endsAt: z.iso.datetime({ offset: true }).optional(),
    minPriceMinor: minorAmountSchema.optional(),
    maxPriceMinor: minorAmountSchema.optional(),
    locale: z.enum(LOCALES).optional(),
  })
  .refine((v) => (v.lat === undefined) === (v.lng === undefined), {
    message: 'lat and lng must be provided together',
    path: ['lat'],
  })
  .refine((v) => (v.startsAt === undefined) === (v.endsAt === undefined), {
    message: 'startsAt and endsAt must be provided together',
    path: ['startsAt'],
  });
export type ListingSearchQuery = z.infer<typeof listingSearchQuerySchema>;

export const bookingQuoteRequestSchema = z
  .object({
    listingId: z.uuid(),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
    quantity: z.number().int().min(1).max(100).default(1),
    fulfillment: z.enum(FULFILLMENT_METHODS).default('PICKUP'),
  })
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    message: 'endsAt must be after startsAt',
    path: ['endsAt'],
  });
export type BookingQuoteRequest = z.infer<typeof bookingQuoteRequestSchema>;
