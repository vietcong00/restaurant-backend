import { User } from '../user/entity/user.entity';

export const dat = 'dat';

export const userDetailAttributes: (keyof User)[] = [
    'id',
    'email',
    'fullName',
    'fingerId',
];

export const timekeepingAttributes = [
    'id',
    'userId',
    'fingerId',
    'checkIn',
    'checkOut',
    'dateScan',
];

export const timekeepingListAttributes = [
    'user.id',
    'user.fullName',
    'file.id',
    'file.fileName',
    'timekeeping.id',
    'timekeeping.userId',
    'timekeeping.checkIn',
    'timekeeping.checkOut',
    'requestAbsence.id',
    'requestAbsence.startAt',
    'requestAbsence.endAt',
];

export enum TimekeepingOrderBy {
    USER_ID = 'userId',
    FULL_NAME = 'fullName',
}

export const workingTimes = {
    morning: {
        startTime: '09:00',
        endTime: '12:30',
    },
    afternoon: {
        startTime: '13:30',
        endTime: '18:00',
    },
};
