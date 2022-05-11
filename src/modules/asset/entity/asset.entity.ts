import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Entity, Column, Unique } from 'typeorm';
import { AssetType, UsingStatus } from '../asset.constant';

@Entity({ name: 'asset' })
@Unique(['code'])
export class Asset extends BaseEntity {
    @Column({ length: 255, nullable: false })
    name: string;

    @Column({
        type: 'enum',
        enum: AssetType,
        nullable: true,
    })
    type: AssetType;

    @Column({
        type: 'enum',
        enum: UsingStatus,
        nullable: true,
    })
    usingStatus: UsingStatus;

    @Column({ length: 2000, nullable: true })
    description: string;

    @Column({ nullable: true })
    assigneeId: number;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: false })
    price: string;

    @Column({ nullable: true })
    requestAssetId: number;

    @Column({ type: 'datetime', nullable: false })
    purchaseDate: Date;
}
