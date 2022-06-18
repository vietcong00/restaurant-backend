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
import { Food } from '../entity/food.entity';
import {
    FoodQueryStringDto,
    FoodDetailResponseDto,
    CreateFoodDto,
    UpdateFoodDto,
} from '../dto/food.dto';

const FoodAttribute: (keyof Food)[] = [
    'id',
    'foodImgId',
    'foodName',
    'price',
    'categoryId',
    'createdAt',
];

@Injectable()
export class FoodService {
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
                            foodName: Like(likeKeyword),
                        },
                    ]);
                }),
            );
        }
    }

    async getFoodList(query: FoodQueryStringDto) {
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
                Food,
                {
                    select: FoodAttribute,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                        }),
                    order: {
                        [orderBy]: orderDirection.toUpperCase(),
                    },
                    relations: ['category'],
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

    async getFoodDetail(id: number): Promise<FoodDetailResponseDto> {
        try {
            const food = await this.dbManager.findOne(Food, {
                select: FoodAttribute,
                where: { id },
            });
            return food;
        } catch (error) {
            throw error;
        }
    }

    async createFood(food: CreateFoodDto): Promise<FoodDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(Food)
                .insert(food);
            const foodId = insertedMaterial?.identifiers[0]?.id;
            if (foodId) {
                const foodDetail = await this.getFoodDetail(foodId);
                return foodDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateFoodStatus(id: number, updateFood: UpdateFoodDto) {
        try {
            await this.dbManager.update(Food, id, updateFood);
            const savedMaterial = await this.getFoodDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }

    async deleteFood(id: number, deletedBy: number): Promise<void> {
        try {
            await this.dbManager.update(
                Food,
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
