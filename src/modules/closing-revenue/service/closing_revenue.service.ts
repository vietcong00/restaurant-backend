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
    DEFAULT_ORDER_BY,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { EntityManager, Brackets, Like } from 'typeorm';
import {
    ClosingRevenueQueryStringDto,
    ClosingRevenueDetailResponseDto,
    CreateClosingRevenueDto,
    UpdateClosingRevenueDto,
} from '../dto/closing_revenue.dto';
import { ClosingRevenue } from '../entity/closing_revenue.entity';

const ClosingRevenueAttribute: (keyof ClosingRevenue)[] = [
    'id',
    'shift',
    'shiftLeaderId',
    'cashAtBeginningOfShift',
    'cashAtEndingOfShift',
    'bankingRevenue',
    'differenceRevenue',
    'note',
    'createdAt',
    'updatedAt',
];

@Injectable()
export class ClosingRevenueService {
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
                            shiftLeaderId: Like(likeKeyword),
                        },
                    ]);
                }),
            );
        }
    }

    async getClosingRevenueList(query: ClosingRevenueQueryStringDto) {
        try {
            const {
                keyword = '',
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = ORDER_DIRECTION.ASC,
            } = query;
            const take = +limit || DEFAULT_LIMIT_FOR_PAGINATION;
            const skip = (+page - 1) * take || 0;
            const [items, totalItems] = await this.dbManager.findAndCount(
                ClosingRevenue,
                {
                    select: ClosingRevenueAttribute,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                        }),
                    order: {
                        [orderBy]: orderDirection.toUpperCase(),
                    },
                    relations: ['shiftLeader'],
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

    async getClosingRevenueDetail(
        id: number,
    ): Promise<ClosingRevenueDetailResponseDto> {
        try {
            const checkInventory = await this.dbManager.findOne(
                ClosingRevenue,
                {
                    select: ClosingRevenueAttribute,
                    where: { id },
                },
            );
            return checkInventory;
        } catch (error) {
            throw error;
        }
    }

    async createClosingRevenue(
        checkInventory: CreateClosingRevenueDto,
    ): Promise<ClosingRevenueDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(ClosingRevenue)
                .insert(checkInventory);
            const checkInventoryId = insertedMaterial?.identifiers[0]?.id;
            if (checkInventoryId) {
                const checkInventoryDetail = await this.getClosingRevenueDetail(
                    checkInventoryId,
                );
                return checkInventoryDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateClosingRevenueStatus(
        id: number,
        updateClosingRevenue: UpdateClosingRevenueDto,
    ) {
        try {
            await this.dbManager.update(
                ClosingRevenue,
                id,
                updateClosingRevenue,
            );
            const savedMaterial = await this.getClosingRevenueDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }
}
