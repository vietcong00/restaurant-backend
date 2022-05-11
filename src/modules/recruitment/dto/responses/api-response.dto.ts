import { CommonListResponse } from 'src/common/helpers/api.response';
import { CandidateResponseDto } from './candidate-response.dto';

export class CandidateList extends CommonListResponse<CandidateResponseDto> {
    items: CandidateResponseDto[];
}
