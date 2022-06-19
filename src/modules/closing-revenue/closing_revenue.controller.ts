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
    CreateClosingRevenueDto,
    CreateClosingRevenueSchema,
    ClosingRevenueListQueryStringSchema,
    ClosingRevenueQueryStringDto,
    UpdateClosingRevenueDto,
    UpdateClosingRevenueSchema,
} from './dto/closing_revenue.dto';
import { ClosingRevenue } from './entity/closing_revenue.entity';
import { ClosingRevenueService } from './service/closing_revenue.service';

@Controller('closing-revenue')
@UseGuards(JwtGuard, AuthorizationGuard)
export class ClosingRevenueController {
    constructor(
        private readonly closingRevenueService: ClosingRevenueService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.CLOSING_REVENUE}_${PermissionActions.READ}`,
    ])
    async getExportClosingRevenues(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(ClosingRevenueListQueryStringSchema),
        )
        query: ClosingRevenueQueryStringDto,
    ) {
        try {
            const materialList =
                await this.closingRevenueService.getClosingRevenueList(query);
            return new SuccessResponse(materialList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.CLOSING_REVENUE}_${PermissionActions.READ}`,
    ])
    async getClosingRevenue(@Param('id', ParseIntPipe) id: number) {
        try {
            const material =
                await this.closingRevenueService.getClosingRevenueDetail(id);
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
        `${PermissionResources.CLOSING_REVENUE}_${PermissionActions.CREATE}`,
    ])
    async createClosingRevenue(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateClosingRevenueSchema),
        )
        body: CreateClosingRevenueDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            const newClosingRevenue =
                await this.closingRevenueService.createClosingRevenue(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newClosingRevenue },
            });
            return new SuccessResponse(newClosingRevenue);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.CLOSING_REVENUE}_${PermissionActions.UPDATE}`,
    ])
    async updateClosingRevenueStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateClosingRevenueSchema),
        )
        body: UpdateClosingRevenueDto,
    ) {
        try {
            const oldClosingRevenue = await this.databaseService.getDataById(
                ClosingRevenue,
                id,
            );
            if (!oldClosingRevenue) {
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
                await this.closingRevenueService.updateClosingRevenueStatus(
                    id,
                    body,
                );
            const newValue = await this.databaseService.getDataById(
                ClosingRevenue,
                id,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldClosingRevenue },
                newValue: { ...newValue },
            });
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
