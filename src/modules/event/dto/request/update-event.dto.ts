import * as Joi from 'joi';
import { EventSchema, EventStatus } from '../../event.constant';

export const UpdateEventSchema = Joi.object().keys({
    ...EventSchema,
});

export const UpdateEventStatusSchema = Joi.object().keys({
    status: Joi.string()
        .valid(...Object.values(EventStatus))
        .required()
        .label('event.fields.status'),
});

export class UpdateEventDto {
    title: string;
    description?: string;
    status: EventStatus;
    startDate: Date;
    endDate: Date;
    imageUrl: string;
    userQuantity?: number;
    budget?: number;
    updatedBy: number;
}

export class UpdateEventStatusDto {
    status: EventStatus;
    updatedBy: number;
}
