import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'teams' })
export class Team extends BaseEntity {
    @Column({ length: 255, nullable: false })
    name: string;

    @Column({ length: 2000, nullable: true })
    description: string;
}
