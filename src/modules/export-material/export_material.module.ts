import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { ExportMaterialService } from './service/export_material.service';
import { ExportMaterialController } from './export_material.controller';

@Module({
    controllers: [ExportMaterialController],
    providers: [ExportMaterialService, DatabaseService],
})
export class ExportMaterialModule {}
