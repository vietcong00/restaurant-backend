import { SHIFT } from './../closing_revenue.constant';
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
import { OrderBy } from '../closing_revenue.constant';

export const ClosingRevenueListQueryStringSchema = Joi.object().keys({
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
});

export const ClosingRevenueSchema = {
    shift: Joi.string()
        .valid(...Object.values(SHIFT))
        .optional()
        .allow(null, ''),
    shiftLeaderId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    cashAtBeginningOfShift: Joi.number()
        .max(MAX_INTEGER)
        .optional()
        .allow(null, ''),
    cashAtEndingOfShift: Joi.number()
        .max(MAX_INTEGER)
        .optional()
        .allow(null, ''),
    bankingRevenue: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    differenceRevenue: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    note: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
};

export const CreateClosingRevenueSchema = Joi.object().keys({
    ...ClosingRevenueSchema,
});

export const UpdateClosingRevenueSchema = Joi.object().keys({
    ...ClosingRevenueSchema,
});

export class ClosingRevenueQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: OrderBy;
    orderDirection?: ORDER_DIRECTION;
}

export class CreateClosingRevenueDto {
    shift: SHIFT;
    shiftLeaderId: number;
    cashAtBeginningOfShift: number;
    cashAtEndingOfShift: number;
    bankingRevenue: number;
    differenceRevenue: number;
    note: string;
    createdBy?: number;
}

export class UpdateClosingRevenueDto {
    shift: SHIFT;
    shiftLeaderId: number;
    cashAtBeginningOfShift: number;
    cashAtEndingOfShift: number;
    bankingRevenue: number;
    differenceRevenue: number;
    note: string;
    updatedBy?: number;
}

export class ClosingRevenueDetailResponseDto {
    id: number;
    shift: SHIFT;
    shiftLeaderId: number;
    cashAtBeginningOfShift: number;
    cashAtEndingOfShift: number;
    bankingRevenue: number;
    differenceRevenue: number;
    note: string;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
