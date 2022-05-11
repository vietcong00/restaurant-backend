import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UpdateCandidateInterviewDto } from '../dto/requests/update-candidate.dto';
import { CandidateInterviewResponseDto } from '../dto/responses/candidate-response.dto';
import { CandidateInterview } from '../entity/candidate-interview.entity';
import {
    DEFAULT_ORDER_DIRECTION,
    TYPE_ORM_ORDER_DIRECTION,
} from 'src/common/constants';

@Injectable()
export class CandidateInterviewService {
    constructor(
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    async getCandidateInterviewById(id: number) {
        try {
            const candidateInterview = this.dbManager.findOne(
                CandidateInterview,
                id,
            );
            return candidateInterview;
        } catch (error) {
            throw error;
        }
    }

    async getRecentCandidateInterview(candidateId: number) {
        try {
            const [items] = await this.dbManager
                .createQueryBuilder(CandidateInterview, 'candidateInterview')
                .where({ candidateId })
                .orderBy(
                    'candidateInterview.createdAt',
                    DEFAULT_ORDER_DIRECTION.toUpperCase() as TYPE_ORM_ORDER_DIRECTION,
                )
                .limit(1)
                .getMany();
            return items;
        } catch (error) {
            throw error;
        }
    }

    async updateCandidateInterview(
        id: number,
        interview: UpdateCandidateInterviewDto,
    ): Promise<CandidateInterviewResponseDto> {
        try {
            await this.dbManager
                .getRepository(CandidateInterview)
                .update(id, interview);
            const updatedInterview = await this.getCandidateInterviewById(id);
            return updatedInterview;
        } catch (error) {
            throw error;
        }
    }
}
