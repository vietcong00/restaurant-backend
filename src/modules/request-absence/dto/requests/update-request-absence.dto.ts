import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import {
    INPUT_MIN_DATE,
    DATE_TIME_FORMAT,
    MAX_INTEGER,
    TEXTAREA_MAX_LENGTH,
} from '../../../../common/constants';
import { RequestAbsenceStatus } from '../../requestAbsence.constant';
import moment from 'moment';
import { getHourFromTime } from 'src/common/helpers/common.function';
import { workingTimes } from 'src/modules/timekeeping/timekeeping.constant';
const Joi = BaseJoi.extend(JoiDate);

export const UpdateRequestAbsenceSchema = Joi.object()
    .keys({
        userId: Joi.number()
            .required()
            .positive()
            .max(MAX_INTEGER)
            .label('request-absence.fields.userId'),
        reason: Joi.string()
            .max(TEXTAREA_MAX_LENGTH)
            .optional()
            .label('request-absence.fields.reason'),
        startAt: Joi.date()
            .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
            .min(INPUT_MIN_DATE)
            .label('request-absence.fields.startAt'),
        endAt: Joi.date()
            .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
            .min(INPUT_MIN_DATE)
            .greater(Joi.ref('startAt'))
            .label('request-absence.fields.reason'),
    })
    .custom(async (body, helpers) => {
        const { startAt, endAt } = body;
        const hourStartAt = +moment(startAt).fmHourOnlyTimeString();
        const hourEndAt = +moment(endAt).fmHourOnlyTimeString();

        if (
            hourStartAt < getHourFromTime(workingTimes.morning.startTime) ||
            hourEndAt > getHourFromTime(workingTimes.afternoon.endTime)
        ) {
            return helpers.message('request-absence.common.error.outOff');
        }
        return true;
    });

export class UpdateRequestAbsenceDto {
    userId: number;
    reason?: string;
    startAt: Date;
    endAt: Date;
    status?: RequestAbsenceStatus;
}
