import {
    INPUT_MIN_DATE,
    DATE_TIME_FORMAT,
    INPUT_PHONE_MAX_LENGTH,
    INPUT_TEXT_MAX_LENGTH,
    MAX_INTEGER,
    REGEX,
    TEXTAREA_MAX_LENGTH,
} from '../../common/constants';
import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('dotenv').config();

export const SENDGRID_SEND_MAIL_SUCCESS_CODE = 202;

export enum CandidateStatus {
    CV_REVIEWING = 'cv_reviewing',
    CV_APPROVED = 'cv_approved',
    WAITING_REPLY_FIRST_INTERVIEW = 'waiting_reply_first_interview',
    FIRST_INTERVIEW = 'first_interview',
    WAITING_REPLY_SECOND_INTERVIEW = 'waiting_reply_second_interview',
    SECOND_INTERVIEW = 'second_interview',
    ELECTED = 'elected',
    WAITING_REPLY_OFFER = 'waiting_reply_offer',
    CANDIDATE_AGREE = 'candidate_agree',
    ONBOARD = 'onboard',
    NOT_ONBOARD = 'not_onboard',
    CANDIDATE_REJECT = 'candidate_reject',
    CV_REJECTED = 'cv_rejected',
    INTERVIEW_FAIL = 'interview_fail',
    CANDIDATE_CANCEL = 'candidate_cancel',
}

export enum CandidateLevel {
    Internship = 'internship',
    Fresher = 'fresher',
    Middle = 'middle',
    Junior = 'junior',
    Senior = 'senior',
    Leader = 'leader',
    Expert = 'expert',
}

export enum CandidateResource {
    HumanResources = 'humanResources',
    InternalIntroduction = 'internalIntroduction',
    HeadHunter = 'headHunter',
}

export enum RecruitmentOrderBy {
    CreatedAt = 'createdAt',
    FullName = 'fullName',
    Status = 'status',
}

export enum CandidateGender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export enum CandidateInterviewProgress {
    Waiting = 'waiting',
    Done = 'done',
    Cancel = 'cancel',
}

export const CandidateStatusChangingFlow = {
    [CandidateStatus.CV_REVIEWING]: [
        CandidateStatus.CV_APPROVED,
        CandidateStatus.CANDIDATE_REJECT,
        CandidateStatus.CV_REJECTED,
    ],
    [CandidateStatus.CV_APPROVED]: [
        CandidateStatus.WAITING_REPLY_FIRST_INTERVIEW,
        CandidateStatus.CANDIDATE_REJECT,
    ],
    [CandidateStatus.WAITING_REPLY_FIRST_INTERVIEW]: [
        CandidateStatus.FIRST_INTERVIEW,
        CandidateStatus.CANDIDATE_REJECT,
    ],
    [CandidateStatus.FIRST_INTERVIEW]: [
        CandidateStatus.ELECTED,
        CandidateStatus.WAITING_REPLY_SECOND_INTERVIEW,
        CandidateStatus.INTERVIEW_FAIL,
        CandidateStatus.CANDIDATE_CANCEL,
    ],
    [CandidateStatus.WAITING_REPLY_SECOND_INTERVIEW]: [
        CandidateStatus.SECOND_INTERVIEW,
        CandidateStatus.CANDIDATE_REJECT,
    ],
    [CandidateStatus.SECOND_INTERVIEW]: [
        CandidateStatus.ELECTED,
        CandidateStatus.CANDIDATE_CANCEL,
        CandidateStatus.INTERVIEW_FAIL,
    ],
    [CandidateStatus.ELECTED]: [CandidateStatus.WAITING_REPLY_OFFER],
    [CandidateStatus.WAITING_REPLY_OFFER]: [
        CandidateStatus.CANDIDATE_AGREE,
        CandidateStatus.CANDIDATE_REJECT,
    ],
    [CandidateStatus.CANDIDATE_AGREE]: [
        CandidateStatus.ONBOARD,
        CandidateStatus.NOT_ONBOARD,
    ],
    [CandidateStatus.CANDIDATE_REJECT]: [],
    [CandidateStatus.CV_REJECTED]: [],
    [CandidateStatus.INTERVIEW_FAIL]: [],
    [CandidateStatus.ONBOARD]: [],
    [CandidateStatus.NOT_ONBOARD]: [],
};

export const CandidateFields = {
    fullName: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('recruitment.fields.fullName'),
    email: Joi.string()
        .regex(REGEX.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('recruitment.fields.email'),
    phoneNumber: Joi.string()
        .regex(REGEX.PHONE_NUMBER)
        .max(INPUT_PHONE_MAX_LENGTH)
        .required()
        .label('recruitment.fields.phoneNumber'),
    birthday: Joi.date()
        .allow(null, '')
        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
        .min(INPUT_MIN_DATE)
        .less('now')
        .label('recruitment.fields.birthday'),
    cvFileId: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .required()
        .label('recruitment.fields.cvLink'),
    gender: Joi.string()
        .allow(null)
        .valid(...Object.values(CandidateGender))
        .optional()
        .label('recruitment.fields.gender'),
    appliedPosition: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('recruitment.fields.appliedPosition'),
    level: Joi.string()
        .allow(null)
        .valid(...Object.values(CandidateLevel))
        .optional()
        .label('recruitment.fields.level'),
    resource: Joi.string()
        .allow(null)
        .valid(...Object.values(CandidateResource))
        .optional()
        .label('recruitment.fields.resource'),
    status: Joi.string()
        .allow(null)
        .valid(...Object.values(CandidateStatus))
        .optional()
        .label('recruitment.fields.status'),
    note: Joi.string()
        .max(TEXTAREA_MAX_LENGTH)
        .allow(null, '')
        .optional()
        .label('recruitment.fields.note'),
    avatarId: Joi.number()
        .allow(null)
        .optional()
        .positive()
        .max(MAX_INTEGER)
        .label('recruitment.fields.avatarId'),
};

export const CandidateInterviewsFields = {
    candidateId: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .required()
        .label('recruitment.fields.candidateInterview.candidateId'),
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
        .required()
        .valid(...Object.values(CandidateInterviewProgress))
        .label('recruitment.fields.candidateInterview.progress'),
};

export const CandidateEmailsFields = {
    template: Joi.string()
        .allow(null)
        .optional()
        .label('recruitment.fields.candidateEmail.template'),
    dateTime: Joi.date()
        .allow(null)
        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
        .optional()
        .label('recruitment.fields.candidateEmail.dateTime'),
    note: Joi.string()
        .allow(null)
        .allow('')
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .label('recruitment.fields.candidateEmail.note'),
};

export enum EMAIL_TEMPLATE_TYPE {
    INVITE_INTERVIEW_LETTER = 'INVITE_INTERVIEW_LETTER',
    INTERVIEW_FAIL_LETTER = 'INTERVIEW_FAIL_LETTER',
    REJECT_CV_LETTER = 'REJECT_CV_LETTER',
    OFFER_LETTER_FOR_NONE_INTERNSHIP = 'OFFER_LETTER_FOR_NONE_INTERNSHIP',
    OFFER_LETTER_FOR_INTERNSHIP = 'OFFER_LETTER_FOR_INTERNSHIP',
}

export const SendgridTemplateList = [
    {
        templateType: EMAIL_TEMPLATE_TYPE.OFFER_LETTER_FOR_NONE_INTERNSHIP,
        sendgridTemplateId:
            config.parsed.SENDGRID_TEMPATE_ID_OFFER_LETTER_FOR_NONE_INTERNSHIP,
        sendgridVersionId:
            config.parsed.SENDGRID_VERSION_ID_OFFER_LETTER_FOR_NONE_INTERNSHIP,
        subject: 'recruitment.template.jobOfferLetter',
        nextStatus: CandidateStatus.WAITING_REPLY_OFFER,
        beforeStatus: [CandidateStatus.ELECTED],
        sender: config.parsed.SENDGRID_SENDER_EMAIL,
    },
    {
        templateType: EMAIL_TEMPLATE_TYPE.REJECT_CV_LETTER,
        sendgridTemplateId: config.parsed.SENDGRID_TEMPATE_ID_REJECT_CV_LETTER,
        sendgridVersionId: config.parsed.SENDGRID_VERSION_ID_REJECT_CV_LETTER,
        subject: 'recruitment.template.rejectCandidateLetter',
        nextStatus: CandidateStatus.CV_REJECTED,
        beforeStatus: [CandidateStatus.CV_REVIEWING],
        sender: config.parsed.SENDGRID_SENDER_EMAIL,
    },
    {
        templateType: EMAIL_TEMPLATE_TYPE.INTERVIEW_FAIL_LETTER,
        sendgridTemplateId:
            config.parsed.SENDGRID_TEMPATE_ID_INTERVIEW_FAIL_LETTER,
        sendgridVersionId:
            config.parsed.SENDGRID_VERSION_ID_INTERVIEW_FAIL_LETTER,
        subject: 'recruitment.template.rejectCandidateLetter',
        nextStatus: CandidateStatus.INTERVIEW_FAIL,
        beforeStatus: [
            CandidateStatus.FIRST_INTERVIEW,
            CandidateStatus.SECOND_INTERVIEW,
        ],
        sender: config.parsed.SENDGRID_SENDER_EMAIL,
    },
    {
        templateType: EMAIL_TEMPLATE_TYPE.OFFER_LETTER_FOR_INTERNSHIP,
        sendgridTemplateId:
            config.parsed.SENDGRID_TEMPATE_ID_OFFER_LETTER_FOR_INTERNSHIP,
        sendgridVersionId:
            config.parsed.SENDGRID_VERSION_ID_OFFER_LETTER_FOR_INTERNSHIP,
        subject: 'recruitment.template.jobOfferLetter',
        nextStatus: CandidateStatus.WAITING_REPLY_OFFER,
        beforeStatus: [CandidateStatus.ELECTED],
        sender: config.parsed.SENDGRID_SENDER_EMAIL,
    },
    {
        templateType: EMAIL_TEMPLATE_TYPE.INVITE_INTERVIEW_LETTER,
        sendgridTemplateId:
            config.parsed.SENDGRID_TEMPATE_ID_INVITE_INTERVIEW_LETTER,
        sendgridVersionId:
            config.parsed.SENDGRID_VERSION_ID_INVITE_INTERVIEW_LETTER,
        subject: 'recruitment.template.interviewLetter',
        nextStatus: CandidateStatus.WAITING_REPLY_FIRST_INTERVIEW,
        beforeStatus: [
            CandidateStatus.CV_APPROVED,
            CandidateStatus.FIRST_INTERVIEW,
        ],
        sender: config.parsed.SENDGRID_SENDER_EMAIL,
    },
];

export const MODULE_NAME = 'candidate-interview';

export enum CandidateOrderBy {
    CREATED_AT = 'createdAt',
    FULL_NAME = 'fullName',
    STATUS = 'status',
}

export const MAX_CANDIDATE_INTERVIEW_ORDER = 2;
