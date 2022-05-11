import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './services/team.service';
import { DatabaseService } from 'src/common/services/database.service';

@Module({
    controllers: [TeamController],
    providers: [TeamService, DatabaseService],
    exports: [TeamService],
})
export class TeamModule {}
