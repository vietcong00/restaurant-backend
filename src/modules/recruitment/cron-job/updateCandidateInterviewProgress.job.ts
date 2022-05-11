import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { CandidateInterview } from 'src/modules/recruitment/entity/candidate-interview.entity';
import * as dotenv from 'dotenv';
import { getManager } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { TIMEZONE_NAME_DEFAULT } from 'src/common/constants';
import {
    CandidateInterviewProgress,
    MODULE_NAME,
} from 'src/modules/recruitment/recruitment.constant';
import { Injectable } from '@nestjs/common';
dotenv.config();

const CRON_JOB_CANDIDATE_INTERVIEW_UPDATE_STATUS =
    process.env.CRON_JOB_CANDIDATE_INTERVIEW_UPDATE_STATUS || '15 18 * * *';

@Injectable()
export class UpdateCandidateInterviewProgressJob {
    constructor(private readonly configService: ConfigService) {
        // eslint-disable-next-line prettier/prettier
    }
    private readonly logger = createWinstonLogger(
        `${MODULE_NAME}-update-progress-job`,
        this.configService,
    );
    async updateStatusToDone() {
        try {
            const today = moment().toDate();
            const manager = getManager();
            await manager
                .createQueryBuilder()
                .update(CandidateInterview)
                .set({ progress: CandidateInterviewProgress.Done })
                .where('interviewAt <= :today', { today })
                .andWhere('progress = :progress', {
                    progress: CandidateInterviewProgress.Waiting,
                })
                .execute();
        } catch (error) {
            this.logger.error('Error in updateStatusToDone func: ', error);
        }
    }

    @Cron(CRON_JOB_CANDIDATE_INTERVIEW_UPDATE_STATUS, {
        timeZone: TIMEZONE_NAME_DEFAULT,
    })
    async handleCron() {
        try {
            this.logger.info(
                'start UpdateCandidateInterviewProgressJob at',
                new Date(),
            );
            this.updateStatusToDone();
        } catch (error) {
            this.logger.error(
                'Error in UpdateCandidateInterviewProgressJob: ',
                error,
            );
        }
    }
}
