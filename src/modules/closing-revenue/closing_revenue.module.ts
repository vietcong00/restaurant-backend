import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { ClosingRevenueService } from './service/closing_revenue.service';
import { ClosingRevenueController } from './closing_revenue.controller';

@Module({
    controllers: [ClosingRevenueController],
    providers: [ClosingRevenueService, DatabaseService],
})
export class ClosingRevenueModule {}
