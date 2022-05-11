import {
    CandidateFields,
    CandidateInterviewProgress,
    CandidateInterviewsFields,
    CandidateEmailsFields,
    CandidateStatus,
    EMAIL_TEMPLATE_TYPE,
} from './../../recruitment.constant';
import {
    CandidateGender,
    CandidateLevel,
    CandidateResource,
} from '../../recruitment.constant';

import {
    DATE_TIME_FORMAT,
    INPUT_TEXT_MAX_LENGTH,
    MAX_INTEGER,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';

import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

export const CreateCandidateSchema = Joi.object().keys({
    ...CandidateFields,
});

export const CreateCandidateInterviewsSchema = Joi.object().keys({
    ...CandidateInterviewsFields,
});

export const CreateCandidateEmailsSchema = Joi.object().keys({
    candidateId: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .required()
        .label('recruitment.fields.candidateEmail.candidateId'),
    ...CandidateEmailsFields,
});

export const sendingTemplateSchema = Joi.object().keys({
    to: Joi.string().max(TEXTAREA_MAX_LENGTH).email().required(),
    from: Joi.string().max(TEXTAREA_MAX_LENGTH).email().required(),
    templateType: Joi.string()
        .valid(...Object.values(EMAIL_TEMPLATE_TYPE))
        .required(),
    candidateId: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .required()
        .label('recruitment.fields.candidateInterview.candidateId'),
    note: Joi.string()
        .allow(null)
        .allow('')
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .label('recruitment.fields.candidateInterview.note'),
    templateName: Joi.string()
        .allow(null)
        .allow('')
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .label('recruitment.fields.candidateInterview.note'),
    dynamicTemplateData: Joi.object().keys({
        subject: Joi.string().max(INPUT_TEXT_MAX_LENGTH).allow(''),
        fullName: Joi.string().max(INPUT_TEXT_MAX_LENGTH).allow('').optional(),
        startWorkingDate: Joi.date()
            .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
            .allow('')
            .optional(),
        expiredReplyDate: Joi.date()
            .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
            .allow('')
            .optional(),
        appliedPosition: Joi.string()
            .max(INPUT_TEXT_MAX_LENGTH)
            .allow('')
            .optional(),
        interviewAt: Joi.string()
            .max(INPUT_TEXT_MAX_LENGTH)
            .allow('')
            .optional(),
        attachment: Joi.string().allow(null).allow('').optional(),
        attachmentName: Joi.string()
            .max(INPUT_TEXT_MAX_LENGTH)
            .allow(null)
            .allow('')
            .optional(),
    }),
});

export class CreateCandidateInterviewDto {
    candidateId: number;
    interviewAt: string;
    note: string;
    progress: CandidateInterviewProgress;
    order: number;
    createdBy: number;
}

export class CreateCandidateEmailDto {
    candidateId: number;
    template: string;
    note: string;
    createdBy: number;
    dateTime?: string;
}

export class CreateCandidateDto {
    fullName: string;
    email: string;
    phoneNumber: string;
    birthday: Date;
    cvFileId: number;
    gender: CandidateGender;
    appliedPosition: string;
    level: CandidateLevel;
    resource: CandidateResource;
    status: CandidateStatus;
    note: string;
    avatarId: number;
    createdBy: number;
}

class DynamicTemplateData {
    subject?: string;
    name?: string;
    city?: string;
    attachment?: string;
    attachmentName?: string;
    fullName?: string;
    startWorkingDate?: string;
    expiredReplyDate?: string;
    appliedPosition?: string;
    interviewAt?: string;
}

export class CreateSendGridEmailDto {
    to: string;
    from: string;
    templateType: EMAIL_TEMPLATE_TYPE;
    dynamicTemplateData: DynamicTemplateData;
    candidateId: number;
    templateName: string;
    note: string;
}

export class CreateCandidateInterviewHistoryDto {
    status: CandidateStatus;
    note: string;
    candidateId: number;
    createdBy: number;
}
