import {
    DATE_TIME_FORMAT,
    INPUT_TEXT_MAX_LENGTH,
    MAX_PAGE,
    MAX_PAGE_SIZE,
    MIN_PAGE,
    MIN_PAGE_SIZE,
    ORDER_DIRECTION,
} from 'src/common/constants';
import {
    CandidateGender,
    CandidateOrderBy,
    CandidateResource,
    CandidateStatus,
} from '../../recruitment.constant';
import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

export const CandidateListQueryStringSchema = Joi.object().keys({
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional(),
    limit: Joi.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).optional(),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional(),
    orderBy: Joi.string()
        .valid(...Object.values(CandidateOrderBy))
        .optional(),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional(),
    genders: Joi.array()
        .items(Joi.string().valid(...Object.values(CandidateGender)))
        .optional(),
    statuses: Joi.array()
        .items(Joi.string().valid(...Object.values(CandidateStatus)))
        .optional(),
    referredSources: Joi.array()
        .items(Joi.string().valid(...Object.values(CandidateResource)))
        .optional(),
    interviewAt: Joi.array()
        .items(Joi.date().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN))
        .optional(),
    positions: Joi.array().items(Joi.string().optional()).optional(),
});

export class CandidateListQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: string;
    orderDirection?: ORDER_DIRECTION;
    genders?: CandidateGender[];
    statuses?: CandidateStatus[];
    referredSources?: CandidateResource[];
    interviewAt?: (Date | string)[];
    positions?: number[];
}
