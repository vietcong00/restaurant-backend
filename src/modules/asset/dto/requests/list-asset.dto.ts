import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import {
    DATE_TIME_FORMAT,
    INPUT_TEXT_MAX_LENGTH,
    MAX_INTEGER,
    MAX_PAGE,
    MAX_PAGE_SIZE,
} from '../../../../common/constants';
import { MIN_PAGE_SIZE, MIN_PAGE } from '../../../../common/constants';
import { AssetOrderBy, AssetType, UsingStatus } from '../../asset.constant';
import { ORDER_DIRECTION } from 'src/common/constants';

export const AssetListQueryStringSchema = Joi.object().keys({
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional(),
    limit: Joi.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).optional(),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).allow('', null).optional(),
    orderBy: Joi.string()
        .optional()
        .valid(...Object.values(AssetOrderBy)),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional(),
    categories: Joi.array()
        .items(Joi.string().max(INPUT_TEXT_MAX_LENGTH))
        .optional()
        .allow(null),
    types: Joi.array()
        .items(Joi.string().valid(...Object.values(AssetType)))
        .optional()
        .allow(null),
    usingStatus: Joi.array()
        .items(Joi.string().valid(...Object.values(UsingStatus)))
        .optional()
        .allow(null),
    assigneeIds: Joi.array()
        .items(Joi.number().positive().max(MAX_INTEGER))
        .optional()
        .allow(null),
    purchaseDateRange: Joi.array()
        .items(Joi.date().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN))
        .optional()
        .length(2)
        .allow('')
        .label('billing.fields.payDate'),
});
export class AssetQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: AssetOrderBy;
    orderDirection?: ORDER_DIRECTION;
    categories?: string[];
    assigneeIds?: number[];
    types?: AssetType[];
    usingStatus?: UsingStatus[];
    purchaseDateRange?: Date;
}
