import { BaseEntity } from 'src/common/entities/BaseEntity';
import { CandidateStatus } from 'src/modules/recruitment/recruitment.constant';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Candidate } from './candidate.entity';

@Entity({ name: 'candidate_interview_histories' })
export class CandidateInterviewHistories extends BaseEntity {
    @Column({
        type: 'enum',
        enum: CandidateStatus,
        nullable: false,
    })
    status: CandidateStatus;

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
