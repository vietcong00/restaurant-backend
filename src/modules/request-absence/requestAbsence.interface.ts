import { User } from '../user/entity/user.entity';

export interface IRequestAbsence {
    reqUserId?: number | null;
    userId?: number | null;
    reqStatus?: string | null;
    reqReason?: string | null;
    startAt?: string | null;
    endAt?: string | null;
    userFullName?: string | null;
}
export interface RequestType {
    loginUser: User;
}
