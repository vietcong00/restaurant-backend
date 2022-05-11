import {
    MIN_PAGE_SIZE,
    MIN_PAGE,
    INPUT_TEXT_MAX_LENGTH,
    MAX_PAGE,
    MAX_PAGE_SIZE,
} from '../../../../common/constants';
import { ORDER_DIRECTION } from 'src/common/constants';
import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import { TeamOrderBy } from '../../team.constants';
const Joi = BaseJoi.extend(JoiDate);

export const TeamListQueryStringSchema = Joi.object().keys({
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional(),
    limit: Joi.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).optional(),
    orderBy: Joi.string()
        .valid(...Object.values(TeamOrderBy))
        .optional(),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional(),
    name: Joi.string()
        .allow(null, '')
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('team.fields.name')
        .optional(),
});

export class RequestTeamQueryStringDto {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: ORDER_DIRECTION;
    name?: string;
}
