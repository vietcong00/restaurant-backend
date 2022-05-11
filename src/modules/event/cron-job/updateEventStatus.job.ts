import moment from 'moment';
import { Event } from '../entity/event.entity';
import { TIMEZONE_NAME_DEFAULT } from 'src/common/constants';
import { EventStatus, MODULE_NAME } from 'src/modules/event/event.constant';
import { getManager } from 'typeorm';
import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

dotenv.config();

const CRON_JOB_EVENT_UPDATE_STATUS =
    process.env.CRON_JOB_EVENT_UPDATE_STATUS || '15 18 * * *';

//Change event status from incoming to inprogres if this event is happening
//Change event status from inprogres to expỉed if this event took place
@Injectable()
export class UpdateEventStatusJob {
    constructor(private readonly configService: ConfigService) {
        // eslint-disable-next-line prettier/prettier
    }
    private readonly logger = createWinstonLogger(
        `${MODULE_NAME}-update-status-job`,
        this.configService,
    );
    async expireEvent() {
        try {
            const today = moment().startOfDay().toDate();
            const manager = getManager();
            await manager
                .createQueryBuilder()
                .update(Event)
                .set({ status: EventStatus.EXPIRED })
                .where('endDate < :today', { today })
                .execute();
        } catch (error) {
            this.logger.error('Error in expireEvent func: ', error);
        }
    }
    async updateStatusToInprogress() {
        try {
            const today = moment().startOfDay().toDate();
            const manager = getManager();
            await manager
                .createQueryBuilder()
                .update(Event)
                .set({ status: EventStatus.INPROGRESS })
                .where('startDate <= :today and endDate >= :today', { today })
                .andWhere('status = :status', { status: EventStatus.INCOMING })
                .execute();
        } catch (error) {
            this.logger.error(
                'Error in updateStatusToInprogress func: ',
                error,
            );
        }
    }
    @Cron(CRON_JOB_EVENT_UPDATE_STATUS, {
        timeZone: TIMEZONE_NAME_DEFAULT,
    })
    async handleCronExpireEvent() {
        try {
            this.logger.info('start handleCronExpireEvent at', new Date());
            this.expireEvent();
        } catch (error) {
            this.logger.error('Error in handleCronExpireEvent: ', error);
        }
    }
    @Cron(CRON_JOB_EVENT_UPDATE_STATUS, {
        timeZone: TIMEZONE_NAME_DEFAULT,
    })
    async handleCronUpdateStatusToInprgress() {
        try {
            this.logger.info(
                'start handleCronUpdateStatusToInprgress at',
                new Date(),
            );
            this.updateStatusToInprogress();
        } catch (error) {
            this.logger.error(
                'Error in handleCronUpdateStatusToInprgress: ',
                error,
            );
        }
    }
}
