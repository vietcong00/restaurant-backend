import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { DatabaseService } from 'src/common/services/database.service';
import {
    ErrorResponse,
    SuccessResponse,
} from 'src/common/helpers/api.response';
import {
    AuthorizationGuard,
    Permissions,
} from 'src/common/guards/authorization.guard';
import {
    PermissionResources,
    PermissionActions,
} from 'src/modules/role/role.constants';
import { HttpStatus } from 'src/common/constants';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
import {
    CreateExportMaterialDto,
    CreateExportMaterialSchema,
    ExportMaterialListQueryStringSchema,
    ExportMaterialQueryStringDto,
    UpdateExportMaterialDto,
    UpdateExportMaterialSchema,
} from './dto/export_material.dto';
import { ExportMaterial } from './entity/export_material.entity';
import { ExportMaterialService } from './service/export_material.service';

@Controller('export-material')
@UseGuards(JwtGuard, AuthorizationGuard)
export class ExportMaterialController {
    constructor(
        private readonly exportMaterialService: ExportMaterialService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.STORE_EXPORT_MATERIAL}_${PermissionActions.READ}`,
    ])
    async getExportExportMaterials(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(ExportMaterialListQueryStringSchema),
        )
        query: ExportMaterialQueryStringDto,
    ) {
        try {
            const materialList =
                await this.exportMaterialService.getExportMaterialList(query);
            return new SuccessResponse(materialList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.STORE_EXPORT_MATERIAL}_${PermissionActions.READ}`,
    ])
    async getExportMaterial(@Param('id', ParseIntPipe) id: number) {
        try {
            const material =
                await this.exportMaterialService.getExportMaterialDetail(id);
            if (!material) {
                const message = await this.i18n.translate(
                    'material.message.materialNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([
        `${PermissionResources.STORE_EXPORT_MATERIAL}_${PermissionActions.CREATE}`,
    ])
    async createExportMaterial(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateExportMaterialSchema),
        )
        body: CreateExportMaterialDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            const newExportMaterial =
                await this.exportMaterialService.createExportMaterial(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newExportMaterial },
            });
            return new SuccessResponse(newExportMaterial);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.STORE_EXPORT_MATERIAL}_${PermissionActions.UPDATE}`,
    ])
    async updateExportMaterialStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateExportMaterialSchema),
        )
        body: UpdateExportMaterialDto,
    ) {
        try {
            const oldExportMaterial = await this.databaseService.getDataById(
                ExportMaterial,
                id,
            );
            if (!oldExportMaterial) {
                const message = await this.i18n.translate(
                    'material.message.materialNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const material =
                await this.exportMaterialService.updateExportMaterialStatus(
                    id,
                    body,
                );
            const newValue = await this.databaseService.getDataById(
                ExportMaterial,
                id,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldExportMaterial },
                newValue: { ...newValue },
            });
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
