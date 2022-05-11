import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { UserRole } from 'src/modules/team/team.constants';
import { BaseEntity } from 'src/common/entities/BaseEntity';

@Entity({ name: 'team_member' })
export class TeamMember extends BaseEntity {
    @Column({ nullable: true })
    teamId: number;

    @Column()
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'userId',
    })
    user: User;

    @Column({
        type: 'enum',
        enum: UserRole,
        nullable: true,
    })
    userRole: UserRole;

    @Column({ nullable: true })
    order: number;
}
