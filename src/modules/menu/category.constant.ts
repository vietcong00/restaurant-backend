import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import {
    INPUT_TEXT_MAX_LENGTH,
    MAX_INTEGER,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';

const Joi = BaseJoi.extend(JoiDate);

export enum CategoryOrderBy {
    NAME = 'name',
    CREATED_AT = 'createdAt',
}

export const CategorySchema = {
    name: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('category.fields.name'),
    note: Joi.string()
        .allow(null, '')
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .label('category.fields.note'),
    priority: Joi.number()
        .min(0)
        .max(MAX_INTEGER)
        .optional()
        .allow(null)
        .label('category.fields.priority'),
};
