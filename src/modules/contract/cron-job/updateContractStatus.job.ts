import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Contract } from '../entity/contract.entity';
import { TIMEZONE_NAME_DEFAULT } from 'src/common/constants';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { MODULE_NAME, ContractStatus } from '../contract.constant';
import { getManager } from 'typeorm';
import moment from 'moment';
import * as dotenv from 'dotenv';
dotenv.config();

const CRON_JOB_CONTRACT_UPDATE_STATUS =
    process.env.CRON_JOB_CONTRACT_UPDATE_STATUS || '15 18 * * *';

//Change contract status from active to inactive if this contract outdate
@Injectable()
export class UpdateContractStatusJob {
    constructor(private readonly configService: ConfigService) {
        // eslint-disable-next-line prettier/prettier
    }
    private readonly logger = createWinstonLogger(
        `${MODULE_NAME}-update-status-job`,
        this.configService,
    );

    async expireContract() {
        try {
            const today = moment().startOfDay().toDate();
            const manager = getManager();
            await manager
                .createQueryBuilder()
                .update(Contract)
                .set({ status: ContractStatus.EXPIRED })
                .where('endDate < :today AND status = :status', {
                    today,
                    status: ContractStatus.ACTIVE,
                })
                .execute();
        } catch (error) {
            this.logger.error('Error in expireContract func: ', error);
        }
    }

    @Cron(CRON_JOB_CONTRACT_UPDATE_STATUS, {
        timeZone: TIMEZONE_NAME_DEFAULT,
    })
    async handleCron() {
        try {
            this.logger.info('start UpdateContractStatusJob at', new Date());
            this.expireContract();
        } catch (error) {
            this.logger.error('Error in UpdateContractStatusJob: ', error);
        }
    }
}
