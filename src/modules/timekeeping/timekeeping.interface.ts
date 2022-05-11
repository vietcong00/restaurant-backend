export interface ITimekeeping {
    userId?: number;
    fullName?: string;
    timekeeping?: string | unknown;
    avatarName: string | null;
    avatarId: string | null;
}

export interface IUpdateUserFinger {
    userId: number;
    fingerId: number;
}
