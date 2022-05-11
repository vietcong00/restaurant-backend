import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './services/asset.service';
import { RequestAssetService } from '../request-asset/services/request-asset.service';
import { DatabaseService } from 'src/common/services/database.service';
import { UserService } from '../user/services/user.service';

@Module({
    controllers: [AssetController],
    providers: [
        AssetService,
        RequestAssetService,
        DatabaseService,
        UserService,
    ],
})
export class AssetModule {}
