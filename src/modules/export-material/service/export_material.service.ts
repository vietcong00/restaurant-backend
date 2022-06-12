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
    ExportMaterialQueryStringDto,
    ExportMaterialDetailResponseDto,
    CreateExportMaterialDto,
    UpdateExportMaterialDto,
} from '../dto/export_material.dto';
import { ExportMaterial } from '../entity/export_material.entity';

const ExportMaterialAttribute: (keyof ExportMaterial)[] = [
    'id',
    'transporters',
    'warehouseStaffId',
    'totalPaymentExport',
    'status',
    'note',
    'createdAt',
    'updatedAt',
];

@Injectable()
export class ExportMaterialService {
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

    async getExportMaterialList(query: ExportMaterialQueryStringDto) {
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
                ExportMaterial,
                {
                    select: ExportMaterialAttribute,
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

    async getExportMaterialDetail(
        id: number,
    ): Promise<ExportMaterialDetailResponseDto> {
        try {
            const exportMaterial = await this.dbManager.findOne(
                ExportMaterial,
                {
                    select: ExportMaterialAttribute,
                    where: { id },
                },
            );
            return exportMaterial;
        } catch (error) {
            throw error;
        }
    }

    async createExportMaterial(
        exportMaterial: CreateExportMaterialDto,
    ): Promise<ExportMaterialDetailResponseDto> {
        try {
            const insertedMaterial = await this.dbManager
                .getRepository(ExportMaterial)
                .insert(exportMaterial);
            const exportMaterialId = insertedMaterial?.identifiers[0]?.id;
            if (exportMaterialId) {
                const exportMaterialDetail = await this.getExportMaterialDetail(
                    exportMaterialId,
                );
                return exportMaterialDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateExportMaterialStatus(
        id: number,
        updateExportMaterial: UpdateExportMaterialDto,
    ) {
        try {
            await this.dbManager.update(
                ExportMaterial,
                id,
                updateExportMaterial,
            );
            const savedMaterial = await this.getExportMaterialDetail(id);
            return savedMaterial;
        } catch (error) {
            throw error;
        }
    }
}
