import {
    readFileSync,
    rename,
    stat,
    readdirSync,
    unlinkSync,
    statSync,
} from 'fs';
import * as dotenv from 'dotenv';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
    DATE_TIME_FORMAT,
    SECONDS_PER_FIVE_DAYS,
    TIMEZONE_NAME_DEFAULT,
} from 'src/common/constants';
import 'winston-daily-rotate-file';
import moment from 'moment';
import * as child from 'child_process';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { MODULE_NAME } from 'src/modules/recruitment/recruitment.constant';
import { Cron } from '@nestjs/schedule';
import { readFingerDataFile } from '../services/timekeeping.service';

dotenv.config();
const {
    FINGER_SCANNER_DOWNLOAD_PATH,
    CRON_JOB_TIME_KEEPING_READ_FINGER_SCANNER_DATA,
    CRON_JOB_TIME_KEEPING_DOWNLOAD_FINGER_SCANNER_DATA,
} = process.env;

let isRunning = false;

@Injectable()
export class ReadFingerScannerDataJob {
    constructor(private readonly configService: ConfigService) {
        // eslint-disable-next-line prettier/prettier
    }
    private readonly logger = createWinstonLogger(
        `${MODULE_NAME}-read-finger-scanner-job`,
        this.configService,
    );

    async runServiceReadFingerScanner(date: string) {
        if (!isRunning) {
            isRunning = true;
            const timekeepingObject = new WriteRecordToDataBase();
            const index = await this.checkFiles();
            if (index.length > 0) {
                await timekeepingObject.renameFile(date);
                await timekeepingObject.insertDataToDatabase(date);
                isRunning = false;
            }
        } else {
            this.logger.error('Read finger scanner job is processing....');
        }
    }

    async checkFiles() {
        const files = readdirSync(FINGER_SCANNER_DOWNLOAD_PATH);
        const index = [];
        files.forEach((file: string, i: number) => {
            if (file.includes('attlog')) {
                index.push(i);
            } else if (file.includes('timekeeping')) {
                const nameArr = file.split('_');
                const downloadDay = nameArr[1].split('.')[0];
                if (
                    moment(downloadDay).unix() + SECONDS_PER_FIVE_DAYS <
                    moment().unix()
                ) {
                    unlinkSync(`${FINGER_SCANNER_DOWNLOAD_PATH}/${file}`);
                }
            }
            const stats = statSync(file);
            if (
                moment(stats.mtime).unix() + SECONDS_PER_FIVE_DAYS <
                moment().unix()
            ) {
                unlinkSync(`${FINGER_SCANNER_DOWNLOAD_PATH}/${file}`);
            }
        });
        return index;
    }

    async downloadFile() {
        await child.exec(
            'yarn download-file',
            {
                cwd: path.resolve('./'),
            },
            (error) => {
                if (error) {
                    this.logger.error('Cannot download file....');
                } else {
                    this.logger.info('Download file successful....');
                }
            },
        );
    }
    @Cron(CRON_JOB_TIME_KEEPING_READ_FINGER_SCANNER_DATA, {
        timeZone: TIMEZONE_NAME_DEFAULT,
    })
    async handleCronRunServiceReadFingerScanner() {
        try {
            this.logger.info(
                'start handleCronRunServiceReadFingerScanner at',
                new Date(),
            );
            // await this.runServiceReadFingerScanner(moment().format('YYYYMMDD'));
        } catch (error) {
            this.logger.error(
                'Error in handleCronRunServiceReadFingerScanner: ',
                error,
            );
        }
    }
    @Cron(CRON_JOB_TIME_KEEPING_DOWNLOAD_FINGER_SCANNER_DATA, {
        timeZone: TIMEZONE_NAME_DEFAULT,
    })
    async handleCronDownloadFile() {
        try {
            this.logger.info('start handleCronDownloadFile at', new Date());
            // await this.downloadFile();
        } catch (error) {
            this.logger.error('Error in handleCronDownloadFile: ', error);
        }
    }
}

export class WriteRecordToDataBase {
    async renameFile(date: string) {
        if (await checkFileOnSystem) {
            await renameDataFile(date);
        }
    }
    async insertDataToDatabase(date: string) {
        if (await checkFileRenameOnSystem(date)) {
            await this.insertDataToDB(date);
        }
    }
    async insertDataToDB(date: string) {
        try {
            const resultReadFile = await readFileTimekeeping(date);
            readFingerDataFile(resultReadFile);
            isRunning = false;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }
}

function checkFileOnSystem() {
    return new Promise((resolve) => {
        setTimeout(async () => {
            await stat(
                `${FINGER_SCANNER_DOWNLOAD_PATH}/attlog.dat`,
                (err, stats) => {
                    resolve(stats.isFile());
                },
            );
        }, 1500);
    });
}
function checkFileRenameOnSystem(date: string) {
    return new Promise(async (resolve) => {
        setTimeout(async () => {
            await stat(
                `${FINGER_SCANNER_DOWNLOAD_PATH}/timekeeping_${moment(
                    date,
                ).format(DATE_TIME_FORMAT.YYYY_MM_DD)}.dat`,
                (err, stats) => {
                    resolve(stats.isFile());
                },
            );
        }, 1500);
    });
}

async function renameDataFile(date: string) {
    await rename(
        `${FINGER_SCANNER_DOWNLOAD_PATH}/attlog.dat`,
        `${FINGER_SCANNER_DOWNLOAD_PATH}/timekeeping_${moment(date).format(
            DATE_TIME_FORMAT.YYYY_MM_DD,
        )}.dat`,
        (err) => {
            if (err) {
                throw new InternalServerErrorException(err);
            }
        },
    );
}

async function readFileTimekeeping(date: string) {
    const resultReadFile = readFileSync(
        `${FINGER_SCANNER_DOWNLOAD_PATH}/timekeeping_${moment(date).format(
            DATE_TIME_FORMAT.YYYY_MM_DD,
        )}.dat`,
        'utf8',
    );
    return resultReadFile;
}
