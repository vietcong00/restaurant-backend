import { RequestAbsenceStatus } from '../../requestAbsence.constant';
import * as Joi from 'joi';
export const RequestAbasenceStatusSchema = Joi.object().keys({
    status: Joi.string().valid(...Object.values(RequestAbsenceStatus)),
});
