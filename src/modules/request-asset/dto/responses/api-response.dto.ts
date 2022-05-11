import {
    ApiResponse,
    CommonListResponse,
} from 'src/common/helpers/api.response';
import { RequestAssetResponseDto } from './request-asset-response.dto';

export class RequestAssetList extends CommonListResponse<RequestAssetResponseDto> {
    items: RequestAssetResponseDto[];
}

export class RequestAssetDetailResult extends ApiResponse<RequestAssetResponseDto> {
    data: RequestAssetResponseDto;
}

export class RequestAssetListResult extends ApiResponse<RequestAssetList> {
    data: RequestAssetList;
}

export class DeleteRequestAssetResponseDto {
    id: number;
}

export class DeleteRequestAssetResult extends ApiResponse<DeleteRequestAssetResponseDto> {
    data: DeleteRequestAssetResponseDto;
}

export class CreateRequestAssetResult extends ApiResponse<RequestAssetResponseDto> {
    data: RequestAssetResponseDto;
}

export class UpdateRequestAssetResult extends ApiResponse<RequestAssetResponseDto> {
    data: RequestAssetResponseDto;
}

export class UpdateRequestAssetStatusResult extends ApiResponse<RequestAssetResponseDto> {
    data: RequestAssetResponseDto;
}
