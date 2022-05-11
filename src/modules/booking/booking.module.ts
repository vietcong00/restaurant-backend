import { Global, Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { BookingController } from './booking.controller';
import { BookingService } from './services/booking.service';
@Global()
@Module({
    imports: [],
    providers: [BookingService, DatabaseService],
    controllers: [BookingController],
})
export class BookingModule {}
