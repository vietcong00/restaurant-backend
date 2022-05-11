import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import { BillingSchema } from '../../billing.constant';
export interface CreateBillingDto {
    name: string;
    description?: string;
    url: string;
    payerId: number;
    payDate: Date;
    createdBy: number;
}

export const CreateBillingSchema = Joi.object().keys({
    ...BillingSchema,
});
