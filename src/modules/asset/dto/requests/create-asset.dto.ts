import { AssetType, UsingStatus } from '../../asset.constant';
import {
    DATE_TIME_FORMAT,
    INPUT_TEXT_MAX_LENGTH,
    MAX_INTEGER,
    REGEX,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';
import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

export const CreateAssetSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    description: Joi.string()
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .allow(null, ''),
    category: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    type: Joi.string()
        .valid(...Object.values(AssetType))
        .required(),
    usingStatus: Joi.string()
        .valid(...Object.values(UsingStatus))
        .required(),
    price: Joi.number().positive().max(MAX_INTEGER).required(),
    code: Joi.string().when('isAutoGenerateCode', [
        { is: false, then: Joi.required() },
        { is: true, then: Joi.optional().allow(null, '') },
    ]),
    assigneeId: Joi.number().positive().max(MAX_INTEGER).required(),
    requestAssetId: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .optional()
        .allow(null),
    isAutoGenerateCode: Joi.boolean().required(),
    purchaseDate: Joi.date()
        .max('now')
        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
        .required(),
});

export const ImportAssetSchema = Joi.object().keys({
    importAssets: Joi.array()
        .items(
            Joi.object().keys({
                index: Joi.number().min(0).max(MAX_INTEGER).required(),
                assetName: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
                description: Joi.string()
                    .max(TEXTAREA_MAX_LENGTH)
                    .optional()
                    .allow(null, ''),
                category: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
                type: Joi.string()
                    .valid(...Object.values(AssetType))
                    .required(),
                usingStatus: Joi.string()
                    .valid(...Object.values(UsingStatus))
                    .required(),
                price: Joi.number().positive().max(MAX_INTEGER).required(),
                code: Joi.string().optional().allow(null, ''),
                assigneeEmail: Joi.string()
                    .regex(REGEX.EMAIL)
                    .max(INPUT_TEXT_MAX_LENGTH)
                    .required(),
                purchaseDate: Joi.date()
                    .max('now')
                    .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                    .required(),
            }),
        )
        .unique('code', { ignoreUndefined: true }),
});
export class CreateAssetDto {
    name: string;
    requestAssetId?: number;
    description?: string;
    category: string;
    type!: AssetType;
    code!: string;
    usingStatus: UsingStatus;
    price: string;
    assigneeId: number;
    isAutoGenerateCode?: boolean;
    createdBy: number;
    purchaseDate: Date;
}

export interface ImportAssetDto {
    index: number;
    assetName: string;
    type: AssetType;
    usingStatus: UsingStatus;
    category: string;
    createdAt: string;
    description: string;
    price: string;
    assigneeEmail: string;
    code: string;
    assigneeId: number;
    purchaseDate: Date;
}

export interface ImportAssetsDto {
    importAssets: ImportAssetDto[];
}
