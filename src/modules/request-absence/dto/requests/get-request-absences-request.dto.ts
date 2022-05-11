import {
    INPUT_TEXT_MAX_LENGTH,
    DATE_TIME_FORMAT,
    MIN_PAGE_SIZE,
    MIN_PAGE,
    MAX_PAGE_SIZE,
    MAX_PAGE,
    MAX_INTEGER,
} from '../../../../common/constants';

import { ORDER_DIRECTION } from 'src/common/constants';
import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import {
    RequestAbsenceOrderBy,
    RequestAbsenceStatus,
} from '../../requestAbsence.constant';

const Joi = BaseJoi.extend(JoiDate);

export const RequestAbsenceListQueryStringSchema = Joi.object().keys({
    page: Joi.number()
        .optional()
        .min(MIN_PAGE)
        .max(MAX_PAGE)
        .label('request-absence.fields.page'),
    limit: Joi.number()
        .min(MIN_PAGE_SIZE)
        .max(MAX_PAGE_SIZE)
        .optional()
        .label('request-absence.fields.limit'),
    keyword: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .label('request-absence.fields.keyword'),
    orderBy: Joi.string()
        .valid(...Object.values(RequestAbsenceOrderBy))
        .optional()
        .label('request-absence.fields.orderBy'),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional()
        .label('request-absence.fields.orderDirection'),
    endAt: Joi.array()
        .items(
            Joi.date().format(
                DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON,
            ),
        )
        .optional()
        .length(2)
        .allow('')
        .label('request-absence.fields.endAt'),
    startAt: Joi.array()
        .items(
            Joi.date().format(
                DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON,
            ),
        )
        .optional()
        .length(2)
        .allow('')
        .label('request-absence.fields.startAt'),
    status: Joi.array()
        .items(Joi.string().valid(...Object.values(RequestAbsenceStatus)))
        .optional()
        .label('request-absence.fields.status'),
    userId: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .optional()
        .label('request-absence.fields.userId'),
});
export class RequestAbsenceListQueryStringDto {
    page?: number;
    limit?: number;
    orderBy?: RequestAbsenceOrderBy;
    orderDirection?: ORDER_DIRECTION;
    keyword?: string;
    startAt?: Date[] | string[];
    endAt?: Date[] | string[];
    userId?: number;
    status?: RequestAbsenceStatus[];
}
