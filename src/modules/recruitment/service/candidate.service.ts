import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    TYPE_ORM_ORDER_DIRECTION,
} from 'src/common/constants';
import { Brackets, Connection, EntityManager, In, Like } from 'typeorm';
import { CandidateListQueryStringDto } from '../dto/requests/candidate-list.dto';
import {
    CreateCandidateDto,
    CreateCandidateInterviewHistoryDto,
} from '../dto/requests/create-candidate.dto';
import {
    UpdateCandidateDto,
    UpdateCandidateStatusDto,
} from '../dto/requests/update-candidate.dto';
import { CandidateList } from '../dto/responses/api-response.dto';
import { CandidateResponseDto } from '../dto/responses/candidate-response.dto';
import { CandidateStatus } from '../recruitment.constant';
import { Candidate } from '../entity/candidate.entity';
import { File } from 'src/modules/file/entity/file.entity';
import { CandidateInterview } from '../entity/candidate-interview.entity';
import { CandidateEmail } from '../entity/candidate-email.entity';
import { makeFileUrl } from 'src/common/helpers/common.function';
import { CandidateInterviewHistories } from '../entity/candidate-interview-histories.entity';
import { FileResponseDto } from 'src/modules/file/dto/response/file-response.dto';

@Injectable()
export class RecruitmentService {
    constructor(
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
        private readonly connection: Connection,
    ) {}

    async getCandidateById(id: number): Promise<CandidateResponseDto> {
        try {
            const candidate: CandidateResponseDto =
                await this.dbManager.findOne(Candidate, id, {
                    relations: [
                        'candidateInterviews',
                        'candidateEmails',
                        'candidateInterviewHistories',
                    ],
                });

            const fileIds: FileResponseDto[] = await this.dbManager.findByIds(
                File,
                [candidate.cvFileId, candidate.avatarId],
            );

            fileIds.forEach((file) => {
                if (file.id === candidate.cvFileId) {
                    file.url = makeFileUrl(file.fileName);
                    candidate.cvFile = file;
                } else {
                    file.url = makeFileUrl(file.fileName);
                    candidate.avatar = file;
                }
            });

            return candidate;
        } catch (error) {
            throw error;
        }
    }

    async getCandidates(
        query: CandidateListQueryStringDto,
    ): Promise<CandidateList> {
        try {
            const {
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                keyword,
                genders,
                statuses,
                referredSources,
                interviewAt,
                positions = [],
            } = query;

            const _queryBuilder = this.dbManager
                .createQueryBuilder(Candidate, 'candidate')
                .leftJoinAndMapMany(
                    'candidate.candidateInterviews',
                    CandidateInterview,
                    'candidateInterviews',
                    'candidateInterviews.candidateId = candidate.id',
                )
                .where((queryBuilder) => {
                    this.generateQueryBuilder(queryBuilder, {
                        keyword,
                        genders,
                        statuses,
                        referredSources,
                        interviewAt,
                        positions,
                    });
                });

            if (orderBy) {
                _queryBuilder.orderBy(
                    `candidate.${orderBy}`,
                    orderDirection.toUpperCase() as TYPE_ORM_ORDER_DIRECTION,
                );
            }
            _queryBuilder.take(limit).skip((page - 1) * limit);
            const [items, totalItems] = await _queryBuilder.getManyAndCount();
            const candidateList = await this.mapCandidateFile(items);
            return {
                items: candidateList,
                totalItems,
            } as CandidateList;
        } catch (error) {
            throw error;
        }
    }

    async createCandidate(
        candidate: CreateCandidateDto,
    ): Promise<CandidateResponseDto> {
        try {
            const newCandidate = {
                ...candidate,
                status: CandidateStatus.CV_REVIEWING,
            };
            const insertedCandidate = await this.dbManager
                .getRepository(Candidate)
                .insert(newCandidate);
            const candidateId = insertedCandidate?.identifiers[0]?.id;
            if (candidateId) {
                const candidateDetail = await this.getCandidateById(
                    candidateId,
                );
                return candidateDetail;
            }
        } catch (error) {
            throw error;
        }
    }

    async updateCandidate(
        id: number,
        candidate: UpdateCandidateDto,
    ): Promise<CandidateResponseDto> {
        try {
            await this.dbManager.getRepository(Candidate).update(id, candidate);
            const updatedCandidate = await this.getCandidateById(id);
            return updatedCandidate;
        } catch (error) {
            throw error;
        }
    }

    async deleteCandidate(id: number, deletedBy: number): Promise<void> {
        try {
            const candidate = await this.dbManager.findOne(Candidate, id, {
                select: ['id'],
                relations: ['candidateInterviews', 'candidateEmails'],
            });

            const candidateInterviewIds = candidate.candidateInterviews.map(
                (item) => item.id,
            );
            const candidateEmailIds = candidate.candidateEmails.map(
                (item) => item.id,
            );

            await Promise.all([
                this.dbManager.update(Candidate, id, {
                    deletedAt: new Date(),
                    deletedBy,
                }),
                candidate.candidateInterviews.length > 0
                    ? this.dbManager.update(
                          CandidateInterview,
                          candidateInterviewIds,
                          {
                              deletedAt: new Date(),
                              deletedBy,
                          },
                      )
                    : null,
                candidate.candidateEmails.length > 0
                    ? this.dbManager.update(CandidateEmail, candidateEmailIds, {
                          deletedAt: new Date(),
                          deletedBy,
                      })
                    : null,
            ]);
        } catch (error) {
            throw error;
        }
    }

    generateQueryBuilder(
        queryBuilder,
        { keyword, genders, statuses, referredSources, interviewAt, positions },
    ) {
        if (keyword) {
            const likeKeyword = `%${keyword}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where([
                        { fullName: Like(likeKeyword) },
                        { email: Like(likeKeyword) },
                    ]);
                }),
            );
        }

        if (genders?.length > 0) {
            queryBuilder.andWhere({
                gender: In(genders),
            });
        }

        if (statuses?.length > 0) {
            queryBuilder.andWhere({
                status: In(statuses),
            });
        }

        if (referredSources?.length > 0) {
            queryBuilder.andWhere({
                resource: In(referredSources),
            });
        }

        if (interviewAt?.length === 2) {
            queryBuilder.andWhere(
                'candidateInterviews.interviewAt > :startDate AND candidateInterviews.interviewAt < :endDate',
                {
                    startDate: interviewAt[0],
                    endDate: interviewAt[1],
                },
            );
        }
        if (positions && positions.length > 0) {
            queryBuilder.andWhere({
                appliedPosition: In(positions),
            });
        }
    }

    async getInUseAppliedPosition(): Promise<string[]> {
        try {
            const candidates = await this.dbManager
                .getRepository(Candidate)
                .createQueryBuilder('candidates')
                .select('appliedPosition')
                .distinct(true)
                .getRawMany();
            const appliedPositions = (candidates || []).map(
                (candidate) => candidate.appliedPosition,
            );
            return appliedPositions;
        } catch (error) {
            throw error;
        }
    }

    async updateCandidateStatus(
        id: number,
        updateCandidate: UpdateCandidateStatusDto,
    ) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await this.dbManager.update(Candidate, id, {
                status: updateCandidate.status,
                updatedBy: updateCandidate.updatedBy,
            });
            const newInterviewHistory: CreateCandidateInterviewHistoryDto = {
                status: updateCandidate.status,
                note: updateCandidate.note,
                candidateId: id,
                createdBy: updateCandidate.updatedBy,
            };
            await this.dbManager
                .getRepository(CandidateInterviewHistories)
                .insert(newInterviewHistory);
            await queryRunner.commitTransaction();
            const saveCandidate = this.getCandidateById(id);
            return saveCandidate;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    //Map candidates with their respective CVs and avatars
    async mapCandidateFile(
        candidates: CandidateResponseDto[],
    ): Promise<CandidateResponseDto[]> {
        const fileIds = candidates
            .map((candidate) => candidate.avatarId)
            .concat(candidates.map((candidate) => candidate.cvFileId));

        const fileList = await this.dbManager.find(File, {
            where: { id: In(fileIds) },
        });
        candidates.forEach((candidate) => {
            const avatar: FileResponseDto = fileList.find(
                (avatar) => avatar.id === candidate.avatarId,
            );
            if (avatar) {
                avatar.url = makeFileUrl(avatar.fileName);
                candidate.avatar = avatar;
            }
            const cvFile: FileResponseDto = fileList.find(
                (cvFile) => cvFile.id === candidate.cvFileId,
            );
            if (cvFile) {
                cvFile.url = makeFileUrl(cvFile.fileName);
                candidate.cvFile = cvFile;
            }
        });
        return candidates;
    }
}
