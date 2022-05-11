import { Inject, Injectable, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Request } from 'express';
import { Brackets, EntityManager, In, Like } from 'typeorm';
import { RequestAssetQueryStringDto } from '../dto/requests/list-requset.dto';
import { RequestAssetList } from '../dto/responses/api-response.dto';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_DIRECTION,
    TYPE_ORM_ORDER_DIRECTION,
} from '../../../common/constants';
import { RequestAsset } from '../entity/request-asset.entity';
import { CreateRequestAssetDto } from '../dto/requests/create-request.dto';
import { RequestAssetResponseDto } from '../dto/responses/request-asset-response.dto';
import {
    RequestAssetOrderBy,
    RequestAssetStatus,
} from '../request-asset.constant';
import {
    UpdateRequestAssetDto,
    UpdateStatusDto,
} from '../dto/requests/update-request.dto';
import { User } from 'src/modules/user/entity/user.entity';

export const requestAssetListAttributes = [
    'req.id',
    'req.name',
    'req.type',
    'req.description',
    'req.approveQuantity',
    'req.status',
    'req.requestQuantity',
    'users.fullName',
    'users.id',
    'req.category',
    'req.price',
    'req.createdAt',
];

@Injectable()
export class RequestAssetService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    async getRequestAssets(
        query: RequestAssetQueryStringDto,
    ): Promise<RequestAssetList> {
        try {
            const {
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                keyword = '',
                orderBy = RequestAssetOrderBy.CREATED_AT,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                categories = [],
                types = [],
                status = [],
            } = query;

            // Pagination
            const _queryBuilder = this.dbManager
                .createQueryBuilder(RequestAsset, 'req')
                .leftJoinAndMapOne(
                    'req.assignee',
                    User,
                    'users',
                    'users.id = req.createdBy',
                )
                .where((queryBuilder) => {
                    this.generateQueryBuilder(queryBuilder, {
                        keyword,
                        categories,
                        types,
                        status,
                    });
                })
                .select(requestAssetListAttributes);
            if (orderBy) {
                _queryBuilder.orderBy(
                    `req.${orderBy}`,
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

    async getRequestAssetById(id: number): Promise<RequestAssetResponseDto> {
        try {
            const requestAsset = await this.dbManager.findOne(RequestAsset, {
                where: { id },
            });
            if (requestAsset) {
                return { ...requestAsset };
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    async createRequestAsset(
        requestAsset: CreateRequestAssetDto,
    ): Promise<RequestAssetResponseDto> {
        try {
            const newRequestAsset = {
                ...requestAsset,
                status: RequestAssetStatus.PENDING,
            };
            const { ...saveRequestAsset } = await this.dbManager.save(
                RequestAsset,
                newRequestAsset,
            );
            return saveRequestAsset;
        } catch (error) {
            throw error;
        }
    }

    async updateRequestAsset(
        id: number,
        updateRequestAsset: UpdateRequestAssetDto,
    ): Promise<RequestAssetResponseDto> {
        try {
            await this.dbManager.update(RequestAsset, id, updateRequestAsset);
            const savedRequestAsset = await this.getRequestAssetById(id);
            return savedRequestAsset;
        } catch (error) {
            throw error;
        }
    }

    async updateStatus(
        id: number,
        updateRequestAsset: UpdateStatusDto,
    ): Promise<RequestAssetResponseDto> {
        try {
            await this.dbManager.update(RequestAsset, id, updateRequestAsset);

            const savedRequestAsset = await this.getRequestAssetById(id);

            return savedRequestAsset;
        } catch (error) {
            throw error;
        }
    }

    async deleteRequestAsset(id: number, deletedBy: number): Promise<void> {
        try {
            await this.dbManager.update(
                RequestAsset,
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

    generateQueryBuilder(queryBuilder, { keyword, categories, types, status }) {
        if (keyword) {
            const likeKeyword = `%${keyword}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            name: Like(likeKeyword),
                        },
                        {
                            type: Like(likeKeyword),
                        },
                        {
                            status: Like(likeKeyword),
                        },
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
        if (status && status.length > 0) {
            queryBuilder.andWhere({
                status: In(status),
            });
        }
        if (types && types.length > 0) {
            queryBuilder.andWhere({
                type: In(types),
            });
        }
    }
}
