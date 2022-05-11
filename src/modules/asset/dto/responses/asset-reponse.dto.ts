import { CommonListResponse } from 'src/common/helpers/api.response';
import { AssetType, UsingStatus } from '../../asset.constant';

export class AssetResponseDto {
    id: number;
    name: string;
    type: AssetType;
    usingStatus: UsingStatus;
    category?: string;
    createdAt: Date;
    createdBy: number;
    assigneeId: number;
    requestAssetId: number;
    description: string;
    code: string;
    price: string;
    purchaseDate: Date;
    assignee?: {
        id: number;
        fullName: string;
    };
}

export class AssetList extends CommonListResponse<AssetResponseDto> {
    items: AssetResponseDto[];
}
