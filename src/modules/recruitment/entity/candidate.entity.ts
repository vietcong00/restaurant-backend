import {
    CandidateGender,
    CandidateLevel,
    CandidateResource,
    CandidateStatus,
} from 'src/modules/recruitment/recruitment.constant';
import { Column, Entity, OneToMany } from 'typeorm';
import { CandidateInterview } from './candidate-interview.entity';
import { CandidateEmail } from './candidate-email.entity';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { CandidateInterviewHistories } from './candidate-interview-histories.entity';

@Entity({ name: 'candidates' })
export class Candidate extends BaseEntity {
    @Column({ length: 255, nullable: false })
    fullName: string;

    @Column({ length: 255, nullable: false })
    email: string;

    @Column({ length: 255, nullable: false })
    phoneNumber: string;

    @Column({ type: 'datetime', nullable: true })
    birthday: Date;

    @Column({ nullable: true })
    avatarId: number;

    @Column({ nullable: true })
    cvFileId: number;

    @Column({ type: 'enum', enum: CandidateGender, nullable: true })
    gender: CandidateGender;

    @Column({ nullable: false })
    appliedPosition: string;

    @Column({ type: 'enum', enum: CandidateLevel, nullable: true })
    level: CandidateLevel;

    @Column({ type: 'enum', enum: CandidateStatus, nullable: false })
    status: CandidateStatus;

    @Column({ type: 'enum', enum: CandidateResource, nullable: true })
    resource: CandidateResource;

    @Column({ length: 255, nullable: true })
    note: string;

    @OneToMany(
        () => CandidateInterview,
        (candidateInterview) => candidateInterview.candidate,
    )
    candidateInterviews: CandidateInterview[];

    @OneToMany(
        () => CandidateEmail,
        (candidateEmail) => candidateEmail.candidate,
    )
    candidateEmails: CandidateEmail[];

    @OneToMany(
        () => CandidateInterviewHistories,
        (candidateInterviewHistories) => candidateInterviewHistories.candidate,
    )
    candidateInterviewHistories: CandidateInterviewHistories[];
}
