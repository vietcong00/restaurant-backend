import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Optional,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Event } from '../entity/event.entity';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    ORDER_DIRECTION,
} from 'src/common/constants';
import {
    Brackets,
    EntityManager,
    In,
    LessThan,
    Like,
    MoreThanOrEqual,
} from 'typeorm';
import { EventDetailResponseDto } from '../dto/response/event-response.dto';
import { EventOrderBy, EventStatus } from '../event.constant';
import { EventQueryStringDto } from '../dto/request/list-event.dto';
import { CreateEventDto } from '../dto/request/create-event.dto';
import {
    UpdateEventDto,
    UpdateEventStatusDto,
} from '../dto/request/update-event.dto';
import moment from 'moment';

const EventAttribute: (keyof Event)[] = [
    'id',
    'title',
    'description',
    'startDate',
    'endDate',
    'userQuantity',
    'budget',
    'status',
    'imageUrl',
    'updatedAt',
];
@Injectable()
export class EventService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    generateQueryBuilder(
        queryBuilder,
        { keyword, status, startDate, userQuantityRange },
    ) {
        if (keyword) {
            const likeKeyword = `%${keyword}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        {
                            title: Like(likeKeyword),
                        },
                        {
                            description: Like(likeKeyword),
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
        if (startDate.length === 2) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('startDate BETWEEN :startDay AND :endDay', {
                        startDay: startDate[0],
                        endDay: startDate[1],
                    });
                }),
            );
        }
        if (userQuantityRange && userQuantityRange.length > 0) {
            queryBuilder.andWhere({
                userQuantity: MoreThanOrEqual(userQuantityRange[0]),
            });
            if (userQuantityRange[1]) {
                queryBuilder.andWhere({
                    userQuantity: LessThan(userQuantityRange[1]),
                });
            }
        }
    }

    async getEventList(query: EventQueryStringDto) {
        try {
            const {
                keyword = '',
                status = [],
                startDate = [],
                userQuantityRange = [],
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                orderBy = EventOrderBy.CREATED_AT,
                orderDirection = ORDER_DIRECTION.ASC,
            } = query;
            const take = +limit || DEFAULT_LIMIT_FOR_PAGINATION;
            const skip = (+page - 1) * take || 0;
            const [items, totalItems] = await this.dbManager.findAndCount(
                Event,
                {
                    select: EventAttribute,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, {
                            keyword,
                            status,
                            startDate,
                            userQuantityRange,
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

    async getEventDetail(id: number): Promise<EventDetailResponseDto> {
        try {
            const event = await this.dbManager.findOne(Event, {
                select: EventAttribute,
                where: { id },
            });
            return event;
        } catch (error) {
            throw error;
        }
    }

    async createEvent(event: CreateEventDto): Promise<EventDetailResponseDto> {
        try {
            const insertedEvent = await this.dbManager
                .getRepository(Event)
                .insert(event);
            const eventId = insertedEvent?.identifiers[0]?.id;
            if (eventId) {
                const eventDetail = await this.getEventDetail(eventId);
                return eventDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateEvent(id: number, event: UpdateEventDto) {
        try {
            await this.dbManager.getRepository(Event).update({ id }, event);
            const updatedEvent = await this.getEventDetail(id);
            return updatedEvent;
        } catch (error) {
            throw error;
        }
    }

    async updateEventStatus(id: number, updatedEvent: UpdateEventStatusDto) {
        try {
            await this.dbManager.update(Event, id, updatedEvent);
            const savedEvent = await this.getEventDetail(id);
            return savedEvent;
        } catch (error) {
            throw error;
        }
    }

    async deleteEvent(id: number, deletedBy: number): Promise<void> {
        try {
            await this.dbManager.update(
                Event,
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

    getEventStatus(startDate: Date, endDate: Date): EventStatus {
        const today = moment();
        if (moment(startDate).isAfter(today)) {
            return EventStatus.INCOMING;
        } else if (moment(endDate).isBefore(today)) {
            return EventStatus.EXPIRED;
        } else {
            return EventStatus.INPROGRESS;
        }
    }
}
