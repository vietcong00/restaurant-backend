import { Inject, Injectable, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Request } from 'express';
import { Asset } from 'src/modules/asset/entity/asset.entity';
import { User } from 'src/modules/user/entity/user.entity';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_DIRECTION,
    HttpStatus,
    TYPE_ORM_ORDER_DIRECTION,
} from 'src/common/constants';
import {
    Brackets,
    Connection,
    EntityManager,
    getConnection,
    In,
    Like,
} from 'typeorm';
import { AssetOrderBy } from '../asset.constant';
import {
    CreateAssetDto,
    ImportAssetDto,
} from '../dto/requests/create-asset.dto';
import { AssetQueryStringDto } from '../dto/requests/list-asset.dto';
import { UpdateAssetDto } from '../dto/requests/update-asset.dto';
import { AssetList } from '../dto/responses/asset-reponse.dto';
import { AssetResponseDto } from '../dto/responses/asset-reponse.dto';
import { RequestAsset } from 'src/modules/request-asset/entity/request-asset.entity';
import { RequestAssetStatus } from 'src/modules/request-asset/request-asset.constant';
import { assetCategoryList } from 'src/modules/common/services/global-data.service';
import { v4 as uuidv4 } from 'uuid';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { uniq } from 'lodash';
import { UserStatus } from 'src/modules/user/user.constant';

const assetListAttributes = [
    'asset.id',
    'asset.name',
    'asset.type',
    'asset.usingStatus',
    'asset.description',
    'user.fullName',
    'user.id',
    'asset.category',
    'asset.code',
    'asset.price',
    'asset.createdAt',
    'asset.requestAssetId',
    'asset.purchaseDate',
];

@Injectable()
export class AssetService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
        private readonly connection: Connection,
        private readonly i18n: I18nRequestScopeService,
    ) {}

    async getAssets(query: AssetQueryStringDto): Promise<AssetList> {
        try {
            const {
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                keyword = '',
                orderBy = AssetOrderBy.CREATED_AT,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                categories = [],
                types = [],
                assigneeIds = [],
                usingStatus = [],
                purchaseDateRange = [],
            } = query;
            // Pagination
            const _queryBuilder = await this.dbManager
                .createQueryBuilder(Asset, 'asset')
                .leftJoinAndMapOne(
                    'asset.assignee',
                    User,
                    'user',
                    'user.id = asset.assigneeId',
                )
                .where((queryBuilder) => {
                    this.generateQueryBuilder(queryBuilder, {
                        keyword,
                        types,
                        categories,
                        assigneeIds,
                        usingStatus,
                        purchaseDateRange,
                    });
                })
                .select(assetListAttributes);
            if (orderBy === AssetOrderBy.ASSIGNEE) {
                _queryBuilder.orderBy(
                    `user.fullName`,
                    orderDirection.toUpperCase() as TYPE_ORM_ORDER_DIRECTION,
                );
            } else if (orderBy) {
                _queryBuilder.orderBy(
                    `asset.${orderBy}`,
                    orderDirection.toUpperCase() as TYPE_ORM_ORDER_DIRECTION,
                );
            }
            _queryBuilder.take(limit).skip((page - 1) * limit);
            const [items, totalItems] = await _queryBuilder.getManyAndCount();
            return {
                items: items,
                totalItems: totalItems,
            };
        } catch (error) {
            throw error;
        }
    }

    async getInUseAssetCategory(): Promise<string[]> {
        try {
            const assets = await this.dbManager
                .getRepository(Asset)
                .createQueryBuilder('asset')
                .select('category')
                .distinct(true)
                .getRawMany();
            const assetCategories = (assets || []).map(
                (asset) => asset.category,
            );
            return assetCategories;
        } catch (error) {
            throw error;
        }
    }

    async getAssetById(id: number) {
        try {
            const asset = (await this.dbManager.findOne(Asset, {
                where: { id },
            })) as AssetResponseDto;
            if (asset && asset.assigneeId) {
                const assignee = await this.dbManager.findOne(User, {
                    where: {
                        id: asset.assigneeId,
                    },
                });
                asset.assignee = {
                    id: assignee?.id,
                    fullName: assignee?.fullName,
                };
            }
            return asset;
        } catch (error) {
            throw error;
        }
    }

    async createAsset(
        asset: CreateAssetDto,
        isRequestAssetDone?: boolean,
    ): Promise<AssetResponseDto> {
        try {
            const queryRunner = this.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const newAsset = {
                    ...asset,
                };
                const saveAsset = await this.dbManager.save(Asset, newAsset);
                if (isRequestAssetDone) {
                    const requestAsset = {
                        updatedBy: asset.createdBy,
                        status: RequestAssetStatus.DONE,
                    };
                    await this.dbManager
                        .getRepository(RequestAsset)
                        .update(asset.requestAssetId, requestAsset);
                }
                await queryRunner.commitTransaction();
                return saveAsset;
            } catch (err) {
                await queryRunner.rollbackTransaction();
            } finally {
                await queryRunner.release();
            }
        } catch (error) {
            throw error;
        }
    }

    async updateAsset(
        id: number,
        updateAsset: UpdateAssetDto,
    ): Promise<AssetResponseDto> {
        try {
            await this.dbManager.update(Asset, id, updateAsset);
            const saveAsset = await this.getAssetById(id);
            return saveAsset;
        } catch (error) {
            throw error;
        }
    }

    async deleteAsset(id: number, deletedBy: number): Promise<void> {
        try {
            await this.dbManager.update(
                Asset,
                { id },
                {
                    deletedAt: new Date(),
                    deletedBy,
                },
            );
        } catch (error) {
            throw error;
        }
    }

    generateQueryBuilder(
        queryBuilder,
        {
            keyword,
            categories,
            types,
            assigneeIds,
            usingStatus,
            purchaseDateRange,
        },
    ) {
        if (keyword) {
            const likeKeyword = `%${keyword}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        { name: Like(likeKeyword) },
                        { code: Like(likeKeyword) },
                    ]);
                }),
            );
        }
        if (categories && categories.length > 0) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            category: In(categories),
                        },
                    ]);
                }),
            );
        }
        if (assigneeIds && assigneeIds.length > 0) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            assigneeId: In(assigneeIds),
                        },
                    ]);
                }),
            );
        }
        if (types && types.length > 0) {
            queryBuilder.andWhere({
                type: In(types),
            });
        }
        if (usingStatus && usingStatus.length > 0) {
            queryBuilder.andWhere({
                usingStatus: In(usingStatus),
            });
        }
        if (purchaseDateRange.length === 2) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('purchaseDate BETWEEN :startDay AND :endDay', {
                        startDay: purchaseDateRange[0],
                        endDay: purchaseDateRange[1],
                    });
                }),
            );
        }
    }

    async countAssetByRequestAssetId(requestAssetId: number) {
        try {
            const totalAssets = await this.dbManager.count(Asset, {
                where: {
                    requestAssetId: requestAssetId,
                },
            });
            return totalAssets;
        } catch (error) {
            throw error;
        }
    }

    async getAssignees(assigneeEmails: string[]): Promise<User[]> {
        const assignees = await this.dbManager.find(User, {
            select: ['id', 'email', 'status'],
            where: { email: In(assigneeEmails) },
        });

        return uniq(assignees);
    }

    async getAssetCodes(assetCodes: string[]): Promise<string[]> {
        const assetList = await this.dbManager.find(Asset, {
            select: ['code'],
            where: { code: In(assetCodes) },
        });

        return uniq(assetList.map((asset) => asset.code));
    }

    async bulkCreateAssets(importAsset: CreateAssetDto[]) {
        try {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Asset)
                .values(importAsset)
                .execute();
        } catch (err) {
            throw err;
        }
    }

    async validateImportAsset(
        importAsset: ImportAssetDto,
        assigneeList: User[],
        assetCodes: string[],
    ) {
        const validationResult = {
            isValid: true,
            errors: [],
        };
        const category = (assetCategoryList || [])
            .map((assetCategory) => assetCategory?.code)
            .includes(importAsset.category);

        if (!category) {
            const errorMessage = await this.i18n.translate(
                'asset.message.categoryNotFound',
            );
            validationResult.errors.push({
                column: 'category',
                errorMessage,
                errorCode: HttpStatus.ITEM_NOT_FOUND,
            });
            validationResult.isValid = false;
        }

        const assetAssignee = assigneeList.find(
            (assignee) => assignee.email === importAsset.assigneeEmail,
        );

        if (!assetAssignee) {
            const errorMessage = await this.i18n.translate(
                'user.common.error.user.notFound',
            );
            validationResult.errors.push({
                column: 'assignee',
                errorMessage,
                errorCode: HttpStatus.ITEM_NOT_FOUND,
            });
            validationResult.isValid = false;
        }

        if (assetAssignee && assetAssignee.status !== UserStatus.ACTIVE) {
            const errorMessage = await this.i18n.translate(
                'asset.message.assignee.notActive',
            );
            validationResult.errors.push({
                column: 'assignee',
                errorMessage,
                errorCode: HttpStatus.UNPROCESSABLE_ENTITY,
            });
            validationResult.isValid = false;
        }

        if (importAsset.code) {
            if (assetCodes.includes(importAsset.code)) {
                const errorMessage = await this.i18n.translate(
                    'asset.message.codeExisted',
                );
                validationResult.errors.push({
                    column: 'code',
                    errorMessage,
                    errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                });
                validationResult.isValid = false;
            }
        }

        return { validationResult, index: importAsset.index };
    }

    mapImportAsset(
        importAsset: ImportAssetDto,
        listAssignee: User[],
        createdBy: number,
    ): CreateAssetDto {
        const assetAssignee = listAssignee.find(
            (assignee) => assignee.email === importAsset.assigneeEmail,
        );

        if (assetAssignee) {
            importAsset.assigneeId = assetAssignee.id;
        }

        if (!importAsset.code) {
            importAsset.code = uuidv4();
        }
        return { ...importAsset, name: importAsset.assetName, createdBy };
    }

    async countAssetByUserId(assigneeId: number): Promise<number> {
        try {
            const assetsCount = await this.dbManager.count(Asset, {
                where: {
                    assigneeId,
                },
            });

            return assetsCount;
        } catch (error) {
            throw error;
        }
    }
}
