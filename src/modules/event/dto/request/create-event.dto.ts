import * as Joi from 'joi';
import { EventSchema, EventStatus } from '../../event.constant';

export const CreateEventSchema = Joi.object().keys({
    ...EventSchema,
});

export class CreateEventDto {
    title: string;
    description?: string;
    status: EventStatus;
    startDate: Date;
    endDate: Date;
    imageUrl: string;
    userQuantity?: number;
    budget?: number;
    createdBy: number;
}
