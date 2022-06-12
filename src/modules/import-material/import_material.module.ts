import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { ImportMaterialService } from './service/import_material.service';
import { ImportMaterialController } from './import_material.controller';

@Module({
    controllers: [ImportMaterialController],
    providers: [ImportMaterialService, DatabaseService],
})
export class ImportMaterialModule {}
