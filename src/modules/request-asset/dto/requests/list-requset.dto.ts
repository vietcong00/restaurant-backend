import {
    INPUT_TEXT_MAX_LENGTH,
    MAX_PAGE,
    MAX_PAGE_SIZE,
} from '../../../../common/constants';
import { MIN_PAGE_SIZE, MIN_PAGE } from '../../../../common/constants';
import {
    AssetType,
    RequestAssetOrderBy,
    RequestAssetStatus,
} from '../../request-asset.constant';
import { ORDER_DIRECTION } from 'src/common/constants';
import * as Joi from 'joi';

export const RequestListQueryStringSchema = Joi.object().keys({
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional(),
    limit: Joi.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).optional(),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).allow('', null).optional(),
    orderBy: Joi.string()
        .optional()
        .valid(...Object.values(RequestAssetOrderBy)),
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
    status: Joi.array()
        .items(Joi.string().valid(...Object.values(RequestAssetStatus)))
        .optional(),
});
export class RequestAssetQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: RequestAssetOrderBy;
    orderDirection?: ORDER_DIRECTION;
    categories?: string[];
    types?: AssetType[];
    status?: RequestAssetStatus[];
}
