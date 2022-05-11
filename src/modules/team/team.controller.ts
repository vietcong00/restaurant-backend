import {
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Query,
    UseGuards,
    Request,
    Post,
    Body,
    Patch,
} from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { Team } from 'src/modules/team/entity/team.entity';
import {
    ErrorResponse,
    SuccessResponse,
} from '../../common/helpers/api.response';
import { JoiValidationPipe } from '../../common/pipes/joi.validation.pipe';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { DatabaseService } from '../../common/services/database.service';
import {
    CreateTeamDto,
    CreateTeamSchema,
} from './dto/requests/create-team.dto';
import {
    RequestTeamQueryStringDto,
    TeamListQueryStringSchema,
} from './dto/requests/list-team.dto';
import {
    UpdateTeamDto,
    UpdateTeamSchema,
} from './dto/requests/update-team.dto';
import { TeamList } from './dto/responses/api-response.dto';
import { TeamService } from './services/team.service';
import {
    AuthorizationGuard,
    Permissions,
} from 'src/common/guards/authorization.guard';
import {
    PermissionResources,
    PermissionActions,
} from 'src/modules/role/role.constants';
import { HttpStatus } from 'src/common/constants';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';

@Controller('team')
@UseGuards(JwtGuard, AuthorizationGuard)
export class TeamController {
    constructor(
        private readonly teamService: TeamService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @Permissions([`${PermissionResources.TEAM}_${PermissionActions.READ}`])
    async getTeams(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(TeamListQueryStringSchema),
        )
        query: RequestTeamQueryStringDto,
    ) {
        try {
            const teamList: TeamList = await this.teamService.getTeamList(
                query,
            );
            return new SuccessResponse(teamList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([`${PermissionResources.TEAM}_${PermissionActions.READ}`])
    async getTeam(@Param('id', ParseIntPipe) id: number) {
        try {
            const team = await this.teamService.getTeamDetail(id);
            if (!team) {
                const message = await this.i18n.translate(
                    'team.message.teamNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(team);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([`${PermissionResources.TEAM}_${PermissionActions.CREATE}`])
    async create(
        @Request() req,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(CreateTeamSchema))
        body: CreateTeamDto,
    ) {
        try {
            const teamName = await this.databaseService.checkItemExist(
                Team,
                'name',
                body.name,
            );
            if (teamName) {
                const message = await this.i18n.translate(
                    'team.message.nameExist',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'name',
                        message,
                        errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                    },
                ]);
            }
            body.createdBy = req.loginUser.id;
            const newTeam = await this.teamService.createTeam(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newTeam },
            });
            return new SuccessResponse(newTeam);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([`${PermissionResources.TEAM}_${PermissionActions.UPDATE}`])
    async updateTeam(
        @Request() req,
        @Param('id') id: number,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(UpdateTeamSchema))
        body: UpdateTeamDto,
    ) {
        try {
            const oldTeam = await this.databaseService.getDataById(Team, id);
            if (!oldTeam) {
                const message = await this.i18n.translate(
                    'team.message.teamNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            if (oldTeam.name !== body.name) {
                const teamName = await this.databaseService.checkItemExist(
                    Team,
                    'name',
                    body.name,
                );
                if (teamName) {
                    const message = await this.i18n.translate(
                        'team.message.nameExist',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            key: 'name',
                            message,
                            errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                        },
                    ]);
                }
            }
            body.updatedBy = req.loginUser.id;
            const updatedTeam = await this.teamService.updateTeam(id, body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldTeam },
                newValue: { ...updatedTeam },
            });
            return new SuccessResponse(updatedTeam);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions([`${PermissionResources.TEAM}_${PermissionActions.DELETE}`])
    async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
        try {
            const oldTeam = await this.databaseService.getDataById(Team, id);
            if (!oldTeam) {
                const message = await this.i18n.translate(
                    'team.message.teamNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }

            await this.teamService.deleteTeam(id, req.loginUser.id);
            const message = await this.i18n.translate(
                'team.message.deleteSuccess',
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldTeam },
                newValue: {},
            });
            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
