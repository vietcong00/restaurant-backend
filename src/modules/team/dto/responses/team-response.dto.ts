import { UserRole } from '../../team.constants';
export class TeamResponseDto {
    id?: number;
    name?: string;
    description?: string;
    members?: TeamMemberResponseDto[];
    totalMembers?: number;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
}

export class TeamMemberResponseDto {
    id?: number;
    teamId?: number;
    userId?: number;
    userRole?: UserRole;
    order?: number;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
}
