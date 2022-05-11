import * as Joi from 'joi';
import {
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';
import { memberFields, UserRole } from '../../team.constants';

export const CreateTeamSchema = Joi.object().keys({
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
});

export interface TeamMemberDto {
    userId: number;
    teamId: number;
    order: number;
    userRole: UserRole;
}

export interface CreateTeamDto {
    name: string;
    description: string;
    usersInfo: TeamMemberDto[];
    createdBy: number;
}
