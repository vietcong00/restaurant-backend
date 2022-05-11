import {
    ApiResponse,
    CommonListResponse,
} from 'src/common/helpers/api.response';
import { TeamMemberResponseDto, TeamResponseDto } from './team-response.dto';

export class TeamList extends CommonListResponse<TeamResponseDto> {
    items: TeamResponseDto[];
    totalItems: number;
}

export class MemberList extends CommonListResponse<TeamMemberResponseDto> {
    items: TeamMemberResponseDto[];
    totalItems: number;
}

export class TeamListResult extends ApiResponse<TeamList> {
    data: TeamList;
}

export class TeamDetailResult extends ApiResponse<TeamResponseDto> {
    data: TeamResponseDto;
}

export class TeamRemoveResponseDto {
    id: number;
}

export class RemoveTeamResult extends ApiResponse<TeamRemoveResponseDto> {
    data: TeamRemoveResponseDto;
}
