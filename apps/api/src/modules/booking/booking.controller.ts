import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { bookingQuoteRequestSchema, type BookingQuoteRequest } from '@inbetween/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { QuotesService } from './quotes.service';

@ApiTags('booking')
@Controller('bookings')
export class BookingController {
  constructor(private readonly quotes: QuotesService) {}

  @Post('quote')
  @HttpCode(200)
  @ApiOperation({ summary: 'Price a rental: rental, fees, delivery, deposit and totals' })
  quote(@Body(new ZodValidationPipe(bookingQuoteRequestSchema)) body: BookingQuoteRequest) {
    return this.quotes.quote(body);
  }
}
