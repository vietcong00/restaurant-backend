import { RecruitmentService } from './service/candidate.service';
import { RecruitmentController } from './recruitment.controller';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RoleModule } from '../role/role.module';
import { DatabaseService } from 'src/common/services/database.service';
import { UpdateCandidateInterviewProgressJob } from './cron-job/updateCandidateInterviewProgress.job';
import { CandidateInterviewService } from './service/candidate-interview.service';
import { CandidateEmailService } from './service/candidate-email.service';

@Module({
    imports: [AuthModule, RoleModule],
    controllers: [RecruitmentController],
    providers: [
        CandidateEmailService,
        CandidateInterviewService,
        RecruitmentService,
        DatabaseService,
        UpdateCandidateInterviewProgressJob,
    ],
})
export class RecruitmentModule {}
