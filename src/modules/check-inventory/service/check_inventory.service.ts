import {
    Injectable,
    Optional,
    Inject,
    InternalServerErrorException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { EventOrderBy } from 'src/modules/event/event.constant';
import { EntityManager, Brackets, Like } from 'typeorm';
import {
    CheckInventoryQueryStringDto,
    CheckInventoryDetailResponseDto,
    CreateCheckInventoryDto,
    UpdateCheckInventoryDto,
} from '../dto/check_inventory.dto';
import { CheckInventory } from '../entity/check_inventory.entity';

const CheckInventoryAttribute: (keyof CheckInventory)[] = [
    'id',
    'warehouseStaffId',
    'status',
    'note',
    'createdAt',
    'updatedAt',
];

@Injectable()
export class CheckInventoryService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    generateQueryBuilder(queryBuilder, { keyword }) {
        if (keyword) {
            const likeKeyword = `%${keyword}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            material: Like(likeKeyword),
                        },
                    ]);
                }),
            );
        }
    }

    async getCheckInventoryList(query: CheckInventoryQueryStringDto) {
        try {
            const {
                keyword = '',
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                orderBy = EventOrderBy.CREATED_AT,
                orderDirection = ORDER_DIRECTION.ASC,
            } = query;
            const take = +limit || DEFAULT_LIMIT_FOR_PAGINATION;
            const skip = (+page - 1) * take || 0;
            const [items, totalItems] = await this.dbManager.findAndCount(
                CheckInventory,
                {
                    select: CheckInventoryAttribute,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                        }),
                    order: {
                        [orderBy]: orderDirection.toUpperCase(),
                    },
                    relations: ['warehouseStaff'],
                    take,
                    skip,
                },
            );
            return {
                items,
                totalItems,
            };
        } catch (error) {
            throw error;
        }
    }

    async getCheckInventoryDetail(
        id: number,
    ): Promise<CheckInventoryDetailResponseDto> {
        try {
            const checkInventory = await this.dbManager.findOne(
                CheckInventory,
                {
                    select: CheckInventoryAttribute,
                    where: { id },
                },
            );
            return checkInventory;
        } catch (error) {
            throw error;
        }
    }

    async createCheckInventory(
        checkInventory: CreateCheckInventoryDto,
    ): Promise<CheckInventoryDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(CheckInventory)
                .insert(checkInventory);
            const checkInventoryId = insertedMaterial?.identifiers[0]?.id;
            if (checkInventoryId) {
                const checkInventoryDetail = await this.getCheckInventoryDetail(
                    checkInventoryId,
                );
                return checkInventoryDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateCheckInventoryStatus(
        id: number,
        updateCheckInventory: UpdateCheckInventoryDto,
    ) {
        try {
            await this.dbManager.update(
                CheckInventory,
                id,
                updateCheckInventory,
            );
            const savedMaterial = await this.getCheckInventoryDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }
}
