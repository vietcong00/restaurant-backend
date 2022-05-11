import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Entity, Column } from 'typeorm';
import { AssetType, RequestAssetStatus } from '../request-asset.constant';

@Entity({ name: 'request_asset' })
export class RequestAsset extends BaseEntity {
    @Column({ length: 255, nullable: false })
    name: string;

    @Column({
        type: 'enum',
        enum: AssetType,
        nullable: true,
    })
    type: AssetType;

    @Column({ length: 2000, nullable: true })
    description: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    requestQuantity: number;

    @Column({ nullable: true })
    approveQuantity: number;

    @Column({ length: 255, nullable: false })
    price: string;

    @Column({
        type: 'enum',
        enum: RequestAssetStatus,
        nullable: true,
    })
    status: RequestAssetStatus;
}
