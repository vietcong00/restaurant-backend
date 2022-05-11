import Joi from 'joi';
import {
    INPUT_TEXT_MAX_LENGTH,
    MAX_INTEGER,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';

export enum UserRole {
    DEVELOPER = 'developer',
    TESTER = 'tester',
    PROJECTMANAGER = 'project manager',
    INFRA = 'infra',
    ACCOUNTING = 'accounting',
}

export const memberFields = {
    userId: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .required()
        .label('team.fields.userId'),
    userRole: Joi.string()
        .valid(...Object.values(UserRole))
        .required()
        .label('team.fields.teamType'),
    //add max after
    order: Joi.number()
        .min(0)
        .max(MAX_INTEGER)
        .default(0)
        .required()
        .label('team.fields.userId'),
};

export const teamFields = {
    name: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('team.fields.name'),
    description: Joi.string()
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .allow(null, '')
        .label('team.fields.desc'),
    usersInfo: Joi.array()
        .items(
            Joi.object().keys({
                ...memberFields,
            }),
        )
        .allow(null),
};

export enum TeamOrderBy {
    CREATED_AT = 'createdAt',
    NAME = 'name',
}
