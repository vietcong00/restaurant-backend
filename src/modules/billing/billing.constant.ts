import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import {
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
    REGEX,
    INPUT_URL_MAX_LENGTH,
    MAX_INTEGER,
    DATE_TIME_FORMAT,
} from 'src/common/constants';

const Joi = BaseJoi.extend(JoiDate);

export enum BillingOrderBy {
    NAME = 'name',
    CREATED_AT = 'createdAt',
}
export const BillingSchema = {
    name: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('billing.fields.name'),
    description: Joi.string()
        .allow(null, '')
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .label('billing.fields.description'),
    url: Joi.string()
        .regex(REGEX.URL)
        .max(INPUT_URL_MAX_LENGTH)
        .label('billing.fields.url')
        .required(),
    payerId: Joi.number()
        .required()
        .positive()
        .max(MAX_INTEGER)
        .label('billing.fields.userId'),
    payDate: Joi.date()
        .max('now')
        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
        .required()
        .label('billing.fields.payDate'),
};
