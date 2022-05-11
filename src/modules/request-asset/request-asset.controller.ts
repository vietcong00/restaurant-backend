import {
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Query,
    UseGuards,
    Request,
    Body,
    Post,
    Patch,
} from '@nestjs/common';
import { JoiValidationPipe } from '../../common/pipes/joi.validation.pipe';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { DatabaseService } from '../../common/services/database.service';
import { RequestAssetService } from './services/request-asset.service';
import { RequestAssetList } from './dto/responses/api-response.dto';
import {
    RequestAssetQueryStringDto,
    RequestListQueryStringSchema,
} from './dto/requests/list-requset.dto';
import { RequestAsset } from './entity/request-asset.entity';
import { I18nRequestScopeService } from 'nestjs-i18n';
import {
    CreateRequestAssetDto,
    CreateRequestAssetSchema,
} from './dto/requests/create-request.dto';
import {
    UpdateRequestAssetDto,
    UpdateRequestAssetSchema,
    UpdateStatusDto,
    UpdateStatusSchema,
} from './dto/requests/update-request.dto';

import {
    ErrorResponse,
    SuccessResponse,
} from '../../common/helpers/api.response';
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

@Controller({
    path: 'request-asset',
})
@UseGuards(JwtGuard, AuthorizationGuard)
export class RequestAssetController {
    constructor(
        private readonly requestAssetService: RequestAssetService,
        private readonly databaseService: DatabaseService,
        private readonly i18n: I18nRequestScopeService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.REQUEST_ASSET}_${PermissionActions.READ}`,
        `${PermissionResources.ASSET}_${PermissionActions.CREATE}`,
    ])
    async getRequestAssetList(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(RequestListQueryStringSchema),
        )
        query: RequestAssetQueryStringDto,
    ) {
        try {
            const data: RequestAssetList =
                await this.requestAssetService.getRequestAssets(query);

            return new SuccessResponse(data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.REQUEST_ASSET}_${PermissionActions.READ}`,
    ])
    async getRequestAsset(@Param('id', ParseIntPipe) id: number) {
        try {
            const requestAsset =
                await this.requestAssetService.getRequestAssetById(id);
            if (!requestAsset) {
                const message = await this.i18n.translate(
                    'request-asset.message.requestAssetNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(requestAsset);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([
        `${PermissionResources.REQUEST_ASSET}_${PermissionActions.CREATE}`,
    ])
    async create(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateRequestAssetSchema),
        )
        body: CreateRequestAssetDto,
    ) {
        try {
            // set createdBy
            body.createdBy = req.loginUser.id;
            // create a new request the asset
            const newRequestAsset =
                await this.requestAssetService.createRequestAsset(body);
            // save audit log
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newRequestAsset },
            });
            // return response
            return new SuccessResponse(newRequestAsset);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.REQUEST_ASSET}_${PermissionActions.UPDATE}`,
    ])
    async updateRequestAsset(
        @Request() req,
        @Param('id') id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateRequestAssetSchema),
        )
        body: UpdateRequestAssetDto,
    ) {
        try {
            // check if id exists
            const oldRequestAsset = await this.databaseService.getDataById(
                RequestAsset,
                id,
            );
            if (!oldRequestAsset) {
                const message = await this.i18n.translate(
                    'request-asset.message.requestAssetNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            // set updatedBy
            body.updatedBy = req.loginUser.id;
            // save to database
            const updatedRequestAsset =
                await this.requestAssetService.updateRequestAsset(id, body);
            // save audit log
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldRequestAsset },
                newValue: { ...updatedRequestAsset },
            });
            // return response
            return new SuccessResponse(updatedRequestAsset);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id/status')
    @Permissions([
        `${PermissionResources.REQUEST_ASSET}_${PermissionActions.UPDATE}`,
    ])
    async updateRequestAssetStatus(
        @Request() req,
        @Param('id') id: number,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(UpdateStatusSchema))
        body: UpdateStatusDto,
    ) {
        try {
            // check if id exists
            const oldRequestAsset = await this.databaseService.getDataById(
                RequestAsset,
                id,
            );
            if (!oldRequestAsset) {
                const message = await this.i18n.translate(
                    'request-asset.message.requestAssetNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            // set updatedBy
            body.updatedBy = req.loginUser.id;
            // update status
            const updatedRequestAsset =
                await this.requestAssetService.updateStatus(id, body);
            // save audit log
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldRequestAsset },
                newValue: { ...updatedRequestAsset },
            });
            // return response
            return new SuccessResponse(updatedRequestAsset);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions([
        `${PermissionResources.REQUEST_ASSET}_${PermissionActions.DELETE}`,
    ])
    async deleteRequestAsset(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            // check if id exists
            const oldRequestAsset = await this.databaseService.getDataById(
                RequestAsset,
                id,
            );
            if (!oldRequestAsset) {
                const message = await this.i18n.translate(
                    'request-asset.message.requestAssetNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            // delete in the database
            await this.requestAssetService.deleteRequestAsset(
                id,
                req.loginUser.id,
            );
            // save audit log
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldRequestAsset },
                newValue: {},
            });
            // return response
            return new SuccessResponse({ id });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
