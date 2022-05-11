import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import {
    DATE_TIME_FORMAT,
    INPUT_TEXT_MAX_LENGTH,
    MAX_PAGE,
    MAX_PAGE_SIZE,
    MIN_PAGE,
    MIN_PAGE_SIZE,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { EventOrderBy, EventStatus } from '../../event.constant';

export const EventListQueryStringSchema = Joi.object().keys({
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional(),
    limit: Joi.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).optional(),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    orderBy: Joi.string()
        .optional()
        .allow(null, '')
        .valid(...Object.values(EventOrderBy)),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional()
        .allow(null, ''),
    status: Joi.array()
        .items(Joi.string().valid(...Object.values(EventStatus)))
        .optional()
        .allow(null, ''),
    userQuantityRange: Joi.array().items(Joi.number().min(0).max(100)),
    startDate: Joi.array()
        .items(Joi.date().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN))
        .optional()
        .length(2)
        .allow('')
        .label('contract.fields.startDate'),
});

export class EventQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: EventOrderBy;
    orderDirection?: ORDER_DIRECTION;
    userQuantityRange?: number[];
    status?: EventStatus[];
    startDate?: Date;
}
