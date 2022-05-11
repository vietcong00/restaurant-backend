import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { UpdateEventStatusJob } from './cron-job/updateEventStatus.job';
import { EventController } from './event.controller';
import { EventService } from './service/event.service';

@Module({
    controllers: [EventController],
    providers: [EventService, DatabaseService, UpdateEventStatusJob],
})
export class EventModule {}
