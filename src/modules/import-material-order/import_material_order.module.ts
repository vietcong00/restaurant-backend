import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { ImportMaterialOrderController } from './import_material_order.controller';
import { ImportMaterialOrderService } from './service/import_material_order.service';

@Module({
    controllers: [ImportMaterialOrderController],
    providers: [ImportMaterialOrderService, DatabaseService],
})
export class ImportMaterialOrderModule {}
