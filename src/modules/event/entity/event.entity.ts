import { Entity, Column } from 'typeorm';
import { EventStatus } from 'src/modules/event/event.constant';
import { BaseEntity } from 'src/common/entities/BaseEntity';

@Entity({ name: 'event' })
export class Event extends BaseEntity {
    @Column({ length: 255, nullable: false })
    title: string;

    @Column({ length: 2000, nullable: true })
    description?: string;

    @Column({ type: 'datetime', nullable: true })
    startDate: Date;

    @Column({ type: 'datetime', nullable: true })
    endDate: Date;

    @Column({ type: 'enum', enum: EventStatus, nullable: false })
    status: EventStatus;

    @Column({ length: 2000, nullable: true })
    imageUrl?: string;

    @Column({ nullable: true })
    userQuantity: number;

    @Column({ nullable: true })
    budget: number;
}
