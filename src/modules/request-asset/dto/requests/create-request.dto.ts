import { AssetType } from '../../request-asset.constant';
import * as Joi from 'joi';
import { MAX_REQUEST_QUANTITY } from '../../request-asset.constant';
import {
    INPUT_TEXT_MAX_LENGTH,
    MAX_INTEGER,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';

export const CreateRequestAssetSchema = Joi.object({
    type: String,
    example: 'laptop',
}).keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    requestQuantity: Joi.number()
        .positive()
        .max(MAX_REQUEST_QUANTITY)
        .optional(),
    description: Joi.string()
        .allow('', null)
        .max(TEXTAREA_MAX_LENGTH)
        .optional(),
    category: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    type: Joi.string()
        .valid(...Object.values(AssetType))
        .required(),
    price: Joi.number().positive().max(MAX_INTEGER).required(),
});
export class CreateRequestAssetDto {
    name: string;
    requestQuantity: number;
    description: string;
    category: string;
    type: AssetType;
    price: string;
    createdBy: number;
}
