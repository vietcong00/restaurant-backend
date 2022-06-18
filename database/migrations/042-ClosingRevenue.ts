import { SHIFT } from './../../src/modules/closing-revenue/closing_revenue.constant';
import { AcceptStatus } from '../../src/modules/export-material-order/export_material_order.constant';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { TABLE_NAME } from '../constant';

export class ClosingRevenue1632891593050 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: TABLE_NAME.ClosingRevenue,
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'shift',
                        type: 'enum',
                        enum: Object.values(SHIFT),
                        isNullable: true,
                    },
                    {
                        name: 'shiftLeaderId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'cashAtBeginningOfShift',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'cashAtEndingOfShift',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'bankingRevenue',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'differenceRevenue',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'note',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'createdBy',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'updatedBy',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'deletedBy',
                        type: 'int',
                        isNullable: true,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(TABLE_NAME.ExportMaterialOrders);
    }
}
