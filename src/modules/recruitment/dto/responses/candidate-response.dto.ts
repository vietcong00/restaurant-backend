import {
    CandidateLevel,
    CandidateResource,
    CandidateStatus,
    CandidateGender,
    CandidateInterviewProgress,
} from 'src/modules/recruitment/recruitment.constant';
import { FileResponseDto } from 'src/modules/file/dto/response/file-response.dto';

export class CandidateInterviewResponseDto {
    id: number;
    order: number;
    interviewAt: Date;
    progress: CandidateInterviewProgress;
    note: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
}

export class CandidateEmailResponseDto {
    id: number;
    template: string;
    note: string;
    dateTime: Date;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
}

export class CandidateInterviewHistoriesResponseDto {
    id: number;
    note: string;
}

export class CandidateResponseDto {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    birthday: Date;
    cvFile?: FileResponseDto;
    gender: CandidateGender;
    appliedPosition: string;
    level: CandidateLevel;
    status: CandidateStatus;
    resource: CandidateResource;
    note: string;
    candidateInterviews: CandidateInterviewResponseDto[];
    candidateEmails: CandidateEmailResponseDto[];
    candidateInterviewHistories: CandidateInterviewHistoriesResponseDto[];
    avatar?: FileResponseDto;
    cvFileId: number;
    avatarId: number;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
    updatedBy?: number;
}

export class TemplateSourceResponseDto {
    id: string;
    templateId: string;
    active: number;
    name: string;
    htmlContent: string;
    plainContent: string;
    generatePlainContent: boolean;
    subject: string;
    updatedAt: Date | string;
    editor: string;
    thumbnailUrl: string;
    nextStatus?: CandidateStatus;
    beforeStatus?: CandidateStatus[];
    sender: string;
}
