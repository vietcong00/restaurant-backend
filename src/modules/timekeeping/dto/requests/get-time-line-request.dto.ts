import {
    INPUT_TEXT_MAX_LENGTH,
    MAX_LENGTH_MONTH,
    MIN_LENGTH_MONTH,
    MIN_PAGE_SIZE,
    MIN_PAGE,
    ORDER_DIRECTION,
    MAX_PAGE,
    MAX_PAGE_SIZE,
    MAX_INTEGER,
    DATE_TIME_FORMAT,
} from '../../../../common/constants';

import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import { UserStatus } from 'src/modules/user/user.constant';
import { TimekeepingOrderBy } from '../../timekeeping.constant';

const Joi = BaseJoi.extend(JoiDate);

export const TimekeepingListQueryStringSchema = Joi.object().keys({
    page: Joi.number()
        .optional()
        .min(MIN_PAGE)
        .max(MAX_PAGE)
        .label('timekeeping.fields.page'),
    limit: Joi.number()
        .min(MIN_PAGE_SIZE)
        .max(MAX_PAGE_SIZE)
        .optional()
        .label('timekeeping.fields.limit'),
    keyword: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .label('timekeeping.fields.keyword'),
    month: Joi.string()
        .min(MIN_LENGTH_MONTH)
        .max(MAX_LENGTH_MONTH)
        .optional()
        .label('timekeeping.fields.keyword'),
    startAt: Joi.date()
        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
        .optional()
        .label('timekeeping.fields.startAt'),
    endAt: Joi.date()
        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
        .optional()
        .label('timekeeping.fields.endAt'),
    orderBy: Joi.string()
        .valid(...Object.values(TimekeepingOrderBy))
        .optional()
        .label('timekeeping.fields.orderBy'),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional()
        .label('timekeeping.fields.orderDirection'),
    userId: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .optional()
        .label('timekeeping.fields.orderDirection'),
    statuses: Joi.array()
        .items(
            Joi.string().valid(
                UserStatus.ACTIVE,
                UserStatus.INACTIVE,
                UserStatus.WAITING_FOR_APPROVAL,
            ),
        )
        .optional(),
});
export class TimekeepingListQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    month?: string;
    startAt?: string;
    endAt?: string;
    orderBy?: TimekeepingOrderBy;
    orderDirection?: ORDER_DIRECTION;
    userId?: number;
    statuses?: UserStatus[];
}
