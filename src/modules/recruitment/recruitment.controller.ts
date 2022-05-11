import { CandidateInterview } from './entity/candidate-interview.entity';
import {
    CreateCandidateSchema,
    CreateCandidateDto,
    CreateCandidateEmailDto,
    sendingTemplateSchema,
    CreateSendGridEmailDto,
    CreateCandidateInterviewDto,
} from './dto/requests/create-candidate.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { RecruitmentService } from './service/candidate.service';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { JoiValidationPipe } from '../../common/pipes/joi.validation.pipe';
import { DatabaseService } from '../../common/services/database.service';
import { Candidate } from './entity/candidate.entity';
import { CandidateResponseDto } from './dto/responses/candidate-response.dto';
import {
    UpdateCandidateDto,
    UpdateCandidateInterviewDto,
    UpdateCandidateInterviewsSchema,
    UpdateCandidateSchema,
    UpdateCandidateEmailDto,
    UpdateCandidateEmailsSchema,
    UpdateCandidateStatusDto,
    UpdateCandidateStatusSchema,
} from './dto/requests/update-candidate.dto';
import {
    CandidateListQueryStringDto,
    CandidateListQueryStringSchema,
} from './dto/requests/candidate-list.dto';
import {
    ErrorResponse,
    SuccessResponse,
} from '../../common/helpers/api.response';
import { CandidateEmail } from './entity/candidate-email.entity';
import sgMail from '@sendgrid/mail';
import {
    SENDGRID_SEND_MAIL_SUCCESS_CODE,
    CandidateStatusChangingFlow,
    MAX_CANDIDATE_INTERVIEW_ORDER,
    SendgridTemplateList,
    CandidateStatus,
    EMAIL_TEMPLATE_TYPE,
    CandidateInterviewProgress,
} from './recruitment.constant';
import { File } from 'src/modules/file/entity/file.entity';
import {
    AuthorizationGuard,
    Permissions,
} from 'src/common/guards/authorization.guard';
import {
    PermissionResources,
    PermissionActions,
} from 'src/modules/role/role.constants';
import { ConfigService } from '@nestjs/config';
import ConfigKey from 'src/common/config/config-key';
import {
    DATE_TIME_FORMAT,
    HttpStatus,
    TIMEZONE_NAME_DEFAULT,
} from 'src/common/constants';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { CandidateInterviewService } from './service/candidate-interview.service';
import { CandidateEmailService } from './service/candidate-email.service';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
import moment from 'moment-timezone';
@Controller('candidate')
@UseGuards(JwtGuard, AuthorizationGuard)
export class RecruitmentController {
    constructor(
        private readonly recruitmentService: RecruitmentService,
        private readonly candidateInterviewService: CandidateInterviewService,
        private readonly candidateEmailService: CandidateEmailService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.READ}`,
    ])
    async getCandidates(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(CandidateListQueryStringSchema),
        )
        query: CandidateListQueryStringDto,
    ) {
        try {
            const data = await this.recruitmentService.getCandidates(query);

            return new SuccessResponse(data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.READ}`,
    ])
    async getCandidate(@Param('id', ParseIntPipe) id: number) {
        try {
            const candidate = await this.recruitmentService.getCandidateById(
                id,
            );
            if (!candidate) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.candidate.notFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(candidate);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.CREATE}`,
    ])
    async createCandidate(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateCandidateSchema),
        )
        body: CreateCandidateDto,
    ) {
        try {
            const isEmailExist = await this.databaseService.checkItemExist(
                Candidate,
                'email',
                body.email,
            );
            if (isEmailExist) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.email.exist',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                        message,
                        key: 'email',
                    },
                ]);
            }

            if (body.avatarId) {
                const isAvatarExist = await this.databaseService.checkItemExist(
                    File,
                    'id',
                    body.avatarId,
                );
                if (!isAvatarExist) {
                    const message = await this.i18n.translate(
                        'recruitment.common.error.file.exist',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_NOT_FOUND,
                            message,
                            key: 'avatarId',
                        },
                    ]);
                }
            }

            if (body.cvFileId) {
                const cvFile = await this.databaseService.checkItemExist(
                    File,
                    'id',
                    body.cvFileId,
                );
                if (!cvFile) {
                    const message = await this.i18n.translate(
                        'recruitment.common.error.file.exist',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_NOT_FOUND,
                            message,
                            key: 'cvFileId',
                        },
                    ]);
                }
            }

            body.createdBy = req.loginUser.id;
            const newCandidate: CandidateResponseDto =
                await this.recruitmentService.createCandidate(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newCandidate },
            });
            return new SuccessResponse(newCandidate);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.UPDATE}`,
    ])
    async updateCandidate(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateCandidateSchema),
        )
        body: UpdateCandidateDto,
    ) {
        try {
            const candidate = await this.recruitmentService.getCandidateById(
                id,
            );
            if (!candidate) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.candidate.notFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }

            if (body?.status && body.status !== candidate.status) {
                if (
                    CandidateStatusChangingFlow[candidate.status]?.includes(
                        body.status,
                    )
                ) {
                    const message = await this.i18n.translate(
                        'recruitment.common.error.candidate.status.invalid',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_NOT_FOUND,
                            message,
                            key: 'status',
                        },
                    ]);
                }
            }

            const isEmailExist =
                body.email && candidate.email !== body.email
                    ? await this.databaseService.checkItemExist(
                          Candidate,
                          'email',
                          body.email,
                          id,
                      )
                    : null;
            if (isEmailExist) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.email.exist',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                        message,
                        key: 'email',
                    },
                ]);
            }

            if (body?.avatarId) {
                const avatarFile = await this.databaseService.getDataById(
                    File,
                    body.avatarId,
                );
                if (!avatarFile) {
                    const message = await this.i18n.translate(
                        'recruitment.common.error.file.exist',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_NOT_FOUND,
                            message,
                            key: 'avatarId',
                        },
                    ]);
                }
            }

            if (body.cvFileId) {
                const cvFile = await this.databaseService.checkItemExist(
                    File,
                    'id',
                    body.cvFileId,
                );
                if (!cvFile) {
                    const message = await this.i18n.translate(
                        'recruitment.common.error.file.exist',
                    );
                    return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                        {
                            errorCode: HttpStatus.ITEM_NOT_FOUND,
                            message,
                            key: 'cvFileId',
                        },
                    ]);
                }
            }

            const oldValue = await this.databaseService.getDataById(
                Candidate,
                id,
            );

            body.updatedBy = req.loginUser.id;
            const saveCandidate = await this.recruitmentService.updateCandidate(
                id,
                body,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldValue },
                newValue: { ...saveCandidate },
            });
            return new SuccessResponse(saveCandidate);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id/status')
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.UPDATE}`,
    ])
    async updateCandidateStatus(
        @Request() req,
        @Param('id') id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateCandidateStatusSchema),
        )
        body: UpdateCandidateStatusDto,
    ) {
        try {
            // check if id exists
            const oldCandidate = await this.databaseService.getDataById(
                Candidate,
                id,
            );
            if (!oldCandidate) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.candidate.notFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            // set updatedBy
            body.updatedBy = req.loginUser.id;
            // update status
            const updatedCandidate =
                await this.recruitmentService.updateCandidateStatus(id, body);
            // save audit log
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldCandidate },
                newValue: { ...updatedCandidate },
            });
            // return response
            return new SuccessResponse(updatedCandidate);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.DELETE}`,
    ])
    async removeCandidate(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            const candidate = await this.databaseService.checkItemExist(
                Candidate,
                'id',
                id,
            );
            if (!candidate) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.candidate.notFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const oldValue = await this.databaseService.getDataById(
                Candidate,
                id,
            );

            await this.recruitmentService.deleteCandidate(id, req.loginUser.id);
            const message = await this.i18n.translate(
                'recruitment.delete.success',
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldValue },
                newValue: {},
            });
            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('interview/:id')
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.HR_ROLE}`,
    ])
    async getInterviewDetail(@Param('id', ParseIntPipe) id: number) {
        try {
            const candidateInterview =
                await this.candidateInterviewService.getCandidateInterviewById(
                    id,
                );
            if (!candidateInterview) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.candidateInterview.notFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(candidateInterview);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch('interview/:id')
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.HR_ROLE}`,
    ])
    async updateInterview(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateCandidateInterviewsSchema),
        )
        body: UpdateCandidateInterviewDto,
    ) {
        try {
            const interviewExist = await this.databaseService.checkItemExist(
                CandidateInterview,
                'id',
                id,
            );
            if (!interviewExist) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.candidateInterview.notFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }

            const oldValue = await this.databaseService.getDataById(
                CandidateInterview,
                id,
            );

            body.updatedBy = req.loginUser.id;
            const updatedInterview =
                await this.candidateInterviewService.updateCandidateInterview(
                    id,
                    body,
                );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldValue },
                newValue: { ...updatedInterview },
            });

            return new SuccessResponse(updatedInterview);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch('candidate-email/:id')
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.HR_ROLE}`,
    ])
    async updateSendEmail(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateCandidateEmailsSchema),
        )
        body: UpdateCandidateEmailDto,
    ) {
        try {
            const sendEmailItem = await this.databaseService.checkItemExist(
                CandidateEmail,
                'id',
                id,
            );
            if (!sendEmailItem) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.candidateEmail.notFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }

            const oldValue = await this.databaseService.getDataById(
                CandidateEmail,
                id,
            );

            body.updatedBy = req.loginUser.id;
            const saveCandidateEmail =
                await this.candidateEmailService.updateCandidateEmail(id, body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldValue },
                newValue: { ...saveCandidateEmail },
            });
            return new SuccessResponse(saveCandidateEmail);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('email')
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.HR_ROLE}`,
    ])
    async sendEmail(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(sendingTemplateSchema),
        )
        body: CreateSendGridEmailDto,
    ) {
        try {
            sgMail.setApiKey(
                this.configService.get(ConfigKey.SENDGRID_API_KEY),
            );
            const emailTemplate = SendgridTemplateList.find(
                (template) => template.templateType === body.templateType,
            );
            const msg = {
                to: body.to,
                from: body.from,
                templateId: emailTemplate?.sendgridTemplateId,
                dynamicTemplateData: {
                    ...body.dynamicTemplateData,
                    interviewAt: body.dynamicTemplateData.interviewAt
                        ? moment(body.dynamicTemplateData.interviewAt)
                              .tz(TIMEZONE_NAME_DEFAULT)
                              .format(DATE_TIME_FORMAT.SENDGRID_DATE_FORMAT)
                        : '',
                    startWorkingDate: body.dynamicTemplateData.startWorkingDate
                        ? moment(body.dynamicTemplateData.startWorkingDate)
                              .tz(TIMEZONE_NAME_DEFAULT)
                              .format(DATE_TIME_FORMAT.SENDGRID_DATE_FORMAT)
                        : '',
                    expiredReplyDate: body.dynamicTemplateData.expiredReplyDate
                        ? moment(body.dynamicTemplateData.expiredReplyDate)
                              .tz(TIMEZONE_NAME_DEFAULT)
                              .format(DATE_TIME_FORMAT.SENDGRID_DATE_FORMAT)
                        : '',
                },
                attachments: [
                    {
                        content: body.dynamicTemplateData.attachment
                            .split(',')
                            .pop(),
                        filename: body.dynamicTemplateData.attachmentName,
                        type: 'application/pdf',
                        disposition: 'attachment',
                        content_id: 'mytext',
                    },
                ],
            };
            if (!body.dynamicTemplateData.attachment) {
                delete msg.attachments;
            }

            const candidate = await this.databaseService.getDataById(
                Candidate,
                body.candidateId,
            );

            if (!candidate) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.candidate.notFound',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        errorCode: HttpStatus.ITEM_NOT_FOUND,
                        message,
                        key: 'candidateId',
                    },
                ]);
            }

            const candidateEmail: CreateCandidateEmailDto = {
                candidateId: body.candidateId,
                template: body.templateName,
                dateTime: moment().utc().fmFullTimeString(),
                note: body.note,
                createdBy: req.loginUser.id,
            };

            let candidateStatus = emailTemplate.nextStatus;

            let candidateInterview: CreateCandidateInterviewDto = null;

            if (
                body.templateType ===
                EMAIL_TEMPLATE_TYPE.INVITE_INTERVIEW_LETTER
            ) {
                const recentCandidateInterview =
                    await this.candidateInterviewService.getRecentCandidateInterview(
                        body.candidateId,
                    );
                if (
                    recentCandidateInterview?.order >=
                    MAX_CANDIDATE_INTERVIEW_ORDER
                ) {
                    const message = await this.i18n.translate(
                        'recruitment.common.error.candidate.interview.exceed',
                    );
                    return new ErrorResponse(
                        HttpStatus.OVER_LIMIT,
                        message,
                        [],
                    );
                }

                const order = recentCandidateInterview?.order
                    ? recentCandidateInterview.order + 1
                    : 1;

                candidateInterview = {
                    candidateId: body.candidateId,
                    interviewAt: moment(body.dynamicTemplateData?.interviewAt)
                        .utc()
                        .fmFullTimeString(),
                    order: order,
                    note: body.note,
                    progress: CandidateInterviewProgress.Waiting,
                    createdBy: req.loginUser.id,
                };

                candidateStatus =
                    candidate.status === CandidateStatus.FIRST_INTERVIEW
                        ? CandidateStatus.WAITING_REPLY_SECOND_INTERVIEW
                        : candidateStatus;
            }

            const candidateInterviewHistory = {
                status: candidateStatus,
                note: body.note,
                candidateId: body.candidateId,
                createdBy: req.loginUser.id,
            };

            try {
                const response = await Promise.all([
                    sgMail.send(msg),
                    this.candidateEmailService.createCandidateEmail(
                        candidateEmail,
                        candidateStatus,
                        candidateInterviewHistory,
                        candidateInterview,
                    ),
                ]);
                if (
                    response[0][0].statusCode ===
                    SENDGRID_SEND_MAIL_SUCCESS_CODE
                ) {
                    return new SuccessResponse(response[0][0]?.body, 'success');
                }
            } catch (e) {
                const message = await this.i18n.translate(
                    'recruitment.common.error.sendMail.error',
                );
                return new ErrorResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    message,
                    [],
                );
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('email-template/send-grid')
    @Permissions([
        `${PermissionResources.RECRUITMENT}_${PermissionActions.HR_ROLE}`,
    ])
    async getTemplate() {
        try {
            const sendgridTemplates = [];
            for (let i = 0; i < SendgridTemplateList.length; i++) {
                const sendgridTemplate =
                    await this.candidateEmailService.getSendGirdTemplatesSource(
                        SendgridTemplateList[i].sendgridTemplateId,
                        SendgridTemplateList[i].sendgridVersionId,
                    );
                sendgridTemplates.push(sendgridTemplate);
            }
            return new SuccessResponse(sendgridTemplates, 'success');
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
