import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
} from 'src/common/constants';
import { Brackets, EntityManager, In, Like } from 'typeorm';
import { CreateBillingDto } from '../dto/requests/create-billing.dto';
import { BillingListQueryStringDto } from '../dto/requests/list-billing.dto';
import { UpdateBillingDto } from '../dto/requests/update-billing.dto';
import { BillingResponseDto } from '../dto/responses/billing-response.dto';
import { Billing } from '../entity/billing.entity';

const billingAttributes: (keyof Billing)[] = [
    'id',
    'name',
    'description',
    'url',
    'payerId',
    'payDate',
    'createdAt',
];
@Injectable()
export class BillingService {
    constructor(private readonly dbManager: EntityManager) {}

    generateQueryBuilder(
        queryBuilder,
        { keyword, payerIds, paymentDateRange },
    ) {
        if (keyword) {
            const likeKeyword = `%${keyword}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            name: Like(likeKeyword),
                        },
                        {
                            description: Like(likeKeyword),
                        },
                    ]);
                }),
            );
        }
        if (payerIds.length) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            payerId: In(payerIds),
                        },
                    ]);
                }),
            );
        }
        if (paymentDateRange.length === 2) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('payDate BETWEEN :startDay AND :endDay', {
                        startDay: paymentDateRange[0],
                        endDay: paymentDateRange[1],
                    });
                }),
            );
        }
    }

    async getBillingList(query: BillingListQueryStringDto) {
        try {
            const {
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                keyword = '',
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                payerIds = [],
                paymentDateRange = [],
            } = query;

            // Pagination
            const take = +limit || DEFAULT_LIMIT_FOR_PAGINATION;
            const skip = (+page - 1) * take || 0;

            const [items, totalItems] = await this.dbManager.findAndCount(
                Billing,
                {
                    select: billingAttributes,
                    relations: ['user'],
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                            payerIds,
                            paymentDateRange,
                        }),
                    order: {
                        [orderBy]: orderDirection.toUpperCase(),
                    },
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

    async getBillingDetail(id: number): Promise<BillingResponseDto> {
        try {
            const billing = await this.dbManager.findOne(Billing, {
                select: billingAttributes,
                where: { id },
            });
            return billing;
        } catch (error) {
            throw error;
        }
    }

    async createBilling(billing: CreateBillingDto) {
        try {
            const insertedBilling = await this.dbManager
                .getRepository(Billing)
                .insert(billing);
            const billingId = insertedBilling?.identifiers[0]?.id;
            if (billingId) {
                const billingDetail = await this.getBillingDetail(billingId);
                return billingDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateBilling(id: number, billing: UpdateBillingDto) {
        try {
            await this.dbManager.getRepository(Billing).update({ id }, billing);
            const updatedBilling = await this.getBillingDetail(id);
            return updatedBilling;
        } catch (error) {
            throw error;
        }
    }

    async deleteBilling(id: number, deletedBy: number) {
        try {
            await this.dbManager.update(
                Billing,
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
}
