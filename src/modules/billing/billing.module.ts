import { Global, Module } from '@nestjs/common';
import { BillingService } from './services/billing.service';
import { BillingController } from './billing.controller';
import { DatabaseService } from 'src/common/services/database.service';
@Global()
@Module({
    imports: [],
    providers: [BillingService, DatabaseService],
    controllers: [BillingController],
})
export class BillingModule {}
