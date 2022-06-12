import { MAX_INTEGER } from '../../../common/constants';
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
import { AcceptStatus, OrderBy } from '../import_material_order.constant';

export const ImportMaterialOrderListQueryStringSchema = Joi.object().keys({
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional(),
    limit: Joi.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).optional(),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    orderBy: Joi.string()
        .optional()
        .allow(null, '')
        .valid(...Object.values(OrderBy)),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional()
        .allow(null, ''),
    importMaterialId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
});

export const ImportMaterialOrderSchema = {
    materialId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    pricePerUnit: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    quantity: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    note: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    importMaterialId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    status: Joi.string()
        .valid(...Object.values(AcceptStatus))
        .optional()
        .allow(null, ''),
};

export const CreateImportMaterialOrderSchema = Joi.object().keys({
    ...ImportMaterialOrderSchema,
});

export const UpdateImportMaterialOrderSchema = Joi.object().keys({
    ...ImportMaterialOrderSchema,
});

export class ImportMaterialOrderQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: OrderBy;
    orderDirection?: ORDER_DIRECTION;
    importMaterialId?: number;
}

export class CreateImportMaterialOrderDto {
    materialId: number;
    pricePerUnit: number;
    quantity: number;
    note: string;
    importMaterialId: number;
    status: AcceptStatus;
    createdBy?: number;
}

export class UpdateImportMaterialOrderDto {
    status?: AcceptStatus;
    updatedBy?: number;
}

export class ImportMaterialOrderDetailResponseDto {
    id: number;
    materialId: number;
    pricePerUnit: number;
    quantity: number;
    note: string;
    importMaterialId: number;
    status: AcceptStatus;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
