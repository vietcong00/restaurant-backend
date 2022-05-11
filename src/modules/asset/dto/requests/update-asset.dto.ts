import { AssetType, UsingStatus } from '../../asset.constant';
import {
    DATE_TIME_FORMAT,
    INPUT_TEXT_MAX_LENGTH,
    MAX_INTEGER,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';
import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

export const UpdateAssetSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    description: Joi.string()
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .allow(null, ''),
    category: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    type: Joi.string()
        .valid(...Object.values(AssetType))
        .optional()
        .required(),
    usingStatus: Joi.string()
        .valid(...Object.values(UsingStatus))
        .required(),
    price: Joi.number().positive().max(MAX_INTEGER).required(),
    assigneeId: Joi.number().positive().max(MAX_INTEGER).required(),
    purchaseDate: Joi.date()
        .max('now')
        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
        .required(),
});
export class UpdateAssetDto {
    name: string;
    description?: string;
    category: string;
    type: AssetType;
    usingStatus: UsingStatus;
    price: string;
    assigneeId: number;
    purchaseDate: Date;
    updatedBy: number;
}
