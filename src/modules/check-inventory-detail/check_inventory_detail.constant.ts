import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';

const Joi = BaseJoi.extend(JoiDate);

export const MODULE_NAME = 'export-material-order';

export enum OrderBy {
    CREATED_AT = 'createdAt',
}

export enum AcceptStatus {
    APPROVE = 'APPROVE',
    WAITING_APPROVE = 'WAITING_APPROVE',
    REQUEST_CHECK_AGAIN = 'REQUEST_CHECK_AGAIN',
    CHECKED_AGAIN = 'CHECKED_AGAIN',
}
