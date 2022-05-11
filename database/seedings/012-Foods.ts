import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
dotenv.config();

export class SeedingFood1720963593403 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const foods = [
            {
                name: 'Beefsteak',
                imgLink: 'menu1.jpg',
                price: '350.000 VNĐ',
                descriptions: 'Double version2',
                idCategory: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
            {
                name: 'Paella',
                imgLink: 'menu2.jpg',
                price: '300.000 VNĐ',
                descriptions: 'Double version2',
                idCategory: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
            {
                name: 'Nem Hải Sản',
                imgLink: 'menu3.jpg',
                price: '150.000 VNĐ',
                descriptions: 'Double version2',
                idCategory: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
            {
                name: 'Phở bò',
                imgLink: 'menu4.jpg',
                price: '100.000 VNĐ',
                descriptions: 'Double version2',
                idCategory: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
        ];
        await queryRunner.manager.getRepository(TABLE_NAME.Foods).insert(foods);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager.getRepository(TABLE_NAME.Foods).delete({});
    }
}
