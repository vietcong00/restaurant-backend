import {
    Controller,
    Post,
    UseGuards,
    Request,
    Body,
    InternalServerErrorException,
    Get,
    Query,
    Delete,
    ParseIntPipe,
    Param,
    Patch,
} from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { Asset } from 'src/modules/asset/entity/asset.entity';
import {
    SuccessResponse,
    ErrorResponse,
} from '../../common/helpers/api.response';
import { JoiValidationPipe } from '../../common/pipes/joi.validation.pipe';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { DatabaseService } from '../../common/services/database.service';
import {
    CreateAssetDto,
    CreateAssetSchema,
    ImportAssetsDto,
    ImportAssetSchema,
} from './dto/requests/create-asset.dto';
import {
    AssetListQueryStringSchema,
    AssetQueryStringDto,
} from './dto/requests/list-asset.dto';
import {
    UpdateAssetDto,
    UpdateAssetSchema,
} from './dto/requests/update-asset.dto';
import { AssetService } from './services/asset.service';
import {
    AuthorizationGuard,
    Permissions,
} from 'src/common/guards/authorization.guard';
import {
    PermissionResources,
    PermissionActions,
} from 'src/modules/role/role.constants';
import { RequestAsset } from '../request-asset/entity/request-asset.entity';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { v4 as uuidv4 } from 'uuid';
import { assetCategoryList } from '../common/services/global-data.service';
import { HttpStatus } from 'src/common/constants';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
import uniq from 'lodash/uniq';
import { hasPermission } from 'src/common/helpers/common.function';
import { IPermissionResponse } from '../role/role.interface';
import { UserService } from '../user/services/user.service';
import { UserStatus } from '../user/user.constant';
@Controller({
    path: 'asset',
})
@UseGuards(JwtGuard, AuthorizationGuard)
export class AssetController {
    constructor(
        private readonly assetService: AssetService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
        private readonly userService: UserService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.ASSET}_${PermissionActions.READ}`,
        `${PermissionResources.ASSET}_${PermissionActions.READ_PERSONAL}`,
    ])
    async getAssetList(
        @Request() req,
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(AssetListQueryStringSchema),
        )
        query: AssetQueryStringDto,
    ) {
        try {
            const permissions = req.loginUser.role
                ?.permissions as IPermissionResponse[];
            if (
                !hasPermission(
                    permissions,
                    PermissionResources.ASSET,
                    PermissionActions.READ,
                )
            ) {
                query.assigneeIds = [req.loginUser.id];
            }
            const assetList = await this.assetService.getAssets(query);
            return new SuccessResponse(assetList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([`${PermissionResources.ASSET}_${PermissionActions.READ}`])
    async getAsset(@Param('id', ParseIntPipe) id: number) {
        try {
            // Check asset not found
            const asset = await this.assetService.getAssetById(id);
            if (!asset) {
                const message = await this.i18n.translate(
                    'asset.message.assetNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(asset);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([`${PermissionResources.ASSET}_${PermissionActions.CREATE}`])
    async create(
        @Request() req,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(CreateAssetSchema))
        body: CreateAssetDto,
    ) {
        try {
            let isRequestAssetDone = false;
            // Check assignee exist
            const user = await this.userService.getUserById(body.assigneeId);
            if (!user) {
                const message = await this.i18n.translate(
                    'user.common.error.user.notFound',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'assigneeId',
                        message,
                        errorCode: HttpStatus.ITEM_NOT_FOUND,
                    },
                ]);
            } else if (user.status !== UserStatus.ACTIVE) {
                const message = await this.i18n.t(
                    'asset.message.assignee.notActive',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'assigneeId',
                        message,
                        errorCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    },
                ]);
            }

            const category = (assetCategoryList || [])
                .map((u) => u?.code)
                .includes(body.category);

            if (!category) {
                const message = await this.i18n.translate(
                    'asset.message.categoryNotFound',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'category',
                        message,
                        errorCode: HttpStatus.ITEM_NOT_FOUND,
                    },
                ]);
            }

            if (!body.isAutoGenerateCode) {
                // if code already exists?
                const code = await this.databaseService.checkItemExist(
                    Asset,
                    'code',
                    body.code,
                );
                if (code) {
                    const message = await this.i18n.translate(
                        'asset.message.codeExisted',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            key: 'code',
                            message,
                            errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                        },
                    ]);
                }
            } else {
                // auto generate code
                body.code = uuidv4();
            }

            // Check request asset exist
            if (body.requestAssetId) {
                const requestAsset = await this.databaseService.getDataById(
                    RequestAsset,
                    body.requestAssetId,
                );
                if (!requestAsset) {
                    const message = await this.i18n.translate(
                        'request-asset.message.requestAssetNotFound',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            key: 'requestAssetId',
                            message,
                            errorCode: HttpStatus.ITEM_NOT_FOUND,
                        },
                    ]);
                }
                const totalAsset =
                    await this.assetService.countAssetByRequestAssetId(
                        requestAsset.id,
                    );
                if (totalAsset >= requestAsset.approveQuantity) {
                    const message = await this.i18n.translate(
                        'asset.message.exceedApproveQuantity',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            key: 'requestAssetId',
                            message,
                            errorCode: HttpStatus.OVER_LIMIT,
                        },
                    ]);
                }
                if (totalAsset === requestAsset.approveQuantity - 1) {
                    isRequestAssetDone = true;
                }
            }
            // set createdBy
            body.createdBy = req.loginUser.id;
            // create a new asset
            const newAsset = await this.assetService.createAsset(
                body,
                isRequestAssetDone,
            );

            // save audit log
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newAsset },
            });
            // return response
            return new SuccessResponse(newAsset);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([`${PermissionResources.ASSET}_${PermissionActions.UPDATE}`])
    async updateAsset(
        @Request() req,
        @Param('id') id: number,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(UpdateAssetSchema))
        body: UpdateAssetDto,
    ) {
        try {
            const oldAsset = await this.databaseService.getDataById(Asset, id);

            if (!oldAsset) {
                const message = await this.i18n.translate(
                    'asset.message.assetNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const assignee = await this.userService.getUserById(
                body.assigneeId,
            );
            if (!assignee) {
                const message = await this.i18n.translate(
                    'asset.message.assigneeNotFound',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'assigneeId',
                        message,
                        errorCode: HttpStatus.ITEM_NOT_FOUND,
                    },
                ]);
            } else if (assignee.status !== UserStatus.ACTIVE) {
                const message = await this.i18n.t(
                    'asset.message.assignee.notActive',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'assigneeId',
                        message,
                        errorCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    },
                ]);
            }
            // set updatedBy
            body.updatedBy = req.loginUser.id;
            // update this asset
            const updatedAsset = await this.assetService.updateAsset(id, body);
            // save audit log
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldAsset },
                newValue: { ...updatedAsset },
            });
            // return response
            return new SuccessResponse(updatedAsset);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions([`${PermissionResources.ASSET}_${PermissionActions.DELETE}`])
    async deleteAsset(@Request() req, @Param('id', ParseIntPipe) id: number) {
        try {
            const oldAsset = await this.databaseService.getDataById(Asset, id);
            if (!oldAsset) {
                const message = await this.i18n.translate(
                    'asset.message.assetNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }

            await this.assetService.deleteAsset(id, req.loginUser.id);
            const message = await this.i18n.translate(
                'asset.message.removeAssetSuccess',
            );

            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldAsset },
                newValue: {},
            });

            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('bulk-create')
    @Permissions([`${PermissionResources.ASSET}_${PermissionActions.CREATE}`])
    async importAsset(
        @Request() req,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(ImportAssetSchema))
        body: ImportAssetsDto,
    ) {
        try {
            // check assignee exist
            const assigneeList = await this.assetService.getAssignees(
                uniq(
                    body.importAssets.map(
                        (importAsset) => importAsset.assigneeEmail,
                    ),
                ),
            );

            const assetCodes = await this.assetService.getAssetCodes(
                uniq(body.importAssets.map((importAsset) => importAsset.code)),
            );

            const validationResults = await Promise.all(
                body.importAssets.map((asset) =>
                    this.assetService.validateImportAsset(
                        asset,
                        assigneeList,
                        assetCodes,
                    ),
                ),
            );

            let importAssetResults;
            validationResults.forEach((validationResult) => {
                importAssetResults = {
                    ...importAssetResults,
                    [validationResult.index]: validationResult.validationResult,
                };
            });

            if (
                !validationResults.some(
                    (validationResult) =>
                        !validationResult.validationResult.isValid,
                )
            ) {
                this.assetService.bulkCreateAssets(
                    body.importAssets.map((importAsset) => {
                        return this.assetService.mapImportAsset(
                            importAsset,
                            assigneeList,
                            req.loginUser?.id,
                        );
                    }),
                );
            }

            return new SuccessResponse({
                results: importAssetResults,
            });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
