import {
    Body,
    Controller,
    InternalServerErrorException,
    Post,
    Request,
    UseGuards,
    Get,
    Query,
    UseInterceptors,
    UploadedFile,
    Patch,
    Param,
    ParseIntPipe,
    Delete,
} from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { JoiValidationPipe } from '../../common/pipes/joi.validation.pipe';
import { DatabaseService } from '../../common/services/database.service';
import {
    readFingerDataFile,
    TimekeepingService,
} from './services/timekeeping.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import {
    ErrorResponse,
    SuccessResponse,
} from '../../common/helpers/api.response';
import {
    TimekeepingListQueryStringDto,
    TimekeepingListQueryStringSchema,
} from './dto/requests/get-time-line-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { dat } from './timekeeping.constant';
import {
    CreateTimekeepingSchema,
    TimekeepingDto,
    UpdateTimekeepingSchema,
} from './dto/requests/create-time-line.dto';
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
import { Timekeeping } from './entity/timekeeping.entity';
import { hasPermission } from 'src/common/helpers/common.function';
import { IPermissionResponse } from '../role/role.interface';
import { RequestAbsenceService } from '../request-absence/services/requestAbsence.service';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
import { UserService } from '../user/services/user.service';
import { UserStatus } from '../user/user.constant';

@Controller('timekeeping')
@UseGuards(JwtGuard, AuthorizationGuard)
export class TimekeepingController {
    constructor(
        private readonly timekeepingService: TimekeepingService,
        private readonly requestAbsenceService: RequestAbsenceService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
        private readonly userService: UserService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.TIMEKEEPING}_${PermissionActions.READ}`,
        `${PermissionResources.TIMEKEEPING}_${PermissionActions.READ_PERSONAL}`,
    ])
    async getTimekeepingList(
        @Request() req,
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(TimekeepingListQueryStringSchema),
        )
        query: TimekeepingListQueryStringDto,
    ) {
        try {
            const permissions = req.loginUser.role
                ?.permissions as IPermissionResponse[];
            if (
                !hasPermission(
                    permissions,
                    PermissionResources.TIMEKEEPING,
                    PermissionActions.READ,
                )
            ) {
                query.userId = req.loginUser.id;
            }
            const { items, totalItems } =
                await this.timekeepingService.getTimekeepings(query);
            return new SuccessResponse({ items, totalItems });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.TIMEKEEPING}_${PermissionActions.READ}`,
        `${PermissionResources.TIMEKEEPING}_${PermissionActions.READ_PERSONAL}`,
    ])
    async getTimekeepingDetail(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            const timekeeping =
                await this.timekeepingService.getTimekeepingById(id);
            if (!timekeeping) {
                const message = await this.i18n.translate(
                    'timekeeping.common.error.notFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const permissions = req.loginUser.role
                ?.permissions as IPermissionResponse[];
            if (
                !hasPermission(
                    permissions,
                    PermissionResources.TIMEKEEPING,
                    PermissionActions.READ,
                ) &&
                timekeeping.userId !== req.loginUser?.id
            ) {
                const message = await this.i18n.translate(
                    'timekeeping.common.error.insufficientPermission',
                );
                return new ErrorResponse(HttpStatus.FORBIDDEN, message, []);
            }
            return new SuccessResponse(timekeeping);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([
        `${PermissionResources.TIMEKEEPING}_${PermissionActions.CREATE}`,
    ])
    async createTimekeeping(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateTimekeepingSchema),
        )
        body: TimekeepingDto,
    ) {
        try {
            const { checkIn, checkOut, userId } = body;
            const user = await this.userService.getUserById(userId);
            if (!user) {
                const message = await this.i18n.translate(
                    'user.common.error.user.notFound',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_NOT_FOUND,
                        message,
                        key: 'userId',
                    },
                ]);
            } else if (user.status !== UserStatus.ACTIVE) {
                const message = await this.i18n.t(
                    'timekeeping.common.error.notActiveUser',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'userId',
                        message,
                        errorCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    },
                ]);
            }
            const checkTimeOverlap =
                await this.requestAbsenceService.checkTimeOverlap(
                    userId,
                    checkIn,
                    checkOut,
                );
            if (!checkTimeOverlap) {
                const message = await this.i18n.translate(
                    'timekeeping.common.error.timekeeping',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'startTime',
                        message,
                        errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                    },
                ]);
            }
            const newTimekeeping =
                await this.timekeepingService.createTimekeeping(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newTimekeeping },
            });
            return new SuccessResponse(newTimekeeping);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('upload-finger-scanner-data')
    @Permissions([
        `${PermissionResources.TIMEKEEPING}_${PermissionActions.CREATE}`,
    ])
    @UseInterceptors(FileInterceptor('file'))
    async upload(@Request() req, @UploadedFile() file) {
        try {
            const finalFileName = file?.originalname?.split('.');
            if (finalFileName[finalFileName.length - 1] !== dat) {
                const message = await this.i18n.translate(
                    'user.status.error.notAllow',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                        message,
                        key: 'originalname',
                    },
                ]);
            }

            const text = Buffer.from(file?.buffer).toString('utf-8');
            await readFingerDataFile(text);
            return new SuccessResponse();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.TIMEKEEPING}_${PermissionActions.UPDATE}`,
    ])
    async updateTimekeeping(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateTimekeepingSchema),
        )
        body: TimekeepingDto,
    ) {
        try {
            const timekeeping = await this.databaseService.getDataById(
                Timekeeping,
                id,
            );
            if (!timekeeping) {
                const message = await this.i18n.translate(
                    'timekeeping.common.error.notFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const checkTimeOverlap =
                await this.requestAbsenceService.checkTimeOverlap(
                    timekeeping.userId,
                    body.checkIn,
                    body.checkOut,
                );
            if (!checkTimeOverlap) {
                const message = await this.i18n.translate(
                    'request-absence.common.error.timekeeping',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'startTime',
                        message,
                        errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                    },
                ]);
            }
            const updateTimekeeping =
                await this.timekeepingService.updateTimekeeping(id, body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...updateTimekeeping },
            });
            return new SuccessResponse(updateTimekeeping);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions([
        `${PermissionResources.TIMEKEEPING}_${PermissionActions.DELETE}`,
    ])
    async deleteTimekeeping(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            const timekeepingExists =
                await this.timekeepingService.checkIdExists(id);
            if (!timekeepingExists) {
                const message = await this.i18n.translate(
                    'timekeeping.common.error.notFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }

            await this.timekeepingService.deleteTimekeeping(
                id,
                req.loginUser?.id,
            );
            const message = await this.i18n.translate(
                'timekeeping.message.deleteSuccess',
            );

            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
