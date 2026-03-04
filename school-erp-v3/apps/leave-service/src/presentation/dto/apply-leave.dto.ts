import { IsNotEmpty, IsEnum, IsDateString, IsString, IsOptional } from 'class-validator';
import { LeaveType } from '../../domain/leave-request.entity';

export class ApplyLeaveDto {
    @IsEnum(LeaveType)
    @IsNotEmpty()
    type: LeaveType;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsString()
    @IsOptional()
    reason?: string;
}
