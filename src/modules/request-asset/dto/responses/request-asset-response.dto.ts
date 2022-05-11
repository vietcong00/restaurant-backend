import { AssetType, RequestAssetStatus } from '../../request-asset.constant';

export class RequestAssetResponseDto {
    id: number;
    name: string;
    type: AssetType;
    category?: string;
    createdAt: Date;
    createdBy: number;
    requestQuantity: number;
    approveQuantity: number;
    description: string;
    price: string;
    status: RequestAssetStatus;
    createdUser?: string;
}
