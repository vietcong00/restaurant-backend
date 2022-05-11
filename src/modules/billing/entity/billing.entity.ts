import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entity/user.entity';

@Entity({ name: 'billings' })
export class Billing extends BaseEntity {
    @Column({ length: 255, nullable: false })
    name: string;

    @Column({ length: 2000, nullable: true })
    description: string;

    @Column({
        name: 'payerId',
    })
    payerId: number;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'payerId',
    })
    user: User;

    @Column({ type: 'datetime' })
    payDate: Date;

    @Column({ length: 2000, nullable: true })
    url: string;
}
