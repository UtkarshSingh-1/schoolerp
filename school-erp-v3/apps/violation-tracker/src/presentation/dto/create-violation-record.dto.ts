import { IsNotEmpty, IsEnum, IsUUID, IsString, IsOptional } from 'class-validator';
import { ViolationSeverity } from '../../domain/violation-record.entity';

export class CreateViolationRecordDto {
    @IsUUID()
    @IsNotEmpty()
    studentId: string;

    @IsUUID()
    @IsNotEmpty()
    examAttemptId: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsEnum(ViolationSeverity)
    @IsNotEmpty()
    severity: ViolationSeverity;

    @IsString()
    @IsOptional()
    notes?: string;
}
