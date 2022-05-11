import { Module } from '@nestjs/common';
import { TimekeepingController } from './timekeeping.controller';
import { TimekeepingService } from './services/timekeeping.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/services/user.service';
import { DatabaseService } from 'src/common/services/database.service';
import { ReadFingerScannerDataJob } from './cron-job/readFingerScannerData.job';
import { RequestAbsenceService } from '../request-absence/services/requestAbsence.service';

@Module({
    imports: [ConfigService],
    controllers: [TimekeepingController],
    providers: [
        TimekeepingService,
        RequestAbsenceService,
        UserService,
        DatabaseService,
        ReadFingerScannerDataJob,
    ],
})
export class TimekeepingModule {}
