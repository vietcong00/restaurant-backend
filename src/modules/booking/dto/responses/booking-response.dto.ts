import { BookingStatus } from './../../booking.constant';
export interface BookingDetailResponseDto {
    id: number;
    nameCustomer: string;
    idTable?: number;
    status?: BookingStatus;
}
