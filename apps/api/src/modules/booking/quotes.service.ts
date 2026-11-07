import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildQuote, durationInHours, type BookingQuoteRequest } from '@inbetween/shared';
import { PrismaService } from '../../prisma/prisma.service';
import type { AppConfig } from '../../config/env';

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /**
   * Prices a rental with the same shared code the ledger will use.
   * Read-only: holding the dates happens when the booking is created (M2).
   */
  async quote(request: BookingQuoteRequest) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: request.listingId, status: 'ACTIVE', deletedAt: null },
      include: { prices: true },
    });
    if (!listing) {
      throw new NotFoundException({ code: 'LISTING_NOT_FOUND', message: 'Listing not found' });
    }

    const startsAt = new Date(request.startsAt);
    const endsAt = new Date(request.endsAt);
    const hours = durationInHours(startsAt, endsAt);

    if (startsAt.getTime() < Date.now()) {
      throw new UnprocessableEntityException({ code: 'BOOKING_IN_PAST', message: 'Start time is in the past' });
    }
    if (hours < listing.minRentalHours || (listing.maxRentalHours && hours > listing.maxRentalHours)) {
      throw new UnprocessableEntityException({
        code: 'BOOKING_DURATION_OUT_OF_RANGE',
        message: `Duration must be between ${listing.minRentalHours} and ${listing.maxRentalHours ?? '∞'} hours`,
      });
    }
    if (!listing.fulfillmentMethods.includes(request.fulfillment)) {
      throw new UnprocessableEntityException({
        code: 'FULFILLMENT_NOT_OFFERED',
        message: `This listing does not offer ${request.fulfillment}`,
      });
    }
    if (request.quantity > listing.quantity) {
      throw new UnprocessableEntityException({
        code: 'QUANTITY_UNAVAILABLE',
        message: `Only ${listing.quantity} unit(s) exist`,
      });
    }

    // Units already blocked in the window. The exclusion constraint is the real guard at booking time.
    const blockedUnits = await this.prisma.availabilityBlock.groupBy({
      by: ['unitIndex'],
      where: { listingId: listing.id, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
    });
    if (listing.quantity - blockedUnits.length < request.quantity) {
      throw new ConflictException({
        code: 'BOOKING_DATES_UNAVAILABLE',
        message: 'The listing is not available for these dates',
      });
    }

    const quote = buildQuote({
      prices: listing.prices,
      startsAt,
      endsAt,
      quantity: request.quantity,
      depositMinor: listing.depositMinor,
      deliveryFeeMinor: request.fulfillment === 'DELIVERY' ? (listing.deliveryFeeMinor ?? 0n) : 0n,
      renterServiceFeeBps: this.config.get('RENTER_SERVICE_FEE_BPS', { infer: true }),
      ownerCommissionBps: this.config.get('OWNER_COMMISSION_BPS', { infer: true }),
      currency: listing.currency,
    });

    return {
      listingId: listing.id,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      fulfillment: request.fulfillment,
      instantBook: listing.instantBook,
      cancellationPolicy: listing.cancellationPolicy,
      ...quote,
    };
  }
}
