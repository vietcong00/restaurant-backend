import { Candidate } from './candidate.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';

@Entity({ name: 'candidate_emails' })
export class CandidateEmail extends BaseEntity {
    @Column({
        type: 'varchar',
        nullable: true,
        length: 255,
    })
    template: string;

    @Column({ type: 'datetime', nullable: true })
    dateTime: Date;

    @Column({ length: 2000, nullable: true })
    note: string;

    @Column({ nullable: false })
    candidateId: number;

    @ManyToOne(() => Candidate)
    @JoinColumn({
        name: 'candidateId',
    })
    candidate: Candidate;
}
