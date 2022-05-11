import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import axios from 'axios';
import { Connection, EntityManager } from 'typeorm';
import {
    CreateCandidateEmailDto,
    CreateCandidateInterviewDto,
    CreateCandidateInterviewHistoryDto,
} from '../dto/requests/create-candidate.dto';
import { UpdateCandidateEmailDto } from '../dto/requests/update-candidate.dto';
import {
    CandidateEmailResponseDto,
    TemplateSourceResponseDto,
} from '../dto/responses/candidate-response.dto';
import { CandidateStatus, SendgridTemplateList } from '../recruitment.constant';
import { ConfigService } from '@nestjs/config';
import { CandidateEmail } from '../entity/candidate-email.entity';
import ConfigKey from 'src/common/config/config-key';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { parseToCamelCase } from 'src/common/helpers/common.function';
import { Candidate } from '../entity/candidate.entity';
import { CandidateInterview } from '../entity/candidate-interview.entity';
import { CandidateInterviewHistories } from '../entity/candidate-interview-histories.entity';

@Injectable()
export class CandidateEmailService {
    constructor(
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
        private readonly configService: ConfigService,
        private readonly i18n: I18nRequestScopeService,
        private readonly connection: Connection,
    ) {}

    async getCandidateEmailById(id: number) {
        try {
            const sendEmail = this.dbManager.findOne(CandidateEmail, id);
            return sendEmail;
        } catch (error) {
            throw error;
        }
    }

    async createCandidateEmail(
        candidateEmail: CreateCandidateEmailDto,
        candidateStatus: CandidateStatus,
        candidateInterviewHistory: CreateCandidateInterviewHistoryDto,
        candidateInterview?: CreateCandidateInterviewDto,
    ): Promise<void> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await this.dbManager
                .getRepository(CandidateEmail)
                .insert(candidateEmail);

            await this.dbManager
                .getRepository(Candidate)
                .update(candidateEmail.candidateId, {
                    status: candidateStatus,
                });

            await this.dbManager
                .getRepository(CandidateInterviewHistories)
                .insert(candidateInterviewHistory);

            if (candidateInterview) {
                await this.dbManager
                    .getRepository(CandidateInterview)
                    .insert(candidateInterview);
            }
            await queryRunner.commitTransaction();
            return;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateCandidateEmail(
        id: number,
        sendEmailItem: UpdateCandidateEmailDto,
    ): Promise<CandidateEmailResponseDto> {
        try {
            await this.dbManager
                .getRepository(CandidateEmail)
                .update(id, sendEmailItem);
            const updatedCandidateEmail = await this.getCandidateEmailById(id);
            return updatedCandidateEmail;
        } catch (error) {
            throw error;
        }
    }

    async getSendGirdTemplatesSource(
        templateId: string,
        versionId: string,
    ): Promise<TemplateSourceResponseDto> {
        try {
            const response = await axios.get(
                `templates/${templateId}/versions/${versionId}`,
                {
                    responseType: 'json',
                    baseURL: this.configService.get(
                        ConfigKey.SENDGRID_API_HOST,
                    ),
                    headers: {
                        Authorization: `Bearer ${this.configService.get(
                            ConfigKey.SENDGRID_API_KEY,
                        )}`,
                    },
                },
            );
            const currentTemplate = SendgridTemplateList.find(
                (temp) => temp.sendgridTemplateId === templateId,
            );
            const template: TemplateSourceResponseDto = {
                ...parseToCamelCase(response.data),
                subject: await this.i18n.translate(currentTemplate.subject),
                nextStatus: currentTemplate.nextStatus,
                beforeStatus: currentTemplate.beforeStatus,
                sender: currentTemplate.sender,
                templateType: currentTemplate.templateType,
            };
            return template;
        } catch (error) {
            throw error;
        }
    }
}
