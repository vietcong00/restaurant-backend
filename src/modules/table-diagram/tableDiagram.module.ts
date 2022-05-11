import { Global, Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { TableDiagramController } from './tableDiagram.controller';
import { TableDiagramService } from './services/tableDiagram.service';
@Global()
@Module({
    imports: [],
    providers: [TableDiagramService, DatabaseService],
    controllers: [TableDiagramController],
})
export class TableDiagramModule {}
