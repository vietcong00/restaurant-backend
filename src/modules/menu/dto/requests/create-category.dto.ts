import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import { CategorySchema } from '../../category.constant';
export interface CreateCategoryDto {
    name: string;
    priority: number;
    note: string;
    createdBy: number;
}

export const CreateCategorySchema = Joi.object().keys({
    ...CategorySchema,
});
