import {
    Controller,
    Get,
    InternalServerErrorException,
    Query,
    Post,
    UseGuards,
    Body,
    Delete,
    Param,
    ParseIntPipe,
    Patch,
    Request,
} from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import {
    SuccessResponse,
    ErrorResponse,
} from '../../common/helpers/api.response';

import { JoiValidationPipe } from '../../common/pipes/joi.validation.pipe';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { DatabaseService } from '../../common/services/database.service';
import {
    CreateBillingDto,
    CreateBillingSchema,
} from './dto/requests/create-billing.dto';
import {
    BillingListQueryStringDto,
    BillingListQueryStringSchema,
} from './dto/requests/list-billing.dto';
import {
    UpdateBillingDto,
    UpdateBillingSchema,
} from './dto/requests/update-billing.dto';
import { BillingService } from './services/billing.service';
import { Billing } from './entity/billing.entity';
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
import { User } from '../user/entity/user.entity';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
import { UserStatus } from '../user/user.constant';

@Controller({
    path: 'billing',
})
@UseGuards(JwtGuard, AuthorizationGuard)
export class BillingController {
    constructor(
        private readonly billingService: BillingService,
        private readonly databaseService: DatabaseService,
        private readonly i18n: I18nRequestScopeService,
    ) {}

    @Get()
    @Permissions([`${PermissionResources.BILLING}_${PermissionActions.READ}`])
    async getBillings(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(BillingListQueryStringSchema),
        )
        query: BillingListQueryStringDto,
    ) {
        try {
            const billingList = await this.billingService.getBillingList(query);
            return new SuccessResponse(billingList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([`${PermissionResources.BILLING}_${PermissionActions.READ}`])
    async getBilling(@Param('id', ParseIntPipe) id: number) {
        try {
            const billing = await this.billingService.getBillingDetail(id);
            if (!billing) {
                const message = await this.i18n.translate(
                    'billing.message.error.itemNotExist',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(billing);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([`${PermissionResources.BILLING}_${PermissionActions.CREATE}`])
    async create(
        @Request() req,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(CreateBillingSchema))
        body: CreateBillingDto,
    ) {
        try {
            const payer = await this.databaseService.getDataById(
                User,
                body.payerId,
            );
            if (!payer) {
                const message = await this.i18n.translate(
                    'user.common.error.user.notFound',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'payerId',
                        message,
                        errorCode: HttpStatus.ITEM_NOT_FOUND,
                    },
                ]);
            } else if (payer.status === UserStatus.WAITING_FOR_APPROVAL) {
                const message = await this.i18n.t(
                    'billing.message.error.payer.waitingForApproval',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'payerId',
                        message,
                        errorCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    },
                ]);
            }
            body.createdBy = req.loginUser.id;
            const newBilling = await this.billingService.createBilling(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newBilling },
            });
            return new SuccessResponse(newBilling);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([`${PermissionResources.BILLING}_${PermissionActions.UPDATE}`])
    async updateBilling(
        @Request() req,
        @Param('id') id: number,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(UpdateBillingSchema))
        body: UpdateBillingDto,
    ) {
        try {
            const oldBilling = await this.databaseService.getDataById(
                Billing,
                id,
            );
            if (!oldBilling) {
                const message = await this.i18n.translate(
                    'billing.message.error.itemNotExist',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const payer = await this.databaseService.getDataById(
                User,
                body.payerId,
            );
            if (!payer) {
                const message = await this.i18n.translate(
                    'user.common.error.user.notFound',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'payerId',
                        message,
                        errorCode: HttpStatus.ITEM_NOT_FOUND,
                    },
                ]);
            } else if (payer.status === UserStatus.WAITING_FOR_APPROVAL) {
                const message = await this.i18n.t(
                    'billing.message.error.payer.waitingForApproval',
                );
                return new ErrorResponse(HttpStatus.BAD_REQUEST, message, [
                    {
                        key: 'payerId',
                        message,
                        errorCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    },
                ]);
            }
            body.updatedBy = req.loginUser.id;
            const updatedBilling = await this.billingService.updateBilling(
                id,
                body,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldBilling },
                newValue: { ...updatedBilling },
            });
            return new SuccessResponse(updatedBilling);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @Permissions([`${PermissionResources.BILLING}_${PermissionActions.DELETE}`])
    async deleteBilling(@Request() req, @Param('id', ParseIntPipe) id: number) {
        try {
            const oldBilling = await this.databaseService.getDataById(
                Billing,
                id,
            );
            if (!oldBilling) {
                const message = await this.i18n.translate(
                    'billing.message.error.itemNotExist',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }

            await this.billingService.deleteBilling(id, req.loginUser.id);
            const message = await this.i18n.translate(
                'billing.message.success.delete',
            );

            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldBilling },
                newValue: {},
            });
            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
