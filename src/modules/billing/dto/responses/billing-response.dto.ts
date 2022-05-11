import { User } from 'src/modules/user/entity/user.entity';

export interface BillingResponseDto {
    id: number;
    name: string;
    description?: string;
    url?: string;
    payerId: number;
    user?: User;
    payDate: Date;
}
