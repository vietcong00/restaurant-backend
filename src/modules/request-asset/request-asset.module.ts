import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { RequestAssetController } from './request-asset.controller';
import { RequestAssetService } from './services/request-asset.service';

@Module({
    controllers: [RequestAssetController],
    providers: [RequestAssetService, DatabaseService],
})
export class RequestAssetModule {}
