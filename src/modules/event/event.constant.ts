import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import {
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
    MAX_INTEGER,
    INPUT_URL_MAX_LENGTH,
} from '../../common/constants';
const Joi = BaseJoi.extend(JoiDate);
export enum EventStatus {
    INCOMING = 'incoming',
    INPROGRESS = 'inprogress',
    EXPIRED = 'expired',
}

export const MODULE_NAME = 'event';

export enum EventOrderBy {
    CREATED_AT = 'createdAt',
    TITLE = 'title',
    START = 'start',
    STATUS = 'status',
    USER_QUANTITY = 'userQuantity',
}

export const EventSchema = {
    title: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('event.fields.title'),
    description: Joi.string()
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .allow('', null)
        .label('event.fields.desc'),
    startDate: Joi.date().required().label('event.fields.startDate'),
    endDate: Joi.date()
        .required()
        .min(Joi.ref('startDate'))
        .allow(null)
        .optional()
        .label('event.fields.endDate'),
    imageUrl: Joi.string()
        .max(INPUT_URL_MAX_LENGTH)
        .required()
        .label('event.fields.img'),
    userQuantity: Joi.number()
        .min(0)
        .max(MAX_INTEGER)
        .optional()
        .allow(null)
        .label('event.fields.userQuantity'),
    budget: Joi.number()
        .min(0)
        .max(MAX_INTEGER)
        .optional()
        .allow(null)
        .label('event.fields.budget'),
};
