import { UserRole } from '../../src/modules/user/user.constant';
import { UserStatus } from '../../src/modules/user/user.constant';
import { In, MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
import { Role } from 'src/modules/role/entity/role.entity';
dotenv.config();
export class SeedingUser1720963593400 implements MigrationInterface {
    tableName = TABLE_NAME.Users;
    needToSeed() {
        const { NEED_SEED_DATA } = process.env;
        return (
            NEED_SEED_DATA && NEED_SEED_DATA.split(',').includes(this.tableName)
        );
    }
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (this.needToSeed()) {
            const role = (await queryRunner.manager
                .getRepository('roles')
                .findOne({ where: { name: UserRole.SUPERVISOR } })) as Role;
            const userDefault = {
                fullName: 'Uyen_quanli',
                email: 'uyen.nguyen.test@gmail.com',
                password: bcrypt.hashSync('ttlab@1234', bcrypt.genSaltSync(10)),
                status: UserStatus.ACTIVE,
                roleId: role.id,
                position: 'CEO',
            };
            const items = [
                {
                    ...userDefault,
                    id: 1,
                    fullName: 'Uyen_thungan',
                    email: 'uyen.tes1@gmail.com',
                },
                {
                    ...userDefault,
                    id: 2,
                    fullName: 'Uyen_quanli',
                    email: 'uyen.nguyen.test@gmail.com',
                    isSuperAdmin: 1,
                },
            ];

            await queryRunner.manager
                .getRepository(this.tableName)
                .insert(items);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (this.needToSeed()) {
            await queryRunner.manager.getRepository(this.tableName).delete({
                email: In(['uyenntt@tokyotechlab.com']),
            });
        }
    }
}
