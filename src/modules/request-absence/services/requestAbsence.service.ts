import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Optional,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    TYPE_ORM_ORDER_DIRECTION,
} from 'src/common/constants';
import { Request } from 'express';
import { Brackets, EntityManager, Equal, Between } from 'typeorm';
import { RequestAbsenceListQueryStringDto } from '../dto/requests/get-request-absences-request.dto';
import { CreateRequestAbsenceDto } from '../dto/requests/create-request-absence.dto';
import { RequestAbsenceResponseDto } from '../dto/responses/request-absences-response.dto';
import { UpdateRequestAbsenceDto } from '../dto/requests/update-request-absence.dto';
import moment from '~plugins/moment';
import {
    requestAbsenceAttributes,
    RequestAbsenceOrderBy,
} from '../requestAbsence.constant';
import { File } from 'src/modules/file/entity/file.entity';
import { RequestAbsence } from '../entity/request-absences.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { makeFileUrl } from 'src/common/helpers/common.function';

@Injectable()
export class RequestAbsenceService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    async getRequestAbsences(query: RequestAbsenceListQueryStringDto) {
        const {
            page = DEFAULT_FIRST_PAGE,
            limit = DEFAULT_LIMIT_FOR_PAGINATION,
            keyword,
            orderBy = DEFAULT_ORDER_BY,
            orderDirection = DEFAULT_ORDER_DIRECTION,
            startAt,
            endAt,
            userId,
            status,
        } = query;
        try {
            const _queryBuilder = await this.dbManager
                .createQueryBuilder(RequestAbsence, 'requestAbsence')
                .leftJoinAndMapOne(
                    'requestAbsence.userInfo',
                    User,
                    'user',
                    'user.id = requestAbsence.userId',
                )
                .leftJoinAndMapOne(
                    'requestAbsence.avatarInfo',
                    File,
                    'file',
                    'file.id = user.avatarId',
                )
                .where((queryBuilder) => {
                    this.generateQueryBuilder(queryBuilder, {
                        keyword,
                        startAt,
                        endAt,
                        status,
                        userId,
                    });
                })
                .select(requestAbsenceAttributes);
            if (orderBy) {
                if (orderBy === RequestAbsenceOrderBy.FULL_NAME) {
                    _queryBuilder.orderBy(
                        `user.fullName`,
                        orderDirection.toUpperCase() as TYPE_ORM_ORDER_DIRECTION,
                    );
                } else {
                    _queryBuilder.orderBy(
                        `requestAbsence.${orderBy}`,
                        orderDirection.toUpperCase() as TYPE_ORM_ORDER_DIRECTION,
                    );
                }
            }
            if (limit && page)
                _queryBuilder.take(limit).skip((page - 1) * limit);
            const [items, totalItems] = await _queryBuilder.getManyAndCount();
            return {
                items: items.map((item) => ({
                    ...item,
                    avatarInfo: item.avatarInfo
                        ? {
                              ...item.avatarInfo,
                              url: makeFileUrl(item.avatarInfo.fileName),
                          }
                        : null,
                })),
                totalItems,
            };
        } catch (error) {
            throw error;
        }
    }

    async getRequestAbsenceById(id: number) {
        try {
            const requestAbsence = this.dbManager.findOne(RequestAbsence, {
                where: { id },
            });
            return requestAbsence;
        } catch (error) {
            throw error;
        }
    }

    async createRequestAbsence(
        requestAbsence: CreateRequestAbsenceDto,
    ): Promise<RequestAbsenceResponseDto> {
        try {
            const insertedRequestAbsence = await this.dbManager
                .getRepository(RequestAbsence)
                .insert(requestAbsence);
            const requestAbsenceId = insertedRequestAbsence?.identifiers[0]?.id;
            if (insertedRequestAbsence) {
                const contractTypeDetail = await this.getRequestAbsenceById(
                    requestAbsenceId,
                );
                return contractTypeDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateRequestAbsence(
        id: number,
        requestAbsence: UpdateRequestAbsenceDto,
    ) {
        try {
            await this.dbManager
                .getRepository(RequestAbsence)
                .update(id, requestAbsence);
            const updatedRequestAbsence = await this.getRequestAbsenceById(id);
            return updatedRequestAbsence;
        } catch (error) {
            throw error;
        }
    }

    async deleteRequestAbsence(id: number, deletedBy: number) {
        try {
            await this.dbManager.update(
                RequestAbsence,
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
        { keyword, startAt, endAt, userId, status },
    ) {
        if (userId) {
            queryBuilder.andWhere({
                userId: Equal(userId),
            });
        }

        if (startAt?.length === 2) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.andWhere({
                        startAt: Between(
                            moment(startAt[0]).toDate(),
                            moment(startAt[1]).toDate(),
                        ),
                    });
                }),
            );
        }

        if (endAt?.length === 2) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.andWhere({
                        endAt: Between(
                            moment(endAt[0]).toDate(),
                            moment(endAt[1]).toDate(),
                        ),
                    });
                }),
            );
        }

        if (keyword) {
            const likeKeyword = `%${keyword}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('reason LIKE :keyword', {
                        keyword: likeKeyword,
                    })
                        .orWhere('user.id LIKE :keyword', {
                            keyword: likeKeyword,
                        })
                        .orWhere('user.email LIKE :keyword', {
                            keyword: likeKeyword,
                        })
                        .orWhere('user.fullName LIKE :keyword', {
                            keyword: likeKeyword,
                        });
                }),
            );
        }
        if (status?.length) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.andWhere('requestAbsence.status IN(:status)', {
                        status,
                    });
                }),
            );
        }
    }

    async checkTimeOverlap(
        userId: number,
        startAt: Date | string,
        endAt: Date | string,
        requestAbsenceId?: number,
    ): Promise<boolean> {
        try {
            const startDay = moment(startAt).fmFullTimeString();
            const endDay = moment(endAt).fmFullTimeString();
            const _queryBuilder = await this.dbManager
                .createQueryBuilder(RequestAbsence, 'requestAbsence')
                .where((queryBuilder) => {
                    queryBuilder.where(
                        new Brackets((qb) => {
                            qb.where('startAt BETWEEN :startDay AND :endDay', {
                                startDay,
                                endDay,
                            })
                                .orWhere(
                                    'endAt BETWEEN :startDay AND :endDay',
                                    {
                                        startDay,
                                        endDay,
                                    },
                                )
                                .orWhere(
                                    'startAt < :startDay AND endAt > :endDay',
                                    {
                                        startDay,
                                        endDay,
                                    },
                                );
                        }),
                    );
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where([
                                {
                                    userId,
                                },
                            ]);
                        }),
                    );
                    if (requestAbsenceId) {
                        queryBuilder.andWhere('requestAbsence.id != :id', {
                            id: requestAbsenceId,
                        });
                    }
                })
                .getRawMany();
            return _queryBuilder.length === 0;
        } catch (error) {
            throw error;
        }
    }
}
