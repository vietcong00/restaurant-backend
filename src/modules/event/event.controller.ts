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
import { I18nRequestScopeService } from 'nestjs-i18n';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { DatabaseService } from 'src/common/services/database.service';
import { Event } from './entity/event.entity';
import { EventService } from './service/event.service';
import {
    ErrorResponse,
    SuccessResponse,
} from 'src/common/helpers/api.response';
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
import {
    EventListQueryStringSchema,
    EventQueryStringDto,
} from './dto/request/list-event.dto';
import {
    CreateEventDto,
    CreateEventSchema,
} from './dto/request/create-event.dto';
import {
    UpdateEventDto,
    UpdateEventSchema,
    UpdateEventStatusDto,
    UpdateEventStatusSchema,
} from './dto/request/update-event.dto';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';

@Controller('event')
@UseGuards(JwtGuard, AuthorizationGuard)
export class EventController {
    constructor(
        private readonly eventService: EventService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @Permissions([`${PermissionResources.EVENT}_${PermissionActions.READ}`])
    async getEvents(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(EventListQueryStringSchema),
        )
        query: EventQueryStringDto,
    ) {
        try {
            const eventList = await this.eventService.getEventList(query);
            return new SuccessResponse(eventList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([`${PermissionResources.EVENT}_${PermissionActions.READ}`])
    async getEvent(@Param('id', ParseIntPipe) id: number) {
        try {
            const event = await this.eventService.getEventDetail(id);
            if (!event) {
                const message = await this.i18n.translate(
                    'event.message.eventNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(event);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    @Permissions([`${PermissionResources.EVENT}_${PermissionActions.CREATE}`])
    async createEvent(
        @Request() req,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(CreateEventSchema))
        body: CreateEventDto,
    ) {
        try {
            body.status = this.eventService.getEventStatus(
                body.startDate,
                body.endDate,
            );
            body.createdBy = req.loginUser.id;
            const newEvent = await this.eventService.createEvent(body);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newEvent },
            });
            return new SuccessResponse(newEvent);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([`${PermissionResources.EVENT}_${PermissionActions.UPDATE}`])
    async updateEvent(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(new TrimObjectPipe(), new JoiValidationPipe(UpdateEventSchema))
        body: UpdateEventDto,
    ) {
        try {
            const oldEvent = await this.databaseService.getDataById(Event, id);
            if (!oldEvent) {
                const message = await this.i18n.translate(
                    'event.message.eventNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            body.status = this.eventService.getEventStatus(
                body.startDate,
                body.endDate,
            );
            const event = await this.eventService.updateEvent(id, body);
            const newValue = await this.databaseService.getDataById(Event, id);
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldEvent },
                newValue: { ...newValue },
            });
            return new SuccessResponse(event);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id/status')
    @Permissions([`${PermissionResources.EVENT}_${PermissionActions.UPDATE}`])
    async updateEventStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateEventStatusSchema),
        )
        body: UpdateEventStatusDto,
    ) {
        try {
            const oldEvent = await this.databaseService.getDataById(Event, id);
            if (!oldEvent) {
                const message = await this.i18n.translate(
                    'event.message.eventNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            body.updatedBy = req.loginUser.id;
            const updatedEvent = await this.eventService.updateEventStatus(
                id,
                body,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldEvent },
                newValue: { ...updatedEvent },
            });
            return new SuccessResponse(event);
        } catch (error) {
            throw error;
        }
    }

    @Delete(':id')
    @Permissions([`${PermissionResources.EVENT}_${PermissionActions.DELETE}`])
    async deleteEvent(@Request() req, @Param('id', ParseIntPipe) id: number) {
        try {
            const oldEvent = await this.databaseService.getDataById(Event, id);
            if (!oldEvent) {
                const message = await this.i18n.translate(
                    'event.message.eventNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            await this.eventService.deleteEvent(id, req.loginUser.id);

            const message = await this.i18n.translate(
                'event.message.deleteSuccess',
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldEvent },
                newValue: {},
            });
            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
