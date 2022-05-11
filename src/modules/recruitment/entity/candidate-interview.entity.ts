import { BaseEntity } from 'src/common/entities/BaseEntity';
import { CandidateInterviewProgress } from 'src/modules/recruitment/recruitment.constant';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Candidate } from './candidate.entity';

@Entity({ name: 'candidate_interviews' })
export class CandidateInterview extends BaseEntity {
    @Column({ nullable: false })
    candidateId: number;

    @Column({
        type: 'int',
        nullable: false,
    })
    order: number;

    @Column({ type: 'enum', enum: CandidateInterviewProgress, nullable: false })
    progress: CandidateInterviewProgress;

    @Column({ type: 'datetime', nullable: false })
    interviewAt: Date;

    @Column({ length: 2000, nullable: true })
    note: string;

    @ManyToOne(() => Candidate, (candidate) => candidate.id)
    @JoinColumn({
        name: 'candidateId',
    })
    candidate: Candidate;
}
