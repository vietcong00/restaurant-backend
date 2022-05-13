import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

import { CategorySchema } from '../../category.constant';

export const UpdateCategorySchema = Joi.object().keys({
    ...CategorySchema,
});

export interface UpdateCategoryDto {
    name: string;
    priority: number;
    note: string;
    updatedBy: number;
}
