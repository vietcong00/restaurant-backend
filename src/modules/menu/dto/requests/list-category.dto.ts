import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import {
    INPUT_TEXT_MAX_LENGTH,
    MAX_PAGE,
    MAX_PAGE_SIZE,
    MIN_PAGE,
    MIN_PAGE_SIZE,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { CategoryOrderBy } from '../../category.constant';

export const CategoryListQueryStringSchema = Joi.object().keys({
    page: Joi.number().max(MAX_PAGE).allow(null, '').min(MIN_PAGE).optional(),
    limit: Joi.number()
        .max(MAX_PAGE_SIZE)
        .allow(null, '')
        .min(MIN_PAGE_SIZE)
        .optional(),
    keyword: Joi.string().allow(null, '').max(INPUT_TEXT_MAX_LENGTH).optional(),
    orderBy: Joi.string()
        .allow(null, '')
        .optional()
        .valid(...Object.values(CategoryOrderBy)),
    orderDirection: Joi.string()
        .allow(null, '')
        .valid(...Object.values(ORDER_DIRECTION))
        .optional(),
});

export interface CategoryListQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: string;
    orderDirection?: ORDER_DIRECTION;
}
