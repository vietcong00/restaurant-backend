import { Global, Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { TableDiagramService } from '../table-diagram/services/tableDiagram.service';
import { BookingController } from './booking.controller';
import { BookingService } from './services/booking.service';
@Global()
@Module({
    imports: [],
    providers: [BookingService, DatabaseService, TableDiagramService],
    controllers: [BookingController],
})
export class BookingModule {}
