import {
    CreateCandidateDto,
    CreateCandidateInterviewDto,
} from './create-candidate.dto';

import {
    CandidateFields,
    CandidateEmailsFields,
    CandidateStatus,
    CandidateInterviewProgress,
} from '../../recruitment.constant';
import {
    DATE_TIME_FORMAT,
    INPUT_PHONE_MAX_LENGTH,
    INPUT_TEXT_MAX_LENGTH,
    REGEX,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';

import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

export const UpdateCandidateSchema = Joi.object().keys({
    ...CandidateFields,
    fullName: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .label('recruitment.fields.fullName'),
    email: Joi.string()
        .regex(REGEX.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .label('recruitment.fields.email'),
    phoneNumber: Joi.string()
        .regex(REGEX.PHONE_NUMBER)
        .max(INPUT_PHONE_MAX_LENGTH)
        .optional()
        .label('recruitment.fields.phoneNumber'),
});

export const UpdateCandidateStatusSchema = Joi.object().keys({
    status: Joi.string()
        .valid(...Object.values(CandidateStatus))
        .label('recruitment.fields.status'),
    note: Joi.string()
        .max(TEXTAREA_MAX_LENGTH)
        .allow(null, '')
        .optional()
        .label('recruitment.fields.note'),
});

export const UpdateCandidateInterviewsSchema = Joi.object().keys({
    interviewAt: Joi.date()
        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
        .label('recruitment.fields.candidateInterview.dateTime'),
    note: Joi.string()
        .allow(null)
        .allow('')
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .label('recruitment.fields.candidateInterview.note'),
    progress: Joi.string()
        .allow(null)
        .allow('')
        .valid(...Object.values(CandidateInterviewProgress))
        .label('recruitment.fields.candidateInterview.progress'),
});

const temp = { ...CandidateEmailsFields };
delete temp.dateTime;
export const UpdateCandidateEmailsSchema = Joi.object().keys(temp);

export class UpdateCandidateInterviewDto extends CreateCandidateInterviewDto {
    updatedBy: number;
}

export class UpdateCandidateEmailDto {
    note: string;
    updatedBy: number;
}

export class UpdateCandidateDto extends CreateCandidateDto {
    updatedBy: number;
}
export interface UpdateCandidateStatusDto {
    status: CandidateStatus;
    note: string;
    updatedBy: number;
}
