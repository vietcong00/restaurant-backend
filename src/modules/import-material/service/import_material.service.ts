import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Optional,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ImportMaterial } from '../entity/import_material.entity';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { Brackets, EntityManager, Like } from 'typeorm';
import {
    ImportMaterialQueryStringDto,
    ImportMaterialDetailResponseDto,
    CreateImportMaterialDto,
    UpdateImportMaterialDto,
} from '../dto/import_material.dto';

const ImportMaterialAttribute: (keyof ImportMaterial)[] = [
    'id',
    'supplierId',
    'warehouseStaffId',
    'totalPaymentImport',
    'status',
    'note',
    'createdAt',
    'updatedAt',
];
@Injectable()
export class ImportMaterialService {
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

    async getImportMaterialList(query: ImportMaterialQueryStringDto) {
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
                ImportMaterial,
                {
                    select: ImportMaterialAttribute,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                        }),
                    order: {
                        [orderBy]: orderDirection.toUpperCase(),
                    },
                    relations: ['supplier', 'warehouseStaff'],
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

    async getImportMaterialDetail(
        id: number,
    ): Promise<ImportMaterialDetailResponseDto> {
        try {
            const importMaterial = await this.dbManager.findOne(
                ImportMaterial,
                {
                    select: ImportMaterialAttribute,
                    where: { id },
                },
            );
            return importMaterial;
        } catch (error) {
            throw error;
        }
    }

    async createImportMaterial(
        importMaterial: CreateImportMaterialDto,
    ): Promise<ImportMaterialDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(ImportMaterial)
                .insert(importMaterial);
            const importMaterialId = insertedMaterial?.identifiers[0]?.id;
            if (importMaterialId) {
                const importMaterialDetail = await this.getImportMaterialDetail(
                    importMaterialId,
                );
                return importMaterialDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateImportMaterialStatus(
        id: number,
        updateImportMaterial: UpdateImportMaterialDto,
    ) {
        try {
            await this.dbManager.update(
                ImportMaterial,
                id,
                updateImportMaterial,
            );
            const savedMaterial = await this.getImportMaterialDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }
}
