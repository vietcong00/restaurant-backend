import { AssetType, RequestAssetStatus } from '../../request-asset.constant';
import * as Joi from 'joi';
import { MAX_REQUEST_QUANTITY } from '../../request-asset.constant';
import {
    INPUT_TEXT_MAX_LENGTH,
    MAX_INTEGER,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';

export const UpdateRequestAssetSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional(),
    requestQuantity: Joi.number()
        .positive()
        .max(MAX_REQUEST_QUANTITY)
        .optional(),
    approveQuantity: Joi.number()
        .positive()
        .max(MAX_REQUEST_QUANTITY)
        .optional(),
    description: Joi.string()
        .allow(null, '')
        .max(TEXTAREA_MAX_LENGTH)
        .optional(),
    category: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional(),
    type: Joi.string()
        .valid(...Object.values(AssetType))
        .optional()
        .allow(null),
    price: Joi.number().positive().max(MAX_INTEGER).required(),
    status: Joi.string().valid(...Object.values(RequestAssetStatus)),
});

export const UpdateStatusSchema = Joi.object().keys({
    status: Joi.string().valid(...Object.values(RequestAssetStatus)),
    approveQuantity: Joi.number()
        .positive()
        .max(MAX_REQUEST_QUANTITY)
        .optional(),
});

export class UpdateRequestAssetDto {
    name: string;
    requestQuantity: number;
    approveQuantity: number;
    description: string;
    category: string;
    type: AssetType;
    price: string;
    status: RequestAssetStatus;
    updatedBy: number;
}

export class UpdateStatusDto {
    status: RequestAssetStatus;
    updatedBy: number;
    approveQuantity: number;
}
