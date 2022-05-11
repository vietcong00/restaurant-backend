import { Inject, InternalServerErrorException, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Request } from 'express';
import { TeamMember } from 'src/modules/team/entity/team-users.entity';
import { Team } from 'src/modules/team/entity/team.entity';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
} from 'src/common/constants';
import { EntityManager, Like } from 'typeorm';
import { CreateTeamDto, TeamMemberDto } from '../dto/requests/create-team.dto';
import { RequestTeamQueryStringDto } from '../dto/requests/list-team.dto';
import { UpdateTeamDto } from '../dto/requests/update-team.dto';
import { MemberList, TeamList } from '../dto/responses/api-response.dto';
import {
    TeamMemberResponseDto,
    TeamResponseDto,
} from '../dto/responses/team-response.dto';

const teamAttributes: (keyof Team)[] = [
    'id',
    'name',
    'description',
    'createdAt',
];
const memberAttributes: (keyof TeamMember)[] = [
    'id',
    'userId',
    'teamId',
    'userRole',
    'order',
];
export class TeamService {
    constructor(
        @Optional() @Inject(REQUEST) private readonly request: Request,
        @InjectEntityManager()
        private readonly dbManager: EntityManager,
    ) {}

    generateQueryBuilder(queryBuilder, { name }) {
        if (name) {
            const likeKeyword = `%${name}%`;
            queryBuilder.andWhere({
                name: Like(likeKeyword),
            });
        }
    }

    async getTeamList(query: RequestTeamQueryStringDto): Promise<TeamList> {
        try {
            const {
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                name = '',
            } = query;

            // Pagination
            const take = +limit || DEFAULT_LIMIT_FOR_PAGINATION;
            const skip = +(page - 1) * take || 0;

            const [items, totalItems] = await this.dbManager.findAndCount(
                Team,
                {
                    select: teamAttributes,
                    where: (queryBuilder) =>
                        this.generateQueryBuilder(queryBuilder, { name }),
                    order: {
                        [orderBy]: orderDirection.toUpperCase(),
                    },
                    take,
                    skip,
                },
            );
            for (let i = 0; i < totalItems; i++) {
                if (items[i]) {
                    const members = await this.getMembersByTeamId(items[i].id);
                    (items[i] as TeamResponseDto).totalMembers =
                        members.totalItems;
                }
            }
            return {
                items,
                totalItems,
            };
        } catch (error) {
            throw error;
        }
    }

    async getTeamDetail(id: number): Promise<TeamResponseDto> {
        try {
            const team = await this.dbManager.findOne(Team, {
                select: teamAttributes,
                where: { id },
            });
            const listMember = await this.getMembersByTeamId(team.id);
            (team as TeamResponseDto).members = listMember.items;
            return team;
        } catch (error) {
            throw error;
        }
    }

    async createTeam(team: CreateTeamDto) {
        try {
            const newTeam = {
                name: team.name,
                description: team.description,
            };
            const insertedTeam = await this.dbManager
                .getRepository(Team)
                .insert(newTeam);
            const teamId = insertedTeam?.identifiers[0]?.id;
            if (teamId) {
                team.usersInfo.forEach(async (user) => {
                    const newTeamMember = {
                        ...user,
                        teamId,
                    };
                    await this.dbManager
                        .getRepository(TeamMember)
                        .insert(newTeamMember);
                });
                const teamDetail = await this.getTeamDetail(teamId);
                return teamDetail;
            }
            throw new InternalServerErrorException();
        } catch (error) {
            throw error;
        }
    }

    async updateTeam(id: number, team: UpdateTeamDto) {
        try {
            const updateTeam = {
                name: team.name,
                description: team.description,
            };
            const { items } = await this.getMembersByTeamId(id);
            const userIds = team.usersInfo.map((e) => e.userId);
            items.forEach(async (teamMember) => {
                if (userIds.indexOf(teamMember.userId) === -1) {
                    await this.deleteTeamMember(teamMember.id, team.updatedBy);
                }
            });
            team.usersInfo.forEach(async (teamMember: TeamMemberDto) => {
                const item = await this.getTeamMemberDetail(
                    id,
                    teamMember.userId,
                );
                if (!item) {
                    const newTeamMember = {
                        ...teamMember,
                        teamId: id,
                    };
                    await this.dbManager
                        .getRepository(TeamMember)
                        .insert(newTeamMember);
                } else {
                    const teamMemberId = item.id;
                    await this.dbManager
                        .getRepository(TeamMember)
                        .update({ id: teamMemberId }, teamMember);
                }
            });
            await this.dbManager.update(Team, id, updateTeam);
            const updatedTeam = await this.getTeamDetail(id);
            return updatedTeam;
        } catch (error) {
            throw error;
        }
    }

    async deleteTeam(id: number, deletedBy: number): Promise<void> {
        try {
            const { items } = await this.getMembersByTeamId(id);
            items.forEach(async (teamMember) => {
                await this.deleteTeamMember(teamMember.id, deletedBy);
            });
            await this.dbManager.update(
                Team,
                { id },
                {
                    deletedAt: new Date(),
                    deletedBy,
                },
            );
        } catch (error) {
            throw error;
        }
    }

    async getMembersByTeamId(teamId: number): Promise<MemberList> {
        try {
            const [items, totalItems] = await this.dbManager.findAndCount(
                TeamMember,
                {
                    select: memberAttributes,
                    relations: ['user'],
                    where: {
                        teamId: teamId,
                    },
                },
            );
            return { items, totalItems };
        } catch (error) {
            throw error;
        }
    }

    async getTeamMemberDetail(
        teamId: number,
        userId: number,
    ): Promise<TeamMemberResponseDto> {
        const item = await this.dbManager.findOne(TeamMember, {
            where: {
                teamId: teamId,
                userId: userId,
            },
        });
        return item;
    }

    async deleteTeamMember(id: number, deletedBy: number): Promise<void> {
        try {
            await this.dbManager.update(
                TeamMember,
                { id },
                {
                    deletedAt: new Date(),
                    deletedBy,
                },
            );
        } catch (error) {
            throw error;
        }
    }
}
