import {
    forwardRef,
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
    TOKYOTECHBAB_DOMAIN,
    TYPE_ORM_ORDER_DIRECTION,
} from 'src/common/constants';
import { Request } from 'express';
import { Brackets, EntityManager, Between, getManager } from 'typeorm';
import moment from '~plugins/moment';
import { TimekeepingListQueryStringDto } from '../dto/requests/get-time-line-request.dto';
import forEach from 'lodash/forEach';
import isEmpty from 'lodash/isEmpty';
import difference from 'lodash/difference';
import map from 'lodash/map';
import {
    timekeepingAttributes,
    timekeepingListAttributes,
    TimekeepingOrderBy,
    userDetailAttributes,
} from '../timekeeping.constant';
import { File } from 'src/modules/file/entity/file.entity';
import { UserService } from '../../user/services/user.service';
import { TimekeepingDto } from '../dto/requests/create-time-line.dto';
import { User } from 'src/modules/user/entity/user.entity';
import { Timekeeping } from '../entity/timekeeping.entity';
import { FingerScannerData } from '../entity/finger-scanner-data.entity';
import { makeFileUrl } from 'src/common/helpers/common.function';
import { RequestAbsence } from 'src/modules/request-absence/entity/request-absences.entity';

@Injectable()
export class TimekeepingService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        @Inject(forwardRef(() => UserService))
        private readonly dbManager: EntityManager,
    ) {}

    async getTimekeepings(query: TimekeepingListQueryStringDto) {
        try {
            const startOfThisMonth = moment().startOfMonthString();
            const endOfThisMonth = moment().endOfMonthString();
            const {
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                page = DEFAULT_FIRST_PAGE,
                startAt = startOfThisMonth,
                endAt = endOfThisMonth,
                keyword = '',
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                userId = NaN,
                statuses = [],
            } = query;
            const startTimeQuery = moment(startAt).fmFullTimeString();
            const endTimeQuery = moment(endAt).fmFullTimeString();
            const order =
                orderBy === TimekeepingOrderBy.FULL_NAME
                    ? `user.${TimekeepingOrderBy.FULL_NAME}`
                    : `user.id`;

            // get data time line
            const _queryBuilder = await this.dbManager
                .createQueryBuilder(User, 'user')
                .leftJoinAndMapOne(
                    'user.avatar',
                    File,
                    'file',
                    'file.id = user.avatarId',
                )
                .leftJoinAndMapMany(
                    'user.timekeeping',
                    Timekeeping,
                    'timekeeping',
                    'user.id = timekeeping.userId AND timekeeping.checkIn BETWEEN :startTimeQuery AND :endTimeQuery',
                    {
                        startTimeQuery,
                        endTimeQuery,
                    },
                )
                .leftJoinAndMapMany(
                    'user.requestAbsence',
                    RequestAbsence,
                    'requestAbsence',
                    'user.id = requestAbsence.userId AND ((requestAbsence.startAt BETWEEN :startTimeQuery AND :endTimeQuery) OR (requestAbsence.endAt BETWEEN :startTimeQuery AND :endTimeQuery))',
                    {
                        startTimeQuery,
                        endTimeQuery,
                    },
                )
                .select(timekeepingListAttributes)
                .where((queryBuilder) => {
                    if (userId) {
                        queryBuilder.andWhere(
                            new Brackets((qb) => {
                                qb.where('user.id = :userId', {
                                    userId,
                                });
                            }),
                        );
                    }
                    if (statuses.length) {
                        queryBuilder.andWhere(
                            new Brackets((qb) => {
                                qb.where('user.status IN(:statuses)', {
                                    statuses: statuses,
                                });
                            }),
                        );
                    }
                    if (keyword) {
                        const likeKeyword = `%${keyword}%`;
                        queryBuilder.andWhere(
                            new Brackets((qb) => {
                                qb.where('user.id LIKE :keyword', {
                                    keyword: likeKeyword,
                                })
                                    .orWhere('user.fullName LIKE :keyword', {
                                        keyword: likeKeyword,
                                    })
                                    .orWhere('user.email LIKE :keyword', {
                                        keyword: likeKeyword,
                                    });
                            }),
                        );
                    }
                })
                .orderBy(
                    order,
                    orderDirection.toUpperCase() as TYPE_ORM_ORDER_DIRECTION,
                );

            if (limit && page)
                _queryBuilder.take(limit).skip((page - 1) * limit);
            const [userTimekeepings, totalItems] =
                await _queryBuilder.getManyAndCount();

            return {
                items: userTimekeepings.map((item) => ({
                    ...item,
                    avatarUrl: item.avatar
                        ? makeFileUrl(item.avatar.fileName)
                        : null,
                })),
                totalItems,
            };
        } catch (error) {
            throw error;
        }
    }

    async createTimekeeping(timekeeping: TimekeepingDto) {
        try {
            const insertedTimekeeping = await this.dbManager
                .getRepository(Timekeeping)
                .insert(timekeeping);

            const timekeepingId = insertedTimekeeping?.identifiers[0]?.id;
            if (timekeepingId) {
                const timekeepingDetail = await this.getTimekeepingById(
                    timekeepingId,
                );
                return timekeepingDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async getTimekeepingById(id: number) {
        try {
            const timekeeping = await this.dbManager.findOne(
                Timekeeping,
                { id },
                { select: timekeepingAttributes as (keyof Timekeeping)[] },
            );
            return timekeeping;
        } catch (error) {
            throw error;
        }
    }

    async updateTimekeeping(id: number, timekeeping: TimekeepingDto) {
        try {
            await this.dbManager
                .getRepository(Timekeeping)
                .update({ id }, timekeeping);
            const updatedTimekeeping = await this.getTimekeepingById(id);
            return updatedTimekeeping;
        } catch (error) {
            throw error;
        }
    }

    async checkIdExists(id: number): Promise<boolean> {
        try {
            const count = await this.dbManager.count(Timekeeping, {
                where: { id },
                take: 1,
            });
            return count > 0;
        } catch (error) {
            throw error;
        }
    }

    async deleteTimekeeping(id: number, userId: number) {
        try {
            await this.dbManager.update(
                Timekeeping,
                { id },
                {
                    deletedAt: new Date(),
                    deletedBy: userId,
                },
            );
        } catch (error) {
            throw error;
        }
    }
}

export async function readFingerDataFile(resultReadFile) {
    try {
        const rows = resultReadFile.split('\n');
        const results = {};

        for await (const line of rows) {
            if (line) {
                const _rowData = line.replace(/\s+/g, ' ').split(' ');
                const name = _rowData[1];
                const dateF = _rowData[2];
                const dateTime = dateF + ' ' + _rowData[3];
                if (results[name]) {
                    results[name].push(dateTime);
                } else {
                    results[name] = [dateTime];
                }
            }
        }
        if (!isEmpty(results)) {
            const date = results[Object.keys(results)[0]][0];
            const startOfDay = moment(date).startOfDay().fmFullTimeString();
            const endOfDay = moment(date).endOfDay().fmFullTimeString();
            const fingerScan = await getManager()
                .createQueryBuilder(FingerScannerData, 'finger')
                .addSelect('GROUP_CONCAT(scanAt ORDER BY scanAt ASC) as scanAt')
                .where((queryBuilder) => {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where([
                                {
                                    scanAt: Between(startOfDay, endOfDay),
                                },
                            ]);
                        }),
                    );
                })
                .groupBy('finger.userName')
                .getRawMany();
            const responseTime = fingerScan.reduce((tempFingerScan, scan) => {
                return tempFingerScan.concat({
                    userName: scan?.finger_userName,
                    scanAt: scan?.scanAt.split(','),
                    userId: scan?.finger_userId,
                });
            }, []);
            if (isEmpty(responseTime)) {
                forEach(results, async function (value, key) {
                    const userNameEmail = `${key.toLowerCase()}${TOKYOTECHBAB_DOMAIN}`;
                    const user = await getManager().findOne(User, {
                        select: userDetailAttributes,
                        where: { email: userNameEmail },
                    });
                    forEach(results[key], async function (val) {
                        await getManager().insert(FingerScannerData, {
                            userId: user?.id || null,
                            scanAt: val,
                            userName: user?.fullName,
                            fingerId: user?.fingerId,
                        });
                    });
                });
            } else {
                responseTime.map(async (fg) => {
                    const userNameEmail = `${fg?.userName?.toLowerCase()}${TOKYOTECHBAB_DOMAIN}`;
                    const user = await getManager().findOne(User, {
                        select: userDetailAttributes,
                        where: { email: userNameEmail },
                    });
                    const dateScan = map(fg.scanAt, function (value) {
                        return moment(value).fmFullTimeString();
                    });
                    const scanDiff = difference(results[fg.userName], dateScan);
                    if (!isEmpty(scanDiff)) {
                        scanDiff.forEach(async (time) => {
                            await getManager().insert(FingerScannerData, {
                                userId: user?.id || null,
                                scanAt: time,
                                userName: fg?.userName,
                                fingerId: user?.fingerId,
                            });
                        });
                    }
                });
            }
            forEach(results, async function (value, key) {
                const userNameEmail = `${key.toLowerCase()}${TOKYOTECHBAB_DOMAIN}`;
                const user = await getManager().findOne(User, {
                    select: userDetailAttributes,
                    where: { email: userNameEmail },
                });
                const resultTime = await getManager()
                    .createQueryBuilder(Timekeeping, 'timekeepings')
                    .where((queryBuilder) => {
                        queryBuilder.andWhere(
                            new Brackets((qb) => {
                                qb.where(
                                    'checkIn > :startOfDay AND checkIn < :endOfDay',
                                    {
                                        startOfDay,
                                        endOfDay,
                                    },
                                ).andWhere('userId = :userId', {
                                    userId: user?.id,
                                });
                            }),
                        );
                    })
                    .getRawMany();
                if (resultTime.length === 0) {
                    await getManager().insert(Timekeeping, {
                        userId: user?.id || null,
                        fingerId: user?.fingerId || null,
                        checkIn: moment(results[key][0]).fmFullTimeString(),
                        checkOut: moment(
                            results[key][results[key].length - 1],
                        ).fmFullTimeString(),
                        dateScan: moment().fmDayString(),
                    });
                } else {
                    await getManager()
                        .createQueryBuilder()
                        .update(Timekeeping)
                        .set({
                            checkIn: moment(results[key][0]).fmFullTimeString(),
                            checkOut: moment(
                                results[key][results[key].length - 1],
                            ).fmFullTimeString(),
                        })
                        .where('userId = :userId', { userId: user?.id })
                        .andWhere('checkIn BETWEEN :start AND :end', {
                            start: moment(results[key][0])
                                .startOfDay()
                                .fmFullTimeString(),
                            end: moment(results[key][0])
                                .endOfDay()
                                .fmFullTimeString(),
                        })
                        .execute();
                }
            });
        }
    } catch (error) {
        throw error;
    }
}
