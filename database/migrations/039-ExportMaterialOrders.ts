import { AcceptStatus } from '../../src/modules/export-material-order/export_material_order.constant';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { TABLE_NAME } from '../constant';

export class ExportMaterialOrder1632891593047 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: TABLE_NAME.ExportMaterialOrders,
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'materialId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'pricePerUnit',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'quantity',
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
                        name: 'exportMaterialId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: Object.values(AcceptStatus),
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
