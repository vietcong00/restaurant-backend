import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { ImportMaterialService } from '../import-material/service/import_material.service';
import { ImportMaterialOrderController } from './import_material_order.controller';
import { ImportMaterialOrderService } from './service/import_material_order.service';

@Module({
    controllers: [ImportMaterialOrderController],
    providers: [
        ImportMaterialOrderService,
        DatabaseService,
        ImportMaterialService,
    ],
})
export class ImportMaterialOrderModule {}
