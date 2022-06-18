import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './modules/common/common.module';
import { I18nModule } from './common/services/i18n.service';
import { WinstonModule } from './common/services/winston.service';
import { DatabaseModule } from './common/services/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AppController } from './app.controller';
import { RequestAbsenceModule } from './modules/request-absence/requestAbsence.module';
import { TimekeepingModule } from './modules/timekeeping/timekeeping.module';
import { BillingModule } from './modules/billing/billing.module';
import { RequestAssetModule } from './modules/request-asset/request-asset.module';
import { RoleModule } from './modules/role/role.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { EventModule } from './modules/event/event.module';
import { ContractModule } from './modules/contract/contract.module';
import { AssetModule } from './modules/asset/asset.module';
import { FileModule } from './modules/file/file.module';
import { BotModule } from './modules/slack-bot/bot.module';
import { TeamModule } from './modules/team/team.module';
import { SetttingModule } from './modules/setting/setting.module';
import envSchema from './common/config/validation-schema';
import { ConfigModule } from '@nestjs/config';
import { GlobalDataService } from './modules/common/services/global-data.service';
import { BookingModule } from './modules/booking/booking.module';
import { TableDiagramModule } from './modules/table-diagram/tableDiagram.module';
import { CategoryModule } from './modules/category/category.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { FoodModule } from './modules/food/food.module';
import { MaterialModule } from './modules/material/material.module';
import { ConvertMaterialModule } from './modules/convert-material/convert_material.module';
import { ImportMaterialModule } from './modules/import-material/import_material.module';
import { ExportMaterialModule } from './modules/export-material/export_material.module';
import { ImportMaterialOrderModule } from './modules/import-material-order/import_material_order.module';
import { ExportMaterialOrderModule } from './modules/export-material-order/export_material_order.module';
import { CheckInventoryModule } from './modules/check-inventory/check_inventory.module';
import { CheckInventoryDetailModule } from './modules/check-inventory-detail/check_inventory_detail.module';
import { ClosingRevenueModule } from './modules/closing-revenue/closing_revenue.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
            validationSchema: envSchema,
        }),
        WinstonModule,
        I18nModule,
        CommonModule,
        ScheduleModule.forRoot(),
        DatabaseModule,
        AuthModule,
        UserModule,
        RequestAbsenceModule,
        TimekeepingModule,
        BillingModule,
        RequestAssetModule,
        RoleModule,
        RecruitmentModule,
        EventModule,
        ContractModule,
        AssetModule,
        FileModule,
        BotModule,
        TeamModule,
        SetttingModule,
        BookingModule,
        TableDiagramModule,
        CategoryModule,
        SupplierModule,
        MaterialModule,
        ConvertMaterialModule,
        ImportMaterialModule,
        ExportMaterialModule,
        ImportMaterialOrderModule,
        ExportMaterialOrderModule,
        CheckInventoryModule,
        CheckInventoryDetailModule,
        FoodModule,
        ClosingRevenueModule,
    ],
    controllers: [AppController],
    providers: [GlobalDataService],
})
export class AppModule {}
