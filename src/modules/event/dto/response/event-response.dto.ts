import { EventStatus } from '../../event.constant';

export class EventDetailResponseDto {
    id: number;
    title: string;
    description?: string;
    status: EventStatus;
    startDate: Date;
    endDate: Date;
    images?: string;
    userQuantity?: number;
    budget?: number;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
