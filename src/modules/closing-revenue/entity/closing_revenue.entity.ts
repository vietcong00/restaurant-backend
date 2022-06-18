import { SHIFT } from './../closing_revenue.constant';
import { User } from 'src/modules/user/entity/user.entity';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';

@Entity({ name: 'closing_revenue' })
export class ClosingRevenue extends BaseEntity {
    @Column({ nullable: true })
    shift: SHIFT;

    @Column({ nullable: true })
    shiftLeaderId: number;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'shiftLeaderId',
    })
    shiftLeader: User;

    @Column({ nullable: true })
    cashAtBeginningOfShift: number;

    @Column({ nullable: true })
    cashAtEndingOfShift: number;

    @Column({ nullable: true })
    bankingRevenue: number;

    @Column({ nullable: true })
    differenceRevenue: number;

    @Column({ length: 2000, nullable: true })
    note: string;
}
