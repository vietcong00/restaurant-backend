import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

import { BillingSchema } from '../../billing.constant';

export const UpdateBillingSchema = Joi.object().keys({
    ...BillingSchema,
});

export interface UpdateBillingDto {
    name: string;
    description?: string;
    url: string;
    payerId: number;
    payDate: Date;
    updatedBy: number;
}
