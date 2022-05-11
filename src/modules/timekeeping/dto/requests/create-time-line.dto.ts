import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import { MAX_INTEGER } from 'src/common/constants';

const Joi = BaseJoi.extend(JoiDate);

export const TimekeepingSchema = {
    checkIn: Joi.date().label('timekeeping.fields.startAt'),
    checkOut: Joi.date()
        .greater(Joi.ref('checkIn'))
        .label('timekeeping.fields.endAt'),
    dateScan: Joi.date().label('timekeeping.fields.dateScan'),
};

export const CreateTimekeepingSchema = Joi.object().keys({
    ...TimekeepingSchema,
    userId: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .label('timekeeping.fields.userId'),
});

export const UpdateTimekeepingSchema = Joi.object().keys({
    ...TimekeepingSchema,
    userId: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .label('timekeeping.fields.userId'),
});
export class TimekeepingDto {
    checkIn?: string;
    checkOut?: string;
    dateScan?: string;
    userId?: number;
}
