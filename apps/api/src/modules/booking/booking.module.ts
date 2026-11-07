import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { QuotesService } from './quotes.service';

@Module({
  controllers: [BookingController],
  providers: [QuotesService],
})
export class BookingModule {}
